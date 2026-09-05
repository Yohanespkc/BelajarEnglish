import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Info, 
  RefreshCw, 
  Sliders, 
  CheckCircle2,
  AlertCircle,
  Cpu,
  BookOpen
} from 'lucide-react';
import { aiEnglishEditorService, CONTEXT_MODES } from '../services/aiEnglishEditorService';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { activityLoggerService } from '../services/activityLoggerService';

const SAMPLE_PROMPTS = [
  {
    title: 'Becanda & Slang',
    contextId: 'humorous_casual',
    text: 'I very like playing game with my bro and he is very noob lol'
  },
  {
    title: 'Akademik Populer',
    contextId: 'academic_popular',
    text: 'We do research to make solar panel more good and cheaper for many peoples'
  },
  {
    title: 'Bisnis & Pekerjaan',
    contextId: 'business_formal',
    text: 'Can you send me the excel file quickly because our boss want to check it now'
  },
  {
    title: 'Percakapan Harian',
    contextId: 'daily_conversational',
    text: 'Yesterday I go to bookstore and buy coffee with my friend'
  }
];

export default function EnglishEditorChatbotView({ _userState, onAddXp }) {
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('lingo_editor_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [inputText, setInputText] = useState('');
  const [selectedContext, setSelectedContext] = useState('auto');
  const [selectedModel, setSelectedModel] = useState('gemma3:4b');
  const [availableModels, setAvailableModels] = useState(['gemma3:4b', 'gemma4:latest', 'gpt-oss:20b']);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState({});

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Load available models on mount
  useEffect(() => {
    aiEnglishEditorService.getAvailableModels().then((models) => {
      if (models && models.length > 0) {
        setAvailableModels(models);
        if (models.includes('gemma3:4b')) {
          setSelectedModel('gemma3:4b');
        } else if (models.includes('gemma4:latest')) {
          setSelectedModel('gemma4:latest');
        } else {
          setSelectedModel(models[0]);
        }
      }
    });
  }, []);

  // Save messages to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('lingo_editor_messages', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save messages to localStorage', e);
    }
  }, [messages]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleContextSelect = (ctxId) => {
    soundService.playClick();
    setSelectedContext(ctxId);
  };

  const handleToggleExplanation = (msgId) => {
    soundService.playClick();
    setExpandedExplanationIds((prev) => ({
      ...prev,
      [msgId]: !prev[msgId]
    }));
  };

  const handleCopyText = (text, id) => {
    soundService.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (text, id) => {
    soundService.playClick();
    if (playingAudioId === id) {
      speechService.stop();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      speechService.speak(text, {
        onEnd: () => setPlayingAudioId(null),
        onError: () => setPlayingAudioId(null)
      });
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (window.confirm('Hapus semua riwayat percakapan edit bahasa Inggris?')) {
      soundService.playClick();
      setMessages([]);
      localStorage.removeItem('lingo_editor_messages');
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
          setInputText(transcript);
          if (isFinal) {
            setIsListening(false);
          }
        },
        onError: () => setIsListening(false)
      });
    }
  };

  const handleApplySample = (sample) => {
    soundService.playClick();
    setInputText(sample.text);
    setSelectedContext(sample.contextId);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const text = inputText.trim();
    if (!text || isLoading) return;

    soundService.playClick();
    const currentContext = CONTEXT_MODES.find(c => c.id === selectedContext) || CONTEXT_MODES[0];
    
    const userMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text,
      contextMode: currentContext.id,
      contextLabel: currentContext.label,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const result = await aiEnglishEditorService.editEnglishText({
        text,
        contextMode: selectedContext,
        model: selectedModel
      });

      soundService.playGem();
      if (onAddXp) onAddXp(15);

      const aiResponse = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        data: result.data,
        modelUsed: result.modelUsed,
        warning: result.warning,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      // By default expand explanation for the latest response
      setExpandedExplanationIds(prev => ({ ...prev, [aiResponse.id]: true }));
      setMessages((prev) => [...prev, aiResponse]);

      // Log progress activity
      activityLoggerService.logActivity({
        type: 'editor',
        title: `Edit Teks Bahasa Inggris (${currentContext.label})`,
        detail: `"${text}" ➔ "${result.data.polishedText}"`,
        score: 95,
        xpEarned: 15,
        metadata: { context: currentContext.label, changes: result.data.changes?.length || 0 }
      });
    } catch (err) {
      soundService.playWrong();
      const errorMessage = {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        error: true,
        text: 'Maaf, terjadi kesalahan saat menghubungi AI: ' + (err.message || 'Unknown error'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMessage]);
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

  const activeContextMeta = CONTEXT_MODES.find(c => c.id === selectedContext) || CONTEXT_MODES[0];

  return (
    <div className="editor-container" style={{
      maxWidth: '1080px',
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
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #00d26a, #009949)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0, 210, 106, 0.35)',
            color: '#fff'
          }}>
            <Sparkles size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                AI English Editor & Coach
              </h1>
              <span style={{
                background: 'rgba(0, 210, 106, 0.15)',
                color: '#00d26a',
                border: '1px solid #00d26a',
                borderRadius: '20px',
                padding: '2px 8px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                PORT 6000
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
              Koreksi tulisan bahasa Inggris otomatis sesuai konteks + penjelasan alasan perubahan dalam bahasa Indonesia.
            </p>
          </div>
        </div>

        {/* Model & Status Bar */}
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
              background: '#00d26a',
              boxShadow: '0 0 8px #00d26a',
              display: 'inline-block'
            }} />
            <span style={{ color: 'var(--text-sub)' }}>Engine:</span>
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
              title="Hapus riwayat chat"
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

      {/* Context Selection Toolbar */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 18px',
        border: '2px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="#ce82ff" />
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pilih Konteks / Nada Tulisan:
            </span>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
            {activeContextMeta.description}
          </span>
        </div>

        <div style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none'
        }}>
          {CONTEXT_MODES.map((ctx) => {
            const isSelected = selectedContext === ctx.id;
            return (
              <button
                key={ctx.id}
                onClick={() => handleContextSelect(ctx.id)}
                style={{
                  background: isSelected ? '#58cc02' : 'var(--bg-card-hover)',
                  color: isSelected ? '#ffffff' : 'var(--text-main)',
                  border: isSelected ? '2px solid #46a302' : '2px solid var(--border-color)',
                  boxShadow: isSelected ? '0 4px 0 #46a302' : 'none',
                  padding: '8px 14px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                  transform: isSelected ? 'translateY(-2px)' : 'none'
                }}
              >
                <span>{ctx.icon}</span>
                <span>{ctx.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Stream */}
      <div 
        ref={chatContainerRef}
        style={{
          flex: 1,
          minHeight: '400px',
          maxHeight: '620px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px',
          padding: '8px 4px'
        }}
      >
        {messages.length === 0 ? (
          /* Empty State / Welcome Guide */
          <div style={{
            background: 'var(--bg-card)',
            border: '2px dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #ce82ff, #8b5cf6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(206, 130, 255, 0.3)',
              fontSize: '32px'
            }}>
              ✍️
            </div>

            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                Tuliskan Bahasa Inggris Anda di Bawah
              </h2>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
                AI akan secara otomatis merapikan kalimat Anda menjadi bahasa Inggris yang alami (sesuai konteks becanda, akademik populer, dsb.) dan memberikan rincian penjelasan alasannya dalam bahasa Indonesia.
              </p>
            </div>

            {/* Sample Prompts */}
            <div style={{ width: '100%', maxWidth: '680px', marginTop: '10px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                💡 Coba Contoh Kalimat Ini:
              </span>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '10px',
                marginTop: '10px'
              }}>
                {SAMPLE_PROMPTS.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleApplySample(sample)}
                    style={{
                      background: 'var(--bg-card-hover)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#58cc02';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-color)';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#1cb0f6' }}>
                        {sample.title}
                      </span>
                      <ArrowRight size={13} color="#9ca3af" />
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-main)', fontStyle: 'italic' }}>
                      "{sample.text}"
                    </div>
                  </div>
                ))}
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
                    maxWidth: '80%',
                    background: '#1cb0f6',
                    color: '#ffffff',
                    borderRadius: '18px 18px 4px 18px',
                    padding: '14px 18px',
                    boxShadow: '0 4px 0 #1899d6',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <span style={{
                        background: 'rgba(255,255,255,0.25)',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '10px'
                      }}>
                        Konteks: {msg.contextLabel}
                      </span>
                      <span style={{ fontSize: '0.72rem', opacity: 0.8 }}>{msg.timestamp}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 }}>
                      {msg.text}
                    </p>
                  </div>
                </div>
              );
            }

            // AI Message
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

            const isExpanded = expandedExplanationIds[msg.id];
            const data = msg.data;

            return (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color)',
                  borderRadius: '20px 20px 20px 4px',
                  padding: '20px 22px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {/* Top Meta Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        background: 'rgba(88, 204, 2, 0.15)',
                        color: '#58cc02',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        border: '1px solid rgba(88, 204, 2, 0.3)'
                      }}>
                        <CheckCircle2 size={14} />
                        <span>Konteks Diterapkan: {data.contextDetected}</span>
                      </div>

                      {msg.modelUsed && (
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Cpu size={12} /> {msg.modelUsed}
                        </span>
                      )}
                    </div>

                    <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                      {msg.timestamp}
                    </span>
                  </div>

                  {msg.warning && (
                    <div style={{
                      background: 'rgba(255, 200, 0, 0.12)',
                      border: '1px solid rgba(255, 200, 0, 0.4)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      color: '#ffc800',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <Info size={16} />
                      <span>{msg.warning}</span>
                    </div>
                  )}

                  {/* Polished English Output Box */}
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(88, 204, 2, 0.08), rgba(28, 176, 246, 0.08))',
                    border: '2px solid #58cc02',
                    borderRadius: '16px',
                    padding: '18px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: '#58cc02',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        ✨ Hasil Sempurna (Natural English):
                      </span>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleSpeakText(data.polishedText, msg.id)}
                          title="Dengarkan pengucapan (Audio TTS)"
                          style={{
                            background: playingAudioId === msg.id ? '#1cb0f6' : 'var(--bg-card)',
                            color: playingAudioId === msg.id ? '#fff' : 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          {playingAudioId === msg.id ? <VolumeX size={15} /> : <Volume2 size={15} />}
                          <span>{playingAudioId === msg.id ? 'Stop' : 'Dengarkan'}</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(data.polishedText, msg.id)}
                          title="Salin teks ke clipboard"
                          style={{
                            background: copiedId === msg.id ? '#58cc02' : 'var(--bg-card)',
                            color: copiedId === msg.id ? '#fff' : 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            fontSize: '0.78rem',
                            fontWeight: 700
                          }}
                        >
                          {copiedId === msg.id ? <Check size={15} /> : <Copy size={15} />}
                          <span>{copiedId === msg.id ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    </div>

                    <div style={{
                      fontSize: '1.2rem',
                      fontWeight: 800,
                      color: 'var(--text-main)',
                      lineHeight: 1.5,
                      letterSpacing: '0.2px'
                    }}>
                      "{data.polishedText}"
                    </div>

                    {/* Overall Summary in Indonesian */}
                    {data.overallSummary && (
                      <div style={{
                        fontSize: '0.88rem',
                        color: 'var(--text-sub)',
                        borderTop: '1px dashed var(--border-color)',
                        paddingTop: '10px',
                        lineHeight: 1.5
                      }}>
                        💡 {data.overallSummary}
                      </div>
                    )}
                  </div>

                  {/* Explanation Toggle ("Mengapa ada perubahan ini?") */}
                  <div style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'var(--bg-card-hover)'
                  }}>
                    <button
                      onClick={() => handleToggleExplanation(msg.id)}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: 'var(--text-main)',
                        fontWeight: 800,
                        fontSize: '0.9rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <BookOpen size={17} color="#ff9600" />
                        <span>Mengapa Ada Perubahan Ini? ({data.changes?.length || 0} Poin Penjelasan)</span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>

                    {isExpanded && (
                      <div style={{
                        padding: '14px 16px',
                        borderTop: '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}>
                        {data.changes && data.changes.length > 0 ? (
                          data.changes.map((ch, cIdx) => (
                            <div
                              key={cIdx}
                              style={{
                                background: 'var(--bg-card)',
                                borderRadius: '10px',
                                padding: '12px 14px',
                                borderLeft: '4px solid #1cb0f6',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '8px'
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{
                                    background: 'rgba(255, 75, 75, 0.15)',
                                    color: '#ff4b4b',
                                    textDecoration: 'line-through',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 700
                                  }}>
                                    {ch.original}
                                  </span>
                                  <ArrowRight size={14} color="var(--text-sub)" />
                                  <span style={{
                                    background: 'rgba(88, 204, 2, 0.18)',
                                    color: '#58cc02',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 800
                                  }}>
                                    {ch.improved}
                                  </span>
                                </div>

                                {ch.type && (
                                  <span style={{
                                    background: 'rgba(206, 130, 255, 0.15)',
                                    color: '#ce82ff',
                                    padding: '2px 8px',
                                    borderRadius: '6px',
                                    fontSize: '0.72rem',
                                    fontWeight: 700
                                  }}>
                                    {ch.type}
                                  </span>
                                )}
                              </div>

                              <p style={{
                                margin: 0,
                                fontSize: '0.86rem',
                                color: 'var(--text-main)',
                                lineHeight: 1.5
                              }}>
                                {ch.explanation}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)' }}>
                            Kalimat Anda sudah sangat baik! Perubahan hanya berupa perbaikan kecil agar terdengar lebih mengalir.
                          </p>
                        )}

                        {/* Alternative Variations */}
                        {data.alternativeVersions && data.alternativeVersions.length > 0 && (
                          <div style={{
                            marginTop: '8px',
                            paddingTop: '12px',
                            borderTop: '1px dashed var(--border-color)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                              🔄 Pilihan Versi Alternatif Lainnya:
                            </span>
                            {data.alternativeVersions.map((alt, aIdx) => (
                              <div
                                key={aIdx}
                                style={{
                                  background: 'var(--bg-card)',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px'
                                }}
                              >
                                <div>
                                  <div style={{ fontSize: '0.74rem', color: '#ff9600', fontWeight: 700 }}>
                                    {alt.tone}:
                                  </div>
                                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    "{alt.text}"
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleCopyText(alt.text, `alt_${msg.id}_${aIdx}`)}
                                  style={{
                                    background: 'transparent',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-main)',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.74rem'
                                  }}
                                >
                                  Salin
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Loading Indicator */}
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
              <RefreshCw size={20} color="#00d26a" className="spin-animation" style={{
                animation: 'spin 1.2s linear infinite'
              }} />
              <div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  AI sedang menganalisis & menyempurnakan kalimat...
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                  Menyesuaikan konteks ({activeContextMeta.label}) & menyusun penjelasan dalam bahasa Indonesia.
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
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Tulis teks bahasa Inggris di sini (misal: "${activeContextMeta.label}")...`}
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
              onFocus={(e) => e.target.style.borderColor = '#00d26a'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={handleVoiceToggle}
              title={isListening ? 'Berhenti mendengarkan' : 'Bicara dalam bahasa Inggris (Voice Input)'}
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

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              style={{
                height: '46px',
                padding: '0 20px',
                borderRadius: '14px',
                background: !inputText.trim() || isLoading ? 'var(--bg-card-hover)' : '#58cc02',
                color: !inputText.trim() || isLoading ? 'var(--text-sub)' : '#ffffff',
                border: !inputText.trim() || isLoading ? '2px solid var(--border-color)' : '2px solid #46a302',
                boxShadow: !inputText.trim() || isLoading ? 'none' : '0 4px 0 #46a302',
                cursor: !inputText.trim() || isLoading ? 'not-allowed' : 'pointer',
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
              <span>Kirim & Edit</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-sub)' }}>
            <span>Tekan <strong>Enter</strong> untuk mengirim, <strong>Shift + Enter</strong> untuk baris baru.</span>
            <span>Konteks aktif: <strong>{activeContextMeta.label}</strong></span>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
