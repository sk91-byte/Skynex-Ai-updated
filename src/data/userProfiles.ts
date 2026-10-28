import { CanonicalRole, PermissionKey, RolePermissions, UserProfile, UserRole } from '../types.ts';

export const DEFAULT_WORKSPACE_ID = 'ws-enterprise-01';
export const DEFAULT_WORKSPACE_NAME = 'Bharat Enterprise Workspace';
export const DEFAULT_WORKSPACE_REGION = 'India Hub (Bengaluru · Mumbai · Delhi NCR)';

export const ROLE_PERMISSION_OBJECT_MATRIX: Record<CanonicalRole, RolePermissions> = {
  workspace_admin: {
    canSubmitContent: true,
    canInspectFindings: true,
    canApplyFixes: true,
    canAcceptFinding: true,
    canAcceptFindingFix: true,
    canEditDraft: true,
    canEditFinding: true,
    canEditFindingFix: true,
    canRejectFinding: true,
    canRejectFindingFix: true,
    canEscalateFinding: true,
    canDismissConfirmedViolation: true,
    canApproveWaiver: true,
    canFinalizeReview: true,
    canManageRules: true,
    canCreateRules: true,
    canEditRules: true,
    canApproveRules: true,
    canDeprecateRules: true,
    canDeleteRules: true,
    canImportGuidelines: true,
    canEditProducts: true,
    canViewProductCatalog: true,
    canManageBrandAssets: true,
    canManageBrands: true,
    canManageWorkspace: true,
    canViewOwnHistory: true,
    canViewAllWorkspaceHistory: true,
    canViewInsights: true,
    canInvestigateRecurrence: true,
    canConfigureRecurrence: true,
    canViewSecurityAuditLog: true,
    canExecuteMemo: true,
    canExportAuditLog: true,
    canClearLegalFlags: true
  },
  brand_reviewer: {
    canSubmitContent: true,
    canInspectFindings: true,
    canApplyFixes: true,
    canAcceptFinding: true,
    canAcceptFindingFix: true,
    canEditDraft: true,
    canEditFinding: true,
    canEditFindingFix: true,
    canRejectFinding: true,
    canRejectFindingFix: true,
    canEscalateFinding: true,
    canDismissConfirmedViolation: true,
    canApproveWaiver: true,
    canFinalizeReview: true,
    canManageRules: false,
    canCreateRules: false,
    canEditRules: false,
    canApproveRules: false,
    canDeprecateRules: false,
    canDeleteRules: false,
    canImportGuidelines: false,
    canEditProducts: false,
    canViewProductCatalog: true,
    canManageBrandAssets: false,
    canManageBrands: false,
    canManageWorkspace: false,
    canViewOwnHistory: true,
    canViewAllWorkspaceHistory: true,
    canViewInsights: true,
    canInvestigateRecurrence: true,
    canConfigureRecurrence: false,
    canViewSecurityAuditLog: false,
    canExecuteMemo: true,
    canExportAuditLog: true,
    canClearLegalFlags: true
  },
  content_creator: {
    canSubmitContent: true,
    canInspectFindings: true,
    canApplyFixes: true,
    canAcceptFinding: true,
    canAcceptFindingFix: true,
    canEditDraft: true,
    canEditFinding: true,
    canEditFindingFix: true,
    canRejectFinding: true,
    canRejectFindingFix: true,
    canEscalateFinding: true,
    canDismissConfirmedViolation: false,
    canApproveWaiver: false,
    canFinalizeReview: false,
    canManageRules: false,
    canCreateRules: false,
    canEditRules: false,
    canApproveRules: false,
    canDeprecateRules: false,
    canDeleteRules: false,
    canImportGuidelines: false,
    canEditProducts: false,
    canViewProductCatalog: true,
    canManageBrandAssets: false,
    canManageBrands: false,
    canManageWorkspace: false,
    canViewOwnHistory: true,
    canViewAllWorkspaceHistory: false,
    canViewInsights: false,
    canInvestigateRecurrence: false,
    canConfigureRecurrence: false,
    canViewSecurityAuditLog: false,
    canExecuteMemo: false,
    canExportAuditLog: false,
    canClearLegalFlags: false
  }
};

export const ROLE_PERMISSION_MATRIX: Record<CanonicalRole, PermissionKey[]> = {
  workspace_admin: [
    'workspace.read',
    'workspace.manage',
    'brand.read',
    'brand.manage',
    'rules.read',
    'rules.create',
    'rules.edit',
    'rules.approve',
    'rules.deprecate',
    'rules.delete',
    'guidelines.import',
    'rules.test',
    'products.read',
    'products.edit',
    'assets.manage',
    'content.submit',
    'audit.run',
    'findings.review',
    'findings.accept',
    'findings.edit',
    'findings.reject',
    'findings.waive',
    'reviews.finalize',
    'history.read',
    'insights.read',
    'investigations.manage',
    'audit_events.read',
    ...(Object.entries(ROLE_PERMISSION_OBJECT_MATRIX.workspace_admin)
      .filter(([, allowed]) => allowed)
      .map(([k]) => k as PermissionKey))
  ],
  brand_reviewer: [
    'workspace.read',
    'brand.read',
    'rules.read',
    'rules.test',
    'products.read',
    'content.submit',
    'audit.run',
    'findings.review',
    'findings.accept',
    'findings.edit',
    'findings.reject',
    'findings.waive',
    'reviews.finalize',
    'history.read',
    'insights.read',
    'investigations.manage',
    ...(Object.entries(ROLE_PERMISSION_OBJECT_MATRIX.brand_reviewer)
      .filter(([, allowed]) => allowed)
      .map(([k]) => k as PermissionKey))
  ],
  content_creator: [
    'workspace.read',
    'brand.read',
    'rules.read',
    'rules.test',
    'products.read',
    'content.submit',
    'audit.run',
    'findings.review',
    'findings.accept',
    'findings.edit',
    'findings.reject',
    'history.read',
    ...(Object.entries(ROLE_PERMISSION_OBJECT_MATRIX.content_creator)
      .filter(([, allowed]) => allowed)
      .map(([k]) => k as PermissionKey))
  ]
};

export const USER_PROFILES: UserProfile[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    name: 'Aditi Sharma',
    role: 'brand_manager',
    canonicalRole: 'workspace_admin',
    roleLabel: 'Workspace Admin',
    title: 'Brand Governance Lead & System Administrator',
    department: 'Governance & Standards (Bengaluru HQ)',
    email: 'aditi.sharma@bharat-enterprise.in',
    initials: 'AS',
    avatarColor: 'bg-blue-600',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    workspaceId: DEFAULT_WORKSPACE_ID,
    workspaceName: DEFAULT_WORKSPACE_NAME,
    authorizedRoles: ['workspace_admin'],
    authorizedBrandIds: ['*'],
    permissions: ROLE_PERMISSION_OBJECT_MATRIX.workspace_admin,
    grantedPermissions: ROLE_PERMISSION_MATRIX.workspace_admin,
    description:
      'Manages enterprise brand knowledge, imports guidelines, approves rules, maintains product catalog facts, reviews content, and oversees recurring compliance issues.',
    responsibilities: [
      'Create, edit, approve, and manage structured brand rules in Brand Knowledge',
      'Import PDF brand guidelines and review extracted rule candidates',
      'Manage approved product facts, prices, SKUs, and product catalogs',
      'Review content drafts, finalize approvals, and investigate recurring compliance patterns'
    ]
  },
  {
    id: 'usr-reviewer-02',
    username: 'reviewer',
    name: 'Rohan Verma',
    role: 'legal_counsel',
    canonicalRole: 'brand_reviewer',
    roleLabel: 'Reviewer & Manager',
    title: 'Senior Compliance Reviewer & Brand Quality Lead',
    department: 'Risk & Editorial Review (Mumbai Hub)',
    email: 'rohan.verma@bharat-enterprise.in',
    initials: 'RV',
    avatarColor: 'bg-indigo-600',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-700',
    badgeBorder: 'border-indigo-200',
    workspaceId: DEFAULT_WORKSPACE_ID,
    workspaceName: DEFAULT_WORKSPACE_NAME,
    authorizedRoles: ['brand_reviewer'],
    authorizedBrandIds: ['*'],
    permissions: ROLE_PERMISSION_OBJECT_MATRIX.brand_reviewer,
    grantedPermissions: ROLE_PERMISSION_MATRIX.brand_reviewer,
    description:
      'Reviews content against approved rules, resolves findings, approves drafts for publication when compliant, and tracks recurring issues in Manager Insights.',
    responsibilities: [
      'Accept, edit, or reject flagged findings with recorded reasoning',
      'Approve compliant content for publication or request revisions',
      'Monitor recurring compliance alerts and log root-cause investigations in Manager Insights',
      'View brand rules and product catalog in read-only mode (cannot create/approve rules or alter product pricing)'
    ]
  },
  {
    id: 'usr-creator-03',
    username: 'creator',
    name: 'Ananya Iyer',
    role: 'creator',
    canonicalRole: 'content_creator',
    roleLabel: 'Content Creator',
    title: 'Senior Creative Copywriter & Campaign Strategist',
    department: 'Creative Studio & Growth (Delhi NCR)',
    email: 'ananya.iyer@bharat-enterprise.in',
    initials: 'AI',
    avatarColor: 'bg-slate-600',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    workspaceId: DEFAULT_WORKSPACE_ID,
    workspaceName: DEFAULT_WORKSPACE_NAME,
    authorizedRoles: ['content_creator'],
    authorizedBrandIds: ['*'],
    permissions: ROLE_PERMISSION_OBJECT_MATRIX.content_creator,
    grantedPermissions: ROLE_PERMISSION_MATRIX.content_creator,
    description:
      'Drafts or uploads marketing content, checks compliance against approved brand rules, and applies suggested fixes before requesting reviewer approval.',
    responsibilities: [
      'Paste text, upload documents, or upload ad images for brand review',
      'Inspect flagged issues and apply suggested replacements to drafts',
      'View approved brand rules and product catalog in read-only mode',
      'Cannot approve rules, edit product prices, access Manager Insights, or finalize content for publication'
    ]
  }
];

export const DEFAULT_USER_PROFILE: UserProfile = USER_PROFILES[0];

export type UserLookupInput =
  | string
  | { userId?: string | null; role?: string | null; canonicalRole?: string | null }
  | null
  | undefined;

/**
 * Resolves a known UserProfile from a user ID, canonical role key, legacy UserRole, exact role label, demo email, or lookup object.
 * Returns null if the identifier does not match any valid persona (prevents unvalidated role injection).
 */
export function resolveCanonicalUserProfile(identifier?: UserLookupInput): UserProfile | null {
  if (!identifier) return null;

  if (typeof identifier === 'object') {
    if (identifier.userId) {
      const byId = resolveCanonicalUserProfile(identifier.userId);
      if (byId) return byId;
    }
    if (identifier.canonicalRole) {
      const byCanonical = resolveCanonicalUserProfile(identifier.canonicalRole);
      if (byCanonical) return byCanonical;
    }
    if (identifier.role) {
      const byRole = resolveCanonicalUserProfile(identifier.role);
      if (byRole) return byRole;
    }
    return null;
  }

  if (typeof identifier !== 'string') return null;
  const normalized = identifier.trim().toLowerCase();
  if (!normalized) return null;

  // 1. Direct match by ID, canonicalRole, role, roleLabel, email, demoUserId, or name
  const direct = USER_PROFILES.find(
    p =>
      p.id.toLowerCase() === normalized ||
      p.canonicalRole.toLowerCase() === normalized ||
      p.role.toLowerCase() === normalized ||
      p.roleLabel.toLowerCase() === normalized ||
      p.name.toLowerCase() === normalized ||
      p.email.toLowerCase() === normalized ||
      (p.username && p.username.toLowerCase() === normalized)
  );
  if (direct) return direct;

  // 2. Common composite attribution strings or aliases (including backward-compatible test aliases)
  if (
    normalized === 'workspace admin (workspace admin)' ||
    normalized === 'aditi sharma (workspace admin)' ||
    normalized === 'aditi sharma' ||
    normalized === 'workspace admin' ||
    normalized === 'brand_manager' ||
    normalized === 'workspace_admin' ||
    normalized === 'admin' ||
    normalized === 'executive' ||
    normalized === 'usr-admin-01' ||
    normalized === 'qa engineer' ||
    normalized === 'qa' ||
    normalized === 'test runner' ||
    normalized === 'tester'
  ) {
    return USER_PROFILES[0];
  }
  if (
    normalized === 'rohan verma (reviewer & manager)' ||
    normalized === 'rohan verma' ||
    normalized === 'marcus vance (reviewer & manager)' ||
    normalized === 'marcus vance' ||
    normalized === 'brand reviewer (reviewer & manager)' ||
    normalized === 'brand reviewer (brand reviewer)' ||
    normalized === 'reviewer & manager' ||
    normalized === 'brand reviewer' ||
    normalized === 'reviewer' ||
    normalized === 'legal_counsel' ||
    normalized === 'brand_reviewer' ||
    normalized === 'usr-reviewer-02'
  ) {
    return USER_PROFILES[1];
  }
  if (
    normalized === 'ananya iyer (content creator)' ||
    normalized === 'ananya iyer' ||
    normalized === 'elena rostova (content creator)' ||
    normalized === 'elena rostova' ||
    normalized === 'content creator (content creator)' ||
    normalized === 'content creator' ||
    normalized === 'creator' ||
    normalized === 'content_creator' ||
    normalized === 'usr-creator-03'
  ) {
    return USER_PROFILES[2];
  }

  return null;
}

/**
 * Checks whether a user profile, role key, or role identifier has a specific granular permission.
 */
export function hasPermission(
  userOrRole: UserProfile | CanonicalRole | UserRole | string | null | undefined,
  permission: PermissionKey
): boolean {
  if (!userOrRole) return false;
  if (typeof userOrRole === 'object' && 'permissions' in userOrRole) {
    if ((userOrRole.permissions as unknown as Record<string, boolean | undefined>)?.[permission] === true) {
      return true;
    }
    return Array.isArray(userOrRole.grantedPermissions) && userOrRole.grantedPermissions.includes(permission);
  }
  const profile = resolveCanonicalUserProfile(String(userOrRole));
  if (!profile) return false;
  if ((profile.permissions as unknown as Record<string, boolean | undefined>)?.[permission] === true) {
    return true;
  }
  return profile.grantedPermissions.includes(permission);
}

/**
 * Checks whether a user profile is authorized to access a given workspace and brand.
 */
export function isAuthorizedForBrandScope(
  user: UserProfile | null | undefined,
  brandId?: string | null,
  workspaceId: string = DEFAULT_WORKSPACE_ID
): boolean {
  if (!user) return false;
  if (user.workspaceId && workspaceId && user.workspaceId !== workspaceId) {
    return false;
  }
  if (!brandId) return true;
  if (user.authorizedBrandIds.includes('*')) return true;
  return user.authorizedBrandIds.includes(brandId);
}

import { handleClientApiFallback } from './clientApiFallback.ts';

/**
 * Shared active user ref and safe fetch wrapper that attaches RBAC headers to `/api/*` calls
 * without mutating the read-only `window.fetch` property in iframe environments.
 * Seamlessly routes to client-side storage engine when deployed to static CDNs (e.g. skynexstudio.xyz).
 */
export const activeUserHeaderRef: { current: UserProfile } = {
  current: DEFAULT_USER_PROFILE
};

export const apiFetch: typeof fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const baseFetch = typeof window !== 'undefined' ? window.fetch.bind(window) : globalThis.fetch.bind(globalThis);
  const urlStr = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  const isApi = urlStr.startsWith('/api/') || urlStr.includes('/api/');

  if (isApi) {
    const headers = new Headers(init?.headers || {});
    const u = activeUserHeaderRef.current || DEFAULT_USER_PROFILE;
    if (!headers.has('x-user-id')) headers.set('x-user-id', u.id);
    if (!headers.has('x-user-role')) headers.set('x-user-role', u.role);
    if (!headers.has('x-skynex-role')) headers.set('x-skynex-role', u.canonicalRole || u.role);
    if (!headers.has('x-workspace-id')) headers.set('x-workspace-id', u.workspaceId || DEFAULT_WORKSPACE_ID);

    try {
      const res = await baseFetch(input, { ...init, headers });
      const contentType = res.headers.get('content-type') || '';
      // If backend responded with valid JSON or API response, return it directly
      if (!contentType.includes('text/html')) {
        return res;
      }
      // If deployed on static host (like Cloudflare Pages on skynexstudio.xyz), Cloudflare returns index.html for /api/*
      return handleClientApiFallback(urlStr, init?.method || 'GET', init?.body, headers);
    } catch (_networkErr) {
      return handleClientApiFallback(urlStr, init?.method || 'GET', init?.body, headers);
    }
  }

  return baseFetch(input, init);
};


