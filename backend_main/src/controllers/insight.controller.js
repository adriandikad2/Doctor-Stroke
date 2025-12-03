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
    res.status(400).json({
      success: false,
      message: error.message || 'Gagal membuat ringkasan AI',
    });
  }
};