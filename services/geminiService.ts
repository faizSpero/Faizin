
import { GoogleGenAI, Type } from "@google/genai";
import { QuizConfig, Question, GeneratedQuiz, AppMode } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalQuiz = async (config: QuizConfig): Promise<GeneratedQuiz> => {
  const ai = getAI();
  const activeTypes = config.questionTypes.filter(t => t.active && t.count > 0);
  const totalExpected = activeTypes.reduce((acc, curr) => acc + curr.count, 0);
  
  const systemInstruction = `Anda adalah pakar perancang kurikulum dan asesmen pendidikan (Kurikulum Merdeka/K13). 
  Buatlah soal berkualitas tinggi berdasarkan parameter berikut:
  Mode: ${config.mode}
  Bahasa: ${config.language}
  Jenjang: ${config.level} (${config.grade})
  Mata Pelajaran: ${config.subject}
  Tipe Asesmen: ${config.assessmentType}
  Topik: ${config.topic}
  Gaya Bahasa: ${config.languageStyle}
  Kesulitan: ${config.difficulty}
  Distribusi: ${config.distribution}
  
  JUMLAH SOAL WAJIB: Total tepat ${totalExpected} soal.
  Rincian Tipe: ${activeTypes.map(t => `${t.count} soal tipe ${t.id} (${t.label})`).join(", ")}
  
  PENTING - SIMBOL MATEMATIKA & KIMIA:
  - Gunakan format LaTeX (standard $...$ untuk inline atau $$...$$ untuk block).
  
  PENTING - BENAR/SALAH (bs_akm):
  - Anda WAJIB menyajikan soal Benar/Salah AKM dalam format TABEL MARKDOWN di dalam "questionText".
  - Tabel harus memiliki kolom: "Pernyataan", "Benar", dan "Salah".
  - Di kolom "Benar" dan "Salah", gunakan simbol kotak kosong unicode (☐) agar terlihat seperti lembar ujian asli.
  - Berikan minimal 3-5 pernyataan per soal bs_akm.
  
  PENTING - MENJODOHKAN (jodoh):
  - Sajikan bagian inti soal (tabel pasangan) menggunakan format TABEL MARKDOWN di properti "questionText".
  - Tabel harus memiliki 2 kolom: "Pernyataan" dan "Pilihan Jawaban (Acak)".
  
  PENTING - GAMBAR:
  - ${config.includeImages ? `Berikan "imagePrompt" deskriptif hanya untuk ${config.imageCount} soal pertama.` : `Jangan sertakan imagePrompt.`}
  
  Opsi PG: ${config.mcOptions} pilihan.
  Stimulus: ${config.stimulusMode ? 'Gunakan stimulus berupa teks/data/kasus sebelum soal' : 'Langsung ke pertanyaan'}
  
  Keluaran harus dalam JSON murni dengan array 'questions' berisi tepat ${totalExpected} objek.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: systemInstruction,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                questionText: { type: Type.STRING },
                stimulus: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      label: { type: Type.STRING },
                      text: { type: Type.STRING }
                    }
                  }
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                indicator: { type: Type.STRING }
              },
              required: ["id", "type", "questionText", "correctAnswer", "explanation", "difficulty"]
            }
          },
          blueprint: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                no: { type: Type.NUMBER },
                competency: { type: Type.STRING },
                indicator: { type: Type.STRING },
                level: { type: Type.STRING },
                type: { type: Type.STRING }
              }
            }
          }
        },
        required: ["questions", "blueprint"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    if (data.blueprint) {
      data.blueprint = data.blueprint.map((bp: any, idx: number) => ({ ...bp, no: idx + 1 }));
    }
    return {
      ...data,
      metadata: config
    };
  } catch (error) {
    console.error("JSON Parse Error:", error);
    throw new Error("Gagal memproses respons AI.");
  }
};

export const generateImageForQuestion = async (prompt: string): Promise<string | null> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `High quality academic illustration, clean educational diagram, white background style: ${prompt}` }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
    return null;
  } catch { return null; }
};
