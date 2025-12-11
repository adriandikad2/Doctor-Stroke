import React, { useState, useEffect } from 'react';
import { insightAPI } from '../utils/api';

export default function AIInsightPanel({ selectedPatient }) {
  const [insight, setInsight] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (selectedPatient?.patient_id) {
      fetchInsight(selectedPatient.patient_id);
    }
  }, [selectedPatient]);

  const fetchInsight = async (patientId) => {
    setLoading(true);
    setError('');
    setWarning('');
    try {
      const response = await insightAPI.getPatientSummary(patientId);
      const summaryText = typeof response?.data === 'string'
        ? response.data
        : response?.data?.summary || response?.data?.error || '';

      const isQuota = response?.message?.toLowerCase?.().includes('429') || response?.message?.toLowerCase?.().includes('quota');

      if (isQuota) {
        setWarning('Gemini quota reached, menampilkan data terakhir. Coba lagi dalam beberapa saat.');
      }

      if (summaryText) {
        setInsight(summaryText);
      } else {
        setInsight('');
      }

      if (!response.success && !isQuota) {
        setError(response.message || 'Failed to fetch insights');
      }
    } catch (err) {
      console.error('Error fetching insight:', err);
      setError(err.message || 'Error fetching insights');
      setInsight('');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedPatient?.patient_id) {
      fetchInsight(selectedPatient.patient_id);
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-card)',
      border: '1px solid var(--color-border)',
      borderRadius: '12px',
      padding: '20px',
      marginTop: '24px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>
            Clinical Insights
          </h3>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-muted-2)' }}>
            AI-powered analysis powered by Gemini
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--color-border)',
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1,
            fontSize: '12px',
            fontWeight: '500',
            transition: 'all 0.2s'
          }}
        >
          {loading ? 'Analyzing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          color: '#d32f2f',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '12px'
        }}>
          {error}
        </div>
      )}

      {warning && (
        <div style={{
          backgroundColor: '#fef3c7',
          color: '#b45309',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '13px',
          marginBottom: '12px',
          border: '1px solid #f59e0b33'
        }}>
          {warning}
        </div>
      )}

      {loading && (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          color: 'var(--color-muted-2)'
        }}>
          <div style={{
            display: 'inline-block',
            width: '24px',
            height: '24px',
            border: '2px solid var(--color-border)',
            borderTop: '2px solid var(--blue)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ margin: '12px 0 0 0', fontSize: '12px' }}>Generating insights...</p>
        </div>
      )}

      {!loading && (
        <div style={{
          backgroundColor: 'rgba(131, 133, 204, 0.05)',
          border: '1px solid rgba(131, 133, 204, 0.2)',
          borderRadius: '8px',
          padding: '16px',
          fontSize: '14px',
          lineHeight: '1.6',
          color: 'var(--color-text)',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word'
        }}>
          {insight || 'No insights available. Ensure patient has recent data logged.'}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
