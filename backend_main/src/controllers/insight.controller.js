import { getPatientInsightSummary } from '../services/insight.service.js';

export const handleGetPatientSummary = async (req, res) => {
  try {
    const { patientId } = req.params;
    const summary = await getPatientInsightSummary(patientId, req.user);

    res.status(200).json({
      success: true,
      message: 'Ringkasan AI berhasil dibuat',
      data: summary,
    });
  } catch (error) {
    console.error('[Insight Controller] Error:', error.message);
    
    // Return 500 only for server errors, not for API quota issues
    const statusCode = error.message?.includes('Gemini') ? 200 : 500;
    
    res.status(statusCode).json({
      success: statusCode === 200, // Consider fallback as successful
      message: error.message || 'Gagal membuat ringkasan AI',
      data: error.data || null, // Include fallback data if available
    });
  }
};