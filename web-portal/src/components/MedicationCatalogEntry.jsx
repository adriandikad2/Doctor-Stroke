import React, { useState, useEffect } from 'react';
import { medicationCatalogAPI, patientAPI } from '../utils/api';

const IMAGE_FALLBACKS = {
  aspirin: 'https://res-5.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1698985153_telmi_80_novell.jpg',
  clopidogrel: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1701364062_clopi_novel-removebg-preview.jpg',
  atorvastatin: 'https://res-2.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1660815609_5fb3862b41ab59059e869bec.jpg',
  simvastatin: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1708500730_simvas_20-removebg-preview.jpg',
  captopril: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1708928069_captopril_12%2C5_mg.jpg',
  amlodipine: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1639231650_amlodipine_5_mg_10_tablet.jpg',
  bisoprolol: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1698716634_bisoprolol_5_dexa-removebg-preview.jpg',
  rivaroxaban: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1659764193_xarelto_10_mg_10_tablet.jpg',
  folic: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1661158315_62a190f1f15ee840f565ff70.jpg',
  vitamin: 'https://res-2.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1659935251_61d696c5e139ec066bb26e47.jpg',
  cilostazol: 'https://res-4.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1660986764_61b322f50e51d9066d3769ff.jpg',
  lisinopril: 'https://res-4.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1685949223_lisinopril.jpg',
  losartan: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1698995454_losartan_hj-removebg-preview.jpg',
  piracetam: 'https://res-1.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1660978863_61fa5c8dd52ed0392152ed8d.jpg',
  citicoline: 'https://res-4.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1710318093_citicoline_dexa_500mg_kaplet-removebg-preview.jpg',
  gabapentin: 'https://res-2.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1659945331_5fb3786b41ab59059e867b85.jpg',
  omeprazole: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1706493511_ome_20_dexa-removebg-preview.jpg',
  paracetamol: 'https://res-3.cloudinary.com/dk0z4ums3/image/upload/c_scale,h_500,w_500/v1/production/pharmacy/products/1687334265_paracet_fm.jpg',
};

const resolveMedImage = (med) => {
  if (med?.image_url) return med.image_url;
  const key = (med?.medication_name || '').toLowerCase();
  return (
    IMAGE_FALLBACKS[key] ||
    Object.entries(IMAGE_FALLBACKS).find(([name]) => key.includes(name))?.[1] ||
    'https://via.placeholder.com/300x200?text=Medication'
  );
};

export default function MedicationCatalogEntry({ user, onSuccess }) {
  const [medications, setMedications] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedMed, setSelectedMed] = useState(null); // For modal/detail view
  const [patientMeds, setPatientMeds] = useState([]);

  useEffect(() => {
    if (user?.role === 'doctor') {
      fetchMedications();
      fetchPatients();
    }
  }, [user]);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientMedications(selectedPatient);
    }
  }, [selectedPatient]);

  const fetchMedications = async () => {
    try {
      const response = await medicationCatalogAPI.getCatalog();
      if (response.success) {
        setMedications(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching medications:', err);
      setMedications([]);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await patientAPI.getMyPatients();
      if (response.success) {
        setPatients(Array.isArray(response.data) ? response.data : []);
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
      setPatients([]);
    }
  };

  const fetchPatientMedications = async (patientId) => {
    try {
      const response = await medicationCatalogAPI.getPatientMedications(patientId);
      if (response.success) {
        setPatientMeds(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching patient medications:', err);
    }
  };

  const handleAssignMedication = async (catalogId) => {
    if (!selectedPatient) {
      setError('Pilih pasien terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await medicationCatalogAPI.assignToPatient(catalogId, selectedPatient);
      if (response.success) {
        setMessage('Obat berhasil ditambahkan');
        fetchPatientMedications(selectedPatient);
        setSelectedMed(null);
        if (onSuccess) onSuccess();
      } else {
        setError(response.message || 'Gagal menambahkan obat');
      }
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '24px', fontWeight: '700' }}>
        Katalog Obat Stroke
      </h2>

      {error && (
        <div style={{
          color: '#d32f2f',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {message && (
        <div style={{
          color: '#388e3c',
          backgroundColor: 'rgba(56, 142, 60, 0.1)',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '16px',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      {/* Patient Selector */}
      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px', fontSize: '14px' }}>
          Pilih Pasien
        </label>
        <select
          value={selectedPatient}
          onChange={(e) => setSelectedPatient(e.target.value)}
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '10px 12px',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        >
          <option value="">-- Pilih Pasien --</option>
          {patients.map((p) => (
            <option key={p.patient_id} value={p.patient_id}>
              {p.name || p.patient_name || 'Unknown'}
            </option>
          ))}
        </select>
      </div>

      {/* Medication Grid - Halodoc Style */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '16px'
        }}>
          {medications.map((med) => (
            <div
              key={med.catalog_id || med.medication_id}
              onClick={() => setSelectedMed(med)}
              style={{
                border: '1px solid #e0e0e0',
                borderRadius: '12px',
                overflow: 'hidden',
                backgroundColor: '#fff',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                display: 'flex',
                flexDirection: 'column'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Medicine Image */}
              <div style={{
                width: '100%',
                height: '160px',
                backgroundColor: '#f5f5f5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}>
                <img
                  src={resolveMedImage(med)}
                  alt={med.medication_name}
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = resolveMedImage({ medication_name: med.medication_name });
                    e.target.style.objectFit = 'contain';
                    e.target.style.backgroundColor = '#f0f0f0';
                  }}
                />
              </div>

              {/* Medicine Info */}
              <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  {med.medication_name}
                </h4>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#666', lineHeight: '1.4' }}>
                  {med.product_category}
                </p>
                <p style={{ margin: '0', fontSize: '11px', color: '#999' }}>
                  {med.manufacturer}
                </p>
                
                {selectedPatient && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignMedication(med.catalog_id || med.medication_id);
                    }}
                    disabled={loading}
                    style={{
                      marginTop: 'auto',
                      padding: '8px 12px',
                      backgroundColor: '#44a1d1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1
                    }}
                  >
                    {loading ? 'Menambah...' : 'Tambah'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedMed && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
              {/* Medicine Image in Modal */}
              <div style={{
                width: '200px',
                height: '200px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0
              }}>
                <img
                  src={resolveMedImage(selectedMed)}
                  alt={selectedMed.medication_name}
                  crossOrigin="anonymous"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = resolveMedImage(selectedMed);
                    e.target.style.objectFit = 'contain';
                  }}
                />
              </div>

              {/* Medicine Details */}
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', fontWeight: '700', color: '#333' }}>
                  {selectedMed.medication_name}
                </h2>
                
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Dosis Standar
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                    {selectedMed.dosage_standard}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Golongan Produk
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                    {selectedMed.product_category}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Manufaktur
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                    {selectedMed.manufacturer}
                  </p>
                </div>

                <div>
                  <h4 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                    Nomor Registrasi
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                    {selectedMed.registration_no}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                Deskripsi
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                {selectedMed.description}
              </p>
            </div>

            {/* Side Effects */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                Efek Samping
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                {selectedMed.side_effects}
              </p>
            </div>

            {/* Contraindications */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '600', color: '#666', textTransform: 'uppercase' }}>
                Kontraindikasi
              </h4>
              <p style={{ margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.6' }}>
                {selectedMed.contraindications}
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              {selectedPatient && (
              <button
                onClick={() => {
                  handleAssignMedication(selectedMed.catalog_id || selectedMed.medication_id);
                }}
                disabled={loading}
                  style={{
                    flex: 1,
                    padding: '12px',
                    backgroundColor: '#44a1d1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? 'Menambah ke Pasien...' : 'Tambah ke Pasien'}
                </button>
              )}
              <button
                onClick={() => setSelectedMed(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: '#f0f0f0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Patient Medications Section */}
      {selectedPatient && patientMeds.length > 0 && (
        <div style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #e0e0e0' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '700' }}>
            Obat untuk Pasien ({patientMeds.length})
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px'
          }}>
            {patientMeds.map((med) => (
              <div
                key={med.medication?.catalog_id || med.catalog_id || med.medication_id}
                style={{
                  padding: '12px',
                  backgroundColor: '#f0f8f0',
                  border: '1px solid #44a1d1',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '4px', color: '#333' }}>
                  {med.medication_name}
                </div>
                <div style={{ color: '#666', marginBottom: '4px' }}>
                  Dosis: {med.dosage_standard}
                </div>
                <div style={{ color: '#44a1d1', fontWeight: '500' }}>
                  Sudah ditambahkan
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
