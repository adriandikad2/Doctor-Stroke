const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

if (!GEMINI_API_KEY) {
  console.warn('[Gemini] GEMINI_API_KEY belum disetel. Ringkasan AI akan gagal sampai kunci tersedia.');
}

/**
 * Generate fallback summary when Gemini API is unavailable
 */
function generateFallbackSummary(payload = {}) {
  const { patient = {}, latestMeals = [], medicationAdherence = [], upcomingAppointments = [] } = payload;
  
  let summary = `📋 Ringkasan Kesehatan ${patient.name || 'Pasien'}\n\n`;
  
  // Diet Summary
  if (latestMeals.length > 0) {
    summary += `🥗 Nutrisi: Pasien telah mencatat ${latestMeals.length} asupan makanan terakhir. Pastikan asupan kalori dan natrium sesuai target harian.\n\n`;
  } else {
    summary += `🥗 Nutrisi: Belum ada pencatatan makanan. Dimohon keluarga mulai mencatat asupan harian.\n\n`;
  }
  
  // Medication Adherence Summary
  if (medicationAdherence.length > 0) {
    const taken = medicationAdherence.filter(a => a.status === 'taken').length;
    const adherenceRate = Math.round((taken / medicationAdherence.length) * 100);
    summary += `💊 Kepatuhan Obat: ${adherenceRate}% obat diminum sesuai jadwal dari ${medicationAdherence.length} pencatatan terakhir. ${adherenceRate >= 80 ? '✓ Sangat baik!' : 'Tingkatkan kepatuhan minum obat.'}\n\n`;
  } else {
    summary += `💊 Kepatuhan Obat: Belum ada pencatatan. Dimohon keluarga mencatat setiap minum obat.\n\n`;
  }
  
  // Appointments Summary
  if (upcomingAppointments.length > 0) {
    summary += `📅 Jadwal: Ada ${upcomingAppointments.length} janji temu mendatang. Pastikan pasien tidak melewatkan.\n\n`;
  } else {
    summary += `📅 Jadwal: Tidak ada janji temu mendatang. Konsultasikan dengan tim medis jika diperlukan.\n\n`;
  }
  
  summary += `⚠️ Catatan: Ringkasan ini dihasilkan dari data yang tersedia. Jika butuh analisis lebih mendalam, hubungi tim medis.`;
  
  return summary;
}

/**
 * Meminta ringkasan ke Gemini dengan fallback otomatis.
 * @param {string} prompt - Instruksi sistem/petunjuk gaya.
 * @param {object} payload - Data konteks pasien yang akan diringkas.
 * @returns {Promise<string>} - Teks ringkasan.
 */
export async function requestGeminiSummary(prompt, payload = {}) {
  if (!GEMINI_API_KEY) {
    console.warn('[Gemini] API key tidak tersedia, menggunakan fallback summary');
    return generateFallbackSummary(payload);
  }

  try {
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
      const errorData = await res.json().catch(() => null);
      const errorMessage = errorData?.error?.message || `HTTP ${res.status}`;
      
      // Handle quota/rate limit errors
      if (res.status === 429 || (errorData?.error?.code === 429)) {
        console.warn('[Gemini] API quota exceeded, using fallback summary');
        return generateFallbackSummary(payload);
      }
      
      console.error('[Gemini] API Error:', errorMessage);
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .join('\n')
        .trim();

    if (!text) {
      console.warn('[Gemini] No text returned, using fallback summary');
      return generateFallbackSummary(payload);
    }

    return text;
  } catch (error) {
    console.error('[Gemini] Error occurred:', error.message);
    console.warn('[Gemini] Falling back to generated summary');
    return generateFallbackSummary(payload);
  }
}