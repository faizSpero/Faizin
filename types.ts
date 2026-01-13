
export enum AppMode {
  SCHOOL = 'Guru Sekolah',
  BIMBEL = 'Guru Bimbel'
}

export enum DifficultyLevel {
  L1 = 'Level 1: Mudah (Pemahaman Dasar)',
  L2 = 'Level 2: Sedang (Aplikasi)',
  L3 = 'Level 3: Sulit (Analisis)',
  L4 = 'Level 4: HOTS (Evaluasi & Kreasi)',
  L5 = 'Level 5: Olimpiade (Expert)'
}

export enum LanguageStyle {
  FORMAL = 'Bahasa Formal Sekolah (Baku Akademik)',
  SEMI_FORMAL = 'Bahasa Semi Formal (Luwes - Komunikatif)',
  SIMPLE = 'Bahasa Sederhana (Ramah Anak PAUD/SD)',
  MADRASAH = 'Bahasa Madrasah (Islami & Santun)',
  BIMBEL = 'Bahasa Bimbel (Trik Cepat)'
}

export enum AnswerKeyMode {
  COMPLETE = 'Lengkap (Kunci + Pembahasan Detail)',
  BRIEF = 'Ringkas (Hanya Kunci Jawaban)',
  RUBRIC = 'Rubrik Penilaian dan Skor'
}

export enum DistributionMode {
  PROPORSIONAL = 'Proporsional',
  FLAT = 'Flat/Merata',
  HOTS = 'Dominan HOTS',
  REMEDIAL = 'Mode Remedial'
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'pgs',
  TRUE_FALSE = 'bs_akm'
}

export interface QuestionTypeEntry {
  id: string;
  label: string;
  count: number;
  active: boolean;
}

export interface QuizConfig {
  mode: AppMode;
  language: 'Indonesia' | 'Inggris';
  level: string;
  grade: string;
  subject: string;
  assessmentType: string;
  topic: string;
  summaryText: string;
  competencyMode: 'Auto' | 'Manual';
  competencyInput: string;
  answerKeyMode: AnswerKeyMode;
  questionTypes: QuestionTypeEntry[];
  mcOptions: number;
  includeImages: boolean; // New toggle
  imageCount: number;
  languageStyle: LanguageStyle;
  stimulusMode: boolean;
  difficulty: DifficultyLevel;
  distribution: DistributionMode;
  timeLimit: number;
}

export interface Question {
  id: string;
  type: string;
  difficulty: string;
  questionText: string;
  stimulus?: string;
  options?: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  imagePrompt?: string;
  imageUrl?: string;
  indicator?: string;
}

export interface BlueprintEntry {
  no: number;
  competency: string;
  indicator: string;
  level: string;
  type: string;
}

export interface GeneratedQuiz {
  questions: Question[];
  blueprint: BlueprintEntry[];
  metadata: Partial<QuizConfig>;
}
