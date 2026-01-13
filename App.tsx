
import React, { useState } from 'react';
import Header from './components/Header';
import QuizForm from './components/QuizForm';
import MathRenderer from './components/MathRenderer';
import { QuizConfig, GeneratedQuiz } from './types';
import { generateProfessionalQuiz, generateImageForQuestion } from './services/geminiService';

type ViewMode = 'guru' | 'kisi' | 'siswa';

const App: React.FC = () => {
  const [result, setResult] = useState<GeneratedQuiz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('guru');
  const [images, setImages] = useState<Record<string, string>>({});

  const handleGenerate = async (config: QuizConfig) => {
    setIsLoading(true);
    setImages({});
    try {
      const quiz = await generateProfessionalQuiz(config);
      setResult(quiz);
      
      if (config.includeImages && config.imageCount > 0) {
        const questionsToImage = quiz.questions
          .filter(q => q.imagePrompt)
          .slice(0, config.imageCount);

        for (const q of questionsToImage) {
          if (q.imagePrompt) {
            const url = await generateImageForQuestion(q.imagePrompt);
            if (url) setImages(prev => ({ ...prev, [q.id]: url }));
          }
        }
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan teknis. Periksa koneksi atau API Key.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToDoc = (modeLabel: string, elementId: string) => {
    const contentElement = document.getElementById(elementId);
    if (!contentElement || !result) return;

    // Use Topic for filename as requested
    const topic = result.metadata.topic || 'Untitled';
    const fileName = `Soal-${topic}`;

    // Professional Word XML Header and Styles
    // We use inline styles and standard HTML attributes that Word understands well (e.g. border="1")
    const styles = `
      <style>
        @page WordSection1 {
          size: 21.0cm 29.7cm; 
          margin: 2.5cm 2.5cm 2.5cm 2.5cm;
        }
        div.WordSection1 { page: WordSection1; }
        
        body { 
          font-family: 'Times New Roman', serif; 
          font-size: 11pt; 
          line-height: 1.25; 
          color: black;
        }
        
        h2 { 
          font-size: 14pt; 
          font-weight: bold; 
          text-align: center; 
          text-transform: uppercase;
          margin-bottom: 20pt;
        }

        .identitas-table {
          width: 100%;
          border-bottom: 3pt double black;
          margin-bottom: 20pt;
          padding-bottom: 10pt;
        }

        .question-block {
          margin-bottom: 15pt;
          page-break-inside: avoid;
        }

        .stimulus-box {
          background-color: #f2f2f2;
          border-left: 5px solid #888888;
          padding: 10pt;
          margin-bottom: 10pt;
          font-style: italic;
          mso-shading: windowtext;
          mso-pattern: gray-10 auto;
        }

        /* AKM Tables & General Tables */
        table { 
          border-collapse: collapse; 
          width: 100%; 
          margin: 10pt 0;
        }
        
        th, td { 
          border: 1pt solid #000000; 
          padding: 6pt; 
          vertical-align: top;
          font-size: 11pt;
        }
        
        th { background-color: #f2f2f2; font-weight: bold; text-align: center; }

        /* Fixed Option Formatting: A. Text on one line */
        .option-para {
          margin: 0;
          margin-bottom: 4pt;
          padding: 0;
          text-indent: 0pt;
        }

        .option-label {
          font-weight: bold;
          margin-right: 8pt;
        }

        .footer-branding {
          margin-top: 50pt;
          text-align: right;
          font-size: 8pt;
          color: #999999;
          border-top: 0.5pt solid #cccccc;
          padding-top: 5pt;
        }
      </style>
    `;

    const docHeader = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' 
            xmlns:w='urn:schemas-microsoft-com:office:word' 
            xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${fileName}</title>
        ${styles}
      </head>
      <body>
        <div class="WordSection1">
    `;
    const docFooter = `
        <div class="footer-branding">faizin-smp2 kudus</div>
      </div></body></html>`;

    // Process Content for Word
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = contentElement.innerHTML;

    // 1. Convert Multiple Choice Options into "A. Text" format
    tempContainer.querySelectorAll('.option-item').forEach(item => {
        const labelEl = item.querySelector('.option-label');
        const textContainer = item.querySelector('.prose-content') || item.querySelector('.flex-1');
        
        if (labelEl && textContainer) {
          const label = labelEl.textContent?.trim() || '';
          const text = textContainer.textContent?.trim() || '';
          const p = document.createElement('p');
          p.className = 'option-para';
          p.innerHTML = `<span class="option-label">${label}.</span> ${text}`;
          item.replaceWith(p);
        }
    });

    // 2. Ensure all tables have border="1" so Word displays them
    tempContainer.querySelectorAll('table').forEach(table => {
      table.setAttribute('border', '1');
      table.style.borderCollapse = 'collapse';
    });

    // 3. Remove KaTeX internal DOM artifacts if any, just keep the content
    // MathRenderer content is already rendered as HTML, but we want to ensure Word reads it as plain text if complex
    // Note: Word doesn't support KaTeX fonts well. 

    // Remove hidden UI elements
    tempContainer.querySelectorAll('.print\\:hidden').forEach(el => el.remove());

    const sourceHTML = docHeader + tempContainer.innerHTML + docFooter;
    
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName.replace(/[^a-z0-9]/gi, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      
      <div className="max-w-[1400px] mx-auto px-4 mt-8 grid grid-cols-1 xl:grid-cols-12 gap-8">
        <div className="xl:col-span-4 print:hidden">
          <QuizForm onGenerate={handleGenerate} isLoading={isLoading} />
        </div>

        <div className="xl:col-span-8 space-y-6">
          {result ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="bg-white p-2 rounded-2xl flex space-x-2 shadow-sm border border-slate-100 print:hidden">
                {(['guru', 'kisi', 'siswa'] as ViewMode[]).map((v) => (
                  <button key={v} onClick={() => setActiveView(v)}
                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeView === v ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'text-slate-400 hover:bg-slate-50'}`}>
                    {v === 'guru' ? 'Preview Guru' : v === 'kisi' ? 'Kisi-Kisi' : 'Mode Siswa'}
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-3 print:hidden">
                 <button onClick={() => exportToDoc(activeView, 'quiz-content')} 
                   className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-bold flex items-center space-x-2 hover:bg-green-700 shadow-md">
                   <span>Download .DOC</span>
                 </button>
                 <button onClick={() => window.print()} className="px-6 py-2 bg-slate-800 text-white rounded-lg text-sm font-bold flex items-center space-x-2 hover:bg-slate-900 shadow-md">
                   <span>Cetak / PDF</span>
                 </button>
              </div>

              <div id="quiz-content" className="bg-white p-12 rounded-3xl shadow-2xl border border-slate-100 min-h-[1000px] print:shadow-none print:border-none print:p-0">
                
                {(activeView === 'guru' || activeView === 'siswa') && (
                  <div className="mb-10 border-b-4 border-double border-slate-900 pb-6 text-center">
                    <h2 className="text-2xl font-black uppercase mb-1">NASKAH SOAL</h2>
                    <div className="grid grid-cols-2 text-left text-sm mt-4 font-bold max-w-2xl mx-auto border-t border-slate-200 pt-4">
                      <div>Mapel: {result.metadata.subject}</div>
                      <div>Materi: {result.metadata.topic}</div>
                      <div>Kelas: {result.metadata.grade}</div>
                      <div>Waktu: {result.metadata.timeLimit} Menit</div>
                    </div>
                  </div>
                )}

                {(activeView === 'guru' || activeView === 'siswa') && (
                  <div className="space-y-10">
                    {result.questions.map((q, i) => (
                      <div key={q.id} className="question-block text-sm">
                        <div className="flex space-x-3">
                           <span className="font-bold">{i + 1}.</span>
                           <div className="flex-1 space-y-4">
                              {q.stimulus && (
                                <div className="stimulus-box border-l-4 border-slate-300 bg-slate-50 p-4 italic text-slate-600 rounded-r-lg">
                                  <MathRenderer text={q.stimulus} />
                                </div>
                              )}
                              
                              {images[q.id] && (
                                <div className="mb-4">
                                  <img src={images[q.id]} alt="context" className="max-w-md h-auto rounded-lg border border-slate-100 shadow-sm" />
                                </div>
                              )}

                              <div className="font-bold leading-relaxed">
                                <MathRenderer text={q.questionText} />
                              </div>
                              
                              {q.options && q.options.length > 0 && (
                                <div className="space-y-2 mt-4 ml-4">
                                  {q.options.map(opt => (
                                    <div key={opt.label} className="option-item flex space-x-3 group">
                                      <span className="option-label font-bold text-indigo-600 bg-indigo-50 w-6 h-6 flex items-center justify-center rounded-md text-xs group-hover:bg-indigo-600 group-hover:text-white transition-colors">{opt.label}</span>
                                      <MathRenderer text={opt.text} className="flex-1" />
                                    </div>
                                  ))}
                                </div>
                              )}
                           </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(activeView === 'guru' || activeView === 'kisi') && (
                  <div className="mt-20">
                    <h2 className="text-xl font-bold uppercase mb-6 text-center border-b-2 border-slate-900 pb-2">KISI-KISI ASESMEN</h2>
                    <table className="w-full border-collapse border border-slate-900 text-xs">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="border border-slate-900 p-2 w-10">No</th>
                          <th className="border border-slate-900 p-2">Indikator Soal</th>
                          <th className="border border-slate-900 p-2 text-center">Level</th>
                          <th className="border border-slate-900 p-2 text-center">Tipe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.blueprint.map((bp) => (
                          <tr key={bp.no}>
                            <td className="border border-slate-900 p-2 text-center">{bp.no}</td>
                            <td className="border border-slate-900 p-2">{bp.indicator}</td>
                            <td className="border border-slate-900 p-2 text-center">{bp.level}</td>
                            <td className="border border-slate-900 p-2 text-center uppercase">{bp.type}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeView === 'guru' && (
                  <div className="mt-20">
                    <h2 className="text-xl font-bold uppercase mb-6 text-center border-b-2 border-slate-900 pb-2">KUNCI & PEMBAHASAN</h2>
                    <div className="space-y-6">
                      {result.questions.map((q, i) => (
                        <div key={`key-${q.id}`} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-center justify-between mb-2">
                             <span className="font-bold">No. {i + 1}</span>
                             <span className="px-3 py-1 bg-indigo-600 text-white rounded font-black">{q.correctAnswer}</span>
                          </div>
                          <div className="text-sm text-slate-600 italic">
                             <MathRenderer text={q.explanation} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="mt-20 pt-10 border-t border-slate-100 text-right">
                  <span className="text-xs font-black text-slate-300 uppercase tracking-widest">faizin-smp2 kudus</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
              </div>
              <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">AI Assessment Builder</h2>
              <p className="text-slate-500 mt-2">Sistem perancang asesmen cerdas berbasis AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
