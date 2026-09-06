import React, { useState } from 'react';
import { UNITS } from '../data/lessonsData';
import Mascot from './Mascot';
import { 
  Star, 
  Lock, 
  CheckCircle2, 
  Award, 
  Zap, 
  Compass, 
  List, 
  Gift, 
  ChevronRight, 
  BookOpen, 
  Sparkles, 
  Check, 
  Play, 
  RefreshCw,
  Trophy,
  HelpCircle
} from 'lucide-react';
import { soundService } from '../services/soundService';

export default function LearningPath({ userState, onStartLesson }) {
  // View mode: 'roadmap' (Duolingo style winding path) | 'modules' (Clean professional list)
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('belajarenglish_learning_view') || 'roadmap';
    } catch {
      return 'roadmap';
    }
  });

  const handleSwitchView = (mode) => {
    soundService.playClick();
    setViewMode(mode);
    try {
      localStorage.setItem('belajarenglish_learning_view', mode);
    } catch (e) {
      console.warn(e);
    }
  };

  // Determine lesson status: 'completed' | 'active' | 'locked'
  const getLessonStatus = (lessonId, unitIndex, lessonIndex) => {
    if (userState.completedLessons.includes(lessonId)) {
      return 'completed';
    }
    // If it's the very first lesson
    if (unitIndex === 0 && lessonIndex === 0) return 'active';
    
    // Check if prior lesson in the same unit is completed
    const currentUnit = UNITS[unitIndex];
    if (lessonIndex > 0) {
      const prevLessonId = currentUnit.lessons[lessonIndex - 1].id;
      if (userState.completedLessons.includes(prevLessonId)) return 'active';
    } else if (unitIndex > 0) {
      // Check if last lesson of previous unit is completed
      const prevUnitLessons = UNITS[unitIndex - 1].lessons;
      const lastLessonId = prevUnitLessons[prevUnitLessons.length - 1].id;
      if (userState.completedLessons.includes(lastLessonId)) return 'active';
    }

    return 'locked';
  };

  // Calculate total curriculum statistics
  const totalLessons = UNITS.reduce((acc, u) => acc + u.lessons.length, 0);
  const completedCount = userState.completedLessons.length;
  const overallPercentage = Math.round((completedCount / (totalLessons || 1)) * 100);

  // Calculate horizontal curve offsets for roadmap
  // Pattern: Center (0), Right (+50), Center (0), Left (-50)
  const getRoadmapOffset = (idx) => {
    const pattern = [0, 48, 0, -48];
    return pattern[idx % pattern.length];
  };

  return (
    <div className="learning-path-container">
      {/* Top Welcome Mascot */}
      <Mascot
        emotion="cheer"
        message="Selamat datang kembali! Mari lanjutkan petualangan Bahasa Inggris kita hari ini!"
      />

      {/* Curriculum Control & Progress Overview Bar */}
      <div className="path-control-card">
        <div className="progress-summary-col">
          <div className="progress-header-row">
            <div className="progress-label-wrap">
              <Trophy size={16} color="#ffc800" />
              <span>Kemajuan Belajar Keseluruhan</span>
            </div>
            <span className="progress-percentage-val">{overallPercentage}% Selesai</span>
          </div>
          <div className="progress-track-bar">
            <div 
              className="progress-fill-bar" 
              style={{ width: `${Math.min(100, Math.max(5, overallPercentage))}%` }}
            />
          </div>
          <div className="progress-sub-text">
            <span>{completedCount} dari {totalLessons} modul telah diselesaikan</span>
            <span>+{completedCount * 15} XP Diperoleh</span>
          </div>
        </div>

        {/* View Switcher: Roadmap vs Module List */}
        <div className="view-mode-toggle-group">
          <button 
            type="button"
            className={`view-toggle-btn ${viewMode === 'roadmap' ? 'active' : ''}`}
            onClick={() => handleSwitchView('roadmap')}
            title="Tampilan Jalur Petualangan Interaktif"
          >
            <Compass size={15} />
            <span>Jalur Peta</span>
          </button>
          <button 
            type="button"
            className={`view-toggle-btn ${viewMode === 'modules' ? 'active' : ''}`}
            onClick={() => handleSwitchView('modules')}
            title="Tampilan Modul Terstruktur & Rapi"
          >
            <List size={15} />
            <span>Modul Rapi</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* MODE 1: ROADMAP (GAMIFIED PATH WITH STEPPING STONES & BEACON) */}
      {/* ============================================================ */}
      {viewMode === 'roadmap' && (
        <div className="units-stream-roadmap">
          {UNITS.map((unit, uIdx) => {
            const unitCompletedCount = unit.lessons.filter(l => userState.completedLessons.includes(l.id)).length;
            const unitProgressPct = Math.round((unitCompletedCount / unit.lessons.length) * 100);
            const isUnitFullyCompleted = unitCompletedCount === unit.lessons.length;

            return (
              <div key={unit.id} className="unit-roadmap-block">
                {/* Unit Header Banner with Progress Indicator */}
                <div 
                  className="unit-header-banner" 
                  style={{ 
                    background: `linear-gradient(135deg, ${unit.color}dd, ${unit.color})`,
                    boxShadow: `0 8px 24px -6px ${unit.color}66`
                  }}
                >
                  <div className="unit-banner-left">
                    <div className="unit-number-tag">UNIT {uIdx + 1}</div>
                    <h3 className="unit-banner-title">{unit.title.replace(/^Unit \d+:\s*/, '')}</h3>
                    <p className="unit-banner-desc">{unit.description}</p>
                    
                    <div className="unit-micro-progress">
                      <div className="unit-micro-track">
                        <div 
                          className="unit-micro-fill" 
                          style={{ width: `${unitProgressPct}%` }}
                        />
                      </div>
                      <span className="unit-micro-label">
                        {unitCompletedCount}/{unit.lessons.length} Pelajaran ({unitProgressPct}%)
                      </span>
                    </div>
                  </div>

                  <div className="unit-banner-right">
                    <div className="unit-xp-badge">
                      <Zap size={14} fill="#fff" />
                      <span>{unit.lessons.length * 20} XP</span>
                    </div>
                  </div>
                </div>

                {/* Nodes Path Tree with Connecting Stepping Stones */}
                <div className="roadmap-nodes-container">
                  {unit.lessons.map((lesson, lIdx) => {
                    const status = getLessonStatus(lesson.id, uIdx, lIdx);
                    const offsetX = getRoadmapOffset(lIdx);
                    const isNextInUnit = lIdx < unit.lessons.length - 1;

                    return (
                      <React.Fragment key={lesson.id}>
                        {/* The Lesson Node */}
                        <div 
                          className={`roadmap-node-wrapper ${status}`}
                          style={{ transform: `translateX(${offsetX}px)` }}
                        >
                          {/* Active Beacon / Floating "MULAI!" Tooltip */}
                          {status === 'active' && (
                            <div className="active-start-beacon">
                              <Sparkles size={13} className="beacon-sparkle" />
                              <span>MULAI!</span>
                              <div className="beacon-arrow" />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (status !== 'locked') {
                                soundService.playClick();
                                onStartLesson(lesson);
                              } else {
                                soundService.playWrong();
                              }
                            }}
                            className={`roadmap-circle-btn ${status}`}
                            style={{
                              '--unit-color': unit.color
                            }}
                            aria-label={`${lesson.title} - ${status}`}
                          >
                            {/* Inner Circle Icon */}
                            <div className="node-icon-core">
                              {status === 'completed' && <Star size={28} color="#ffffff" fill="#ffffff" />}
                              {status === 'active' && <Zap size={28} color="#ffffff" fill="#ffffff" />}
                              {status === 'locked' && <Lock size={22} color="#94a3b8" />}
                            </div>

                            {/* Circular Progress Ring for Active / Completed */}
                            {status === 'completed' && (
                              <div className="completed-check-dot">
                                <Check size={12} strokeWidth={3} color="#ffffff" />
                              </div>
                            )}

                            {/* Node Number Badge */}
                            <span className="node-index-badge">
                              {lIdx + 1}
                            </span>
                          </button>

                          {/* Lesson Title & Subtitle Card */}
                          <div className="node-caption-card">
                            <span className="node-title-text">{lesson.title}</span>
                            <span className={`node-status-subtext ${status}`}>
                              {status === 'completed' && `Selesai • +${lesson.xpReward} XP`}
                              {status === 'active' && 'Siap Dimulai ➔'}
                              {status === 'locked' && 'Terkunci'}
                            </span>
                          </div>
                        </div>

                        {/* Connecting Stepping Stones Between Nodes */}
                        {isNextInUnit && (
                          <div 
                            className="stepping-stones-row"
                            style={{ 
                              transform: `translateX(${(offsetX + getRoadmapOffset(lIdx + 1)) / 2}px)` 
                            }}
                          >
                            <span className={`stepping-dot dot-1 ${status === 'completed' ? 'active' : ''}`} />
                            <span className={`stepping-dot dot-2 ${status === 'completed' ? 'active' : ''}`} />
                            <span className={`stepping-dot dot-3 ${status === 'completed' ? 'active' : ''}`} />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Unit Milestone Chest at the End of the Unit */}
                  <div className="unit-milestone-chest-wrapper">
                    <div className={`milestone-chest ${isUnitFullyCompleted ? 'unlocked' : 'locked'}`}>
                      <div className="chest-icon-bubble">
                        <Gift size={28} color={isUnitFullyCompleted ? '#ffc800' : '#94a3b8'} />
                      </div>
                      <span className="chest-label">
                        {isUnitFullyCompleted ? 'Peti Hadiah Unit Selesai! 🎉' : `Peti Hadiah Unit ${uIdx + 1}`}
                      </span>
                      <span className="chest-reward-chip">+50 Permata</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================ */}
      {/* MODE 2: STRUCTURED PROFESSIONAL MODULES (CLEAN CARD LIST)    */}
      {/* ============================================================ */}
      {viewMode === 'modules' && (
        <div className="units-stream-modules">
          {UNITS.map((unit, uIdx) => {
            const unitCompletedCount = unit.lessons.filter(l => userState.completedLessons.includes(l.id)).length;
            const unitProgressPct = Math.round((unitCompletedCount / unit.lessons.length) * 100);

            return (
              <div key={unit.id} className="unit-module-section">
                {/* Clean Header Bar */}
                <div 
                  className="module-unit-banner"
                  style={{ borderLeftColor: unit.color }}
                >
                  <div className="banner-text-col">
                    <div className="unit-sub-tag" style={{ color: unit.color }}>UNIT {uIdx + 1}</div>
                    <h3 className="unit-title">{unit.title.replace(/^Unit \d+:\s*/, '')}</h3>
                    <p className="unit-desc">{unit.description}</p>
                  </div>
                  
                  <div className="banner-stats-col">
                    <span className="badge-stat">{unitCompletedCount}/{unit.lessons.length} Selesai</span>
                    <span className="xp-total-pill">+{unit.lessons.length * 20} XP</span>
                  </div>
                </div>

                {/* List of Module Cards */}
                <div className="modules-cards-list">
                  {unit.lessons.map((lesson, lIdx) => {
                    const status = getLessonStatus(lesson.id, uIdx, lIdx);
                    const qCount = lesson.questions ? lesson.questions.length : 5;

                    return (
                      <div 
                        key={lesson.id}
                        className={`module-card-item ${status}`}
                        onClick={() => {
                          if (status !== 'locked') {
                            soundService.playClick();
                            onStartLesson(lesson);
                          }
                        }}
                      >
                        {/* Number & Icon Indicator */}
                        <div className="card-leading-badge">
                          <div className={`status-icon-bubble ${status}`} style={{ '--u-color': unit.color }}>
                            {status === 'completed' && <Check size={18} strokeWidth={3} />}
                            {status === 'active' && <Zap size={18} fill="currentColor" />}
                            {status === 'locked' && <Lock size={16} />}
                          </div>
                          <span className="module-seq-label">#{uIdx + 1}.{lIdx + 1}</span>
                        </div>

                        {/* Title & Description */}
                        <div className="card-content-col">
                          <div className="card-title-row">
                            <h4 className="lesson-name">{lesson.title}</h4>
                            {status === 'active' && (
                              <span className="active-glow-chip">Sedang Dipelajari ⚡</span>
                            )}
                          </div>
                          <p className="lesson-desc">{lesson.description || 'Latihan kosakata, mendengarkan, dan pengucapan fonetik.'}</p>
                          
                          <div className="lesson-meta-chips">
                            <span className="meta-pill">{qCount} Soal Latihan</span>
                            <span className="meta-pill xp">+{lesson.xpReward} XP</span>
                            <span className="meta-pill">Interaktif</span>
                          </div>
                        </div>

                        {/* Trailing Action Button */}
                        <div className="card-action-col">
                          {status === 'completed' && (
                            <button 
                              type="button"
                              className="module-action-btn completed"
                              onClick={(e) => {
                                e.stopPropagation();
                                soundService.playClick();
                                onStartLesson(lesson);
                              }}
                            >
                              <RefreshCw size={13} />
                              <span>Ulangi</span>
                            </button>
                          )}

                          {status === 'active' && (
                            <button 
                              type="button"
                              className="module-action-btn active"
                              style={{ backgroundColor: unit.color }}
                              onClick={(e) => {
                                e.stopPropagation();
                                soundService.playClick();
                                onStartLesson(lesson);
                              }}
                            >
                              <Play size={13} fill="#fff" />
                              <span>Mulai Belajar</span>
                            </button>
                          )}

                          {status === 'locked' && (
                            <div className="module-action-btn locked">
                              <Lock size={13} />
                              <span>Terkunci</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sleek Scoped Styles */}
      <style>{`
        .learning-path-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          max-width: 680px;
          margin: 0 auto 60px;
          padding: 0 16px;
        }

        /* Top Progress & View Switcher Card */
        .path-control-card {
          width: 100%;
          background: var(--bg-card, #131b26);
          border: 1px solid var(--border-color, rgba(255,255,255,0.1));
          border-radius: var(--radius-lg, 16px);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 28px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
        }

        .progress-summary-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .progress-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 800;
        }

        .progress-label-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-main, #ffffff);
        }

        .progress-percentage-val {
          color: #ffc800;
          font-size: 0.88rem;
        }

        .progress-track-bar {
          width: 100%;
          height: 10px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          overflow: hidden;
        }

        .progress-fill-bar {
          height: 100%;
          background: linear-gradient(90deg, #ffc800, #58cc02);
          border-radius: 10px;
          transition: width 0.4s ease;
        }

        .progress-sub-text {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-sub, #94a3b8);
          font-weight: 600;
        }

        /* View Mode Toggle */
        .view-mode-toggle-group {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.25);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          flex-shrink: 0;
        }

        .view-toggle-btn {
          background: transparent;
          border: none;
          color: var(--text-sub, #94a3b8);
          padding: 7px 12px;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .view-toggle-btn.active {
          background: var(--bg-card, #1e293b);
          color: #00e5ff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }

        /* ============================================================ */
        /* ROADMAP VIEW STYLES                                          */
        /* ============================================================ */
        .units-stream-roadmap {
          display: flex;
          flex-direction: column;
          gap: 40px;
          width: 100%;
        }

        .unit-roadmap-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
        }

        /* Unit Banner */
        .unit-header-banner {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-radius: var(--radius-lg, 18px);
          color: #ffffff;
          margin-bottom: 32px;
          position: relative;
        }

        .unit-number-tag {
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          background: rgba(0, 0, 0, 0.25);
          padding: 3px 10px;
          border-radius: 20px;
          display: inline-block;
          margin-bottom: 6px;
        }

        .unit-banner-title {
          font-size: 1.35rem;
          font-weight: 900;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }

        .unit-banner-desc {
          font-size: 0.88rem;
          margin: 0 0 12px;
          opacity: 0.92;
          line-height: 1.4;
          max-width: 420px;
        }

        .unit-micro-progress {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .unit-micro-track {
          width: 120px;
          height: 6px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 6px;
          overflow: hidden;
        }

        .unit-micro-fill {
          height: 100%;
          background: #ffffff;
          border-radius: 6px;
        }

        .unit-micro-label {
          font-size: 0.75rem;
          font-weight: 700;
          opacity: 0.95;
        }

        .unit-xp-badge {
          background: rgba(0, 0, 0, 0.25);
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          gap: 6px;
          backdrop-filter: blur(4px);
        }

        /* Roadmap Nodes Container */
        .roadmap-nodes-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 100%;
          gap: 20px;
        }

        .roadmap-node-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Floating Active Beacon */
        .active-start-beacon {
          position: absolute;
          top: -38px;
          background: #58cc02;
          color: #ffffff;
          font-size: 0.75rem;
          font-weight: 900;
          padding: 5px 12px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 4px 14px rgba(88, 204, 2, 0.5);
          animation: beaconBounce 1.6s ease-in-out infinite;
          z-index: 5;
        }

        .beacon-arrow {
          position: absolute;
          bottom: -5px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid #58cc02;
        }

        @keyframes beaconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        /* Node Circle Button */
        .roadmap-circle-btn {
          width: 76px;
          height: 76px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.15s ease;
          background: #1e293b;
        }

        .roadmap-circle-btn.completed {
          background: #ffc800;
          box-shadow: 0 7px 0 #cc9a00, 0 10px 20px rgba(255, 200, 0, 0.25);
        }

        .roadmap-circle-btn.completed:hover {
          transform: translateY(-2px);
          box-shadow: 0 9px 0 #cc9a00, 0 14px 24px rgba(255, 200, 0, 0.35);
        }

        .roadmap-circle-btn.completed:active {
          transform: translateY(4px);
          box-shadow: 0 3px 0 #cc9a00;
        }

        .roadmap-circle-btn.active {
          background: var(--unit-color, #58cc02);
          box-shadow: 0 8px 0 rgba(0, 0, 0, 0.35), 0 0 24px var(--unit-color, #58cc02);
          animation: pulseGlow 2s infinite;
        }

        .roadmap-circle-btn.active:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 10px 0 rgba(0, 0, 0, 0.35), 0 0 30px var(--unit-color, #58cc02);
        }

        .roadmap-circle-btn.active:active {
          transform: translateY(4px) scale(0.98);
          box-shadow: 0 4px 0 rgba(0, 0, 0, 0.35);
        }

        .roadmap-circle-btn.locked {
          background: rgba(30, 41, 59, 0.6);
          border: 2px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 6px 0 rgba(15, 23, 42, 0.8);
          cursor: not-allowed;
          opacity: 0.75;
        }

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 8px 0 rgba(0, 0, 0, 0.35), 0 0 15px var(--unit-color, #58cc02); }
          50% { box-shadow: 0 8px 0 rgba(0, 0, 0, 0.35), 0 0 28px var(--unit-color, #58cc02); }
        }

        .completed-check-dot {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #58cc02;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          border: 2px solid var(--bg-main, #0f172a);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        }

        .node-index-badge {
          position: absolute;
          bottom: -4px;
          background: rgba(15, 23, 42, 0.85);
          color: var(--text-sub, #94a3b8);
          font-size: 0.68rem;
          font-weight: 800;
          padding: 1px 7px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }

        /* Caption Text Under Node */
        .node-caption-card {
          margin-top: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 2px;
          max-width: 150px;
        }

        .node-title-text {
          font-size: 0.88rem;
          font-weight: 800;
          color: var(--text-main, #ffffff);
          line-height: 1.3;
        }

        .node-status-subtext {
          font-size: 0.74rem;
          font-weight: 700;
        }

        .node-status-subtext.completed {
          color: #ffc800;
        }

        .node-status-subtext.active {
          color: #58cc02;
        }

        .node-status-subtext.locked {
          color: var(--text-sub, #64748b);
        }

        /* Stepping Stones */
        .stepping-stones-row {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          margin: 6px 0;
        }

        .stepping-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          transition: all 0.2s ease;
        }

        .stepping-dot.active {
          background: #ffc800;
          box-shadow: 0 0 6px rgba(255, 200, 0, 0.6);
        }

        /* Milestone Chest */
        .unit-milestone-chest-wrapper {
          margin: 20px 0 10px;
        }

        .milestone-chest {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 14px 20px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px dashed var(--border-color, rgba(255,255,255,0.15));
          text-align: center;
        }

        .milestone-chest.unlocked {
          background: rgba(255, 200, 0, 0.08);
          border-color: rgba(255, 200, 0, 0.4);
        }

        .chest-icon-bubble {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chest-label {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-main, #ffffff);
        }

        .chest-reward-chip {
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(28, 176, 246, 0.15);
          color: #1cb0f6;
          padding: 2px 8px;
          border-radius: 10px;
        }

        /* ============================================================ */
        /* MODULES VIEW STYLES (CLEAN STRUCTURED CARDS)                 */
        /* ============================================================ */
        .units-stream-modules {
          display: flex;
          flex-direction: column;
          gap: 32px;
          width: 100%;
        }

        .unit-module-section {
          background: var(--bg-card, #131b26);
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          border-radius: var(--radius-lg, 16px);
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }

        .module-unit-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 18px 22px;
          background: rgba(0, 0, 0, 0.2);
          border-left: 5px solid #58cc02;
          border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
        }

        .unit-sub-tag {
          font-size: 0.72rem;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .unit-title {
          margin: 0 0 4px;
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--text-main, #ffffff);
        }

        .unit-desc {
          margin: 0;
          font-size: 0.84rem;
          color: var(--text-sub, #94a3b8);
        }

        .banner-stats-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 6px;
        }

        .badge-stat {
          font-size: 0.78rem;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.08);
          padding: 3px 10px;
          border-radius: 12px;
          color: var(--text-main, #ffffff);
        }

        .xp-total-pill {
          font-size: 0.78rem;
          font-weight: 800;
          color: #ffc800;
        }

        /* Modules Card List */
        .modules-cards-list {
          display: flex;
          flex-direction: column;
          padding: 12px;
          gap: 10px;
        }

        .module-card-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 14px 18px;
          border-radius: var(--radius-md, 12px);
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border-color, rgba(255,255,255,0.06));
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .module-card-item:hover:not(.locked) {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .module-card-item.active {
          background: rgba(88, 204, 2, 0.06);
          border-color: rgba(88, 204, 2, 0.3);
        }

        .module-card-item.locked {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .card-leading-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .status-icon-bubble {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
        }

        .status-icon-bubble.completed {
          background: #ffc800;
        }

        .status-icon-bubble.active {
          background: var(--u-color, #58cc02);
          box-shadow: 0 0 12px var(--u-color, #58cc02);
        }

        .status-icon-bubble.locked {
          background: rgba(255, 255, 255, 0.08);
          color: #94a3b8;
        }

        .module-seq-label {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--text-sub, #94a3b8);
        }

        .card-content-col {
          flex: 1;
        }

        .card-title-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .lesson-name {
          margin: 0;
          font-size: 0.98rem;
          font-weight: 800;
          color: var(--text-main, #ffffff);
        }

        .active-glow-chip {
          background: rgba(88, 204, 2, 0.15);
          color: #58cc02;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 10px;
          border: 1px solid rgba(88, 204, 2, 0.3);
        }

        .lesson-desc {
          margin: 0 0 8px;
          font-size: 0.82rem;
          color: var(--text-sub, #94a3b8);
        }

        .lesson-meta-chips {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .meta-pill {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.06);
          color: var(--text-sub, #cbd5e1);
        }

        .meta-pill.xp {
          background: rgba(255, 200, 0, 0.15);
          color: #ffc800;
        }

        .card-action-col {
          flex-shrink: 0;
        }

        .module-action-btn {
          border: none;
          padding: 8px 14px;
          border-radius: var(--radius-sm, 8px);
          font-size: 0.82rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }

        .module-action-btn.completed {
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-main, #ffffff);
          border: 1px solid var(--border-color, rgba(255,255,255,0.12));
        }

        .module-action-btn.completed:hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .module-action-btn.active {
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(88, 204, 2, 0.3);
        }

        .module-action-btn.active:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(88, 204, 2, 0.4);
        }

        .module-action-btn.locked {
          background: transparent;
          color: var(--text-sub, #64748b);
          cursor: not-allowed;
          font-weight: 600;
        }

        @media (max-width: 640px) {
          .path-control-card {
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
          }
          .view-mode-toggle-group {
            justify-content: center;
          }
          .unit-header-banner {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .unit-banner-right {
            align-self: flex-start;
          }
          .module-card-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .card-action-col {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
