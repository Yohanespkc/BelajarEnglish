import React from 'react';
import { HelpCircle, X, CheckCircle, Sparkles } from 'lucide-react';
import { soundService } from '../services/soundService';

export default function ExplanationModal({ question, userAnswer, onClose }) {
  if (!question) return null;

  return (
    <div className="modal-backdrop">
      <div className="explanation-card glass-card">
        <button onClick={onClose} className="close-btn">
          <X size={20} color="#9ca3af" />
        </button>

        <div className="explanation-header">
          <div className="sparkle-badge">
            <Sparkles size={20} color="#ce82ff" />
            <span>AI Grammar Analysis</span>
          </div>
          <h3>Mengapa Jawabanmu Perlu Diperbaiki?</h3>
        </div>

        <div className="comparison-box">
          <div className="comp-item user">
            <span className="label">Jawaban Kamu:</span>
            <p className="val">{Array.isArray(userAnswer) ? userAnswer.join(' ') : (userAnswer || '(Kosong)')}</p>
          </div>
          <div className="comp-item correct">
            <span className="label">Jawaban Tepat:</span>
            <p className="val">{question.correctAnswer || (question.correctOrder ? question.correctOrder.join(' ') : question.targetText)}</p>
          </div>
        </div>

        <div className="ai-explanation-body">
          <h4>💡 Penjelasan AI Master:</h4>
          <p>{question.explanation || "Dalam tata bahasa Inggris, struktur dan pemilihan kata disesuaikan dengan konteks konteks subjek dan tenses yang digunakan."}</p>
        </div>

        <button onClick={onClose} className="btn-3d btn-purple">
          Paham, Lanjutkan!
        </button>
      </div>

      <style>{`
        .modal-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          padding: 20px;
        }

        .explanation-card {
          position: relative;
          max-width: 480px;
          width: 100%;
          border-color: var(--purple-primary);
          animation: popUp 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes popUp {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }

        .close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .sparkle-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(206, 130, 255, 0.15);
          color: var(--purple-primary);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .explanation-header h3 {
          font-size: 1.2rem;
          font-weight: 900;
          margin-bottom: 16px;
        }

        .comparison-box {
          display: flex;
          flex-direction: column;
          gap: 10px;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: var(--radius-md);
          margin-bottom: 16px;
        }

        .comp-item .label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-sub);
        }

        .comp-item.user .val {
          color: var(--red-primary);
          font-weight: 700;
        }

        .comp-item.correct .val {
          color: var(--green-primary);
          font-weight: 800;
        }

        .ai-explanation-body {
          background: rgba(206, 130, 255, 0.08);
          border-left: 4px solid var(--purple-primary);
          padding: 12px 14px;
          border-radius: 0 var(--radius-md) var(--radius-md) 0;
          margin-bottom: 24px;
        }

        .ai-explanation-body h4 {
          font-size: 0.9rem;
          font-weight: 800;
          color: var(--purple-primary);
          margin-bottom: 4px;
        }

        .ai-explanation-body p {
          font-size: 0.9rem;
          line-height: 1.4;
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
