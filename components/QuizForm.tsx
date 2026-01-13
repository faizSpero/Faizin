
import React, { useState, useEffect } from 'react';
import { 
  AppMode, DifficultyLevel, LanguageStyle, AnswerKeyMode, 
  DistributionMode, QuizConfig, QuestionTypeEntry 
} from '../types';

interface QuizFormProps {
  onGenerate: (config: QuizConfig) => void;
  isLoading: boolean;
}

const SCHOOL_SUBJECTS = [
  "Pendidikan Agama Islam", "Katolik", "Kristen Protestan", "Pend. Pancasila", 
  "Bahasa Indonesia", "Matematika", "IPA", "IPS", "Bahasa Inggris", "PJOK", 
  "Seni Budaya", "Informatika", "Muatan Lokal (Bahasa Jawa)", "Muatan Lokal (Bahasa Sunda)"
];

const BIMBEL_TYPES = [
  { id: 'dg', label: 'Drilling Ganda (Speed Test)' },
  { id: 'pgk_tka', label: 'PG Kompleks (Adaptasi TKA - Model 1-2-3 / Sebab Akibat)' },
  { id: 'tps', label: 'Tes Potensi Skolastik (TPS - Penalaran Umum)' },
  { id: 'pk', label: 'Pengetahuan Kuantitatif (Trik Matematika)' },
  { id: 'pbm', label: 'Pemahaman Bacaan & Menulis (PBM)' },
  { id: 'eng_snbt', label: 'Literasi Bahasa Inggris (Model SNBT)' },
  { id: 'mat_pen', label: 'Penalaran Matematika (Soal Cerita Kompleks)' },
  { id: 'tiu', label: 'Tes Intelegensia Umum (TIU - Kedinasan/CPNS)' },
  { id: 'twk', label: 'Tes Wawasan Kebangsaan (TWK - Hafalan & Analisis)' }
];

const SCHOOL_TYPES = [
  { id: 'pgs', label: 'Pilihan Ganda Standar' },
  { id: 'pgk', label: 'Pilihan Ganda Kompleks (Model 1,2,3)' },
  { id: 'pgk_akm', label: 'Pilihan Ganda Kompleks (AKM-Multi Jawaban)' },
  { id: 'bs_akm', label: 'Benar / Salah (AKM)' },
  { id: 'skala', label: 'Skala Sikap (Tabel TS-S-SS)' },
  { id: 'jodoh', label: 'Menjodohkan (Matching)' },
  { id: 'isian', label: 'Isian Singkat' },
  { id: 'essay', label: 'Essay / Uraian' },
  { id: 'literasi', label: 'Asesmen Literasi (Teks & Analisis)' },
  { id: 'numerasi', label: 'Asesmen Numerasi (Data & Tabel)' },
  { id: 'kasus', label: 'Studi Kasus (HOTS)' },
  { id: 'urut', label: 'Menyusun Pernyataan / Urutan' }
];

const GRADE_MAPPING: Record<string, string[]> = {
  "SD": ["Kelas 1", "Kelas 2", "Kelas 3", "Kelas 4", "Kelas 5", "Kelas 6"],
  "SMP": ["Kelas 7", "Kelas 8", "Kelas 9"],
  "SMA": ["Kelas 10", "Kelas 11", "Kelas 12"],
  "SMK": ["Kelas 10", "Kelas 11", "Kelas 12"]
};

const QuizForm: React.FC<QuizFormProps> = ({ onGenerate, isLoading }) => {
  const [mode, setMode] = useState<AppMode>(AppMode.SCHOOL);
  const [config, setConfig] = useState<QuizConfig>({
    mode: AppMode.SCHOOL,
    language: 'Indonesia',
    level: 'SMA',
    grade: 'Kelas 10',
    subject: 'Matematika',
    assessmentType: 'Ulangan Harian',
    topic: '',
    summaryText: '',
    competencyMode: 'Auto',
    competencyInput: '',
    answerKeyMode: AnswerKeyMode.COMPLETE,
    questionTypes: SCHOOL_TYPES.map(t => ({ ...t, count: 0, active: false })),
    mcOptions: 5,
    includeImages: false,
    imageCount: 0,
    languageStyle: LanguageStyle.FORMAL,
    stimulusMode: true,
    difficulty: DifficultyLevel.L2,
    distribution: DistributionMode.PROPORSIONAL,
    timeLimit: 90
  });

  useEffect(() => {
    const newTypes = mode === AppMode.SCHOOL ? SCHOOL_TYPES : BIMBEL_TYPES;
    setConfig(prev => ({
      ...prev,
      mode: mode,
      questionTypes: newTypes.map(t => ({ ...t, count: 0, active: false }))
    }));
  }, [mode]);

  const handleLevelChange = (newLevel: string) => {
    const availableGrades = GRADE_MAPPING[newLevel] || [];
    setConfig(prev => ({
      ...prev,
      level: newLevel,
      grade: availableGrades[0] || ''
    }));
  };

  const totalQuestions = config.questionTypes.reduce((acc, curr) => acc + (curr.active ? curr.count : 0), 0);

  // Sync image count slider max
  useEffect(() => {
    if (config.imageCount > totalQuestions) {
      setConfig(prev => ({ ...prev, imageCount: totalQuestions }));
    }
  }, [totalQuestions]);

  const handleTypeChange = (id: string, field: 'active' | 'count', value: any) => {
    setConfig(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (res) => setConfig(prev => ({ ...prev, summaryText: res.target?.result as string }));
      reader.readAsText(file);
    } else {
      alert("Hanya file .txt yang diizinkan");
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="flex bg-slate-50 border-b border-slate-100">
        <button 
          onClick={() => setMode(AppMode.SCHOOL)}
          className={`flex-1 py-4 font-bold text-sm transition-all ${mode === AppMode.SCHOOL ? 'bg-white text-indigo-600 border-t-4 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          MODE GURU SEKOLAH
        </button>
        <button 
          onClick={() => setMode(AppMode.BIMBEL)}
          className={`flex-1 py-4 font-bold text-sm transition-all ${mode === AppMode.BIMBEL ? 'bg-white text-orange-600 border-t-4 border-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
        >
          MODE GURU BIMBEL
        </button>
      </div>

      <div className="p-8 space-y-8 max-h-[80vh] overflow-y-auto">
        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
            <span className="w-8 h-[1px] bg-slate-200 mr-3"></span> Identitas & Materi
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Bahasa Pengantar</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none" 
                value={config.language} onChange={e => setConfig({...config, language: e.target.value as any})}>
                <option>Indonesia</option>
                <option>Inggris</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Jenjang</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={config.level} onChange={e => handleLevelChange(e.target.value)}>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="SMK">SMK</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Kelas / Tingkat</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={config.grade} onChange={e => setConfig({...config, grade: e.target.value})}>
                {(GRADE_MAPPING[config.level] || []).map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Mata Pelajaran</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={config.subject} onChange={e => setConfig({...config, subject: e.target.value})}>
                {SCHOOL_SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Jenis Asesmen</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={config.assessmentType} onChange={e => setConfig({...config, assessmentType: e.target.value})}>
                <option>Ulangan Harian</option><option>ASTS</option><option>ASAS</option><option>Asesmen Diagnostik</option><option>AKM/TKA</option><option>US/M</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Topik Utama Soal</label>
            <input type="text" className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Masukkan materi spesifik..." value={config.topic} onChange={e => setConfig({...config, topic: e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Ringkasan Materi (.txt - Optional)</label>
            <input type="file" accept=".txt" onChange={handleFileUpload} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
            <span className="w-8 h-[1px] bg-slate-200 mr-3"></span> Jenis & Jumlah Soal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
            {config.questionTypes.map(type => (
              <div key={type.id} className="flex items-center space-x-3 bg-white p-3 rounded-xl border border-slate-100">
                <input type="checkbox" checked={type.active} onChange={e => handleTypeChange(type.id, 'active', e.target.checked)} className="w-5 h-5 text-indigo-600 rounded" />
                <span className="flex-1 text-xs font-medium text-slate-700 leading-tight">{type.label}</span>
                {type.active && (
                  <input type="number" min="1" max="50" value={type.count} onChange={e => handleTypeChange(type.id, 'count', parseInt(e.target.value) || 0)}
                    className="w-16 p-1 text-center bg-slate-50 border border-slate-200 rounded text-sm font-bold" />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center bg-indigo-900 text-white p-4 rounded-xl shadow-lg">
            <span className="font-bold">Total Soal Terencana:</span>
            <span className="text-2xl font-black">{totalQuestions}</span>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] flex items-center">
            <span className="w-8 h-[1px] bg-slate-200 mr-3"></span> Konfigurasi Lanjutan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Opsi PG</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" value={config.mcOptions} onChange={e => setConfig({...config, mcOptions: parseInt(e.target.value)})}>
                <option value={3}>3 Pilihan (A,B,C) - SD</option>
                <option value={4}>4 Pilihan (A,B,C,D) - SMP</option>
                <option value={5}>5 Pilihan (A,B,C,D,E) - SMA/SMK</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Gaya Bahasa</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" value={config.languageStyle} onChange={e => setConfig({...config, languageStyle: e.target.value as any})}>
                {Object.values(LanguageStyle).map(ls => <option key={ls}>{ls}</option>)}
              </select>
            </div>
            
            {/* New Mode Soal Bergambar Toggle */}
            <div className="md:col-span-2 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
               <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <button 
                      type="button"
                      onClick={() => setConfig({...config, includeImages: !config.includeImages})}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${config.includeImages ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.includeImages ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wider">Mode Soal Bergambar</span>
                  </div>
                  {config.includeImages && <span className="text-xs font-black text-indigo-600 bg-white px-2 py-1 rounded-lg border border-indigo-100">{config.imageCount} Soal Bergambar</span>}
               </div>
               
               {config.includeImages && (
                 <div className="space-y-2 animate-in slide-in-from-top-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase">
                      <span>Jumlah Visual AI</span>
                      <span>Maks: {totalQuestions}</span>
                    </div>
                    <input type="range" min="0" max={totalQuestions || 1} value={config.imageCount} onChange={e => setConfig({...config, imageCount: parseInt(e.target.value)})}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                 </div>
               )}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tingkat Kesulitan</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" value={config.difficulty} onChange={e => setConfig({...config, difficulty: e.target.value as any})}>
                {Object.values(DifficultyLevel).map(dl => <option key={dl}>{dl}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Distribusi Soal</label>
              <select className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200" value={config.distribution} onChange={e => setConfig({...config, distribution: e.target.value as any})}>
                {Object.values(DistributionMode).map(dm => <option key={dm}>{dm}</option>)}
              </select>
            </div>
          </div>
        </section>

        <button 
          onClick={() => onGenerate(config)}
          disabled={isLoading || totalQuestions === 0}
          className="w-full py-5 bg-gradient-to-r from-indigo-600 to-violet-700 text-white rounded-2xl font-black text-lg shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
        >
          {isLoading ? (
            <span className="animate-pulse">Sedang Menyusun Soal Terbaik...</span>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>GENERATE SOAL AI</span>
            </>
          )}
        </button>
        <div className="text-center">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">faizin-smp2 kudus</span>
        </div>
      </div>
    </div>
  );
};

export default QuizForm;
