import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CreditCard,
  Smartphone,
  Check,
  ChevronRight,
  ArrowLeft,
  ExternalLink,
  GraduationCap,
  Home,
  IndianRupee,
  FileText,
  Building2,
  LogOut,
  History,
  FileDown,
  RotateCcw,
  Info,
  CheckCircle2,
  Layers
} from 'lucide-react';
import { Stream, CourseType, Category, AppState, Language, DsyQualification } from './types';
import { translations } from './translations';
import { generateChecklistPdf } from './pdfGenerator';
import { AdBanner } from './AdBanner';

const PERSISTENCE_KEY = 'mahadbt_assist_state_v6';

type BadgeType = 'mandatory' | 'required_otp' | 'anyone' | 'dsy' | 'onepdf' | 'merge' | 'optional';

interface DocItem {
  name: string;
  englishName?: string;
  subName?: string;
  englishSubName?: string;
  badge?: BadgeType;
  fileName?: string;
  instruction?: string;
  isDsyQualifying?: boolean;
  dsyCourse?: 'polytechnic' | 'be_btech';
}

interface FlatDocItem {
  id: string;
  name: string;
  subName?: string;
  category: string;
  badge?: BadgeType;
  fileName?: string;
  instruction?: string;
  isDsyQualifying?: boolean;
  dsyCourse?: 'polytechnic' | 'be_btech';
}

const App: React.FC = () => {
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
      isDirectSecondYear: false,
      dsyQualification: null,
    };
  });

  useEffect(() => {
    localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.documentElement.lang = state.language;
  }, [state.language]);

  const t = translations[state.language];

  const handleStreamSelect = (s: Stream) => {
    setState(prev => ({
      ...prev,
      stream: s,
      courseType: null,
      currentYear: null,
      category: null,
      isDirectSecondYear: false,
      dsyQualification: null,
      step: 2
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
      dsyQualification: null,
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
    setState(prev => ({ ...prev, step: Math.min(5, prev.step + 1) }));
  };

  const prevStep = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      dsyQualification: null,
    };
    setState(newState);
    localStorage.removeItem(PERSISTENCE_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F7F8FA] text-[#0F172A] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 antialiased">
      {/* Top App Bar - Fixed/Sticky Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/70 pt-safe no-select">
        <div className="max-w-xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Product Brand */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <img
              src="/logo.png"
              alt="MahaScholar Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 block leading-tight">MahaScholar</span>
              <span className="text-[10px] sm:text-xs font-semibold text-slate-400 block leading-none">Document Guide</span>
            </div>
          </div>

          {/* Segmented Language Switcher */}
          <nav aria-label="Language" className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/60 shadow-inner">
            {(['en', 'hi', 'mr'] as Language[]).map(lang => (
              <button
                key={lang}
                type="button"
                onClick={() => setState(prev => ({ ...prev, language: lang }))}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all duration-200 min-h-[30px] flex items-center justify-center ${
                  state.language === lang
                    ? 'bg-white text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {lang === 'en' ? t.langEn : lang === 'hi' ? t.langHi : t.langMr}
              </button>
            ))}
          </nav>
        </div>

        {/* Step Progress Bar & Step Label */}
        {state.step <= 4 && (
          <div className="max-w-xl mx-auto px-4 sm:px-6 pb-2.5 pt-0.5">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              <span>{t.step} {state.step} {t.of} 4</span>
              <span className="text-slate-600 font-extrabold">
                {state.step === 1 && t.selectStream}
                {state.step === 2 && t.selectCourse}
                {state.step === 3 && t.selectCategory}
                {state.step === 4 && t.selectYear}
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-400 ease-out rounded-full"
                style={{ width: `${(state.step / 4) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area - Constrained to 640px for Android-First centered layout */}
      <main className="w-full max-w-xl mx-auto px-4 sm:px-6 pt-5 pb-0">
        {/* Back Button */}
        {state.step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors py-2 pr-3 mb-4 rounded-lg active:scale-95 touch-manipulation min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.back}</span>
          </button>
        )}

        {/* Step Screens */}
        <div className="step-enter">
          {state.step === 1 && (
            <StepStream selected={state.stream} onSelect={handleStreamSelect} t={t} />
          )}

          {state.step === 2 && (
            <StepCourse
              stream={state.stream}
              selected={state.courseType}
              onSelect={handleCourseSelect}
              t={t}
            />
          )}

          {state.step === 3 && (
            <StepCategory
              selected={state.category}
              onSelect={handleCategorySelect}
              t={t}
            />
          )}

          {state.step === 4 && (
            <StepYear
              state={state}
              onUpdate={updates =>
                setState(prev => {
                  if ('currentYear' in updates) {
                    return { ...prev, ...updates, isDirectSecondYear: false, dsyQualification: null };
                  }
                  return { ...prev, ...updates };
                })
              }
              onContinue={nextStep}
              t={t}
            />
          )}

          {state.step === 5 && (
            <StepDocumentList
              state={state}
              onRestart={handleRestart}
              onUpdateQualification={q => setState(prev => ({ ...prev, dsyQualification: q }))}
              t={t}
            />
          )}
        </div>
      </main>

      {/* Ad Placement: Bottom of suitable content screens (Steps 1-4) */}
      {state.step < 5 && (
        <div className="w-full max-w-xl mx-auto px-4 sm:px-6">
          <AdBanner placement="screenBottom" />
        </div>
      )}

      {/* Footer for Steps 1-4 (Borderless, compact 12px text) */}
      {state.step < 5 && (
        <footer className="w-full mt-3 pb-2 text-center text-[12px] text-slate-400 font-normal">
          <p>
            Created by{' '}
            <a
              href="https://www.instagram.com/sohellsd/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Sohel Sayyad
            </a>
          </p>
        </footer>
      )}
    </div>
  );
};

/* ==========================================================================
   BADGE COMPONENT
   ========================================================================== */

const DocBadge: React.FC<{ type: BadgeType; labelOverride?: string; t?: any }> = ({
  type,
  labelOverride,
  t
}) => {
  const configs: Record<BadgeType, { text: string; style: string }> = {
    mandatory: {
      text: labelOverride || (t?.badgeMandatory ? t.badgeMandatory : 'REQUIRED'),
      style: 'bg-[#FEECEC] text-[#B42318]'
    },
    required_otp: {
      text: labelOverride || (t?.aadhaarMobileBadge ? t.aadhaarMobileBadge : 'FOR OTP'),
      style: 'bg-[#FFF4DB] text-[#8A5A00]'
    },
    anyone: {
      text: labelOverride || (t?.badgeAnyOne ? t.badgeAnyOne : 'ANY ONE'),
      style: 'bg-indigo-50 text-indigo-700'
    },
    dsy: {
      text: labelOverride || 'DSY',
      style: 'bg-amber-50 text-amber-800'
    },
    onepdf: {
      text: labelOverride || (t?.badgeOnePdf ? t.badgeOnePdf : 'ONE PDF'),
      style: 'bg-sky-50 text-sky-700'
    },
    merge: {
      text: labelOverride || (t?.badgeMerge ? t.badgeMerge : 'Create One PDF'),
      style: 'bg-sky-50 text-sky-700'
    },
    optional: {
      text: labelOverride || (t?.badgeOptional ? t.badgeOptional : 'OPTIONAL'),
      style: 'bg-slate-100 text-slate-600'
    }
  };

  const item = configs[type] || configs.mandatory;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11px] font-semibold leading-[14px] ${item.style} shrink-0`}
    >
      {item.text}
    </span>
  );
};

/* ==========================================================================
   DOCUMENT ROW COMPONENT (Informational List-Row System - NO Checkboxes)
   ========================================================================== */

interface DocumentRowProps {
  name: string;
  subName?: string;
  badge?: BadgeType;
  badgeLabel?: string;
  fileName?: string;
  instruction?: string;
  isDsyQualifying?: boolean;
  dsyCourse?: 'polytechnic' | 'be_btech';
  selectedDsyQual?: DsyQualification | null;
  onSelectDsyQual?: (q: DsyQualification) => void;
  t: any;
}

const DocumentRow: React.FC<DocumentRowProps> = ({
  name,
  subName,
  badge,
  badgeLabel,
  fileName,
  instruction,
  isDsyQualifying,
  dsyCourse,
  selectedDsyQual,
  onSelectDsyQual,
  t
}) => {
  return (
    <div className="py-3 px-1 text-left first:pt-2 last:pb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline flex-wrap gap-2">
            <span className="text-[14px] sm:text-[15px] font-semibold text-slate-900 leading-snug">
              {name}
            </span>
            {badge && <DocBadge type={badge} labelOverride={badgeLabel} t={t} />}
            {fileName && (
              <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                {fileName}
              </span>
            )}
          </div>

          {/* SubName or instruction underneath */}
          {subName && (
            <p className="text-[12px] font-medium text-indigo-700 mt-0.5 leading-normal">
              {subName}
            </p>
          )}

          {instruction && (
            <p className="text-[11px] text-slate-500 mt-0.5 leading-normal">
              {instruction}
            </p>
          )}
        </div>
      </div>

      {/* DSY Qualification Selector (if applicable) */}
      {isDsyQualifying && (
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            {t.dsySelectQual}
          </span>
          <div className="grid grid-cols-2 gap-2">
            {dsyCourse === 'polytechnic' ? (
              <>
                <button
                  type="button"
                  onClick={() => onSelectDsyQual?.('iti')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
                    selectedDsyQual === 'iti' || !selectedDsyQual
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.dsyItiMarksheet}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDsyQual?.('12th')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
                    selectedDsyQual === '12th'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.dsy12thMarksheet}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelectDsyQual?.('diploma')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
                    selectedDsyQual === 'diploma' || !selectedDsyQual
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.dsyDiplomaMarksheet}
                </button>
                <button
                  type="button"
                  onClick={() => onSelectDsyQual?.('equivalent')}
                  className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border text-center cursor-pointer ${
                    selectedDsyQual === 'equivalent'
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.dsyEquivalentDoc}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ==========================================================================
   STEP 1: STREAM SELECTION (Clean List with tactile touch targets)
   ========================================================================== */

const StepStream: React.FC<{
  selected: Stream | null;
  onSelect: (s: Stream) => void;
  t: any;
}> = ({ selected, onSelect, t }) => {
  const streams = [
    {
      id: Stream.Engineering,
      title: t.engLabel,
      subtitle: t.engTip,
      icon: <GraduationCap className="w-5 h-5 text-indigo-600" />
    },
    {
      id: Stream.Pharmacy,
      title: t.pharmLabel,
      subtitle: t.pharmTip,
      icon: <FileText className="w-5 h-5 text-emerald-600" />
    },
    {
      id: Stream.Management,
      title: t.mgmtLabel,
      subtitle: t.mgmtTip,
      icon: <Building2 className="w-5 h-5 text-blue-600" />
    },
    {
      id: Stream.Nursing,
      title: t.nursLabel,
      subtitle: t.nursTip,
      icon: <ShieldCheck className="w-5 h-5 text-rose-600" />
    },
    {
      id: Stream.ASC,
      title: t.ascLabel,
      subtitle: t.ascTip,
      icon: <History className="w-5 h-5 text-violet-600" />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.selectStream}
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {t.selectStreamSub}
        </p>
      </div>

      <div className="space-y-2.5">
        {streams.map(s => {
          const isChosen = selected === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              className={`w-full p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between min-h-[64px] active:scale-[0.99] touch-manipulation ${
                isChosen
                  ? 'bg-indigo-50/50 border-indigo-600 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center space-x-3.5 min-w-0 pr-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {s.icon}
                </div>
                <div className="min-w-0">
                  <span className="text-base font-bold text-slate-900 block leading-tight">
                    {s.title}
                  </span>
                  <span className="text-xs font-semibold text-slate-400 mt-0.5 block truncate">
                    {s.subtitle}
                  </span>
                </div>
              </div>
              <div className="shrink-0 text-slate-400">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ==========================================================================
   STEP 2: COURSE SELECTION
   ========================================================================== */

const StepCourse: React.FC<{
  stream: Stream | null;
  selected: CourseType | null;
  onSelect: (c: CourseType) => void;
  t: any;
}> = ({ stream, selected, onSelect, t }) => {
  const courses: CourseType[] = useMemo(() => {
    switch (stream) {
      case Stream.Engineering:
        return [CourseType.BE_BTech, CourseType.Poly_Diploma];
      case Stream.Pharmacy:
        return [CourseType.BPharm, CourseType.DPharm, CourseType.MPharm];
      case Stream.Management:
        return [CourseType.MBA, CourseType.MCA, CourseType.BBA, CourseType.BCA];
      case Stream.Nursing:
        return [CourseType.BScNursing, CourseType.PGNursing];
      case Stream.ASC:
        return [CourseType.BA, CourseType.BSc, CourseType.BCom, CourseType.MA, CourseType.MSc, CourseType.MCom];
      default:
        return [];
    }
  }, [stream]);

  const getCourseSubtitle = (c: CourseType): string | undefined => {
    if (c === CourseType.BScNursing) return t.fourYears || '4 Years';
    if (c === CourseType.PGNursing) return t.postgraduate || 'Postgraduate';
    return undefined;
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.selectCourse}
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {t.selectCourseSub}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {courses.map(course => {
          const isChosen = selected === course;
          const subtitle = getCourseSubtitle(course);
          return (
            <button
              key={course}
              type="button"
              onClick={() => onSelect(course)}
              className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-center justify-between min-h-[56px] active:scale-[0.99] touch-manipulation cursor-pointer ${
                isChosen
                  ? 'bg-indigo-50/50 border-indigo-600 shadow-xs'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                  {course}
                </span>
                {subtitle && (
                  <span className="text-xs font-semibold text-slate-500 mt-0.5 block">
                    {subtitle}
                  </span>
                )}
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ml-3 ${
                  isChosen ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 bg-white'
                }`}
              >
                {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ==========================================================================
   STEP 3: CATEGORY SELECTION
   ========================================================================== */

const StepCategory: React.FC<{
  selected: Category | null;
  onSelect: (cat: Category) => void;
  t: any;
}> = ({ selected, onSelect, t }) => {
  const categories: { id: Category; label: string }[] = [
    { id: 'Open', label: t.catOpen },
    { id: 'OBC', label: t.catOBC },
    { id: 'SC', label: t.catSC },
    { id: 'ST', label: t.catST },
    { id: 'VJNT', label: t.catVJNT },
    { id: 'SBC', label: t.catSBC },
    { id: 'SEBC', label: t.catSEBC },
    { id: 'Minority', label: t.catMinority }
  ];

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.selectCategory}
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {t.selectCategorySub}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {categories.map(cat => {
          const isChosen = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`p-4 rounded-2xl border text-center transition-all duration-200 min-h-[58px] flex items-center justify-center active:scale-[0.98] touch-manipulation ${
                isChosen
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-900 border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <span className="text-sm sm:text-base font-bold leading-tight">
                {cat.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ==========================================================================
   STEP 4: YEAR, DSY, GAP & HOSTEL
   ========================================================================== */

const StepYear: React.FC<{
  state: AppState;
  onUpdate: (updates: Partial<AppState>) => void;
  onContinue: () => void;
  t: any;
}> = ({ state, onUpdate, onContinue, t }) => {
  const years = useMemo(() => {
    if (state.courseType === CourseType.BE_BTech) return [1, 2, 3, 4];
    if (state.courseType === CourseType.BPharm) return [1, 2, 3, 4];
    if (state.courseType === CourseType.BScNursing) return [1, 2, 3, 4];
    if (state.courseType === CourseType.DPharm) return [1, 2];
    if (state.courseType === CourseType.Poly_Diploma) return [1, 2, 3];
    if (state.courseType === CourseType.GNM) return [1, 2, 3];
    if (
      [
        CourseType.MBA,
        CourseType.MCA,
        CourseType.PGNursing,
        CourseType.MPharm,
        CourseType.MA,
        CourseType.MSc,
        CourseType.MCom
      ].includes(state.courseType!)
    ) {
      return [1, 2];
    }
    return [1, 2, 3];
  }, [state.courseType]);

  const isDirectSecondYearEligible =
    ((state.stream === Stream.Pharmacy && state.courseType === CourseType.BPharm) ||
      (state.stream === Stream.Engineering &&
        (state.courseType === CourseType.BE_BTech || state.courseType === CourseType.Poly_Diploma))) &&
    state.currentYear === 2;

  const isHostelEligibleCategory =
    state.category && ['Open', 'SC', 'ST', 'SBC', 'VJNT'].includes(state.category);
  const isHostelEligible = state.stream !== Stream.ASC && isHostelEligibleCategory;
  const isMaster = [
    CourseType.MPharm,
    CourseType.MBA,
    CourseType.MCA,
    CourseType.PGNursing,
    CourseType.MA,
    CourseType.MSc,
    CourseType.MCom
  ].includes(state.courseType!);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          {t.selectYear}
        </h2>
        <p className="text-sm font-medium text-slate-500 mt-1">
          {t.selectYearSub}
        </p>
      </div>

      {/* Year Selection Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {years.map(y => {
          const isChosen = state.currentYear === y;
          const suffix = y === 1 ? t.st : y === 2 ? t.nd : y === 3 ? t.rd : t.th;
          return (
            <button
              key={y}
              type="button"
              onClick={() => onUpdate({ currentYear: y })}
              className={`p-3.5 rounded-2xl border text-center transition-all duration-200 min-h-[64px] flex flex-col items-center justify-center active:scale-[0.98] touch-manipulation ${
                isChosen
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-white text-slate-800 border-slate-200/80 hover:border-slate-300 shadow-xs'
              }`}
            >
              <span className="text-base sm:text-lg font-black leading-tight">
                {y}{suffix}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider opacity-70 mt-0.5">
                {t.yearLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* DSY Conditional Question */}
      {isDirectSecondYearEligible && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            {t.directSecondYearQuestion}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map(v => (
              <button
                key={v ? 'dsy-yes' : 'dsy-no'}
                type="button"
                onClick={() =>
                  onUpdate({
                    isDirectSecondYear: v,
                    dsyQualification: v ? (state.courseType === CourseType.Poly_Diploma ? 'iti' : 'diploma') : null
                  })
                }
                className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                  state.isDirectSecondYear === v
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {v ? t.yes : t.no}
              </button>
            ))}
          </div>

          {/* DSY Qualifying choice preview */}
          {state.isDirectSecondYear && (
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                {t.dsySelectQual}
              </span>
              <div className="grid grid-cols-2 gap-2">
                {state.courseType === CourseType.Poly_Diploma ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onUpdate({ dsyQualification: 'iti' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[42px] ${
                        state.dsyQualification === 'iti' || !state.dsyQualification
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.dsyItiMarksheet}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate({ dsyQualification: '12th' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[42px] ${
                        state.dsyQualification === '12th'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.dsy12thMarksheet}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => onUpdate({ dsyQualification: 'diploma' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[42px] ${
                        state.dsyQualification === 'diploma' || !state.dsyQualification
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.dsyDiplomaMarksheet}
                    </button>
                    <button
                      type="button"
                      onClick={() => onUpdate({ dsyQualification: 'equivalent' })}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all min-h-[42px] ${
                        state.dsyQualification === 'equivalent'
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t.dsyEquivalentDoc}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Gap Question (Year 1 only) */}
      {state.currentYear === 1 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            {isMaster ? t.gapQuestionPG : t.gapQuestion}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map(v => (
              <button
                key={v ? 'gap-yes' : 'gap-no'}
                type="button"
                onClick={() => onUpdate({ hadGap: v })}
                className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                  state.hadGap === v
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {v ? t.yes : t.no}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hostel Question */}
      {isHostelEligible && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <p className="text-xs sm:text-sm font-bold text-slate-800">
            {t.hostelQuestion}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[true, false].map(v => (
              <button
                key={v ? 'hostel-yes' : 'hostel-no'}
                type="button"
                onClick={() => onUpdate({ isHosteller: v })}
                className={`py-2.5 px-4 rounded-xl border text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
                  state.isHosteller === v
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {v ? t.yes : t.no}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Continue Action */}
      <button
        type="button"
        disabled={!state.currentYear}
        onClick={onContinue}
        className="w-full bg-slate-900 hover:bg-slate-950 text-white font-black text-sm uppercase tracking-wider py-4 rounded-2xl shadow-sm transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none min-h-[52px] active:scale-[0.99] touch-manipulation mt-4"
      >
        {t.continue}
      </button>
    </div>
  );
};

/* ==========================================================================
   STEP 5: HERO DOCUMENT LIST SCREEN (CRED-Level Mobile Polish)
   ========================================================================== */

const StepDocumentList: React.FC<{
  state: AppState;
  onRestart: () => void;
  onUpdateQualification?: (q: DsyQualification) => void;
  t: any;
}> = ({ state, onRestart, onUpdateQualification, t }) => {
  const isFresh = state.currentYear === 1;
  const isDPharm = state.courseType === CourseType.DPharm;
  const isASC = state.stream === Stream.ASC;
  const isMaster = [
    CourseType.MPharm,
    CourseType.MBA,
    CourseType.MCA,
    CourseType.PGNursing,
    CourseType.MA,
    CourseType.MSc,
    CourseType.MCom
  ].includes(state.courseType!);
  const isEngineering = state.stream === Stream.Engineering;
  const isTechnical = [
    Stream.Engineering,
    Stream.Pharmacy,
    Stream.Management,
    Stream.Nursing
  ].includes(state.stream!);

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({});
  const [prereqChecked, setPrereqChecked] = useState<Record<number, boolean>>({});
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [nameError, setNameError] = useState('');
  const [downloadSuccessToast, setDownloadSuccessToast] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // 1) Caste Documents
  const casteDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    if (state.category === 'Open') return docs;

    docs.push({
      name: t.docCasteCert,
      englishName: translations.en.docCasteCert,
      badge: 'mandatory'
    });

    // Caste Validity Certificate is MANDATORY for SC, ST, OBC, VJNT, SBC, SEBC, Minority (NOT Open)
    docs.push({
      name: t.docCasteValidity,
      englishName: translations.en.docCasteValidity,
      badge: 'mandatory'
    });

    // Non-Creamy Layer (NCL) is required ONLY for OBC, SEBC, VJNT, SBC (NOT Open, SC, ST, Minority)
    if (['OBC', 'SEBC', 'VJNT', 'SBC'].includes(state.category || '')) {
      docs.push({
        name: t.docNCL,
        englishName: translations.en.docNCL,
        badge: 'mandatory'
      });
    }

    return docs;
  }, [state.category, t]);

  // 2) Income Documents
  const incomeDocs = useMemo<DocItem[]>(() => {
    return [{
      name: t.docIncomeCert,
      englishName: translations.en.docIncomeCert,
      badge: 'mandatory'
    }];
  }, [t]);

  // 3) Domicile & Family (Ration Card for Open Category)
  const domicileDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    docs.push({
      name: t.docDomicileCert,
      englishName: translations.en.docDomicileCert,
      badge: 'mandatory'
    });

    if (state.category === 'Open') {
      docs.push({
        name: t.docRationCard,
        englishName: translations.en.docRationCard,
        badge: 'mandatory',
        instruction: t.rationCardInst
      });
    }

    if (state.category === 'Open' && state.isHosteller) {
      docs.push({
        name: t.docAlpabhudharak,
        englishName: translations.en.docAlpabhudharak,
        badge: 'anyone'
      });
    }
    return docs;
  }, [state.category, state.isHosteller, t]);

  // 4) Bank & Identity Details
  const bankDocs = useMemo<DocItem[]>(() => {
    return [
      {
        name: t.docBankPassbook,
        englishName: translations.en.docBankPassbook,
        badge: 'mandatory'
      }
    ];
  }, [t]);

  // 5) Current Course & Academic Marksheets
  const currentCourseDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];

    // Bonafide / Fees
    if (state.category === 'Open') {
      docs.push({
        name: t.docAdmissionBonafideFees,
        englishName: translations.en.docAdmissionBonafideFees,
        badge: 'merge'
      });
    } else {
      docs.push({
        name: t.docAdmissionBonafide,
        englishName: translations.en.docAdmissionBonafide,
        badge: 'mandatory'
      });
    }

    // Allotment Letter
    if (!isASC) {
      docs.push({
        name: t.docAllotment,
        englishName: translations.en.docAllotment
      });
    }

    // DSY Qualifying Document (Inside Academic Section)
    if (state.isDirectSecondYear) {
      if (state.courseType === CourseType.Poly_Diploma) {
        docs.push({
          name: t.dsyQualifyingDoc,
          englishName: translations.en.dsyQualifyingDoc,
          subName: t.dsyPolyQualSub,
          englishSubName: translations.en.dsyPolyQualSub,
          badge: 'anyone',
          instruction: t.dsyHelperText,
          isDsyQualifying: true,
          dsyCourse: 'polytechnic'
        });
      } else if (state.courseType === CourseType.BE_BTech) {
        docs.push({
          name: t.dsyQualifyingDoc,
          englishName: translations.en.dsyQualifyingDoc,
          subName: t.dsyBeQualSub,
          englishSubName: translations.en.dsyBeQualSub,
          badge: 'anyone',
          instruction: t.dsyHelperText,
          isDsyQualifying: true,
          dsyCourse: 'be_btech'
        });
      } else if (state.courseType === CourseType.BPharm) {
        docs.push({
          name: t.docDiplomaFinalMarksheet,
          englishName: translations.en.docDiplomaFinalMarksheet,
          badge: 'dsy',
          instruction: t.dsyHelperText
        });
      }
    }

    // Marksheet logic per year
    if (!isFresh) {
      if (isDPharm || state.courseType === CourseType.Poly_Diploma) {
        if (!state.isDirectSecondYear) {
          if (state.currentYear === 2) docs.push({ name: t.marksheet1stYear, englishName: translations.en.marksheet1stYear, badge: 'onepdf' });
          if (state.currentYear === 3) docs.push({ name: t.marksheet2ndYear, englishName: translations.en.marksheet2ndYear, badge: 'onepdf' });
        } else {
          if (state.currentYear === 3) docs.push({ name: t.marksheet2ndYear, englishName: translations.en.marksheet2ndYear, badge: 'onepdf' });
        }
      } else if (state.isDirectSecondYear) {
        if (state.currentYear! >= 3) {
          docs.push({ name: t.marksheet2ndYearSem, englishName: translations.en.marksheet2ndYearSem, badge: 'merge' });
        }
        if (state.currentYear! >= 4) {
          docs.push({ name: t.marksheet3rdYearSem, englishName: translations.en.marksheet3rdYearSem, badge: 'merge' });
        }
      } else {
        if (state.currentYear! >= 2) {
          docs.push({ name: t.marksheet1stYearSem, englishName: translations.en.marksheet1stYearSem, badge: 'merge' });
        }
        if (state.currentYear! >= 3) {
          docs.push({ name: t.marksheet2ndYearSem, englishName: translations.en.marksheet2ndYearSem, badge: 'merge' });
        }
        if (state.currentYear! >= 4) {
          docs.push({ name: t.marksheet3rdYearSem, englishName: translations.en.marksheet3rdYearSem, badge: 'merge' });
        }
      }
    }

    return docs;
  }, [state.category, isASC, isFresh, isDPharm, state.isDirectSecondYear, state.currentYear, state.courseType, state.dsyQualification, isEngineering, t]);

  // 6) Previous Education Details
  const prevEduDocs = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    docs.push({ name: t.doc10thMarksheet, englishName: translations.en.doc10thMarksheet, badge: 'mandatory' });
    docs.push({ name: t.doc12thMarksheet, englishName: translations.en.doc12thMarksheet, badge: 'mandatory' });

    if (isMaster) {
      docs.push({ name: t.docGradMarksheet, englishName: translations.en.docGradMarksheet, badge: 'mandatory' });
    }

    if (state.hadGap) {
      docs.push({ name: t.docGapCert, englishName: translations.en.docGapCert, badge: 'onepdf' });
    }

    return docs;
  }, [isMaster, state.hadGap, t]);

  // 7) Leaving Certificates
  const leavingCertDocsList = useMemo<DocItem[]>(() => {
    const docs: DocItem[] = [];
    if (isMaster) {
      if (isFresh) docs.push({ name: t.docGradTC, englishName: translations.en.docGradTC, badge: 'mandatory' });
    } else if (isFresh) {
      docs.push({ name: t.docLeavingCert, englishName: translations.en.docLeavingCert, badge: 'mandatory' });
    }
    return docs;
  }, [isFresh, isMaster, t]);

  // 8) Hostel Details
  const hostelDocsList = useMemo<DocItem[]>(() => {
    const isHostelEligibleCat = state.category && ['Open', 'SC', 'ST', 'SBC', 'VJNT'].includes(state.category);
    if (state.isHosteller && !isASC && isHostelEligibleCat) {
      return [{
        name: t.docHostelBond,
        englishName: translations.en.docHostelBond,
        badge: 'merge',
        fileName: 'Hostel_Bond_Tax_Receipt.pdf'
      }];
    }
    return [];
  }, [state.isHosteller, isASC, state.category, t]);

  // Unified sections for display
  const allSections = useMemo(() => {
    const sections: { title: string; englishTitle: string; subtitle?: string; icon: React.ReactNode; docs: DocItem[] }[] = [
      { title: t.idDocs, englishTitle: translations.en.idDocs, subtitle: 'Residence and family verification', icon: <Home className="w-4 h-4 text-indigo-600" />, docs: domicileDocs },
      { title: t.categoryDocs, englishTitle: translations.en.categoryDocs, subtitle: 'Caste status and quota certificates', icon: <ShieldCheck className="w-4 h-4 text-rose-600" />, docs: casteDocs },
      { title: t.incomeDocs, englishTitle: translations.en.incomeDocs, subtitle: 'Income proof and banking details', icon: <IndianRupee className="w-4 h-4 text-emerald-600" />, docs: [...incomeDocs, ...bankDocs] },
      { title: t.academicDocs, englishTitle: translations.en.academicDocs, subtitle: 'Admission proof and marksheets', icon: <GraduationCap className="w-4 h-4 text-blue-600" />, docs: currentCourseDocs },
      { title: t.prevEduDocs, englishTitle: translations.en.prevEduDocs, subtitle: 'Prior school & college records', icon: <History className="w-4 h-4 text-violet-600" />, docs: prevEduDocs },
      { title: t.hostelDocsSection, englishTitle: translations.en.hostelDocsSection, subtitle: 'Hostel accommodation proof', icon: <Building2 className="w-4 h-4 text-amber-600" />, docs: hostelDocsList },
      { title: t.leavingCertDocs, englishTitle: translations.en.leavingCertDocs, subtitle: 'Original transfer records', icon: <LogOut className="w-4 h-4 text-rose-600" />, docs: leavingCertDocsList }
    ];

    return sections.filter(s => s.docs && s.docs.length > 0);
  }, [domicileDocs, casteDocs, incomeDocs, bankDocs, currentCourseDocs, prevEduDocs, hostelDocsList, leavingCertDocsList, t]);

  // Flat list for progress tracking
  const flatDocs = useMemo<FlatDocItem[]>(() => {
    const list: FlatDocItem[] = [];

    allSections.forEach((section, sIdx) => {
      section.docs.forEach((doc, dIdx) => {
        list.push({
          id: `doc-${sIdx}-${dIdx}`,
          name: doc.name,
          subName: doc.subName,
          category: section.title,
          badge: doc.badge,
          fileName: doc.fileName,
          instruction: doc.instruction,
          isDsyQualifying: doc.isDsyQualifying,
          dsyCourse: doc.dsyCourse
        });
      });
    });

    return list;
  }, [allSections]);

  const checkedCount = useMemo(() => {
    return flatDocs.filter(d => checkedDocs[d.id]).length;
  }, [flatDocs, checkedDocs]);

  const progressPercentage = useMemo(() => {
    if (flatDocs.length === 0) return 0;
    return Math.round((checkedCount / flatDocs.length) * 100);
  }, [checkedCount, flatDocs]);

  const handleDownloadPdfSubmit = () => {
    if (!studentName.trim()) {
      setNameError(t.nameRequired || 'Please enter your name');
      return;
    }
    setIsGeneratingPdf(true);
    try {
      generateChecklistPdf({
        studentName: studentName.trim(),
        state,
        sections: allSections
      });
      setShowDownloadModal(false);
      setDownloadSuccessToast(true);
      setTimeout(() => setDownloadSuccessToast(false), 3500);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleShareOnWhatsApp = () => {
    const mode = isFresh ? t.freshApp : t.renewalApp;
    const yearSuffix =
      state.currentYear === 1 ? t.st : state.currentYear === 2 ? t.nd : state.currentYear === 3 ? t.rd : t.th;
    const hostelStatus = state.isHosteller ? t.yes : t.no;

    let message = `*${t.waChecklistHeader}*\n\n`;
    message += `🎓 *Course:* ${state.courseType || state.stream}\n`;
    message += `📅 *Year:* ${state.currentYear}${yearSuffix} ${t.yearLabel}\n`;
    message += `🏷️ *Category:* ${state.category}\n`;
    message += `📝 *Mode:* ${mode}\n`;
    if (!isASC) {
      message += `🏠 *Hosteller:* ${hostelStatus}\n`;
    }
    message += `\n`;

    message += `⚡ *${t.keepTheseReady}:*\n`;
    message += `• ${t.mahaIdTitle} [${t.mahaIdBadge}]\n`;
    message += `• ${t.aadhaarCardTitle} [${t.aadhaarCardBadge}]\n`;
    message += `• ${t.aadhaarMobileTitle} [${t.aadhaarMobileBadge}]\n\n`;

    allSections.forEach(section => {
      message += `📋 *${section.title}:*\n`;
      section.docs.forEach(d => {
        if (d.name) {
          let line = `• ${d.name}`;
          if (d.subName) line += ` (${d.subName})`;
          if (d.badge === 'anyone') line += ` [ANY ONE]`;
          if (d.badge === 'dsy') line += ` [DSY]`;
          if (d.badge === 'merge') line += ` [${t.badgeMerge || 'Create One PDF'}]`;
          if (d.badge === 'onepdf') line += ` [ONE PDF]`;
          message += `${line}\n`;
        }
      });
      message += `\n`;
    });

    message += `_${t.waGeneratedBy}_`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <header className="space-y-3 text-left">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
            {t.docsTitle}
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
            {t.docsSub}
          </p>
        </div>

        {/* Selected Criteria Summary Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {[
            state.courseType || state.stream,
            state.category,
            `${state.currentYear} ${t.yearLabel}`,
            isFresh ? t.freshApp : t.renewalApp
          ].map((pill, idx) => (
            <span
              key={idx}
              className="px-2.5 py-1 rounded-lg bg-white border border-slate-200/80 text-slate-700 text-xs font-bold shadow-2xs"
            >
              {pill}
            </span>
          ))}
        </div>

        {/* Live Progress Bar */}
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-xs font-bold text-slate-800 block">
              {checkedCount} of {flatDocs.length} Documents Checked
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              Tap documents as you keep them ready
            </span>
          </div>
          <div className="flex items-center space-x-2 shrink-0">
            <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-xs font-black text-emerald-700 w-8 text-right">
              {progressPercentage}%
            </span>
          </div>
        </div>
      </header>

      {/* ====================================================================
          KEEP READY SECTION (Redesigned Pre-Application Checklist Card)
          ==================================================================== */}
      <section className="bg-white border border-[#E6EAEE] rounded-[16px] p-4 flex flex-col gap-4 text-left shadow-xs">
        {/* Header */}
        <header className="flex flex-col gap-1">
          <h2 className="text-[17px] font-bold text-[#111827] leading-[22px] tracking-tight">
            Keep these ready
          </h2>
          <p className="text-[13px] font-normal text-[#5B6472] leading-[18px]">
            {(() => {
              const readyCount = [0, 1, 2].filter(i => prereqChecked[i]).length;
              if (readyCount === 0) return "3 things you'll need to apply";
              return `${readyCount} of 3 ready`;
            })()}
          </p>
        </header>

        {/* Row 1: MahaID (Expanded, Main Row) */}
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 min-w-10 rounded-[12px] bg-[#ECFDF8] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#0F766E]" strokeWidth={2} />
            </div>

            <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[15px] font-semibold text-[#111827] leading-[20px]">MahaID</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-[14px] bg-[#FEECEC] text-[#B42318]">
                  Required
                </span>
              </div>
              <p className="text-[13px] font-normal text-[#5B6472] leading-[19px]">
                You'll need your MahaID to continue your scholarship application.
              </p>
            </div>

            {/* Optional 24px check circle (44px tap area) */}
            <button
              type="button"
              onClick={() => setPrereqChecked(prev => ({ ...prev, 0: !prev[0] }))}
              aria-label="Mark MahaID as ready"
              aria-checked={Boolean(prereqChecked[0])}
              role="checkbox"
              className="w-11 h-11 flex items-center justify-center shrink-0 -mr-1 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40"
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                  prereqChecked[0]
                    ? 'bg-[#0F766E] border border-[#0F766E]'
                    : 'border-[1.5px] border-[#D1D5DB] bg-transparent'
                }`}
              >
                {prereqChecked[0] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
              </div>
            </button>
          </div>

          {/* MahaID Action Block */}
          <div className="flex flex-col gap-2 w-full">
            <span className="text-[13px] font-medium text-[#111827]">Don't have one yet?</span>
            
            <a
              href="https://mahasarathi.maharashtra.gov.in/home/landing"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 w-full rounded-[12px] border border-[#0F766E] text-[#0F766E] text-[14px] font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#F0FDFA] active:scale-[0.99] transition-all"
            >
              <span>Create MahaID</span>
              <ExternalLink className="w-4 h-4" strokeWidth={2} />
            </a>

            <p className="text-[12px] text-[#5B6472] leading-[17px]">
              Opens the Mahasarathi portal. Your MahaID will be sent to your registered mobile number.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EEF0F3] w-full" />

        {/* Row 2: Aadhaar Card (Compact, Single Line) */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 min-w-10 rounded-[12px] bg-[#ECFDF8] flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5 text-[#0F766E]" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold text-[#111827] leading-[20px]">Aadhaar card</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-[14px] bg-[#FEECEC] text-[#B42318]">
              Required
            </span>
          </div>

          {/* Optional 24px check circle (44px tap area) */}
          <button
            type="button"
            onClick={() => setPrereqChecked(prev => ({ ...prev, 1: !prev[1] }))}
            aria-label="Mark Aadhaar card as ready"
            aria-checked={Boolean(prereqChecked[1])}
            role="checkbox"
            className="w-11 h-11 flex items-center justify-center shrink-0 -mr-1 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                prereqChecked[1]
                  ? 'bg-[#0F766E] border border-[#0F766E]'
                  : 'border-[1.5px] border-[#D1D5DB] bg-transparent'
              }`}
            >
              {prereqChecked[1] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
            </div>
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#EEF0F3] w-full" />

        {/* Row 3: Aadhaar-linked Mobile (Compact) */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 min-w-10 rounded-[12px] bg-[#ECFDF8] flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5 text-[#0F766E]" strokeWidth={2} />
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-1 pt-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[15px] font-semibold text-[#111827] leading-[20px]">Aadhaar-linked mobile</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold leading-[14px] bg-[#FFF4DB] text-[#8A5A00]">
                For OTP
              </span>
            </div>
            <p className="text-[12px] text-[#5B6472] leading-[16px]">
              You'll get an OTP on this number.
            </p>
          </div>

          {/* Optional 24px check circle (44px tap area) */}
          <button
            type="button"
            onClick={() => setPrereqChecked(prev => ({ ...prev, 2: !prev[2] }))}
            aria-label="Mark Aadhaar-linked mobile as ready"
            aria-checked={Boolean(prereqChecked[2])}
            role="checkbox"
            className="w-11 h-11 flex items-center justify-center shrink-0 -mr-1 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]/40"
          >
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                prereqChecked[2]
                  ? 'bg-[#0F766E] border border-[#0F766E]'
                  : 'border-[1.5px] border-[#D1D5DB] bg-transparent'
              }`}
            >
              {prereqChecked[2] && <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />}
            </div>
          </button>
        </div>
      </section>

      {/* ====================================================================
          DOCUMENT REQUIREMENTS LIST (Grouped by Category, NO NUMBERS)
          ==================================================================== */}
      <section className="space-y-6">
        {allSections.map((section, sIdx) => (
          <div key={sIdx} className="space-y-2.5">
            {/* Clean Section Title with Icon */}
            <div className="flex items-center space-x-2 px-1">
              <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center">
                {section.icon}
              </div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                {section.title}
              </h3>
            </div>

            {/* Document Rows in this section */}
            <div className="space-y-2">
              {section.docs.map((doc, dIdx) => {
                const docId = `doc-${sIdx}-${dIdx}`;
                return (
                  <DocumentRow
                    key={docId}
                    name={doc.name}
                    subName={doc.subName}
                    badge={doc.badge}
                    fileName={doc.fileName}
                    instruction={doc.instruction}
                    isDsyQualifying={doc.isDsyQualifying}
                    dsyCourse={doc.dsyCourse}
                    selectedDsyQual={state.dsyQualification}
                    onSelectDsyQual={onUpdateQualification}
                    t={t}
                  />
                );
              })}
            </div>

            {/* Ad Placement: Between Document Sections */}
            {sIdx === 1 && (
              <AdBanner placement="betweenSections" className="pt-2 pb-1" />
            )}
          </div>
        ))}
      </section>

      {/* Ad Placement: Below the final document list */}
      <AdBanner placement="belowFinalList" />

      {/* Global Submission Protocol Tip */}
      <div className="p-4 rounded-2xl bg-slate-100/70 border border-slate-200/60 text-left space-y-1.5">
        <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center">
          <Info className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
          {t.protocolTitle}
        </span>
        <p className="text-xs font-semibold text-slate-600 leading-relaxed">
          {t.rulePdf} • {t.ruleSize} • {t.ruleNaming}
        </p>
      </div>

      {/* ====================================================================
          ACTION BUTTONS & FOOTER (Exact Layout, Spacing, and Colors)
          ==================================================================== */}
      <div className="pt-2 flex flex-col items-center">
        {/* 2. Download button: 48px tall, radius 12, keep dark fill, single-line label "Download checklist PDF" */}
        <button
          type="button"
          onClick={() => {
            setNameError('');
            setShowDownloadModal(true);
          }}
          className="w-full h-[48px] bg-slate-900 hover:bg-slate-950 text-white font-bold text-sm rounded-[12px] shadow-sm transition-all duration-200 flex items-center justify-center space-x-2 active:scale-[0.99] touch-manipulation cursor-pointer shrink-0"
        >
          <FileDown className="w-4 h-4 shrink-0" />
          <span className="whitespace-nowrap">{t.btnDownloadPdf || 'Download checklist PDF'}</span>
        </button>

        {/* 1. WhatsApp button: 8px gap below Download, one line, label "Share on WhatsApp", no emoji in the text,
               WhatsApp icon inline before the label with the group centered. Height 44px, radius 12,
               outlined style (white bg, 1.5px border #25D366, text/icon #128C4A) */}
        <button
          type="button"
          onClick={handleShareOnWhatsApp}
          className="mt-2 w-full h-[44px] bg-white border-[1.5px] border-[#25D366] text-[#128C4A] hover:bg-[#25D366]/5 font-bold text-sm rounded-[12px] shadow-xs transition-all duration-200 flex items-center justify-center space-x-2 active:scale-[0.99] touch-manipulation cursor-pointer shrink-0"
        >
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 448 512">
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.5-11.3 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.6-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
          </svg>
          <span className="whitespace-nowrap">{t.shareWhatsApp || 'Share on WhatsApp'}</span>
        </button>

        {/* 3. "Restart Assistant": text-style button, 40px tall, 13px, muted gray */}
        <button
          type="button"
          onClick={onRestart}
          className="mt-1 w-full h-[40px] bg-transparent text-slate-500 hover:text-slate-700 font-medium text-[13px] rounded-lg transition-colors flex items-center justify-center space-x-1.5 active:scale-95 touch-manipulation cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 shrink-0" />
          <span>{t.restart || 'Restart Assistant'}</span>
        </button>

        {/* 4. Footer "Created by Sohel Sayyad": remove separate bordered section. 12px muted text, centered, 12px above it, 8px padding below */}
        <div className="mt-3 pb-2 text-center text-[12px] text-slate-400 font-normal leading-normal">
          Created by{' '}
          <a
            href="https://www.instagram.com/sohellsd/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            Sohel Sayyad
          </a>
        </div>
      </div>

      {/* ====================================================================
          STUDENT NAME MODAL / BOTTOM SHEET (Android-First Polish)
          ==================================================================== */}
      {showDownloadModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 transition-all duration-200"
          onClick={() => setShowDownloadModal(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200/80 animate-in slide-in-from-bottom duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                {t.downloadModalTitle || 'DOWNLOAD YOUR CHECKLIST'}
              </h3>
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center text-sm font-bold min-h-[32px] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              {t.enterYourName || 'Enter your name'}
            </label>

            <input
              type="text"
              value={studentName}
              onChange={e => {
                setStudentName(e.target.value);
                if (nameError) setNameError('');
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleDownloadPdfSubmit();
                }
              }}
              placeholder={t.namePlaceholder || 'Your full name'}
              autoFocus
              className={`w-full px-4 py-3.5 rounded-2xl border text-sm sm:text-base font-semibold text-slate-900 outline-none transition-all min-h-[50px] ${
                nameError
                  ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-2 focus:ring-rose-200'
                  : 'border-slate-300 bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-200'
              }`}
            />

            {nameError ? (
              <p className="text-xs font-semibold text-rose-600 mt-1.5">{nameError}</p>
            ) : (
              <p className="text-xs font-medium text-slate-500 mt-1.5">
                {t.nameHelper || 'Your name will be added to the checklist PDF.'}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 py-3.5 px-4 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold text-xs sm:text-sm min-h-[48px] active:scale-[0.98] transition-all cursor-pointer"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                type="button"
                disabled={isGeneratingPdf}
                onClick={handleDownloadPdfSubmit}
                className="flex-1 py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-extrabold text-xs sm:text-sm min-h-[48px] shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center space-x-2"
              >
                <FileDown className="w-4 h-4" />
                <span>{isGeneratingPdf ? 'Generating...' : (t.downloadPdf || 'Download PDF')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightweight Download Success Toast */}
      {downloadSuccessToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs sm:text-sm font-bold animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>✓ {t.downloadSuccess || 'Checklist downloaded'}</span>
        </div>
      )}
    </div>
  );
};

export default App;
