import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Send, 
  ArrowRightLeft, 
  Trash2, 
  Copy, 
  Check, 
  Sparkles, 
  Cpu, 
  Globe,
  Bot,
  Users,
  Zap
} from 'lucide-react';
import { 
  translateOffline, 
  generateLocalAiResponse,
  OfflineSpeechRecognition, 
  speakText, 
  stopSpeech 
} from '../services/localTranslatorService';
import { soundService } from '../services/soundService';
import IndonesianEnglishWordExplorer from './IndonesianEnglishWordExplorer';

export default function LocalTranslatorView({ userState, onAddXp }) {
  // Sub-view toggle: 'explorer' (Kamus Padanan & Nuansa ID➔EN) | 'dialog' (Penerjemah Percakapan)
  const [subTab, setSubTab] = useState('explorer');

  // Mode selection: 'human' (Dual Human) or 'ai' (Human vs AI Partner)
  const [partnerMode, setPartnerMode] = useState('ai'); // Default to AI Partner mode

  // Speaker A & B Language setup
  const [langA, setLangA] = useState({ code: 'id-ID', label: 'Bahasa Indonesia', flag: '🇮🇩' });
  const [langB, setLangB] = useState({ code: 'en-US', label: 'English', flag: '🇺🇸' });

  // Input states for Speaker A and B
  const [inputA, setInputA] = useState('');
  const [inputB, setInputB] = useState('');

  // Active speaker listening state ('A', 'B', or null)
  const [listeningSpeaker, setListeningSpeaker] = useState(null);
  const [interimText, setInterimText] = useState('');
  const [liveTranslationText, setLiveTranslationText] = useState('');

  // Conversation history
  const [history, setHistory] = useState([
    {
      id: 1,
      speaker: 'A',
      speakerName: 'Pembicara A (Anda)',
      originalText: 'Halo! Saya ingin berlatih bahasa Inggris hari ini.',
      translatedText: 'Hello! I want to practice English today.',
      fromLang: 'Bahasa Indonesia',
      toLang: 'English',
      timestamp: '10:00 AM'
    },
    {
      id: 2,
      speaker: 'B',
      isAi: true,
      speakerName: 'AI Partner (English Bot)',
      originalText: 'Hello there! It is wonderful to talk to you. How can I assist you with your English today?',
      translatedText: 'Halo di sana! Senang sekali bisa berbicara dengan Anda. Bagaimana saya bisa membantu Bahasa Inggris Anda hari ini?',
      fromLang: 'English',
      toLang: 'Bahasa Indonesia',
      timestamp: '10:01 AM'
    }
  ]);

  const [copiedId, setCopiedId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const speechRecognizerRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    speechRecognizerRef.current = new OfflineSpeechRecognition();
    return () => {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.stop();
      }
      stopSpeech();
    };
  }, []);

  // Live real-time translation preview when interim text changes
  useEffect(() => {
    if (interimText && interimText.trim()) {
      const sourceLang = listeningSpeaker === 'A' ? 'id' : 'en';
      const liveTrans = translateOffline(interimText, sourceLang);
      setLiveTranslationText(liveTrans);
    } else {
      setLiveTranslationText('');
    }
  }, [interimText, listeningSpeaker]);

  // Auto scroll conversation history
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history, listeningSpeaker, interimText, liveTranslationText]);

  // Swap Languages A & B
  const handleSwapLanguages = () => {
    soundService.playClick();
    const temp = langA;
    setLangA(langB);
    setLangB(temp);
  };

  // Process Translation for a given speaker and text
  const processTranslation = (speaker, text, fromLang, toLang) => {
    if (!text || !text.trim()) return;

    setIsProcessing(true);
    soundService.playClick();

    setTimeout(() => {
      // Local AI Offline Translation Engine
      const sourceLangCode = fromLang.code.startsWith('id') ? 'id' : 'en';
      const translation = translateOffline(text, sourceLangCode);

      const newItem = {
        id: Date.now(),
        speaker,
        isAi: speaker === 'B' && partnerMode === 'ai',
        speakerName: speaker === 'A' ? `Pembicara A (${fromLang.label})` : (partnerMode === 'ai' ? 'AI Partner (Bot)' : `Pembicara B (${fromLang.label})`),
        originalText: text.trim(),
        translatedText: translation,
        fromLang: fromLang.label,
        toLang: toLang.label,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setHistory((prev) => [...prev, newItem]);
      setIsProcessing(false);

      // Play audio of the translated output automatically (TTS)
      speakText(translation, toLang.code);

      // Reward XP for practicing translation
      if (onAddXp) {
        onAddXp(5);
      }

      // If in AI Partner mode and Speaker A just spoke, generate AI Bot Response automatically!
      if (partnerMode === 'ai' && speaker === 'A') {
        triggerAiBotResponse(text);
      }
    }, 300);
  };

  // Trigger Automatic AI Bot Response (Offline AI Knowledge)
  const triggerAiBotResponse = (userQueryText) => {
    setTimeout(() => {
      const aiResponse = generateLocalAiResponse(userQueryText);
      
      const aiItem = {
        id: Date.now() + 1,
        speaker: 'B',
        isAi: true,
        speakerName: 'AI Partner (Bot)',
        originalText: aiResponse.englishText,
        translatedText: aiResponse.indonesianText,
        fromLang: 'English',
        toLang: 'Bahasa Indonesia',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setHistory((prev) => [...prev, aiItem]);

      // Speak out AI response in English
      speakText(aiResponse.englishText, 'en-US');
    }, 800);
  };

  // Start Speech Recognition for Speaker A or B
  const startListening = (speaker) => {
    soundService.playClick();
    stopSpeech();

    const currentLang = speaker === 'A' ? langA : langB;
    setListeningSpeaker(speaker);
    setInterimText('');
    setLiveTranslationText('');

    if (speechRecognizerRef.current && speechRecognizerRef.current.isSupported) {
      speechRecognizerRef.current.start({
        lang: currentLang.code,
        onResult: ({ final, interim }) => {
          if (interim) {
            setInterimText(interim);
          }
          if (final) {
            setInterimText('');
            setLiveTranslationText('');
            stopListening();
            const targetLang = speaker === 'A' ? langB : langA;
            processTranslation(speaker, final, currentLang, targetLang);
          }
        },
        onError: (err) => {
          console.warn("Speech error:", err);
          stopListening();
          const manualText = speaker === 'A' ? inputA : inputB;
          if (manualText) {
            const targetLang = speaker === 'A' ? langB : langA;
            processTranslation(speaker, manualText, currentLang, targetLang);
            if (speaker === 'A') setInputA('');
            if (speaker === 'B') setInputB('');
          }
        },
        onEnd: () => {
          setListeningSpeaker(null);
        }
      });
    } else {
      // Fallback if Speech API not supported
      const manualText = speaker === 'A' ? inputA : inputB;
      const targetLang = speaker === 'A' ? langB : langA;
      if (manualText.trim()) {
        processTranslation(speaker, manualText, currentLang, targetLang);
        if (speaker === 'A') setInputA('');
        if (speaker === 'B') setInputB('');
      } else {
        alert("Web Speech API tidak didukung browser ini. Silakan ketik kalimat pada kolom input dan tekan Terjemahkan.");
      }
      setListeningSpeaker(null);
    }
  };

  // Stop active listening
  const stopListening = () => {
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.stop();
    }
    setListeningSpeaker(null);
    setInterimText('');
    setLiveTranslationText('');
  };

  // Handle Manual Form Submit for Speaker A or B
  const handleManualSubmit = (e, speaker) => {
    e.preventDefault();
    const text = speaker === 'A' ? inputA : inputB;
    const fromLang = speaker === 'A' ? langA : langB;
    const toLang = speaker === 'A' ? langB : langA;

    if (!text.trim()) return;

    processTranslation(speaker, text, fromLang, toLang);
    if (speaker === 'A') setInputA('');
    if (speaker === 'B') setInputB('');
  };

  // Copy translated text
  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    soundService.playClick();
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Clear history log
  const handleClearHistory = () => {
    soundService.playClick();
    if (confirm("Hapus seluruh riwayat percakapan terjemahan?")) {
      setHistory([]);
    }
  };

  return (
    <div className="translator-container">
      {/* Top Feature Switcher: Kamus Padanan & Nuansa vs Dialog Translator */}
      <div className="translator-feature-tabs">
        <button
          type="button"
          className={`feature-tab-btn ${subTab === 'explorer' ? 'active explorer' : ''}`}
          onClick={() => {
            soundService.playClick();
            setSubTab('explorer');
          }}
        >
          <Sparkles size={16} />
          <span className="tab-title">Kamus Padanan & Nuansa (ID ➔ EN)</span>
          <span className="tab-pill-mini">PILIHAN KATA TEPAT ✨</span>
        </button>

        <button
          type="button"
          className={`feature-tab-btn ${subTab === 'dialog' ? 'active dialog' : ''}`}
          onClick={() => {
            soundService.playClick();
            setSubTab('dialog');
          }}
        >
          <ArrowRightLeft size={16} />
          <span className="tab-title">Penerjemah Percakapan Live</span>
          <span className="tab-pill-mini secondary">DUAL SPEAKER</span>
        </button>
      </div>

      {subTab === 'explorer' ? (
        <IndonesianEnglishWordExplorer onAddXp={onAddXp} />
      ) : (
        <>
          {/* Header Banner */}
          <header className="translator-header">
        <div className="header-left">
          <div className="translator-icon-badge">
            <Cpu size={28} color="#58cc02" />
          </div>
          <div>
            <div className="badge-offline">
              <span className="pulse-dot"></span> 100% LOCAL AI OFFLINE
            </div>
            <h1 className="header-title">Live Dual-Speaker & AI Translator</h1>
            <p className="header-desc">
              Bicara dalam Bahasa Indonesia, terjemahan langsung tampil di layar secara real-time. Pihak kedua bisa berupa Manusia atau AI yang menjawab pertanyaan.
            </p>
          </div>
        </div>

        <div className="header-actions">
          <button onClick={handleClearHistory} className="btn-clear-history" title="Hapus Riwayat">
            <Trash2 size={18} />
            <span>Reset Chat</span>
          </button>
        </div>
      </header>

      {/* Mode Switcher Bar */}
      <div className="mode-switcher-card">
        <span className="mode-label">Pilih Mode Pihak Kedua:</span>
        <div className="mode-toggle-group">
          <button 
            onClick={() => { soundService.playClick(); setPartnerMode('ai'); }}
            className={`btn-mode ${partnerMode === 'ai' ? 'active' : ''}`}
          >
            <Bot size={18} />
            <span>🤖 Mode AI Partner (Menjawab Pertanyaan)</span>
          </button>

          <button 
            onClick={() => { soundService.playClick(); setPartnerMode('human'); }}
            className={`btn-mode ${partnerMode === 'human' ? 'active' : ''}`}
          >
            <Users size={18} />
            <span>👥 Mode 2 Manusia (Bicara Bergantian)</span>
          </button>
        </div>
      </div>

      {/* Language Selector Bar */}
      <div className="lang-bar">
        <div className="lang-box lang-a">
          <span className="lang-flag">{langA.flag}</span>
          <span className="lang-role">Pembicara A (Anda):</span>
          <strong className="lang-name">{langA.label}</strong>
        </div>

        <button onClick={handleSwapLanguages} className="btn-swap-lang" title="Tukar Bahasa">
          <ArrowRightLeft size={20} />
        </button>

        <div className="lang-box lang-b">
          <span className="lang-flag">{partnerMode === 'ai' ? '🤖' : langB.flag}</span>
          <span className="lang-role">Pihak Kedua:</span>
          <strong className="lang-name">{partnerMode === 'ai' ? 'AI Bot (English)' : langB.label}</strong>
        </div>
      </div>

      {/* Real-time Subtitle Banner Display (Layar Transkripsi & Terjemahan Langsung) */}
      {(interimText || liveTranslationText) && (
        <div className="realtime-subtitle-card">
          <div className="subtitle-header">
            <Zap size={18} color="#ffc800" className="pulse-icon" />
            <span>LIVE REAL-TIME TRANSLATION SUBTITLE</span>
          </div>

          <div className="subtitle-content">
            <div className="sub-line original">
              <span className="sub-label">🗣️ Bicara:</span>
              <span className="sub-text">"{interimText}"</span>
            </div>

            <div className="sub-line translated">
              <span className="sub-label">🔤 Terjemahan Langsung:</span>
              <span className="sub-text">"{liveTranslationText || 'Menerjemahkan...'}"</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Conversation Log Screen */}
      <div className="conversation-screen">
        {history.length === 0 ? (
          <div className="empty-state">
            <Globe size={48} color="var(--blue-primary)" />
            <h3>Belum Ada Percakapan</h3>
            <p>Tekan tombol "Bicara (A)" di bawah. Suara Anda akan langsung ditranskripsi dan diterjemahkan pada layar.</p>
          </div>
        ) : (
          <div className="chat-messages-list">
            {history.map((item) => (
              <div key={item.id} className={`chat-bubble-row speaker-${item.speaker.toLowerCase()} ${item.isAi ? 'is-ai-bot' : ''}`}>
                <div className="speaker-avatar">
                  {item.isAi ? '🤖 AI' : (item.speaker === 'A' ? '👤 A' : '👤 B')}
                </div>

                <div className="chat-content-box">
                  <div className="chat-bubble-header">
                    <span className="speaker-label">{item.speakerName}</span>
                    <span className="timestamp">{item.timestamp}</span>
                  </div>

                  {/* Original Text */}
                  <div className="original-text">
                    "{item.originalText}"
                  </div>

                  {/* Translated Output */}
                  <div className="translated-box">
                    <div className="translated-text">
                      <Sparkles size={16} color="#58cc02" className="sparkle-icon" />
                      <span>{item.translatedText}</span>
                    </div>

                    <div className="bubble-actions">
                      <button 
                        onClick={() => speakText(item.originalText, item.speaker === 'A' ? langA.code : langB.code)}
                        className="action-icon-btn"
                        title="Dengarkan Suara Asli"
                      >
                        <Volume2 size={16} />
                      </button>

                      <button 
                        onClick={() => handleCopy(item.id, item.translatedText)}
                        className="action-icon-btn"
                        title="Salin Terjemahan"
                      >
                        {copiedId === item.id ? <Check size={16} color="#58cc02" /> : <Copy size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>
        )}

        {/* Live Listening Feedback Overlay */}
        {listeningSpeaker && (
          <div className={`listening-overlay speaker-${listeningSpeaker.toLowerCase()}`}>
            <div className="listening-pulse">
              <Mic size={24} className="mic-animate" />
            </div>
            <div className="listening-info">
              <span>Mendengarkan {listeningSpeaker === 'A' ? `Pembicara A (${langA.label})` : `Pembicara B (${langB.label})`}...</span>
              <p className="interim-preview">{interimText || 'Silakan bicara sekarang...'}</p>
            </div>
            <button onClick={stopListening} className="btn-stop-listening">
              <MicOff size={18} /> Stop
            </button>
          </div>
        )}
      </div>

      {/* Dual Speaker Action Control Panel */}
      <div className="dual-speaker-controls">
        {/* Speaker A Action Area */}
        <div className="speaker-control-card card-speaker-a">
          <div className="card-top-info">
            <span className="speaker-title-badge color-a">PEMBICARA A ({langA.flag} {langA.label})</span>
          </div>

          <form onSubmit={(e) => handleManualSubmit(e, 'A')} className="input-form">
            <input
              type="text"
              placeholder={`Ketik pesan ${langA.label} atau tekan tombol bicara...`}
              value={inputA}
              onChange={(e) => setInputA(e.target.value)}
              className="text-input"
            />
            {inputA.trim() && (
              <button type="submit" className="btn-send-a">
                <Send size={16} />
              </button>
            )}
          </form>

          <button
            onClick={() => startListening('A')}
            disabled={listeningSpeaker === 'A' || isProcessing}
            className={`btn-action-speaker btn-speaker-a ${listeningSpeaker === 'A' ? 'active-listening' : ''}`}
          >
            <Mic size={22} />
            <span>{listeningSpeaker === 'A' ? 'Mendengarkan A...' : `Bicara (A) & Terjemahkan`}</span>
          </button>
        </div>

        {/* Speaker B / AI Partner Action Area */}
        <div className="speaker-control-card card-speaker-b">
          <div className="card-top-info">
            <span className="speaker-title-badge color-b">
              {partnerMode === 'ai' ? '🤖 PIHAK KEDUA (AI PARTNER BOT)' : `PEMBICARA B (${langB.flag} ${langB.label})`}
            </span>
          </div>

          {partnerMode === 'ai' ? (
            <div className="ai-info-box">
              <Bot size={28} color="#ce82ff" />
              <div>
                <strong>AI Partner Otomatis Aktif</strong>
                <p>Setiap kali Anda berbicara dalam Bahasa Indonesia (Pembicara A), AI akan langsung merespon dalam Bahasa Inggris & menerjemahkan ke layar!</p>
              </div>
            </div>
          ) : (
            <>
              <form onSubmit={(e) => handleManualSubmit(e, 'B')} className="input-form">
                <input
                  type="text"
                  placeholder={`Ketik pesan ${langB.label} atau tekan tombol bicara...`}
                  value={inputB}
                  onChange={(e) => setInputB(e.target.value)}
                  className="text-input"
                />
                {inputB.trim() && (
                  <button type="submit" className="btn-send-b">
                    <Send size={16} />
                  </button>
                )}
              </form>

              <button
                onClick={() => startListening('B')}
                disabled={listeningSpeaker === 'B' || isProcessing}
                className={`btn-action-speaker btn-speaker-b ${listeningSpeaker === 'B' ? 'active-listening' : ''}`}
              >
                <Mic size={22} />
                <span>{listeningSpeaker === 'B' ? 'Mendengarkan B...' : `Bicara (B) & Terjemahkan`}</span>
              </button>
            </>
          )}
        </div>
      </div>

      <style>{`
        .translator-container {
          max-width: 1000px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding-bottom: 40px;
        }

        /* Header Style */
        .translator-header {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .translator-icon-badge {
          background: rgba(88, 204, 2, 0.15);
          border: 2px solid #58cc02;
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .badge-offline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(88, 204, 2, 0.2);
          color: #58cc02;
          font-size: 0.75rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 20px;
          margin-bottom: 6px;
          letter-spacing: 0.5px;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          background: #58cc02;
          border-radius: 50%;
          box-shadow: 0 0 8px #58cc02;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.9); opacity: 0.8; }
          50% { transform: scale(1.3); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }

        .header-title {
          font-size: 1.6rem;
          font-weight: 900;
          margin: 0;
          color: var(--text-main);
        }

        .header-desc {
          font-size: 0.9rem;
          color: var(--text-sub);
          margin: 4px 0 0 0;
        }

        .btn-clear-history {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 75, 75, 0.1);
          color: #ff4b4b;
          border: 1px solid rgba(255, 75, 75, 0.3);
          padding: 10px 14px;
          border-radius: var(--radius-md);
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-clear-history:hover {
          background: #ff4b4b;
          color: #fff;
        }

        /* Mode Switcher Card */
        .mode-switcher-card {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 14px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .mode-label {
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .mode-toggle-group {
          display: flex;
          gap: 10px;
        }

        .btn-mode {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg-card-hover);
          border: 2px solid var(--border-color);
          color: var(--text-sub);
          padding: 10px 16px;
          border-radius: var(--radius-md);
          font-weight: 800;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-mode.active {
          background: rgba(206, 130, 255, 0.15);
          border-color: #ce82ff;
          color: #ce82ff;
        }

        /* Language Selector Bar */
        .lang-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          padding: 12px 20px;
          border-radius: var(--radius-lg);
          border: 2px solid var(--border-color);
        }

        .lang-box {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          background: var(--bg-card-hover);
        }

        .lang-box.lang-a {
          border-left: 4px solid #1cb0f6;
        }

        .lang-box.lang-b {
          border-left: 4px solid #ce82ff;
        }

        .lang-flag {
          font-size: 1.4rem;
        }

        .lang-role {
          font-size: 0.8rem;
          color: var(--text-sub);
          font-weight: 700;
        }

        .lang-name {
          font-size: 0.95rem;
          color: var(--text-main);
          font-weight: 900;
        }

        .btn-swap-lang {
          background: var(--bg-card-hover);
          border: 2px solid var(--border-color);
          color: var(--text-main);
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn-swap-lang:hover {
          transform: rotate(180deg);
          border-color: #58cc02;
          color: #58cc02;
        }

        /* Real-time Subtitle Display Banner */
        .realtime-subtitle-card {
          background: linear-gradient(135deg, rgba(255, 200, 0, 0.15) 0%, rgba(88, 204, 2, 0.15) 100%);
          border: 2px solid #ffc800;
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          animation: fadeIn 0.3s ease;
        }

        .subtitle-header {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 900;
          color: #ffc800;
          letter-spacing: 0.5px;
        }

        .subtitle-content {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sub-line {
          display: flex;
          gap: 8px;
          align-items: center;
          font-size: 1.05rem;
        }

        .sub-label {
          font-size: 0.85rem;
          font-weight: 800;
          color: var(--text-sub);
        }

        .sub-line.original .sub-text {
          font-weight: 700;
          color: var(--text-main);
        }

        .sub-line.translated .sub-text {
          font-weight: 900;
          color: #58cc02;
        }

        /* Conversation Screen */
        .conversation-screen {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          min-height: 380px;
          max-height: 480px;
          overflow-y: auto;
          padding: 24px;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .empty-state {
          margin: auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          color: var(--text-sub);
        }

        .empty-state h3 {
          margin: 0;
          color: var(--text-main);
          font-weight: 900;
        }

        .empty-state p {
          max-width: 400px;
          font-size: 0.9rem;
          margin: 0;
        }

        /* Chat Bubbles */
        .chat-messages-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chat-bubble-row {
          display: flex;
          gap: 14px;
          max-width: 85%;
        }

        .chat-bubble-row.speaker-a {
          align-self: flex-start;
        }

        .chat-bubble-row.speaker-b {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .speaker-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.85rem;
          flex-shrink: 0;
        }

        .speaker-a .speaker-avatar {
          background: rgba(28, 176, 246, 0.2);
          color: #1cb0f6;
          border: 2px solid #1cb0f6;
        }

        .speaker-b .speaker-avatar {
          background: rgba(206, 130, 255, 0.2);
          color: #ce82ff;
          border: 2px solid #ce82ff;
        }

        .chat-bubble-row.is-ai-bot .speaker-avatar {
          background: rgba(206, 130, 255, 0.3);
          color: #ce82ff;
          border: 2px solid #ce82ff;
          box-shadow: 0 0 10px rgba(206, 130, 255, 0.4);
        }

        .chat-content-box {
          background: var(--bg-card-hover);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 14px 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .speaker-a .chat-content-box {
          border-top-left-radius: 4px;
        }

        .speaker-b .chat-content-box {
          border-top-right-radius: 4px;
        }

        .chat-bubble-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .speaker-a .speaker-label { color: #1cb0f6; }
        .speaker-b .speaker-label { color: #ce82ff; }

        .timestamp {
          color: var(--text-sub);
          font-weight: 600;
        }

        .original-text {
          font-size: 0.95rem;
          color: var(--text-sub);
          font-style: italic;
        }

        .translated-box {
          background: rgba(88, 204, 2, 0.1);
          border: 1.5px solid rgba(88, 204, 2, 0.3);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
        }

        .translated-text {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .bubble-actions {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .action-icon-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .action-icon-btn:hover {
          background: var(--blue-primary);
          color: #fff;
          border-color: var(--blue-primary);
        }

        /* Listening Overlay */
        .listening-overlay {
          position: absolute;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--bg-card);
          border: 2px solid #58cc02;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
          border-radius: var(--radius-lg);
          padding: 14px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          z-index: 10;
        }

        .listening-pulse {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #58cc02;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: pulseMic 1s infinite alternate;
        }

        @keyframes pulseMic {
          from { transform: scale(1); box-shadow: 0 0 0 0 rgba(88, 204, 2, 0.4); }
          to { transform: scale(1.15); box-shadow: 0 0 0 12px rgba(88, 204, 2, 0); }
        }

        .listening-info span {
          font-weight: 800;
          font-size: 0.9rem;
          color: var(--text-main);
        }

        .interim-preview {
          margin: 2px 0 0 0;
          font-size: 0.85rem;
          color: #58cc02;
          font-weight: 700;
        }

        .btn-stop-listening {
          background: rgba(255, 75, 75, 0.15);
          color: #ff4b4b;
          border: 1px solid #ff4b4b;
          padding: 8px 14px;
          border-radius: var(--radius-md);
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        /* Dual Speaker Action Control Panel */
        .dual-speaker-controls {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .dual-speaker-controls {
            grid-template-columns: 1fr;
          }
        }

        .speaker-control-card {
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .card-speaker-a {
          border-top: 4px solid #1cb0f6;
        }

        .card-speaker-b {
          border-top: 4px solid #ce82ff;
        }

        .speaker-title-badge {
          font-size: 0.75rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: 0.5px;
        }

        .speaker-title-badge.color-a {
          background: rgba(28, 176, 246, 0.15);
          color: #1cb0f6;
        }

        .speaker-title-badge.color-b {
          background: rgba(206, 130, 255, 0.15);
          color: #ce82ff;
        }

        .ai-info-box {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(206, 130, 255, 0.1);
          border: 1.5px solid rgba(206, 130, 255, 0.3);
          border-radius: var(--radius-md);
          padding: 12px 16px;
        }

        .ai-info-box strong {
          display: block;
          font-size: 0.95rem;
          color: #ce82ff;
          margin-bottom: 2px;
        }

        .ai-info-box p {
          font-size: 0.8rem;
          color: var(--text-sub);
          margin: 0;
          line-height: 1.3;
        }

        .input-form {
          display: flex;
          gap: 8px;
        }

        .text-input {
          flex: 1;
          background: var(--bg-card-hover);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 10px 14px;
          color: var(--text-main);
          font-size: 0.9rem;
          font-weight: 600;
          outline: none;
          transition: all 0.2s ease;
        }

        .text-input:focus {
          border-color: #58cc02;
        }

        .btn-send-a {
          background: #1cb0f6;
          color: #fff;
          border: none;
          padding: 0 14px;
          border-radius: var(--radius-md);
          font-weight: 800;
          cursor: pointer;
        }

        .btn-send-b {
          background: #ce82ff;
          color: #fff;
          border: none;
          padding: 0 14px;
          border-radius: var(--radius-md);
          font-weight: 800;
          cursor: pointer;
        }

        .btn-action-speaker {
          width: 100%;
          padding: 16px;
          border-radius: var(--radius-lg);
          border: none;
          font-size: 1.05rem;
          font-weight: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }

        .btn-speaker-a {
          background: linear-gradient(135deg, #1cb0f6 0%, #0088cc 100%);
          color: #fff;
        }

        .btn-speaker-a:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(28, 176, 246, 0.4);
        }

        .btn-speaker-b {
          background: linear-gradient(135deg, #ce82ff 0%, #a100ff 100%);
          color: #fff;
        }

        .btn-speaker-b:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 18px rgba(206, 130, 255, 0.4);
        }

        .btn-action-speaker.active-listening {
          background: #58cc02;
          animation: pulseBtn 1s infinite alternate;
        }

        @keyframes pulseBtn {
          from { opacity: 0.85; }
          to { opacity: 1; }
        }
      `}</style>
        </>
      )}

      <style>{`
        /* Top Feature Sub-Tab Bar */
        .translator-feature-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
          background: rgba(0, 0, 0, 0.25);
          padding: 6px;
          border-radius: var(--radius-lg, 16px);
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
        }

        .feature-tab-btn {
          background: transparent;
          border: none;
          color: var(--text-sub, #94a3b8);
          padding: 12px 18px;
          border-radius: var(--radius-md, 12px);
          font-size: 0.92rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
        }

        .feature-tab-btn:hover {
          color: var(--text-main, #ffffff);
          background: rgba(255, 255, 255, 0.04);
        }

        .feature-tab-btn.active.explorer {
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.15), rgba(99, 102, 241, 0.15));
          color: #00e5ff;
          border: 1px solid rgba(0, 229, 255, 0.3);
          box-shadow: 0 4px 14px rgba(0, 229, 255, 0.15);
        }

        .feature-tab-btn.active.dialog {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15));
          color: #818cf8;
          border: 1px solid rgba(99, 102, 241, 0.3);
          box-shadow: 0 4px 14px rgba(99, 102, 241, 0.15);
        }

        .tab-pill-mini {
          font-size: 0.68rem;
          font-weight: 800;
          background: #f59e0b;
          color: #111;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .tab-pill-mini.secondary {
          background: rgba(255, 255, 255, 0.12);
          color: var(--text-sub, #94a3b8);
        }

        @media (max-width: 640px) {
          .translator-feature-tabs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
