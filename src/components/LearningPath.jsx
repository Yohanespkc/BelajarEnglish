import React from 'react';
import { UNITS } from '../data/lessonsData';
import Mascot from './Mascot';
import { Star, Lock, CheckCircle2, Award, Zap } from 'lucide-react';
import { soundService } from '../services/soundService';

export default function LearningPath({ userState, onStartLesson }) {
  const getLessonStatus = (lessonId, unitIndex, lessonIndex) => {
    if (userState.completedLessons.includes(lessonId)) {
      return 'completed';
    }
    // If previous lesson in curriculum is completed (or it's the very first lesson)
    if (unitIndex === 0 && lessonIndex === 0) return 'active';
    
    // Check if prior lesson completed
    const prevUnit = UNITS[unitIndex];
    if (lessonIndex > 0) {
      const prevLessonId = prevUnit.lessons[lessonIndex - 1].id;
      if (userState.completedLessons.includes(prevLessonId)) return 'active';
    } else if (unitIndex > 0) {
      const lastUnitLessons = UNITS[unitIndex - 1].lessons;
      const lastLessonId = lastUnitLessons[lastUnitLessons.length - 1].id;
      if (userState.completedLessons.includes(lastLessonId)) return 'active';
    }

    return 'locked';
  };

  return (
    <div className="learning-path-container">
      <Mascot
        emotion="cheer"
        message="Selamat datang kembali! Mari lanjutkan petualangan Bahasa Inggris kita hari ini!"
      />

      <div className="units-stream">
        {UNITS.map((unit, uIdx) => (
          <div key={unit.id} className="unit-block">
            {/* Unit Header Banner */}
            <div className="unit-header-banner" style={{ backgroundColor: unit.color }}>
              <div className="unit-banner-info">
                <h3>{unit.title}</h3>
                <p>{unit.description}</p>
              </div>
              <div className="unit-xp-chip">
                <span>{unit.lessons.length * 20} XP</span>
              </div>
            </div>

            {/* Path Nodes Tree */}
            <div className="nodes-tree">
              {unit.lessons.map((lesson, lIdx) => {
                const status = getLessonStatus(lesson.id, uIdx, lIdx);
                // Calculate horizontal curve offset for natural path look
                const offsets = [0, 45, -45, 0];
                const offsetX = offsets[lIdx % offsets.length];

                return (
                  <div
                    key={lesson.id}
                    className="node-wrapper"
                    style={{ transform: `translateX(${offsetX}px)` }}
                  >
                    <button
                      onClick={() => {
                        if (status !== 'locked') {
                          soundService.playClick();
                          onStartLesson(lesson);
                        }
                      }}
                      className={`node-button ${status} ${status === 'active' ? 'pulse-node' : ''}`}
                      style={{
                        '--node-color': unit.color
                      }}
                    >
                      {status === 'completed' && <Star size={28} color="#fff" fill="#ffc800" />}
                      {status === 'active' && <Zap size={28} color="#fff" fill="#fff" />}
                      {status === 'locked' && <Lock size={22} color="#9ca3af" />}
                    </button>
                    <span className="node-title">{lesson.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .learning-path-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 600px;
          margin: 0 auto;
        }

        .units-stream {
          display: flex;
          flex-direction: column;
          gap: 40px;
          width: 100%;
        }

        .unit-block {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .unit-header-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-radius: var(--radius-lg);
          color: #fff;
          box-shadow: 0 6px 0 rgba(0, 0, 0, 0.2);
        }

        .unit-banner-info h3 {
          font-size: 1.3rem;
          font-weight: 900;
          margin-bottom: 4px;
        }

        .unit-banner-info p {
          font-size: 0.9rem;
          opacity: 0.9;
          font-weight: 600;
        }

        .unit-xp-chip {
          background: rgba(0, 0, 0, 0.2);
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 900;
          font-size: 0.85rem;
        }

        .nodes-tree {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 32px;
          padding: 10px 0;
        }

        .node-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          transition: transform 0.3s ease;
        }

        .node-button {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: transform 0.15s ease;
        }

        .node-button.completed {
          background: var(--yellow-primary);
          box-shadow: 0 6px 0 var(--yellow-shadow);
        }

        .node-button.active {
          background: var(--node-color);
          box-shadow: 0 6px 0 rgba(0, 0, 0, 0.3);
        }

        .node-button.active:hover {
          transform: scale(1.1);
        }

        .node-button.locked {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          box-shadow: 0 4px 0 var(--border-color);
          cursor: not-allowed;
        }

        .node-title {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-main);
          text-align: center;
          max-width: 120px;
        }
      `}</style>
    </div>
  );
}
