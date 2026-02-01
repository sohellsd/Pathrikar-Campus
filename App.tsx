import React, { useState, useMemo, useEffect } from 'react';
import { Stream, CourseType, Category, AppState, Language } from './types';
import { StreamIcons } from './constants';
import { translations } from './translations';

const PERSISTENCE_KEY = 'mahadbt_assist_state_v3';

const App: React.FC = () => {
  // Persistence: Initialize state from localStorage or defaults
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(PERSISTENCE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved state', e);
      }
    }
    return {
      language: 'en',
      step: 1,
      stream: null,
      courseType: null,
      category: null,
      currentYear: null,
      isHosteller: false,
      hadGap: false,
      loginReady: {
        username: false,
        password: false,
        mobile: false,
      },
    };
  });

  // Persistence: Save state on every change
  useEffect(() => {
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  }, [state]);

  // Sync HTML lang attribute for CSS targeting
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  const [activeVideo, setActiveVideo] = useState<{ title: string; desc: string; url?: string } | null>(null);

  const t = translations[state.language];

  const isRenewal = useMemo(() => state.currentYear !== null && state.currentYear > 1, [state.currentYear]);
  
  const handleStreamSelect = (s: Stream) => {
    setState(prev => ({
      ...prev,
      stream: s,
      courseType: null,
      currentYear: null,
      category: null,
    }));
  };

  const handleCourseSelect = (c: CourseType) => {
    setState(prev => ({
      ...prev,
      courseType: c,
      currentYear: null,
      category: null,
    }));
  };

  const handleCategorySelect = (cat: Category) => {
    setState(prev => ({
      ...prev,
      category: cat,
      isHosteller: false,
    }));
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (state.step === 1) {
      if (state.stream === Stream.Pharmacy || state.stream === Stream.Management || state.stream === Stream.ASC) {
        setState(prev => ({ ...prev, step: 2 }));
      } else {
        setState(prev => ({ ...prev, step: 3, courseType: null }));
      }
      return;
    }
    if (state.step === 4) {
      if (isRenewal) setState(prev => ({ ...prev, step: 5 }));
      else setState(prev => ({ ...prev, step: 6 }));
      return;
    }
    setState(prev => ({ ...prev, step: Math.min(6, prev.step + 1) }));
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (state.step === 3 && (state.stream !== Stream.Pharmacy && state.stream !== Stream.Management && state.stream !== Stream.ASC)) {
      setState(prev => ({ ...prev, step: 1 }));
      return;
    }
    if (state.step === 6 && !isRenewal) {
      setState(prev => ({ ...prev, step: 4 }));
      return;
    }
    setState(prev => ({ ...prev, step: Math.max(1, prev.step - 1) }));
  };

  const handleRestart = () => {
    const newState = {
      language: state.language,
      step: 1,
      stream: null,
      courseType: null,
      category: null,
      currentYear: null,
      isHosteller: false,
      hadGap: false,
      loginReady: { username: false, password: false, mobile: false },
    };
    setState(newState);
    localStorage.removeItem(PERSISTENCE_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-10 flex flex-col pt-safe pb-safe scroll-container">
      {/* Video Overlay */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative border border-slate-200">
            <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full shadow-lg">
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="aspect-[9/16] bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
              <h3 className="text-xl font-black mb-4">{activeVideo.title}</h3>
              <p className="text-sm opacity-80 mb-8 italic">"{activeVideo.desc}"</p>
              {activeVideo.url && (
                <a href={activeVideo.url} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-900 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest">Open Tutorial</a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-blue-900 text-white pt-8 pb-20 px-6 sticky top-0 z-10 pt-safe no-select">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="font-black text-xl tracking-tight leading-none uppercase">Pathrikar Campus</h1>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest mt-2 font-bold">{t.subtitle}</p>
            </div>
            <div className="flex bg-blue-950/50 p-1.5 rounded-xl backdrop-blur-md">
              {(['en', 'hi', 'mr'] as Language[]).map(lang => (
                <button key={lang} onClick={() => setState(prev => ({ ...prev, language: lang }))} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all ${state.language === lang ? 'bg-white text-blue-900 shadow-sm' : 'text-blue-400'}`}>
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-end"><span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{t.step} {state.step} {t.of} 6</span></div>
            <div className="flex space-x-1.5 w-full">
              {[1, 2, 3, 4, 5, 6].map(i => (<div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${state.step >= i ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-blue-800'}`} />))}
            </div>
          </div>
        </div>
      </header>

      {/* Card Container */}
      <main className="max-w-2xl mx-auto relative z-20 flex-grow w-full -mt-12 px-0 sm:px-4">
        <div className="bg-white rounded-t-[2.5rem] shadow-2xl min-h-[500px] p-6 sm:rounded-3xl border-t border-white/20">
          {state.step > 1 && (
            <button onClick={prevStep} className="mb-8 flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest transition-all touch-manipulation">
              <div className="p-1.5 bg-slate-50 rounded-lg"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg></div>
              <span>{t.back}</span>
            </button>
          )}

          {state.step === 1 && <StepStream selected={state.stream} onSelect={handleStreamSelect} onContinue={nextStep} t={t} />}
          {state.step === 2 && <StepCourse selected={state.courseType} stream={state.stream} onSelect={handleCourseSelect} onContinue={nextStep} t={t} />}
          {state.step === 3 && <StepCategory selected={state.category} onSelect={handleCategorySelect} onContinue={nextStep} t={t} />}
          {state.step === 4 && <StepYear state={state} onUpdate={updates => setState(prev => ({ ...prev, ...updates }))} onContinue={nextStep} t={t} />}
          {state.step === 5 && <StepLoginCheck ready={state.loginReady} onToggle={field => setState(prev => ({ ...prev, loginReady: { ...prev.loginReady, [field]: !prev.loginReady[field] } }))} onContinue={nextStep} t={t} />}
          {state.step === 6 && <StepDocumentList state={state} onRestart={handleRestart} onBack={prevStep} onOpenVideo={(title, desc, url) => setActiveVideo({ title, desc, url })} t={t} />}
        </div>
      </main>

      <footer className="w-full py-8 mt-auto flex flex-col items-center bg-white border-t border-slate-100">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-60">{t.footerText}</p>
        <a href="https://www.instagram.com/sohellsd/" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-black text-xs tracking-tight uppercase">Sohel Sayyad</a>
      </footer>
    </div>
  );
};

// Selection Step Components
const StepStream: React.FC<{ selected: Stream | null; onSelect: (s: Stream) => void; onContinue: () => void; t: any; }> = ({ selected, onSelect, onContinue, t }) => {
  const streams = [
    { value: Stream.Engineering, label: t.engLabel, tip: t.engTip },
    { value: Stream.Pharmacy, label: t.pharmLabel, tip: t.pharmTip },
    { value: Stream.Nursing, label: t.nursLabel, tip: t.nursTip },
    { value: Stream.Management, label: t.mgmtLabel, tip: t.mgmtTip },
    { value: Stream.ASC, label: t.ascLabel, tip: t.ascTip },
  ];
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{t.selectStream}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectStreamSub}</p></header>
      <div className="space-y-3">
        {streams.map(s => (
          <button key={s.value} onClick={() => onSelect(s.value)} className={`group w-full flex items-center p-5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left relative ${selected === s.value ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
            <div className={`p-4 rounded-xl transition-all shadow-sm ${selected === s.value ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>{StreamIcons[s.value as keyof typeof StreamIcons]}</div>
            <div className="ml-5 flex-grow"><span className={`font-black text-base tracking-tight block ${selected === s.value ? 'text-blue-900' : 'text-slate-800'}`}>{s.label}</span><span className="text-xs font-bold text-slate-400 mt-1">{s.tip}</span></div>
            {selected === s.value && <div className="absolute right-5 text-blue-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg></div>}
          </button>
        ))}
      </div>
      <button disabled={!selected} onClick={onContinue} className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] transition-all uppercase tracking-[0.2em] text-xs disabled:opacity-20 mt-4">{t.continue}</button>
    </div>
  );
};

const StepCourse: React.FC<{ selected: CourseType | null; stream: Stream | null; onSelect: (c: CourseType) => void; onContinue: () => void; t: any; }> = ({ selected, stream, onSelect, onContinue, t }) => {
  let options: CourseType[] = [];
  if (stream === Stream.Pharmacy) options = [CourseType.BPharm, CourseType.DPharm, CourseType.MPharm];
  else if (stream === Stream.Management) options = [CourseType.BBA, CourseType.BCA, CourseType.MBA, CourseType.MCA];
  else if (stream === Stream.ASC) options = [CourseType.BA, CourseType.BSc, CourseType.BCom, CourseType.MA, CourseType.MSc, CourseType.MCom];
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectCourse}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectCourseSub}</p></header>
      <div className="space-y-3 no-select">{options.map(c => (
          <button key={c} onClick={() => onSelect(c)} className={`w-full flex items-center p-6 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${selected === c ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white'}`}>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === c ? 'bg-blue-600 border-blue-600 shadow-lg' : 'border-slate-200'}`}> {selected === c && <div className="w-2.5 h-2.5 bg-white rounded-full" />}</div>
            <div className="ml-5"><span className={`font-black text-base ${selected === c ? 'text-blue-900' : 'text-slate-800'}`}>{c}</span></div>
          </button>
        ))}</div>
      <button disabled={!selected} onClick={onContinue} className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-20">{t.continue}</button>
    </div>
  );
};

const StepCategory: React.FC<{ selected: Category | null; onSelect: (c: Category) => void; onContinue: () => void; t: any; }> = ({ selected, onSelect, onContinue, t }) => {
  const categories: {label: string, value: Category}[] = [
    { label: 'Open / General', value: 'Open' }, { label: 'OBC', value: 'OBC' }, { label: 'SC / ST', value: 'SC' }, { label: 'SBC / VJNT', value: 'SBC' }, { label: 'SEBC', value: 'SEBC' }, { label: 'Minority', value: 'Minority' },
  ];
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectCategory}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectCategorySub}</p></header>
      <div className="grid grid-cols-1 gap-3 no-select">{categories.map(cat => (
          <button key={cat.value} onClick={() => onSelect(cat.value)} className={`p-6 rounded-2xl border-2 font-black transition-all text-left flex items-center justify-between active:scale-[0.98] ${selected === cat.value ? 'border-blue-600 bg-blue-50/50 text-blue-900' : 'border-slate-100 bg-white text-slate-600'}`}><span className="text-base">{cat.label}</span>{selected === cat.value && (<div className="text-blue-600"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg></div>)}</button>
        ))}</div>
      <button disabled={!selected} onClick={onContinue} className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-20">{t.continue}</button>
    </div>
  );
};

const StepYear: React.FC<{ state: AppState; onUpdate: (updates: Partial<AppState>) => void; onContinue: () => void; t: any; }> = ({ state, onUpdate, onContinue, t }) => {
  const is2YearCourse = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.DPharm, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const is3YearCourse = [CourseType.BA, CourseType.BSc, CourseType.BCom].includes(state.courseType!);
  const years = is2YearCourse ? [1, 2] : is3YearCourse ? [1, 2, 3] : [1, 2, 3, 4];
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isASC = state.stream === Stream.ASC;
  const isHostelEligible = !isASC && state.category && ['SC', 'ST', 'SBC', 'VJNT', 'Open'].includes(state.category);
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectYear}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectYearSub}</p></header>
      <div className="grid grid-cols-2 gap-4 no-select">{years.map(y => (
          <button key={y} onClick={() => onUpdate({ currentYear: y })} className={`p-6 rounded-2xl border-2 font-black text-sm transition-all active:scale-[0.97] ${state.currentYear === y ? 'border-blue-600 bg-blue-50/50 text-blue-900 shadow-sm' : 'border-slate-100 bg-white text-slate-400'}`}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</button>
        ))}</div>
      {state.currentYear === 1 && (<div className="bg-rose-50 p-6 rounded-2xl space-y-5 no-select border-2 border-rose-100"><p className="text-xs font-black text-rose-900 uppercase tracking-widest leading-relaxed">{isMaster ? t.gapQuestionPG : t.gapQuestion}</p><div className="flex space-x-4">{[true, false].map(v => (<button key={v ? 'y' : 'n'} onClick={() => onUpdate({ hadGap: v })} className={`flex-1 p-4 rounded-xl border-2 font-black text-xs transition-all uppercase ${state.hadGap === v ? 'border-rose-600 bg-white text-rose-700 shadow-md' : 'border-white bg-white/50 text-rose-300'}`}>{v ? t.yes : t.no}</button>))}</div></div>)}
      {isHostelEligible && (<div className="bg-blue-50 p-6 rounded-2xl space-y-5 no-select border-2 border-blue-100"><p className="text-xs font-black text-blue-900 uppercase tracking-widest leading-relaxed">{t.hostelQuestion}</p><div className="flex space-x-4">{[true, false].map(v => (<button key={v ? 'hy' : 'hn'} onClick={() => onUpdate({ isHosteller: v })} className={`flex-1 p-4 rounded-xl border-2 font-black text-xs transition-all uppercase ${state.isHosteller === v ? 'border-blue-600 bg-white text-blue-900 shadow-md' : 'border-white bg-white/50 text-blue-300'}`}>{v ? t.yes : t.no}</button>))}</div></div>)}
      <button disabled={!state.currentYear} onClick={onContinue} className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 uppercase tracking-[0.2em] text-xs disabled:opacity-20">{t.continue}</button>
    </div>
  );
};

const StepLoginCheck: React.FC<{ ready: AppState['loginReady']; onToggle: (f: keyof AppState['loginReady']) => void; onContinue: () => void; t: any; }> = ({ ready, onToggle, onContinue, t }) => {
  const isReady = ready.username && ready.password && ready.mobile;
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.loginCheck}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.loginCheckSub}</p></header>
      <div className="bg-rose-50 p-8 rounded-3xl space-y-5 no-select border-2 border-rose-100 shadow-inner">{[ { id: 'username', label: t.loginUser }, { id: 'password', label: t.loginPass }, { id: 'mobile', label: t.loginMobile } ].map(item => (
          <label key={item.id} className="flex items-center space-x-5 cursor-pointer active:opacity-70 group">
            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${ready[item.id as keyof AppState['loginReady']] ? 'bg-rose-600 border-rose-600 shadow-lg' : 'bg-white border-rose-200'}`}>{ready[item.id as keyof AppState['loginReady']] && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}</div>
            <input type="checkbox" checked={ready[item.id as keyof AppState['loginReady']]} onChange={() => onToggle(item.id as keyof AppState['loginReady'])} className="hidden" /><span className={`text-sm font-black tracking-tight uppercase ${ready[item.id as keyof AppState['loginReady']] ? 'text-rose-900' : 'text-rose-300'}`}>{item.label}</span>
          </label>
        ))}</div>
      <button disabled={!isReady} onClick={onContinue} className="w-full bg-rose-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-rose-900/20 active:scale-[0.98] uppercase tracking-[0.2em] text-xs disabled:opacity-20">{t.continue}</button>
    </div>
  );
};

// CHOICE PILL COMPONENT
const ChoicePill: React.FC<{ label: string; subtext?: string }> = ({ label, subtext }) => (
  <div className="inline-flex items-center bg-blue-50 border border-blue-100 rounded-full px-3 py-1.5 space-x-2 shadow-sm animate-in fade-in zoom-in duration-300 mb-3">
    <div className="w-3.5 h-3.5 bg-blue-600 rounded-full flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-blue-700 uppercase tracking-tight leading-none whitespace-nowrap">{label}</span>
      {subtext && <span className="text-[7px] font-bold text-blue-400 uppercase tracking-tighter leading-none mt-0.5">{subtext}</span>}
    </div>
  </div>
);

const StepDocumentList: React.FC<{ state: AppState; onRestart: () => void; onBack: () => void; onOpenVideo: (title: string, desc: string, url?: string) => void; t: any; }> = ({ state, onRestart, onBack, onOpenVideo, t }) => {
  const isFresh = state.currentYear === 1;
  const isDPharm = state.courseType === CourseType.DPharm;
  const isASC = state.stream === Stream.ASC;
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isProfessional = state.stream !== Stream.ASC && state.stream !== null;

  const academicDocs = useMemo(() => {
    const docs: { name: string }[] = [];
    docs.push({ name: 'Admission Bonafide + Fees Paid Receipt (Merge required)' });
    docs.push({ name: '10th Marksheet' });
    docs.push({ name: '12th Marksheet' });
    if (!isASC) docs.push({ name: t.docAllotment });
    if (isFresh) {
      if (isMaster) {
        docs.push({ name: t.docGradMarksheet });
        docs.push({ name: t.docGradTC });
      } else {
        docs.push({ name: 'Previous College TC / Leaving Certificate' });
      }
      if (state.hadGap) docs.push({ name: 'Gap Certificate' });
    } else {
      if (!isASC) {
        if (isDPharm) docs.push({ name: '1st Year Marksheet (Single PDF)' });
        else {
          if (state.currentYear! >= 2) docs.push({ name: 'Sem 1 + Sem 2 Marksheet (ONE PDF)' });
          if (state.currentYear! >= 3) docs.push({ name: 'Sem 3 + Sem 4 Marksheet (ONE PDF)' });
          if (state.currentYear! >= 4) docs.push({ name: 'Sem 5 + Sem 6 Marksheet (ONE PDF)' });
        }
      }
      docs.push({ name: isMaster ? t.docGradTC : 'Previous College TC / Leaving Certificate' });
    }
    return docs;
  }, [isASC, isFresh, isMaster, isDPharm, state.currentYear, state.hadGap, t]);

  const govtDocs = useMemo(() => {
    const docs: { name: string; optional?: boolean }[] = [];
    docs.push({ name: 'Aadhaar Card' });
    const incomeRequired = isFresh || ['Open', 'SEBC', 'Minority'].includes(state.category!);
    if (incomeRequired) docs.push({ name: 'Income Certificate' });
    
    if (state.category !== 'Open' && state.category !== 'Minority') {
      docs.push({ name: 'Caste Certificate' });
      if (isProfessional) {
        if (['OBC', 'SEBC', 'SBC', 'VJNT'].includes(state.category!)) docs.push({ name: t.docNCL, optional: true });
        docs.push({ name: t.docCasteValidity, optional: true });
      }
    }
    docs.push({ name: 'Domicile Certificate' });
    return docs;
  }, [isFresh, isProfessional, state.category, t]);

  const choiceDocs = useMemo(() => {
    if (['Open', 'OBC', 'SEBC', 'SBC', 'VJNT'].includes(state.category!)) {
      return ['Alpabhudharak Certificate', 'Job Card (MGNREGA)'];
    }
    return null;
  }, [state.category]);

  return (
    <div className="space-y-10 animate-in slide-in-from-bottom-6 duration-700">
      <header className="space-y-4">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">{t.docsTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {[state.courseType || state.stream, state.category, `${state.currentYear} Year`, isFresh ? t.freshApp : t.renewalApp].map((pill, i) => (
            <span key={i} className="px-4 py-2 bg-blue-50 text-blue-700 text-[10px] font-black rounded-xl uppercase border border-blue-100 shadow-sm tracking-tight">{pill}</span>
          ))}
        </div>
      </header>

      <div className="p-7 bg-slate-900 text-white rounded-3xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <h4 className="text-blue-400 font-black text-[10px] uppercase tracking-[0.4em] mb-5">Submission Protocol</h4>
        <ul className="space-y-4 text-xs font-bold leading-relaxed">
          <li className="flex items-start space-x-4"><div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]"/> <span>{t.rulePdf}</span></li>
          <li className="flex items-start space-x-4"><div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]"/> <span>{t.ruleSize}</span></li>
          <li className="flex items-start space-x-4"><div className="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(59,130,246,0.8)]"/> <span className="text-blue-200">{t.ruleNaming}</span></li>
        </ul>
      </div>

      {['Open', 'OBC', 'Minority', 'SBC', 'VJNT', 'SEBC'].includes(state.category!) && (
        <section className="p-7 bg-rose-50 border-2 border-rose-100 rounded-3xl space-y-5 shadow-sm">
          <h3 className="font-black text-rose-900 text-[11px] uppercase tracking-widest">{t.declarationTitle}</h3>
          <div className="bg-white p-6 rounded-2xl border-2 border-rose-200 shadow-sm">
            <h4 className="font-black text-rose-800 text-base mb-2">{state.category === 'Open' ? t.declOpenTitle : state.category === 'Minority' ? t.declMinorityTitle : t.declObcTitle}</h4>
            <p className="text-xs font-bold text-rose-600/70 mb-6 leading-relaxed">{state.category === 'Open' ? t.declOpenInst : state.category === 'Minority' ? t.declMinorityInst : t.declObcInst}</p>
            <div className="flex flex-col space-y-3">
              <a href="https://www.mahadbt.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center bg-rose-600 text-white p-4 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-rose-900/10"><span>{t.downloadForm}</span></a>
              <button onClick={() => onOpenVideo(t.howToFill, "Instruction", "#")} className="flex items-center justify-center bg-white border-2 border-rose-200 text-rose-600 p-4 rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"><span>{t.howToFill}</span></button>
            </div>
          </div>
        </section>
      )}

      <div className="space-y-12">
        <section className="space-y-5">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">{t.academicDocs}</p>
          <div className="space-y-3">
            {academicDocs.map((doc, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-50 p-5 rounded-2xl shadow-sm hover:border-blue-100 transition-colors group">
                <h4 className="font-black text-slate-800 text-sm leading-tight group-hover:text-blue-900 transition-colors">{doc.name}</h4>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] px-2">{t.categoryDocs}</p>
          <div className="space-y-3">
            {govtDocs.map((doc, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-50 p-5 rounded-2xl shadow-sm hover:border-blue-100 transition-colors group">
                <h4 className="font-black text-slate-800 text-sm leading-tight group-hover:text-blue-900 transition-colors">{doc.name}</h4>
              </div>
            ))}

            {choiceDocs && (
              <div className="bg-blue-50/40 rounded-3xl p-6 border-2 border-blue-100/50 space-y-2 mt-4">
                <ChoicePill label="Any One Required" subtext="Upload only one document" />
                <div className="space-y-2">
                  {choiceDocs.map((name, idx) => (
                    <div key={idx} className="bg-white border-2 border-blue-100/30 p-5 rounded-2xl shadow-sm flex items-center justify-between group">
                      <h4 className="font-black text-blue-900 text-sm leading-tight">{name}</h4>
                      <div className="w-5 h-5 border-2 border-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-50 transition-colors">
                         <div className="w-2 h-2 bg-blue-600/20 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="space-y-6 pt-10 border-t-2 border-slate-100">
        <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight">{t.videoHelpTitle}</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { title: t.videoMergeTitle, desc: t.videoMergeDesc, url: 'https://www.youtube.com' },
            { title: t.videoCompressTitle, desc: t.videoCompressDesc, url: 'https://www.youtube.com' },
            { title: t.videoImgToPdfTitle, desc: t.videoImgToPdfDesc, url: 'https://www.youtube.com' },
          ].map((v, i) => (
            <button key={i} onClick={() => onOpenVideo(v.title, v.desc, v.url)} className="w-full flex items-center p-5 bg-slate-50 border-2 border-transparent hover:border-blue-100 rounded-2xl active:scale-[0.98] transition-all text-left">
              <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center shrink-0 font-black shadow-sm">▶</div>
              <div className="ml-5"><h4 className="font-black text-slate-800 text-sm uppercase tracking-tight">{v.title}</h4><p className="text-[10px] font-bold text-slate-400 mt-1">{v.desc}</p></div>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-6 pt-6">
        <h3 className="font-black text-slate-900 text-xl uppercase tracking-tight">{t.docToolsTitle}</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: t.btnMerge, sub: t.helperMerge, url: 'https://www.ilovepdf.com/merge_pdf' },
            { label: t.btnCompress, sub: t.helperCompress, url: 'https://www.ilovepdf.com/compress_pdf' },
            { label: t.btnImgToPdf, sub: t.helperImgToPdf, url: 'https://www.ilovepdf.com/jpg_to_pdf' },
          ].map((tool, i) => (
            <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer" className="p-5 rounded-2xl border-2 border-slate-50 hover:border-blue-200 bg-white shadow-sm active:scale-[0.98] transition-all flex flex-col group">
              <span className="font-black text-xs uppercase tracking-widest text-slate-800 group-hover:text-blue-900">{tool.label}</span>
              <span className="text-[10px] font-bold text-slate-400 mt-2 group-hover:text-slate-500">{tool.sub}</span>
            </a>
          ))}
        </div>
      </section>

      <button onClick={onRestart} className="w-full bg-blue-900 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-900/40 active:scale-[0.98] uppercase tracking-[0.3em] text-xs mt-4 transition-all hover:bg-blue-800">{t.home}</button>
    </div>
  );
};

export default App;
