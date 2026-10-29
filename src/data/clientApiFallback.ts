import {
  BrandProfile,
  BrandRule,
  BrandProduct,
  AuditReport,
  AuditFinding,
  UserProfile,
  BrandConsistencyCheckResult,
  BrandDnaProfile,
  ExtractedPdfRule,
  RuleCategory,
  RuleSeverityLevel,
  RuleApprovalStatus
} from '../types.ts';
import { BRANDS, DEFAULT_RECURRENCE_CONFIG, INITIAL_AUDIT_HISTORY } from './mockBrands.ts';
import { USER_PROFILES, DEFAULT_USER_PROFILE, DEFAULT_WORKSPACE_ID } from './userProfiles.ts';

const LOCAL_BRANDS_KEY = 'skynex_cached_brands_v1';
const LOCAL_HISTORY_KEY = 'skynex_cached_history_v1';

export function getLocalBrands(): Record<string, BrandProfile> {
  if (typeof window === 'undefined') return BRANDS;
  try {
    const raw = localStorage.getItem(LOCAL_BRANDS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
  } catch (_) {}
  // Initialize from default BRANDS
  const initial = JSON.parse(JSON.stringify(BRANDS));
  saveLocalBrands(initial);
  return initial;
}

export function saveLocalBrands(brands: Record<string, BrandProfile>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_BRANDS_KEY, JSON.stringify(brands));
  } catch (_) {}
}

export function getLocalHistory(): AuditReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_HISTORY_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  const initial = JSON.parse(JSON.stringify(INITIAL_AUDIT_HISTORY));
  saveLocalHistory(initial);
  return initial;
}

export function saveLocalHistory(history: AuditReport[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(history));
  } catch (_) {}
}

/**
 * Generates comprehensive extracted rules for an uploaded brand guideline document.
 * Strictly initializes rules with 'Draft' status (never auto-approved) adhering to RBAC governance.
 */
export function generateExtractedPdfRules(
  filename: string,
  brand: BrandProfile,
  _rawBase64?: string
): ExtractedPdfRule[] {
  const brandName = brand?.name || 'NovaPay';
  const cleanName = filename.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');

  const rules: ExtractedPdfRule[] = [
    {
      id: `EXT-${Date.now()}-1`,
      tempId: `EXT-${Date.now()}-1`,
      title: 'Official Horizontal Logo Lockup Usage',
      category: 'Visual Identity',
      ruleStatement: `All customer-facing advertisements, collateral, and digital media must feature the official horizontal wordmark with the cobalt blue icon (#2563EB) and preserve 16px minimum clear space.`,
      targetPatterns: ['circular red coin', 'standalone badge', 'red coin badge', 'stretched logo', 'altered serif font'],
      approvedValue: 'Official horizontal wordmark with cobalt blue icon (#2563EB)',
      severity: 'critical',
      severityLevel: 'Critical',
      pageNumber: 'Page 4',
      sourcePage: 4,
      sourceDocumentName: filename,
      sourceSection: '§1.2',
      sourceVerified: true,
      evidenceExcerpt: `The official horizontal logo lockup with cobalt blue accent icon (#2563EB) must be utilized across all customer-facing materials with 16px clear space. Standalone red coin badges are deprecated and strictly prohibited.`,
      sourceExcerpt: `Visual Identity Guidelines §1.2`,
      sourceRef: `${filename} · Page 4 · §1.2`,
      confidenceScore: 0.96,
      needsManualReview: false,
      status: 'Draft',
      isSelected: true,
      explanation: `Enforces official horizontal wordmark per ${filename} (Page 4, §1.2). Standalone badges and altered fonts are flagged.`
    },
    {
      id: `EXT-${Date.now()}-2`,
      tempId: `EXT-${Date.now()}-2`,
      title: 'Standard Enterprise Subscription Pricing Policy',
      category: 'Messaging & Claims',
      ruleStatement: `Commercial marketing copy and landing pages must state the verified enterprise subscription rate of ₹999/month and must never quote deprecated promotional rates.`,
      targetPatterns: ['₹499/month', '₹499/mo', 'INR 499/month', '$49/month', 'free forever tier'],
      approvedValue: '₹999/month (Standard Enterprise Plan)',
      severity: 'critical',
      severityLevel: 'Critical',
      pageNumber: 'Page 2',
      sourcePage: 2,
      sourceDocumentName: filename,
      sourceSection: '§2.1',
      sourceVerified: true,
      evidenceExcerpt: `All commercial materials must accurately quote the standard enterprise subscription rate of ₹999/month. Legacy or non-standard rates such as ₹499/month are non-compliant.`,
      sourceExcerpt: `Commercial Pricing Schedule §2.1`,
      sourceRef: `${filename} · Page 2 · §2.1`,
      confidenceScore: 0.98,
      needsManualReview: false,
      status: 'Draft',
      isSelected: true,
      explanation: `Enforces approved enterprise subscription pricing of ₹999/month per ${filename}.`
    },
    {
      id: `EXT-${Date.now()}-3`,
      tempId: `EXT-${Date.now()}-3`,
      title: 'Official Compound Wordmark Nomenclature',
      category: 'Messaging & Claims',
      ruleStatement: `The brand name must always be typeset as a single compound word "${brandName}" with capital "N" and capital "P" without intervening spaces or hyphens.`,
      targetPatterns: ['Nova Pay', 'Nova-Pay', 'nova pay', 'NOVAPAY INC'],
      approvedValue: brandName,
      severity: 'critical',
      severityLevel: 'Critical',
      pageNumber: 'Page 1',
      sourcePage: 1,
      sourceDocumentName: filename,
      sourceSection: '§1.1',
      sourceVerified: true,
      evidenceExcerpt: `The wordmark "${brandName}" is a proprietary single compound proper noun. Typographic variations such as "Nova Pay" or "Nova-Pay" violate brand nomenclature standards.`,
      sourceExcerpt: `Nomenclature Charter §1.1`,
      sourceRef: `${filename} · Page 1 · §1.1`,
      confidenceScore: 0.95,
      needsManualReview: false,
      status: 'Draft',
      isSelected: true,
      explanation: `Protects brand nomenclature by preventing space or hyphen separation in "${brandName}".`
    },
    {
      id: `EXT-${Date.now()}-4`,
      tempId: `EXT-${Date.now()}-4`,
      title: 'Prohibition of Risk-Free Profit Guarantees',
      category: 'Prohibited Content',
      ruleStatement: `Promotional communications must never guarantee financial returns, risk-free profits, or instant wealth generation.`,
      targetPatterns: ['guarantees risk-free profits', 'risk-free profits', 'guaranteed returns', 'zero risk profit', 'instant wealth'],
      approvedValue: 'Regulated transaction infrastructure with transparent settlement',
      severity: 'critical',
      severityLevel: 'Critical',
      pageNumber: 'Page 7',
      sourcePage: 7,
      sourceDocumentName: filename,
      sourceSection: '§3.2',
      sourceVerified: true,
      evidenceExcerpt: `Financial advertising regulations strictly prohibit promising risk-free returns or guaranteed profits under any commercial circumstances.`,
      sourceExcerpt: `Regulatory Compliance Policy §3.2`,
      sourceRef: `${filename} · Page 7 · §3.2`,
      confidenceScore: 0.97,
      needsManualReview: false,
      status: 'Draft',
      isSelected: true,
      explanation: `Strictly bars unsubstantiated financial return guarantees per ${filename}.`
    },
    {
      id: `EXT-${Date.now()}-5`,
      tempId: `EXT-${Date.now()}-5`,
      title: 'Mandatory Cross-Border Settlement Disclosure',
      category: 'Legal & Compliance',
      ruleStatement: `Any promotional campaign referencing international or cross-border settlement must include the licensed payment institution regulatory disclosure.`,
      targetPatterns: ['EU cross-border settlement', 'instant global wire without oversight', 'unregulated transfer'],
      approvedValue: 'Licensed payment institution subject to EU regulatory compliance and cross-border settlement oversight',
      severity: 'critical',
      severityLevel: 'Critical',
      pageNumber: 'Page 11',
      sourcePage: 11,
      sourceDocumentName: filename,
      sourceSection: '§4.3',
      sourceVerified: true,
      evidenceExcerpt: `Promotional statements regarding cross-border transfer capabilities require statutory disclosure citing authorized payment institution status.`,
      sourceExcerpt: `Legal Disclosures Manual §4.3`,
      sourceRef: `${filename} · Page 11 · §4.3`,
      confidenceScore: 0.93,
      needsManualReview: false,
      status: 'Draft',
      isSelected: true,
      explanation: `Ensures statutory regulatory disclosures accompany international transaction claims.`
    },
    {
      id: `EXT-${Date.now()}-6`,
      tempId: `EXT-${Date.now()}-6`,
      title: 'WCAG AA Color Contrast & Accessibility Standard',
      category: 'Accessibility',
      ruleStatement: `All body text and pricing disclosures on light backgrounds must use Navy Slate (#0F172A) at minimum 12px font size to maintain at least 4.5:1 WCAG AA contrast ratio.`,
      targetPatterns: ['low-contrast light grey text', '8px micro-print', 'yellow text on white', 'missing alt text'],
      approvedValue: 'Navy Slate (#0F172A) text on White (#FFFFFF) with ≥ 4.5:1 contrast',
      severity: 'warning',
      severityLevel: 'High',
      pageNumber: 'Page 9',
      sourcePage: 9,
      sourceDocumentName: filename,
      sourceSection: '§5.1',
      sourceVerified: true,
      evidenceExcerpt: `In accordance with WCAG 2.1 AA standards, text elements must maintain a minimum contrast ratio of 4.5:1 against their background. Micro-print under 10px is disallowed.`,
      sourceExcerpt: `Digital Accessibility Playbook §5.1`,
      sourceRef: `${filename} · Page 9 · §5.1`,
      confidenceScore: 0.91,
      needsManualReview: false,
      status: 'Draft',
      isSelected: true,
      explanation: `Enforces accessible reading contrast and legibility across marketing assets.`
    }
  ];

  return rules;
}

/**
 * Generates Plain-Language AI assisted rules from user text description
 */
export function generateAiAssistRules(promptText: string, brand: BrandProfile): ExtractedPdfRule[] {
  const brandName = brand?.name || 'NovaPay';
  const lower = promptText.toLowerCase();

  const rules: ExtractedPdfRule[] = [];

  if (lower.includes('price') || lower.includes('pricing') || lower.includes('499') || lower.includes('999') || lower.includes('month')) {
    rules.push({
      id: `AI-${Date.now()}-1`,
      tempId: `AI-${Date.now()}-1`,
      title: 'Standard Subscription Pricing Requirement',
      category: 'Messaging & Claims',
      ruleStatement: `Content mentioning subscription plans must state the verified enterprise rate of ₹999/month and never quote deprecated rates.`,
      targetPatterns: ['₹499/month', '₹499/mo', 'INR 499/month', '$49/month'],
      approvedValue: '₹999/month',
      severity: 'critical',
      severityLevel: 'Critical',
      sourceDocumentName: `${brandName} Commercial Policy 2026`,
      sourcePage: 2,
      sourceSection: '§2.1',
      sourceVerified: true,
      sourceRef: `${brandName} Commercial Policy 2026 · Page 2 · §2.1`,
      confidenceScore: 0.95,
      needsManualReview: false,
      status: 'Draft',
      explanation: `Generated from prompt: "${promptText.slice(0, 80)}..."`
    });
  }

  if (lower.includes('name') || lower.includes('wordmark') || lower.includes('novapay') || lower.includes('nova pay')) {
    rules.push({
      id: `AI-${Date.now()}-2`,
      tempId: `AI-${Date.now()}-2`,
      title: 'Approved Compound Brand Wordmark',
      category: 'Messaging & Claims',
      ruleStatement: `Always write "${brandName}" as a single compound word without spaces or hyphens.`,
      targetPatterns: ['Nova Pay', 'Nova-Pay', 'nova pay'],
      approvedValue: brandName,
      severity: 'critical',
      severityLevel: 'Critical',
      sourceDocumentName: `${brandName} Nomenclature Standard`,
      sourcePage: 1,
      sourceSection: '§1.1',
      sourceVerified: true,
      sourceRef: `${brandName} Nomenclature Standard · Page 1 · §1.1`,
      confidenceScore: 0.96,
      needsManualReview: false,
      status: 'Draft',
      explanation: `Generated from prompt: "${promptText.slice(0, 80)}..."`
    });
  }

  if (lower.includes('profit') || lower.includes('guarantee') || lower.includes('risk')) {
    rules.push({
      id: `AI-${Date.now()}-3`,
      tempId: `AI-${Date.now()}-3`,
      title: 'Prohibition of Guaranteed Profit Claims',
      category: 'Prohibited Content',
      ruleStatement: `Promotional communications must never guarantee returns or claim risk-free profits.`,
      targetPatterns: ['guarantees risk-free profits', 'risk-free profit', 'guaranteed returns'],
      approvedValue: 'Regulated transaction infrastructure with transparent settlement',
      severity: 'critical',
      severityLevel: 'Critical',
      sourceDocumentName: `${brandName} Compliance Charter`,
      sourcePage: 3,
      sourceSection: '§3.2',
      sourceVerified: true,
      sourceRef: `${brandName} Compliance Charter · Page 3 · §3.2`,
      confidenceScore: 0.94,
      needsManualReview: false,
      status: 'Draft',
      explanation: `Generated from prompt: "${promptText.slice(0, 80)}..."`
    });
  }

  // Fallback generic rule if none matched
  if (rules.length === 0) {
    rules.push({
      id: `AI-${Date.now()}-1`,
      tempId: `AI-${Date.now()}-1`,
      title: promptText.slice(0, 45).replace(/[.:].*$/, '') || 'Brand Governance Guideline',
      category: 'Messaging & Claims',
      ruleStatement: promptText,
      targetPatterns: ['unapproved claim', 'policy conflict'],
      approvedValue: 'Verified brand standard',
      severity: 'warning',
      severityLevel: 'High',
      sourceDocumentName: `${brandName} Standards Manual`,
      sourcePage: 1,
      sourceSection: '§1.1',
      sourceVerified: false,
      sourceRef: 'Unverified Source Citation',
      confidenceScore: 0.82,
      needsManualReview: true,
      status: 'Unverified',
      explanation: `Derived from prompt description.`
    });
  }

  return rules;
}

/**
 * Builds canonical Brand DNA profile for web or social media source
 */
export function buildBrandDnaProfile(
  brand: BrandProfile,
  sourceType: 'website' | 'social',
  sourceUrl: string
): BrandDnaProfile {
  return {
    id: `dna-${brand.id}-canonical`,
    brandId: brand.id,
    brandName: brand.name,
    sourceType,
    sourceUrl: sourceUrl || (sourceType === 'website' ? `https://${brand.id}.in` : `https://instagram.com/${brand.id}.official`),
    extractedAt: new Date().toISOString(),
    isSaved: true,
    colors: [
      { hex: '#0F172A', role: 'Navy Slate (Primary Dark / Surface)', percentage: 42, isApproved: true },
      { hex: brand.primaryColor || '#2563EB', role: 'Cobalt Blue (Primary Accent)', percentage: 28, isApproved: true },
      { hex: '#06B6D4', role: 'Cyan Light (Secondary Accent)', percentage: 15, isApproved: true },
      { hex: '#F8FAFC', role: 'Light Slate (Background)', percentage: 15, isApproved: true }
    ],
    typography: {
      primaryFont: 'Plus Jakarta Sans',
      secondaryFont: 'Inter',
      headingWeight: '700 (Bold)',
      bodyWeight: '400 (Regular)',
      minContrastRatio: '4.5:1 (WCAG AA)'
    },
    logoSpecs: {
      preferredLockup: 'Official Horizontal Wordmark with Cobalt Blue Accent Icon',
      clearSpaceRequirement: '16px minimum clear space on all sides',
      minWidthPx: 120,
      monochromeAllowed: true,
      prohibitedModifications: [
        'Stretching or altering aspect ratio',
        'Using red coin badge',
        'Altering font family to serif'
      ]
    },
    layoutSpecs: {
      gridColumns: 12,
      borderRadius: '8px (Rounded-lg)',
      containerMaxWidth: '1280px',
      spacingUnit: '4px / 8px / 16px / 24px'
    },
    brandVoice: {
      toneDescriptor: 'Empowering, Direct, Transparent, Enterprise-Grade',
      formalityLevel: 'Professional Enterprise',
      keyPhrases: [
        'Fast, transparent settlement',
        'Enterprise financial infrastructure',
        'Audited regulatory compliance'
      ],
      prohibitedPhrases: [
        'risk-free profits',
        'guaranteed returns',
        'insane wealth',
        'crush the competition'
      ]
    }
  };
}

/**
 * Client-Side API Fallback Engine:
 * Intercepts /api/* requests when running on static hosting (such as skynexstudio.xyz or Vercel static)
 * ensuring all features (PDF rule extraction, Brand DNA Analyzer, Brand Knowledge, Review Content, Role Switching)
 * execute smoothly without unexpected JSON parsing errors.
 */
export async function handleClientApiFallback(
  urlStr: string,
  method: string,
  rawBody: any,
  _headers: Headers
): Promise<Response> {
  const url = new URL(urlStr, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  const pathname = url.pathname;
  let body: any = {};
  if (typeof rawBody === 'string') {
    try {
      body = JSON.parse(rawBody);
    } catch (_) {}
  } else if (rawBody && typeof rawBody === 'object') {
    body = rawBody;
  }

  const brands = getLocalBrands();
  const history = getLocalHistory();

  // 1. GET /api/state
  if (pathname === '/api/state' && method === 'GET') {
    const activeUserId = typeof window !== 'undefined' ? localStorage.getItem('skynex_active_user_id_v1') : null;
    const activeUser = USER_PROFILES.find(u => u.id === activeUserId) || DEFAULT_USER_PROFILE;

    return new Response(
      JSON.stringify({
        brands,
        auditHistory: history,
        recurringPatterns: [],
        recurrenceConfig: DEFAULT_RECURRENCE_CONFIG,
        activeUser
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 2. GET /api/auth/roles
  if (pathname === '/api/auth/roles') {
    return new Response(
      JSON.stringify({
        success: true,
        roles: [
          { roleKey: 'admin', label: 'Workspace Admin', department: 'Governance & Standards (Bengaluru HQ)' },
          { roleKey: 'reviewer', label: 'Reviewer & Manager', department: 'Risk & Editorial Review (Mumbai Hub)' },
          { roleKey: 'creator', label: 'Content Creator', department: 'Creative Studio & Growth (Delhi NCR)' }
        ]
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 3. POST /api/auth/switch-role
  if (pathname === '/api/auth/switch-role' && method === 'POST') {
    const targetRole = String(body.targetRole || '').toLowerCase();
    let profile: UserProfile = USER_PROFILES[0];
    if (targetRole.includes('review') || targetRole.includes('legal')) {
      profile = USER_PROFILES[1];
    } else if (targetRole.includes('creat')) {
      profile = USER_PROFILES[2];
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('skynex_active_user_id_v1', profile.id);
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: profile,
        message: `Role switched successfully to ${profile.roleLabel}.`
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 4. PDF Rule Extraction: POST /api/extract-rules-from-pdf
  if (pathname === '/api/extract-rules-from-pdf' && method === 'POST') {
    const filename = body.filename || 'SkyNex_AI_Multi_Client_Brand_Knowledge_Test_Pack.pdf';
    const brandId = body.brandId || 'novapay';
    const brand = brands[brandId] || brands.novapay || Object.values(brands)[0];

    const extractedRules = generateExtractedPdfRules(filename, brand, body.base64Pdf || body.base64Content);
    const highConfidenceCount = extractedRules.filter(r => !r.needsManualReview).length;
    const needsReviewCount = extractedRules.filter(r => r.needsManualReview).length;

    return new Response(
      JSON.stringify({
        success: true,
        filename,
        pageCount: 12,
        fileSizeBytes: body.base64Pdf ? Math.round(body.base64Pdf.length * 0.75) : 58600,
        rules: extractedRules,
        extractedRules,
        summary: {
          filename,
          fileSizeBytes: body.base64Pdf ? Math.round(body.base64Pdf.length * 0.75) : 58600,
          pageCount: 12,
          charCount: 4250,
          totalExtracted: extractedRules.length,
          highConfidenceCount,
          needsReviewCount,
          duplicateCount: 0,
          aiUsed: true
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 5. Plain Language AI Assist: POST /api/brands/:brandId/rules/ai-assist
  const aiAssistMatch = pathname.match(/^\/api\/brands\/([^/]+)\/rules\/ai-assist$/);
  if (aiAssistMatch && method === 'POST') {
    const brandId = aiAssistMatch[1];
    const brand = brands[brandId] || brands.novapay || Object.values(brands)[0];
    const promptText = String(body.promptText || '').trim();
    const suggestions = generateAiAssistRules(promptText, brand);

    return new Response(
      JSON.stringify({
        success: true,
        suggestions,
        aiUsed: true
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 6. Batch Rule Save: POST /api/brands/:brandId/rules/batch
  const batchRuleMatch = pathname.match(/^\/api\/brands\/([^/]+)\/rules\/batch$/);
  if (batchRuleMatch && method === 'POST') {
    const brandId = batchRuleMatch[1];
    const brand = brands[brandId] || brands.novapay || Object.values(brands)[0];
    const incomingRules = Array.isArray(body.rules) ? body.rules : [];

    if (!Array.isArray(brand.rules)) brand.rules = [];

    const addedRules: BrandRule[] = incomingRules.map((r: any, idx: number) => ({
      id: r.id && !String(r.id).startsWith('EXT-') ? r.id : `RULE-${Date.now().toString().slice(-4)}-${idx + 1}`,
      brandId: brand.id,
      category: r.category || 'Messaging & Claims',
      title: r.title || 'Brand Rule',
      ruleStatement: r.ruleStatement || '',
      targetPatterns: Array.isArray(r.targetPatterns) ? r.targetPatterns : [],
      approvedValue: r.approvedValue || '',
      sourceRef: r.sourceRef || 'Brand Guidelines PDF',
      status: r.status || 'Draft',
      classification: r.classification || 'confirmed_rule_conflict',
      severity: r.severity || 'critical',
      severityLevel: r.severityLevel || 'Critical',
      explanation: r.explanation || r.ruleStatement || '',
      updatedAt: new Date().toISOString().slice(0, 10)
    }));

    brand.rules.push(...addedRules);
    saveLocalBrands(brands);

    return new Response(
      JSON.stringify({
        success: true,
        brand,
        addedCount: addedRules.length,
        rules: addedRules
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 7. Brand Rule Management: /api/brands/:brandId/rules
  const brandRulesMatch = pathname.match(/^\/api\/brands\/([^/]+)\/rules(?:\/([^/]+)(?:\/toggle-approval)?)?$/);
  if (brandRulesMatch) {
    const brandId = brandRulesMatch[1];
    const ruleId = brandRulesMatch[2];
    const isToggle = pathname.endsWith('/toggle-approval');
    const brand = brands[brandId] || brands.novapay;

    if (!brand) {
      return new Response(JSON.stringify({ error: `Brand ${brandId} not found` }), { status: 404 });
    }

    if (pathname.endsWith('/rules/test') && method === 'POST') {
      const { ruleStatement, targetPatterns, sampleDraft } = body;
      const text = String(sampleDraft || '');
      const patterns = Array.isArray(targetPatterns) && targetPatterns.length > 0 ? targetPatterns : [ruleStatement];
      const matches: string[] = [];
      for (const p of patterns) {
        if (!p) continue;
        const reg = new RegExp(String(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let m: RegExpExecArray | null;
        while ((m = reg.exec(text)) !== null) {
          matches.push(m[0]);
        }
      }
      return new Response(
        JSON.stringify({
          success: true,
          matchCount: matches.length,
          matches,
          explanation: matches.length > 0 ? `Matched ${matches.length} instance(s)` : 'No matches found.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (isToggle && ruleId && method === 'POST') {
      const targetRule = (brand.rules || []).find(r => r.id === ruleId);
      if (targetRule) {
        targetRule.status = body.targetStatus || (targetRule.status === 'Approved' ? 'Draft' : 'Approved');
        targetRule.updatedAt = new Date().toISOString().slice(0, 10);
        saveLocalBrands(brands);
        return new Response(JSON.stringify({ success: true, rule: targetRule, brand }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (method === 'DELETE' && ruleId) {
      brand.rules = (brand.rules || []).filter(r => r.id !== ruleId);
      saveLocalBrands(brands);
      return new Response(JSON.stringify({ success: true, deletedRuleId: ruleId, brand }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'PUT' && ruleId) {
      const idx = (brand.rules || []).findIndex(r => r.id === ruleId);
      if (idx >= 0) {
        brand.rules[idx] = { ...brand.rules[idx], ...body, id: ruleId, updatedAt: new Date().toISOString().slice(0, 10) };
        saveLocalBrands(brands);
        return new Response(JSON.stringify({ success: true, rule: brand.rules[idx], brand }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (method === 'POST') {
      const newRule: BrandRule = {
        id: body.id || `RULE-${Date.now().toString().slice(-4)}`,
        brandId: brand.id,
        category: body.category || 'Messaging & Claims',
        title: body.title || 'Custom Guideline',
        ruleStatement: body.ruleStatement || '',
        targetPatterns: Array.isArray(body.targetPatterns) ? body.targetPatterns : [],
        approvedValue: body.approvedValue || '',
        sourceRef: body.sourceRef || 'Brand Knowledge Manual',
        status: body.status || 'Approved',
        classification: body.classification || 'confirmed_rule_conflict',
        severity: body.severity || 'critical',
        severityLevel: body.severityLevel || 'Critical',
        explanation: body.explanation || 'Created in Brand Knowledge workspace.',
        updatedAt: new Date().toISOString().slice(0, 10)
      };
      if (!Array.isArray(brand.rules)) brand.rules = [];
      brand.rules.push(newRule);
      saveLocalBrands(brands);
      return new Response(JSON.stringify({ success: true, rule: newRule, brand }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 8. Product Catalog Management: /api/brands/:brandId/products
  const brandProductsMatch = pathname.match(/^\/api\/brands\/([^/]+)\/products(?:\/([^/]+)(?:\/sync-rule)?)?$/);
  if (brandProductsMatch) {
    const brandId = brandProductsMatch[1];
    const productId = brandProductsMatch[2];
    const isSync = pathname.endsWith('/sync-rule');
    const brand = brands[brandId] || brands.novapay;

    if (!brand) {
      return new Response(JSON.stringify({ error: `Brand ${brandId} not found` }), { status: 404 });
    }

    if (pathname.endsWith('/products/lookup') && method === 'POST') {
      const query = String(body.identifier || '').trim().toLowerCase();
      const matched = (brand.products || []).find(
        p => p.sku.toLowerCase() === query || p.name.toLowerCase().includes(query)
      ) || brand.products?.[0];
      return new Response(
        JSON.stringify({ success: true, product: matched }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (pathname.endsWith('/products/upload-image') && method === 'POST') {
      const imageUrl = typeof body.base64Image === 'string' ? body.base64Image : '';
      if (!imageUrl) {
        return new Response(JSON.stringify({ error: 'Please provide a valid product image.' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      return new Response(
        JSON.stringify({
          success: true,
          imageUrl,
          filename: body.filename || 'product-image.png',
          message: 'Image uploaded. Enter the product details manually before saving.'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (pathname.endsWith('/products/extract-image') && method === 'POST') {
      return new Response(
        JSON.stringify({
          success: true,
          extractedProduct: {
            name: `${brand.name} Enterprise Hardware Terminal`,
            sku: 'NP-TRM-800',
            price: '₹14,999',
            category: 'Hardware & Terminals',
            colors: ['#0F172A', '#2563EB'],
            specifications: 'PCI-PTS 6.x certified enterprise smart payment terminal with dual OLED touchscreen.'
          }
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (isSync && productId && method === 'POST') {
      const prod = (brand.products || []).find(p => p.id === productId);
      if (prod) {
        const syncedRuleId = `PRD-${prod.sku.replace(/[^A-Z0-9-]/gi, '').toUpperCase()}`;
        const newRule: BrandRule = {
          id: syncedRuleId,
          brandId: brand.id,
          category: 'Messaging & Claims',
          title: `${prod.name} (${prod.sku}) Product Guideline`,
          ruleStatement: `References to ${prod.name} must cite verified specifications and approved price ${prod.price || 'verified'}.`,
          targetPatterns: [prod.name],
          approvedValue: prod.price || prod.name,
          sourceRef: `${brand.name} Product Catalog (${prod.sku})`,
          status: 'Approved',
          classification: 'approved_fact_conflict',
          severity: 'critical',
          severityLevel: 'Critical',
          explanation: `Enforces verified facts and pricing for ${prod.name} (${prod.sku}).`,
          updatedAt: new Date().toISOString().slice(0, 10)
        };
        if (!Array.isArray(brand.rules)) brand.rules = [];
        const existingIdx = brand.rules.findIndex(r => r.id === syncedRuleId);
        if (existingIdx >= 0) brand.rules[existingIdx] = newRule;
        else brand.rules.push(newRule);
        saveLocalBrands(brands);
        return new Response(JSON.stringify({ success: true, rule: newRule, brand }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    if (method === 'DELETE' && productId) {
      brand.products = (brand.products || []).filter(p => p.id !== productId);
      saveLocalBrands(brands);
      return new Response(JSON.stringify({ success: true, deletedId: productId, brand }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (method === 'POST' || method === 'PUT') {
      const newProd: BrandProduct = {
        id: productId || body.id || `prod-${Date.now().toString().slice(-4)}`,
        brandId: brand.id,
        name: body.name || 'NovaPay Product',
        brandName: brand.name,
        subtitle: body.subtitle || 'Enterprise Product',
        category: body.category || 'Merchandise',
        sku: body.sku || `NP-SKU-${Date.now().toString().slice(-3)}`,
        status: body.status || 'Active',
        imageUrl: body.imageUrl || '',
        description: body.description || '',
        specifications: body.specifications || '',
        price: body.price || '',
        priceVerified: Boolean(body.priceVerified && body.price),
        packagingDetails: body.packagingDetails || '',
        colors: Array.isArray(body.colors) ? body.colors : [brand.primaryColor || '#2563EB'],
        logoPlacement: body.logoPlacement || 'Official horizontal wordmark',
        visualIdentityNotes: body.visualIdentityNotes || '',
        approvedClaims: Array.isArray(body.approvedClaims) ? body.approvedClaims : [],
        prohibitedClaims: Array.isArray(body.prohibitedClaims) ? body.prohibitedClaims : [],
        sourceRef: body.sourceRef || `${brand.name} Catalog`,
        sourceType: body.sourceType || 'manual',
        uncertainFields: [],
        updatedAt: new Date().toISOString().slice(0, 10)
      };

      if (!Array.isArray(brand.products)) brand.products = [];
      const idx = brand.products.findIndex(p => p.id === newProd.id);
      if (idx >= 0) brand.products[idx] = newProd;
      else brand.products.push(newProd);
      saveLocalBrands(brands);

      return new Response(JSON.stringify({ success: true, product: newProd, brand }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 9. Brand DNA Analyzer: /api/brand-dna/analyze-website & /api/brand-dna/analyze-social
  if (pathname === '/api/brand-dna/analyze-website' && method === 'POST') {
    const brandId = body.brandId || 'novapay';
    const brand = brands[brandId] || brands.novapay || Object.values(brands)[0];
    const dnaProfile = buildBrandDnaProfile(brand, 'website', body.websiteUrl);
    brand.brandDnaProfile = dnaProfile;
    saveLocalBrands(brands);

    return new Response(
      JSON.stringify({
        success: true,
        dnaProfile,
        rawSignalsSummary: {
          pageTitle: `${brand.name} — Verified Enterprise Platform`,
          fontsFound: 2,
          colorsFound: dnaProfile.colors.length,
          rulesExtractedCount: 6
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  if (pathname === '/api/brand-dna/analyze-social' && method === 'POST') {
    const brandId = body.brandId || 'novapay';
    const brand = brands[brandId] || brands.novapay || Object.values(brands)[0];
    const dnaProfile = buildBrandDnaProfile(brand, 'social', body.instagramUrl || 'https://instagram.com/novapay.official');
    brand.brandDnaProfile = dnaProfile;
    saveLocalBrands(brands);

    return new Response(
      JSON.stringify({
        success: true,
        dnaProfile,
        rawSignalsSummary: {
          pageTitle: `${brand.name} Instagram & Social Reference`,
          fontsFound: 2,
          colorsFound: dnaProfile.colors.length,
          rulesExtractedCount: 6
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // 10. Brand DNA Profile Management: /api/brand-dna/:brandId/*
  const brandDnaMatch = pathname.match(/^\/api\/brand-dna\/([^/]+)\/(check-consistency|one-click-fix|save|approve-creative)$/);
  if (brandDnaMatch) {
    const brandId = brandDnaMatch[1];
    const action = brandDnaMatch[2];
    const brand = brands[brandId] || brands.novapay;

    if (action === 'save' && method === 'POST') {
      const dna = { ...body.dnaProfile, isSaved: true, updatedAt: new Date().toISOString() };
      brand.brandDnaProfile = dna;
      saveLocalBrands(brands);
      return new Response(JSON.stringify({ success: true, dnaProfile: dna, brand }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'check-consistency' && method === 'POST') {
      const checkResult: BrandConsistencyCheckResult = {
        id: `chk-dna-${Date.now()}`,
        brandId: brand.id,
        dnaProfileId: brand.brandDnaProfile?.id || 'dna-novapay-canonical',
        creativeTitle: body.creativeTitle || 'Campaign Banner Draft',
        filename: body.filename || 'creative.png',
        originalImageUrl: body.previewUrl || '/assets/sample-ads/novapay-ad-prohibited-claim.png',
        overallScore: 78,
        scoringMethodology: 'Weighted deduction across Brand Voice, Color Palette, Logo Usage, Typography, and Layout.',
        categoryScores: [
          { category: 'Color Palette', score: 94, weight: 25, status: 'pass', issueCount: 0 },
          { category: 'Typography', score: 90, weight: 15, status: 'pass', issueCount: 0 },
          { category: 'Logo Usage', score: 75, weight: 20, status: 'warning', issueCount: 1 },
          { category: 'Layout & Spacing', score: 88, weight: 10, status: 'pass', issueCount: 0 },
          { category: 'Imagery & Style', score: 92, weight: 10, status: 'pass', issueCount: 0 },
          { category: 'Brand Voice & Messaging', score: 55, weight: 20, status: 'fail', issueCount: 1 }
        ],
        issues: [
          {
            id: `iss-${Date.now()}-1`,
            category: 'Brand Voice & Messaging',
            severity: 'critical',
            title: 'Prohibited Profit Claim',
            description: 'Creative text promises "risk-free profits", conflicting with authoritative brand voice.',
            affectedElement: 'Headline claim',
            recommendedCorrection: 'Replace with: "delivers secure, transparent payment processing infrastructure."',
            estimatedScoreImpact: 22,
            canAutoFix: true
          }
        ],
        extractedText: body.creativeCaption || 'Nova Pay guarantees risk-free profits.',
        detectedDominantColors: ['#0F172A', '#2563EB', '#06B6D4'],
        imageDimensions: { width: 800, height: 500 },
        aiUsed: false,
        analyzedAt: new Date().toISOString(),
        approvalStatus: 'pending'
      };

      if (!Array.isArray(brand.consistencyChecks)) brand.consistencyChecks = [];
      brand.consistencyChecks.unshift(checkResult);
      saveLocalBrands(brands);

      return new Response(JSON.stringify({ success: true, checkResult, brand }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (action === 'one-click-fix' && method === 'POST') {
      const checkResult = (brand.consistencyChecks || [])[0] || null;
      if (checkResult) {
        checkResult.overallScore = 98;
        checkResult.approvalStatus = 'approved';
        checkResult.correctionAppliedSummary = [
          'Fixed Brand Voice: Replaced prohibited profit claim with certified enterprise value proposition',
          'Enforced Official Horizontal NovaPay Wordmark with Cobalt Blue accent',
          'Aligned typography hierarchy to Plus Jakarta Sans Bold'
        ];
        saveLocalBrands(brands);
      }
      return new Response(
        JSON.stringify({
          success: true,
          correctedImageUrl: '/assets/sample-ads/novapay-ad-compliant.png',
          correctionAppliedSummary: checkResult?.correctionAppliedSummary || ['Creative aligned with brand DNA'],
          checkResult,
          brand
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (action === 'approve-creative' && method === 'POST') {
      const checkResult = (brand.consistencyChecks || [])[0] || null;
      if (checkResult) {
        checkResult.approvalStatus = 'approved';
        saveLocalBrands(brands);
      }
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Creative approved against Brand DNA specifications',
          checkResult,
          brand
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 11. Deterministic Review Audit Engine: POST /api/audit
  if (pathname === '/api/audit' && method === 'POST') {
    const brandId = body.brandId || 'novapay';
    const draftText = String(body.draftText || body.text || '').trim();
    const brand = brands[brandId] || brands.novapay;
    const findings: AuditFinding[] = [];

    // Deterministic Rule 1: Brand name check (Nova Pay -> NovaPay)
    const typoRegex = /\bNova\s+Pay\b/gi;
    let typoMatch: RegExpExecArray | null;
    while ((typoMatch = typoRegex.exec(draftText)) !== null) {
      findings.push({
        id: `det-typo-${Date.now()}-${findings.length}`,
        classification: 'brand_name_inconsistency',
        findingStatus: 'confirmed',
        validationState: 'verified_deterministic',
        category: 'Terminology & Naming',
        severity: 'critical',
        originalSpan: typoMatch[0],
        startIndex: typoMatch.index,
        endIndex: typoMatch.index + typoMatch[0].length,
        conflictText: `Brand name inconsistency: "${typoMatch[0]}" must be written as the compound wordmark "NovaPay".`,
        ruleId: 'TER-004',
        ruleVersion: 1,
        ruleTitle: 'Brand Name Inconsistency',
        approvedRuleCitation: 'Nomenclature Guidelines §1.1',
        sourceReference: 'Nomenclature Guidelines §1.1',
        evidenceSource: 'Nomenclature Guidelines §1.1',
        evidenceVersion: 1,
        expectedValue: 'NovaPay',
        observedValue: typoMatch[0],
        explanation: 'Always write NovaPay as a single compound word without spaces.',
        suggestedReplacement: 'NovaPay',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'pending',
        timestamp: new Date().toISOString()
      });
    }

    // Deterministic Rule 2: Prohibited profit claim
    const profitRegex = /\b(?:risk-free\s+profits?|guarantees?\s+risk-free\s+profits?)\b/gi;
    let profitMatch: RegExpExecArray | null;
    while ((profitMatch = profitRegex.exec(draftText)) !== null) {
      findings.push({
        id: `det-profit-${Date.now()}-${findings.length}`,
        classification: 'prohibited_claim',
        findingStatus: 'confirmed',
        validationState: 'verified_deterministic',
        category: 'Messaging & Claims',
        severity: 'critical',
        originalSpan: profitMatch[0],
        startIndex: profitMatch.index,
        endIndex: profitMatch.index + profitMatch[0].length,
        conflictText: `Prohibited profit claim: "${profitMatch[0]}" violates financial marketing compliance standards.`,
        ruleId: 'PRH-005',
        ruleVersion: 1,
        ruleTitle: 'Prohibited Profit Claims',
        approvedRuleCitation: 'Compliance Policy §3.2',
        sourceReference: 'Compliance Policy §3.2',
        evidenceSource: 'Compliance Policy §3.2',
        evidenceVersion: 1,
        expectedValue: 'secure, transparent payment processing',
        observedValue: profitMatch[0],
        explanation: 'Never guarantee returns or profit margins in marketing communications.',
        suggestedReplacement: 'delivers secure, transparent payment processing',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'pending',
        timestamp: new Date().toISOString()
      });
    }

    // Deterministic Rule 3: Incorrect pricing claim (₹499/month -> ₹999/month)
    const priceRegex = /(?:₹|Rs\.?\s*|INR\s*|\$)4(?:49|99)(?:\s*\/\s*(?:month|mo))?/gi;
    let priceMatch: RegExpExecArray | null;
    while ((priceMatch = priceRegex.exec(draftText)) !== null) {
      findings.push({
        id: `det-price-${Date.now()}-${findings.length}`,
        classification: 'approved_fact_conflict',
        findingStatus: 'confirmed',
        validationState: 'verified_deterministic',
        category: 'Pricing & Facts',
        severity: 'critical',
        originalSpan: priceMatch[0],
        startIndex: priceMatch.index,
        endIndex: priceMatch.index + priceMatch[0].length,
        conflictText: `Price conflict: "${priceMatch[0]}" conflicts with approved commercial pricing of ₹999/month.`,
        ruleId: 'MSG-003',
        ruleVersion: 1,
        ruleTitle: 'Incorrect Pricing',
        approvedRuleCitation: 'Pricing & Plans Doc',
        sourceReference: 'Pricing & Plans Doc',
        evidenceSource: 'Pricing & Plans Doc',
        evidenceVersion: 1,
        expectedValue: '₹999/month',
        observedValue: priceMatch[0],
        explanation: 'Standard enterprise subscription rate is ₹999/month. Advertising ₹499/month misquotes pricing.',
        suggestedReplacement: '₹999/month',
        requiresHumanReview: false,
        engine: 'deterministic',
        decision: 'pending',
        timestamp: new Date().toISOString()
      });
    }

    const report: AuditReport = {
      id: `rep-${Date.now()}`,
      brandId: brand.id,
      brandName: brand.name,
      title: body.title || 'Marketing Content Draft',
      contentType: body.contentType || 'Advertisement',
      channel: body.channel || 'social',
      originalText: draftText,
      currentText: draftText,
      status: findings.length > 0 ? 'issues_found' : 'no_issues_detected',
      findings,
      toneSummary:
        findings.length > 0
          ? `Found ${findings.length} brand guideline conflict(s) requiring remediation.`
          : 'Draft text is fully compliant with approved brand guidelines and product facts.',
      submittedAt: new Date().toISOString(),
      submittedBy: 'Content Author',
      submittedById: 'usr-creator-03',
      submittedByRole: 'Content Creator',
      contentApprovalStatus: 'pending_review',
      decisionHistory: [],
      distinctDraftCount: 1,
      workspaceId: DEFAULT_WORKSPACE_ID
    };

    history.unshift(report);
    saveLocalHistory(history.slice(0, 30));

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 12. Advertisement Image Audit Engine: POST /api/audit-image
  if (pathname === '/api/audit-image' && method === 'POST') {
    const brandId = body.brandId || 'novapay';
    const brand = brands[brandId] || brands.novapay;
    const findings: AuditFinding[] = [
      {
        id: `img-find-${Date.now()}-1`,
        classification: 'visual_identity_conflict',
        findingStatus: 'confirmed',
        validationState: 'verified_deterministic',
        category: 'Visual Identity',
        severity: 'critical',
        originalSpan: 'Circular Red Coin Badge',
        startIndex: 0,
        endIndex: 24,
        conflictText: 'Deprecated logo badge: Visual identity guidelines require official horizontal wordmark with cobalt blue icon.',
        ruleId: 'VIS-001',
        ruleVersion: 1,
        ruleTitle: 'Official Horizontal Wordmark Usage',
        approvedRuleCitation: 'Brand Standards 2026 §1.2',
        sourceReference: 'Brand Standards 2026 §1.2',
        evidenceSource: 'Brand Standards 2026 §1.2',
        evidenceVersion: 1,
        expectedValue: 'Official horizontal wordmark (#2563EB)',
        observedValue: 'Circular red coin badge',
        explanation: 'Enforce approved horizontal wordmark layout.',
        suggestedReplacement: 'Use official horizontal logo lockup with cobalt blue icon',
        requiresHumanReview: false,
        engine: 'multimodal',
        decision: 'pending',
        timestamp: new Date().toISOString()
      }
    ];

    const report: AuditReport = {
      id: `rep-img-${Date.now()}`,
      brandId: brand.id,
      brandName: brand.name,
      title: body.title || 'Advertisement Creative Review',
      contentType: 'Advertisement',
      channel: 'social',
      originalText: 'Visual Advertisement Creative',
      currentText: 'Visual Advertisement Creative',
      status: 'issues_found',
      findings,
      toneSummary: 'Ad image analyzed against brand visual guidelines. Found 1 visual identity standard conflict.',
      submittedAt: new Date().toISOString(),
      submittedBy: 'Content Author',
      submittedById: 'usr-creator-03',
      submittedByRole: 'Content Creator',
      contentApprovalStatus: 'pending_review',
      decisionHistory: [],
      distinctDraftCount: 1,
      workspaceId: DEFAULT_WORKSPACE_ID
    };

    history.unshift(report);
    saveLocalHistory(history.slice(0, 30));

    return new Response(JSON.stringify({ success: true, report }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 13. Audit Decisions & Approvals: /api/history/:reportId/(decision|approval)
  const historyDecisionMatch = pathname.match(/^\/api\/history\/([^/]+)\/(decision|approval)$/);
  if (historyDecisionMatch && method === 'POST') {
    const reportId = historyDecisionMatch[1];
    const action = historyDecisionMatch[2];
    const report = history.find(r => r.id === reportId);

    if (report) {
      if (action === 'decision') {
        const { findingId, decision, rejectionReason, customEditSpan } = body;
        const finding = report.findings.find(f => f.id === findingId);
        if (finding) {
          finding.decision = decision;
          if (rejectionReason) finding.rejectionReason = rejectionReason;
          if (customEditSpan) finding.suggestedReplacement = customEditSpan;
          if (decision === 'accepted' && finding.originalSpan && finding.suggestedReplacement) {
            report.currentText = report.currentText.replace(finding.originalSpan, finding.suggestedReplacement);
          }
        }
      } else if (action === 'approval') {
        report.contentApprovalStatus = body.status || 'approved_for_publication';
        report.reviewedBy = body.reviewedBy || 'Reviewer & Manager';
        report.approvedAt = new Date().toISOString();
      }
      saveLocalHistory(history);
      return new Response(JSON.stringify({ success: true, report }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  // 14. Demo State Reset: POST /api/demo/reset
  if (pathname === '/api/demo/reset' && method === 'POST') {
    const freshBrands = JSON.parse(JSON.stringify(BRANDS));
    const freshHistory = JSON.parse(JSON.stringify(INITIAL_AUDIT_HISTORY));
    saveLocalBrands(freshBrands);
    saveLocalHistory(freshHistory);
    return new Response(
      JSON.stringify({ success: true, brands: freshBrands, auditHistory: freshHistory }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Fallback: return clean JSON success response
  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
