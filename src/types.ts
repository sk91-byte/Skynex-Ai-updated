export type BrandId = 'novapay' | 'aerosip' | 'skynex' | string;

export type UserRole = 'creator' | 'brand_manager' | 'legal_counsel' | 'executive';

export type CanonicalRole = 'workspace_admin' | 'brand_reviewer' | 'content_creator';

export type PermissionKey =
  | 'workspace.read'
  | 'workspace.manage'
  | 'brand.read'
  | 'brand.manage'
  | 'rules.read'
  | 'rules.create'
  | 'rules.edit'
  | 'rules.approve'
  | 'rules.deprecate'
  | 'rules.delete'
  | 'guidelines.import'
  | 'rules.test'
  | 'products.read'
  | 'products.edit'
  | 'assets.manage'
  | 'content.submit'
  | 'audit.run'
  | 'findings.review'
  | 'findings.accept'
  | 'findings.edit'
  | 'findings.reject'
  | 'findings.waive'
  | 'reviews.finalize'
  | 'history.read'
  | 'insights.read'
  | 'investigations.manage'
  | 'audit_events.read'
  | 'canSubmitContent'
  | 'canInspectFindings'
  | 'canApplyFixes'
  | 'canAcceptFinding'
  | 'canAcceptFindingFix'
  | 'canEditDraft'
  | 'canEditFinding'
  | 'canEditFindingFix'
  | 'canRejectFinding'
  | 'canRejectFindingFix'
  | 'canEscalateFinding'
  | 'canDismissConfirmedViolation'
  | 'canApproveWaiver'
  | 'canFinalizeReview'
  | 'canManageRules'
  | 'canCreateRules'
  | 'canEditRules'
  | 'canApproveRules'
  | 'canDeprecateRules'
  | 'canDeleteRules'
  | 'canImportGuidelines'
  | 'canEditProducts'
  | 'canViewProductCatalog'
  | 'canManageBrandAssets'
  | 'canManageBrands'
  | 'canManageWorkspace'
  | 'canViewOwnHistory'
  | 'canViewAllWorkspaceHistory'
  | 'canViewInsights'
  | 'canInvestigateRecurrence'
  | 'canConfigureRecurrence'
  | 'canViewSecurityAuditLog'
  | 'canExecuteMemo'
  | 'canExportAuditLog'
  | 'canClearLegalFlags';

export interface RolePermissions {
  canSubmitContent: boolean;
  canInspectFindings: boolean;
  canApplyFixes: boolean;
  canAcceptFinding: boolean;
  canAcceptFindingFix: boolean;
  canEditDraft: boolean;
  canEditFinding: boolean;
  canEditFindingFix: boolean;
  canRejectFinding: boolean;
  canRejectFindingFix: boolean;
  canEscalateFinding: boolean;
  canDismissConfirmedViolation: boolean;
  canApproveWaiver: boolean;
  canFinalizeReview: boolean;
  canManageRules: boolean;
  canCreateRules: boolean;
  canEditRules: boolean;
  canApproveRules: boolean;
  canDeprecateRules: boolean;
  canDeleteRules: boolean;
  canImportGuidelines: boolean;
  canEditProducts: boolean;
  canViewProductCatalog: boolean;
  canManageBrandAssets: boolean;
  canManageBrands: boolean;
  canManageWorkspace: boolean;
  canViewOwnHistory: boolean;
  canViewAllWorkspaceHistory: boolean;
  canViewInsights: boolean;
  canInvestigateRecurrence: boolean;
  canConfigureRecurrence: boolean;
  canViewSecurityAuditLog: boolean;
  canExecuteMemo: boolean;
  canExportAuditLog: boolean;
  canClearLegalFlags: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  canonicalRole: CanonicalRole;
  roleLabel: string;
  title: string;
  department: string;
  email: string;
  initials: string;
  avatarColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  workspaceId: string;
  workspaceName?: string;
  username?: string;
  authorizedRoles?: CanonicalRole[];
  authorizedBrandIds: string[];
  permissions: RolePermissions;
  grantedPermissions: PermissionKey[];
  description: string;
  responsibilities: string[];
}

export interface SecurityAuditEvent {
  eventId: string;
  timestamp: string;
  eventType:
    | 'ROLE_SWITCH'
    | 'ROLE_SWITCHED'
    | 'AUTHORIZATION_DENIED'
    | 'CROSS_SCOPE_DENIED'
    | 'RULE_MUTATED'
    | 'RULE_BATCH_IMPORTED'
    | 'PRODUCT_MUTATED'
    | 'FINDING_DECISION_RECORDED'
    | 'REVIEW_FINALIZED'
    | 'INVESTIGATION_LOGGED'
    | 'BRAND_MUTATED';
  actorId: string;
  actorName: string;
  actorRole: UserRole | string;
  canonicalRole: CanonicalRole;
  workspaceId: string;
  brandId?: string;
  resourceId?: string;
  permissionChecked?: PermissionKey;
  allowed: boolean;
  outcome?: 'allowed' | 'denied';
  statusCode: number;
  reason?: string;
  metadata?: Record<string, any>;
}

export type RuleCategory =
  | 'Terminology'
  | 'Pricing & Facts'
  | 'Prohibited Claim'
  | 'Performance & Claims'
  | 'Tone & Style'
  | 'Visual Identity'
  | 'Messaging & Claims'
  | 'Prohibited Content'
  | 'Legal & Compliance'
  | 'Accessibility';

export type RuleSeverityLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export type ImportedKnowledgeCategory =
  | 'Brand Identity'
  | 'Brand Voice & Writing Style'
  | 'Product Knowledge'
  | 'Pricing & Commercial Information'
  | 'Claims & Supporting Evidence'
  | 'Channel-Specific Guidelines'
  | 'Accessibility & Other Brand Requirements';

export type RuleApprovalStatus = 'Approved' | 'Draft' | 'Unverified' | 'Deprecated' | 'Superseded';

export type CandidateReviewStatus =
  | 'Pending Review'
  | 'Approved'
  | 'Rejected'
  | 'Needs Verification'
  | 'Conflicting Information';

export type FindingClassification =
  | 'confirmed_rule_conflict'
  | 'approved_fact_conflict'
  | 'prohibited_claim'
  | 'unsupported_claim'
  | 'style_tone_suggestion'
  | 'needs_human_verification'
  | 'source_conflict_requires_governance_resolution';

export type FindingLifecycleStatus =
  | 'detected'
  | 'needs_verification'
  | 'confirmed'
  | 'not_a_violation'
  | 'resolved'
  | 'resolved_by_correction'
  | 'waived'
  | 'superseded';

export type CheckOutcomeStatus =
  | 'passed'
  | 'failed'
  | 'warning'
  | 'skipped'
  | 'needs_human_verification'
  | 'not_applicable'
  | 'not_run'
  | 'error';

export type RootCauseCategory =
  | 'unclear_guidelines'
  | 'outdated_approved_info'
  | 'training_need'
  | 'agency_campaign_issue'
  | 'system_detection_problem'
  | 'unknown_cause'
  | 'Unclear Rule Wording'
  | 'Outdated Template / Pricing Sheet'
  | 'Repeated Creator Misunderstanding'
  | 'Conflicting Source Documents'
  | 'Catalog / Fact Outdated'
  | 'Agency / Channel Drift';

export type ReviewStatusOutcome =
  | 'issues_found'
  | 'no_issues_detected'
  | 'needs_human_verification'
  | 'partial_review_ai_unavailable'
  | 'extraction_incomplete'
  | 'changes_applied';

export type ContentApprovalStatus =
  | 'pending_review'
  | 'approved_for_publication'
  | 'approved_with_exception'
  | 'changes_requested'
  | 'escalated_for_verification';

export type DecisionStatus =
  | 'pending'
  | 'accepted'
  | 'edited'
  | 'rejected'
  | 'verification_requested'
  | 'escalated'
  | 'waived'
  | 'exception_approved';

export interface RuleVersionEntry {
  version: number;
  title: string;
  category?: RuleCategory;
  ruleStatement: string;
  approvedValue: string;
  targetPatterns: string[];
  sourceRef?: string;
  sourceDocumentName?: string;
  sourcePage?: string;
  sourceSection?: string;
  severity?: 'critical' | 'warning' | 'info';
  severityLevel?: RuleSeverityLevel;
  status?: RuleApprovalStatus;
  explanation?: string;
  updatedAt: string;
  updatedBy: string;
  updatedByRole?: string;
  changedFields?: string[];
  changeSummary?: string;
}

export interface MergedSourceRef {
  documentId?: string;
  filename: string;
  location: string;
  excerpt: string;
}

export interface BrandRule {
  id: string;
  brandId: BrandId;
  category: RuleCategory;
  importedCategory?: ImportedKnowledgeCategory;
  title: string;
  ruleStatement: string;
  targetPatterns: string[];
  approvedValue: string;
  sourceRef: string;
  sourceDocumentName?: string;
  sourcePage?: string;
  sourceSection?: string;
  status: RuleApprovalStatus;
  classification: FindingClassification;
  severity: 'critical' | 'warning' | 'info';
  severityLevel?: RuleSeverityLevel;
  explanation: string;
  updatedAt: string;
  updatedBy?: string;
  updatedByRole?: string;
  // Extended traceability, scope, effective dates & versioning fields
  version?: number;
  versionHistory?: RuleVersionEntry[];
  sourceDocumentId?: string;
  sourceFilename?: string;
  sourceLocation?: string;
  sourceVersion?: string;
  evidenceExcerpt?: string;
  fullSourceContext?: string;
  mergedSources?: MergedSourceRef[];
  approvedBy?: string;
  approvedAt?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  supersedesRuleId?: string;
  supersededByRuleId?: string;
  scopeBrandIds?: string[];
  scopeCampaign?: string;
  revalidationRequired?: boolean;
  revalidatedAt?: string;
  affectedReportCountOnLastEdit?: number;
  structuredMeta?: {
    productName?: string;
    sku?: string;
    price?: string;
    promoPrice?: string;
    currency?: string;
    billingPeriod?: string;
    effectiveDate?: string;
    effectiveEndDate?: string;
    conditions?: string;
  };
}

export type CompanyTypeOption =
  | 'SaaS'
  | 'E-commerce'
  | 'Retail'
  | 'Fintech'
  | 'Healthcare'
  | 'Education'
  | 'Agency'
  | 'Other';

export interface BrandOnboardingProfile {
  companyName: string;
  companyType: CompanyTypeOption;
  description?: string;
  mainChannels: string[];
  preferredLanguage?: string;
  preferredTone?: string;
  suggestedCategories: ImportedKnowledgeCategory[];
  updatedAt: string;
}

export interface StructuredColumnMapping {
  productNameCol: string;
  skuCol: string;
  descriptionCol: string;
  priceCol: string;
  currencyCol: string;
  billingPeriodCol: string;
  approvedClaimsCol: string;
  sourceRefCol: string;
}

export interface StructuredRowValidationError {
  rowIndex: number; // 1-indexed data row
  rawRow: Record<string, string>;
  issues: string[];
  isValid: boolean;
}

export interface StructuredCataloguePreview {
  documentId: string;
  filename: string;
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  columnMapping: StructuredColumnMapping;
  validationResults: StructuredRowValidationError[];
  validRowCount: number;
  invalidRowCount: number;
}

export interface Organization {
  id: string;
  name: string;
  industry?: string;
  description?: string;
  createdAt: string;
}

export interface SourceDocument {
  id: string;
  orgId?: string;
  brandId: BrandId;
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'md' | 'image' | 'unsupported';
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedBy?: string;
  processingStatus: 'queued' | 'processed' | 'partial' | 'needs_attention' | 'failed';
  extractionStatus: 'complete' | 'partial_extraction' | 'structured_catalogue' | 'failed';
  pageOrSectionCount: number;
  chunksProcessed: number;
  unprocessedSections: string[];
  errorMessage?: string;
  isApprovedExample?: boolean;
  extractedCharCount?: number;
  extractedText?: string;
  extractedSections?: { title?: string; page?: number; content: string }[];
  structuredTables?: { sheetName?: string; headers: string[]; rows: any[] }[];
  candidateRuleIds?: string[];
  storagePath?: string;
  structuredCatalogue?: StructuredCataloguePreview;
}

export interface CompetingConflictOption {
  candidateId: string;
  value: string;
  ruleText: string;
  sourceDocumentId: string;
  sourceFilename: string;
  sourceLocation: string;
  effectiveDate?: string;
  evidenceExcerpt: string;
}

export interface KnowledgeCandidate {
  id: string;
  brandId: BrandId;
  category: ImportedKnowledgeCategory;
  engineCategory: RuleCategory;
  title: string;
  extractedRule: string;
  relevantValue: string;
  targetPatterns: string[];
  structuredMeta?: {
    productName?: string;
    sku?: string;
    price?: string;
    currency?: string;
    billingPeriod?: string;
    effectiveDate?: string;
    conditions?: string;
  };
  sourceDocumentId: string;
  sourceFilename: string;
  sourceLocation: string;
  evidenceExcerpt: string;
  fullSourceContext: string;
  status: CandidateReviewStatus;
  confidence?: 'high' | 'medium' | 'low';
  severity?: 'critical' | 'warning' | 'info';
  ruleStatement?: string;
  approvedValue?: string;
  // Duplicate & Conflict Tracking
  isDuplicate?: boolean;
  duplicateOfRuleId?: string;
  mergedSources?: MergedSourceRef[];
  conflictKey?: string;
  conflictTopic?: string;
  competingOptions?: CompetingConflictOption[];
  resolvedValue?: string;
  // Style / Example Tracking
  isFromApprovedExample?: boolean;
  contradictsExplicitRuleId?: string;
  contradictionNote?: string;
  // Audit trail
  reviewedBy?: string;
  reviewedAt?: string;
  promotedRuleId?: string;
  createdAt: string;
}

export interface ExtractedPdfRule {
  id: string;
  tempId?: string;
  title: string;
  category: RuleCategory;
  ruleStatement: string;
  targetPatterns: string[];
  approvedValue: string;
  severity: 'critical' | 'warning' | 'info';
  severityLevel?: RuleSeverityLevel;
  pageNumber?: string | number;
  sourcePage?: number;
  sourceDocumentName?: string;
  sourceSection?: string;
  sourceVerified?: boolean;
  evidenceExcerpt?: string;
  sourceExcerpt?: string;
  sourceRef: string;
  confidenceScore: number;
  needsManualReview?: boolean;
  status?: RuleApprovalStatus;
  isDuplicate?: boolean;
  duplicateOfRuleId?: string;
  isSelected?: boolean;
  explanation?: string;
}

export interface PdfRuleExtractionSummary {
  filename?: string;
  fileSizeBytes?: number;
  pageCount?: number;
  totalExtracted: number;
  highConfidenceCount: number;
  needsReviewCount: number;
  duplicateCount: number;
  aiUsed?: boolean;
  categoryBreakdown?: Record<string, number>;
  charCount?: number;
}

export interface ImportProcessingSummary {
  sessionId: string;
  timestamp: string;
  filesProcessedSuccessfully: number;
  filesNeedingAttention: number;
  candidateRulesExtracted: number;
  potentialDuplicatesCount: number;
  conflictingRulesCount: number;
  unprocessedSections: { filename: string; section: string; reason: string }[];
  categoriesCoverage: Record<ImportedKnowledgeCategory, 'found' | 'not_found'>;
  aiUsed: boolean;
  aiWarning?: string;
}

export interface SampleScenario {
  id: string;
  brandId: BrandId;
  title: string;
  badge: string;
  contentType: string;
  text: string;
  description: string;
}

export interface ApprovedBrandColor {
  name: string;
  hex: string;
  usage: 'primary' | 'secondary' | 'accent' | 'background';
  description?: string;
}

export interface ApprovedLogoRef {
  name: string;
  description: string;
  approvedVariants: string[];
  unapprovedVariants: string[];
  sourceRef: string;
}

export interface VisualGuideline {
  id: string;
  category: 'Logo & Lockup' | 'Color & Contrast' | 'Layout & Typography' | 'Accessibility';
  title: string;
  requirement: string;
  sourceRef: string;
}

export interface SampleAdImage {
  id: string;
  title: string;
  filename: string;
  assetPath: string;
  badge: string;
  description: string;
  expectedIssues: string[];
}

export type BrandProductStatus = 'Active' | 'Draft' | 'Unverified' | 'Deprecated' | 'Archived';

export interface BrandProduct {
  id: string;
  brandId: BrandId;
  name: string;
  aliases?: string[];
  brandName: string;
  subtitle: string;
  category: string;
  sku: string;
  status: BrandProductStatus;
  imageUrl?: string;
  description: string;
  specifications: string;
  price?: string;
  promoPrice?: string;
  promoValidUntil?: string;
  promoEffectiveStartDate?: string;
  promoEffectiveEndDate?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  priceVerified: boolean;
  packagingDetails: string;
  colors: string[];
  logoPlacement: string;
  visualIdentityNotes: string;
  approvedClaims: string[];
  prohibitedClaims: string[];
  sourceRef: string;
  sourceType: 'manual' | 'image_ocr' | 'product_lookup' | 'official_catalog';
  uncertainFields?: string[];
  version?: number;
  updatedAt: string;
}

export interface BrandProfile {
  id: BrandId;
  orgId?: string;
  name: string;
  fictionalLabel?: string;
  tagline?: string;
  industry?: string;
  description?: string;
  preferredLanguage?: string;
  website?: string;
  primaryColor?: string;
  approvedColors?: ApprovedBrandColor[];
  approvedLogoRef?: ApprovedLogoRef;
  visualGuidelines?: VisualGuideline[];
  onboarding?: BrandOnboardingProfile;
  rules: BrandRule[];
  products?: BrandProduct[];
  sourceDocuments?: SourceDocument[];
  knowledgeCandidates?: KnowledgeCandidate[];
  lastImportSummary?: ImportProcessingSummary;
  sampleScenarios?: SampleScenario[];
  sampleAdImages?: SampleAdImage[];
  brandDnaProfile?: BrandDnaProfile;
  brandDnaHistory?: BrandDnaProfile[];
  consistencyChecks?: BrandConsistencyCheckResult[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BoundingBox {
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  width: number; // percentage (0 - 100)
  height: number; // percentage (0 - 100)
  unit: 'percent' | 'pixels';
}

export interface FindingDecisionHistoryEntry {
  decision?: DecisionStatus;
  findingStatus?: FindingLifecycleStatus;
  editedReplacement?: string;
  rejectionReason?: string;
  reviewerComment?: string;
  decidedBy?: string;
  decidedByRole?: string;
  decidedAt?: string;
  previousDecision?: DecisionStatus;
  newDecision?: DecisionStatus;
  previousFindingStatus?: FindingLifecycleStatus;
  newFindingStatus?: FindingLifecycleStatus;
  actor?: string;
  actorRole?: string;
  reason?: string;
  contentVersion?: number;
  timestamp?: string;
}

export interface AuditFinding {
  id: string;
  auditId?: string;
  contentVersion?: number;
  classification: FindingClassification;
  findingStatus?: FindingLifecycleStatus;
  category: string;
  severity: 'critical' | 'warning' | 'info';
  originalSpan: string;
  startIndex: number;
  endIndex: number;
  conflictText: string;
  ruleId?: string;
  ruleVersion?: number;
  ruleTitle?: string;
  approvedRuleCitation: string;
  sourceReference?: string;
  sourceLocation?: string;
  evidenceSource?: string;
  evidenceVersion?: number;
  expectedValue?: string;
  observedValue?: string;
  explanation: string;
  suggestedReplacement?: string;
  requiresHumanReview: boolean;
  engine: 'deterministic' | 'gemini' | 'vision_ocr';
  validationState?: 'verified_deterministic' | 'validated_ai_reference' | 'downgraded_unverified' | 'conflict_requires_resolution';
  confidenceScore?: number;
  decision: DecisionStatus;
  editedReplacement?: string;
  rejectionReason?: string;
  reviewerComment?: string;
  decidedBy?: string;
  decidedByRole?: string;
  decisionBy?: string;
  decisionRole?: string;
  decidedAt?: string;
  decisionHistory?: FindingDecisionHistoryEntry[];
  introducedByCorrectionOfFindingId?: string;
  timestamp: string;
  // Image Review Extensions
  targetType?: 'text' | 'visual_element';
  visualElementLabel?: string;
  boundingBox?: BoundingBox;
  certainty?: 'confirmed' | 'needs_verification' | 'suggestion';
  designerRecommendation?: string;
}

export interface DraftVersion {
  versionNumber: number;
  contentText: string;
  changeSummary: string;
  createdBy: string;
  createdByRole: string;
  createdAt: string;
}

export interface VisualCheckSummary {
  detectedColors?: string[];
  detectedLogoVariant?: string;
  logoMatchesApproved?: boolean;
  layoutNotes?: string;
  accessibilityNotes?: string;
  colorPaletteCompliant?: boolean;
}

export interface GoverningRuleSnapshot {
  ruleId: string;
  version: number;
  approvedValue: string;
  sourceRef: string;
}

export interface GoverningProductSnapshot {
  sku: string;
  version: number;
  price?: string;
  promoPrice?: string;
  sourceRef: string;
}

export interface AuditGoverningContext {
  snapshotAt: string;
  activeRuleVersions: GoverningRuleSnapshot[];
  activeProductVersions: GoverningProductSnapshot[];
}

export interface AuditCheckOutcomes {
  documentExtraction: CheckOutcomeStatus;
  ocrExtraction: CheckOutcomeStatus;
  deterministicRules: CheckOutcomeStatus;
  productFactCheck: CheckOutcomeStatus;
  contextualAiCheck: CheckOutcomeStatus;
  visualBrandCheck: CheckOutcomeStatus;
}

export interface PublicationReadinessSummary {
  isReadyForStandardApproval: boolean;
  requiresExceptionApproval: boolean;
  blockers: string[];
}

export interface AuditReport {
  id: string;
  draftGroupId?: string;
  brandId: BrandId;
  brandName: string;
  campaign: string;
  contentType: string;
  title: string;
  sourceFilename?: string;
  originalText: string;
  currentText: string;
  versions: DraftVersion[];
  findings: AuditFinding[];
  toneSummary?: string;
  checksExecuted: {
    deterministic: boolean;
    deterministicRulesChecked: number;
    geminiContextual: boolean;
    geminiSuccess: boolean;
    geminiError?: string;
    ocrExecuted?: boolean;
    ocrSuccess?: boolean;
    visionExecuted?: boolean;
    visionSuccess?: boolean;
    visionError?: string;
  };
  checkOutcomes?: AuditCheckOutcomes;
  publicationReadiness?: PublicationReadinessSummary;
  governingContext?: AuditGoverningContext;
  // Image Review Attributes
  mediaType?: 'text' | 'document' | 'image';
  imageUrl?: string;
  imageMetadata?: {
    filename: string;
    mimeType: string;
    sizeBytes: number;
    width?: number;
    height?: number;
    format?: string;
  };
  extractedImageText?: string;
  extractionConfidence?: 'complete' | 'partial' | 'uncertain' | 'failed';
  visualAnalysisStatus?: 'complete' | 'incomplete' | 'failed' | 'not_applicable';
  visualSummary?: VisualCheckSummary;
  overallStatus: ReviewStatusOutcome;
  contentApprovalStatus: ContentApprovalStatus;
  contentApprovedBy?: string;
  contentApprovedByRole?: string;
  contentApprovedAt?: string;
  contentApprovalNotes?: string;
  submittedBy: string;
  submittedById?: string;
  submittedByRole: string;
  submittedByRoleKey: UserRole;
  workspaceId?: string;
  visibilityScope?: 'workspace' | 'private_creator' | 'private_draft';
  createdAt: string;
  completedAt?: string;
}

export interface AffectedDraftRef {
  reportId: string;
  title: string;
  contentType: string;
  submittedAt: string;
  matchedSpan: string;
}

export interface RecurringPattern {
  id: string;
  brandId: BrandId;
  brandName: string;
  category: string;
  ruleId: string;
  ruleVersion?: number;
  ruleTitle: string;
  ruleCitation: string;
  conflictSummary: string;
  occurrenceCount: number;
  distinctDraftCount: number;
  affectedDrafts: AffectedDraftRef[];
  affectedChannels: string[];
  firstSeen: string;
  lastSeen: string;
  thresholdTriggered: boolean;
  status: 'monitoring' | 'alert_active' | 'investigating' | 'resolved';
  rootCause?: RootCauseCategory;
  inferredRootCauseSuggestion?: RootCauseCategory;
  rootCauseNotes?: string;
  correctiveActionTaken?: string;
  investigatedBy?: string;
  actionDate?: string;
  recurredAfterAction?: boolean;
  postActionOccurrences?: number;
}

export interface RecurrenceThresholdConfig {
  minOccurrences: number;
  minDistinctDrafts: number;
  windowDays: number;
}

// ============================================================================
// BRAND DNA ANALYZER & CONSISTENCY CHECKER TYPES
// ============================================================================

export interface BrandDnaColor {
  name: string;
  hex: string;
  role: 'primary' | 'secondary' | 'accent' | 'background' | 'neutral';
  usageNotes: string;
  confidence: number; // 0.0 - 1.0
  sourceEvidence?: string;
}

export interface BrandDnaTypography {
  headingFont: string;
  bodyFont: string;
  monoFont?: string;
  hierarchyNotes: string;
  weightScale: string;
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaLogoUsage {
  detectedLogoUrl?: string;
  logoDescription: string;
  placementPattern: string;
  clearSpaceRule: string;
  prohibitedUsages: string[];
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaVisualIdentity {
  layoutPattern: string;
  spacingSystem: string;
  buttonAndComponentStyle: string;
  imageAndIllustrationStyle: string;
  designPatterns: string[];
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaVoice {
  toneAttributes: string[];
  writingStyle: string;
  preferredMessaging: string[];
  prohibitedPhrases: string[];
  sampleHeadlines: string[];
  confidence: number;
  sourceEvidence?: string;
}

export interface BrandDnaReferenceItem {
  id: string;
  type: 'website_page' | 'uploaded_image' | 'social_url';
  title: string;
  urlOrFilename: string;
  thumbnailUrl?: string;
  extractedSnippet?: string;
  analyzedAt: string;
}

export interface BrandDnaProfile {
  id: string;
  brandId: BrandId;
  brandName: string;
  sourceType: 'website' | 'social';
  sourceUrl?: string;
  analyzedAt: string;
  updatedAt: string;
  overallConfidence: number;
  extractionMethod:
    | 'live_html_css_plus_gemini'
    | 'live_html_css_deterministic'
    | 'vision_reference_plus_gemini'
    | 'vision_reference_deterministic';
  aiUsed: boolean;
  limitationNotice?: string;
  colors: BrandDnaColor[];
  typography: BrandDnaTypography;
  logoUsage: BrandDnaLogoUsage;
  visualIdentity: BrandDnaVisualIdentity;
  brandVoice: BrandDnaVoice;
  referenceContent: BrandDnaReferenceItem[];
  isSaved: boolean;
}

export type BrandConsistencyCategoryName =
  | 'Color Palette'
  | 'Typography'
  | 'Logo Usage'
  | 'Layout & Spacing'
  | 'Imagery & Style'
  | 'Brand Voice & Messaging';

export interface BrandConsistencyCategoryScore {
  category: BrandConsistencyCategoryName;
  score: number; // 0 - 100
  weight: number; // percentage weight summing to 100
  summary: string;
}

export interface BrandConsistencyIssue {
  id: string;
  category: BrandConsistencyCategoryName;
  issueType: 'objective_violation' | 'design_recommendation';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  detectedValue: string;
  approvedBrandRule: string;
  evidence: string;
  recommendedCorrection: string;
  selectedForFix?: boolean;
}

export interface BrandConsistencyCheckResult {
  id: string;
  brandId: BrandId;
  dnaProfileId: string;
  creativeTitle: string;
  filename: string;
  originalImageUrl: string;
  correctedImageUrl?: string;
  correctionAppliedSummary?: string[];
  overallScore: number; // 0 - 100
  scoringMethodology: string;
  categoryScores: BrandConsistencyCategoryScore[];
  issues: BrandConsistencyIssue[];
  extractedText: string;
  detectedDominantColors: string[];
  imageDimensions: { width: number; height: number };
  aiUsed: boolean;
  analyzedAt: string;
  approvalStatus?: 'pending' | 'approved' | 'revision_requested';
}

// ============================================================================
// BRAND RULE TESTER & AI-ASSISTED RULE AUTHORING TYPES
// ============================================================================

export interface RuleTestFinding {
  id: string;
  engine: 'deterministic' | 'ai_assessment';
  matchedPattern: string;
  matchedSpan: string;
  startIndex?: number;
  endIndex?: number;
  reason: string;
  suggestedFix: string;
  ruleSource: string;
  severity: RuleSeverityLevel;
  confidence?: number;
}

export interface RuleTestResult {
  passed: boolean;
  testedAt: string;
  ruleId: string;
  ruleTitle: string;
  ruleStatus: RuleApprovalStatus;
  enforcementNotice: string;
  inputType: 'text' | 'image';
  sampleTextEvaluated: string;
  deterministicMatches: RuleTestFinding[];
  aiAssessments: RuleTestFinding[];
  aiUsed: boolean;
  aiNote?: string;
}

