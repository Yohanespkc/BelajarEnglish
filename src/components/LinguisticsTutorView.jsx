import React, { useState, useEffect, useRef } from 'react';
import { 
  BookMarked, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Compass, 
  Layers, 
  MessageCircle, 
  Zap, 
  Scale, 
  AlertCircle,
  Globe
} from 'lucide-react';
import { linguisticsTutorService, QUICK_LINGUISTICS_QUESTIONS } from '../services/linguisticsTutorService';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { activityLoggerService } from '../services/activityLoggerService';

export default function LinguisticsTutorView({ _userState, onAddXp }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('lingo_linguistics_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputQuery, setInputQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemma3:4b');
  const [availableModels, setAvailableModels] = useState(['gemma3:4b', 'gemma4:latest', 'gpt-oss:20b']);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [playingAudioKey, setPlayingAudioKey] = useState(null);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    linguisticsTutorService.getAvailableModels().then((models) => {
      if (models && models.length > 0) {
        setAvailableModels(models);
        if (models.includes('gemma3:4b')) setSelectedModel('gemma3:4b');
        else if (models.includes('gemma4:latest')) setSelectedModel('gemma4:latest');
        else setSelectedModel(models[0]);
      }
    });
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lingo_linguistics_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save linguistics history', e);
    }
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSpeak = (text, key) => {
    soundService.playClick();
    if (playingAudioKey === key) {
      speechService.stop();
      setPlayingAudioKey(null);
    } else {
      setPlayingAudioKey(key);
      speechService.speak(text, {
        onEnd: () => setPlayingAudioKey(null),
        onError: () => setPlayingAudioKey(null)
      });
    }
  };

  const handleCopy = (text, id) => {
    soundService.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (window.confirm('Hapus semua riwayat tanya linguistik & grammar?')) {
      soundService.playClick();
      setMessages([]);
      localStorage.removeItem('lingo_linguistics_history');
    }
  };

  const handleVoiceToggle = () => {
    soundService.playClick();
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      speechService.startListening({
        onResult: (transcript, isFinal) => {
          setInputQuery(transcript);
          if (isFinal) {
            setIsListening(false);
          }
        },
        onError: () => setIsListening(false)
      });
    }
  };

  const handleApplyQuickQuery = (item) => {
    soundService.playClick();
    setInputQuery(item.query);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const query = inputQuery.trim();
    if (!query || isLoading) return;

    soundService.playClick();
    const userMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const result = await linguisticsTutorService.askLinguisticsTutor({
        query,
        model: selectedModel
      });

      soundService.playGem();
      if (onAddXp) onAddXp(20);

      const aiMsg = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        data: result.data,
        modelUsed: result.modelUsed,
        warning: result.warning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Log progress activity
      activityLoggerService.logActivity({
        type: 'linguistics',
        title: `Tanya Kata & Grammar: "${result.data.title || query}"`,
        detail: result.data.coreDefinition || `Membahas etimologi, asal-usul kata, turunan morfologi, dan idiom dari "${query}".`,
        score: 100,
        xpEarned: 20,
        metadata: { query, title: result.data.title }
      });
    } catch (err) {
      soundService.playWrong();
      const errResponse = {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        error: true,
        text: 'Maaf, terjadi kesalahan saat menghubungi AI Tutor: ' + (err.message || 'Unknown error'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="linguistics-view-container" style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '24px 20px 40px 20px',
      minHeight: 'calc(100vh - 80px)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header Bar */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
        border: '2px solid var(--border-color)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1cb0f6, #0284c7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(28, 176, 246, 0.35)',
            color: '#fff'
          }}>
            <BookMarked size={28} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Tanya Bahasa Inggris: Linguistik, Etimologi & Grammar
              </h1>
              <span style={{
                background: 'rgba(28, 176, 246, 0.15)',
                color: '#1cb0f6',
                border: '1px solid #1cb0f6',
                borderRadius: '20px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                AI TUTOR
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
              Eksplorasi mendalam: definisi, asal-usul kata (etimologi), turunan kata, contoh kalimat konteks, idiom, dan slang.
            </p>
          </div>
        </div>

        {/* Model and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(32, 53, 64, 0.6)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)',
            fontSize: '0.82rem'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#1cb0f6',
              boxShadow: '0 0 8px #1cb0f6',
              display: 'inline-block'
            }} />
            <span style={{ color: 'var(--text-sub)' }}>Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--text-main)',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.82rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {availableModels.map(m => (
                <option key={m} value={m} style={{ background: '#182830', color: '#fff' }}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              title="Bersihkan riwayat percakapan"
              style={{
                background: 'rgba(255, 75, 75, 0.1)',
                border: '1px solid rgba(255, 75, 75, 0.3)',
                color: '#ff4b4b',
                padding: '7px 12px',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Trash2 size={15} />
              <span>Bersihkan</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Questions Banner */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '12px 16px',
        border: '2px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={16} color="#ffc800" />
          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            💡 Pertanyaan Populer (Klik untuk Tanya Langsung):
          </span>
        </div>
        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {QUICK_LINGUISTICS_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyQuickQuery(q)}
              style={{
                background: 'var(--bg-card-hover)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '7px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.82rem',
                fontWeight: 700,
                color: 'var(--text-main)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#1cb0f6';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.transform = 'none';
              }}
            >
              <span style={{
                background: 'rgba(28, 176, 246, 0.15)',
                color: '#1cb0f6',
                padding: '2px 6px',
                borderRadius: '6px',
                fontSize: '0.7rem'
              }}>
                {q.badge}
              </span>
              <span>{q.topic}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          minHeight: '400px',
          maxHeight: '640px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          padding: '8px 4px'
        }}
      >
        {messages.length === 0 ? (
          /* Empty State Guide */
          <div style={{
            background: 'var(--bg-card)',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '40px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #1cb0f6, #0284c7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(28, 176, 246, 0.35)',
              fontSize: '32px'
            }}>
              🔍
            </div>

            <div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                Tanyakan Apa Saja Tentang Bahasa Inggris!
              </h2>
              <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
                Ketikkan kata apa pun (misal: <strong>"apa itu bright"</strong>) atau topik grammar (seperti <em>"bedanya affect vs effect"</em>). AI Tutor akan membedah definisi, fonetik, asal-usul kata (etimologi), turunan kata, contoh dalam berbagai konteks, idiom, hingga slang bahasa gaul.
              </p>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px',
              marginTop: '8px'
            }}>
              <div style={{
                background: 'rgba(28, 176, 246, 0.08)',
                border: '1px solid rgba(28, 176, 246, 0.25)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-main)'
              }}>
                📜 <strong>Asal Kata (Etimologi)</strong>
              </div>
              <div style={{
                background: 'rgba(88, 204, 2, 0.08)',
                border: '1px solid rgba(88, 204, 2, 0.25)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-main)'
              }}>
                🌿 <strong>Keluarga & Turunan Kata</strong>
              </div>
              <div style={{
                background: 'rgba(206, 130, 255, 0.08)',
                border: '1px solid rgba(206, 130, 255, 0.25)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-main)'
              }}>
                🎭 <strong>Idiom & Phrasal Verbs</strong>
              </div>
              <div style={{
                background: 'rgba(255, 200, 0, 0.08)',
                border: '1px solid rgba(255, 200, 0, 0.25)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.84rem',
                color: 'var(--text-main)'
              }}>
                🔥 <strong>Slang & Kultur Gaul</strong>
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          messages.map((msg) => {
            if (msg.sender === 'user') {
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <div style={{
                    maxWidth: '75%',
                    background: '#58cc02',
                    color: '#ffffff',
                    borderRadius: '18px 18px 4px 18px',
                    padding: '12px 18px',
                    boxShadow: '0 4px 0 #46a302',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85, textAlign: 'right' }}>{msg.timestamp}</span>
                    <p style={{ margin: 0, fontSize: '0.98rem', fontWeight: 700, lineHeight: 1.4 }}>
                      {msg.query}
                    </p>
                  </div>
                </div>
              );
            }

            if (msg.error) {
              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{
                    background: 'rgba(255, 75, 75, 0.15)',
                    border: '2px solid #ff4b4b',
                    borderRadius: '18px 18px 18px 4px',
                    padding: '14px 18px',
                    color: '#ff4b4b',
                    maxWidth: '85%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <AlertCircle size={20} />
                    <span>{msg.text}</span>
                  </div>
                </div>
              );
            }

            const data = msg.data;
            if (!data) return null;

            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '22px',
                  padding: '22px 24px',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px'
                }}>
                  {/* Top Word Banner */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(28, 176, 246, 0.12), rgba(206, 130, 255, 0.12))',
                    border: '2px solid #1cb0f6',
                    borderRadius: '18px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
                          {data.title}
                        </h2>

                        {data.phonetic && (
                          <button
                            onClick={() => handleSpeak(data.title.replace(/\(.*?\)/g, '').trim(), `title_${msg.id}`)}
                            title="Dengarkan pelafalan kata"
                            style={{
                              background: playingAudioKey === `title_${msg.id}` ? '#1cb0f6' : 'var(--bg-card)',
                              color: playingAudioKey === `title_${msg.id}` ? '#fff' : '#1cb0f6',
                              border: '1px solid #1cb0f6',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '0.85rem',
                              fontWeight: 700
                            }}
                          >
                            <Volume2 size={16} />
                            <span>{data.phonetic}</span>
                          </button>
                        )}

                        {data.partOfSpeech && (
                          <span style={{
                            background: 'rgba(206, 130, 255, 0.18)',
                            color: '#ce82ff',
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            border: '1px solid rgba(206, 130, 255, 0.3)'
                          }}>
                            {data.partOfSpeech}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                          onClick={() => handleCopy(data.coreDefinition || data.title, `def_${msg.id}`)}
                          style={{
                            background: copiedId === `def_${msg.id}` ? '#58cc02' : 'var(--bg-card)',
                            color: copiedId === `def_${msg.id}` ? '#fff' : 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          {copiedId === `def_${msg.id}` ? <Check size={14} /> : <Copy size={14} />}
                          <span>{copiedId === `def_${msg.id}` ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Core Definition */}
                    <div style={{ fontSize: '0.98rem', color: 'var(--text-main)', lineHeight: 1.6, fontWeight: 600 }}>
                      📖 <strong>Definisi & Makna:</strong> {data.coreDefinition}
                    </div>
                  </div>

                  {/* Section 1: Etimologi & Asal-usul Kata */}
                  {data.etymology && (
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Compass size={18} color="#ff9600" />
                          <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ff9600', textTransform: 'uppercase' }}>
                            📜 Asal-usul Kata (Etimologi & Sejarah)
                          </span>
                        </div>
                        {data.etymology.rootLanguage && (
                          <span style={{
                            background: 'rgba(255, 150, 0, 0.15)',
                            color: '#ff9600',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: 700
                          }}>
                            {data.etymology.rootLanguage}
                          </span>
                        )}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                        {data.etymology.historicalStory}
                      </p>

                      {/* Sub-section: Bahasa yang Banyak Menggunakan Kata Ini Sekarang */}
                      {data.etymology.modernLanguagesUsed && data.etymology.modernLanguagesUsed.length > 0 && (
                        <div style={{
                          marginTop: '8px',
                          paddingTop: '12px',
                          borderTop: '1px dashed var(--border-color)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Globe size={16} color="#1cb0f6" />
                            <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#1cb0f6', textTransform: 'uppercase' }}>
                              🌍 Sekarang Banyak Dipakai di Bahasa Apa Saja? (Modern Languages & Cognates)
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '8px'
                          }}>
                            {data.etymology.modernLanguagesUsed.map((langItem, lIdx) => (
                              <div
                                key={lIdx}
                                style={{
                                  background: 'var(--bg-card)',
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  border: '1px solid var(--border-color)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
                                  <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.86rem' }}>
                                    {langItem.language}
                                  </span>
                                  {langItem.relation && (
                                    <span style={{
                                      background: 'rgba(28, 176, 246, 0.12)',
                                      color: '#1cb0f6',
                                      padding: '2px 6px',
                                      borderRadius: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700
                                    }}>
                                      {langItem.relation}
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                                  {langItem.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 2: Kata Turunan (Word Family / Morphology) */}
                  {data.wordFamily && data.wordFamily.length > 0 && (
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Layers size={18} color="#58cc02" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#58cc02', textTransform: 'uppercase' }}>
                          🌿 Kata Turunan (Word Family & Morfologi)
                        </span>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: '10px'
                      }}>
                        {data.wordFamily.map((wf, wIdx) => (
                          <div
                            key={wIdx}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '10px',
                              padding: '10px 12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>
                                {wf.role}
                              </span>
                              <button
                                onClick={() => handleSpeak(wf.word, `wf_${msg.id}_${wIdx}`)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  color: '#1cb0f6',
                                  padding: 0
                                }}
                              >
                                <Volume2 size={14} />
                              </button>
                            </div>
                            <div style={{ fontSize: '1rem', fontWeight: 800, color: '#58cc02' }}>
                              {wf.word}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                              {wf.meaning}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 3: Berbagai Contoh Kalimat Berdasarkan Konteks */}
                  {data.exampleSentences && data.exampleSentences.length > 0 && (
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MessageCircle size={18} color="#1cb0f6" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1cb0f6', textTransform: 'uppercase' }}>
                          💬 Contoh Kalimat Berbagai Konteks
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {data.exampleSentences.map((ex, eIdx) => (
                          <div
                            key={eIdx}
                            style={{
                              background: 'var(--bg-card)',
                              borderLeft: '4px solid #1cb0f6',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{
                                background: 'rgba(28, 176, 246, 0.12)',
                                color: '#1cb0f6',
                                padding: '2px 8px',
                                borderRadius: '6px',
                                fontSize: '0.74rem',
                                fontWeight: 800
                              }}>
                                Konteks: {ex.context}
                              </span>
                              <button
                                onClick={() => handleSpeak(ex.english, `ex_${msg.id}_${eIdx}`)}
                                title="Dengarkan kalimat bahasa Inggris"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: '#1cb0f6',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700
                                }}
                              >
                                <Volume2 size={15} />
                                <span>Dengarkan</span>
                              </button>
                            </div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.4 }}>
                              "{ex.english}"
                            </div>
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                              Arti: {ex.indonesian}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 4: Idiom & Ungkapan Terkait */}
                  {data.idioms && data.idioms.length > 0 && (
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={18} color="#ce82ff" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ce82ff', textTransform: 'uppercase' }}>
                          🎭 Idiom & Ungkapan Populer
                        </span>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                        gap: '10px'
                      }}>
                        {data.idioms.map((idm, iIdx) => (
                          <div
                            key={iIdx}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: '#ce82ff' }}>
                                "{idm.idiom}"
                              </span>
                              <button
                                onClick={() => handleSpeak(idm.idiom, `idm_${msg.id}_${iIdx}`)}
                                style={{ background: 'transparent', border: 'none', color: '#ce82ff', cursor: 'pointer' }}
                              >
                                <Volume2 size={15} />
                              </button>
                            </div>
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontWeight: 600 }}>
                              {idm.meaning}
                            </div>
                            {idm.example && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-sub)', borderTop: '1px dashed var(--border-color)', paddingTop: '6px' }}>
                                <em>Contoh: "{idm.example}"</em>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Section 5: Slang & Bahasa Gaul Modern */}
                  {data.slangAndModernUse && (
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles size={18} color="#ffc800" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ffc800', textTransform: 'uppercase' }}>
                          🔥 Slang, Kiasan & Penggunaan Gaul Modern
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                        {data.slangAndModernUse.explanation}
                      </p>
                      {data.slangAndModernUse.examples && data.slangAndModernUse.examples.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                          {data.slangAndModernUse.examples.map((slg, sIdx) => (
                            <div
                              key={sIdx}
                              style={{
                                background: 'var(--bg-card)',
                                borderRadius: '8px',
                                padding: '8px 12px',
                                fontSize: '0.85rem'
                              }}
                            >
                              <strong style={{ color: '#ffc800' }}>"{slg.phrase}":</strong>{' '}
                              <span style={{ color: 'var(--text-sub)' }}>{slg.meaning}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Section 6: Perbedaan Nuansa Sinonim */}
                  {data.synonymNuances && data.synonymNuances.length > 0 && (
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      border: '1px solid var(--border-color)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Scale size={18} color="#00d26a" />
                        <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#00d26a', textTransform: 'uppercase' }}>
                          ⚖️ Perbandingan Nuansa Sinonim (Semantic Differences)
                        </span>
                      </div>
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                        gap: '8px'
                      }}>
                        {data.synonymNuances.map((syn, synIdx) => (
                          <div
                            key={synIdx}
                            style={{
                              background: 'var(--bg-card)',
                              border: '1px solid var(--border-color)',
                              borderRadius: '8px',
                              padding: '10px 12px',
                              fontSize: '0.85rem'
                            }}
                          >
                            <span style={{ fontWeight: 800, color: '#00d26a' }}>{syn.word}:</span>{' '}
                            <span style={{ color: 'var(--text-sub)' }}>{syn.nuance}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Bottom Footer Info */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                    <span>Engine: {msg.modelUsed || 'Ollama'}</span>
                    <span>Waktu: {msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Spinner */}
        {isLoading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              borderRadius: '18px 18px 18px 4px',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <RefreshCw size={22} color="#1cb0f6" style={{
                animation: 'spin 1.2s linear infinite'
              }} />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  AI Linguist sedang menyusun analisis mendalam...
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                  Membedah etimologi, kelas kata, morfologi, idiom, dan nuansa semantik.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Bar */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '14px 18px',
        border: '2px solid var(--border-color)',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan kata atau grammar (misal: 'apa itu bright', 'asal kata salary', 'bedanya which vs that')..."
              rows={2}
              style={{
                flex: 1,
                background: 'var(--bg-primary)',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                color: 'var(--text-main)',
                fontSize: '0.95rem',
                resize: 'none',
                outline: 'none',
                lineHeight: 1.5
              }}
              onFocus={(e) => e.target.style.borderColor = '#1cb0f6'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={isListening ? 'Berhenti bicara' : 'Bicara lewat suara (Voice Input)'}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: isListening ? '#ff4b4b' : 'var(--bg-card-hover)',
                color: isListening ? '#fff' : 'var(--text-main)',
                border: isListening ? '2px solid #ea2b2b' : '2px solid var(--border-color)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!inputQuery.trim() || isLoading}
              style={{
                height: '46px',
                padding: '0 22px',
                borderRadius: '14px',
                background: !inputQuery.trim() || isLoading ? 'var(--bg-card-hover)' : '#1cb0f6',
                color: !inputQuery.trim() || isLoading ? 'var(--text-sub)' : '#ffffff',
                border: !inputQuery.trim() || isLoading ? '2px solid var(--border-color)' : '2px solid #1899d6',
                boxShadow: !inputQuery.trim() || isLoading ? 'none' : '0 4px 0 #1899d6',
                cursor: !inputQuery.trim() || isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 800,
                fontSize: '0.92rem',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
            >
              <Send size={18} />
              <span>Tanya AI</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-sub)' }}>
            <span>Tekan <strong>Enter</strong> untuk bertanya, <strong>Shift + Enter</strong> untuk baris baru.</span>
            <span>Didukung Local AI & Database Linguistik Dwibahasa.</span>
          </div>
        </form>
      </div>
    </div>
  );
}
