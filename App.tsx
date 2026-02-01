
import React, { useState, useMemo, useEffect } from 'react';
import { Stream, CourseType, Category, AppState, Language } from './types';
import { StreamIcons, COLORS } from './constants';
import { translations } from './translations';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    language: 'en', // Default English
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
  });

  // Sync HTML lang attribute for CSS targeting
  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  const [activeVideo, setActiveVideo] = useState<{ title: string; desc: string; url?: string } | null>(null);

  const t = translations[state.language];

  const isRenewal = useMemo(() => state.currentYear !== null && state.currentYear > 1, [state.currentYear]);
  const isMaster = useMemo(() => {
    if (!state.courseType) return false;
    return [
      CourseType.MPharm, 
      CourseType.MBA, 
      CourseType.MCA, 
      CourseType.MA, 
      CourseType.MSc, 
      CourseType.MCom
    ].includes(state.courseType);
  }, [state.courseType]);
  
  const isASC = useMemo(() => state.stream === Stream.ASC, [state.stream]);
  const isProfessional = useMemo(() => state.stream !== Stream.ASC && state.stream !== null, [state.stream]);

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

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-900 pb-10 flex flex-col pt-safe pb-safe scroll-container">
      {/* Video Modal */}
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full shadow-lg"
            >
              <svg className="w-5 h-5 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="aspect-[9/16] bg-slate-900 flex flex-col items-center justify-center p-8 text-center text-white">
              <h3 className="text-xl font-black mb-4">{activeVideo.title}</h3>
              <p className="text-sm opacity-80 mb-8 italic">"{activeVideo.desc}"</p>
              {activeVideo.url && (
                <a href={activeVideo.url} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-900 px-6 py-3 rounded-full font-black text-xs uppercase tracking-widest">
                  Open on YouTube
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#1e3a8a] text-white pt-6 pb-8 px-4 shadow-xl sticky top-0 z-50 rounded-b-[2rem] pt-safe no-select">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="font-black text-lg tracking-tight leading-none uppercase">Pathrikar Campus</h1>
              <p className="text-[9px] text-blue-200 uppercase tracking-widest mt-1.5 font-bold opacity-80">{t.subtitle}</p>
            </div>

            <div className="flex bg-white/10 p-1.5 rounded-2xl border border-white/10">
              {(['en', 'hi', 'mr'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setState(prev => ({ ...prev, language: lang }))}
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all ${
                    state.language === lang ? 'bg-white text-blue-900 shadow-lg' : 'text-blue-100'
                  }`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-end">
              <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">
                {t.step} {state.step} {t.of} 6
              </span>
            </div>
            <div className="flex space-x-1.5 w-full">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                    state.step >= i ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 mt-8 relative z-10 flex-grow w-full pb-10">
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-300/50 p-6 md:p-10 min-h-[450px] border border-white">
          {state.step > 1 && (
            <button onClick={prevStep} className="mb-6 flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all touch-manipulation">
              <div className="p-2 bg-slate-50 rounded-xl">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span>{t.back}</span>
            </button>
          )}

          {state.step === 1 && (
            <StepStream selected={state.stream} onSelect={handleStreamSelect} onContinue={nextStep} t={t} />
          )}
          {state.step === 2 && (
            <StepCourse selected={state.courseType} stream={state.stream} onSelect={handleCourseSelect} onContinue={nextStep} t={t} />
          )}
          {state.step === 3 && (
            <StepCategory selected={state.category} onSelect={handleCategorySelect} onContinue={nextStep} t={t} />
          )}
          {state.step === 4 && (
            <StepYear state={state} onUpdate={updates => setState(prev => ({ ...prev, ...updates }))} onContinue={nextStep} t={t} />
          )}
          {state.step === 5 && (
            <StepLoginCheck ready={state.loginReady} onToggle={field => setState(prev => ({ ...prev, loginReady: { ...prev.loginReady, [field]: !prev.loginReady[field] } }))} onContinue={nextStep} t={t} />
          )}
          {state.step === 6 && (
            <StepDocumentList state={state} onRestart={() => setState(prev => ({ ...prev, step: 1, stream: null, courseType: null, category: null, currentYear: null, hadGap: false, isHosteller: false }))} onBack={prevStep} onOpenVideo={(title, desc, url) => setActiveVideo({ title, desc, url })} t={t} />
          )}
        </div>
      </main>

      <footer className="w-full py-8 mt-auto flex flex-col items-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2 opacity-60">{t.footerText}</p>
        <a href="https://www.instagram.com/sohellsd/" target="_blank" rel="noopener noreferrer" className="text-blue-700 font-black text-sm tracking-tight">Sohel Sayyad</a>
      </footer>
    </div>
  );
};

const StepStream: React.FC<{
  selected: Stream | null;
  onSelect: (s: Stream) => void;
  onContinue: () => void;
  t: any;
}> = ({ selected, onSelect, onContinue, t }) => {
  const streams = [
    { value: Stream.Engineering, label: t.engLabel, tip: t.engTip },
    { value: Stream.Pharmacy, label: t.pharmLabel, tip: t.pharmTip },
    { value: Stream.Nursing, label: t.nursLabel, tip: t.nursTip },
    { value: Stream.Management, label: t.mgmtLabel, tip: t.mgmtTip },
    { value: Stream.ASC, label: t.ascLabel, tip: t.ascTip },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <header className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{t.selectStream}</h2>
        <p className="text-slate-500 font-bold text-sm leading-relaxed">{t.selectStreamSub}</p>
      </header>
      <div className="space-y-4 no-select">
        {streams.map(s => (
          <button
            key={s.value}
            onClick={() => onSelect(s.value)}
            className={`group w-full flex items-center p-4 rounded-3xl border-2 transition-all active:scale-[0.97] touch-manipulation text-left relative ${
              selected === s.value
                ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-600/5'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <div className={`p-3.5 rounded-2xl transition-all duration-300 ${
              selected === s.value ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'bg-slate-50 text-slate-400'
            }`}>
              {StreamIcons[s.value as keyof typeof StreamIcons]}
            </div>
            <div className="ml-5 flex-grow">
              <span className={`font-black text-[16px] tracking-tight block leading-none ${
                selected === s.value ? 'text-blue-700' : 'text-slate-800'
              }`}>
                {s.label}
              </span>
              <span className="text-[11px] font-bold tracking-tight block text-slate-400 mt-2">
                {s.tip}
              </span>
            </div>
            {selected === s.value && (
              <div className="absolute right-6 bg-blue-600 text-white rounded-full p-1.5 shadow-lg">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      <button
        disabled={!selected}
        onClick={onContinue}
        className="w-full bg-[#1e3a8a] hover:bg-blue-800 text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-900/30 active:scale-[0.98] transition-all uppercase tracking-[0.25em] text-xs disabled:opacity-20 touch-manipulation no-select mt-4"
      >
        {t.continue}
      </button>
    </div>
  );
};

const StepCourse: React.FC<{
  selected: CourseType | null;
  stream: Stream | null;
  onSelect: (c: CourseType) => void;
  onContinue: () => void;
  t: any;
}> = ({ selected, stream, onSelect, onContinue, t }) => {
  let options: CourseType[] = [];
  if (stream === Stream.Pharmacy) options = [CourseType.BPharm, CourseType.DPharm, CourseType.MPharm];
  else if (stream === Stream.Management) options = [CourseType.BBA, CourseType.BCA, CourseType.MBA, CourseType.MCA];
  else if (stream === Stream.ASC) options = [CourseType.BA, CourseType.BSc, CourseType.BCom, CourseType.MA, CourseType.MSc, CourseType.MCom];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <header className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.selectCourse}</h2>
        <p className="text-slate-500 font-bold text-sm leading-relaxed">{t.selectCourseSub}</p>
      </header>
      <div className="space-y-4 no-select">
        {options.map(c => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`w-full flex items-center p-6 rounded-3xl border-2 transition-all active:scale-[0.98] text-left ${
              selected === c ? 'border-blue-600 bg-blue-50/50' : 'border-slate-100 bg-white'
            }`}
          >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === c ? 'bg-blue-600 border-blue-600 shadow-lg' : 'border-slate-200'}`}>
              {selected === c && <div className="w-2.5 h-2.5 bg-white rounded-full" />}
            </div>
            <div className="ml-5">
              <span className={`font-black text-base ${selected === c ? 'text-blue-800' : 'text-slate-700'}`}>{c}</span>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 opacity-70">Course Details Applied</p>
            </div>
          </button>
        ))}
      </div>
      <button disabled={!selected} onClick={onContinue} className="w-full bg-[#1e3a8a] text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-900/30 active:scale-[0.98] transition-all uppercase tracking-[0.25em] text-xs disabled:opacity-20 touch-manipulation">
        {t.continue}
      </button>
    </div>
  );
};

const StepCategory: React.FC<{
  selected: Category | null;
  onSelect: (c: Category) => void;
  onContinue: () => void;
  t: any;
}> = ({ selected, onSelect, onContinue, t }) => {
  const categories: {label: string, value: Category}[] = [
    { label: 'Open / General', value: 'Open' },
    { label: 'OBC', value: 'OBC' },
    { label: 'SC / ST', value: 'SC' },
    { label: 'SBC / VJNT', value: 'SBC' },
    { label: 'SEBC', value: 'SEBC' },
    { label: 'Minority', value: 'Minority' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <header className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.selectCategory}</h2>
        <p className="text-slate-500 font-bold text-sm leading-relaxed">{t.selectCategorySub}</p>
      </header>
      <div className="grid grid-cols-1 gap-3 no-select">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => onSelect(cat.value)}
            className={`p-6 rounded-3xl border-2 font-black transition-all text-left flex items-center justify-between active:scale-[0.98] ${
              selected === cat.value ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-100 bg-white text-slate-500'
            }`}
          >
            <span className="text-sm">{cat.label}</span>
            {selected === cat.value && (
              <div className="bg-blue-600 text-white rounded-full p-1.5 shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
      <button disabled={!selected} onClick={onContinue} className="w-full bg-[#1e3a8a] text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-900/30 active:scale-[0.98] uppercase tracking-[0.25em] text-xs disabled:opacity-20">
        {t.continue}
      </button>
    </div>
  );
};

const StepYear: React.FC<{
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onContinue: () => void;
  t: any;
}> = ({ state, onUpdate, onContinue, t }) => {
  const is2YearCourse = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.DPharm, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const is3YearCourse = [CourseType.BA, CourseType.BSc, CourseType.BCom].includes(state.courseType!);
  const years = is2YearCourse ? [1, 2] : is3YearCourse ? [1, 2, 3] : [1, 2, 3, 4];
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isASC = state.stream === Stream.ASC;
  const isHostelEligible = !isASC && state.category && ['SC', 'ST', 'SBC', 'VJNT', 'Open'].includes(state.category);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <header className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.selectYear}</h2>
        <p className="text-slate-500 font-bold text-sm leading-relaxed">{t.selectYearSub}</p>
      </header>
      <div className="grid grid-cols-2 gap-4 no-select">
        {years.map(y => (
          <button key={y} onClick={() => onUpdate({ currentYear: y })} className={`p-6 rounded-3xl border-2 font-black text-sm transition-all active:scale-[0.97] ${state.currentYear === y ? 'border-blue-600 bg-blue-50/50 text-blue-700 shadow-xl shadow-blue-600/10' : 'border-slate-100 bg-white text-slate-400'}`}>
            {y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year
          </button>
        ))}
      </div>
      {state.currentYear === 1 && (
        <div className="bg-slate-50 p-6 rounded-3xl space-y-4 no-select border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isMaster ? t.gapQuestionPG : t.gapQuestion}</p>
          <div className="flex space-x-3">
            {[true, false].map(v => (
              <button key={v ? 'y' : 'n'} onClick={() => onUpdate({ hadGap: v })} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs transition-all ${state.hadGap === v ? 'border-rose-600 bg-rose-50 text-rose-700' : 'border-white bg-white text-slate-400 shadow-sm'}`}>
                {v ? t.yes : t.no}
              </button>
            ))}
          </div>
        </div>
      )}
      {isHostelEligible && (
        <div className="bg-slate-50 p-6 rounded-3xl space-y-4 no-select border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.hostelQuestion}</p>
          <div className="flex space-x-3">
            {[true, false].map(v => (
              <button key={v ? 'hy' : 'hn'} onClick={() => onUpdate({ isHosteller: v })} className={`flex-1 p-4 rounded-2xl border-2 font-black text-xs transition-all ${state.isHosteller === v ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-white bg-white text-slate-400 shadow-sm'}`}>
                {v ? t.yes : t.no}
              </button>
            ))}
          </div>
        </div>
      )}
      <button disabled={!state.currentYear} onClick={onContinue} className="w-full bg-[#1e3a8a] text-white font-black py-6 rounded-3xl shadow-2xl uppercase tracking-[0.25em] text-xs disabled:opacity-20">
        {t.continue}
      </button>
    </div>
  );
};

const StepLoginCheck: React.FC<{
  ready: AppState['loginReady'];
  onToggle: (f: keyof AppState['loginReady']) => void;
  onContinue: () => void;
  t: any;
}> = ({ ready, onToggle, onContinue, t }) => {
  const isReady = ready.username && ready.password && ready.mobile;
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <header className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">{t.loginCheck}</h2>
        <p className="text-slate-500 font-bold text-sm leading-relaxed">{t.loginCheckSub}</p>
      </header>
      <div className="bg-rose-50 p-8 rounded-[2.5rem] space-y-5 no-select border border-rose-100 shadow-xl shadow-rose-600/5">
        {[
          { id: 'username', label: t.loginUser },
          { id: 'password', label: t.loginPass },
          { id: 'mobile', label: t.loginMobile },
        ].map(item => (
          <label key={item.id} className="flex items-center space-x-5 cursor-pointer active:opacity-70 group">
            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all ${ready[item.id as keyof AppState['loginReady']] ? 'bg-rose-600 border-rose-600 shadow-lg shadow-rose-600/30' : 'bg-white border-rose-200'}`}>
              {ready[item.id as keyof AppState['loginReady']] && <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>}
            </div>
            <input type="checkbox" checked={ready[item.id as keyof AppState['loginReady']]} onChange={() => onToggle(item.id as keyof AppState['loginReady'])} className="hidden" />
            <span className={`text-sm font-black tracking-tight ${ready[item.id as keyof AppState['loginReady']] ? 'text-rose-900' : 'text-slate-400'}`}>{item.label}</span>
          </label>
        ))}
      </div>
      <button disabled={!isReady} onClick={onContinue} className="w-full bg-rose-600 text-white font-black py-6 rounded-3xl shadow-2xl shadow-rose-600/30 active:scale-[0.98] uppercase tracking-[0.25em] text-xs disabled:opacity-20">
        {t.continue}
      </button>
    </div>
  );
};

const StepDocumentList: React.FC<{
  state: AppState;
  onRestart: () => void;
  onBack: () => void;
  onOpenVideo: (title: string, desc: string, url?: string) => void;
  t: any;
}> = ({ state, onRestart, onBack, onOpenVideo, t }) => {
  const isFresh = state.currentYear === 1;
  const isDPharm = state.courseType === CourseType.DPharm;
  const isASC = state.stream === Stream.ASC;
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isProfessional = state.stream !== Stream.ASC && state.stream !== null;

  const getAcademicAndIDDocs = () => {
    const docs: { name: string; file: string }[] = [];
    docs.push({ name: 'Admission Bonafide + Fees Paid Receipt (Merge required)', file: 'Admission_Receipt.pdf' });
    docs.push({ name: '10th Marksheet', file: '10th_Marksheet.pdf' });
    docs.push({ name: '12th Marksheet', file: '12th_Marksheet.pdf' });
    if (!isASC) docs.push({ name: t.docAllotment, file: 'College_Allotment_Letter.pdf' });
    if (isFresh) {
      if (isMaster) {
        docs.push({ name: t.docGradMarksheet, file: 'Graduation_Final_Marksheet.pdf' });
        docs.push({ name: t.docGradTC, file: 'Graduation_TC.pdf' });
      } else {
        docs.push({ name: 'Previous College TC / Leaving Certificate', file: '12th_TC.pdf' });
      }
      if (state.hadGap) docs.push({ name: 'Gap Certificate', file: 'Gap_Certificate.pdf' });
    } else {
      if (!isASC) {
        if (isDPharm) docs.push({ name: '1st Year Marksheet (Single PDF)', file: '1stYear_Marksheet.pdf' });
        else {
          if (state.currentYear! >= 2) docs.push({ name: 'Sem 1 + Sem 2 Marksheet (ONE PDF)', file: 'Sem1_Sem2_Marksheet.pdf' });
          if (state.currentYear! >= 3) docs.push({ name: 'Sem 3 + Sem 4 Marksheet (ONE PDF)', file: 'Sem3_Sem4_Marksheet.pdf' });
          if (state.currentYear! >= 4) docs.push({ name: 'Sem 5 + Sem 6 Marksheet (ONE PDF)', file: 'Sem5_Sem6_Marksheet.pdf' });
        }
      }
      docs.push({ name: isMaster ? t.docGradTC : 'Previous College TC / Leaving Certificate', file: isMaster ? 'Graduation_TC.pdf' : 'TC.pdf' });
    }
    return docs;
  };

  const getGovtDocs = () => {
    const docs: { name: string; file: string; optional?: boolean }[] = [];
    docs.push({ name: 'Aadhaar Card', file: 'Aadhaar_Card.pdf' });
    const incomeRequired = isFresh || ['Open', 'SEBC', 'Minority'].includes(state.category!);
    if (incomeRequired) docs.push({ name: 'Income Certificate', file: 'Income_Certificate.pdf' });
    if (state.category !== 'Open' && state.category !== 'Minority') {
      docs.push({ name: 'Caste Certificate', file: 'Caste_Certificate.pdf' });
      if (isProfessional) {
        if (['OBC', 'SEBC', 'SBC', 'VJNT'].includes(state.category!)) docs.push({ name: t.docNCL, file: 'NCL_Certificate.pdf', optional: true });
        docs.push({ name: t.docCasteValidity, file: 'Caste_Validity.pdf', optional: true });
      }
    }
    docs.push({ name: 'Domicile Certificate', file: 'Domicile_Certificate.pdf' });
    return docs;
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
      <header className="space-y-4">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">{t.docsTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {[state.courseType || state.stream, state.category, `${state.currentYear} Year`, isFresh ? t.freshApp : t.renewalApp].map((pill, i) => (
            <span key={i} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded-xl uppercase border border-slate-200 tracking-tight">{pill}</span>
          ))}
        </div>
      </header>

      <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-2xl shadow-blue-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <h4 className="text-blue-300 font-black text-[10px] uppercase tracking-[0.3em] mb-6">MahaDBT Official Rules</h4>
        <ul className="space-y-4 text-xs font-bold leading-relaxed">
          <li className="flex items-center space-x-4"><div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"/> <span>{t.rulePdf}</span></li>
          <li className="flex items-center space-x-4"><div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"/> <span>{t.ruleSize}</span></li>
          <li className="flex items-center space-x-4"><div className="w-2 h-2 bg-blue-500 rounded-full shrink-0"/> <span className="text-blue-200">{t.ruleNaming}</span></li>
        </ul>
      </div>

      <div className="space-y-12">
        <section className="space-y-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{t.academicDocs}</p>
          <div className="grid grid-cols-1 gap-3">
            {getAcademicAndIDDocs().map((doc, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-50 p-6 rounded-3xl shadow-sm hover:border-blue-100 transition-colors">
                <h4 className="font-black text-slate-800 text-sm leading-tight">{doc.name}</h4>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-2">{t.categoryDocs}</p>
          <div className="grid grid-cols-1 gap-3">
            {getGovtDocs().map((doc, idx) => (
              <div key={idx} className="bg-white border-2 border-slate-50 p-6 rounded-3xl shadow-sm hover:border-blue-100 transition-colors">
                <h4 className="font-black text-slate-800 text-sm leading-tight">{doc.name}</h4>
              </div>
            ))}
          </div>
        </section>
      </div>

      <button onClick={onRestart} className="w-full bg-[#1e3a8a] text-white font-black py-6 rounded-3xl shadow-2xl shadow-blue-900/20 active:scale-[0.98] uppercase tracking-[0.25em] text-xs">
        {t.home}
      </button>
    </div>
  );
};

export default App;
