import React, { useState, useEffect } from 'react';
import { Zap, Timer, Award, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '../services/soundService';

export default function MatchMadnessView({ userState, onAddXp, onAddGems }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState(null);
  const [matchedIds, setMatchedIds] = useState([]);

  const pairs = [
    { id: 1, english: "Coffee", indonesian: "Kopi" },
    { id: 2, english: "Water", indonesian: "Air" },
    { id: 3, english: "Hotel", indonesian: "Hotel" },
    { id: 4, english: "Passport", indonesian: "Paspor" },
    { id: 5, english: "Airport", indonesian: "Bandara" },
    { id: 6, english: "Friend", indonesian: "Teman" },
    { id: 7, english: "Breakfast", indonesian: "Sarapan" },
    { id: 8, english: "Delicious", indonesian: "Lezat" }
  ];

  useEffect(() => {
    let timer = null;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((t) => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      soundService.playLevelUp();
      confetti({ particleCount: 80, spread: 60 });
      onAddXp(score * 5);
      onAddGems(score * 2);
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score]);

  const handleStartGame = () => {
    soundService.playClick();
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setMatchedIds([]);
    setSelectedLeft(null);
  };

  const handleMatchClick = (pair, side) => {
    if (!isPlaying) return;

    if (side === 'left') {
      soundService.playClick();
      setSelectedLeft(pair.id);
    } else if (side === 'right') {
      if (selectedLeft === pair.id) {
        soundService.playCorrect();
        setMatchedIds((prev) => [...prev, pair.id]);
        setScore((s) => s + 1);
        setSelectedLeft(null);
      } else {
        soundService.playWrong();
      }
    }
  };

  return (
    <div className="madness-container">
      <div className="madness-header">
        <div className="title-chip">
          <Zap size={24} color="#ffc800" fill="#ffc800" />
          <h2>Match Madness Game</h2>
        </div>
        <p>Cocokkan sebanyak mungkin pasangan kata sebelum waktu 60 detik habis!</p>
      </div>

      {!isPlaying ? (
        <div className="start-madness-box glass-card">
          <div className="trophy-badge">⚡</div>
          <h3>Siap Berpacu dengan Waktu?</h3>
          <p>Dapatkan 5 XP & 2 Permata untuk setiap pasangan kata yang benar.</p>
          <button onClick={handleStartGame} className="btn-3d btn-yellow start-btn">
            <Play size={20} fill="#fff" /> Mulai Permainan (60s)
          </button>
        </div>
      ) : (
        <div className="madness-gameboard glass-card">
          <div className="gameboard-top">
            <div className="timer-chip">
              <Timer size={20} color="#ff4b4b" />
              <span>{timeLeft}s</span>
            </div>
            <div className="score-chip">
              <span>Skor: {score}</span>
            </div>
          </div>

          <div className="matching-grid">
            <div className="column">
              {pairs.map((p) => {
                const isDone = matchedIds.includes(p.id);
                const isSelected = selectedLeft === p.id;
                return (
                  <button
                    key={p.id}
                    disabled={isDone}
                    onClick={() => handleMatchClick(p, 'left')}
                    className={`madness-btn ${isDone ? 'done' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    {p.english}
                  </button>
                );
              })}
            </div>
            <div className="column">
              {pairs.map((p) => {
                const isDone = matchedIds.includes(p.id);
                return (
                  <button
                    key={p.id}
                    disabled={isDone}
                    onClick={() => handleMatchClick(p, 'right')}
                    className={`madness-btn ${isDone ? 'done' : ''}`}
                  >
                    {p.indonesian}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .madness-container {
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
        }

        .madness-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .title-chip {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .title-chip h2 {
          font-size: 1.8rem;
          font-weight: 900;
        }

        .start-madness-box {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 40px;
        }

        .trophy-badge {
          font-size: 4rem;
          background: rgba(255, 200, 0, 0.15);
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .start-btn {
          max-width: 300px;
        }

        .btn-yellow {
          background: var(--yellow-primary);
          color: #fff;
          box-shadow: 0 4px 0 var(--yellow-shadow);
        }

        .gameboard-top {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-weight: 900;
          font-size: 1.1rem;
        }

        .timer-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--red-primary);
        }

        .matching-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .madness-btn {
          padding: 14px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          box-shadow: 0 4px 0 var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 800;
          color: var(--text-main);
          cursor: pointer;
        }

        .madness-btn.selected {
          border-color: var(--yellow-primary);
          color: var(--yellow-primary);
        }

        .madness-btn.done {
          opacity: 0.2;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
