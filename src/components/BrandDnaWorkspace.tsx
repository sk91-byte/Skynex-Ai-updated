import React, { useState, useRef, useEffect } from 'react';
import {
  Globe,
  Instagram,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UploadCloud,
  Palette,
  Type as TypeIcon,
  Scan,
  Layout,
  MessageSquare,
  FileText,
  Save,
  RefreshCw,
  Loader2,
  Check,
  X,
  Plus,
  Trash2,
  Download,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Edit3,
  Eye,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import {
  BrandProfile,
  BrandDnaProfile,
  BrandDnaColor,
  BrandConsistencyCheckResult,
  UserProfile
} from '../types.ts';
import { DEFAULT_USER_PROFILE, apiFetch as fetch } from '../data/userProfiles.ts';

interface BrandDnaWorkspaceProps {
  activeBrand: BrandProfile;
  currentUser?: UserProfile;
  onBrandUpdated: (updatedBrand: BrandProfile) => void;
  triggerToast: (text: string, type?: 'info' | 'error' | 'success') => void;
}

export default function BrandDnaWorkspace({
  activeBrand,
  currentUser = DEFAULT_USER_PROFILE,
  onBrandUpdated,
  triggerToast
}: BrandDnaWorkspaceProps) {
  const canManageBrandAssets = Boolean(currentUser?.permissions?.canManageBrandAssets || currentUser?.permissions?.canManageRules);
  const canFinalizeReview = Boolean(currentUser?.permissions?.canFinalizeReview);
  // Source Mode: 'website' | 'social'
  const [sourceMode, setSourceMode] = useState<'website' | 'social'>('website');

  // Website Analysis Input State
  const [websiteUrl, setWebsiteUrl] = useState<string>(
    activeBrand.brandDnaProfile?.sourceType === 'website' && activeBrand.brandDnaProfile?.sourceUrl
      ? activeBrand.brandDnaProfile.sourceUrl
      : `${window.location.origin}/sample-brand-site/${activeBrand.id === 'novapay' ? 'novapay' : 'astrafin'}`
  );
  const [isAnalyzingWebsite, setIsAnalyzingWebsite] = useState<boolean>(false);
  const [analysisStepText, setAnalysisStepText] = useState<string>('');
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Social Media Analysis Input State
  const [instagramUrl, setInstagramUrl] = useState<string>('');
  const [socialCaptionSample, setSocialCaptionSample] = useState<string>('');
  const [socialRefImages, setSocialRefImages] = useState<
    { filename: string; base64Data: string; previewUrl: string }[]
  >([]);
  const [isAnalyzingSocial, setIsAnalyzingSocial] = useState<boolean>(false);
  const socialFileInputRef = useRef<HTMLInputElement>(null);

  // Active Working Brand DNA Profile (Editable before & after saving)
  const [workingDna, setWorkingDna] = useState<BrandDnaProfile | null>(
    activeBrand.brandDnaProfile || null
  );
  const [activeDnaTab, setActiveDnaTab] = useState<
    'colors' | 'typography' | 'logo' | 'visual' | 'voice' | 'references'
  >('colors');
  const [isEditingDna, setIsEditingDna] = useState<boolean>(false);
  const [isSavingDna, setIsSavingDna] = useState<boolean>(false);

  // New Content Consistency Checker State
  const [creativeTitle, setCreativeTitle] = useState<string>('Campaign Social Banner Draft');
  const [creativeCaption, setCreativeCaption] = useState<string>('');
  const [creativeFileName, setCreativeFileName] = useState<string>('');
  const [creativeBase64, setCreativeBase64] = useState<string>('');
  const [creativePreviewUrl, setCreativePreviewUrl] = useState<string>('');
  const [isCheckingConsistency, setIsCheckingConsistency] = useState<boolean>(false);
  const [consistencyError, setConsistencyError] = useState<string | null>(null);
  const [activeCheckResult, setActiveCheckResult] = useState<BrandConsistencyCheckResult | null>(
    activeBrand.consistencyChecks?.[0] || null
  );
  const [selectedIssueIds, setSelectedIssueIds] = useState<Set<string>>(new Set());
  const creativeInputRef = useRef<HTMLInputElement>(null);

  // One-Click Change State
  const [isApplyingFix, setIsApplyingFix] = useState<boolean>(false);
  const [fixError, setFixError] = useState<string | null>(null);

  // Sync workingDna and activeCheckResult when switching brands
  useEffect(() => {
    setWorkingDna(activeBrand.brandDnaProfile || null);
    const latestCheck = activeBrand.consistencyChecks?.[0] || null;
    setActiveCheckResult(latestCheck);
    if (latestCheck) {
      setSelectedIssueIds(new Set(latestCheck.issues.map(i => i.id)));
    } else {
      setSelectedIssueIds(new Set());
    }
    setAnalysisError(null);
    setConsistencyError(null);
    setFixError(null);
    setWebsiteUrl(
      activeBrand.brandDnaProfile?.sourceType === 'website' && activeBrand.brandDnaProfile?.sourceUrl
        ? activeBrand.brandDnaProfile.sourceUrl
        : `${window.location.origin}/sample-brand-site/${activeBrand.id === 'novapay' ? 'novapay' : 'astrafin'}`
    );
  }, [activeBrand.id, activeBrand.brandDnaProfile]);

  // ---------------------------------------------------------------------------
  // 1. WEBSITE BRAND DNA ANALYSIS
  // ---------------------------------------------------------------------------
  const handleAnalyzeWebsite = async (e?: React.FormEvent, overrideUrl?: string) => {
    if (e) e.preventDefault();
    const targetUrl = (overrideUrl ?? websiteUrl).trim();
    if (!targetUrl) {
      setAnalysisError('Please enter a company website URL to analyze.');
      return;
    }

    setIsAnalyzingWebsite(true);
    setAnalysisError(null);
    setAnalysisStepText('Validating URL & checking SSRF security policies...');

    const t1 = setTimeout(() => {
      setAnalysisStepText('Fetching live public HTML and linked CSS stylesheets...');
    }, 500);
    const t2 = setTimeout(() => {
      setAnalysisStepText('Extracting color swatches, font families, logo lockup, and brand voice...');
    }, 1200);

    try {
      const res = await fetch('/api/brand-dna/analyze-website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: activeBrand.id,
          websiteUrl: targetUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Could not analyze the specified website URL.');
      }

      setWorkingDna(data.dnaProfile);
      setIsEditingDna(false);
      triggerToast(
        `Extracted Brand DNA from "${data.rawSignalsSummary?.pageTitle || targetUrl}" (${data.dnaProfile.colors.length} colors, ${data.rawSignalsSummary?.fontsFound || 1} font families). Review and save below!`,
        'success'
      );
    } catch (err: any) {
      setAnalysisError(err?.message || 'Website analysis failed.');
      triggerToast(`Website analysis failed: ${err?.message}`, 'error');
    } finally {
      clearTimeout(t1);
      clearTimeout(t2);
      setIsAnalyzingWebsite(false);
      setAnalysisStepText('');
    }
  };

  // ---------------------------------------------------------------------------
  // 2. INSTAGRAM / SOCIAL MEDIA BRAND DNA ANALYSIS
  // ---------------------------------------------------------------------------
  const handleSocialFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAnalysisError(null);

    const remainingSlots = Math.max(0, 6 - socialRefImages.length);
    const selectedFiles = Array.from(files).slice(0, remainingSlots);

    selectedFiles.forEach(file => {
      if (!file.type.startsWith('image/')) {
        setAnalysisError(`File "${file.name}" is not a supported image format.`);
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setAnalysisError(`File "${file.name}" exceeds the 10 MB size limit.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const resultStr = reader.result as string;
        setSocialRefImages(prev => [
          ...prev,
          {
            filename: file.name,
            base64Data: resultStr,
            previewUrl: resultStr
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleLoadSampleSocialPosts = async () => {
    try {
      setAnalysisError(null);
      setIsAnalyzingSocial(true);
      setAnalysisStepText('Loading official sample social reference posts...');
      const samplePaths = [
        { path: '/assets/sample-ads/novapay-ad-compliant.png', name: 'novapay-social-post-1.png' }
      ];
      const loaded: { filename: string; base64Data: string; previewUrl: string }[] = [];

      for (const sp of samplePaths) {
        const res = await fetch(sp.path);
        if (!res.ok) throw new Error('Could not load sample social post asset');
        const blob = await res.blob();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        loaded.push({
          filename: sp.name,
          base64Data: dataUrl,
          previewUrl: dataUrl
        });
      }

      setSocialRefImages(loaded);
      setInstagramUrl('https://www.instagram.com/novapay.official/');
      setSocialCaptionSample(
        'NovaPay — Fast, secure payment processing for modern enterprises. Subscribe today for ₹999/month.'
      );
      triggerToast('Loaded sample social reference post. Click "Analyze Social Reference Content" to extract Brand DNA.', 'info');
    } catch (err: any) {
      setAnalysisError(`Could not load sample reference posts: ${err?.message}`);
    } finally {
      setIsAnalyzingSocial(false);
      setAnalysisStepText('');
    }
  };

  const handleAnalyzeSocial = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzingSocial(true);
    setAnalysisError(null);
    setAnalysisStepText('Inspecting reference images, extracting color histograms & OCR copy...');

    try {
      const res = await fetch('/api/brand-dna/analyze-social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: activeBrand.id,
          instagramUrl: instagramUrl.trim(),
          referenceImages: socialRefImages.map(img => ({
            filename: img.filename,
            base64Data: img.base64Data
          })),
          captionSample: socialCaptionSample.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Social media analysis failed.');
      }

      setWorkingDna(data.dnaProfile);
      setIsEditingDna(false);
      triggerToast(
        `Extracted Brand DNA from ${socialRefImages.length} social reference post(s). Review and save your profile below!`,
        'success'
      );
    } catch (err: any) {
      setAnalysisError(err?.message || 'Social media analysis could not be completed.');
      triggerToast(err?.message || 'Social analysis requires reference images', 'error');
    } finally {
      setIsAnalyzingSocial(false);
      setAnalysisStepText('');
    }
  };

  // ---------------------------------------------------------------------------
  // 3. EDIT & SAVE BRAND DNA PROFILE
  // ---------------------------------------------------------------------------
  const handleSaveBrandDnaProfile = async () => {
    if (!workingDna) return;
    setIsSavingDna(true);
    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dnaProfile: workingDna })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save Brand DNA Profile');

      setWorkingDna(data.dnaProfile);
      setIsEditingDna(false);
      onBrandUpdated(data.brand);
      triggerToast(`Saved Brand DNA Profile for ${activeBrand.name} persistently!`, 'success');
    } catch (err: any) {
      triggerToast(`Failed to save Brand DNA Profile: ${err?.message}`, 'error');
    } finally {
      setIsSavingDna(false);
    }
  };

  const handleUpdateColor = (idx: number, updates: Partial<BrandDnaColor>) => {
    if (!workingDna) return;
    const nextColors = workingDna.colors.map((c, i) => (i === idx ? { ...c, ...updates } : c));
    setWorkingDna({ ...workingDna, colors: nextColors, isSaved: false });
  };

  const handleAddColorSwatch = () => {
    if (!workingDna) return;
    const newSwatch: BrandDnaColor = {
      name: 'Custom Brand Swatch',
      hex: '#3B82F6',
      role: 'accent',
      usageNotes: 'Custom added brand color token',
      confidence: 1.0,
      sourceEvidence: 'Manual Brand Manager configuration'
    };
    setWorkingDna({
      ...workingDna,
      colors: [...workingDna.colors, newSwatch],
      isSaved: false
    });
  };

  const handleRemoveColorSwatch = (idx: number) => {
    if (!workingDna || workingDna.colors.length <= 1) return;
    setWorkingDna({
      ...workingDna,
      colors: workingDna.colors.filter((_, i) => i !== idx),
      isSaved: false
    });
  };

  // ---------------------------------------------------------------------------
  // 4. NEW CONTENT CONSISTENCY CHECKER
  // ---------------------------------------------------------------------------
  const handleCreativeFileSelected = (file: File | undefined) => {
    if (!file) return;
    setConsistencyError(null);
    if (!file.type.startsWith('image/')) {
      setConsistencyError('Please select a valid image file (PNG, JPG, or WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setConsistencyError('File size exceeds the 10 MB limit.');
      return;
    }
    setCreativeFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const resultStr = reader.result as string;
      setCreativeBase64(resultStr);
      setCreativePreviewUrl(resultStr);
    };
    reader.readAsDataURL(file);
  };

  const handleLoadSampleCreativeForCheck = async (variant: 'off_brand' | 'compliant') => {
    try {
      setConsistencyError(null);
      const assetPath =
        variant === 'off_brand'
          ? '/assets/sample-ads/novapay-ad-wrong-logo.png'
          : '/assets/sample-ads/novapay-ad-compliant.png';
      const fileName =
        variant === 'off_brand'
          ? 'novapay-ad-wrong-logo.png'
          : 'novapay-ad-compliant.png';

      const res = await fetch(assetPath);
      if (!res.ok) throw new Error('Sample creative asset not found');
      const blob = await res.blob();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      setCreativeFileName(fileName);
      setCreativeBase64(dataUrl);
      setCreativePreviewUrl(dataUrl);
      setCreativeTitle(
        variant === 'off_brand'
          ? 'Q4 Promo Draft (Unapproved Logo & Red Palette)'
          : 'Q4 Official Brand-Compliant Banner'
      );
      setCreativeCaption(
        variant === 'off_brand'
          ? 'Nova Pay guarantees risk-free profits! Subscribe for ₹499/month.'
          : 'NovaPay — Fast, secure payment processing. Subscribe for ₹999/month.'
      );
      triggerToast(
        `Loaded "${fileName}". Click "Check Brand Consistency" to evaluate against saved Brand DNA!`,
        'info'
      );
    } catch (err: any) {
      setConsistencyError(`Could not load sample creative: ${err?.message}`);
    }
  };

  const handleRunConsistencyCheck = async () => {
    if (!activeBrand.brandDnaProfile && workingDna) {
      // Auto-save workingDna first so backend has the profile
      await handleSaveBrandDnaProfile();
    }
    if (!creativeBase64) {
      setConsistencyError('Please upload a creative image or load a sample creative first.');
      return;
    }

    setIsCheckingConsistency(true);
    setConsistencyError(null);
    setFixError(null);

    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/check-consistency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: creativeFileName || 'creative.png',
          base64Image: creativeBase64,
          creativeTitle: creativeTitle.trim() || 'Uploaded Creative',
          captionText: creativeCaption.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Consistency check failed');

      setActiveCheckResult(data.checkResult);
      setSelectedIssueIds(new Set((data.checkResult.issues || []).map((i: any) => i.id)));
      onBrandUpdated(data.brand);
      triggerToast(
        `Consistency check complete: Score ${data.checkResult.overallScore}/100 (${data.checkResult.issues.length} issue(s) found).`,
        data.checkResult.overallScore >= 85 ? 'success' : 'info'
      );
    } catch (err: any) {
      setConsistencyError(err?.message || 'Consistency check failed.');
      triggerToast(`Consistency check failed: ${err?.message}`, 'error');
    } finally {
      setIsCheckingConsistency(false);
    }
  };

  // ---------------------------------------------------------------------------
  // 5. ONE-CLICK CHANGE: FIX BRAND INCONSISTENCIES
  // ---------------------------------------------------------------------------
  const handleToggleIssueForFix = (issueId: string) => {
    setSelectedIssueIds(prev => {
      const next = new Set(prev);
      if (next.has(issueId)) next.delete(issueId);
      else next.add(issueId);
      return next;
    });
  };

  const handleApplyOneClickFix = async () => {
    if (!activeCheckResult) return;
    if (selectedIssueIds.size === 0) {
      setFixError('Please select at least one detected issue to remediate.');
      return;
    }

    setIsApplyingFix(true);
    setFixError(null);

    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/one-click-fix`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkId: activeCheckResult.id,
          selectedIssueIds: Array.from(selectedIssueIds)
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate corrected creative');

      setActiveCheckResult(data.checkResult);
      onBrandUpdated(data.brand);
      triggerToast(
        `One-Click Change complete! Generated brand-compliant creative with ${data.correctionAppliedSummary?.length || 1} remediation(s).`,
        'success'
      );
    } catch (err: any) {
      setFixError(err?.message || 'One-Click Change failed.');
      triggerToast(`One-Click Change failed: ${err?.message}`, 'error');
    } finally {
      setIsApplyingFix(false);
    }
  };

  const handleApproveCreative = async (status: 'approved' | 'revision_requested') => {
    if (!activeCheckResult) return;
    try {
      const res = await fetch(`/api/brand-dna/${activeBrand.id}/approve-creative`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkId: activeCheckResult.id,
          approvalStatus: status
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not update approval status');
      setActiveCheckResult(data.checkResult);
      onBrandUpdated(data.brand);
      triggerToast(
        status === 'approved'
          ? 'Approved corrected creative for campaign publication!'
          : 'Marked creative for designer revision.',
        'success'
      );
    } catch (err: any) {
      triggerToast(`Failed to update status: ${err?.message}`, 'error');
    }
  };

  const hasSavedProfile = Boolean(activeBrand.brandDnaProfile?.isSaved);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* ================================================================= */}
      {/* 1. SECTION HEADER & WORKFLOW BAR                                  */}
      {/* ================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand DNA Analyzer</h1>
          <p className="text-xs font-semibold text-blue-600 mt-0.5">
            Learn your brand. Maintain consistency. Create with confidence.
          </p>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">
            Analyze your company’s live website or social media reference content to extract a structured Brand DNA Profile (colors, typography, logo usage, visual patterns, and voice), then check new creatives and apply One-Click Change remediations.
          </p>
        </div>

        {/* Saved Profile Status & Quick Re-analyze */}
        <div className="flex items-center gap-2.5 shrink-0">
          {hasSavedProfile ? (
            <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold leading-tight">Saved Brand DNA Active</div>
                <div className="text-[10px] text-emerald-700">
                  {activeBrand.name} · Updated {activeBrand.brandDnaProfile?.updatedAt.slice(0, 10)}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2">
              <InfoIcon />
              <span>No Brand DNA saved for {activeBrand.name} yet</span>
            </div>
          )}
        </div>
      </div>

      {/* End-to-End Workflow Stepper */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-blue-50/70 text-slate-900">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
            1
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">Connect & Analyze</div>
            <div className="text-[10px] text-slate-500 truncate">Website or Social Reference</div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${
            workingDna ? 'bg-blue-50/70 text-slate-900' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              workingDna ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            2
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">Review & Save DNA</div>
            <div className="text-[10px] text-slate-500 truncate">
              {hasSavedProfile ? 'Saved to Brand Profile' : 'Edit & Save Rules'}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${
            activeCheckResult ? 'bg-blue-50/70 text-slate-900' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              activeCheckResult ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'
            }`}
          >
            3
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">Check Consistency</div>
            <div className="text-[10px] text-slate-500 truncate">
              {activeCheckResult ? `Score: ${activeCheckResult.overallScore}/100` : 'Upload New Creative'}
            </div>
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg ${
            activeCheckResult?.correctedImageUrl ? 'bg-emerald-50 text-emerald-950' : 'text-slate-400'
          }`}
        >
          <span
            className={`w-5 h-5 rounded-full font-bold text-[10px] flex items-center justify-center shrink-0 ${
              activeCheckResult?.correctedImageUrl
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            4
          </span>
          <div className="min-w-0">
            <div className="font-bold truncate">One-Click Change</div>
            <div className="text-[10px] text-slate-500 truncate">
              {activeCheckResult?.correctedImageUrl ? 'Before & After Ready' : 'Auto-Remediate Issues'}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. SOURCE ANALYSIS PANEL (WEBSITE OR INSTAGRAM / SOCIAL MEDIA)    */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-5">
        {/* Source Option Tabs */}
        <div className="border-b border-slate-200 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => {
                setSourceMode('website');
                setAnalysisError(null);
              }}
              className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                sourceMode === 'website'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>1. Analyze Website</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSourceMode('social');
                setAnalysisError(null);
              }}
              className={`pb-3 px-1 flex items-center gap-2 text-xs font-semibold cursor-pointer border-b-2 transition-colors ${
                sourceMode === 'social'
                  ? 'text-blue-600 border-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-transparent'
              }`}
            >
              <Instagram className="w-4 h-4" />
              <span>2. Analyze Instagram / Social Media</span>
            </button>
          </div>

          {/* Previously Saved Brand DNA Profiles Switcher */}
          {(activeBrand.brandDnaHistory?.length || 0) > 0 && (
            <div className="flex items-center gap-2 pb-2 text-xs">
              <span className="text-slate-500">Saved Snapshots:</span>
              <select
                value={workingDna?.id || ''}
                onChange={e => {
                  const found = activeBrand.brandDnaHistory?.find(h => h.id === e.target.value);
                  if (found) setWorkingDna(found);
                }}
                className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 bg-slate-50 font-medium"
              >
                {(activeBrand.brandDnaHistory || []).map(h => (
                  <option key={h.id} value={h.id}>
                    {h.sourceType === 'website' ? 'Website' : 'Social'} — {h.updatedAt.slice(0, 10)} ({Math.round(h.overallConfidence * 100)}% conf)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* OPTION 1: WEBSITE ANALYSIS */}
        {sourceMode === 'website' && (
          <form onSubmit={e => handleAnalyzeWebsite(e)} className="space-y-4">
            <div>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Company Website URL
                </label>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400">Quick test live HTML/CSS sites:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleUrl = `${window.location.origin}/sample-brand-site/novapay`;
                      setWebsiteUrl(sampleUrl);
                      handleAnalyzeWebsite(undefined, sampleUrl);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                  >
                    NovaPay Live Site
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleUrl = `${window.location.origin}/sample-brand-site/astrafin`;
                      setWebsiteUrl(sampleUrl);
                      handleAnalyzeWebsite(undefined, sampleUrl);
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                  >
                    AstraFin Live Site
                  </button>
                  <span className="text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() => {
                      setWebsiteUrl('https://example.com');
                      handleAnalyzeWebsite(undefined, 'https://example.com');
                    }}
                    className="text-blue-600 hover:text-blue-800 font-semibold underline cursor-pointer"
                  >
                    example.com
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    value={websiteUrl}
                    onChange={e => {
                      setWebsiteUrl(e.target.value);
                      if (analysisError) setAnalysisError(null);
                    }}
                    placeholder="https://www.astrafin.com"
                    className="w-full pl-10 pr-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isAnalyzingWebsite}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
                >
                  {isAnalyzingWebsite ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Analyzing Website...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Analyze Brand</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Fetches publicly accessible HTML & stylesheets on the server (with SSRF protection and 10s timeout) to extract real HEX/RGB color tokens, font families, logo placement, layout patterns, and brand voice.
              </p>
            </div>

            {isAnalyzingWebsite && analysisStepText && (
              <div className="p-3.5 rounded-lg bg-blue-50/80 border border-blue-200 flex items-center gap-3 text-xs text-blue-950">
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
                <span className="font-medium">{analysisStepText}</span>
              </div>
            )}
          </form>
        )}

        {/* OPTION 2: INSTAGRAM / SOCIAL MEDIA ANALYSIS */}
        {sourceMode === 'social' && (
          <form onSubmit={handleAnalyzeSocial} className="space-y-4">
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Instagram className="w-4 h-4 text-blue-600" />
                  <span>Instagram & Social Media Reference Analysis</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Enter an Instagram profile URL for reference attribution and upload 1–6 reference post images or screenshots. Because Instagram blocks unauthenticated automated feed scraping, SkyNex AI never fabricates posts—it extracts real color histograms, OCR typography, layout patterns, and tone directly from your uploaded reference visuals.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLoadSampleSocialPosts}
                className="px-3 py-1.5 bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 rounded-lg font-semibold text-[11px] shrink-0 cursor-pointer transition-colors"
              >
                Load Sample Reference Post
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Instagram / Social Profile URL (Optional Attribution)
                </label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={e => setInstagramUrl(e.target.value)}
                  placeholder="https://www.instagram.com/brandname/"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Sample Post Caption / Copy (Optional for Brand Voice)
                </label>
                <input
                  type="text"
                  value={socialCaptionSample}
                  onChange={e => setSocialCaptionSample(e.target.value)}
                  placeholder="Paste a typical post caption to analyze tone and messaging..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Reference Post Image Uploader */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Reference Post Images or Screenshots ({socialRefImages.length}/6)
                </label>
                {socialRefImages.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSocialRefImages([])}
                    className="text-[11px] text-rose-600 hover:underline font-medium cursor-pointer"
                  >
                    Clear All Images
                  </button>
                )}
              </div>

              <input
                ref={socialFileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={e => handleSocialFilesSelected(e.target.files)}
                className="hidden"
              />

              <div
                onClick={() => socialFileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all"
              >
                <UploadCloud className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-xs font-semibold text-slate-800">
                  Click to upload reference social post images or screenshots
                </div>
                <div className="text-[11px] text-slate-500">
                  Supports PNG, JPG, WebP (up to 6 images, max 10 MB each)
                </div>
              </div>

              {socialRefImages.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                  {socialRefImages.map((img, idx) => (
                    <div
                      key={`${img.filename}-${idx}`}
                      className="relative group rounded-lg border border-slate-200 bg-white p-2 shadow-2xs"
                    >
                      <img
                        src={img.previewUrl}
                        alt={img.filename}
                        className="w-full h-24 object-contain rounded bg-slate-900/5"
                      />
                      <div className="text-[10px] font-medium text-slate-700 truncate mt-1">
                        {img.filename}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setSocialRefImages(prev => prev.filter((_, i) => i !== idx))
                        }
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-slate-900/75 text-white hover:bg-rose-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isAnalyzingSocial}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                {isAnalyzingSocial ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Social Posts...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Analyze Social Reference Content</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Honest Error Display */}
        {analysisError && (
          <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Analysis Notice</div>
              <p className="text-[11px] text-rose-800 leading-relaxed">{analysisError}</p>
            </div>
          </div>
        )}
      </div>

      {/* ================================================================= */}
      {/* 3. VISUAL BRAND DNA PROFILE (REVIEW, EDIT & SAVE)                 */}
      {/* ================================================================= */}
      {workingDna && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {/* Profile Header Bar */}
          <div className="p-5 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-sm font-bold text-slate-900">
                  Extracted Brand DNA Profile — {activeBrand.name}
                </h2>
                <span className="text-xs text-slate-500">
                  · Confidence: <strong>{Math.round((workingDna.overallConfidence || 0.88) * 100)}%</strong>
                  {' · '}
                  {workingDna.aiUsed ? 'Live Extraction + Gemini AI' : 'Deterministic Extraction'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {workingDna.sourceUrl
                  ? `Source: ${workingDna.sourceUrl}`
                  : `Source: ${workingDna.referenceContent.length} uploaded social reference visual(s)`}
                {workingDna.limitationNotice ? ` — ${workingDna.limitationNotice}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canManageBrandAssets ? (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditingDna(!isEditingDna)}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border flex items-center gap-1.5 cursor-pointer transition-colors ${
                      isEditingDna
                        ? 'bg-blue-50 text-blue-700 border-blue-300'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditingDna ? 'Done Editing' : 'Edit Extracted Rules'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveBrandDnaProfile}
                    disabled={isSavingDna}
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {isSavingDna ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{workingDna.isSaved ? 'Update Saved Profile' : 'Save Brand Profile'}</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <span className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
                  Read-only Brand DNA ({currentUser.roleLabel})
                </span>
              )}
            </div>
          </div>

          {/* 6 Category Navigation Tabs */}
          <div className="px-5 pt-3 border-b border-slate-200 flex items-center gap-6 overflow-x-auto scrollbar-none">
            {[
              { id: 'colors', label: `Color Palette (${workingDna.colors.length})`, icon: Palette },
              { id: 'typography', label: 'Typography', icon: TypeIcon },
              { id: 'logo', label: 'Logo Usage', icon: Scan },
              { id: 'visual', label: 'Visual Identity', icon: Layout },
              { id: 'voice', label: 'Brand Voice', icon: MessageSquare },
              { id: 'references', label: `Reference Content (${workingDna.referenceContent.length})`, icon: FileText }
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeDnaTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveDnaTab(tab.id as any)}
                  className={`pb-2.5 flex items-center gap-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap border-b-2 transition-colors ${
                    active
                      ? 'text-blue-600 border-blue-600'
                      : 'text-slate-500 hover:text-slate-800 border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Area */}
          <div className="p-6">
            {/* TAB 1: COLOR PALETTE */}
            {activeDnaTab === 'colors' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Extracted brand color swatches with HEX codes, semantic roles, and detection evidence.
                  </div>
                  {isEditingDna && (
                    <button
                      type="button"
                      onClick={handleAddColorSwatch}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Color Swatch</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workingDna.colors.map((swatch, idx) => (
                    <div
                      key={`${swatch.hex}-${idx}`}
                      className="rounded-xl border border-slate-200 p-4 space-y-3 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-lg border border-slate-300 shrink-0 shadow-2xs"
                          style={{ backgroundColor: swatch.hex }}
                        />
                        <div className="min-w-0 flex-1">
                          {isEditingDna ? (
                            <input
                              type="text"
                              value={swatch.name}
                              onChange={e => handleUpdateColor(idx, { name: e.target.value })}
                              className="w-full border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-900 mb-1"
                            />
                          ) : (
                            <div className="font-bold text-xs text-slate-900 truncate">{swatch.name}</div>
                          )}
                          <div className="flex items-center gap-2 text-xs">
                            {isEditingDna ? (
                              <input
                                type="color"
                                value={swatch.hex}
                                onChange={e =>
                                  handleUpdateColor(idx, { hex: e.target.value.toUpperCase() })
                                }
                                className="w-6 h-6 cursor-pointer"
                              />
                            ) : null}
                            <span className="font-mono font-bold text-slate-700">{swatch.hex}</span>
                            <span className="text-slate-400">·</span>
                            {isEditingDna ? (
                              <select
                                value={swatch.role}
                                onChange={e => handleUpdateColor(idx, { role: e.target.value as any })}
                                className="border border-slate-200 rounded px-1.5 py-0.5 text-[11px]"
                              >
                                <option value="primary">primary</option>
                                <option value="secondary">secondary</option>
                                <option value="accent">accent</option>
                                <option value="background">background</option>
                                <option value="neutral">neutral</option>
                              </select>
                            ) : (
                              <span className="text-[11px] text-slate-500 capitalize">{swatch.role}</span>
                            )}
                          </div>
                        </div>

                        {isEditingDna && workingDna.colors.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveColorSwatch(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                            title="Remove swatch"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {isEditingDna ? (
                        <input
                          type="text"
                          value={swatch.usageNotes}
                          onChange={e => handleUpdateColor(idx, { usageNotes: e.target.value })}
                          className="w-full border border-slate-200 rounded px-2 py-1 text-[11px] text-slate-600"
                        />
                      ) : (
                        <p className="text-[11px] text-slate-600 leading-relaxed">{swatch.usageNotes}</p>
                      )}

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                        <span className="truncate max-w-[200px]" title={swatch.sourceEvidence}>
                          Evidence: {swatch.sourceEvidence || 'Extracted stylesheet'}
                        </span>
                        <span>{Math.round((swatch.confidence || 0.88) * 100)}% conf</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: TYPOGRAPHY */}
            {activeDnaTab === 'typography' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Heading Font Family</label>
                    {isEditingDna ? (
                      <input
                        type="text"
                        value={workingDna.typography.headingFont}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            typography: { ...workingDna.typography, headingFont: e.target.value },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                      />
                    ) : (
                      <div className="text-base font-bold text-slate-900">
                        {workingDna.typography.headingFont}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Body Prose Font Family</label>
                    {isEditingDna ? (
                      <input
                        type="text"
                        value={workingDna.typography.bodyFont}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            typography: { ...workingDna.typography, bodyFont: e.target.value },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-slate-800">
                        {workingDna.typography.bodyFont}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Typography Weight & Hierarchy</label>
                    {isEditingDna ? (
                      <textarea
                        rows={2}
                        value={workingDna.typography.hierarchyNotes}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            typography: { ...workingDna.typography, hierarchyNotes: e.target.value },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                      />
                    ) : (
                      <p className="text-slate-600 leading-relaxed">{workingDna.typography.hierarchyNotes}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Scale: {workingDna.typography.weightScale}
                    </p>
                  </div>
                </div>

                {/* Live Specimen Preview */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Typography Hierarchy Specimen
                  </div>
                  <div
                    className="text-xl font-bold text-slate-900"
                    style={{ fontFamily: workingDna.typography.headingFont }}
                  >
                    {activeBrand.name} Enterprise Brand Headline
                  </div>
                  <p
                    className="text-xs text-slate-600 leading-relaxed"
                    style={{ fontFamily: workingDna.typography.bodyFont }}
                  >
                    Body copy specimen rendered using the detected font stack. Consistent typographic weight and spacing ensure instant brand recognition across web and social campaigns.
                  </p>
                  <div className="pt-2 border-t border-slate-200/80 text-[10px] text-slate-500">
                    Evidence: {workingDna.typography.sourceEvidence}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: LOGO USAGE */}
            {activeDnaTab === 'logo' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Detected Logo & Lockup Rule</label>
                    {isEditingDna ? (
                      <input
                        type="text"
                        value={workingDna.logoUsage.logoDescription}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            logoUsage: { ...workingDna.logoUsage, logoDescription: e.target.value },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                      />
                    ) : (
                      <p className="text-slate-800 font-medium">{workingDna.logoUsage.logoDescription}</p>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Placement Pattern & Clear Space</label>
                    {isEditingDna ? (
                      <input
                        type="text"
                        value={workingDna.logoUsage.placementPattern}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            logoUsage: { ...workingDna.logoUsage, placementPattern: e.target.value },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
                      />
                    ) : (
                      <p className="text-slate-600">
                        {workingDna.logoUsage.placementPattern} · {workingDna.logoUsage.clearSpaceRule}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Prohibited Logo Usages</label>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {workingDna.logoUsage.prohibitedUsages.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Detected Logo Reference
                  </div>
                  {workingDna.logoUsage.detectedLogoUrl ? (
                    <div className="p-4 rounded-lg bg-slate-900 flex items-center justify-center">
                      <img
                        src={workingDna.logoUsage.detectedLogoUrl}
                        alt="Detected Brand Logo"
                        className="max-h-24 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-slate-900 text-white flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded flex items-center justify-center font-bold text-xs"
                        style={{ backgroundColor: workingDna.colors[0]?.hex || '#2563EB' }}
                      >
                        {activeBrand.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm tracking-tight">{activeBrand.name}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500">
                    Evidence: {workingDna.logoUsage.sourceEvidence}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: VISUAL IDENTITY */}
            {activeDnaTab === 'visual' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Layout & Spacing System</label>
                    {isEditingDna ? (
                      <textarea
                        rows={2}
                        value={workingDna.visualIdentity.layoutPattern}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            visualIdentity: { ...workingDna.visualIdentity, layoutPattern: e.target.value },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <p className="text-slate-700 leading-relaxed">
                        {workingDna.visualIdentity.layoutPattern} ({workingDna.visualIdentity.spacingSystem})
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Button & Component Styling</label>
                    {isEditingDna ? (
                      <input
                        type="text"
                        value={workingDna.visualIdentity.buttonAndComponentStyle}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            visualIdentity: {
                              ...workingDna.visualIdentity,
                              buttonAndComponentStyle: e.target.value
                            },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <p className="text-slate-600">{workingDna.visualIdentity.buttonAndComponentStyle}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Imagery & Illustration Style</label>
                    <p className="text-slate-600 leading-relaxed">
                      {workingDna.visualIdentity.imageAndIllustrationStyle}
                    </p>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Recurring Design Patterns</label>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {workingDna.visualIdentity.designPatterns.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BRAND VOICE */}
            {activeDnaTab === 'voice' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tone Attributes</label>
                    <div className="text-slate-800 font-semibold">
                      {workingDna.brandVoice.toneAttributes.join(' · ')}
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Writing Style & Messaging</label>
                    {isEditingDna ? (
                      <textarea
                        rows={2}
                        value={workingDna.brandVoice.writingStyle}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            brandVoice: { ...workingDna.brandVoice, writingStyle: e.target.value },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <p className="text-slate-600 leading-relaxed">{workingDna.brandVoice.writingStyle}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Prohibited Phrases (Flagged During Consistency Checks)
                    </label>
                    {isEditingDna ? (
                      <input
                        type="text"
                        value={workingDna.brandVoice.prohibitedPhrases.join(', ')}
                        onChange={e =>
                          setWorkingDna({
                            ...workingDna,
                            brandVoice: {
                              ...workingDna.brandVoice,
                              prohibitedPhrases: e.target.value
                                .split(',')
                                .map(s => s.trim())
                                .filter(Boolean)
                            },
                            isSaved: false
                          })
                        }
                        className="w-full border border-slate-200 rounded-lg px-3 py-2"
                      />
                    ) : (
                      <ul className="list-disc pl-4 space-y-1 text-rose-700">
                        {workingDna.brandVoice.prohibitedPhrases.map((p, i) => (
                          <li key={i}>{p}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Preferred Brand Headlines</label>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600">
                      {workingDna.brandVoice.preferredMessaging.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: REFERENCE CONTENT */}
            {activeDnaTab === 'references' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {workingDna.referenceContent.map(ref => (
                  <div
                    key={ref.id}
                    className="p-4 rounded-xl border border-slate-200 flex items-start gap-3.5 bg-slate-50/40"
                  >
                    {ref.thumbnailUrl ? (
                      <img
                        src={ref.thumbnailUrl}
                        alt={ref.title}
                        className="w-20 h-20 object-contain rounded border border-slate-200 bg-white shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Globe className="w-5 h-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="font-bold text-slate-900 truncate">{ref.title}</div>
                      <div className="text-[11px] text-blue-600 truncate">{ref.urlOrFilename}</div>
                      {ref.extractedSnippet && (
                        <p className="text-[11px] text-slate-500 line-clamp-2">{ref.extractedSnippet}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. NEW CONTENT CONSISTENCY CHECKER & ONE-CLICK CHANGE             */}
      {/* ================================================================= */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              New Content Consistency Checker
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload a new creative image, social post, banner, or advertisement to evaluate against your saved Brand DNA Profile.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <button
              type="button"
              onClick={() => handleLoadSampleCreativeForCheck('off_brand')}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-semibold cursor-pointer transition-colors"
            >
              Load Off-Brand Sample Ad
            </button>
            <button
              type="button"
              onClick={() => handleLoadSampleCreativeForCheck('compliant')}
              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg font-semibold cursor-pointer transition-colors"
            >
              Load Compliant Sample Ad
            </button>
          </div>
        </div>

        {/* Upload & Input Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 space-y-3.5 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Creative Title</label>
              <input
                type="text"
                value={creativeTitle}
                onChange={e => setCreativeTitle(e.target.value)}
                placeholder="e.g. Q4 Product Launch Banner"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Accompanying Post Caption / Copy (Optional)
              </label>
              <textarea
                rows={2}
                value={creativeCaption}
                onChange={e => setCreativeCaption(e.target.value)}
                placeholder="Optional social caption or ad headline to check against Brand Voice..."
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-slate-900 resize-none"
              />
            </div>

            <input
              ref={creativeInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={e => handleCreativeFileSelected(e.target.files?.[0])}
              className="hidden"
            />

            <div
              onClick={() => creativeInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-4 text-center cursor-pointer bg-slate-50/50 hover:bg-blue-50/20 transition-all"
            >
              <ImageIcon className="w-6 h-6 text-blue-600 mx-auto mb-1" />
              <div className="font-semibold text-slate-800">
                {creativeFileName ? `Selected: ${creativeFileName}` : 'Upload Creative Image (PNG, JPG, WebP)'}
              </div>
              <div className="text-[11px] text-slate-500">Click to browse or replace image</div>
            </div>

            {creativePreviewUrl && (
              <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={creativePreviewUrl}
                  alt="Uploaded creative preview"
                  className="max-h-40 mx-auto object-contain rounded"
                />
              </div>
            )}

            {consistencyError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{consistencyError}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleRunConsistencyCheck}
              disabled={isCheckingConsistency || (!workingDna && !hasSavedProfile)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {isCheckingConsistency ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating Against Saved Brand DNA...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Check Brand Consistency</span>
                </>
              )}
            </button>
          </div>

          {/* Consistency Results & One-Click Change Panel */}
          <div className="lg:col-span-7 space-y-5">
            {!activeCheckResult ? (
              <div className="h-full min-h-[260px] rounded-xl border border-slate-200/80 bg-slate-50/50 p-8 flex flex-col items-center justify-center text-center">
                <ShieldCheck className="w-8 h-8 text-slate-400 mb-2" />
                <div className="text-xs font-bold text-slate-800">
                  Ready to Check Brand Consistency
                </div>
                <p className="text-xs text-slate-500 mt-1 max-w-md">
                  Save your Brand DNA Profile above, then upload a creative image (or click "Load Off-Brand Sample Ad") to generate a 0–100 Brand Consistency Score and run One-Click Change.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Score & Category Breakdown Card */}
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
                    <div>
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Brand Consistency Report
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                        {activeCheckResult.creativeTitle}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {activeCheckResult.scoringMethodology}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-[10px] font-bold uppercase text-slate-400">Overall Score</div>
                        <div
                          className={`text-3xl font-extrabold font-tabular ${
                            activeCheckResult.overallScore >= 85
                              ? 'text-emerald-600'
                              : activeCheckResult.overallScore >= 60
                              ? 'text-amber-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {activeCheckResult.overallScore}
                          <span className="text-sm font-semibold text-slate-400">/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 6 Category Scores Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    {activeCheckResult.categoryScores.map(cat => (
                      <div
                        key={cat.category}
                        className="p-2.5 rounded-lg bg-white border border-slate-200/80 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700 truncate">{cat.category}</span>
                          <span
                            className={`font-bold font-tabular ${
                              cat.score >= 85
                                ? 'text-emerald-600'
                                : cat.score >= 60
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {cat.score}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cat.score >= 85
                                ? 'bg-emerald-500'
                                : cat.score >= 60
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                            style={{ width: `${cat.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Detected Dominant Colors in Creative */}
                  {activeCheckResult.detectedDominantColors.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px] text-slate-600">
                      <span className="font-semibold">Detected Creative Swatches:</span>
                      {activeCheckResult.detectedDominantColors.map(hex => (
                        <span key={hex} className="inline-flex items-center gap-1 font-mono text-[10px]">
                          <span
                            className="w-3 h-3 rounded border border-slate-300 inline-block"
                            style={{ backgroundColor: hex }}
                          />
                          {hex}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Detected Issues List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">
                      Detected Brand Inconsistencies ({activeCheckResult.issues.length})
                    </h4>
                    {activeCheckResult.issues.length > 0 && (
                      <button
                        type="button"
                        onClick={handleApplyOneClickFix}
                        disabled={isApplyingFix || selectedIssueIds.size === 0}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                      >
                        {isApplyingFix ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Generating Brand-Compliant Creative...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Fix Brand Inconsistencies ({selectedIssueIds.size})</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {fixError && (
                    <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                      {fixError}
                    </div>
                  )}

                  {activeCheckResult.issues.length === 0 ? (
                    <div className="p-5 rounded-xl border border-emerald-200 bg-emerald-50/60 text-xs text-emerald-900 flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <span>
                        No brand inconsistencies detected! This creative adheres to your saved Brand DNA Profile.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeCheckResult.issues.map(iss => {
                        const isChecked = selectedIssueIds.has(iss.id);
                        return (
                          <div
                            key={iss.id}
                            className={`p-4 rounded-xl border transition-colors text-xs space-y-2 ${
                              isChecked
                                ? 'border-blue-200 bg-blue-50/20'
                                : 'border-slate-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <label className="flex items-start gap-2.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={() => handleToggleIssueForFix(iss.id)}
                                  className="mt-0.5 w-4 h-4 rounded text-blue-600 border-slate-300"
                                />
                                <div>
                                  <div className="font-bold text-slate-900">{iss.title}</div>
                                  <div className="text-[11px] text-slate-500 mt-0.5">
                                    {iss.category} ·{' '}
                                    <span className="font-semibold uppercase text-rose-700">
                                      {iss.severity}
                                    </span>{' '}
                                    ·{' '}
                                    {iss.issueType === 'objective_violation'
                                      ? 'Objective Brand Rule Violation'
                                      : 'Design Recommendation'}
                                  </div>
                                </div>
                              </label>
                            </div>

                            <div className="pl-6 space-y-1 text-[11px]">
                              <div>
                                <span className="font-semibold text-slate-700">Detected in Creative: </span>
                                <span className="text-rose-700 font-medium">{iss.detectedValue}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">Saved Brand Rule: </span>
                                <span className="text-slate-600">{iss.approvedBrandRule}</span>
                              </div>
                              <div>
                                <span className="font-semibold text-slate-700">Evidence: </span>
                                <span className="text-slate-600">{iss.evidence}</span>
                              </div>
                              <div className="text-emerald-800 font-medium pt-0.5">
                                Recommended Fix: {iss.recommendedCorrection}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* BEFORE & AFTER ONE-CLICK CHANGE COMPARISON */}
                {activeCheckResult.correctedImageUrl && (
                  <div className="p-5 rounded-xl border border-emerald-300 bg-emerald-50/30 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                      <div>
                        <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>One-Click Change: Before & After Comparison</span>
                        </div>
                        <p className="text-[11px] text-emerald-800 mt-0.5">
                          Original file preserved untouched; corrected creative generated with saved Brand DNA colors, typography, and compliant copy.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <a
                          href={activeCheckResult.correctedImageUrl}
                          download={`brand-compliant-${activeCheckResult.filename}`}
                          className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PNG</span>
                        </a>
                        {canFinalizeReview && (
                          <button
                            type="button"
                            onClick={() => handleApproveCreative('approved')}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {activeCheckResult.approvalStatus === 'approved'
                                ? 'Approved ✓'
                                : 'Approve Result'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-3 rounded-lg bg-white border border-slate-200 space-y-2">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">
                          Before (Original Uploaded Creative)
                        </div>
                        <img
                          src={activeCheckResult.originalImageUrl}
                          alt="Original Creative"
                          className="w-full h-48 object-contain rounded bg-slate-900/5"
                        />
                      </div>

                      <div className="p-3 rounded-lg bg-white border border-emerald-300 space-y-2">
                        <div className="text-[11px] font-bold text-emerald-700 uppercase">
                          After (Brand DNA Corrected Creative)
                        </div>
                        <img
                          src={activeCheckResult.correctedImageUrl}
                          alt="Corrected Brand Creative"
                          className="w-full h-48 object-contain rounded bg-slate-900/5"
                        />
                      </div>
                    </div>

                    {activeCheckResult.correctionAppliedSummary && (
                      <div className="text-[11px] text-slate-700 space-y-1">
                        <div className="font-bold text-slate-900">Applied Remediations:</div>
                        <ul className="list-disc pl-4 space-y-0.5">
                          {activeCheckResult.correctionAppliedSummary.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
}
