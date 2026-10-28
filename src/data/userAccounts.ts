import bcrypt from 'bcryptjs';
import { CanonicalRole, UserProfile, UserRole } from '../types.ts';
import {
  DEFAULT_WORKSPACE_ID,
  DEFAULT_WORKSPACE_NAME,
  ROLE_PERMISSION_OBJECT_MATRIX,
  ROLE_PERMISSION_MATRIX
} from './userProfiles.ts';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  status: 'active' | 'suspended' | 'locked';
  canonicalRole: CanonicalRole;
  role: UserRole;
  roleLabel: string;
  title: string;
  department: string;
  workspaceId: string;
  workspaceName: string;
  authorizedRoles: CanonicalRole[];
  authorizedBrandIds: string[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

// Development default passwords (read from env or use default development credentials)
// In production, these should be supplied via secure secrets in environment variables
const SEED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@Bharat2026!';
const SEED_REVIEWER_PASSWORD = process.env.REVIEWER_PASSWORD || 'Reviewer@Mumbai2026!';
const SEED_CREATOR_PASSWORD = process.env.CREATOR_PASSWORD || 'Creator@Delhi2026!';

// Hash seed passwords using standard bcrypt with salt rounds = 10
export const SEED_ACCOUNTS: UserAccount[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    name: 'Aditi Sharma',
    email: 'aditi.sharma@bharat-enterprise.in',
    passwordHash: bcrypt.hashSync(SEED_ADMIN_PASSWORD, 10),
    status: 'active',
    canonicalRole: 'workspace_admin',
    role: 'brand_manager',
    roleLabel: 'Workspace Admin',
    title: 'Brand Governance Lead & System Administrator',
    department: 'Governance & Standards (Bengaluru HQ)',
    workspaceId: DEFAULT_WORKSPACE_ID,
    workspaceName: DEFAULT_WORKSPACE_NAME,
    authorizedRoles: ['workspace_admin'],
    authorizedBrandIds: ['*'],
    createdAt: '2026-01-10T00:00:00.000Z',
    updatedAt: '2026-10-28T00:00:00.000Z'
  },
  {
    id: 'usr-reviewer-02',
    username: 'reviewer',
    name: 'Rohan Verma',
    email: 'rohan.verma@bharat-enterprise.in',
    passwordHash: bcrypt.hashSync(SEED_REVIEWER_PASSWORD, 10),
    status: 'active',
    canonicalRole: 'brand_reviewer',
    role: 'legal_counsel',
    roleLabel: 'Reviewer & Manager',
    title: 'Senior Compliance Reviewer & Brand Quality Lead',
    department: 'Risk & Editorial Review (Mumbai Hub)',
    workspaceId: DEFAULT_WORKSPACE_ID,
    workspaceName: DEFAULT_WORKSPACE_NAME,
    authorizedRoles: ['brand_reviewer'],
    authorizedBrandIds: ['*'],
    createdAt: '2026-01-15T00:00:00.000Z',
    updatedAt: '2026-10-28T00:00:00.000Z'
  },
  {
    id: 'usr-creator-03',
    username: 'creator',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@bharat-enterprise.in',
    passwordHash: bcrypt.hashSync(SEED_CREATOR_PASSWORD, 10),
    status: 'active',
    canonicalRole: 'content_creator',
    role: 'creator',
    roleLabel: 'Content Creator',
    title: 'Senior Creative Copywriter & Campaign Strategist',
    department: 'Creative Studio & Growth (Delhi NCR)',
    workspaceId: DEFAULT_WORKSPACE_ID,
    workspaceName: DEFAULT_WORKSPACE_NAME,
    authorizedRoles: ['content_creator'],
    authorizedBrandIds: ['*'],
    createdAt: '2026-02-01T00:00:00.000Z',
    updatedAt: '2026-10-28T00:00:00.000Z'
  }
];

// In-memory accounts table initialized from SEED_ACCOUNTS
const ACCOUNTS: Map<string, UserAccount> = new Map(
  SEED_ACCOUNTS.map(acc => [acc.id, { ...acc }])
);

// Sliding window rate limiter for authentication attempts
interface RateLimitRecord {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 1000; // 60 seconds
const BLOCK_DURATION_MS = 60 * 1000; // 60 seconds lockout

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const rec = rateLimitMap.get(key);
  if (!rec) return { allowed: true };

  if (rec.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((rec.blockedUntil - now) / 1000)
    };
  }

  // If outside window, reset
  if (now - rec.firstAttemptAt > WINDOW_MS) {
    rateLimitMap.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

export function recordFailedAttempt(key: string): void {
  const now = Date.now();
  const rec = rateLimitMap.get(key);
  if (!rec || now - rec.firstAttemptAt > WINDOW_MS) {
    rateLimitMap.set(key, { attempts: 1, firstAttemptAt: now, blockedUntil: 0 });
  } else {
    rec.attempts += 1;
    if (rec.attempts >= MAX_ATTEMPTS) {
      rec.blockedUntil = now + BLOCK_DURATION_MS;
    }
  }
}

export function resetRateLimit(key: string): void {
  rateLimitMap.delete(key);
}

/**
 * Sanitizes an account into a safe UserProfile without sensitive credential fields (no passwordHash).
 */
export function sanitizeAccountToProfile(account: UserAccount): UserProfile {
  return {
    id: account.id,
    name: account.name,
    role: account.role,
    canonicalRole: account.canonicalRole,
    roleLabel: account.roleLabel,
    title: account.title,
    department: account.department,
    email: account.email,
    initials: account.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase(),
    avatarColor:
      account.canonicalRole === 'workspace_admin'
        ? 'bg-blue-600'
        : account.canonicalRole === 'brand_reviewer'
        ? 'bg-indigo-600'
        : 'bg-slate-600',
    badgeBg:
      account.canonicalRole === 'workspace_admin'
        ? 'bg-blue-50'
        : account.canonicalRole === 'brand_reviewer'
        ? 'bg-indigo-50'
        : 'bg-slate-100',
    badgeText:
      account.canonicalRole === 'workspace_admin'
        ? 'text-blue-700'
        : account.canonicalRole === 'brand_reviewer'
        ? 'text-indigo-700'
        : 'text-slate-700',
    badgeBorder:
      account.canonicalRole === 'workspace_admin'
        ? 'border-blue-200'
        : account.canonicalRole === 'brand_reviewer'
        ? 'border-indigo-200'
        : 'border-slate-300',
    workspaceId: account.workspaceId,
    workspaceName: account.workspaceName,
    authorizedBrandIds: account.authorizedBrandIds,
    permissions: ROLE_PERMISSION_OBJECT_MATRIX[account.canonicalRole],
    grantedPermissions: ROLE_PERMISSION_MATRIX[account.canonicalRole],
    description:
      account.canonicalRole === 'workspace_admin'
        ? 'Full brand governance, rules, catalog, review, and insights authority.'
        : account.canonicalRole === 'brand_reviewer'
        ? 'Content review, evidence inspection, finding resolution, and manager insights.'
        : 'Marketing copy drafting and suggested fix application.',
    responsibilities: [
      account.canonicalRole === 'workspace_admin'
        ? 'Manage rules, products, brands, and insights'
        : account.canonicalRole === 'brand_reviewer'
        ? 'Review findings and authorize content publication'
        : 'Submit drafts and apply compliant corrections'
    ]
  };
}

export interface AuthenticationResult {
  success: boolean;
  user?: UserProfile;
  account?: UserAccount;
  error?: string;
  statusCode?: number;
  rateLimited?: boolean;
  failureCategory?:
    | 'MISSING_FIELDS'
    | 'RATE_LIMITED'
    | 'INVALID_CREDENTIALS'
    | 'ACCOUNT_INACTIVE'
    | 'UNAUTHORIZED_ROLE'
    | 'UNAUTHORIZED_WORKSPACE';
}

/**
 * Server-authoritative username-and-password authentication for role switching.
 * Strictly verifies identity, password hash, account status, workspace membership, and role authorization.
 */
export function authenticateAndAuthorizeRoleSwitch(
  usernameOrEmail: string,
  plaintextPassword: string,
  targetCanonicalRole: CanonicalRole,
  workspaceId: string = DEFAULT_WORKSPACE_ID,
  clientIp = '127.0.0.1'
): AuthenticationResult {
  const cleanUsername = String(usernameOrEmail || '').trim().toLowerCase();
  const cleanPassword = String(plaintextPassword || '');

  if (!cleanUsername || !cleanPassword) {
    return {
      success: false,
      statusCode: 400,
      error: 'Username and password are required.',
      failureCategory: 'MISSING_FIELDS'
    };
  }

  if (cleanUsername.length > 256 || cleanPassword.length > 256) {
    return {
      success: false,
      statusCode: 400,
      error: 'Invalid credential payload size.',
      failureCategory: 'MISSING_FIELDS'
    };
  }

  // Rate limit check by client IP and username
  const rateLimitKey = `${clientIp}:${cleanUsername}`;
  const rateCheck = checkRateLimit(rateLimitKey);
  if (!rateCheck.allowed) {
    return {
      success: false,
      statusCode: 429,
      error: `Too many failed authentication attempts. Please try again after ${rateCheck.retryAfterSeconds || 60} seconds.`,
      rateLimited: true,
      failureCategory: 'RATE_LIMITED'
    };
  }

  // Find user account by username, email, or user ID
  const account = Array.from(ACCOUNTS.values()).find(
    a =>
      a.username.toLowerCase() === cleanUsername ||
      a.email.toLowerCase() === cleanUsername ||
      a.id.toLowerCase() === cleanUsername
  );

  // Generic failure message to prevent username enumeration
  const GENERIC_AUTH_ERROR = 'Unable to verify your credentials or requested access.';

  if (!account) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      statusCode: 401,
      error: GENERIC_AUTH_ERROR,
      failureCategory: 'INVALID_CREDENTIALS'
    };
  }

  // Verify password hash using bcrypt
  const isPasswordValid = bcrypt.compareSync(cleanPassword, account.passwordHash);
  if (!isPasswordValid) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      statusCode: 401,
      error: GENERIC_AUTH_ERROR,
      failureCategory: 'INVALID_CREDENTIALS'
    };
  }

  // Verify account is active
  if (account.status !== 'active') {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      statusCode: 403,
      error: GENERIC_AUTH_ERROR,
      failureCategory: 'ACCOUNT_INACTIVE'
    };
  }

  // Verify workspace membership (supports workspace alias)
  const validWorkspaces = [account.workspaceId, DEFAULT_WORKSPACE_ID, 'ws-enterprise-01', 'ws-bharat-01'];
  if (workspaceId && !validWorkspaces.includes(workspaceId)) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      statusCode: 403,
      error: GENERIC_AUTH_ERROR,
      failureCategory: 'UNAUTHORIZED_WORKSPACE'
    };
  }

  // CRITICAL SECURITY CHECK: Account must be explicitly authorized for the requested target role!
  // Prevents Content Creator from switching into Workspace Admin even if they supply valid creator credentials.
  if (!account.authorizedRoles.includes(targetCanonicalRole)) {
    recordFailedAttempt(rateLimitKey);
    return {
      success: false,
      statusCode: 403,
      error: GENERIC_AUTH_ERROR,
      failureCategory: 'UNAUTHORIZED_ROLE'
    };
  }

  // Successful verification - clear failed attempt tracker
  resetRateLimit(rateLimitKey);
  account.lastLoginAt = new Date().toISOString();
  account.updatedAt = new Date().toISOString();

  const sanitizedUser = sanitizeAccountToProfile(account);

  return {
    success: true,
    statusCode: 200,
    user: sanitizedUser,
    account
  };
}

export function getAccountById(id: string): UserAccount | undefined {
  return ACCOUNTS.get(id);
}

export function getAllSanitizedProfiles(): UserProfile[] {
  return Array.from(ACCOUNTS.values()).map(sanitizeAccountToProfile);
}
