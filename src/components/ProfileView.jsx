import React from 'react';
import { ACHIEVEMENTS } from '../data/achievementsData';
import { Trophy, Award, Flame, Gem, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';
import { soundService } from '../services/soundService';

export default function ProfileView({ userState, onResetProgress }) {
  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-card glass-card">
        <div className="avatar-big">{userState.avatar || '🦉'}</div>
        <div className="profile-details">
          <h2>{userState.name}</h2>
          <span className="joined-tag">Pembelajar Setia LingoMaster</span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-grid">
        <div className="stat-card glass-card">
          <span className="stat-icon">🔥</span>
          <div className="stat-meta">
            <h3>{userState.streak} Hari</h3>
            <p>Daily Streak</p>
          </div>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-icon">⚡</span>
          <div className="stat-meta">
            <h3>{userState.xp} XP</h3>
            <p>Total Pengalaman</p>
          </div>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-icon">💎</span>
          <div className="stat-meta">
            <h3>{userState.gems}</h3>
            <p>Permata (Gems)</p>
          </div>
        </div>
        <div className="stat-card glass-card">
          <span className="stat-icon">🏆</span>
          <div className="stat-meta">
            <h3>{userState.activeLeague}</h3>
            <p>Liga Mingguan</p>
          </div>
        </div>
      </div>

      {/* Badges / Achievements Collection */}
      <div className="section-block">
        <h3 className="section-title">Lencana & Pencapaian</h3>
        <div className="badges-grid">
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = userState.unlockedBadges.includes(badge.id);
            return (
              <div key={badge.id} className={`badge-card glass-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <span className="badge-icon">{isUnlocked ? badge.unlockedIcon : '🔒'}</span>
                <h4>{badge.title}</h4>
                <p>{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mistake Vault */}
      {userState.mistakeVault && userState.mistakeVault.length > 0 && (
        <div className="section-block">
          <h3 className="section-title">Bank Perbaikan (Mistake Vault)</h3>
          <div className="mistakes-list">
            {userState.mistakeVault.map((m) => (
              <div key={m.id} className="mistake-card glass-card">
                <h4>{m.question}</h4>
                <p className="wrong-ans">❌ Jawabanmu: {m.userAnswer}</p>
                <p className="correct-ans">✅ Jawaban benar: {m.correctAnswer}</p>
                <p className="exp-hint">💡 {m.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Progress Danger Zone */}
      <div className="danger-zone">
        <button
          onClick={() => {
            soundService.playClick();
            if (window.confirm("Apakah Anda yakin ingin mengulang seluruh progres dari 0?")) {
              onResetProgress();
            }
          }}
          className="btn-3d btn-secondary reset-btn"
        >
          <RotateCcw size={18} /> Reset Ulang Seluruh Progres
        </button>
      </div>

      <style>{`
        .profile-container {
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .profile-card {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .avatar-big {
          font-size: 3.5rem;
          background: rgba(88, 204, 2, 0.15);
          border: 3px solid var(--green-primary);
          width: 90px;
          height: 90px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-details h2 {
          font-size: 1.6rem;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .joined-tag {
          color: var(--text-sub);
          font-weight: 700;
          font-size: 0.9rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 14px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
        }

        .stat-icon {
          font-size: 1.8rem;
        }

        .stat-meta h3 {
          font-size: 1.1rem;
          font-weight: 900;
        }

        .stat-meta p {
          font-size: 0.75rem;
          color: var(--text-sub);
          font-weight: 700;
        }

        .section-block {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .section-title {
          font-size: 1.2rem;
          font-weight: 900;
        }

        .badges-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .badge-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          padding: 16px;
        }

        .badge-card.locked {
          opacity: 0.4;
          filter: grayscale(1);
        }

        .badge-icon {
          font-size: 2.2rem;
        }

        .badge-card h4 {
          font-size: 0.95rem;
          font-weight: 800;
        }

        .badge-card p {
          font-size: 0.75rem;
          color: var(--text-sub);
        }

        .mistakes-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mistake-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .mistake-card h4 {
          font-size: 0.95rem;
          font-weight: 800;
        }

        .wrong-ans {
          color: var(--red-primary);
          font-size: 0.85rem;
          font-weight: 700;
        }

        .correct-ans {
          color: var(--green-primary);
          font-size: 0.85rem;
          font-weight: 800;
        }

        .exp-hint {
          font-size: 0.8rem;
          color: var(--text-sub);
        }

        .danger-zone {
          margin-top: 10px;
        }

        .reset-btn {
          color: var(--red-primary);
          border-color: var(--red-primary);
        }
      `}</style>
    </div>
  );
}
