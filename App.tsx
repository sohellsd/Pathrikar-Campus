import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShieldCheck, 
  IndianRupee, 
  Home, 
  CreditCard, 
  GraduationCap, 
  History, 
  Building2, 
  FileText, 
  LogOut, 
  BookOpen 
} from 'lucide-react';
import { Stream, CourseType, Category, AppState, Language } from './types';
import { StreamIcons } from './constants';
import { translations } from './translations';

const PERSISTENCE_KEY = 'mahadbt_assist_state_v4';

// Strict TypeScript definitions for document structures
type BadgeType = 'merge' | 'onepdf' | 'optional' | 'ifavailable' | 'anyone' | 'mandatory';

interface DocItem {
  name: string;
  badge?: BadgeType;
  fileName?: string;
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(PERSISTENCE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error('Failed to parse saved state', e); }
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
      isDirectSecondYear: false,
      loginReady: { username: false, password: false, mobile: false },
    };
  });

  useEffect(() => {
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  const [activeVideo, setActiveVideo] = useState<{ title: string; desc: string; url?: string } | null>(null);

  const t = translations[state.language];
  const isRenewal = useMemo(() => state.currentYear !== null && state.currentYear > 1, [state.currentYear]);
  
  const handleStreamSelect = (s: Stream) => {
    const nextStepNum = (s === Stream.Pharmacy || s === Stream.Management || s === Stream.ASC || s === Stream.Engineering) ? 2 : 3;
    setState(prev => ({ 
      ...prev, 
      stream: s, 
      courseType: null, 
      currentYear: null, 
      category: null, 
      isDirectSecondYear: false,
      step: nextStepNum 
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCourseSelect = (c: CourseType) => {
    setState(prev => ({ 
      ...prev, 
      courseType: c, 
      currentYear: null, 
      category: null, 
      isDirectSecondYear: false,
      step: 3 
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (cat: Category) => {
    setState(prev => ({ ...prev, category: cat, isHosteller: false, step: 4 }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    const newState: AppState = {
      language: state.language,
      step: 1,
      stream: null,
      courseType: null,
      category: null,
      currentYear: null,
      isHosteller: false,
      hadGap: false,
      isDirectSecondYear: false,
      loginReady: { username: false, password: false, mobile: false },
    };
    setState(newState);
    localStorage.removeItem(PERSISTENCE_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-100">
      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 no-print video-overlay" onClick={() => setActiveVideo(null)}>
          <div className="bg-white w-full max-sm rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 z-10 bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors">
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="aspect-[9/16] bg-slate-900 flex flex-col items-center justify-center p-10 text-center text-white">
              <h3 className="text-xl font-black mb-4 tracking-tight">{activeVideo.title}</h3>
              <p className="text-sm opacity-60 mb-8 italic">{activeVideo.desc}</p>
              {activeVideo.url && (
                <a href={activeVideo.url} target="_blank" rel="noopener noreferrer" className="bg-white text-blue-900 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-50 transition-colors">Open Tutorial</a>
              )}
            </div>
          </div>
        </div>
      )}

      <header className="bg-[#1e3a8a] text-white pt-4 pb-10 px-6 sticky top-0 z-40 pt-safe no-select shadow-xl rounded-b-3xl no-print">
        <div className="max-w-2xl mx-auto flex flex-col">
          <div className="flex items-center justify-between mb-4 min-h-[40px]">
            <div className="w-1" />
            <div className="flex bg-blue-900/50 p-1 rounded-2xl backdrop-blur-md border border-white/10">
              {(['en', 'hi', 'mr'] as Language[]).map(lang => (
                <button key={lang} onClick={() => setState(prev => ({ ...prev, language: lang }))} className={`px-3 py-1 text-[10px] font-black rounded-xl transition-all duration-300 ${state.language === lang ? 'bg-white text-blue-900 shadow-lg' : 'text-blue-200/50 hover:text-white'}`}>
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col text-left mb-6">
            <h1 className="font-black text-xl tracking-tighter leading-none uppercase">Pathrikar Campus</h1>
            <p className="text-[9px] font-bold text-blue-200/50 uppercase tracking-widest mt-1.5">{t.subtitle}</p>
          </div>
          <div className="flex flex-col items-end space-y-1.5">
            <span className="text-[8px] font-black text-white uppercase tracking-widest leading-none">{t.step} {state.step} {t.of} 6</span>
            <div className="flex w-full space-x-1.5">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-[3px] flex-grow rounded-full transition-all duration-500 ${state.step >= i ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-blue-400/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto relative z-30 flex-grow w-full -mt-4 px-0 sm:px-4">
        <div className="bg-white min-h-[500px] p-6 pt-6 rounded-t-3xl sm:rounded-3xl border-x border-t border-slate-100 overflow-hidden pb-12 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] step-container">
          <div className="step-enter">
            {state.step > 1 && (
              <button 
                onClick={prevStep} 
                className="flex items-center space-x-1 text-slate-400 hover:text-blue-900 transition-all mb-4 active:translate-x-[-2px] group py-1 pr-4 rounded-lg"
                style={{ minHeight: '32px' }}
              >
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-[-2px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M15 19l-7-7 7-7" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-bold text-[10px] uppercase tracking-widest">Go {t.back}</span>
              </button>
            )}
            {state.step === 1 && <StepStream selected={state.stream} onSelect={handleStreamSelect} t={t} />}
            {state.step === 2 && <StepCourse selected={state.courseType} stream={state.stream} onSelect={handleCourseSelect} t={t} />}
            {state.step === 3 && <StepCategory selected={state.category} onSelect={handleCategorySelect} t={t} />}
            {state.step === 4 && <StepYear state={state} onUpdate={updates => setState(prev => {
                if ('currentYear' in updates) {
                  return { ...prev, ...updates, isDirectSecondYear: false };
                }
                return { ...prev, ...updates };
              })} onContinue={nextStep} t={t} />}
            {state.step === 5 && <StepLoginCheck ready={state.loginReady} onToggle={field => setState(prev => ({ ...prev, loginReady: { ...prev.loginReady, [field]: !prev.loginReady[field] } }))} onContinue={nextStep} t={t} />}
            {state.step === 6 && <StepDocumentList state={state} onRestart={handleRestart} onBack={prevStep} onOpenVideo={(title, desc, url) => setActiveVideo({ title, desc, url })} t={t} />}
          </div>
        </div>
      </main>

      <footer className="w-full py-10 flex flex-col items-center bg-transparent pb-safe no-select no-print">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 opacity-50">{t.footerText}</p>
        <a href="https://www.instagram.com/sohellsd/" target="_blank" rel="noopener noreferrer" className="text-blue-800 font-black text-xs tracking-tight uppercase hover:text-blue-600 transition-colors">Sohel Sayyad</a>
      </footer>
    </div>
  );
};

// Internal Step Components

const StepStream: React.FC<{ selected: Stream | null; onSelect: (s: Stream) => void; t: any; }> = ({ selected, onSelect, t }) => {
  const streams = [
    { value: Stream.Engineering, label: t.engLabel, tip: t.engTip },
    { value: Stream.Pharmacy, label: t.pharmLabel, tip: t.pharmTip },
    { value: Stream.Nursing, label: t.nursLabel, tip: t.nursTip },
    { value: Stream.Management, label: t.mgmtLabel, tip: t.mgmtTip },
    { value: Stream.ASC, label: t.ascLabel, tip: t.ascTip },
  ];
  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-left">
        <h2 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{t.selectStream}</h2>
        <p className="text-slate-500 font-medium text-xs leading-relaxed">{t.selectStreamSub}</p>
      </header>
      <div className="space-y-2.5">
        {streams.map(s => (
          <button key={s.value} onClick={() => onSelect(s.value)} className={`w-full flex items-center p-3.5 rounded-xl border-2 transition-all active:scale-[0.98] text-left relative ${selected === s.value ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-[#fafafa] hover:border-slate-200'}`}>
            <div className={`p-2.5 rounded-lg transition-all ${selected === s.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-300'}`}>{StreamIcons[s.value as keyof typeof StreamIcons]}</div>
            <div className="ml-3.5 flex-grow"><span className={`font-black text-[14px] tracking-tight block ${selected === s.value ? 'text-blue-900' : 'text-slate-700'}`}>{s.label}</span><span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.tip}</span></div>
          </button>
        ))}
      </div>
    </div>
  );
};

const StepCourse: React.FC<{ selected: CourseType | null; stream: Stream | null; onSelect: (c: CourseType) => void; t: any; }> = ({ selected, stream, onSelect, t }) => {
  if (stream === Stream.Engineering) {
    return (
      <div className="space-y-6">
        <header className="space-y-1.5 text-left"><h2 className="text-xl font-black text-slate-900 tracking-tight">{t.selectCourse}</h2><p className="text-slate-500 font-medium text-xs leading-relaxed">{t.selectCourseSub}</p></header>
        <div className="grid grid-cols-1 gap-3 no-select">
          {[
            { value: CourseType.BE_BTech, label: t.beBtech },
            { value: CourseType.Poly_Diploma, label: t.polytechnic }
          ].map(item => (
            <button 
              key={item.value} 
              onClick={() => onSelect(item.value)} 
              className={`w-full flex items-center p-5 rounded-xl border-2 transition-all active:scale-[0.98] text-left ${selected === item.value ? 'border-blue-600 bg-blue-50/30 shadow-md' : 'border-slate-50 bg-[#fafafa]'}`}
            >
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === item.value ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'border-slate-200 bg-white'}`}>
                {selected === item.value && <div className="w-2 h-2 bg-white rounded-full" />}
              </div>
              <div className="ml-4">
                <span className={`font-black text-sm uppercase tracking-tight ${selected === item.value ? 'text-blue-900' : 'text-slate-700'}`}>
                  {item.label}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  let options: CourseType[] = [];
  if (stream === Stream.Pharmacy) options = [CourseType.BPharm, CourseType.DPharm, CourseType.MPharm];
  else if (stream === Stream.Management) options = [CourseType.BBA, CourseType.BCA, CourseType.MBA, CourseType.MCA];
  else if (stream === Stream.ASC) options = [CourseType.BA, CourseType.BSc, CourseType.BCom, CourseType.MA, CourseType.MSc, CourseType.MCom];
  else if (stream === Stream.Nursing) options = [CourseType.BScNursing, CourseType.GNM];
  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-left"><h2 className="text-xl font-black text-slate-900 tracking-tight">{t.selectCourse}</h2><p className="text-slate-500 font-medium text-xs leading-relaxed">{t.selectCourseSub}</p></header>
      <div className="space-y-2.5 no-select">{options.map(c => (
          <button key={c} onClick={() => onSelect(c)} className={`w-full flex items-center p-4 rounded-xl border-2 transition-all active:scale-[0.98] text-left ${selected === c ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-[#fafafa]'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === c ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'border-slate-200 bg-white'}`}> {selected === c && <div className="w-1.5 h-1.5 bg-white rounded-full" />}</div>
            <div className="ml-3.5"><span className={`font-black text-xs uppercase tracking-tight ${selected === c ? 'text-blue-900' : 'text-slate-700'}`}>{c}</span></div>
          </button>
        ))}</div>
    </div>
  );
};

const StepCategory: React.FC<{ selected: Category | null; onSelect: (c: Category) => void; t: any; }> = ({ selected, onSelect, t }) => {
  const categories: {label: string, value: Category}[] = [
    { label: 'Open / General', value: 'Open' }, 
    { label: 'OBC', value: 'OBC' }, 
    { label: 'SC', value: 'SC' }, 
    { label: 'ST', value: 'ST' }, 
    { label: 'SBC', value: 'SBC' }, 
    { label: 'VJNT', value: 'VJNT' }, 
    { label: 'SEBC', value: 'SEBC' }, 
    { label: 'Minority', value: 'Minority' },
  ];
  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-left"><h2 className="text-xl font-black text-slate-900 tracking-tight">{t.selectCategory}</h2><p className="text-slate-500 font-medium text-xs leading-relaxed">{t.selectCategorySub}</p></header>
      <div className="grid grid-cols-1 gap-2.5 no-select">{categories.map(cat => (
          <button key={cat.value} onClick={() => onSelect(cat.value)} className={`p-4 rounded-xl border-2 font-black transition-all text-left flex items-center justify-between active:scale-[0.98] ${selected === cat.value ? 'border-blue-600 bg-blue-50/30 text-blue-900' : 'border-slate-50 bg-[#fafafa] text-slate-600'}`}>
            <span className="text-xs uppercase tracking-tight">{cat.label}</span>
          </button>
        ))}</div>
    </div>
  );
};

const StepYear: React.FC<{ state: AppState; onUpdate: (updates: Partial<AppState>) => void; onContinue: () => void; t: any; }> = ({ state, onUpdate, onContinue, t }) => {
  const is2YearCourse = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom, CourseType.DPharm].includes(state.courseType!);
  const is3YearCourse = [CourseType.BA, CourseType.BSc, CourseType.BCom, CourseType.BBA, CourseType.BCA, CourseType.Poly_Diploma, CourseType.GNM].includes(state.courseType!);
  const years = is2YearCourse ? [1, 2] : is3YearCourse ? [1, 2, 3] : [1, 2, 3, 4];
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isASC = state.stream === Stream.ASC;
  const isHostelEligible = !isASC && state.category && ['Open', 'SC', 'ST', 'SBC', 'VJNT'].includes(state.category);
  
  const isDirectSecondYearEligible = (
    (state.stream === Stream.Pharmacy && state.courseType === CourseType.BPharm) ||
    (state.stream === Stream.Engineering && state.courseType === CourseType.BE_BTech)
  ) && state.currentYear === 2;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-left"><h2 className="text-xl font-black text-slate-900 tracking-tight">{t.selectYear}</h2><p className="text-slate-500 font-medium text-xs leading-relaxed">{t.selectYearSub}</p></header>
      <div className="grid grid-cols-2 gap-2.5 no-select">{years.map(y => (
          <button key={y} onClick={() => onUpdate({ currentYear: y })} className={`p-4 rounded-xl border-2 font-black text-[10px] uppercase transition-all active:scale-[0.97] ${state.currentYear === y ? 'border-blue-600 bg-blue-50/30 text-blue-900 shadow-md' : 'border-slate-50 bg-[#fafafa] text-slate-400'}`}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</button>
        ))}</div>
      
      {isDirectSecondYearEligible && (
        <div className="bg-slate-50 p-5 rounded-xl space-y-4 no-select border border-slate-200">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed text-center">{t.directSecondYearQuestion}</p>
          <div className="flex space-x-2.5">
            {[true, false].map(v => (
              <button key={v ? 'dsyy' : 'dsyn'} onClick={() => onUpdate({ isDirectSecondYear: v })} className={`flex-1 p-3.5 rounded-lg border-2 font-black text-[9px] transition-all uppercase ${state.isDirectSecondYear === v ? 'border-blue-600 bg-white text-blue-900 shadow-md' : 'border-white bg-white/60 text-slate-300'}`}>
                {v ? t.yes : t.no}
              </button>
            ))}
          </div>
        </div>
      )}

      {state.currentYear === 1 && (<div className="bg-slate-50 p-5 rounded-xl space-y-4 no-select border border-slate-200"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed text-center">{isMaster ? t.gapQuestionPG : t.gapQuestion}</p><div className="flex space-x-2.5">{[true, false].map(v => (<button key={v ? 'y' : 'n'} onClick={() => onUpdate({ hadGap: v })} className={`flex-1 p-3.5 rounded-lg border-2 font-black text-[9px] transition-all uppercase ${state.hadGap === v ? 'border-blue-600 bg-white text-blue-900 shadow-md' : 'border-white bg-white/60 text-slate-300'}`}>{v ? t.yes : t.no}</button>))}</div></div>)}
      {isHostelEligible && (<div className="bg-slate-50 p-5 rounded-xl space-y-4 no-select border border-slate-200"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed text-center">{t.hostelQuestion}</p><div className="flex space-x-2.5">{[true, false].map(v => (<button key={v ? 'hy' : 'hn'} onClick={() => onUpdate({ isHosteller: v })} className={`flex-1 p-3.5 rounded-lg border-2 font-black text-[9px] transition-all uppercase ${state.isHosteller === v ? 'border-blue-600 bg-white text-blue-900 shadow-md' : 'border-white bg-white/60 text-slate-300'}`}>{v ? t.yes : t.no}</button>))}</div></div>)}
      <button disabled={!state.currentYear} onClick={onContinue} className="w-full bg-blue-900 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-900/10 uppercase tracking-[0.2em] text-[10px] disabled:opacity-20 h-14">{t.continue}</button>
    </div>
  );
};

const StepLoginCheck: React.FC<{ ready: AppState['loginReady']; onToggle: (f: keyof AppState['loginReady']) => void; onContinue: () => void; t: any; }> = ({ ready, onToggle, onContinue, t }) => {
  const isReady = ready.username && ready.password && ready.mobile;
  return (
    <div className="space-y-6">
      <header className="space-y-1.5 text-left"><h2 className="text-xl font-black text-slate-900 tracking-tight">{t.loginCheck}</h2><p className="text-slate-500 font-medium text-xs leading-relaxed">{t.loginCheckSub}</p></header>
      <div className="bg-slate-50 p-5 rounded-2xl space-y-3.5 no-select border border-slate-200 shadow-inner">{[ { id: 'username', label: t.loginUser }, { id: 'password', label: t.loginPass }, { id: 'mobile', label: t.loginMobile } ].map(item => (
          <label key={item.id} className="flex items-center space-x-3.5 cursor-pointer active:opacity-70 group py-0.5">
            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${ready[item.id as keyof AppState['loginReady']] ? 'bg-blue-600 border-blue-600 shadow-lg' : 'bg-white border-slate-200'}`}>{ready[item.id as keyof AppState['loginReady']] && <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}</div>
            <input type="checkbox" checked={ready[item.id as keyof AppState['loginReady']]} onChange={() => onToggle(item.id as keyof AppState['loginReady'])} className="hidden" /><span className={`text-[10px] font-black tracking-tight uppercase ${ready[item.id as keyof AppState['loginReady']] ? 'text-blue-900' : 'text-slate-400'}`}>{item.label}</span>
          </label>
        ))}</div>
      <button disabled={!isReady} onClick={onContinue} className="w-full bg-blue-900 text-white font-black py-4 rounded-xl shadow-xl shadow-blue-900/10 active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] disabled:opacity-20 h-14">{t.continue}</button>
    </div>
  );
};

const DocBadge: React.FC<{ type: BadgeType; isPrint?: boolean }> = ({ type, isPrint }) => {
  const config = {
    merge: { text: 'MERGE REQUIRED', colors: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'M5 13l4 4L19 7' },
    onepdf: { text: 'ONE PDF', colors: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'M5 13l4 4L19 7' },
    optional: { text: 'OPTIONAL', colors: 'bg-slate-50 text-slate-500 border-slate-200', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ifavailable: { text: 'IF AVAILABLE', colors: 'bg-slate-50 text-slate-500 border-slate-200', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    anyone: { text: 'ANY ONE REQUIRED', colors: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'M5 13l4 4L19 7' },
    mandatory: { text: 'MANDATORY', colors: 'bg-red-50 text-red-700 border-red-100', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  }[type];
  if (isPrint) return <span className="print-badge">[{config.text}]</span>;
  return (
    <div className={`inline-flex items-center px-2 py-0.5 rounded-full border ${config.colors} whitespace-nowrap shrink-0 ml-2`}>
      <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={config.icon} /></svg>
      <span className="text-[7px] font-black uppercase tracking-tight">{config.text}</span>
    </div>
  );
};

const DeclarationCard: React.FC<{ title: string; instruction: string; fileName: string; downloadUrl: string; downloadLabel: string }> = ({ title, instruction, fileName, downloadUrl, downloadLabel }) => (
  <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-blue-200 transition-all group flex flex-col">
    <div className="mb-2.5">
      <h4 className="font-black text-slate-800 text-[12px] leading-tight group-hover:text-blue-900 transition-colors uppercase tracking-tight pr-4">{title}</h4>
    </div>
    <p className="text-[9px] font-medium text-slate-400 mb-3 leading-relaxed">{instruction}</p>
    
    <a 
      href={downloadUrl} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-50 hover:bg-blue-600 border border-slate-200 hover:border-blue-600 text-slate-700 hover:text-white rounded-lg transition-all shadow-sm active:scale-[0.97] self-start mb-4 group/btn"
      aria-label="Download declaration form PDF"
    >
      <svg className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      <span className="text-[9px] font-black uppercase tracking-widest">{downloadLabel}</span>
    </a>

    <div className="mt-auto pt-3 border-t border-slate-50 flex flex-wrap gap-1.5">
      <span className="text-[7px] font-black bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-slate-100">PDF ONLY</span>
      <span className="text-[7px] font-black bg-slate-50 text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-widest border border-slate-100">MAX 250 KB</span>
      <span className="text-[7px] font-black bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-tight border border-blue-100">ONE PDF</span>
      <span className="text-[7px] font-black bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-tight italic border border-blue-100">FILE: {fileName}</span>
    </div>
  </div>
);

const StepDocumentList: React.FC<{ state: AppState; onRestart: () => void; onBack: () => void; onOpenVideo: (title: string, desc: string, url?: string) => void; t: any; }> = ({ state, onRestart, onBack, onOpenVideo, t }) => {
  const isFresh = state.currentYear === 1;
  const isDPharm = state.courseType === CourseType.DPharm;
  const isASC = state.stream === Stream.ASC;
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isEngineering = state.stream === Stream.Engineering;
  const isTechnical = [Stream.Engineering, Stream.Pharmacy, Stream.Management, Stream.Nursing].includes(state.stream!);

  const [shouldAnimate, setShouldAnimate] = useState(true);
  const printBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting && entry.boundingClientRect.top < 0) {
          setShouldAnimate(false);
        }
      },
      { threshold: 0 }
    );
    if (printBtnRef.current) observer.observe(printBtnRef.current);
    const stopAnimation = () => setShouldAnimate(false);
    window.addEventListener('scroll', stopAnimation, { once: true });
    window.addEventListener('touchstart', stopAnimation, { once: true });
    window.addEventListener('mousedown', stopAnimation, { once: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', stopAnimation);
      window.removeEventListener('touchstart', stopAnimation);
      window.removeEventListener('mousedown', stopAnimation);
    };
  }, []);

  // 1) Caste Details
  const casteDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    if (state.category === 'Open' || state.category === 'Minority') return docs;

    docs.push({ name: t.docCasteCert, badge: 'mandatory' });

    // Caste Validity
    const validityMandatory = (isTechnical && state.category === 'VJNT') || 
                             [CourseType.MBA, CourseType.MCA, CourseType.MCom, CourseType.MSc].includes(state.courseType as CourseType);
    
    docs.push({ 
      name: t.docCasteValidity, 
      badge: validityMandatory ? 'mandatory' : 'optional' 
    });

    // Non-Creamy Layer
    if (['OBC', 'SEBC', 'SBC', 'VJNT'].includes(state.category!)) {
      docs.push({ name: t.docNCL, badge: 'mandatory' });
    }

    return docs;
  }, [state.category, isTechnical, t]);

  // 2) Income Details
  const incomeDocs = useMemo<DocItem[]>(() => {
    return [{ name: t.docIncomeCert }];
  }, [t]);

  // 3) Domicile Details
  const domicileDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    docs.push({ name: t.docDomicileCert });
    if (state.category === 'Open' && state.isHosteller) {
      docs.push({ name: 'Alpabhudharak Certificate / Job Card', badge: 'anyone' });
    }
    return docs;
  }, [state.category, state.isHosteller, t]);

  // 4) Bank Details
  const bankDocs = useMemo<DocItem[]>(() => {
    return [
      { name: t.docAadhaarCard },
      { name: t.docBankPassbook }
    ];
  }, [t]);

  // 5) Current Course Details
  const currentCourseDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    
    // 1. Bonafide / Fees
    docs.push({ name: t.docAdmissionBonafide });
    if (state.category === 'Open') {
      docs.push({ name: t.docFeesReceipt, badge: 'merge' });
    }

    // 2. Allotment Letter
    if (!isASC) {
      docs.push({ name: t.docAllotment });
    }

    // 3. Academic Marksheets
    if (state.isDirectSecondYear && (isEngineering || state.courseType === CourseType.BPharm)) {
       docs.push({ name: t.docDiplomaFinalMarksheet, badge: 'onepdf' });
    }

    if (!isFresh) {
      if (isDPharm || state.courseType === CourseType.Poly_Diploma) {
        if (state.currentYear === 2) docs.push({ name: '1st Year Marksheet', badge: 'onepdf' });
        if (state.currentYear === 3) docs.push({ name: '2nd Year Marksheet', badge: 'onepdf' });
      } else if (state.isDirectSecondYear) {
        if (state.currentYear! >= 3) {
          docs.push({ name: '2nd Year Marksheet (Sem 3 + Sem 4)', badge: 'merge' });
        }
        if (state.currentYear! >= 4) {
          docs.push({ name: '3rd Year Marksheet (Sem 5 + Sem 6)', badge: 'merge' });
        }
      } else {
        if (state.currentYear! >= 2) {
          docs.push({ name: '1st Year Marksheet (Sem 1 + Sem 2)', badge: 'merge' });
        }
        if (state.currentYear! >= 3) {
          docs.push({ name: '2nd Year Marksheet (Sem 3 + Sem 4)', badge: 'merge' });
        }
        if (state.currentYear! >= 4) {
          docs.push({ name: '3rd Year Marksheet (Sem 5 + Sem 6)', badge: 'merge' });
        }
      }
    }

    return docs;
  }, [state.category, isASC, isFresh, isDPharm, state.isDirectSecondYear, state.currentYear, state.courseType, isEngineering, t]);

  // 6) Previous Education Details
  const prevEduDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    
    docs.push({ name: t.doc10thMarksheet });
    docs.push({ name: t.doc12thMarksheet });
    
    if (isMaster) {
      docs.push({ name: t.docGradMarksheet });
    }

    if (state.hadGap) {
      docs.push({ name: t.docGapCert, badge: 'onepdf' });
    }

    return docs;
  }, [isMaster, state.hadGap, t]);

  // 7) Leaving Certificates
  const leavingCertDocsList = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    if (isMaster) {
      if (isFresh) docs.push({ name: t.docGradTC });
    } else if (isFresh) {
      docs.push({ name: t.docLeavingCert });
    }
    return docs;
  }, [isFresh, isMaster, t]);

  // 8) Hostel Details
  const hostelDocsList = useMemo<DocItem[]>(() => {
    const isHostelEligibleCategory = state.category && ['Open', 'SC', 'ST', 'SBC', 'VJNT'].includes(state.category);
    if (state.isHosteller && !isASC && isHostelEligibleCategory) {
      return [{ name: t.docHostelBond, badge: 'merge', fileName: 'Hostel_Bond_Tax_Receipt.pdf' }];
    }
    return [];
  }, [state.isHosteller, isASC, state.category, t]);

  // 9) Declaration Forms
  const declarationForms = useMemo(() => {
    const commonDeclLink = "https://www.atharvacoe.ac.in/wp-content/uploads/Pratidnya-Patra.pdf";
    const minorityDeclLink = "https://www.mhssce.ac.in/pdf/Income_Self_declaration_minority.pdf";
    
    if (state.category === 'Open') {
      if (state.isHosteller) {
         return [
           { title: t.declOpenTitle1, instruction: t.declOpenInst, fileName: "Declaration1_RationCard.pdf", downloadUrl: commonDeclLink }, 
           { title: t.declOpenTitle2, instruction: t.declOpenInst, fileName: "Declaration2_RationCard.pdf", downloadUrl: commonDeclLink }
         ];
      }
      return [{ title: t.declOpenTitle, instruction: t.declOpenInst, fileName: "Declaration_RationCard.pdf", downloadUrl: commonDeclLink }];
    }
    if (['OBC', 'SC', 'ST', 'SBC', 'VJNT', 'SEBC'].includes(state.category!)) {
      return [{ title: t.declObcTitle, instruction: t.declObcInst, fileName: "Declaration.pdf", downloadUrl: commonDeclLink }];
    }
    if (state.category === 'Minority') {
      return [{ title: t.declMinorityTitle, instruction: t.declMinorityInst, fileName: "Minority_Declaration.pdf", downloadUrl: minorityDeclLink }];
    }
    return null;
  }, [state.category, state.isHosteller, t]);

  const allSections = useMemo(() => {
    const sections: { type: string; title?: string; sub?: string; icon?: React.ReactNode; docs?: DocItem[] }[] = [
      { type: 'docs', title: t.casteDocs, sub: t.casteDocsSub, icon: <ShieldCheck className="w-4 h-4" />, docs: casteDocs },
      { type: 'docs', title: t.incomeDocs, sub: t.incomeDocsSub, icon: <IndianRupee className="w-4 h-4" />, docs: incomeDocs },
      { type: 'docs', title: t.domicileDocs, sub: t.domicileDocsSub, icon: <Home className="w-4 h-4" />, docs: domicileDocs },
      { type: 'docs', title: t.bankDocs, sub: t.bankDocsSub, icon: <CreditCard className="w-4 h-4" />, docs: bankDocs },
      { type: 'docs', title: t.currentCourseDocs, sub: t.currentCourseDocsSub, icon: <GraduationCap className="w-4 h-4" />, docs: currentCourseDocs },
      { type: 'docs', title: t.prevEduDocs, sub: t.prevEduDocsSub, icon: <History className="w-4 h-4" />, docs: prevEduDocs },
      { type: 'docs', title: t.hostelDocsSection, sub: t.hostelDocsSectionSub, icon: <Building2 className="w-4 h-4" />, docs: hostelDocsList },
      { type: 'declaration' },
      { type: 'docs', title: t.leavingCertDocs, sub: t.leavingCertDocsSub, icon: <LogOut className="w-4 h-4" />, docs: leavingCertDocsList },
    ];
    
    return sections.filter(s => {
      if (s.type === 'declaration') return declarationForms !== null;
      return s.docs && s.docs.length > 0;
    });
  }, [casteDocs, incomeDocs, domicileDocs, bankDocs, currentCourseDocs, prevEduDocs, hostelDocsList, leavingCertDocsList, declarationForms, t]);

  const handlePrint = () => {
    setShouldAnimate(false);
    window.print();
  };

  const handleShareOnWhatsApp = () => {
    const mode = isFresh ? t.freshApp : t.renewalApp;
    const yearSuffix = state.currentYear === 1 ? 'st' : state.currentYear === 2 ? 'nd' : state.currentYear === 3 ? 'rd' : 'th';
    const hostelStatus = state.isHosteller ? t.yes : t.no;
    
    let message = `*${t.waChecklistHeader}*\n\n`;
    message += `🎓 *Course:* ${state.courseType || state.stream}\n`;
    message += `📅 *Year:* ${state.currentYear}${yearSuffix} Year\n`;
    message += `🏷️ *Category:* ${state.category}\n`;
    message += `📝 *Mode:* ${mode}\n`;
    if (!isASC) {
      message += `🏠 *Hosteller:* ${hostelStatus}\n`;
    }
    message += `\n`;

    allSections.forEach(section => {
      if (section.type === 'declaration') {
        message += `✅ *${t.declarationDocsSection}:*\n`;
        declarationForms?.forEach(d => message += `• ${d.title}\n`);
      } else {
        message += `✅ *${section.title}:*\n`;
        section.docs?.forEach(d => {
          if (d.name) message += `• ${d.name}\n`;
        });
      }
      message += `\n`;
    });

    message += `_${t.waGeneratedBy}_`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  const printArea = document.getElementById('print-area');

  return (
    <div className="space-y-8">
      {printArea && createPortal(
        <div className="space-y-12">
          <header className="border-b-4 border-black pb-8 mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">MahaDBT Scholarship Checklist</h1>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">Pathrikar Campus Assistance Output</p>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-t border-slate-200 pt-6">
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Target Course</span><span className="text-base font-black text-black leading-tight">{state.courseType || state.stream}</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Caste Category</span><span className="text-base font-black text-black leading-tight">{state.category}</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Academic Year</span><span className="text-base font-black text-black leading-tight">{state.currentYear}{state.currentYear === 1 ? 'st' : state.currentYear === 2 ? 'nd' : state.currentYear === 3 ? 'rd' : 'th'} Year</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Application Mode</span><span className="text-base font-black text-black leading-tight">{isFresh ? "FRESH APPLICATION" : "RENEWAL APPLICATION"}</span></div>
            </div>
          </header>
          <div className="space-y-10">
            {allSections.map((section, sIdx) => {
              if (section.type === 'declaration') {
                return (
                  <div key={sIdx} className="print-section">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t.declarationDocsSection}</h3>
                    {declarationForms?.map((decl, idx) => (
                      <div key={idx} className="print-doc-item">
                        <span className="print-checkbox"></span>
                        <span className="text-sm font-black uppercase">{decl.title}</span>
                      </div>
                    ))}
                  </div>
                );
              }
              
              return (
                <div key={sIdx} className="print-section">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{section.title}</h3>
                  {section.docs?.filter(doc => doc.name).map((doc, dIdx) => (
                    <div key={dIdx} className="print-doc-item">
                      <span className="print-checkbox"></span>
                      <span className="text-sm font-black uppercase">
                        {doc.name}{doc.badge && <DocBadge type={doc.badge} isPrint />}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
          <footer className="mt-12 pt-8 border-t border-black text-center">
            <p className="text-sm font-black uppercase tracking-widest text-black mb-2">Final verification at college office.</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-tighter">Generated on {new Date().toLocaleDateString()}</p>
          </footer>
        </div>, printArea
      )}

      <header className="space-y-3 no-print text-left">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <h2 className="text-lg font-black text-slate-900 tracking-tight leading-tight uppercase max-w-sm">{t.docsTitle}</h2>
          <div className="flex flex-col items-start sm:items-end shrink-0">
            <button ref={printBtnRef} onClick={handlePrint} className={`inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-500 rounded-lg transition-all border border-slate-200/60 shadow-sm cursor-pointer group ${shouldAnimate ? 'animate-soft-pulse' : ''}`}>
              <svg className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 00-2 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              <span className="text-[9px] font-bold whitespace-nowrap tracking-tight">Print Checklist</span>
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 mt-1">{[state.courseType || state.stream, state.category, `${state.currentYear} Year`, isFresh ? t.freshApp : t.renewalApp].map((pill, i) => (<span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[8px] font-black rounded uppercase border border-slate-100 shadow-sm tracking-tight">{pill}</span>))}</div>
      </header>

      <div className="p-5 bg-[#1e3a8a] text-white rounded-2xl text-left relative overflow-hidden shadow-xl shadow-blue-900/10 no-print">
        <h4 className="text-blue-300 font-black text-[9px] uppercase tracking-[0.4em] mb-4">Submission Protocol</h4>
        <ul className="space-y-2.5 text-[11px] font-bold leading-relaxed opacity-90">
          <li className="flex items-start space-x-2.5"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(96,165,250,0.6)]"/> <span>{t.rulePdf}</span></li>
          <li className="flex items-start space-x-2.5"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(96,165,250,0.6)]"/> <span>{t.ruleSize}</span></li>
          <li className="flex items-start space-x-2.5"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(96,165,250,0.6)]"/> <span className="text-blue-100/70 italic font-medium">{t.ruleNaming}</span></li>
        </ul>
      </div>

      <div className="space-y-6 no-print">
        {allSections.map((section, sIdx) => {
          if (section.type === 'declaration') {
            return (
              <section key={sIdx} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden text-left">
                <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 text-blue-600 shadow-sm">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{t.declarationDocsSection}</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.declarationDocsSectionSub}</p>
                    </div>
                  </div>
                </div>
                <div className="p-5 space-y-3">
                  {declarationForms?.map((decl, idx) => (
                    <DeclarationCard key={idx} {...decl} downloadLabel={t.downloadForm} />
                  ))}
                </div>
              </section>
            );
          }
          
          return (
            <section key={sIdx} className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden text-left">
              <div className="bg-slate-50/50 px-5 py-4 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 text-blue-600 shadow-sm">
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">{section.title}</h3>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{section.sub}</p>
                  </div>
                </div>
              </div>
              {section.docs && section.docs.length > 0 && (
                <div className="p-5 space-y-4">
                  {section.docs.filter(doc => doc.name).map((doc, dIdx) => (
                    <div key={dIdx} className="flex items-start space-x-3 group">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-600/30 mt-1.5 shrink-0 group-hover:bg-blue-600 transition-colors" />
                      <div className="min-w-0 flex-1">
                        <h4 className="font-black text-slate-700 text-[11px] leading-relaxed group-hover:text-blue-900 transition-colors uppercase tracking-tight whitespace-normal break-words flex items-center flex-wrap gap-1.5">
                          {doc.name}{doc.badge && <DocBadge type={doc.badge} />}
                        </h4>
                        {doc.fileName && <span className="text-[8px] font-bold text-blue-600/60 block mt-0.5 lowercase italic">File: {doc.fileName}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <section className="space-y-5 pt-8 border-t border-slate-100 no-print text-left">
        <h3 className="font-black text-slate-900 text-base uppercase tracking-tight">{t.docToolsTitle}</h3>
        <div className="grid grid-cols-1 gap-2.5">
          {[ { label: t.btnMerge, sub: t.helperMerge, url: 'https://www.ilovepdf.com/merge_pdf' }, { label: t.btnCompress, sub: t.helperCompress, url: 'https://www.ilovepdf.com/compress_pdf' }, { label: t.btnImgToPdf, sub: t.helperImgToPdf, url: 'https://www.ilovepdf.com/jpg_to_pdf' } ].map((tool, i) => (
            <a key={i} href={tool.url} target="_blank" rel="noopener noreferrer" className="p-4 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-white bg-white shadow-[0_1px_4px_rgba(0,0,0,0.01)] active:scale-[0.98] transition-all flex flex-col group text-left">
              <span className="font-black text-[10px] uppercase tracking-widest text-slate-800 group-hover:text-blue-900 transition-colors">{tool.label}</span>
              <span className="text-[8px] font-bold text-slate-400 mt-1.5 group-hover:text-slate-500 transition-colors">{tool.sub}</span>
            </a>
          ))}
        </div>
      </section>

      <div className="space-y-2.5 mt-6 no-print">
        <button 
          onClick={handleShareOnWhatsApp} 
          className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-black px-6 py-4 rounded-xl shadow-lg shadow-green-500/10 active:scale-[0.96] transition-all flex items-center justify-center space-x-3 mb-1.5 min-h-[52px] text-center"
          aria-label="Share document checklist on WhatsApp"
        >
          <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 448 512">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
          <span className="text-[10px] uppercase font-black tracking-[0.05em] leading-snug break-words max-w-[200px]">
            {t.shareWhatsApp}
          </span>
        </button>
        <button onClick={onRestart} className="w-full bg-blue-900 text-white font-black py-4 rounded-xl shadow-2xl shadow-blue-900/10 active:scale-[0.98] uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-blue-800 h-14">{t.home}</button>
      </div>
    </div>
  );
};

export default App;