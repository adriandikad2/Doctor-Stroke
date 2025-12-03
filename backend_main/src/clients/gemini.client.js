const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!GEMINI_API_KEY) {
  console.warn('[Gemini] GEMINI_API_KEY belum disetel. Ringkasan AI akan gagal sampai kunci tersedia.');
}

/**
 * Meminta ringkasan ke Gemini.
 * @param {string} prompt - Instruksi sistem/petunjuk gaya.
 * @param {object} payload - Data konteks pasien yang akan diringkas.
 * @returns {Promise<string>} - Teks ringkasan.
 */
export async function requestGeminiSummary(prompt, payload = {}) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY tidak ditemukan pada environment backend');
  }

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { text: JSON.stringify(payload).slice(0, 12000) }
        ],
      },
    ],
    generationConfig: {
      temperature: 0.4,
      topK: 32,
      topP: 0.9,
      maxOutputTokens: 512,
    },
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errorPayload = await res.text();
    throw new Error(`Gemini error ${res.status}: ${errorPayload}`);
  }

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .join('\n')
      .trim();

  if (!text) {
    throw new Error('Gemini tidak mengembalikan teks ringkasan');
  }

  return text;
}