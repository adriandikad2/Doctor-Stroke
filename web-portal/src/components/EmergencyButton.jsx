import React, { useState } from 'react';

export default function EmergencyButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [calling, setCalling] = useState(false);

  const EMERGENCY_NUMBER = '+62 112'; // Indonesia Emergency Number
  const EMERGENCY_NUMBER_DIAL = 'tel:+62112';

  const handleEmergencyClick = () => {
    setShowDialog(true);
  };

  const handleConfirmCall = () => {
    setCalling(true);
    setShowConfirm(false);

    // Simulate calling process
    setTimeout(() => {
      // Attempt to initiate call
      if (typeof window !== 'undefined') {
        // Try to open phone dialer
        window.location.href = EMERGENCY_NUMBER_DIAL;
      }
      setCalling(false);
      setShowDialog(false);
    }, 1500);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setShowConfirm(false);
    setCalling(false);
  };

  return (
    <>
      {/* Emergency Button (Red, Floating) */}
      <button
        onClick={handleEmergencyClick}
        className="emergency-button"
        title="Click for emergency help"
        aria-label="Emergency assistance button"
      >
        <span className="emergency-icon">🚨</span>
      </button>

      {/* Styling */}
      <style>{`
        .emergency-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #FF6B6B, #E63946);
          border: none;
          color: white;
          font-size: 28px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(230, 57, 70, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          z-index: 999;
          animation: pulse-emergency 2s infinite;
        }

        .emergency-button:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 32px rgba(230, 57, 70, 0.6);
        }

        .emergency-button:active {
          transform: scale(0.95);
        }

        .emergency-icon {
          animation: shake 0.5s infinite;
        }

        @keyframes pulse-emergency {
          0%, 100% {
            box-shadow: 0 8px 24px rgba(230, 57, 70, 0.4);
          }
          50% {
            box-shadow: 0 8px 40px rgba(230, 57, 70, 0.7);
          }
        }

        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }

        /* Modal Overlay */
        .emergency-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease-out;
        }

        /* Modal Content */
        .emergency-modal {
          background: white;
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease-out;
          text-align: center;
        }

        .emergency-modal-icon {
          font-size: 48px;
          margin-bottom: 16px;
          animation: bounce 0.6s ease-out infinite;
        }

        .emergency-modal h2 {
          margin: 0 0 12px 0;
          color: #E63946;
          font-size: 24px;
          font-weight: 700;
        }

        .emergency-modal p {
          margin: 0 0 8px 0;
          color: #555;
          font-size: 14px;
          line-height: 1.6;
        }

        .emergency-modal .phone-number {
          margin: 20px 0;
          padding: 16px;
          background: #FFE5E5;
          border-radius: 8px;
          font-size: 24px;
          font-weight: 700;
          color: #E63946;
          letter-spacing: 2px;
          font-family: 'Monaco', 'Courier New', monospace;
        }

        .emergency-modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .emergency-modal-actions button {
          flex: 1;
          padding: 12px 16px;
          border: none;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-call {
          background: #E63946;
          color: white;
        }

        .btn-call:hover {
          background: #D62828;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(230, 57, 70, 0.4);
        }

        .btn-call:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .btn-cancel {
          background: #E8E8E8;
          color: #333;
        }

        .btn-cancel:hover {
          background: #D8D8D8;
          transform: translateY(-2px);
        }

        .btn-cancel:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .calling-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #E63946;
          font-weight: 600;
        }

        .calling-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid #E63946;
          border-top-color: transparent;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Confirmation Dialog */
        .emergency-confirm {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 350px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.4s ease-out;
          text-align: center;
        }

        .emergency-confirm h3 {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 18px;
          font-weight: 600;
        }

        .emergency-confirm p {
          margin: 0 0 20px 0;
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }

        .emergency-confirm-actions {
          display: flex;
          gap: 8px;
        }

        .emergency-confirm-actions button {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-confirm {
          background: #E63946;
          color: white;
        }

        .btn-confirm:hover {
          background: #D62828;
          transform: translateY(-1px);
        }

        .btn-back {
          background: #E8E8E8;
          color: #333;
        }

        .btn-back:hover {
          background: #D8D8D8;
          transform: translateY(-1px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .emergency-button {
            bottom: 16px;
            right: 16px;
            width: 48px;
            height: 48px;
            font-size: 24px;
          }

          .emergency-modal {
            padding: 24px;
          }

          .emergency-modal h2 {
            font-size: 20px;
          }

          .emergency-modal .phone-number {
            font-size: 20px;
          }
        }
      `}</style>

      {/* Modal Portal */}
      {showDialog && (
        <div className="emergency-modal-overlay" onClick={handleCancel}>
          <div className="emergency-modal" onClick={(e) => e.stopPropagation()}>
            <div className="emergency-modal-icon">🚨</div>
            <h2>Emergency Assistance</h2>
            <p>Contact emergency services immediately</p>

            {!showConfirm ? (
              <>
                <div className="phone-number">{EMERGENCY_NUMBER}</div>
                <p style={{ fontSize: '12px', color: '#999', marginBottom: '24px' }}>
                  Indonesia Emergency Call Center
                </p>
                <div className="emergency-modal-actions">
                  <button
                    className="btn-call"
                    onClick={() => setShowConfirm(true)}
                    disabled={calling}
                  >
                    {calling ? (
                      <div className="calling-status">
                        <div className="calling-spinner"></div>
                        Calling...
                      </div>
                    ) : (
                      '📞 Call Emergency'
                    )}
                  </button>
                  <button
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={calling}
                  >
                    Close
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: '20px', color: '#E63946' }}>
                  <p style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 8px 0' }}>
                    Confirm Call?
                  </p>
                  <p style={{ fontSize: '13px', color: '#666' }}>
                    You are about to call {EMERGENCY_NUMBER}
                  </p>
                </div>
                <div className="emergency-confirm-actions">
                  <button
                    className="btn-confirm"
                    onClick={handleConfirmCall}
                    disabled={calling}
                  >
                    {calling ? 'Calling...' : 'Yes, Call'}
                  </button>
                  <button
                    className="btn-back"
                    onClick={() => setShowConfirm(false)}
                    disabled={calling}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
