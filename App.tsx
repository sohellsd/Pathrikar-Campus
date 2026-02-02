import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Stream, CourseType, Category, AppState, Language } from './types';
import { StreamIcons } from './constants';
import { translations } from './translations';
import { PDFDocument } from 'pdf-lib';
import { jsPDF } from 'jspdf';
import heic2any from 'heic2any';

const PERSISTENCE_KEY = 'mahadbt_assist_state_v4';
const MAX_INPUT_SIZE_BYTES = 7 * 1024 * 1024; // 7MB
const TARGET_SIZE_KB = 230;

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
      isDirectSecondYear: null,
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
  const [activeTool, setActiveTool] = useState<'merge' | 'compress' | 'img2pdf' | null>(null);

  const t = translations[state.language];
  const isRenewal = useMemo(() => state.currentYear !== null && state.currentYear > 1, [state.currentYear]);
  
  const handleStreamSelect = (s: Stream) => {
    const nextStepNum = (s === Stream.Pharmacy || s === Stream.Management || s === Stream.ASC) ? 2 : 3;
    setState(prev => ({ 
      ...prev, 
      stream: s, 
      courseType: null, 
      currentYear: null, 
      category: null,
      isDirectSecondYear: null,
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
      isDirectSecondYear: null,
      step: 3
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (cat: Category) => {
    setState(prev => ({ 
      ...prev, 
      category: cat, 
      isHosteller: false,
      step: 4
    }));
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
    const newState = {
      language: state.language,
      step: 1,
      stream: null,
      courseType: null,
      category: null,
      currentYear: null,
      isHosteller: false,
      hadGap: false,
      isDirectSecondYear: null,
      loginReady: { username: false, password: false, mobile: false },
    };
    setState(newState);
    localStorage.removeItem(PERSISTENCE_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-100">
      {activeTool && (
        <DocToolModal 
          type={activeTool} 
          t={t} 
          onClose={() => setActiveTool(null)} 
        />
      )}

      {activeVideo && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-6 no-print video-overlay" onClick={() => setActiveVideo(null)}>
          <div className="bg-white w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl relative border border-slate-200" onClick={e => e.stopPropagation()}>
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

      <header className="bg-[#1e3a8a] text-white pt-10 pb-12 px-6 sticky top-0 z-40 pt-safe no-select shadow-xl rounded-b-[2rem] no-print">
        <div className="max-w-2xl mx-auto flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex flex-col">
              <h1 className="font-black text-2xl tracking-tighter leading-none uppercase">Pathrikar Campus</h1>
              <p className="text-[10px] font-bold text-blue-200/60 uppercase tracking-widest mt-2">{t.subtitle}</p>
            </div>
            <div className="flex bg-blue-900/50 p-1.5 rounded-2xl backdrop-blur-md border border-white/10">
              {(['en', 'hi', 'mr'] as Language[]).map(lang => (
                <button 
                  key={lang} 
                  onClick={() => setState(prev => ({ ...prev, language: lang }))} 
                  className={`px-3 py-1.5 text-[10px] font-black rounded-xl transition-all duration-300 ${state.language === lang ? 'bg-white text-blue-900 shadow-lg' : 'text-blue-200/50 hover:text-white'}`}
                >
                  {lang === 'en' ? 'EN' : lang === 'hi' ? 'हिं' : 'मराठी'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <span className="text-[9px] font-black text-white uppercase tracking-widest">{t.step} {state.step} {t.of} 6</span>
            <div className="flex w-full space-x-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className={`h-[3px] flex-grow rounded-full transition-all duration-500 ${state.step >= i ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'bg-blue-400/30'}`} />
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto relative z-30 flex-grow w-full -mt-6 px-0 sm:px-4">
        <div className="bg-white min-h-[500px] p-6 pt-8 rounded-t-[2.5rem] sm:rounded-3xl border-x border-t border-slate-100 overflow-hidden pb-12 shadow-[0_-10px_20px_rgba(0,0,0,0.02)] step-container">
          {state.step > 1 && (
            <button onClick={prevStep} className="mb-8 flex items-center space-x-2 text-slate-400 hover:text-blue-600 font-bold text-[10px] uppercase tracking-widest transition-all touch-manipulation group no-print">
              <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-blue-50 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span className="group-hover:translate-x-0.5 transition-transform">{t.back}</span>
            </button>
          )}

          <div className="step-enter">
            {state.step === 1 && <StepStream selected={state.stream} onSelect={handleStreamSelect} t={t} />}
            {state.step === 2 && <StepCourse selected={state.courseType} stream={state.stream} onSelect={handleCourseSelect} t={t} />}
            {state.step === 3 && <StepStepCategory selected={state.category} onSelect={handleCategorySelect} t={t} />}
            {state.step === 4 && <StepYear state={state} onUpdate={updates => setState(prev => ({ ...prev, ...updates }))} onContinue={nextStep} t={t} />}
            {state.step === 5 && <StepLoginCheck ready={state.loginReady} onToggle={field => setState(prev => ({ ...prev, loginReady: { ...prev.loginReady, [field]: !prev.loginReady[field] } }))} onContinue={nextStep} t={t} />}
            {state.step === 6 && <StepDocumentList state={state} onRestart={handleRestart} onBack={prevStep} onOpenVideo={(title, desc, url) => setActiveVideo({ title, desc, url })} onOpenTool={setActiveTool} t={t} />}
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

// --- DOC TOOL MODAL ---

const DocToolModal: React.FC<{ type: 'merge' | 'compress' | 'img2pdf'; t: any; onClose: () => void }> = ({ type, t, onClose }) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputBlob, setOutputBlob] = useState<{ blob: Blob; name: string } | null>(null);
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const totalInputSize = useMemo(() => files.reduce((acc, f) => acc + f.size, 0), [files]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // FIX: Explicitly cast Array.from(e.target.files) to File[] to fix 'unknown' type errors during reduction and iteration.
      const selected = Array.from(e.target.files) as File[];
      const total = selected.reduce((acc, f) => acc + f.size, 0);
      
      if (total > MAX_INPUT_SIZE_BYTES) {
        setError(t.errorInputTooLarge || "Total file size exceeds 7 MB limit.");
        return;
      }
      
      const processed: File[] = [];
      for (const f of selected) {
        if (f.name.toLowerCase().endsWith('.heic')) {
          try {
            // FIX: Explicitly handle the return type of heic2any which can be Blob or Blob[].
            const result = await heic2any({ blob: f, toType: 'image/jpeg', quality: 0.8 });
            const converted = Array.isArray(result) ? result[0] : result;
            processed.push(new File([converted], f.name.replace(/\.heic$/i, '.jpg'), { type: 'image/jpeg' }));
          } catch (err) {
            console.error('HEIC conversion failed', err);
            processed.push(f);
          }
        } else {
          processed.push(f);
        }
      }

      setFiles(processed);
      setError("");
    }
  };

  const processFiles = async () => {
    setIsProcessing(true);
    setError("");
    setProgress(10);
    try {
      if (type === 'img2pdf') {
        await handleImageToPdf();
      } else if (type === 'merge' || type === 'compress') {
        await handlePdfMergeAndCompress();
      }
    } catch (err) {
      setError(t.errorProcessingFailed || "Processing failed. Please check file formats.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleImageToPdf = async () => {
    let quality = 0.8;
    let scale = 1.0;
    let isGrayscale = false;
    let finalBlob: Blob | null = null;

    // Iterative compression logic
    const attempt = async (q: number, s: number, gray: boolean) => {
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let i = 0; i < files.length; i++) {
        if (i > 0) doc.addPage();
        const imgData = await fileToOptimizedDataURL(files[i], q, s, gray);
        doc.addImage(imgData, 'JPEG', 0, 0, pageWidth, pageHeight);
      }
      return doc.output('blob');
    };

    // Step 1: High Quality
    finalBlob = await attempt(quality, scale, isGrayscale);
    
    // Iterative loop
    const stages = [
      { q: 0.8, s: 0.8, gray: false },
      { q: 0.7, s: 0.7, gray: false },
      { q: 0.6, s: 0.6, gray: false },
      { q: 0.5, s: 0.5, gray: false },
      { q: 0.4, s: 0.5, gray: true },
      { q: 0.2, s: 0.4, gray: true },
    ];

    for (const stage of stages) {
      if (finalBlob && finalBlob.size <= TARGET_SIZE_KB * 1024) break;
      setProgress(prev => Math.min(prev + 15, 90));
      finalBlob = await attempt(stage.q, stage.s, stage.gray);
    }

    if (finalBlob && finalBlob.size > TARGET_SIZE_KB * 1024) {
      setError(t.errorCannotCompress || "Cannot compress under 230 KB limit. Reduce pages.");
      return;
    }

    if (finalBlob) finish(finalBlob, "Document.pdf");
  };

  const handlePdfMergeAndCompress = async () => {
    const mergedPdf = await PDFDocument.create();
    for (const file of files) {
      const pdfBytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(pdfBytes);
      const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
      copiedPages.forEach((page) => mergedPdf.addPage(page));
    }
    
    // First save attempt
    let pdfBytes = await mergedPdf.save({ useObjectStreams: true });
    let blob = new Blob([pdfBytes], { type: 'application/pdf' });

    if (blob.size > TARGET_SIZE_KB * 1024) {
      // If still too large, we suggest the user reduces pages as client-side PDF-to-PDF pixel compression is very heavy
      setError(t.errorCannotCompress || "File too large after merge. Try reducing pages or input quality.");
      return;
    }

    finish(blob, "Merged_Document.pdf");
  };

  const fileToOptimizedDataURL = (file: File, quality: number, scale: number, grayscale: boolean): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext('2d')!;
          if (grayscale) {
            ctx.filter = 'grayscale(100%)';
          }
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const finish = (blob: Blob, defaultName: string) => {
    setOutputBlob({ blob, name: defaultName });
    setNewName(defaultName);
    const suggested = ["Income_Certificate.pdf", "Sem1_Sem2_Marksheet.pdf", "Declaration_RationCard.pdf"];
    if (type === 'img2pdf') setNewName(suggested[1]);
  };

  const download = () => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = newName.endsWith('.pdf') ? newName : `${newName}.pdf`;
    a.click();
    
    // Self-destruct logic: Clear state after download or close
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);
    onClose();
  };

  // Auto-suggest names mapping
  const suggestedNames = [
    "Income_Certificate.pdf",
    "Sem1_Sem2_Marksheet.pdf",
    "Declaration_RationCard.pdf",
    "Domicile_Certificate.pdf",
    "Admission_Receipt.pdf"
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-slate-900/60 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
        <header className="bg-blue-900 p-6 text-white flex justify-between items-center">
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest">{type === 'merge' ? t.btnMerge : type === 'compress' ? t.btnCompress : t.btnImgToPdf}</h3>
            <p className="text-[10px] text-blue-300 font-bold uppercase mt-1">{t.strictTarget || "Strict Target: 230 KB"}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg></button>
        </header>

        <div className="p-8 space-y-6 overflow-y-auto">
          {!outputBlob ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center hover:border-blue-300 transition-colors relative">
                <input type="file" multiple={type !== 'compress'} accept={type === 'img2pdf' ? 'image/*,.heic' : 'application/pdf'} onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="space-y-3">
                  <div className="mx-auto w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                  </div>
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{t.selectLabel || "Select Files"} ({t.max7mb || "Max 7MB"})</p>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.selectedLabel || "Selected"} ({files.length})</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{(totalInputSize / 1024).toFixed(1)} KB</p>
                  </div>
                  <div className="max-h-24 overflow-y-auto space-y-1 pr-2">
                    {files.map((f, i) => (
                      <div key={i} className="text-[10px] font-bold text-slate-600 bg-slate-50 p-2 rounded-lg truncate flex justify-between">
                        <span>{f.name}</span>
                        <span className="opacity-40">{(f.size / 1024).toFixed(0)} KB</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && <div className="p-4 bg-red-50 text-red-600 text-[10px] font-bold rounded-xl border border-red-100 leading-relaxed">{error}</div>}

              {isProcessing && (
                <div className="space-y-2">
                  <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[9px] font-black text-blue-600 uppercase tracking-widest text-center animate-pulse">{t.optimizingSize || "Optimizing size..."}</p>
                </div>
              )}

              <button 
                disabled={files.length === 0 || isProcessing} 
                onClick={processFiles}
                className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[11px] shadow-lg shadow-blue-900/10 disabled:opacity-20 transition-all h-14"
              >
                {isProcessing ? t.processing || 'Processing...' : t.createPdf || 'Create Optimized PDF'}
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl text-center space-y-3">
                <div className="mx-auto w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                </div>
                <div>
                  <h4 className="font-black text-emerald-900 uppercase tracking-tight">{t.pdfReady || "Your PDF is ready"}</h4>
                  <p className="text-[10px] text-emerald-600 font-black uppercase mt-1">{(outputBlob.blob.size / 1024).toFixed(1)} KB • {t.safeSize || "SAFE SIZE"}</p>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.renameLabel || "Rename File"}</label>
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)}
                  className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-900/10 transition-all"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {suggestedNames.slice(0, 3).map(name => (
                    <button 
                      key={name} 
                      onClick={() => setNewName(name)}
                      className="px-2 py-1 bg-slate-100 text-slate-500 text-[8px] font-bold rounded-lg uppercase hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    >
                      {name.split('_')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={download} className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl uppercase tracking-widest text-[11px] shadow-xl shadow-blue-900/10 h-14">{t.downloadPdf || "Download PDF"}</button>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter text-center">{t.autoDeleteNote || "Files are automatically deleted after 5 minutes."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- REST OF COMPONENTS REMAIN SAME ---

const StepStream: React.FC<{ selected: Stream | null; onSelect: (s: Stream) => void; t: any; }> = ({ selected, onSelect, t }) => {
  const streams = [
    { value: Stream.Engineering, label: t.engLabel, tip: t.engTip },
    { value: Stream.Pharmacy, label: t.pharmLabel, tip: t.pharmTip },
    { value: Stream.Nursing, label: t.nursLabel, tip: t.nursTip },
    { value: Stream.Management, label: t.mgmtLabel, tip: t.mgmtTip },
    { value: Stream.ASC, label: t.ascLabel, tip: t.ascTip },
  ];
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">{t.selectStream}</h2>
        <p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectStreamSub}</p>
      </header>
      <div className="space-y-3">
        {streams.map(s => (
          <button key={s.value} onClick={() => onSelect(s.value)} className={`w-full flex items-center p-4 rounded-2xl border-2 transition-all active:scale-[0.98] text-left relative ${selected === s.value ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-[#fafafa] hover:border-slate-200'}`}>
            <div className={`p-3.5 rounded-xl transition-all ${selected === s.value ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-white text-slate-300'}`}>{StreamIcons[s.value as keyof typeof StreamIcons]}</div>
            <div className="ml-4 flex-grow"><span className={`font-black text-[15px] tracking-tight block ${selected === s.value ? 'text-blue-900' : 'text-slate-700'}`}>{s.label}</span><span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{s.tip}</span></div>
          </button>
        ))}
      </div>
    </div>
  );
};

const StepCourse: React.FC<{ selected: CourseType | null; stream: Stream | null; onSelect: (c: CourseType) => void; t: any; }> = ({ selected, stream, onSelect, t }) => {
  let options: CourseType[] = [];
  if (stream === Stream.Pharmacy) options = [CourseType.BPharm, CourseType.DPharm, CourseType.MPharm];
  else if (stream === Stream.Management) options = [CourseType.BBA, CourseType.BCA, CourseType.MBA, CourseType.MCA];
  else if (stream === Stream.ASC) options = [CourseType.BA, CourseType.BSc, CourseType.BCom, CourseType.MA, CourseType.MSc, CourseType.MCom];
  return (
    <div className="space-y-8">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectCourse}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectCourseSub}</p></header>
      <div className="space-y-3 no-select">{options.map(c => (
          <button key={c} onClick={() => onSelect(c)} className={`w-full flex items-center p-5 rounded-2xl border-2 transition-all active:scale-[0.98] text-left ${selected === c ? 'border-blue-600 bg-blue-50/30' : 'border-slate-50 bg-[#fafafa]'}`}>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === c ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'border-slate-200 bg-white'}`}> {selected === c && <div className="w-2 h-2 bg-white rounded-full" />}</div>
            <div className="ml-4"><span className={`font-black text-sm uppercase tracking-tight ${selected === c ? 'text-blue-900' : 'text-slate-700'}`}>{c}</span></div>
          </button>
        ))}</div>
    </div>
  );
};

const StepStepCategory: React.FC<{ selected: Category | null; onSelect: (c: Category) => void; t: any; }> = ({ selected, onSelect, t }) => {
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
    <div className="space-y-8">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectCategory}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectCategorySub}</p></header>
      <div className="grid grid-cols-1 gap-3 no-select">{categories.map(cat => (
          <button key={cat.value} onClick={() => onSelect(cat.value)} className={`p-5 rounded-2xl border-2 font-black transition-all text-left flex items-center justify-between active:scale-[0.98] ${selected === cat.value ? 'border-blue-600 bg-blue-50/30 text-blue-900' : 'border-slate-50 bg-[#fafafa] text-slate-600'}`}>
            <span className="text-sm uppercase tracking-tight">{cat.label}</span>
          </button>
        ))}</div>
    </div>
  );
};

const StepYear: React.FC<{ state: AppState; onUpdate: (updates: Partial<AppState>) => void; onContinue: () => void; t: any; }> = ({ state, onUpdate, onContinue, t }) => {
  const is2YearCourse = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom, CourseType.DPharm].includes(state.courseType!);
  const years = is2YearCourse ? [1, 2] : [1, 2, 3, 4];
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isASC = state.stream === Stream.ASC;
  const isHostelEligible = !isASC && state.category && ['SC', 'ST', 'SBC', 'VJNT', 'Open'].includes(state.category);
  
  const showDSYQuestion = state.stream === Stream.Pharmacy && state.courseType === CourseType.BPharm && state.currentYear === 2;

  const handleYearSelect = (y: number) => {
    onUpdate({ currentYear: y, isDirectSecondYear: null });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.selectYear}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.selectYearSub}</p></header>
      <div className="grid grid-cols-2 gap-3 no-select">{years.map(y => (
          <button key={y} onClick={() => handleYearSelect(y)} className={`p-5 rounded-2xl border-2 font-black text-xs uppercase transition-all active:scale-[0.97] ${state.currentYear === y ? 'border-blue-600 bg-blue-50/30 text-blue-900 shadow-md' : 'border-slate-50 bg-[#fafafa] text-slate-400'}`}>{y}{y === 1 ? 'st' : y === 2 ? 'nd' : y === 3 ? 'rd' : 'th'} Year</button>
        ))}</div>
      
      {showDSYQuestion && (
        <div className="bg-slate-50 p-6 rounded-2xl space-y-5 no-select border border-slate-200">
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed text-center">{t.dsyQuestion}</p>
          <div className="flex space-x-3">
            {[true, false].map(v => (
              <button key={v ? 'dsy-y' : 'dsy-n'} onClick={() => onUpdate({ isDirectSecondYear: v })} className={`flex-1 p-4 rounded-xl border-2 font-black text-[10px] transition-all uppercase ${state.isDirectSecondYear === v ? 'border-blue-600 bg-white text-blue-900 shadow-md' : 'border-white bg-white/60 text-slate-300'}`}>{v ? t.yes : t.no}</button>
            ))}
          </div>
        </div>
      )}

      {state.currentYear === 1 && (<div className="bg-slate-50 p-6 rounded-2xl space-y-5 no-select border border-slate-200"><p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed text-center">{isMaster ? t.gapQuestionPG : t.gapQuestion}</p><div className="flex space-x-3">{[true, false].map(v => (<button key={v ? 'y' : 'n'} onClick={() => onUpdate({ hadGap: v })} className={`flex-1 p-4 rounded-xl border-2 font-black text-[10px] transition-all uppercase ${state.hadGap === v ? 'border-blue-600 bg-white text-blue-900 shadow-md' : 'border-white bg-white/60 text-slate-300'}`}>{v ? t.yes : t.no}</button>))}</div></div>)}
      {isHostelEligible && (<div className="bg-slate-50 p-6 rounded-2xl space-y-5 no-select border border-slate-200"><p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed text-center">{t.hostelQuestion}</p><div className="flex space-x-3">{[true, false].map(v => (<button key={v ? 'hy' : 'hn'} onClick={() => onUpdate({ isHosteller: v })} className={`flex-1 p-4 rounded-xl border-2 font-black text-[10px] transition-all uppercase ${state.isHosteller === v ? 'border-blue-600 bg-white text-blue-900 shadow-md' : 'border-white bg-white/60 text-slate-300'}`}>{v ? t.yes : t.no}</button>))}</div></div>)}
      
      <button 
        disabled={!state.currentYear || (showDSYQuestion && state.isDirectSecondYear === null)} 
        onClick={onContinue} 
        className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/10 uppercase tracking-[0.2em] text-[11px] disabled:opacity-20 h-16"
      >
        {t.continue}
      </button>
    </div>
  );
};

const StepLoginCheck: React.FC<{ ready: AppState['loginReady']; onToggle: (f: keyof AppState['loginReady']) => void; onContinue: () => void; t: any; }> = ({ ready, onToggle, onContinue, t }) => {
  const isReady = ready.username && ready.password && ready.mobile;
  return (
    <div className="space-y-8">
      <header className="space-y-2"><h2 className="text-2xl font-black text-slate-900 tracking-tight">{t.loginCheck}</h2><p className="text-slate-500 font-medium text-sm leading-relaxed">{t.loginCheckSub}</p></header>
      <div className="bg-slate-50 p-7 rounded-3xl space-y-4 no-select border border-slate-200 shadow-inner">{[ { id: 'username', label: t.loginUser }, { id: 'password', label: t.loginPass }, { id: 'mobile', label: t.loginMobile } ].map(item => (
          <label key={item.id} className="flex items-center space-x-4 cursor-pointer active:opacity-70 group py-1">
            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${ready[item.id as keyof AppState['loginReady']] ? 'bg-blue-600 border-blue-600 shadow-lg' : 'bg-white border-slate-200'}`}>{ready[item.id as keyof AppState['loginReady']] && <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" /></svg>}</div>
            <input type="checkbox" checked={ready[item.id as keyof AppState['loginReady']]} onChange={() => onToggle(item.id as keyof AppState['loginReady'])} className="hidden" /><span className={`text-[11px] font-black tracking-tight uppercase ${ready[item.id as keyof AppState['loginReady']] ? 'text-blue-900' : 'text-slate-400'}`}>{item.label}</span>
          </label>
        ))}</div>
      <button disabled={!isReady} onClick={onContinue} className="w-full bg-blue-900 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/10 active:scale-[0.98] uppercase tracking-[0.2em] text-[11px] disabled:opacity-20 h-16">{t.continue}</button>
    </div>
  );
};

const DocBadge: React.FC<{ type: 'merge' | 'onepdf' | 'optional' | 'ifavailable' | 'anyone' | 'mandatory'; isPrint?: boolean }> = ({ type, isPrint }) => {
  const config = {
    merge: { text: 'MERGE REQUIRED', colors: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'M5 13l4 4L19 7' },
    onepdf: { text: 'ONE PDF', colors: 'bg-blue-50 text-blue-700 border-blue-100', icon: 'M5 13l4 4L19 7' },
    optional: { text: 'OPTIONAL', colors: 'bg-slate-50 text-slate-500 border-slate-200', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    ifavailable: { text: 'IF AVAILABLE', colors: 'bg-slate-50 text-slate-500 border-slate-200', icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    anyone: { text: 'ANY ONE REQUIRED', colors: 'bg-emerald-50 text-emerald-700 border-emerald-100', icon: 'M5 13l4 4L19 7' },
    mandatory: { text: 'MANDATORY', colors: 'bg-red-50 text-red-700 border-red-100', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  }[type];

  if (isPrint) {
    return <span className="print-badge">[{config.text}]</span>;
  }

  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full border ${config.colors} whitespace-nowrap shrink-0 ml-2`}>
      <svg className="w-2.5 h-2.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d={config.icon} />
      </svg>
      <span className="text-[8px] font-black uppercase tracking-tight">{config.text}</span>
    </div>
  );
};

const DeclarationCard: React.FC<{ title: string; instruction: string; fileName: string; downloadUrl: string; t: any }> = ({ title, instruction, fileName, downloadUrl, t }) => (
  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-blue-200 transition-all group flex flex-col">
    <div className="flex justify-between items-start mb-4">
      <h4 className="font-black text-slate-800 text-[14px] leading-tight group-hover:text-blue-900 transition-colors uppercase tracking-tight pr-4">{title}</h4>
    </div>
    <p className="text-[11px] font-medium text-slate-400 mb-5 leading-relaxed">{instruction}</p>
    
    <div className="mb-6">
      <a 
        href={downloadUrl} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="inline-flex items-center space-x-2.5 px-5 py-3 bg-slate-100 hover:bg-blue-600 text-slate-700 hover:text-white rounded-xl transition-all shadow-sm active:scale-95 group/btn"
        aria-label="Download declaration form PDF"
      >
        <svg className="w-4 h-4 text-slate-400 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        <span className="text-[11px] font-black uppercase tracking-widest">{t.downloadForm}</span>
      </a>
    </div>

    <div className="mt-auto pt-4 border-t border-slate-50 flex flex-wrap gap-2">
      <span className="text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-100">PDF ONLY</span>
      <span className="text-[8px] font-black bg-slate-50 text-slate-400 px-2 py-0.5 rounded uppercase tracking-widest border border-slate-100">MAX 250 KB</span>
      <span className="text-[8px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase tracking-tight italic border border-blue-100">FILE: {fileName}</span>
    </div>
  </div>
);

const StepDocumentList: React.FC<{ state: AppState; onRestart: () => void; onBack: () => void; onOpenVideo: (title: string, desc: string, url?: string) => void; onOpenTool: (type: 'merge' | 'compress' | 'img2pdf') => void; t: any; }> = ({ state, onRestart, onBack, onOpenVideo, onOpenTool, t }) => {
  const isFresh = state.currentYear === 1;
  const isDPharm = state.courseType === CourseType.DPharm;
  const isASC = state.stream === Stream.ASC;
  const isMaster = [CourseType.MPharm, CourseType.MBA, CourseType.MCA, CourseType.MA, CourseType.MSc, CourseType.MCom].includes(state.courseType!);
  const isProfessional = state.stream !== Stream.ASC && state.stream !== null;

  const [shouldAnimate, setShouldAnimate] = useState(true);
  const printButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          setShouldAnimate(false);
        }
      },
      { threshold: 0.1 }
    );
    if (printButtonRef.current) observer.observe(printButtonRef.current);
    return () => observer.disconnect();
  }, []);

  const academicDocs = useMemo(() => {
    const docs: { name: string; badge?: any }[] = [];
    const category = state.category;
    if (category && ['SC', 'ST', 'SBC', 'VJNT'].includes(category)) {
      docs.push({ name: 'Current Admission Bonafide Certificate' });
    } else {
      docs.push({ name: 'Admission Bonafide + Fees Paid Receipt', badge: 'merge' });
    }
    docs.push({ name: '10th Marksheet' });
    docs.push({ name: '12th Marksheet' });
    if (!isASC) docs.push({ name: t.docAllotment });
    if (state.isDirectSecondYear === true) {
      docs.push({ name: t.dsyDiplomaMarksheet, badge: 'onepdf' });
    }
    if (isFresh) {
      if (isMaster) {
        docs.push({ name: t.docGradMarksheet });
        docs.push({ name: t.docGradTC });
      } else {
        docs.push({ name: 'Previous College TC / Leaving Certificate' });
      }
      if (state.hadGap) docs.push({ name: 'Gap Certificate', badge: 'onepdf' });
    } else {
      if (isDPharm) {
        docs.push({ name: '1st Year Marksheet', badge: 'onepdf' });
      } else {
        if (!state.isDirectSecondYear) {
          if (state.currentYear! === 2) docs.push({ name: '1st Year Marksheet (Sem 1 + Sem 2)', badge: 'merge' });
        }
        if (state.currentYear! === 3) docs.push({ name: '2nd Year Marksheet (Sem 3 + Sem 4)', badge: 'merge' });
        if (state.currentYear! === 4) docs.push({ name: '3rd Year Marksheet (Sem 5 + Sem 6)', badge: 'merge' });
      }
      docs.push({ name: isMaster ? t.docGradTC : 'Previous College TC / Leaving Certificate' });
    }
    return docs;
  }, [isASC, isFresh, isMaster, isDPharm, state.currentYear, state.hadGap, state.category, state.isDirectSecondYear, t]);

  const govtDocs = useMemo(() => {
    const docs: { name: string; badge?: any }[] = [];
    docs.push({ name: 'Aadhaar Card' });
    const incomeRequired = isFresh || ['Open', 'SEBC', 'Minority'].includes(state.category!);
    if (incomeRequired) docs.push({ name: 'Income Certificate' });
    if (state.category !== 'Open' && state.category !== 'Minority') {
      docs.push({ name: 'Caste Certificate' });
      if (isProfessional) {
        if (['OBC', 'SEBC', 'SBC', 'VJNT'].includes(state.category!)) docs.push({ name: t.docNCL, badge: 'ifavailable' });
      }
      const validityMandatoryCourses = [CourseType.MBA, CourseType.MCA, CourseType.MSc, CourseType.MCom];
      const isMandatory = validityMandatoryCourses.includes(state.courseType!);
      docs.push({ name: t.docCasteValidity, badge: isMandatory ? 'mandatory' : 'ifavailable' });
    }
    docs.push({ name: 'Domicile Certificate' });
    return docs;
  }, [isFresh, isProfessional, state.category, state.courseType, state.stream, t]);

  const choiceDocs = useMemo(() => {
    if (state.category === 'Open' && state.isHosteller) {
      return ['Alpabhudharak Certificate', 'Job Card'];
    }
    return null;
  }, [state.category, state.isHosteller]);

  const declarationForms = useMemo(() => {
    const commonDeclLink = "https://www.atharvacoe.ac.in/wp-content/uploads/Pratidnya-Patra.pdf";
    const minorityDeclLink = "https://www.mhssce.ac.in/pdf/Income_Self_declaration_minority.pdf";
    
    if (state.category === 'Open') {
      const instruction = t.declOpenInst;
      if (state.isHosteller) {
        return [
          { title: t.declOpenTitle1, instruction, fileName: "Declaration1_RationCard.pdf", downloadUrl: commonDeclLink },
          { title: t.declOpenTitle2, instruction, fileName: "Declaration2_RationCard.pdf", downloadUrl: commonDeclLink }
        ];
      } else {
        return [
          { title: t.declOpenTitle, instruction, fileName: "Declaration_RationCard.pdf", downloadUrl: commonDeclLink }
        ];
      }
    }
    if (['OBC', 'SC', 'ST', 'SBC', 'VJNT', 'SEBC'].includes(state.category!)) {
      return [{ title: t.declObcTitle, instruction: t.declObcInst, fileName: "Declaration.pdf", downloadUrl: commonDeclLink }];
    }
    if (state.category === 'Minority') {
      return [{ title: t.declMinorityTitle, instruction: t.declMinorityInst, fileName: "Minority_Declaration.pdf", downloadUrl: minorityDeclLink }];
    }
    return null;
  }, [state.category, state.isHosteller, t]);

  const handlePrint = () => {
    setShouldAnimate(false);
    window.print();
  };

  const printArea = document.getElementById('print-area');

  return (
    <div className="space-y-10">
      {printArea && createPortal(
        <div className="space-y-12">
          <header className="border-b-4 border-black pb-8 mb-8">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-4 text-black">MahaDBT Scholarship Checklist</h1>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-8">Pathrikar Campus • Scholarship Assistance Tool Output</p>
            <div className="grid grid-cols-2 gap-y-6 gap-x-12 border-t border-slate-200 pt-6">
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Target Course</span><span className="text-base font-black text-black leading-tight">{state.courseType || state.stream}</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Caste Category</span><span className="text-base font-black text-black leading-tight">{state.category}</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Academic Year</span><span className="text-base font-black text-black leading-tight">{state.currentYear}{state.currentYear === 1 ? 'st' : state.currentYear === 2 ? 'nd' : state.currentYear === 3 ? 'rd' : 'th'} Year</span></div>
              <div className="flex flex-col"><span className="text-[10px] uppercase text-slate-500 font-black tracking-widest mb-1">Application Mode</span><span className="text-base font-black text-black leading-tight">{isFresh ? "FRESH APPLICATION" : "RENEWAL APPLICATION"}</span></div>
            </div>
          </header>
          <div className="space-y-10">
            {declarationForms && (
              <div className="print-section">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Declaration Documents</h3>
                {declarationForms.map((decl, idx) => (<div key={idx} className="print-doc-item"><span className="print-checkbox"></span><span className="text-sm font-black uppercase">{decl.title}</span></div>))}
              </div>
            )}
            <div className="print-section">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t.academicDocs}</h3>
              {academicDocs.map((doc, idx) => (<div key={idx} className="print-doc-item"><span className="print-checkbox"></span><span className="text-sm font-black uppercase">{doc.name}{doc.badge && <DocBadge type={doc.badge} isPrint />}</span></div>))}
            </div>
            <div className="print-section">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">{t.categoryDocs}</h3>
              {govtDocs.map((doc, idx) => (<div key={idx} className="print-doc-item"><span className="print-checkbox"></span><span className="text-sm font-black uppercase">{doc.name}{doc.badge && <DocBadge type={doc.badge} isPrint />}</span></div>))}
              {choiceDocs && choiceDocs.map((name, idx) => (<div key={idx} className="print-doc-item"><span className="print-checkbox"></span><span className="text-sm font-black uppercase">{name}<DocBadge type="anyone" isPrint /></span></div>))}
            </div>
          </div>
          <footer className="mt-12 pt-8 border-t border-black text-center"><p className="text-sm font-black uppercase tracking-widest text-black mb-2">For guidance only. Final verification will be done at the college office.</p><p className="text-[9px] text-slate-500 uppercase tracking-tighter">Generated on {new Date().toLocaleDateString()} via Assistance Tool</p></footer>
        </div>,
        printArea
      )}
      <header className="space-y-4 no-print">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex-grow space-y-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">{t.docsTitle}</h2>
            <div className="flex flex-wrap gap-1.5">
              {[state.courseType || state.stream, state.category, `${state.currentYear} Year`, isFresh ? t.freshApp : t.renewalApp].map((pill, i) => (
                <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded-lg uppercase border border-slate-100 shadow-sm tracking-tight">{pill}</span>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start sm:items-end shrink-0 pt-1 sm:pt-0">
            <button ref={printButtonRef} onClick={handlePrint} className={`inline-flex items-center space-x-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-600 rounded-full transition-all border border-slate-200/60 shadow-sm ${shouldAnimate ? 'animate-soft-pulse' : ''}`}>
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              <span className="text-[11px] font-semibold whitespace-nowrap">Print document checklist</span>
            </button>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium ml-1.5 sm:ml-0 opacity-70">Prints the complete document list on A4 pages.</p>
          </div>
        </div>
      </header>
      <div className="p-6 bg-[#1e3a8a] text-white rounded-3xl relative overflow-hidden shadow-xl shadow-blue-900/10 no-print">
        <h4 className="text-blue-300 font-black text-[10px] uppercase tracking-[0.4em] mb-5">Submission Protocol</h4>
        <ul className="space-y-3.5 text-xs font-bold leading-relaxed opacity-90">
          <li className="flex items-start space-x-3"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(96,165,250,0.6)]"/> <span>{t.rulePdf}</span></li>
          <li className="flex items-start space-x-3"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(96,165,250,0.6)]"/> <span>{t.ruleSize}</span></li>
          <li className="flex items-start space-x-3"><div className="w-1.5 h-1.5 bg-blue-400 rounded-full shrink-0 mt-1.5 shadow-[0_0_8px_rgba(96,165,250,0.6)]"/> <span className="text-blue-100/70 italic font-medium">{t.ruleNaming}</span></li>
        </ul>
      </div>
      <div className="space-y-12">
        {declarationForms && (
          <section className="space-y-5">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">Declaration Documents</p>
            <div className="space-y-3">
              {declarationForms.map((decl, idx) => (<DeclarationCard key={idx} {...decl} t={t} />))}
            </div>
          </section>
        )}
        <section className="space-y-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">{t.academicDocs}</p>
          <div className="space-y-3">
            {academicDocs.map((doc, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-blue-100 transition-colors group flex items-start justify-between min-w-0">
                <h4 className="font-black text-slate-700 text-[12px] leading-relaxed group-hover:text-blue-900 transition-colors uppercase tracking-tight pr-2 pt-0.5 whitespace-normal break-words flex-grow flex items-center">{doc.name}{doc.badge && <DocBadge type={doc.badge} />}</h4>
              </div>
            ))}
          </div>
        </section>
        <section className="space-y-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] px-2">{t.categoryDocs}</p>
          <div className="space-y-3">
            {govtDocs.map((doc, idx) => (
              <div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-blue-100 transition-colors group flex items-start justify-between min-w-0">
                <h4 className="font-black text-slate-700 text-[12px] leading-relaxed group-hover:text-blue-900 transition-colors uppercase tracking-tight pr-2 pt-0.5 whitespace-normal break-words flex-grow flex items-center">{doc.name}{doc.badge && <DocBadge type={doc.badge} />}</h4>
              </div>
            ))}
            {choiceDocs && (
              <div className="bg-slate-50/50 rounded-[2rem] p-6 border border-slate-100 space-y-4 mt-4">
                <div className="flex flex-col space-y-1"><span className="text-[9px] font-black text-emerald-700 uppercase tracking-tight">ANY ONE REQUIRED</span><span className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter">UPLOAD ONLY ONE DOCUMENT</span></div>
                <div className="space-y-2">
                  {choiceDocs.map((name, idx) => (<div key={idx} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm flex items-start justify-between group min-w-0"><h4 className="font-black text-slate-800 text-[12px] leading-relaxed uppercase tracking-tight pr-2 pt-0.5 whitespace-normal break-words flex-grow flex items-center">{name}<DocBadge type="anyone" /></h4></div>))}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
      <section className="space-y-6 pt-10 border-t border-slate-100 no-print">
        <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">{t.docToolsTitle}</h3>
        <div className="grid grid-cols-1 gap-3">
          {[
            { id: 'merge', label: t.btnMerge, sub: t.helperMerge, type: 'merge' },
            { id: 'compress', label: t.btnCompress, sub: t.helperCompress, type: 'compress' },
            { id: 'img2pdf', label: t.btnImgToPdf, sub: t.helperImgToPdf, type: 'img2pdf' }
          ].map((tool, i) => (
            <button key={i} onClick={() => onOpenTool(tool.type as any)} className="p-5 rounded-2xl border border-slate-100 hover:border-blue-300 hover:bg-white bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)] active:scale-[0.98] transition-all flex flex-col group text-left">
              <span className="font-black text-[11px] uppercase tracking-widest text-slate-800 group-hover:text-blue-900 transition-colors">{tool.label}</span>
              <span className="text-[9px] font-bold text-slate-400 mt-2 group-hover:text-slate-500 transition-colors">{tool.sub}</span>
            </button>
          ))}
        </div>
      </section>
      <button onClick={onRestart} className="w-full bg-blue-900 text-white font-black py-6 rounded-2xl shadow-2xl shadow-blue-900/10 active:scale-[0.98] uppercase tracking-[0.3em] text-[11px] mt-6 transition-all hover:bg-blue-800 h-16 no-print">{t.home}</button>
    </div>
  );
};

export default App;