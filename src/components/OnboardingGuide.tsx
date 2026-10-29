import React from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, FileText, Layers, ShieldCheck, X } from 'lucide-react';

type Props = { onClose: (choice: 'tour' | 'explore' | 'skip' | 'finish') => void; onNavigate?: (view: string) => void };
const steps = [
  ['Your SkyNex AI Workspace', 'Use navigation to access content review, brand knowledge, audit history and insights.', 'overview'],
  ['Choose the Correct Brand', 'Each brand has its own approved guidelines, product facts and review context.', 'brand'],
  ['Set Up Brand Knowledge', 'Add approved rules, product information and source documents before relying on them during an audit.', 'knowledge'],
  ['Submit Your Advertisement', 'Paste text or upload a supported document or advertisement image.', 'review'],
  ['Check the Brand Before Auditing', 'If content appears to belong to another client, review the evidence and choose the correct brand before continuing.', 'review'],
  ['Review Audit Findings', 'Inspect the flagged content, approved rule, evidence and proposed correction.', 'review'],
  ['Complete Your Review', 'Resolve findings and use review history to track decisions. You are ready to audit your content.', 'history']
] as const;

export function WelcomeOnboarding({ onTour, onExplore, onSkip }: { onTour: () => void; onExplore: () => void; onSkip: () => void }) {
  return <div className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-7 text-center">
      <div className="mx-auto mb-4 w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Layers className="w-7 h-7" /></div>
      <div className="text-xs font-bold text-blue-600 mb-2">WELCOME TO SKY NEX AI</div>
      <h2 className="text-2xl font-bold text-[#10243A]">Set up your first brand review</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">Learn how to select a brand, add approved knowledge, submit content, and review findings.</p>
      <div className="mt-6 grid gap-2"><button type="button" onClick={onTour} className="w-full px-4 py-3 rounded-xl bg-blue-600 text-white text-sm font-semibold">Start Guided Tour</button><button type="button" onClick={onExplore} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold">Explore App</button><button type="button" onClick={onSkip} className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-2">Skip for Now</button></div>
    </div>
  </div>;
}
export default function OnboardingGuide({ onClose, onNavigate }: Props) {
  const [step, setStep] = React.useState(0);
  const current = steps[step];
  const icon = step === 0 ? Layers : step === 1 ? ShieldCheck : step === 2 ? BookOpen : step === 6 ? CheckCircle2 : FileText;
  const Icon = icon;
  const move = (view: string) => { onNavigate?.(view); };
  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/45 backdrop-blur-sm flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="text-xs font-bold text-blue-600">SKYNEX AI · GUIDED START</div>
          <button type="button" aria-label="Close tutorial" onClick={() => onClose('skip')} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-6 pt-6"><div className="flex gap-1.5" aria-label={`Step ${step + 1} of 7`}>{steps.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-blue-600' : 'bg-slate-200'}`} />)}</div></div>
        <div className="px-6 py-8 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center"><Icon className="w-7 h-7" /></div>
          <div className="text-xs font-semibold text-slate-400 mb-2">Step {step + 1} of 7</div>
          <h2 id="onboarding-title" className="text-2xl font-bold text-[#10243A]">{current[0]}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{current[1]}</p>
          <button type="button" onClick={() => move(current[2])} className="mt-5 text-xs font-semibold text-blue-600 hover:underline">Open this area</button>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button type="button" onClick={() => onClose('skip')} className="text-xs font-semibold text-slate-500 hover:text-slate-800">Skip Tour</button>
          <div className="flex gap-2">
            <button type="button" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))} className="px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40"><ArrowLeft className="w-3.5 h-3.5 inline mr-1" />Back</button>
            {step < steps.length - 1 ? <button type="button" onClick={() => setStep(s => s + 1)} className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold">Next<ArrowRight className="w-3.5 h-3.5 inline ml-1" /></button> : <button type="button" onClick={() => onClose('finish')} className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold">Start My First Audit</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
