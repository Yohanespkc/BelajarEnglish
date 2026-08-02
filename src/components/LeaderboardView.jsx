import React from 'react';
import { Trophy, Shield, ArrowUp, ArrowDown } from 'lucide-react';

export default function LeaderboardView({ userState }) {
  const leaderboardUsers = [
    { rank: 1, name: "Siti Rahma", xp: 420, avatar: "👩‍🦰", league: "Bronze" },
    { rank: 2, name: "Budi Santoso", xp: 380, avatar: "👨‍💻", league: "Bronze" },
    { rank: 3, name: "Dewi Lestari", xp: 290, avatar: "👩‍🎨", league: "Bronze" },
    { rank: 4, name: userState.name + " (Anda)", xp: userState.xp, avatar: userState.avatar || "🦉", league: "Bronze", isUser: true },
    { rank: 5, name: "Andi Wijaya", xp: 110, avatar: "👨‍🚀", league: "Bronze" },
    { rank: 6, name: "Rina Kusuma", xp: 85, avatar: "👩‍🔬", league: "Bronze" }
  ];

  return (
    <div className="leaderboard-container">
      <div className="league-banner glass-card">
        <div className="league-trophy">🏆</div>
        <div className="league-info">
          <h2>Liga Perunggu (Bronze League)</h2>
          <p>Top 3 pembelajar di akhir minggu akan naik ke Liga Perak (Silver)!</p>
        </div>
      </div>

      <div className="leaderboard-list glass-card">
        {leaderboardUsers.map((u) => (
          <div key={u.rank} className={`rank-row ${u.isUser ? 'user-highlight' : ''}`}>
            <span className={`rank-num rank-${u.rank}`}>{u.rank}</span>
            <span className="rank-avatar">{u.avatar}</span>
            <span className="rank-name">{u.name}</span>
            <span className="rank-xp">{u.xp} XP</span>
          </div>
        ))}
      </div>

      <style>{`
        .leaderboard-container {
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .league-banner {
          display: flex;
          align-items: center;
          gap: 20px;
          background: linear-gradient(135deg, rgba(255, 150, 0, 0.15) 0%, rgba(255, 200, 0, 0.15) 100%);
          border-color: var(--yellow-primary);
        }

        .league-trophy {
          font-size: 3.5rem;
        }

        .league-info h2 {
          font-size: 1.3rem;
          font-weight: 900;
          color: var(--yellow-primary);
          margin-bottom: 4px;
        }

        .league-info p {
          font-size: 0.85rem;
          color: var(--text-sub);
          font-weight: 700;
        }

        .leaderboard-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          padding: 12px;
        }

        .rank-row {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          font-weight: 800;
        }

        .rank-row.user-highlight {
          background: rgba(88, 204, 2, 0.15);
          border: 2px solid var(--green-primary);
        }

        .rank-num {
          font-size: 1.1rem;
          width: 24px;
          text-align: center;
        }

        .rank-num.rank-1 { color: #ffc800; }
        .rank-num.rank-2 { color: #9ca3af; }
        .rank-num.rank-3 { color: #cd7f32; }

        .rank-avatar { font-size: 1.5rem; }

        .rank-name {
          flex: 1;
          font-size: 0.95rem;
        }

        .rank-xp {
          color: var(--yellow-primary);
          font-size: 0.95rem;
        }
      `}</style>
    </div>
  );
}
