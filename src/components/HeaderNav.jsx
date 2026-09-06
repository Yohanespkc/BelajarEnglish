import React, { useState, useEffect } from 'react';
import { Flame, Gem, Heart, Sun, Moon, Sparkles, Settings } from 'lucide-react';
import { soundService } from '../services/soundService';
import { aiProviderService, PROVIDER_METADATA } from '../services/aiProviderService';
import AISettingsModal from './AISettingsModal';

export default function HeaderNav({ userState, theme, toggleTheme }) {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => aiProviderService.getConfig());

  useEffect(() => {
    const handleConfigUpdate = (e) => {
      if (e.detail) {
        setAiConfig(e.detail);
      }
    };
    window.addEventListener('belajarenglish_ai_config_updated', handleConfigUpdate);
    return () => window.removeEventListener('belajarenglish_ai_config_updated', handleConfigUpdate);
  }, []);

  const activeProviderName = PROVIDER_METADATA[aiConfig.provider]?.name || 'AI Engine';

  return (
    <>
      <header className="top-header">
        <div className="user-profile-summary">
          <div className="avatar-chip">{userState.avatar || '🦉'}</div>
          <div className="xp-badge">
            <span className="xp-level">LVL {Math.floor(userState.xp / 100) + 1}</span>
            <span className="xp-val">{userState.xp} XP</span>
          </div>
        </div>

        <div className="stats-row">
          {/* AI Provider Status & Settings Quick Switcher */}
          <button 
            className="ai-header-btn" 
            onClick={() => {
              soundService.playClick();
              setIsAiModalOpen(true);
            }}
            title="Buka Pengaturan AI (Groq Cloud / Gemini / Ollama)"
          >
            <Sparkles size={14} className="sparkle-icon" />
            <span className="ai-btn-text">{activeProviderName}</span>
            <Settings size={13} className="gear-icon" />
          </button>

          {/* Streak Counter */}
          <div className="stat-chip streak" title="Hari Streak Berturut-turut">
            <span className="flame-icon">🔥</span>
            <span className="stat-val">{userState.streak}</span>
          </div>

          {/* Gems Counter */}
          <div className="stat-chip gems" title="Permata">
            <Gem size={20} color="#1cb0f6" fill="#1cb0f6" />
            <span className="stat-val">{userState.gems}</span>
          </div>

          {/* Hearts Counter */}
          <div className="stat-chip hearts" title="Nyawa">
            <Heart size={20} color="#ff4b4b" fill="#ff4b4b" />
            <span className="stat-val">{userState.hearts}/{userState.maxHearts}</span>
          </div>

          {/* Theme Switcher */}
          <button onClick={toggleTheme} className="theme-toggle-btn" title="Ganti Tema">
            {theme === 'dark' ? <Sun size={18} color="#ffc800" /> : <Moon size={18} color="#1cb0f6" />}
          </button>
        </div>

        <AISettingsModal 
          isOpen={isAiModalOpen} 
          onClose={() => setIsAiModalOpen(false)} 
        />

      <style>{`
        .top-header {
          position: sticky;
          top: 0;
          z-index: 90;
          background: rgba(21, 22, 34, 0.85);
          backdrop-filter: blur(14px);
          border-bottom: 1px solid var(--border-color);
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }

        body.light-theme .top-header {
          background: rgba(248, 249, 253, 0.85);
        }

        .user-profile-summary {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .avatar-chip {
          font-size: 1.5rem;
          background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.15));
          border: 1px solid rgba(139, 92, 246, 0.4);
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 10px rgba(139, 92, 246, 0.2);
        }

        .xp-badge {
          display: flex;
          flex-direction: column;
        }

        .xp-level {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--yellow-primary);
        }

        .xp-val {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-main);
        }

        .stats-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .stat-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          font-weight: 700;
          font-size: 0.88rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }

        .stat-chip.streak {
          border-color: rgba(249, 115, 22, 0.4);
          color: var(--orange-primary);
        }

        .stat-chip.gems {
          border-color: rgba(99, 102, 241, 0.4);
          color: var(--accent-iris);
        }

        .stat-chip.hearts {
          border-color: rgba(244, 63, 94, 0.4);
          color: var(--red-primary);
        }

        .ai-header-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.3);
          border-radius: 20px;
          padding: 6px 12px;
          color: #00e5ff;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 229, 255, 0.1);
        }

        .ai-header-btn:hover {
          background: rgba(0, 229, 255, 0.2);
          border-color: #00e5ff;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 229, 255, 0.25);
        }

        .ai-btn-text {
          color: var(--text-main);
          font-weight: 800;
        }

        .gear-icon {
          color: var(--text-sub);
          transition: transform 0.3s ease;
        }

        .ai-header-btn:hover .gear-icon {
          transform: rotate(60deg);
          color: #00e5ff;
        }

        .theme-toggle-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 8px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .theme-toggle-btn:hover {
          border-color: var(--primary-bloom);
          transform: scale(1.08);
        }
      `}</style>
    </header>
    </>
  );
}
