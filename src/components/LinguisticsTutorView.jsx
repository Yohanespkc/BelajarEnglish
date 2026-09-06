import React, { useState, useEffect, useRef } from 'react';
import { 
  BookMarked, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
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
  Globe,
  Archive,
  Search,
  RotateCcw,
  Inbox,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Settings,
  Info
} from 'lucide-react';
import { linguisticsTutorService, QUICK_LINGUISTICS_QUESTIONS } from '../services/linguisticsTutorService';
import { aiProviderService, PROVIDER_METADATA } from '../services/aiProviderService';
import AISettingsModal from './AISettingsModal';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { activityLoggerService } from '../services/activityLoggerService';
import { archiveService } from '../services/archiveService';

export default function LinguisticsTutorView({ _userState, onAddXp }) {
  // Sub-view toggle: 'chat' | 'archive'
  const [activeSubView, setActiveSubView] = useState('chat');

  // Active chat messages
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('lingo_linguistics_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Archive states
  const [archiveList, setArchiveList] = useState(() => archiveService.getLinguisticsArchive());
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archiveFilterCategory, setArchiveFilterCategory] = useState('all');
  const [expandedArchiveIds, setExpandedArchiveIds] = useState({});

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => aiProviderService.getConfig());
  const [inputQuery, setInputQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState(() => aiProviderService.getConfig().selectedModel || 'llama-3.3-70b-versatile');
  const [availableModels, setAvailableModels] = useState(['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma3:4b']);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [playingAudioKey, setPlayingAudioKey] = useState(null);

  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);

  const refreshModels = () => {
    const config = aiProviderService.getConfig();
    setAiConfig(config);
    linguisticsTutorService.getAvailableModels(config.provider).then((models) => {
      if (models && models.length > 0) {
        setAvailableModels(models);
        if (models.includes(config.selectedModel)) {
          setSelectedModel(config.selectedModel);
        } else {
          setSelectedModel(models[0]);
        }
      }
    });
  };

  useEffect(() => {
    refreshModels();
  }, []);

  useEffect(() => {
    const handleConfigChange = () => {
      refreshModels();
    };
    window.addEventListener('belajarenglish_ai_config_updated', handleConfigChange);
    return () => window.removeEventListener('belajarenglish_ai_config_updated', handleConfigChange);
  }, []);

  // Listen to archive updates
  useEffect(() => {
    const handleArchiveUpdate = (e) => {
      if (e.detail?.type === 'linguistics') {
        setArchiveList(archiveService.getLinguisticsArchive());
      }
    };
    window.addEventListener('belajarenglish_archive_updated', handleArchiveUpdate);
    return () => window.removeEventListener('belajarenglish_archive_updated', handleArchiveUpdate);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('lingo_linguistics_history', JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save linguistics history', e);
    }
  }, [messages]);

  useEffect(() => {
    if (chatContainerRef.current && activeSubView === 'chat') {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeSubView]);

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
    if (window.confirm('Bersihkan layar tanya aktif? Riwayat sebelumnya tetap aman tersimpan di Archive.')) {
      soundService.playClick();
      setMessages([]);
      localStorage.removeItem('lingo_linguistics_history');
    }
  };

  const handleStartFresh = () => {
    soundService.playClick();
    setMessages([]);
    setInputQuery('');
    localStorage.removeItem('lingo_linguistics_history');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleToggleArchiveDetails = (id) => {
    soundService.playClick();
    setExpandedArchiveIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleRestoreFromArchive = (item) => {
    soundService.playClick();
    setInputQuery(item.query || item.title || '');
    setActiveSubView('chat');
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleDeleteArchiveItem = (id, e) => {
    if (e) e.stopPropagation();
    soundService.playClick();
    const updated = archiveService.deleteLinguisticsItem(id);
    setArchiveList(updated);
  };

  const handleClearAllArchive = () => {
    if (archiveList.length === 0) return;
    if (window.confirm('Hapus seluruh arsip Tanya Kata & Grammar? Tindakan ini tidak dapat dibatalkan.')) {
      soundService.playClick();
      archiveService.clearLinguisticsArchive();
      setArchiveList([]);
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

      // Automatically save to Dedicated Linguistics Archive!
      const updatedArchive = archiveService.saveLinguisticsItem({
        id: aiMsg.id,
        query,
        data: result.data,
        modelUsed: result.modelUsed
      });
      setArchiveList(updatedArchive);

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

  // Filtered Archive List
  const filteredArchive = archiveList.filter((item) => {
    const qLower = archiveSearchQuery.toLowerCase();
    const matchesSearch = 
      (item.title && item.title.toLowerCase().includes(qLower)) ||
      (item.query && item.query.toLowerCase().includes(qLower)) ||
      (item.coreDefinition && item.coreDefinition.toLowerCase().includes(qLower)) ||
      (item.data?.etymology?.historicalStory && item.data.etymology.historicalStory.toLowerCase().includes(qLower));

    const matchesCategory = 
      archiveFilterCategory === 'all' || 
      (item.partOfSpeech && item.partOfSpeech.toLowerCase().includes(archiveFilterCategory.toLowerCase()));

    return matchesSearch && matchesCategory;
  });

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
              Eksplorasi mendalam: asal-usul kata (etimologi), turunan kata, contoh kalimat konteks, idiom, dan arsip pembelajaran.
            </p>
          </div>
        </div>

        {/* Model and Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
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
            <span style={{ color: 'var(--text-sub)' }}>
              {PROVIDER_METADATA[aiConfig.provider]?.name || 'Engine'}:
            </span>
            <select
              value={selectedModel}
              onChange={(e) => {
                setSelectedModel(e.target.value);
                aiProviderService.saveConfig({ selectedModel: e.target.value });
              }}
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

          {/* Quick AI Settings Trigger */}
          <button
            onClick={() => {
              soundService.playClick();
              setIsSettingsModalOpen(true);
            }}
            title="Buka Pengaturan AI (Groq Cloud / Gemini / Ollama)"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              color: '#00e5ff',
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Settings size={14} />
            <span>Atur AI</span>
          </button>

          {activeSubView === 'chat' && messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              title="Bersihkan layar aktif (arsip tetap aman)"
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
              <span>Bersihkan Layar</span>
            </button>
          )}

          {activeSubView === 'archive' && archiveList.length > 0 && (
            <button
              onClick={handleClearAllArchive}
              title="Kosongkan seluruh arsip Tanya Kata & Grammar"
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
              <span>Hapus Semua Arsip</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher: Tanya Kata Aktif vs Archive Kata & Grammar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          background: 'var(--bg-card)',
          padding: '4px',
          borderRadius: '16px',
          border: '2px solid var(--border-color)',
          gap: '6px'
        }}>
          <button
            onClick={() => { soundService.playClick(); setActiveSubView('chat'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '12px',
              border: 'none',
              background: activeSubView === 'chat' ? 'linear-gradient(135deg, #1cb0f6, #0284c7)' : 'transparent',
              color: activeSubView === 'chat' ? '#ffffff' : 'var(--text-sub)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeSubView === 'chat' ? '0 4px 10px rgba(28, 176, 246, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <BookMarked size={16} />
            <span>Tanya Kata & Grammar</span>
            {messages.length > 0 && (
              <span style={{
                background: activeSubView === 'chat' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                padding: '1px 7px',
                borderRadius: '10px',
                fontSize: '0.72rem'
              }}>
                Aktif
              </span>
            )}
          </button>

          <button
            onClick={() => { soundService.playClick(); setActiveSubView('archive'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '12px',
              border: 'none',
              background: activeSubView === 'archive' ? 'linear-gradient(135deg, #8b5cf6, #6d28d9)' : 'transparent',
              color: activeSubView === 'archive' ? '#ffffff' : 'var(--text-sub)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeSubView === 'archive' ? '0 4px 10px rgba(139, 92, 246, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Archive size={16} />
            <span>Archive Kata & Grammar</span>
            <span style={{
              background: activeSubView === 'archive' ? 'rgba(255,255,255,0.25)' : 'rgba(139, 92, 246, 0.2)',
              color: activeSubView === 'archive' ? '#ffffff' : '#a78bfa',
              padding: '1px 8px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 900
            }}>
              {archiveList.length}
            </span>
          </button>
        </div>

        {activeSubView === 'chat' && messages.length > 0 && (
          <button
            onClick={handleStartFresh}
            title="Bersihkan layar untuk menanyakan kata baru (pertanyaan sebelumnya tersimpan di arsip)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(28, 176, 246, 0.12)',
              border: '1px solid rgba(28, 176, 246, 0.35)',
              color: '#1cb0f6',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={15} />
            <span>✨ Tanya Kata Baru (Layar Bersih)</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* SUB-VIEW 1: ACTIVE LINGUISTICS CHAT                            */}
      {/* ============================================================== */}
      {activeSubView === 'chat' && (
        <>
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
                    Tanyakan Apa Saja Tentang Kata & Grammar!
                  </h2>
                  <p style={{ fontSize: '0.92rem', color: 'var(--text-sub)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
                    Ketik kata apa pun (misal: <strong>"apa itu bright"</strong>, <em>"asal usul salary"</em>) atau aturan tata bahasa. Jawaban akan otomatis tersimpan dalam <strong>Archive Kata & Grammar</strong> agar layar tidak menumpuk dan bisa Anda tinjau kembali sewaktu-waktu.
                  </p>
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                if (msg.sender === 'user') {
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{
                        maxWidth: '80%',
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
                      {msg.warning && (
                        <div style={{
                          background: 'rgba(255, 200, 0, 0.12)',
                          border: '1px solid rgba(255, 200, 0, 0.4)',
                          borderRadius: '8px',
                          padding: '10px 14px',
                          color: '#ffc800',
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '10px',
                          flexWrap: 'wrap'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <Info size={16} style={{ flexShrink: 0 }} />
                            <span>{msg.warning}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              soundService.playClick();
                              setIsSettingsModalOpen(true);
                            }}
                            style={{
                              background: 'rgba(255, 200, 0, 0.25)',
                              border: '1px solid #ffc800',
                              color: '#ffffff',
                              fontWeight: 700,
                              borderRadius: '6px',
                              padding: '4px 10px',
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Settings size={12} />
                            <span>Atur Cloud AI Gratis</span>
                          </button>
                        </div>
                      )}
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
                                {playingAudioKey === `title_${msg.id}` ? <VolumeX size={16} /> : <Volume2 size={16} />}
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

                          {/* Sub-section: Bahasa Modern yang Banyak Menggunakan */}
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
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span style={{ fontWeight: 800, color: '#1cb0f6', fontSize: '0.84rem' }}>
                                        {langItem.language}
                                      </span>
                                      <span style={{
                                        background: 'rgba(28, 176, 246, 0.12)',
                                        color: '#1cb0f6',
                                        fontSize: '0.72rem',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        fontWeight: 700
                                      }}>
                                        {langItem.cognateWord}
                                      </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                                      {langItem.usageContext}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Section 2: Turunan Kata (Word Family / Morphology) */}
                      {data.wordFamily && data.wordFamily.length > 0 && (
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
                            <Layers size={18} color="#ce82ff" />
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ce82ff', textTransform: 'uppercase' }}>
                              🧬 Turunan Kata & Keluarga Kata (Word Family)
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                            gap: '10px'
                          }}>
                            {data.wordFamily.map((wf, wIdx) => (
                              <div
                                key={wIdx}
                                style={{
                                  background: 'var(--bg-card)',
                                  borderRadius: '10px',
                                  padding: '10px 14px',
                                  border: '1px solid var(--border-color)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '4px'
                                }}
                              >
                                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ce82ff', textTransform: 'uppercase' }}>
                                  {wf.partOfSpeech}
                                </span>
                                <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                                  {wf.word}
                                </span>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                                  {wf.meaning}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 3: Contoh Kalimat Konteks */}
                      {data.exampleSentences && data.exampleSentences.length > 0 && (
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
                            <MessageCircle size={18} color="#58cc02" />
                            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#58cc02', textTransform: 'uppercase' }}>
                              💬 Contoh Kalimat Berbagai Konteks
                            </span>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {data.exampleSentences.map((ex, exIdx) => (
                              <div
                                key={exIdx}
                                style={{
                                  background: 'var(--bg-card)',
                                  borderRadius: '10px',
                                  padding: '12px 14px',
                                  borderLeft: '4px solid #58cc02',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '12px'
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={{
                                      background: 'rgba(88, 204, 2, 0.15)',
                                      color: '#58cc02',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      fontSize: '0.72rem',
                                      fontWeight: 800
                                    }}>
                                      {ex.context}
                                    </span>
                                  </div>
                                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                    "{ex.english}"
                                  </span>
                                  <span style={{ fontSize: '0.84rem', color: 'var(--text-sub)', fontStyle: 'italic' }}>
                                    {ex.indonesian}
                                  </span>
                                </div>

                                <button
                                  onClick={() => handleSpeak(ex.english, `ex_${msg.id}_${exIdx}`)}
                                  title="Dengarkan contoh kalimat"
                                  style={{
                                    background: playingAudioKey === `ex_${msg.id}_${exIdx}` ? '#1cb0f6' : 'transparent',
                                    color: playingAudioKey === `ex_${msg.id}_${exIdx}` ? '#fff' : 'var(--text-sub)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    padding: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                  }}
                                >
                                  {playingAudioKey === `ex_${msg.id}_${exIdx}` ? <VolumeX size={15} /> : <Volume2 size={15} />}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Section 4: Idiom & Slang */}
                      {((data.idioms && data.idioms.length > 0) || (data.slangAndPopCulture && data.slangAndPopCulture.length > 0)) && (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                          gap: '12px'
                        }}>
                          {/* Idioms */}
                          {data.idioms && data.idioms.length > 0 && (
                            <div style={{
                              background: 'var(--bg-card-hover)',
                              borderRadius: '14px',
                              padding: '14px 16px',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Zap size={16} color="#ff9600" />
                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ff9600', textTransform: 'uppercase' }}>
                                  ⚡ Idiom Populer
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.idioms.map((idm, iIdx) => (
                                  <div
                                    key={iIdx}
                                    style={{
                                      background: 'var(--bg-card)',
                                      borderRadius: '8px',
                                      padding: '10px 12px',
                                      border: '1px solid var(--border-color)'
                                    }}
                                  >
                                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                                      {idm.idiom}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                                      {idm.meaning}
                                    </div>
                                    {idm.example && (
                                      <div style={{ fontSize: '0.78rem', color: '#1cb0f6', marginTop: '4px', fontStyle: 'italic' }}>
                                        "{idm.example}"
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Slang & Pop Culture */}
                          {data.slangAndPopCulture && data.slangAndPopCulture.length > 0 && (
                            <div style={{
                              background: 'var(--bg-card-hover)',
                              borderRadius: '14px',
                              padding: '14px 16px',
                              border: '1px solid var(--border-color)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '8px'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Sparkles size={16} color="#ec4899" />
                                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase' }}>
                                  🔥 Bahasa Gaul & Slang
                                </span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {data.slangAndPopCulture.map((sl, sIdx) => (
                                  <div
                                    key={sIdx}
                                    style={{
                                      background: 'var(--bg-card)',
                                      borderRadius: '8px',
                                      padding: '10px 12px',
                                      border: '1px solid var(--border-color)'
                                    }}
                                  >
                                    <div style={{ fontWeight: 800, color: '#ec4899', fontSize: '0.9rem' }}>
                                      {sl.term}
                                    </div>
                                    <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                                      {sl.context}
                                    </div>
                                    {sl.sample && (
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-main)', marginTop: '4px', fontStyle: 'italic' }}>
                                        "{sl.sample}"
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Section 5: Nuansa Sinonim & Perbandingan */}
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
                              ⚖️ Perbandingan Nuansa Sinonim
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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

                      {/* Bottom Archive Notification and Fresh Screen Button */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '12px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#1cb0f6', fontWeight: 700 }}>
                          <CheckCircle2 size={16} />
                          <span>Tersimpan di Archive Kata & Grammar</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setActiveSubView('archive')}
                            style={{
                              background: 'rgba(139, 92, 246, 0.12)',
                              color: '#8b5cf6',
                              border: '1px solid rgba(139, 92, 246, 0.3)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px'
                            }}
                          >
                            <Archive size={14} />
                            <span>Buka Arsip</span>
                          </button>

                          <button
                            onClick={handleStartFresh}
                            title="Bersihkan layar untuk menanyakan kata baru (sesi ini sudah aman di arsip)"
                            style={{
                              background: '#1cb0f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '6px 14px',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 2px 0 #1899d6'
                            }}
                          >
                            <Sparkles size={14} />
                            <span>Tanya Kata Baru</span>
                          </button>
                        </div>
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
        </>
      )}

      {/* ============================================================== */}
      {/* SUB-VIEW 2: DEDICATED ARCHIVE TANYA KATA & GRAMMAR              */}
      {/* ============================================================== */}
      {activeSubView === 'archive' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Search & Filter Bar */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            border: '2px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                flex: 1,
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <Search size={18} color="var(--text-sub)" style={{ position: 'absolute', left: '14px' }} />
                <input
                  type="text"
                  value={archiveSearchQuery}
                  onChange={(e) => setArchiveSearchQuery(e.target.value)}
                  placeholder="Cari kata, topik grammar, atau etimologi dalam arsip..."
                  style={{
                    width: '100%',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px 10px 42px',
                    color: 'var(--text-main)',
                    fontSize: '0.88rem',
                    outline: 'none'
                  }}
                />
                {archiveSearchQuery && (
                  <button
                    onClick={() => setArchiveSearchQuery('')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-sub)',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: 700
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                Filter Kelas Kata / Topik:
              </span>
              {['all', 'Noun', 'Verb', 'Adjective', 'Adverb', 'Grammar', 'Idiom'].map((cat) => {
                const count = cat === 'all' 
                  ? archiveList.length 
                  : archiveList.filter(i => (i.partOfSpeech || '').toLowerCase().includes(cat.toLowerCase())).length;
                if (cat !== 'all' && count === 0 && archiveFilterCategory !== cat) return null;
                const isSelected = archiveFilterCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => { soundService.playClick(); setArchiveFilterCategory(cat); }}
                    style={{
                      background: isSelected ? '#8b5cf6' : 'var(--bg-card-hover)',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {cat === 'all' ? 'Semua' : cat} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Archive Cards List */}
          {filteredArchive.length === 0 ? (
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '2px dashed var(--border-color)',
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#8b5cf6'
              }}>
                <Inbox size={30} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {archiveSearchQuery || archiveFilterCategory !== 'all' 
                  ? 'Tidak ada arsip linguistik yang cocok dengan filter' 
                  : 'Belum Ada Kata di Archive Tanya Kata & Grammar'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)', maxWidth: '420px', lineHeight: 1.5 }}>
                {archiveSearchQuery || archiveFilterCategory !== 'all'
                  ? 'Coba ubah kata kunci pencarian atau reset filter kategori.'
                  : 'Setiap kata atau topik grammar yang Anda tanyakan akan otomatis tersimpan di sini agar mudah dibuka kapan saja.'}
              </p>
              <button
                onClick={() => { soundService.playClick(); setActiveSubView('chat'); }}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #1cb0f6, #0284c7)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Tanyakan Kata Sekarang
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredArchive.map((item) => {
                const isExpanded = !!expandedArchiveIds[item.id];
                const data = item.data || {};

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--bg-card)',
                      borderRadius: 'var(--radius-lg)',
                      border: '2px solid var(--border-color)',
                      padding: '20px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '14px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                          {item.title}
                        </h3>

                        {item.ipa && (
                          <button
                            onClick={() => handleSpeak(item.title.replace(/\(.*?\)/g, '').trim(), `arch_title_${item.id}`)}
                            title="Dengarkan pengucapan kata"
                            style={{
                              background: playingAudioKey === `arch_title_${item.id}` ? '#1cb0f6' : 'var(--bg-card-hover)',
                              color: playingAudioKey === `arch_title_${item.id}` ? '#fff' : '#1cb0f6',
                              border: '1px solid #1cb0f6',
                              padding: '2px 8px',
                              borderRadius: '14px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '0.78rem',
                              fontWeight: 700
                            }}
                          >
                            {playingAudioKey === `arch_title_${item.id}` ? <VolumeX size={13} /> : <Volume2 size={13} />}
                            <span>{item.ipa}</span>
                          </button>
                        )}

                        {item.partOfSpeech && (
                          <span style={{
                            background: 'rgba(139, 92, 246, 0.15)',
                            color: '#8b5cf6',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '14px',
                            padding: '2px 8px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {item.partOfSpeech}
                          </span>
                        )}

                        <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                          {item.formattedTime}
                        </span>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleCopy(item.coreDefinition || item.title, `arch_copy_${item.id}`)}
                          style={{
                            background: copiedId === `arch_copy_${item.id}` ? '#58cc02' : 'var(--bg-card-hover)',
                            color: copiedId === `arch_copy_${item.id}` ? '#fff' : 'var(--text-main)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {copiedId === `arch_copy_${item.id}` ? <Check size={14} /> : <Copy size={14} />}
                          <span>Salin</span>
                        </button>

                        <button
                          onClick={() => handleRestoreFromArchive(item)}
                          title="Tanyakan kata ini lagi di Chat"
                          style={{
                            background: 'rgba(28, 176, 246, 0.12)',
                            color: '#1cb0f6',
                            border: '1px solid rgba(28, 176, 246, 0.3)',
                            borderRadius: '8px',
                            padding: '6px 10px',
                            fontSize: '0.76rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <RotateCcw size={14} />
                          <span>Tanya di Chat</span>
                        </button>

                        <button
                          onClick={(e) => handleDeleteArchiveItem(item.id, e)}
                          title="Hapus dari arsip"
                          style={{
                            background: 'rgba(255, 75, 75, 0.1)',
                            color: '#ff4b4b',
                            border: '1px solid rgba(255, 75, 75, 0.25)',
                            borderRadius: '8px',
                            padding: '6px 8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Core Definition */}
                    <div style={{
                      background: 'var(--bg-card-hover)',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      borderLeft: '4px solid #1cb0f6',
                      fontSize: '0.92rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.5
                    }}>
                      📖 <strong>Definisi:</strong> {item.coreDefinition}
                    </div>

                    {/* Expandable Accordion for Complete Linguistic Breakdown */}
                    <div>
                      <button
                        onClick={() => handleToggleArchiveDetails(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#8b5cf6',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 0'
                        }}
                      >
                        <Compass size={15} />
                        <span>{isExpanded ? 'Sembunyikan Analisis Lengkap' : 'Buka Analisis Etimologi, Morfologi & Idiom'}</span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>

                      {isExpanded && (
                        <div style={{
                          marginTop: '12px',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px'
                        }}>
                          {/* Etymology */}
                          {data.etymology && (
                            <div style={{
                              background: 'var(--bg-primary)',
                              borderRadius: '10px',
                              padding: '12px 14px',
                              fontSize: '0.86rem',
                              lineHeight: 1.5
                            }}>
                              <strong style={{ color: '#ff9600' }}>📜 Asal-usul & Sejarah:</strong>{' '}
                              {data.etymology.historicalStory}
                            </div>
                          )}

                          {/* Example Sentences */}
                          {data.exampleSentences && data.exampleSentences.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                                Contoh Kalimat:
                              </span>
                              {data.exampleSentences.map((ex, exIdx) => (
                                <div
                                  key={exIdx}
                                  style={{
                                    background: 'var(--bg-primary)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '0.84rem'
                                  }}
                                >
                                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>"{ex.english}"</div>
                                  <div style={{ color: 'var(--text-sub)', fontSize: '0.78rem' }}>{ex.indonesian}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Idioms */}
                          {data.idioms && data.idioms.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                                Idiom Terkait:
                              </span>
                              {data.idioms.map((idm, iIdx) => (
                                <div
                                  key={iIdx}
                                  style={{
                                    background: 'var(--bg-primary)',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                    fontSize: '0.82rem'
                                  }}
                                >
                                  <strong style={{ color: '#ff9600' }}>{idm.idiom}:</strong> {idm.meaning}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <AISettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
