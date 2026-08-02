import React from 'react';

export default function Mascot({ emotion = 'happy', message, onClick }) {
  const avatars = {
    happy: '🦉',
    cheer: '🥳',
    thinking: '🧐',
    sad: '😢',
    fire: '🔥'
  };

  return (
    <div className="mascot-container" onClick={onClick}>
      <div className="mascot-avatar-wrapper">
        <div className="mascot-avatar">{avatars[emotion] || '🦉'}</div>
      </div>
      {message && (
        <div className="mascot-speech-bubble">
          <p>{message}</p>
        </div>
      )}

      <style>{`
        .mascot-container {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          cursor: pointer;
        }

        .mascot-avatar-wrapper {
          position: relative;
        }

        .mascot-avatar {
          font-size: 3rem;
          background: linear-gradient(135deg, rgba(88, 204, 2, 0.2) 0%, rgba(28, 176, 246, 0.2) 100%);
          border: 3px solid var(--green-primary);
          border-radius: 50%;
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 0 var(--green-shadow);
          transition: transform 0.2s ease;
        }

        .mascot-container:hover .mascot-avatar {
          transform: scale(1.08) rotate(5deg);
        }

        .mascot-speech-bubble {
          position: relative;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 12px 18px;
          max-width: 320px;
          font-weight: 700;
          font-size: 0.95rem;
          color: var(--text-main);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .mascot-speech-bubble::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 8px solid transparent;
          border-bottom: 8px solid transparent;
          border-right: 10px solid var(--border-color);
        }

        .mascot-speech-bubble::after {
          content: '';
          position: absolute;
          left: -8px;
          top: 50%;
          transform: translateY(-50%);
          width: 0;
          height: 0;
          border-top: 7px solid transparent;
          border-bottom: 7px solid transparent;
          border-right: 9px solid var(--bg-card);
        }
      `}</style>
    </div>
  );
}
