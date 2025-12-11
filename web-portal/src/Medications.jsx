import React, { useState } from 'react';
import MedicationCatalogEntry from './components/MedicationCatalogEntry';

export default function Medications({ user }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '32px', fontWeight: '700', color: '#333' }}>
          Manajemen Obat Pasien
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666', fontSize: '14px' }}>
          Kelola katalog obat stroke dan berikan resep kepada pasien Anda
        </p>
      </div>

      {user?.role === 'doctor' ? (
        <MedicationCatalogEntry 
          user={user}
          onSuccess={() => setRefreshTrigger(prev => prev + 1)}
        />
      ) : (
        <div style={{
          padding: '24px',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          color: '#856404',
          textAlign: 'center'
        }}>
          <p>Hanya dokter yang dapat mengelola katalog obat</p>
        </div>
      )}
    </div>
  );
}
