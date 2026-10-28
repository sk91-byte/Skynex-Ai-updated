import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

async function postJson(path: string, body: unknown, headers: Record<string, string> = {}): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function getJson(path: string, headers: Record<string, string> = {}): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function runAuthenticatedRoleSwitchTests() {
  console.log('===================================================================');
  console.log('SKY NEX AI — AUTHENTICATED ROLE SWITCHING & SECURITY TEST SUITE');
  console.log('===================================================================');

  // Test 1: GET /api/auth/roles returns available canonical roles
  console.log('\n[1/11] Testing GET /api/auth/roles...');
  {
    const { status, data } = await getJson('/api/auth/roles');
    assert.equal(status, 200, `Expected 200 from /api/auth/roles, got ${status}`);
    assert.equal(data.success, true);
    assert.equal(Array.isArray(data.roles), true);
    assert.equal(data.roles.length, 3, 'Expected 3 canonical roles');
    const roleKeys = data.roles.map((r: any) => r.canonicalRole);
    assert.ok(roleKeys.includes('workspace_admin'), 'Missing workspace_admin');
    assert.ok(roleKeys.includes('brand_reviewer'), 'Missing brand_reviewer');
    assert.ok(roleKeys.includes('content_creator'), 'Missing content_creator');
    console.log('  ✓ Successfully retrieved 3 canonical roles: workspace_admin, brand_reviewer, content_creator');
  }

  // Test 2: Missing username or password returns 400
  console.log('\n[2/11] Testing validation: Missing credentials...');
  {
    const missingBoth = await postJson('/api/auth/switch-role', { targetRole: 'workspace_admin' });
    assert.equal(missingBoth.status, 400, `Expected 400 for missing credentials, got ${missingBoth.status}`);

    const missingPass = await postJson('/api/auth/switch-role', { username: 'admin', targetRole: 'workspace_admin' });
    assert.equal(missingPass.status, 400, `Expected 400 for missing password, got ${missingPass.status}`);

    const missingUser = await postJson('/api/auth/switch-role', { password: 'somePassword', targetRole: 'workspace_admin' });
    assert.equal(missingUser.status, 400, `Expected 400 for missing username, got ${missingUser.status}`);
    console.log('  ✓ Properly rejected incomplete authentication payloads with HTTP 400');
  }

  // Test 3: Invalid target role returns 400
  console.log('\n[3/11] Testing validation: Invalid target role...');
  {
    const invalidRole = await postJson('/api/auth/switch-role', {
      username: 'admin',
      password: 'Admin@Bharat2026!',
      targetRole: 'super_hacker_role'
    });
    assert.equal(invalidRole.status, 400, `Expected 400 for invalid target role, got ${invalidRole.status}`);
    console.log('  ✓ Rejected invalid target role specification with HTTP 400');
  }

  // Test 4: Invalid username returns 401 with generic error (no user enumeration)
  console.log('\n[4/11] Testing invalid username rejection and anti-enumeration...');
  {
    const invalidUser = await postJson('/api/auth/switch-role', {
      username: 'non_existent_user_99999',
      password: 'SomeRandomPassword123!',
      targetRole: 'workspace_admin'
    });
    assert.equal(invalidUser.status, 401, `Expected 401 for unknown user, got ${invalidUser.status}`);
    assert.ok(invalidUser.data.error, 'Expected error message');
    assert.equal(invalidUser.data.error, 'Unable to verify your credentials or requested access.');
    console.log('  ✓ Returned generic 401 preventing username enumeration attacks');
  }

  // Test 5: Valid username with wrong password returns 401 with generic error
  console.log('\n[5/11] Testing wrong password rejection...');
  {
    const wrongPwd = await postJson('/api/auth/switch-role', {
      username: 'admin',
      password: 'IncorrectPassword2026!',
      targetRole: 'workspace_admin'
    });
    assert.equal(wrongPwd.status, 401, `Expected 401 for wrong password, got ${wrongPwd.status}`);
    assert.equal(wrongPwd.data.error, 'Unable to verify your credentials or requested access.');
    console.log('  ✓ Returned generic 401 for incorrect password');
  }

  // Test 6: Privilege escalation attempt — Content Creator credentials CANNOT switch to Workspace Admin
  console.log('\n[6/11] Testing privilege escalation prevention (Creator -> Admin)...');
  {
    const escalationAttempt = await postJson('/api/auth/switch-role', {
      username: 'creator',
      password: 'Creator@Delhi2026!',
      targetRole: 'workspace_admin'
    });
    // Server rejects with 403 or 401 because account is not authorized for workspace_admin
    assert.ok(
      escalationAttempt.status === 403 || escalationAttempt.status === 401,
      `Expected 403 or 401 for unauthorized role switch, got ${escalationAttempt.status}`
    );
    assert.equal(escalationAttempt.data.error, 'Unable to verify your credentials or requested access.');
    console.log('  ✓ Privilege escalation blocked: Creator credentials cannot switch to Workspace Admin');
  }

  // Test 7: Successful authentication and switch to Workspace Admin
  console.log('\n[7/11] Testing successful switch to Workspace Admin with valid credentials...');
  {
    const successAdmin = await postJson('/api/auth/switch-role', {
      username: 'admin',
      password: 'Admin@Bharat2026!',
      targetRole: 'workspace_admin'
    });
    assert.equal(successAdmin.status, 200, `Expected 200 for valid admin login, got ${successAdmin.status}`);
    assert.equal(successAdmin.data.success, true);
    assert.equal(successAdmin.data.user.canonicalRole, 'workspace_admin');
    assert.equal(successAdmin.data.user.id, 'usr-admin-01');
    assert.equal(successAdmin.data.user.name, 'Aditi Sharma');
    console.log('  ✓ Authenticated as Aditi Sharma (Workspace Admin)');
  }

  // Test 8: Response sanitization: passwordHash and plaintext passwords NEVER leaked
  console.log('\n[8/11] Testing credential confidentiality (no passwordHash or secrets leaked)...');
  {
    const res = await postJson('/api/auth/switch-role', {
      username: 'admin',
      password: 'Admin@Bharat2026!',
      targetRole: 'workspace_admin'
    });
    const stringified = JSON.stringify(res.data);
    assert.equal(res.data.user.passwordHash, undefined, 'passwordHash must not be exposed');
    assert.equal(res.data.user.password, undefined, 'plaintext password must not be exposed');
    assert.equal(res.data.user.demoPassword, undefined, 'demoPassword must not be exposed');
    assert.ok(!stringified.includes('$2a$') && !stringified.includes('$2b$'), 'Bcrypt hash leaked in JSON response!');
    assert.ok(!stringified.includes('Admin@Bharat2026!'), 'Plaintext password leaked in JSON response!');
    console.log('  ✓ Zero password or hash leakage verified in API response');
  }

  // Test 9: Successful authentication and switch to Brand Reviewer
  console.log('\n[9/11] Testing successful switch to Brand Reviewer with valid credentials...');
  {
    const successReviewer = await postJson('/api/auth/switch-role', {
      username: 'reviewer',
      password: 'Reviewer@Mumbai2026!',
      targetRole: 'brand_reviewer'
    });
    assert.equal(successReviewer.status, 200, `Expected 200 for valid reviewer login, got ${successReviewer.status}`);
    assert.equal(successReviewer.data.success, true);
    assert.equal(successReviewer.data.user.canonicalRole, 'brand_reviewer');
    assert.equal(successReviewer.data.user.id, 'usr-reviewer-02');
    assert.equal(successReviewer.data.user.name, 'Rohan Verma');
    console.log('  ✓ Authenticated as Rohan Verma (Reviewer & Manager)');
  }

  // Test 10: Successful authentication and switch to Content Creator
  console.log('\n[10/11] Testing successful switch to Content Creator with valid credentials...');
  {
    const successCreator = await postJson('/api/auth/switch-role', {
      username: 'creator',
      password: 'Creator@Delhi2026!',
      targetRole: 'content_creator'
    });
    assert.equal(successCreator.status, 200, `Expected 200 for valid creator login, got ${successCreator.status}`);
    assert.equal(successCreator.data.success, true);
    assert.equal(successCreator.data.user.canonicalRole, 'content_creator');
    assert.equal(successCreator.data.user.id, 'usr-creator-03');
    assert.equal(successCreator.data.user.name, 'Ananya Iyer');
    console.log('  ✓ Authenticated as Ananya Iyer (Content Creator)');
  }

  // Test 11: Audit logging records both success and denied authorization events
  console.log('\n[11/11] Testing security audit event logging...');
  {
    // Authenticate back to admin to view security audit events
    await postJson('/api/auth/switch-role', {
      username: 'admin',
      password: 'Admin@Bharat2026!',
      targetRole: 'workspace_admin'
    });

    const auditRes = await getJson('/api/security/audit-events', {
      'x-user-id': 'usr-admin-01',
      'x-skynex-role': 'workspace_admin'
    });
    assert.equal(auditRes.status, 200, 'Admin can view audit events');
    assert.ok(Array.isArray(auditRes.data.events), 'Events should be an array');
    
    // Check that both ROLE_SWITCH and AUTHORIZATION_DENIED events exist
    const hasRoleSwitch = auditRes.data.events.some((e: any) => e.eventType === 'ROLE_SWITCH');
    const hasAuthDenied = auditRes.data.events.some((e: any) => e.eventType === 'AUTHORIZATION_DENIED');
    assert.ok(hasRoleSwitch, 'Expected ROLE_SWITCH audit event');
    assert.ok(hasAuthDenied, 'Expected AUTHORIZATION_DENIED audit event');
    console.log(`  ✓ Verified ${auditRes.data.events.length} security audit events including role transitions and authorization denials`);
  }

  console.log('\n===================================================================');
  console.log('ALL 11 AUTHENTICATED ROLE SWITCHING TESTS PASSED PERFECTLY!');
  console.log('===================================================================\n');
}

runAuthenticatedRoleSwitchTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
