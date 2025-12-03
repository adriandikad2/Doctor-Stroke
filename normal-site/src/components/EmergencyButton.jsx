import React, { useState } from 'react';

export default function EmergencyButton() {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmStep, setConfirmStep] = useState(false);

  const handleCallClick = () => {
    setConfirmStep(true);
  };

  const handleConfirmCall = () => {
    // Attempt to initiate phone call
    window.location.href = 'tel:+62112';
    setTimeout(() => {
      setShowDialog(false);
      setConfirmStep(false);
    }, 1000);
  };

  const handleClose = () => {
    setShowDialog(false);
    setConfirmStep(false);
  };

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(220, 38, 38, 0);
          }
        }

        .emergency-button {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 56px;
          height: 56px;
          background: #dc2626;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          z-index: 999;
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          animation: pulse 2s infinite;
          transition: transform 0.2s ease;
        }

        .emergency-button:hover {
          transform: scale(1.1);
        }

        .emergency-button:active {
          transform: scale(0.95);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 24px;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: slideUp 0.3s ease;
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-icon {
          font-size: 48px;
          text-align: center;
          margin-bottom: 16px;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #dc2626;
          text-align: center;
          margin: 0 0 8px 0;
        }

        .modal-subtitle {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin: 0 0 20px 0;
        }

        .phone-number {
          background: #fef2f2;
          border: 2px solid #dc2626;
          border-radius: 8px;
          padding: 16px;
          text-align: center;
          margin-bottom: 24px;
        }

        .phone-number-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .phone-number-text {
          font-size: 28px;
          font-weight: 700;
          color: #dc2626;
        }

        .modal-message {
          font-size: 14px;
          color: #666;
          text-align: center;
          margin-bottom: 24px;
          line-height: 1.6;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .btn-action {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          flex: 1;
        }

        .btn-call {
          background: #dc2626;
          color: white;
        }

        .btn-call:hover {
          background: #b91c1c;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .btn-cancel {
          background: #e5e7eb;
          color: #333;
        }

        .btn-cancel:hover {
          background: #d1d5db;
        }

        @media (max-width: 768px) {
          .emergency-button {
            bottom: 16px;
            right: 16px;
            width: 52px;
            height: 52px;
            font-size: 24px;
          }

          .modal-content {
            width: 95%;
          }
        }
      `}</style>

      {/* Emergency Button */}
      <button 
        className="emergency-button"
        onClick={() => setShowDialog(true)}
        title="Click for emergency assistance"
      >
        🚨
      </button>

      {/* Modal Dialog */}
      {showDialog && (
        <div className="modal-overlay" onClick={handleClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">🚨</div>
            
            {!confirmStep ? (
              <>
                <h2 className="modal-title">Emergency Assistance</h2>
                <p className="modal-subtitle">Need immediate help?</p>
                
                <div className="phone-number">
                  <div className="phone-number-label">Emergency Number</div>
                  <div className="phone-number-text">+62 112</div>
                </div>
                
                <p className="modal-message">
                  Tap "Call Emergency" to dial the emergency hotline. This will connect you to emergency services.
                </p>
                
                <div className="modal-actions">
                  <button 
                    className="btn-action btn-cancel"
                    onClick={handleClose}
                  >
                    Close
                  </button>
                  <button 
                    className="btn-action btn-call"
                    onClick={handleCallClick}
                  >
                    📞 Call Emergency
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="modal-title">Confirm Call</h2>
                <p className="modal-subtitle">Ready to place call?</p>
                
                <p className="modal-message">
                  <strong>Emergency Service: +62 112</strong>
                  <br />
                  <br />
                  Please confirm to proceed with calling the emergency hotline. This action may open your phone's dialer.
                </p>
                
                <div className="modal-actions">
                  <button 
                    className="btn-action btn-cancel"
                    onClick={() => setConfirmStep(false)}
                  >
                    Back
                  </button>
                  <button 
                    className="btn-action btn-call"
                    onClick={handleConfirmCall}
                  >
                    ✓ Confirm Call
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
