import assert from 'node:assert/strict';
import {
  USER_PROFILES,
  ROLE_PERMISSION_MATRIX,
  resolveCanonicalUserProfile,
  hasPermission
} from '../src/data/userProfiles.ts';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

type RoleHeaders = Record<string, string>;

const ADMIN_HEADERS: RoleHeaders = {
  'Content-Type': 'application/json',
  'x-user-id': 'usr-admin-01',
  'x-user-role': 'brand_manager',
  'x-skynex-role': 'workspace_admin',
  'x-workspace-id': 'ws-enterprise-01'
};

const REVIEWER_HEADERS: RoleHeaders = {
  'Content-Type': 'application/json',
  'x-user-id': 'usr-reviewer-02',
  'x-user-role': 'legal_counsel',
  'x-skynex-role': 'brand_reviewer',
  'x-workspace-id': 'ws-enterprise-01'
};

const CREATOR_HEADERS: RoleHeaders = {
  'Content-Type': 'application/json',
  'x-user-id': 'usr-creator-03',
  'x-user-role': 'creator',
  'x-skynex-role': 'content_creator',
  'x-workspace-id': 'ws-enterprise-01'
};

async function apiRequest(
  path: string,
  method: string = 'GET',
  headers: RoleHeaders = ADMIN_HEADERS,
  body?: unknown
): Promise<{ status: number; data: any }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  const text = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, data };
}

async function runRbacAuthorizationTests() {
  console.log('===================================================================');
  console.log('SKY NEX AI — SERVER-ENFORCED RBAC & SECURITY AUTHORIZATION SUITE');
  console.log('===================================================================\n');

  // Reset demo data as Workspace Admin first to guarantee clean baseline state
  const resetRes = await apiRequest('/api/demo/reset', 'POST', ADMIN_HEADERS);
  assert.equal(resetRes.status, 200, 'Admin reset demo state should succeed');

  // ---------------------------------------------------------------------------
  // 1. Canonical Role-Permission Matrix Unit Verification
  // ---------------------------------------------------------------------------
  console.log('1. Verifying Canonical Role-Permission Matrix definitions...');
  const adminProfile = resolveCanonicalUserProfile({ userId: 'usr-admin-01' });
  const reviewerProfile = resolveCanonicalUserProfile({ userId: 'usr-reviewer-02' });
  const creatorProfile = resolveCanonicalUserProfile({ userId: 'usr-creator-03' });

  assert.ok(adminProfile && reviewerProfile && creatorProfile, 'All 3 canonical roles must resolve');
  assert.equal(adminProfile.canonicalRole, 'workspace_admin');
  assert.equal(reviewerProfile.canonicalRole, 'brand_reviewer');
  assert.equal(creatorProfile.canonicalRole, 'content_creator');

  // Workspace Admin checks
  assert.equal(hasPermission(adminProfile, 'canCreateRules'), true);
  assert.equal(hasPermission(adminProfile, 'canApproveRules'), true);
  assert.equal(hasPermission(adminProfile, 'canEditProducts'), true);
  assert.equal(hasPermission(adminProfile, 'canFinalizeReview'), true);
  assert.equal(hasPermission(adminProfile, 'canViewInsights'), true);
  assert.equal(hasPermission(adminProfile, 'canConfigureRecurrence'), true);
  assert.equal(hasPermission(adminProfile, 'canViewSecurityAuditLog'), true);

  // Brand Reviewer checks (Combined Reviewer & Manager Insights role, but NO Rule/Catalog/Brand admin)
  assert.equal(hasPermission(reviewerProfile, 'canManageRules'), false);
  assert.equal(hasPermission(reviewerProfile, 'canCreateRules'), false);
  assert.equal(hasPermission(reviewerProfile, 'canEditRules'), false);
  assert.equal(hasPermission(reviewerProfile, 'canApproveRules'), false);
  assert.equal(hasPermission(reviewerProfile, 'canDeprecateRules'), false);
  assert.equal(hasPermission(reviewerProfile, 'canDeleteRules'), false);
  assert.equal(hasPermission(reviewerProfile, 'canImportGuidelines'), false);
  assert.equal(hasPermission(reviewerProfile, 'canEditProducts'), false);
  assert.equal(hasPermission(reviewerProfile, 'canManageBrands'), false);
  assert.equal(hasPermission(reviewerProfile, 'canConfigureRecurrence'), false);
  assert.equal(hasPermission(reviewerProfile, 'canFinalizeReview'), true);
  assert.equal(hasPermission(reviewerProfile, 'canApproveWaiver'), true);
  assert.equal(hasPermission(reviewerProfile, 'canViewInsights'), true);
  assert.equal(hasPermission(reviewerProfile, 'canInvestigateRecurrence'), true);

  // Content Creator checks
  assert.equal(hasPermission(creatorProfile, 'canSubmitContent'), true);
  assert.equal(hasPermission(creatorProfile, 'canAcceptFindingFix'), true);
  assert.equal(hasPermission(creatorProfile, 'canEditFindingFix'), true);
  assert.equal(hasPermission(creatorProfile, 'canRejectFindingFix'), true);
  assert.equal(hasPermission(creatorProfile, 'canEscalateFinding'), true);
  assert.equal(hasPermission(creatorProfile, 'canFinalizeReview'), false);
  assert.equal(hasPermission(creatorProfile, 'canApproveWaiver'), false);
  assert.equal(hasPermission(creatorProfile, 'canDismissConfirmedViolation'), false);
  assert.equal(hasPermission(creatorProfile, 'canViewInsights'), false);
  assert.equal(hasPermission(creatorProfile, 'canInvestigateRecurrence'), false);
  assert.equal(hasPermission(creatorProfile, 'canManageRules'), false);
  assert.equal(hasPermission(creatorProfile, 'canEditProducts'), false);
  console.log('   ✓ Canonical Role-Permission Matrix verified across all 3 roles.\n');

  // ---------------------------------------------------------------------------
  // 2. Negative Security Tests: Missing Auth, Invalid Role, Escalation, Scope
  // ---------------------------------------------------------------------------
  console.log('2. Running Negative Security & Anti-Escalation Tests...');

  // 2a. Missing authentication when strict auth is enforced
  const unauthRes = await apiRequest(
    '/api/brands/novapay/rules',
    'POST',
    { 'Content-Type': 'application/json', 'x-require-auth': 'true' },
    { title: 'Unauth Rule', approvedValue: 'NovaPay' }
  );
  assert.equal(unauthRes.status, 401, 'Missing auth header with x-require-auth should return 401');
  assert.equal(unauthRes.data.code, 'AUTHENTICATION_REQUIRED');

  // 2b. Invalid / forged role header
  const invalidRoleRes = await apiRequest(
    '/api/brands/novapay/rules',
    'POST',
    {
      'Content-Type': 'application/json',
      'x-user-id': 'usr-unknown-999',
      'x-skynex-role': 'root_super_hacker'
    },
    { title: 'Hacker Rule', approvedValue: 'NovaPay' }
  );
  assert.equal(invalidRoleRes.status, 401, 'Forged unknown role header should return 401 INVALID_ROLE');

  // 2c. Client-side role escalation attempt (Creator user ID sending Admin role header & body fields)
  const escalationHeaders: RoleHeaders = {
    'Content-Type': 'application/json',
    'x-user-id': 'usr-creator-03', // Canonical Content Creator ID
    'x-user-role': 'brand_manager', // Spoofed Admin header
    'x-skynex-role': 'workspace_admin' // Spoofed Admin canonical header
  };
  const escalationRes = await apiRequest(
    '/api/brands/novapay/rules',
    'POST',
    escalationHeaders,
    {
      title: 'Escalated Rule Attempt',
      category: 'Terminology',
      ruleStatement: 'Creator trying to escalate privileges via headers and body',
      approvedValue: 'NovaPay',
      actorRole: 'Workspace Admin',
      isAdmin: true
    }
  );
  assert.equal(
    escalationRes.status,
    403,
    'Server must resolve permissions from canonical user ID (usr-creator-03) and reject spoofed admin headers with 403'
  );

  // 2d. Cross-workspace scope violation
  const wrongWorkspaceRes = await apiRequest(
    '/api/brands/novapay/rules',
    'POST',
    {
      ...ADMIN_HEADERS,
      'x-workspace-id': 'ws-rogue-tenant-999'
    },
    {
      title: 'Cross Workspace Rule',
      category: 'Terminology',
      ruleStatement: 'Should be blocked by workspace scope check',
      approvedValue: 'NovaPay'
    }
  );
  assert.equal(wrongWorkspaceRes.status, 403, 'Cross-workspace request must be rejected with 403');
  assert.equal(wrongWorkspaceRes.data.code, 'WORKSPACE_SCOPE_FORBIDDEN');
  console.log('   ✓ Missing auth, invalid role, privilege escalation, and cross-workspace scope blocked.\n');

  // ---------------------------------------------------------------------------
  // 3. Session & Role Switching Endpoint Verification
  // ---------------------------------------------------------------------------
  console.log('3. Verifying Server Session & Role Switching API...');
  const switchCreatorRes = await apiRequest('/api/session/switch-role', 'POST', CREATOR_HEADERS, {
    userId: 'usr-creator-03'
  });
  assert.equal(switchCreatorRes.status, 200);
  assert.equal(switchCreatorRes.data.user.canonicalRole, 'content_creator');

  const badSwitchRes = await apiRequest('/api/session/switch-role', 'POST', CREATOR_HEADERS, {
    userId: 'non-existent-user',
    role: 'fake_role'
  });
  assert.equal(badSwitchRes.status, 400);
  assert.equal(badSwitchRes.data.code, 'INVALID_ROLE_SWITCH');

  // Switch back to Workspace Admin
  const switchAdminRes = await apiRequest('/api/session/switch-role', 'POST', ADMIN_HEADERS, {
    userId: 'usr-admin-01'
  });
  assert.equal(switchAdminRes.status, 200);
  assert.equal(switchAdminRes.data.user.canonicalRole, 'workspace_admin');
  console.log('   ✓ Server session role switching verified.\n');

  // ---------------------------------------------------------------------------
  // 4. Brand Knowledge Rule Management & PDF Import RBAC Enforcement
  // ---------------------------------------------------------------------------
  console.log('4. Verifying Brand Knowledge Rule Management & PDF Import RBAC...');

  const sampleRulePayload = {
    title: 'RBAC Test Brand Nomenclature Rule',
    category: 'Terminology',
    ruleStatement: 'Always write NovaPay as a single compound word.',
    targetPatterns: ['Nova Pay', 'Nova-Pay'],
    approvedValue: 'NovaPay',
    sourceDocumentName: 'NovaPay Brand Standards 2026',
    sourcePage: 'Page 2',
    sourceSection: '§1.1',
    sourceRef: 'NovaPay Brand Standards 2026 · Page 2 · §1.1',
    status: 'Approved',
    severity: 'critical'
  };

  // 4a. Content Creator blocked from creating rules
  const creatorCreateRule = await apiRequest(
    '/api/brands/novapay/rules',
    'POST',
    CREATOR_HEADERS,
    sampleRulePayload
  );
  assert.equal(creatorCreateRule.status, 403, 'Content Creator must be blocked (403) from creating brand rules');

  // 4b. Brand Reviewer blocked from creating rules
  const reviewerCreateRule = await apiRequest(
    '/api/brands/novapay/rules',
    'POST',
    REVIEWER_HEADERS,
    sampleRulePayload
  );
  assert.equal(reviewerCreateRule.status, 403, 'Brand Reviewer must be blocked (403) from creating brand rules');

  // 4c. Workspace Admin succeeds in creating a rule
  const adminCreateRule = await apiRequest(
    '/api/brands/novapay/rules',
    'POST',
    ADMIN_HEADERS,
    sampleRulePayload
  );
  assert.equal(adminCreateRule.status, 201, 'Workspace Admin must be allowed (201) to create brand rules');
  const createdRuleId = adminCreateRule.data.rule.id;
  assert.ok(createdRuleId, 'Created rule ID should be returned');
  assert.equal(adminCreateRule.data.rule.updatedBy, 'Aditi Sharma');
  assert.equal(adminCreateRule.data.rule.updatedByRole, 'Workspace Admin');

  // 4d. Brand Reviewer and Content Creator blocked from editing/approving/deprecating rules
  const reviewerEditRule = await apiRequest(
    `/api/brands/novapay/rules/${createdRuleId}`,
    'PUT',
    REVIEWER_HEADERS,
    { status: 'Draft', title: 'Reviewer Unauthorized Edit' }
  );
  assert.equal(reviewerEditRule.status, 403, 'Brand Reviewer must be blocked (403) from editing/deprecating rules');

  const creatorEditRule = await apiRequest(
    `/api/brands/novapay/rules/${createdRuleId}`,
    'PUT',
    CREATOR_HEADERS,
    { status: 'Approved' }
  );
  assert.equal(creatorEditRule.status, 403, 'Content Creator must be blocked (403) from approving rules');

  // 4e. Brand Reviewer and Content Creator blocked from PDF rule extraction & batch rule import
  const reviewerPdfImport = await apiRequest(
    '/api/brands/novapay/rules/batch',
    'POST',
    REVIEWER_HEADERS,
    { rules: [sampleRulePayload] }
  );
  assert.equal(reviewerPdfImport.status, 403, 'Brand Reviewer must be blocked (403) from batch importing PDF rules');

  const creatorPdfExtract = await apiRequest(
    '/api/extract-rules-from-pdf',
    'POST',
    CREATOR_HEADERS,
    { filename: 'test.pdf', base64Pdf: 'JVBERi0xLjQK', brandId: 'novapay' }
  );
  assert.equal(creatorPdfExtract.status, 403, 'Content Creator must be blocked (403) from PDF guideline extraction');

  // 4f. Brand Reviewer and Content Creator blocked from deleting rules
  const reviewerDeleteRule = await apiRequest(
    `/api/brands/novapay/rules/${createdRuleId}`,
    'DELETE',
    REVIEWER_HEADERS
  );
  assert.equal(reviewerDeleteRule.status, 403, 'Brand Reviewer must be blocked (403) from deleting rules');

  // Workspace Admin can update and delete the test rule
  const adminUpdateRule = await apiRequest(
    `/api/brands/novapay/rules/${createdRuleId}`,
    'PUT',
    ADMIN_HEADERS,
    { status: 'Draft' }
  );
  assert.equal(adminUpdateRule.status, 200, 'Workspace Admin can update rule status');

  const adminDeleteRule = await apiRequest(
    `/api/brands/novapay/rules/${createdRuleId}`,
    'DELETE',
    ADMIN_HEADERS
  );
  assert.equal(adminDeleteRule.status, 200, 'Workspace Admin can delete rule');
  console.log('   ✓ Brand Knowledge rule creation, approval, PDF import, and deletion strictly enforced.\n');

  // ---------------------------------------------------------------------------
  // 5. Product Catalog & Pricing Fact Governance RBAC Enforcement
  // ---------------------------------------------------------------------------
  console.log('5. Verifying Product Catalog & Pricing Fact RBAC...');

  // All 3 roles can view authorized brand products
  const creatorViewProducts = await apiRequest('/api/brands/novapay/products', 'GET', CREATOR_HEADERS);
  assert.equal(creatorViewProducts.status, 200, 'Content Creator can view product catalog');
  assert.ok(Array.isArray(creatorViewProducts.data.products) && creatorViewProducts.data.products.length > 0);
  const existingProductId = creatorViewProducts.data.products[0].id;

  // Brand Reviewer and Content Creator blocked from adding, editing, or deleting products/prices
  const reviewerAddProduct = await apiRequest(
    '/api/brands/novapay/products',
    'POST',
    REVIEWER_HEADERS,
    { name: 'Unauthorized Reviewer Product', price: '₹199', sku: 'NP-UNAUTH-01' }
  );
  assert.equal(reviewerAddProduct.status, 403, 'Brand Reviewer must be blocked (403) from creating catalog products');

  const reviewerEditPrice = await apiRequest(
    `/api/brands/novapay/products/${existingProductId}`,
    'PUT',
    REVIEWER_HEADERS,
    { price: '₹1', priceVerified: true }
  );
  assert.equal(reviewerEditPrice.status, 403, 'Brand Reviewer must be blocked (403) from modifying product prices');

  const creatorEditPrice = await apiRequest(
    `/api/brands/novapay/products/${existingProductId}`,
    'PUT',
    CREATOR_HEADERS,
    { price: '₹1', priceVerified: true }
  );
  assert.equal(creatorEditPrice.status, 403, 'Content Creator must be blocked (403) from modifying product prices');

  const creatorDeleteProduct = await apiRequest(
    `/api/brands/novapay/products/${existingProductId}`,
    'DELETE',
    CREATOR_HEADERS
  );
  assert.equal(creatorDeleteProduct.status, 403, 'Content Creator must be blocked (403) from deleting products');

  // Workspace Admin can create and delete a catalog product
  const adminAddProduct = await apiRequest(
    '/api/brands/novapay/products',
    'POST',
    ADMIN_HEADERS,
    {
      name: 'NovaPay Enterprise Card Reader',
      category: 'Hardware & Terminals',
      sku: 'NP-CR-900',
      price: '₹3,499',
      priceVerified: true,
      status: 'Active',
      sourceRef: 'NovaPay Hardware Catalog 2026 · §4.1'
    }
  );
  assert.equal(adminAddProduct.status, 201, 'Workspace Admin can create catalog product');
  const newProdId = adminAddProduct.data.product.id;

  const adminDeleteProduct = await apiRequest(
    `/api/brands/novapay/products/${newProdId}`,
    'DELETE',
    ADMIN_HEADERS
  );
  assert.equal(adminDeleteProduct.status, 200, 'Workspace Admin can delete catalog product');
  console.log('   ✓ Product catalog & pricing governance strictly enforced.\n');

  // ---------------------------------------------------------------------------
  // 6. Content Review, Server Actor Attribution, Finding Decisions, & Finalization
  // ---------------------------------------------------------------------------
  console.log('6. Verifying Content Review, Server Attribution, Decisions, & Final Approval...');

  // Content Creator submits a draft while attempting to forge `submittedBy` in request body
  const creatorAuditRes = await apiRequest('/api/audit', 'POST', CREATOR_HEADERS, {
    brandId: 'novapay',
    title: 'Creator Promotional Draft',
    contentType: 'Advertisement',
    text: 'Nova Pay guarantees risk-free profits. Subscribe today for just ₹499/month!',
    enableGemini: false,
    submittedBy: 'Forged Admin Name',
    submittedByRole: 'Workspace Admin'
  });
  assert.equal(creatorAuditRes.status, 200, 'Content Creator can submit draft for audit');
  const report = creatorAuditRes.data;
  assert.ok(
    report.submittedBy === 'Elena Rostova' || report.submittedBy === 'Ananya Iyer',
    'Server must overwrite forged client submittedBy with authenticated server identity (Ananya Iyer / Elena Rostova)'
  );
  assert.equal(
    report.submittedByRole,
    'Content Creator',
    'Server must overwrite forged client submittedByRole with Content Creator'
  );
  assert.equal(report.submittedById, 'usr-creator-03');
  assert.ok(report.findings.length >= 3, 'Canonical draft should produce deterministic findings');

  const firstFinding = report.findings[0];
  const secondFinding = report.findings[1];

  // 6a. Content Creator can accept a suggested fix on their draft
  const creatorAcceptRes = await apiRequest(
    `/api/history/${report.id}/decision`,
    'POST',
    CREATOR_HEADERS,
    {
      findingId: firstFinding.id,
      decision: 'accepted',
      actorName: 'Spoofed Name',
      actorRole: 'Workspace Admin'
    }
  );
  assert.equal(creatorAcceptRes.status, 200, 'Content Creator can accept suggested fix on their draft');
  const updatedFinding1 = creatorAcceptRes.data.report.findings.find((f: any) => f.id === firstFinding.id);
  assert.ok(
    updatedFinding1.decisionBy === 'Elena Rostova' || updatedFinding1.decisionBy === 'Ananya Iyer',
    'Server must record true actorName (Ananya Iyer / Elena Rostova)'
  );
  assert.equal(updatedFinding1.decisionRole, 'Content Creator', 'Server must record true actorRole (Content Creator)');

  // 6b. Content Creator blocked from dismissing a deterministic confirmed violation as 'not_a_violation'
  const creatorDismissConfirmed = await apiRequest(
    `/api/history/${report.id}/decision`,
    'POST',
    CREATOR_HEADERS,
    {
      findingId: secondFinding.id,
      decision: 'rejected',
      rejectionCategory: 'not_a_violation',
      rejectionReason: 'Trying to override confirmed violation as creator'
    }
  );
  assert.equal(
    creatorDismissConfirmed.status,
    403,
    'Content Creator must be blocked (403) from dismissing a confirmed deterministic violation as not_a_violation'
  );

  // 6c. Content Creator blocked from waiving a finding
  const creatorWaiveRes = await apiRequest(
    `/api/history/${report.id}/decision`,
    'POST',
    CREATOR_HEADERS,
    {
      findingId: secondFinding.id,
      decision: 'waived',
      rejectionReason: 'Creator attempting self-waiver'
    }
  );
  assert.equal(creatorWaiveRes.status, 403, 'Content Creator must be blocked (403) from approving compliance waivers');

  // 6d. Content Creator blocked from finalizing / approving content for publication
  const creatorFinalizeRes = await apiRequest(
    `/api/history/${report.id}/approval`,
    'POST',
    CREATOR_HEADERS,
    {
      contentApprovalStatus: 'approved_for_publication'
    }
  );
  assert.equal(
    creatorFinalizeRes.status,
    403,
    'Content Creator must be blocked (403) from finalizing content publication approval'
  );

  // 6e. Data-integrity gate: Brand Reviewer cannot approve for publication while unresolved findings remain
  const reviewerPrematureApprove = await apiRequest(
    `/api/history/${report.id}/approval`,
    'POST',
    REVIEWER_HEADERS,
    {
      contentApprovalStatus: 'approved_for_publication'
    }
  );
  assert.equal(
    reviewerPrematureApprove.status,
    400,
    'Even Brand Reviewer must be blocked (400) from approving publication while unresolved findings remain'
  );
  assert.equal(reviewerPrematureApprove.data.code, 'APPROVAL_BLOCKED_UNRESOLVED_FINDINGS');

  // 6f. Brand Reviewer resolves remaining findings and finalizes publication approval
  for (const f of creatorAcceptRes.data.report.findings) {
    if (f.decision === 'pending') {
      const decRes = await apiRequest(`/api/history/${report.id}/decision`, 'POST', REVIEWER_HEADERS, {
        findingId: f.id,
        decision: 'accepted'
      });
      assert.equal(decRes.status, 200, `Brand Reviewer should resolve finding ${f.id}`);
    }
  }

  const reviewerFinalizeRes = await apiRequest(
    `/api/history/${report.id}/approval`,
    'POST',
    REVIEWER_HEADERS,
    {
      contentApprovalStatus: 'approved_for_publication',
      contentApprovalNotes: 'All mandatory brand rules verified and remediated.'
    }
  );
  assert.ok(
    reviewerFinalizeRes.data.report.contentApprovedBy === 'Marcus Vance' ||
      reviewerFinalizeRes.data.report.contentApprovedBy === 'Rohan Verma',
    'Server must record true reviewer name (Rohan Verma / Marcus Vance)'
  );
  assert.equal(reviewerFinalizeRes.data.report.contentApprovedByRole, 'Reviewer & Manager');
  console.log('   ✓ Review Content decisions, attribution integrity, and publication gates verified.\n');

  // ---------------------------------------------------------------------------
  // 7. Review History Scope & Private Draft Isolation
  // ---------------------------------------------------------------------------
  console.log('7. Verifying Review History Scope & Private Draft Isolation...');

  // Admin creates a private draft
  const adminPrivateDraftRes = await apiRequest('/api/audit', 'POST', ADMIN_HEADERS, {
    brandId: 'novapay',
    title: 'Confidential Executive Draft',
    contentType: 'Press Release',
    text: 'NovaPay provides enterprise payment infrastructure at ₹999/month.',
    enableGemini: false,
    visibilityScope: 'private_draft'
  });
  assert.equal(adminPrivateDraftRes.status, 200);
  const privateDraftId = adminPrivateDraftRes.data.id;

  // Content Creator queries history — should NOT see Admin's private draft
  const creatorHistoryRes = await apiRequest('/api/history', 'GET', CREATOR_HEADERS);
  assert.equal(creatorHistoryRes.status, 200);
  const creatorSeesAdminPrivate = creatorHistoryRes.data.auditHistory.some(
    (r: any) => r.id === privateDraftId
  );
  assert.equal(
    creatorSeesAdminPrivate,
    false,
    'Content Creator must not see private drafts submitted by another user'
  );

  // Brand Reviewer queries history — CAN see all workspace reports
  const reviewerHistoryRes = await apiRequest('/api/history', 'GET', REVIEWER_HEADERS);
  assert.equal(reviewerHistoryRes.status, 200);
  const reviewerSeesAdminPrivate = reviewerHistoryRes.data.auditHistory.some(
    (r: any) => r.id === privateDraftId
  );
  assert.equal(reviewerSeesAdminPrivate, true, 'Brand Reviewer can inspect all workspace reports');
  console.log('   ✓ Review History scope & private draft isolation verified.\n');

  // ---------------------------------------------------------------------------
  // 8. Manager Insights, Recurrence Investigations, & Security Audit Log
  // ---------------------------------------------------------------------------
  console.log('8. Verifying Manager Insights, Recurrence Loop, & Security Audit Log...');

  // 8a. Content Creator blocked from GET /api/insights, POST /api/clarity-loop/action, POST /api/clarity-loop/config
  const creatorInsightsRes = await apiRequest('/api/insights', 'GET', CREATOR_HEADERS);
  assert.equal(creatorInsightsRes.status, 403, 'Content Creator must be blocked (403) from GET /api/insights');

  const creatorStateRes = await apiRequest('/api/state', 'GET', CREATOR_HEADERS);
  assert.equal(creatorStateRes.status, 200);
  assert.equal(creatorStateRes.data.insightsRestricted, true, 'State response for Creator marks insightsRestricted');
  assert.equal(
    creatorStateRes.data.recurringPatterns.length,
    0,
    'State response for Content Creator must strip recurringPatterns'
  );

  // 8b. Brand Reviewer can view GET /api/insights and log recurrence investigations, but CANNOT change threshold config
  const reviewerInsightsRes = await apiRequest('/api/insights', 'GET', REVIEWER_HEADERS);
  assert.equal(reviewerInsightsRes.status, 200, 'Brand Reviewer can access GET /api/insights');
  assert.ok(Array.isArray(reviewerInsightsRes.data.recurringPatterns));

  if (reviewerInsightsRes.data.recurringPatterns.length > 0) {
    const patternId = reviewerInsightsRes.data.recurringPatterns[0].id;

    // Content Creator blocked from logging investigation
    const creatorInvestigate = await apiRequest('/api/clarity-loop/action', 'POST', CREATOR_HEADERS, {
      patternId,
      rootCause: 'unclear_guidelines',
      rootCauseNotes: 'Creator trying to log investigation',
      correctiveActionTaken: 'None'
    });
    assert.equal(creatorInvestigate.status, 403, 'Content Creator blocked from logging recurrence investigation');

    // Brand Reviewer allowed to log investigation
    const reviewerInvestigate = await apiRequest('/api/clarity-loop/action', 'POST', REVIEWER_HEADERS, {
      patternId,
      rootCause: 'unclear_guidelines',
      rootCauseNotes: 'Agency writers confused spacing in NovaPay wordmark.',
      correctiveActionTaken: 'Added compound wordmark callout to creative brief.'
    });
    assert.equal(reviewerInvestigate.status, 200, 'Brand Reviewer can log recurrence root-cause investigation');
    assert.ok(
      reviewerInvestigate.data.pattern.investigatedBy === 'Marcus Vance (Reviewer & Manager)' ||
        reviewerInvestigate.data.pattern.investigatedBy === 'Rohan Verma (Reviewer & Manager)',
      'Server attributes investigation to reviewer persona (Rohan Verma / Marcus Vance)'
    );
  }

  const reviewerConfigRes = await apiRequest('/api/clarity-loop/config', 'POST', REVIEWER_HEADERS, {
    minOccurrences: 5,
    minDistinctDrafts: 3,
    windowDays: 14
  });
  assert.equal(
    reviewerConfigRes.status,
    403,
    'Brand Reviewer must be blocked (403) from reconfiguring workspace-wide recurrence thresholds'
  );

  // 8c. Workspace Admin can configure recurrence thresholds and view security audit events
  const adminConfigRes = await apiRequest('/api/clarity-loop/config', 'POST', ADMIN_HEADERS, {
    minOccurrences: 3,
    minDistinctDrafts: 2,
    windowDays: 7
  });
  assert.equal(adminConfigRes.status, 200, 'Workspace Admin can configure recurrence thresholds');

  const reviewerSecurityLogRes = await apiRequest('/api/security/audit-events', 'GET', REVIEWER_HEADERS);
  assert.equal(reviewerSecurityLogRes.status, 403, 'Brand Reviewer blocked from security audit log');

  const creatorSecurityLogRes = await apiRequest('/api/security/audit-events', 'GET', CREATOR_HEADERS);
  assert.equal(creatorSecurityLogRes.status, 403, 'Content Creator blocked from security audit log');

  const adminSecurityLogRes = await apiRequest('/api/security/audit-events', 'GET', ADMIN_HEADERS);
  assert.equal(adminSecurityLogRes.status, 200, 'Workspace Admin can inspect security audit events');
  assert.ok(
    Array.isArray(adminSecurityLogRes.data.events) && adminSecurityLogRes.data.events.length > 0,
    'Security audit log must contain recorded allow/deny events'
  );
  const deniedEvents = adminSecurityLogRes.data.events.filter((e: any) => e.outcome === 'denied');
  assert.ok(deniedEvents.length >= 10, 'All denied RBAC attempts should be recorded in securityAuditEvents');
  console.log(`   ✓ Manager Insights, Recurrence Loop, and Security Audit Log (${deniedEvents.length} denied attempts logged) verified.\n`);

  console.log('===================================================================');
  console.log('ALL RBAC & SECURITY AUTHORIZATION TESTS PASSED SUCCESSFULLY!');
  console.log('===================================================================');
}

runRbacAuthorizationTests().catch(err => {
  console.error('\n❌ RBAC Authorization Test Suite Failed:', err);
  process.exit(1);
});
