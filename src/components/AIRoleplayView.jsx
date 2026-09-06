import React, { useState, useEffect, useRef } from 'react';
import { ROLEPLAY_SCENARIOS } from '../data/roleplayData';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Sparkles, 
  ArrowLeft, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  TrendingUp, 
  RotateCcw,
  Trophy,
  BarChart3,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { honorScoringService } from '../services/honorScoringService';
import { activityLoggerService } from '../services/activityLoggerService';

export default function AIRoleplayView({ userState, onAddXp, onAddTokens }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [sessionTurnCount, setSessionTurnCount] = useState(0);
  const [sessionTokensWon, setSessionTokensWon] = useState(0);
  const [turnScores, setTurnScores] = useState([]);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [sessionEvaluations, setSessionEvaluations] = useState([]);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping]);

  const handleStartScenario = (scenario) => {
    soundService.playClick();
    setSelectedScenario(scenario);
    setSessionTurnCount(0);
    setSessionTokensWon(0);
    setTurnScores([]);
    setSessionEvaluations([]);
    setShowSummaryModal(false);

    setMessages([
      {
        id: 'msg_0',
        sender: 'ai',
        text: scenario.initialMessage,
        audioText: scenario.initialMessage,
        evaluation: null
      }
    ]);
    speechService.speak(scenario.initialMessage);
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim() || isAiTyping) return;

    soundService.playClick();
    const userMsgId = 'msg_u_' + Date.now();
    const userMsg = { 
      id: userMsgId, 
      sender: 'user', 
      text: text.trim() 
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);

    try {
      // Evaluate using unified AI engine with strict rubric
      const evalResult = await honorScoringService.evaluateRoleplayTurn({
        userText: text,
        scenario: selectedScenario,
        conversationHistory: messages
      });

      const nextTurn = sessionTurnCount + 1;
      setSessionTurnCount(nextTurn);
      setTurnScores((prev) => [...prev, evalResult.totalScore]);
      setSessionEvaluations((prev) => [...prev, evalResult]);

      if (evalResult.tokensAwarded > 0) {
        setSessionTokensWon((prev) => prev + evalResult.tokensAwarded);
        if (onAddTokens) onAddTokens(evalResult.tokensAwarded);
        if (onAddXp) onAddXp(evalResult.tokensAwarded * 2);

        if (evalResult.grade === 'S+' || evalResult.grade === 'S') {
          soundService.playLevelUp();
          confetti({ particleCount: 30, spread: 45, origin: { y: 0.8 } });
        } else {
          soundService.playCorrect();
        }
      } else {
        // Wrong / off-topic answer
        soundService.playWrong();
      }

      const aiMsg = {
        id: 'msg_a_' + Date.now(),
        sender: 'ai',
        text: evalResult.inCharacterResponse,
        audioText: evalResult.inCharacterResponse,
        evaluation: evalResult,
        userMessageText: text
      };

      setMessages((prev) => [...prev, aiMsg]);
      speechService.speak(evalResult.inCharacterResponse);
    } catch (e) {
      console.error('Roleplay Turn Error:', e);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleMicToggle = () => {
    soundService.playClick();
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening({
        onResult: (transcript, isFinal) => {
          setInputText(transcript);
          if (isFinal) {
            setIsListening(false);
            handleSendMessage(transcript);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  const handleFinishSession = () => {
    soundService.playClick();
    setShowSummaryModal(true);

    if (turnScores.length > 0) {
      const avgScore = Math.round(turnScores.reduce((a, b) => a + b, 0) / turnScores.length);
      const grade = honorScoringService.getGrade(avgScore);

      activityLoggerService.logActivity({
        type: 'roleplay',
        title: `AI Roleplay: ${selectedScenario.title}`,
        detail: `Menyelesaikan ${turnScores.length} giliran percakapan. Rerata Skor: ${avgScore}% (Grade ${grade.grade}). Memperoleh +${sessionTokensWon} Token Kehormatan 🪙`,
        score: avgScore,
        xpEarned: sessionTokensWon * 2,
        tokensEarned: sessionTokensWon,
        metadata: {
          scenarioId: selectedScenario.id,
          turns: turnScores.length,
          grade: grade.grade
        }
      });

      if (avgScore >= 75) {
        confetti({ particleCount: 70, spread: 70 });
      }
    }
  };

  const currentHonorTitle = honorScoringService.getHonorTitle(userState?.tokens || 150);

  // Calculate session summary stats
  const avgSessionScore = turnScores.length > 0
    ? Math.round(turnScores.reduce((a, b) => a + b, 0) / turnScores.length)
    : 0;
  const sessionGrade = honorScoringService.getGrade(avgSessionScore);

  const avgGrammar = sessionEvaluations.length > 0
    ? Math.round(sessionEvaluations.reduce((a, b) => a + (b.breakdown?.grammarScore || 0), 0) / sessionEvaluations.length)
    : 0;
  const avgContext = sessionEvaluations.length > 0
    ? Math.round(sessionEvaluations.reduce((a, b) => a + (b.breakdown?.contextScore || 0), 0) / sessionEvaluations.length)
    : 0;
  const avgVocab = sessionEvaluations.length > 0
    ? Math.round(sessionEvaluations.reduce((a, b) => a + (b.breakdown?.vocabScore || 0), 0) / sessionEvaluations.length)
    : 0;
  const avgFluency = sessionEvaluations.length > 0
    ? Math.round(sessionEvaluations.reduce((a, b) => a + (b.breakdown?.fluencyScore || 0), 0) / sessionEvaluations.length)
    : 0;

  return (
    <div className="roleplay-container">
      {!selectedScenario ? (
        <div className="scenarios-selection">
          <div className="section-header">
            <div className="ai-badge">
              <Sparkles size={18} color="#ce82ff" />
              <span>Sistem Skoring Profesional & Evaluasi AI Ketat</span>
            </div>
            <h2>Latihan Percakapan Dunia Nyata (AI Roleplay)</h2>
            <p>
              Uji kemampuan berbicara Anda dalam skenario nyata. AI akan mengevaluasi tata bahasa, 
              kesesuaian jawaban, dan kekayaan kosakata. Jawaban salah/tidak nyambung akan dikoreksi dan dinilai objektif!
            </p>

            {/* Honor Title Status Banner */}
            <div className="honor-summary-card glass-card">
              <div className="honor-left">
                <span className="honor-big-icon">{currentHonorTitle.icon}</span>
                <div className="honor-texts">
                  <div className="honor-title-row">
                    <h3>Gelar Anda: {currentHonorTitle.name}</h3>
                    <span className="honor-id-tag">({currentHonorTitle.nameId})</span>
                  </div>
                  <p>{currentHonorTitle.description}</p>
                </div>
              </div>
              <div className="honor-right">
                <div className="token-display">
                  <span className="token-coin">🪙</span>
                  <span className="token-amount">{userState?.tokens || 150}</span>
                  <span className="token-sub">Token Kehormatan</span>
                </div>
                {currentHonorTitle.nextTitle && (
                  <div className="progress-mini-wrap">
                    <div className="progress-label">
                      <span>Menuju {currentHonorTitle.nextTitle.name}</span>
                      <span>{currentHonorTitle.progressToNext}%</span>
                    </div>
                    <div className="progress-bar-track">
                      <div className="progress-bar-fill" style={{ width: `${currentHonorTitle.progressToNext}%` }}></div>
                    </div>
                    <span className="tokens-left-label">{currentHonorTitle.tokensNeeded} Token lagi</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="scenarios-grid">
            {ROLEPLAY_SCENARIOS.map((scen) => (
              <div
                key={scen.id}
                onClick={() => handleStartScenario(scen)}
                className="scenario-card glass-card"
                style={{ background: scen.bgGradient }}
              >
                <div className="card-top">
                  <span className="scen-avatar">{scen.avatar}</span>
                  <span className="diff-tag">{scen.difficulty}</span>
                </div>
                <h3>{scen.title}</h3>
                <span className="cat-tag">{scen.category}</span>
                <div className="card-scoring-hint">
                  <span>🏆 Hadiah: s/d +15 Token per Jawaban S-Rank</span>
                </div>
                <button className="btn-3d btn-purple start-roleplay-btn">
                  Mulai Simulasi Percakapan
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-room-wrapper glass-card">
          {/* Chat Header with Professional Game HUD */}
          <div className="chat-header">
            <div className="header-left">
              <button onClick={() => setSelectedScenario(null)} className="back-btn" title="Kembali ke Daftar Skenario">
                <ArrowLeft size={20} />
              </button>
              <div className="chat-partner-info">
                <span className="partner-avatar">{selectedScenario.avatar}</span>
                <div>
                  <div className="title-row">
                    <h3>{selectedScenario.title}</h3>
                    <span className="diff-chip">{selectedScenario.difficulty}</span>
                  </div>
                  <span className="status-dot">● AI Examiner & Roleplay Partner Aktif</span>
                </div>
              </div>
            </div>

            <div className="header-game-hud">
              <div className="hud-metric" title="Jumlah Giliran Percakapan yang Selesai">
                <span className="hud-label">GILIRAN</span>
                <span className="hud-val">{sessionTurnCount}</span>
              </div>
              <div className="hud-metric tokens" title="Total Token Kehormatan yang Diperoleh Sesi Ini">
                <span className="hud-label">TOKEN SESI</span>
                <span className="hud-val">🪙 +{sessionTokensWon}</span>
              </div>
              {turnScores.length > 0 && (
                <button 
                  onClick={handleFinishSession}
                  className="finish-session-btn"
                  title="Selesaikan percakapan dan lihat kartu skor evaluasi game"
                >
                  <Trophy size={16} />
                  <span>Rapor Game</span>
                </button>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages-list">
            {messages.map((m) => (
              <div key={m.id} className={`chat-message-group ${m.sender}`}>
                <div className={`chat-message-bubble ${m.sender}`}>
                  {m.sender === 'ai' && (
                    <button onClick={() => speechService.speak(m.audioText)} className="speak-msg-btn" title="Dengarkan Pengucapan">
                      <Volume2 size={18} color="#ce82ff" />
                    </button>
                  )}
                  <div className="msg-content">
                    <p>{m.text}</p>
                  </div>
                </div>

                {/* Turn Scorecard & Evaluation Feedback Card */}
                {m.sender === 'ai' && m.evaluation && (
                  <div className={`turn-scorecard glass-card ${m.evaluation.isAppropriate ? 'passed' : 'failed'}`}>
                    <div className="scorecard-top">
                      <div className="scorecard-grade" style={{ color: m.evaluation.gradeColor }}>
                        <span className="grade-badge" style={{ borderColor: m.evaluation.gradeColor, background: m.evaluation.gradeColor + '20' }}>
                          {m.evaluation.grade}
                        </span>
                        <div className="grade-text">
                          <strong>{m.evaluation.totalScore} Poin</strong>
                          <span>{m.evaluation.gradeLabel}</span>
                        </div>
                      </div>

                      <div className="token-yield">
                        {m.evaluation.tokensAwarded > 0 ? (
                          <span className="token-won-tag">+{m.evaluation.tokensAwarded} Token 🪙</span>
                        ) : (
                          <span className="token-zero-tag">0 Token ❌</span>
                        )}
                      </div>
                    </div>

                    {/* 4-Pillar Metric Mini-Bars */}
                    {m.evaluation.breakdown && (
                      <div className="pillars-grid">
                        <div className="pillar-item">
                          <div className="pillar-label">
                            <span>Tata Bahasa</span>
                            <b>{m.evaluation.breakdown.grammarScore}%</b>
                          </div>
                          <div className="pillar-bar">
                            <div className="pillar-fill" style={{ width: `${m.evaluation.breakdown.grammarScore}%`, background: '#58cc02' }} />
                          </div>
                        </div>

                        <div className="pillar-item">
                          <div className="pillar-label">
                            <span>Kesesuaian Konteks</span>
                            <b>{m.evaluation.breakdown.contextScore}%</b>
                          </div>
                          <div className="pillar-bar">
                            <div className="pillar-fill" style={{ width: `${m.evaluation.breakdown.contextScore}%`, background: '#1cb0f6' }} />
                          </div>
                        </div>

                        <div className="pillar-item">
                          <div className="pillar-label">
                            <span>Kosakata</span>
                            <b>{m.evaluation.breakdown.vocabScore}%</b>
                          </div>
                          <div className="pillar-bar">
                            <div className="pillar-fill" style={{ width: `${m.evaluation.breakdown.vocabScore}%`, background: '#ce82ff' }} />
                          </div>
                        </div>

                        <div className="pillar-item">
                          <div className="pillar-label">
                            <span>Kelancaran</span>
                            <b>{m.evaluation.breakdown.fluencyScore}%</b>
                          </div>
                          <div className="pillar-bar">
                            <div className="pillar-fill" style={{ width: `${m.evaluation.breakdown.fluencyScore}%`, background: '#ffc800' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mistakes & Corrections Box if error / wrong answer occurred */}
                    {(!m.evaluation.isAppropriate || m.evaluation.correction || m.evaluation.totalScore < 75) && (
                      <div className="correction-box">
                        <div className="corr-header">
                          {!m.evaluation.isAppropriate ? (
                            <>
                              <XCircle size={16} color="#ff4b4b" />
                              <strong style={{ color: '#ff4b4b' }}>Jawaban Kurang Tepat / Tidak Sesuai Konteks</strong>
                            </>
                          ) : (
                            <>
                              <AlertTriangle size={16} color="#ff9600" />
                              <strong style={{ color: '#ff9600' }}>Saran Penyempurnaan Kalimat</strong>
                            </>
                          )}
                        </div>

                        {m.evaluation.correction && (
                          <div className="corr-sentence">
                            <span className="corr-label">✅ Seharusnya / Rekomendasi:</span>
                            <span className="corr-text">"{m.evaluation.correction}"</span>
                          </div>
                        )}

                        {m.evaluation.explanation && (
                          <p className="corr-explanation">
                            💡 {m.evaluation.explanation}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {isAiTyping && (
              <div className="chat-message-bubble ai typing">
                <span className="typing-dots">AI sedang mengevaluasi tata bahasa & menyusun balasan...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts for hints */}
          <div className="prompts-bar">
            <span className="prompts-label">Contoh Ungkapan:</span>
            {selectedScenario.suggestedPrompts.map((p, i) => (
              <button key={i} onClick={() => handleSendMessage(p)} className="prompt-chip">
                "{p}"
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Tulis balasan dalam bahasa Inggris sesuai peran..."
              value={inputText}
              disabled={isAiTyping}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button 
              onClick={handleMicToggle} 
              className={`mic-chat-btn ${isListening ? 'active' : ''}`}
              title={isListening ? 'Berhenti bicara' : 'Bicara lewat mikrofon'}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button 
              onClick={() => handleSendMessage()} 
              disabled={!inputText.trim() || isAiTyping}
              className="send-chat-btn"
              title="Kirim pesan"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Summary / Game Scorecard Modal */}
      {showSummaryModal && (
        <div className="modal-overlay">
          <div className="summary-card glass-card">
            <div className="summary-header">
              <Trophy size={40} color="#ffc800" />
              <h2>Kartu Rapor Simulasi Percakapan</h2>
              <p>{selectedScenario?.title}</p>
            </div>

            <div className="overall-grade-showcase">
              <div className="grade-big-circle" style={{ borderColor: sessionGrade.color, background: sessionGrade.color + '20' }}>
                <span style={{ color: sessionGrade.color }}>{sessionGrade.grade}</span>
              </div>
              <div className="overall-score-texts">
                <h3>Skor Rerata: {avgSessionScore} / 100</h3>
                <span className="grade-desc-pill" style={{ background: sessionGrade.color + '25', color: sessionGrade.color }}>
                  {sessionGrade.label}
                </span>
                <p>Menyelesaikan {turnScores.length} percakapan interaktif</p>
              </div>
            </div>

            {/* Token Rewards Section */}
            <div className="summary-token-reward">
              <span className="token-won-large">🪙 +{sessionTokensWon} Token Kehormatan Berhasil Diraih!</span>
              <p>Token Anda kini: <b>{(userState?.tokens || 150)} Token</b></p>
            </div>

            {/* 4 Pillars Aggregate */}
            <div className="summary-pillars">
              <h4>Metrik Penilaian 4 Pilar Game:</h4>
              <div className="summary-pillar-row">
                <span>Tata Bahasa (Grammar):</span>
                <b>{avgGrammar}%</b>
              </div>
              <div className="summary-pillar-row">
                <span>Kesesuaian Konteks (Relevance):</span>
                <b>{avgContext}%</b>
              </div>
              <div className="summary-pillar-row">
                <span>Kekayaan Kosakata (Vocabulary):</span>
                <b>{avgVocab}%</b>
              </div>
              <div className="summary-pillar-row">
                <span>Kelancaran Berbicara (Fluency):</span>
                <b>{avgFluency}%</b>
              </div>
            </div>

            {/* Next Title Progress */}
            <div className="title-progress-box">
              <div className="title-header-line">
                <span>Gelar: <b>{currentHonorTitle.name}</b></span>
                {currentHonorTitle.nextTitle && (
                  <span>Berikutnya: <b>{currentHonorTitle.nextTitle.name}</b></span>
                )}
              </div>
              {currentHonorTitle.nextTitle && (
                <>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${currentHonorTitle.progressToNext}%` }} />
                  </div>
                  <span className="sub-progress-text">{currentHonorTitle.tokensNeeded} Token lagi untuk naik gelar!</span>
                </>
              )}
            </div>

            <div className="summary-actions">
              <button 
                onClick={() => {
                  soundService.playClick();
                  handleStartScenario(selectedScenario);
                }} 
                className="btn-3d btn-yellow"
              >
                <RotateCcw size={18} /> Ulangi Skenario Ini
              </button>
              <button 
                onClick={() => {
                  soundService.playClick();
                  setSelectedScenario(null);
                  setShowSummaryModal(false);
                }} 
                className="btn-3d btn-purple"
              >
                Pilih Skenario Lain
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .roleplay-container {
          width: 100%;
          max-width: 860px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 28px;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(206, 130, 255, 0.15);
          color: var(--purple-primary);
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 0.85rem;
          margin-bottom: 12px;
        }

        .section-header h2 {
          font-size: 1.8rem;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .section-header p {
          color: var(--text-sub);
          font-weight: 600;
          font-size: 0.95rem;
          max-width: 680px;
          margin: 0 auto 20px auto;
        }

        /* Honor Summary Card in Selection View */
        .honor-summary-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 18px 24px;
          margin-bottom: 24px;
          text-align: left;
          gap: 20px;
          flex-wrap: wrap;
        }

        .honor-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 260px;
        }

        .honor-big-icon {
          font-size: 3rem;
          filter: drop-shadow(0 4px 10px rgba(255, 200, 0, 0.3));
        }

        .honor-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .honor-title-row h3 {
          font-size: 1.25rem;
          font-weight: 900;
          color: var(--text-main);
          margin: 0;
        }

        .honor-id-tag {
          font-size: 0.82rem;
          color: #ffc800;
          font-weight: 800;
        }

        .honor-texts p {
          margin: 0;
          font-size: 0.82rem;
          color: var(--text-sub);
        }

        .honor-right {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
          min-width: 220px;
        }

        .token-display {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .token-coin {
          font-size: 1.4rem;
        }

        .token-amount {
          font-size: 1.6rem;
          font-weight: 900;
          color: #ffc800;
        }

        .token-sub {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-sub);
        }

        .progress-mini-wrap {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.74rem;
          font-weight: 800;
          color: var(--text-sub);
        }

        .progress-bar-track {
          width: 100%;
          height: 8px;
          background: var(--bg-primary);
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid var(--border-color);
        }

        .progress-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #ffc800, #ce82ff);
          border-radius: 10px;
          transition: width 0.4s ease;
        }

        .tokens-left-label {
          font-size: 0.72rem;
          color: var(--text-sub);
          align-self: flex-end;
        }

        /* Scenarios Grid */
        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .scenario-card {
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 10px;
          cursor: pointer;
          border-radius: var(--radius-lg);
          padding: 22px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .scenario-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.3);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .scen-avatar {
          font-size: 2.6rem;
        }

        .diff-tag {
          background: rgba(0, 0, 0, 0.35);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .scenario-card h3 {
          font-size: 1.2rem;
          font-weight: 900;
          margin: 0;
        }

        .cat-tag {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .card-scoring-hint {
          background: rgba(0, 0, 0, 0.25);
          padding: 6px 10px;
          border-radius: 8px;
          font-size: 0.76rem;
          font-weight: 800;
          color: #ffeb3b;
        }

        .start-roleplay-btn {
          margin-top: 6px;
        }

        /* Chat Room */
        .chat-room-wrapper {
          display: flex;
          flex-direction: column;
          height: 640px;
          padding: 0;
          overflow: hidden;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: rgba(0, 0, 0, 0.25);
          border-bottom: 2px solid var(--border-color);
          gap: 12px;
          flex-wrap: wrap;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--text-main);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 6px;
          border-radius: 8px;
          transition: background 0.2s ease;
        }

        .back-btn:hover {
          background: var(--bg-card-hover);
        }

        .chat-partner-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .partner-avatar {
          font-size: 2rem;
        }

        .title-row {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .title-row h3 {
          font-size: 1.05rem;
          font-weight: 900;
          margin: 0;
          color: var(--text-main);
        }

        .diff-chip {
          background: rgba(206, 130, 255, 0.2);
          color: var(--purple-primary);
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 0.72rem;
          font-weight: 800;
        }

        .status-dot {
          font-size: 0.75rem;
          color: var(--green-primary);
          font-weight: 700;
        }

        .header-game-hud {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .hud-metric {
          display: flex;
          flex-direction: column;
          align-items: center;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          padding: 4px 10px;
          border-radius: 10px;
        }

        .hud-label {
          font-size: 0.65rem;
          font-weight: 800;
          color: var(--text-sub);
        }

        .hud-val {
          font-size: 0.95rem;
          font-weight: 900;
          color: var(--text-main);
        }

        .hud-metric.tokens .hud-val {
          color: #ffc800;
        }

        .finish-session-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #ffc800, #ff9600);
          color: #000;
          border: none;
          font-weight: 900;
          font-size: 0.8rem;
          padding: 8px 14px;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 10px rgba(255, 200, 0, 0.25);
          transition: transform 0.15s ease;
        }

        .finish-session-btn:hover {
          transform: translateY(-2px);
        }

        /* Message List */
        .chat-messages-list {
          flex: 1;
          padding: 18px 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .chat-message-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-width: 85%;
        }

        .chat-message-group.user {
          align-self: flex-end;
          align-items: flex-end;
        }

        .chat-message-group.ai {
          align-self: flex-start;
          align-items: flex-start;
        }

        .chat-message-bubble {
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }

        .msg-content {
          background: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          font-weight: 700;
          line-height: 1.45;
        }

        .chat-message-bubble.user .msg-content {
          background: var(--purple-primary);
          color: #fff;
          border-color: #a855f7;
        }

        .speak-msg-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Turn Scorecard HUD */
        .turn-scorecard {
          width: 100%;
          background: var(--bg-primary);
          border: 1.5px solid var(--border-color);
          border-radius: 14px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
        }

        .turn-scorecard.passed {
          border-color: rgba(88, 204, 2, 0.4);
        }

        .turn-scorecard.failed {
          border-color: rgba(255, 75, 75, 0.4);
          background: rgba(255, 75, 75, 0.04);
        }

        .scorecard-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .scorecard-grade {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .grade-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 2px solid;
          font-weight: 900;
          font-size: 1.05rem;
        }

        .grade-text {
          display: flex;
          flex-direction: column;
        }

        .grade-text strong {
          font-size: 0.95rem;
          color: var(--text-main);
        }

        .grade-text span {
          font-size: 0.75rem;
          color: var(--text-sub);
          font-weight: 700;
        }

        .token-won-tag {
          background: rgba(255, 200, 0, 0.15);
          color: #ffc800;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 0.8rem;
          border: 1px solid rgba(255, 200, 0, 0.3);
        }

        .token-zero-tag {
          background: rgba(255, 75, 75, 0.15);
          color: #ff4b4b;
          padding: 4px 10px;
          border-radius: 12px;
          font-weight: 800;
          font-size: 0.78rem;
        }

        .pillars-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding-top: 4px;
          border-top: 1px dashed var(--border-color);
        }

        .pillar-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .pillar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.72rem;
          color: var(--text-sub);
          font-weight: 700;
        }

        .pillar-bar {
          height: 5px;
          background: var(--bg-card);
          border-radius: 6px;
          overflow: hidden;
        }

        .pillar-fill {
          height: 100%;
          border-radius: 6px;
        }

        /* Correction Box */
        .correction-box {
          background: rgba(0, 0, 0, 0.25);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 10px 12px;
          margin-top: 4px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .corr-header {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
        }

        .corr-sentence {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .corr-label {
          font-size: 0.75rem;
          color: var(--text-sub);
          font-weight: 800;
        }

        .corr-text {
          font-size: 0.9rem;
          font-weight: 800;
          color: #58cc02;
          background: rgba(88, 204, 2, 0.1);
          padding: 4px 8px;
          border-radius: 6px;
        }

        .corr-explanation {
          margin: 0;
          font-size: 0.8rem;
          color: var(--text-sub);
          line-height: 1.4;
        }

        .typing-dots {
          font-style: italic;
          font-size: 0.85rem;
          color: var(--text-sub);
        }

        /* Prompts Bar */
        .prompts-bar {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          overflow-x: auto;
          background: rgba(0, 0, 0, 0.15);
          border-top: 1px solid var(--border-color);
        }

        .prompts-label {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-sub);
          white-space: nowrap;
        }

        .prompt-chip {
          white-space: nowrap;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 5px 10px;
          border-radius: 12px;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--text-sub);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .prompt-chip:hover {
          color: var(--text-main);
          border-color: var(--purple-primary);
        }

        /* Input Bar */
        .chat-input-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          border-top: 2px solid var(--border-color);
          background: var(--bg-card);
        }

        .chat-input-bar input {
          flex: 1;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-weight: 700;
          outline: none;
        }

        .chat-input-bar input:focus {
          border-color: var(--purple-primary);
        }

        .mic-chat-btn, .send-chat-btn {
          background: var(--purple-primary);
          border: none;
          color: #fff;
          padding: 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.15s ease;
        }

        .send-chat-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mic-chat-btn.active {
          background: var(--red-primary);
          animation: pulse 1s infinite;
        }

        /* Summary Scorecard Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 20px;
        }

        .summary-card {
          width: 100%;
          max-width: 520px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          text-align: center;
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4);
        }

        .summary-header h2 {
          font-size: 1.4rem;
          font-weight: 900;
          margin: 6px 0 2px 0;
          color: var(--text-main);
        }

        .summary-header p {
          margin: 0;
          color: var(--text-sub);
          font-weight: 700;
          font-size: 0.88rem;
        }

        .overall-grade-showcase {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          padding: 16px;
          background: var(--bg-primary);
          border-radius: 14px;
          border: 1px solid var(--border-color);
        }

        .grade-big-circle {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          border: 4px solid;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          font-weight: 900;
        }

        .overall-score-texts {
          text-align: left;
        }

        .overall-score-texts h3 {
          margin: 0 0 4px 0;
          font-size: 1.2rem;
          color: var(--text-main);
          font-weight: 900;
        }

        .grade-desc-pill {
          padding: 3px 8px;
          border-radius: 8px;
          font-size: 0.76rem;
          font-weight: 800;
          display: inline-block;
          margin-bottom: 4px;
        }

        .overall-score-texts p {
          margin: 0;
          font-size: 0.78rem;
          color: var(--text-sub);
        }

        .summary-token-reward {
          background: rgba(255, 200, 0, 0.12);
          border: 1px solid rgba(255, 200, 0, 0.3);
          padding: 12px;
          border-radius: 12px;
        }

        .token-won-large {
          font-size: 1.1rem;
          font-weight: 900;
          color: #ffc800;
          display: block;
        }

        .summary-token-reward p {
          margin: 4px 0 0 0;
          font-size: 0.8rem;
          color: var(--text-sub);
        }

        .summary-pillars {
          display: flex;
          flex-direction: column;
          gap: 8px;
          text-align: left;
          background: var(--bg-primary);
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }

        .summary-pillars h4 {
          margin: 0 0 4px 0;
          font-size: 0.82rem;
          color: var(--text-sub);
          text-transform: uppercase;
        }

        .summary-pillar-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: var(--text-main);
          font-weight: 700;
        }

        .title-progress-box {
          display: flex;
          flex-direction: column;
          gap: 6px;
          text-align: left;
        }

        .title-header-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.82rem;
          color: var(--text-sub);
        }

        .sub-progress-text {
          font-size: 0.75rem;
          color: #ffc800;
          font-weight: 700;
          text-align: right;
        }

        .summary-actions {
          display: flex;
          gap: 10px;
        }

        .summary-actions button {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
