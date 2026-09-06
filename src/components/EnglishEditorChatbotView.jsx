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
  BookOpen,
  Archive,
  Search,
  RotateCcw,
  Inbox,
  Settings
} from 'lucide-react';
import { aiEnglishEditorService, CONTEXT_MODES } from '../services/aiEnglishEditorService';
import { aiProviderService, PROVIDER_METADATA } from '../services/aiProviderService';
import AISettingsModal from './AISettingsModal';
import { soundService } from '../services/soundService';
import { speechService, VOICE_PERSONAS } from '../services/speechService';
import { activityLoggerService } from '../services/activityLoggerService';
import { archiveService } from '../services/archiveService';

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
    text: 'i very tired and wanna go to the airport and back to country Indonesia'
  }
];

export default function EnglishEditorChatbotView({ _userState, onAddXp }) {
  // Sub-view toggle: 'chat' | 'archive'
  const [activeSubView, setActiveSubView] = useState('chat');

  // Active chat messages
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('lingo_editor_messages');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Archive states
  const [archiveList, setArchiveList] = useState(() => archiveService.getEditorArchive());
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archiveFilterContext, setArchiveFilterContext] = useState('all');
  const [expandedArchiveIds, setExpandedArchiveIds] = useState({});

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState(() => aiProviderService.getConfig());
  const [inputText, setInputText] = useState('');
  const [selectedContext, setSelectedContext] = useState('auto');
  const [selectedModel, setSelectedModel] = useState(() => aiProviderService.getConfig().selectedModel || 'llama-3.3-70b-versatile');
  const [availableModels, setAvailableModels] = useState(['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma3:4b']);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [expandedExplanationIds, setExpandedExplanationIds] = useState({});

  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

  // Sync models with active AI Provider
  const refreshModels = () => {
    const config = aiProviderService.getConfig();
    setAiConfig(config);
    aiEnglishEditorService.getAvailableModels(config.provider).then((models) => {
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

  // Listen to AI config changes
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
      if (e.detail?.type === 'editor') {
        setArchiveList(archiveService.getEditorArchive());
      }
    };
    window.addEventListener('belajarenglish_archive_updated', handleArchiveUpdate);
    return () => window.removeEventListener('belajarenglish_archive_updated', handleArchiveUpdate);
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
    if (chatContainerRef.current && activeSubView === 'chat') {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading, activeSubView]);

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

  const handleToggleArchiveExplanation = (itemId) => {
    soundService.playClick();
    setExpandedArchiveIds((prev) => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleCopyText = (text, id) => {
    soundService.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (text, id, personaId = null) => {
    soundService.playClick();
    if (playingAudioId === id) {
      speechService.stop();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(id);
      speechService.speak(text, {
        personaId,
        onEnd: () => setPlayingAudioId(null),
        onError: () => setPlayingAudioId(null)
      });
    }
  };

  const handleClearHistory = () => {
    if (messages.length === 0) return;
    if (window.confirm('Bersihkan layar chat aktif? Riwayat sebelumnya tetap aman tersimpan di Archive.')) {
      soundService.playClick();
      setMessages([]);
      localStorage.removeItem('lingo_editor_messages');
    }
  };

  const handleStartFresh = () => {
    soundService.playClick();
    setMessages([]);
    setInputText('');
    localStorage.removeItem('lingo_editor_messages');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleRestoreFromArchive = (item) => {
    soundService.playClick();
    setInputText(item.originalText || item.text || '');
    if (item.contextMode) {
      setSelectedContext(item.contextMode);
    }
    setActiveSubView('chat');
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleDeleteArchiveItem = (id, e) => {
    if (e) e.stopPropagation();
    soundService.playClick();
    const updated = archiveService.deleteEditorItem(id);
    setArchiveList(updated);
  };

  const handleClearAllArchive = () => {
    if (archiveList.length === 0) return;
    if (window.confirm('Hapus seluruh riwayat dalam Archive AI Editor? Tindakan ini tidak dapat dibatalkan.')) {
      soundService.playClick();
      archiveService.clearEditorArchive();
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

      // Automatically save to Dedicated AI Editor Archive!
      const updatedArchive = archiveService.saveEditorItem({
        id: aiResponse.id,
        originalText: text,
        contextMode: selectedContext,
        contextLabel: currentContext.label,
        polishedText: result.data.polishedText,
        data: result.data,
        modelUsed: result.modelUsed
      });
      setArchiveList(updatedArchive);

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

  // Filtered archive list
  const filteredArchive = archiveList.filter((item) => {
    const matchesSearch = 
      (item.originalText && item.originalText.toLowerCase().includes(archiveSearchQuery.toLowerCase())) ||
      (item.polishedText && item.polishedText.toLowerCase().includes(archiveSearchQuery.toLowerCase())) ||
      (item.data?.overallSummary && item.data.overallSummary.toLowerCase().includes(archiveSearchQuery.toLowerCase()));

    const matchesContext = 
      archiveFilterContext === 'all' || item.contextMode === archiveFilterContext;

    return matchesSearch && matchesContext;
  });

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
                MULTI-REGISTER
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
              Deteksi gaya kalimat asli + bandingkan kalimat dalam 4 gaya bahasa: percakapan harian, formal, slang, & akademik.
            </p>
          </div>
        </div>

        {/* Model & Status Bar */}
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
              background: '#00d26a',
              boxShadow: '0 0 8px #00d26a',
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
              title="Kosongkan seluruh arsip AI Editor"
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

      {/* View Switcher: Editor Aktif vs Archive AI Editor */}
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
              background: activeSubView === 'chat' ? 'linear-gradient(135deg, #00d26a, #009949)' : 'transparent',
              color: activeSubView === 'chat' ? '#ffffff' : 'var(--text-sub)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeSubView === 'chat' ? '0 4px 10px rgba(0, 210, 106, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Sparkles size={16} />
            <span>Editor Aktif</span>
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
              background: activeSubView === 'archive' ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'transparent',
              color: activeSubView === 'archive' ? '#ffffff' : 'var(--text-sub)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeSubView === 'archive' ? '0 4px 10px rgba(168, 85, 247, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Archive size={16} />
            <span>Archive AI Editor</span>
            <span style={{
              background: activeSubView === 'archive' ? 'rgba(255,255,255,0.25)' : 'rgba(168, 85, 247, 0.2)',
              color: activeSubView === 'archive' ? '#ffffff' : '#ce82ff',
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
            title="Bersihkan layar untuk menulis kalimat baru (sesi ini sudah aman di arsip)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(0, 210, 106, 0.12)',
              border: '1px solid rgba(0, 210, 106, 0.35)',
              color: '#00d26a',
              padding: '8px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.82rem',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            <Sparkles size={15} />
            <span>✨ Tulis Kalimat Baru (Layar Bersih)</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* SUB-VIEW 1: ACTIVE EDITOR CHAT                                  */}
      {/* ============================================================== */}
      {activeSubView === 'chat' && (
        <>
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
                  Pilih Target Konteks Utama:
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>
                {activeContextMeta.description}
              </span>
            </div>

            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
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
                      border: isSelected ? '2px solid #46a302' : '1px solid var(--border-color)',
                      boxShadow: isSelected ? '0 3px 0 #46a302' : 'none',
                      borderRadius: '20px',
                      padding: '6px 14px',
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{ctx.icon}</span>
                    <span>{ctx.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Messages Container */}
          <div
            ref={chatContainerRef}
            style={{
              flex: 1,
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '2px solid var(--border-color)',
              padding: '20px',
              overflowY: 'auto',
              maxHeight: '620px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.length === 0 ? (
              /* Empty State */
              <div style={{
                margin: 'auto 0',
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
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-sub)', maxWidth: '560px', margin: '0 auto', lineHeight: 1.5 }}>
                    AI akan mendeteksi nada kalimat asli Anda (formal, slang, atau harian), menyempurnakannya, serta menyajikan <strong>perbandingan langsung dalam 4 gaya bahasa</strong> agar Anda bisa membedakan rasa bahasanya dengan jelas.
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
                            Target: {msg.contextLabel}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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

                      {/* DETECTED INPUT TONE CARD */}
                      {data.detectedInputTone && (
                        <div style={{
                          background: 'rgba(28, 176, 246, 0.08)',
                          border: '1.5px solid #1cb0f6',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '12px'
                        }}>
                          <span style={{ fontSize: '1.3rem', marginTop: '1px' }}>🔍</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Nada & Gaya Kalimat Asli Anda Terdeteksi:
                              </span>
                              <span style={{
                                background: 'rgba(28, 176, 246, 0.2)',
                                color: '#1cb0f6',
                                fontWeight: 900,
                                fontSize: '0.78rem',
                                padding: '2px 10px',
                                borderRadius: '12px',
                                border: '1px solid rgba(28, 176, 246, 0.4)'
                              }}>
                                {data.detectedInputTone.tone}
                              </span>
                            </div>
                            {data.detectedInputTone.explanation && (
                              <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                                {data.detectedInputTone.explanation}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

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
                            ✨ Hasil Sempurna Sesuai Target:
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

                      {/* MULTI-REGISTER COMPARISON (SPEKTRUM 6 GAYA BAHASA DENGAN 6 INTONASI SUARA) */}
                      {data.toneComparison && data.toneComparison.length > 0 && (
                        <div style={{
                          background: 'var(--bg-card-hover)',
                          borderRadius: '16px',
                          border: '2px solid var(--border-color)',
                          padding: '18px 20px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '1.3rem' }}>🎭</span>
                              <span style={{ fontSize: '0.92rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Spektrum 6 Gaya Bahasa & Intonasi Suara Pembicara:
                              </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                              Dengarkan beda rasa bahasa & intonasi dari 6 persona penutur berbeda
                            </span>
                          </div>

                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                            gap: '12px'
                          }}>
                            {data.toneComparison.map((tc, tcIdx) => {
                              const isSelectedContext = 
                                (tc.toneId === 'daily_conversational' && selectedContext === 'daily_conversational') ||
                                (tc.toneId === 'business_formal' && selectedContext === 'business_formal') ||
                                (tc.toneId === 'genz_slang' && selectedContext === 'humorous_casual') ||
                                (tc.toneId === 'close_friend' && selectedContext === 'humorous_casual') ||
                                (tc.toneId === 'academic_intellectual' && selectedContext === 'academic_popular');

                              const toneColor = 
                                tc.toneId === 'genz_slang' ? '#ff2d55' :
                                tc.toneId === 'close_friend' ? '#ff9600' :
                                tc.toneId === 'daily_conversational' ? '#1cb0f6' :
                                tc.toneId === 'courteous_polite' ? '#10b981' :
                                tc.toneId === 'business_formal' ? '#00d26a' :
                                tc.toneId === 'academic_intellectual' ? '#ce82ff' : '#1cb0f6';

                              const persona = VOICE_PERSONAS[tc.toneId] || null;
                              const audioKey = `tc_${msg.id}_${tcIdx}`;
                              const copyKey = `tc_cp_${msg.id}_${tcIdx}`;
                              const isPlaying = playingAudioId === audioKey;

                              return (
                                <div
                                  key={tcIdx}
                                  style={{
                                    background: 'var(--bg-card)',
                                    borderRadius: '14px',
                                    border: isSelectedContext ? `2px solid ${toneColor}` : isPlaying ? `2px solid ${toneColor}` : '1.5px solid var(--border-color)',
                                    padding: '14px 16px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    gap: '10px',
                                    boxShadow: isPlaying ? `0 0 16px ${toneColor}35` : isSelectedContext ? `0 4px 14px ${toneColor}25` : 'none',
                                    transition: 'all 0.2s ease'
                                  }}
                                >
                                  <div>
                                    {/* Header Tone Card & Persona */}
                                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px', gap: '8px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '1.2rem' }}>{tc.icon || persona?.avatar || '🗣️'}</span>
                                        <div>
                                          <div style={{ fontWeight: 800, fontSize: '0.88rem', color: toneColor }}>
                                            {tc.toneLabel}
                                          </div>
                                          <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span>🎙️ Suara: <strong>{persona?.name || tc.persona || 'Speaker'}</strong></span>
                                            {persona?.title && <span>({persona.title})</span>}
                                          </div>
                                        </div>
                                      </div>
                                      <span style={{
                                        background: `${toneColor}15`,
                                        color: toneColor,
                                        border: `1px solid ${toneColor}35`,
                                        fontSize: '0.68rem',
                                        fontWeight: 800,
                                        padding: '2px 7px',
                                        borderRadius: '10px',
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {tc.badge}
                                      </span>
                                    </div>

                                    {/* Character Intonation Hint */}
                                    {persona?.desc && (
                                      <div style={{
                                        fontSize: '0.72rem',
                                        color: 'var(--text-sub)',
                                        fontStyle: 'italic',
                                        marginBottom: '6px'
                                      }}>
                                        🎵 {persona.desc}
                                      </div>
                                    )}

                                    {/* Text Sentence */}
                                    <div style={{
                                      fontSize: '0.98rem',
                                      fontWeight: 700,
                                      color: 'var(--text-main)',
                                      lineHeight: 1.45,
                                      marginBottom: '8px'
                                    }}>
                                      "{tc.text}"
                                    </div>

                                    {/* Nuance & Situation */}
                                    {tc.nuance && (
                                      <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.4, marginBottom: '6px' }}>
                                        <strong>📍 Kapan Dipakai:</strong> {tc.nuance}
                                      </div>
                                    )}

                                    {/* Key Difference */}
                                    {tc.keyDifference && (
                                      <div style={{
                                        fontSize: '0.76rem',
                                        color: 'var(--text-main)',
                                        background: 'var(--bg-card-hover)',
                                        padding: '6px 8px',
                                        borderRadius: '6px',
                                        borderLeft: `3px solid ${toneColor}`,
                                        lineHeight: 1.4
                                      }}>
                                        <strong>🔍 Ciri Khas:</strong> {tc.keyDifference}
                                      </div>
                                    )}
                                  </div>

                                  {/* Actions: Speak & Copy */}
                                  <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    gap: '6px',
                                    borderTop: '1px solid var(--border-color)',
                                    paddingTop: '8px'
                                  }}>
                                    <button
                                      onClick={() => handleSpeakText(tc.text, audioKey, tc.toneId)}
                                      title={`Dengarkan pengucapan intonasi ${persona?.name || 'gaya ini'}`}
                                      style={{
                                        background: isPlaying ? toneColor : 'transparent',
                                        color: isPlaying ? '#fff' : 'var(--text-main)',
                                        border: `1.5px solid ${isPlaying ? toneColor : 'var(--border-color)'}`,
                                        borderRadius: '6px',
                                        padding: '4px 10px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        boxShadow: isPlaying ? `0 0 10px ${toneColor}60` : 'none',
                                        transition: 'all 0.2s ease'
                                      }}
                                    >
                                      {isPlaying ? <VolumeX size={13} /> : <Volume2 size={13} />}
                                      <span>{isPlaying ? 'Hentikan' : `Dengar ${persona?.name || 'Suara'}`}</span>
                                    </button>

                                    <button
                                      onClick={() => handleCopyText(tc.text, copyKey)}
                                      title="Salin kalimat gaya ini"
                                      style={{
                                        background: copiedId === copyKey ? '#58cc02' : 'transparent',
                                        color: copiedId === copyKey ? '#fff' : 'var(--text-main)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        padding: '4px 8px',
                                        fontSize: '0.74rem',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      {copiedId === copyKey ? <Check size={13} /> : <Copy size={13} />}
                                      <span>Salin</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

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

                      {/* Archive Status and Fresh Screen Action */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderTop: '1px solid var(--border-color)',
                        paddingTop: '12px',
                        marginTop: '2px',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#00d26a', fontWeight: 700 }}>
                          <CheckCircle2 size={16} />
                          <span>Tersimpan di Archive AI Editor</span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button
                            onClick={() => setActiveSubView('archive')}
                            style={{
                              background: 'rgba(168, 85, 247, 0.12)',
                              color: '#a855f7',
                              border: '1px solid rgba(168, 85, 247, 0.3)',
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
                            title="Bersihkan layar untuk menulis kalimat baru (sesi ini sudah aman di arsip)"
                            style={{
                              background: '#58cc02',
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
                              boxShadow: '0 2px 0 #46a302'
                            }}
                          >
                            <Sparkles size={14} />
                            <span>Tulis Kalimat Baru</span>
                          </button>
                        </div>
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
                      AI sedang mendeteksi gaya bahasa & menyiapkan perbandingan 4 register...
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                      Membedah percakapan harian, formal bisnis, slang gaul, dan akademik populer.
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
                  placeholder={`Tulis teks bahasa Inggris apa saja (misal: "i very tired and wanna go to airport")...`}
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
                <span>Target aktif: <strong>{activeContextMeta.label}</strong> (Dilengkapi perbandingan 4 gaya bahasa)</span>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* SUB-VIEW 2: DEDICATED ARCHIVE AI EDITOR                         */}
      {/* ============================================================== */}
      {activeSubView === 'archive' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Archive Search & Filter Bar */}
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
                  placeholder="Cari kalimat asli, hasil perbaikan, atau kata kunci dalam arsip..."
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

            {/* Context Pills Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                Filter Konteks:
              </span>
              <button
                onClick={() => { soundService.playClick(); setArchiveFilterContext('all'); }}
                style={{
                  background: archiveFilterContext === 'all' ? '#a855f7' : 'var(--bg-card-hover)',
                  color: archiveFilterContext === 'all' ? '#fff' : 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '4px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Semua ({archiveList.length})
              </button>

              {CONTEXT_MODES.map((ctx) => {
                const count = archiveList.filter(i => i.contextMode === ctx.id).length;
                if (count === 0 && archiveFilterContext !== ctx.id) return null;
                const isSelected = archiveFilterContext === ctx.id;
                return (
                  <button
                    key={ctx.id}
                    onClick={() => { soundService.playClick(); setArchiveFilterContext(ctx.id); }}
                    style={{
                      background: isSelected ? '#a855f7' : 'var(--bg-card-hover)',
                      color: isSelected ? '#fff' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {ctx.icon} {ctx.label} ({count})
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
                background: 'rgba(168, 85, 247, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#a855f7'
              }}>
                <Inbox size={30} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {archiveSearchQuery || archiveFilterContext !== 'all' 
                  ? 'Tidak ada arsip yang cocok dengan pencarian' 
                  : 'Belum Ada Pertanyaan di Archive AI Editor'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)', maxWidth: '420px', lineHeight: 1.5 }}>
                {archiveSearchQuery || archiveFilterContext !== 'all'
                  ? 'Coba ganti kata kunci pencarian atau reset filter konteks.'
                  : 'Setiap kali Anda mengirim teks untuk diedit, hasilnya akan otomatis tersimpan di sini agar layar aktif Anda selalu rapi.'}
              </p>
              <button
                onClick={() => { soundService.playClick(); setActiveSubView('chat'); }}
                style={{
                  marginTop: '8px',
                  background: 'linear-gradient(135deg, #00d26a, #009949)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '10px 20px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  cursor: 'pointer'
                }}
              >
                Mulai Tulis Kalimat Baru
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredArchive.map((item) => {
                const isExpanded = !!expandedArchiveIds[item.id];
                const changes = item.data?.changes || [];
                const toneComparison = item.data?.toneComparison || [];
                const detectedTone = item.data?.detectedInputTone;

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
                      boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Card Meta Bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{
                          background: 'rgba(168, 85, 247, 0.15)',
                          color: '#a855f7',
                          border: '1px solid rgba(168, 85, 247, 0.3)',
                          borderRadius: '16px',
                          padding: '3px 10px',
                          fontSize: '0.74rem',
                          fontWeight: 800
                        }}>
                          {item.contextLabel}
                        </span>

                        {detectedTone?.tone && (
                          <span style={{
                            background: 'rgba(28, 176, 246, 0.12)',
                            color: '#1cb0f6',
                            border: '1px solid rgba(28, 176, 246, 0.25)',
                            borderRadius: '16px',
                            padding: '3px 10px',
                            fontSize: '0.74rem',
                            fontWeight: 700
                          }}>
                            Asli: {detectedTone.tone}
                          </span>
                        )}

                        <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                          {item.formattedTime}
                        </span>
                      </div>

                      {/* Card Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => handleSpeakText(item.polishedText, item.id)}
                          title="Dengarkan pengucapan audio"
                          style={{
                            background: playingAudioId === item.id ? '#1cb0f6' : 'var(--bg-card-hover)',
                            color: playingAudioId === item.id ? '#fff' : 'var(--text-main)',
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
                          {playingAudioId === item.id ? <VolumeX size={14} /> : <Volume2 size={14} />}
                          <span>Audio</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(item.polishedText, item.id)}
                          title="Salin hasil perbaikan"
                          style={{
                            background: copiedId === item.id ? '#58cc02' : 'var(--bg-card-hover)',
                            color: copiedId === item.id ? '#fff' : 'var(--text-main)',
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
                          {copiedId === item.id ? <Check size={14} /> : <Copy size={14} />}
                          <span>Salin</span>
                        </button>

                        <button
                          onClick={() => handleRestoreFromArchive(item)}
                          title="Muat kembali kalimat ini ke Editor Aktif"
                          style={{
                            background: 'rgba(0, 210, 106, 0.12)',
                            color: '#00d26a',
                            border: '1px solid rgba(0, 210, 106, 0.3)',
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
                          <span>Buka di Editor</span>
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

                    {/* Comparison Box: Original vs Polished */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: '12px'
                    }}>
                      {/* Original User Text */}
                      <div style={{
                        background: 'rgba(255, 75, 75, 0.05)',
                        border: '1px solid rgba(255, 75, 75, 0.25)',
                        borderRadius: '12px',
                        padding: '12px 14px'
                      }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#ff4b4b', textTransform: 'uppercase' }}>
                          Teks Asli:
                        </span>
                        <p style={{ margin: '6px 0 0 0', fontSize: '0.94rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                          "{item.originalText}"
                        </p>
                      </div>

                      {/* Polished Result */}
                      <div style={{
                        background: 'rgba(88, 204, 2, 0.08)',
                        border: '1.5px solid #58cc02',
                        borderRadius: '12px',
                        padding: '12px 14px'
                      }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#58cc02', textTransform: 'uppercase' }}>
                          ✨ Hasil Sempurna:
                        </span>
                        <p style={{ margin: '6px 0 0 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.5 }}>
                          "{item.polishedText}"
                        </p>
                      </div>
                    </div>

                    {/* Multi-Register Comparison inside Archive */}
                    {toneComparison.length > 0 && (
                      <div style={{
                        background: 'var(--bg-card-hover)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                          <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                            🎭 Spektrum 6 Gaya Bahasa & Suara Persona:
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                            Dengarkan karakter suara 6 persona penutur
                          </span>
                        </div>
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                          gap: '8px'
                        }}>
                          {toneComparison.map((tc, tcIdx) => {
                            const persona = VOICE_PERSONAS[tc.toneId] || null;
                            const archAudioKey = `arch_tc_${item.id}_${tcIdx}`;
                            const isPlaying = playingAudioId === archAudioKey;
                            const toneColor = 
                              tc.toneId === 'genz_slang' ? '#ff2d55' :
                              tc.toneId === 'close_friend' ? '#ff9600' :
                              tc.toneId === 'daily_conversational' ? '#1cb0f6' :
                              tc.toneId === 'courteous_polite' ? '#10b981' :
                              tc.toneId === 'business_formal' ? '#00d26a' :
                              tc.toneId === 'academic_intellectual' ? '#ce82ff' : '#1cb0f6';

                            return (
                              <div
                                key={tcIdx}
                                style={{
                                  background: 'var(--bg-primary)',
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  border: isPlaying ? `1.5px solid ${toneColor}` : '1px solid var(--border-color)',
                                  boxShadow: isPlaying ? `0 0 10px ${toneColor}40` : 'none',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px',
                                  transition: 'all 0.2s ease'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <div>
                                    <span style={{ fontWeight: 800, fontSize: '0.78rem', color: toneColor }}>
                                      {tc.icon || persona?.avatar} {tc.toneLabel}
                                    </span>
                                    <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>
                                      🎙️ {persona?.name || tc.persona || 'Speaker'}
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleSpeakText(tc.text, archAudioKey, tc.toneId)}
                                    style={{
                                      background: isPlaying ? toneColor : 'transparent',
                                      border: isPlaying ? `1px solid ${toneColor}` : '1px solid var(--border-color)',
                                      color: isPlaying ? '#fff' : toneColor,
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      padding: '3px 8px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700
                                    }}
                                    title={`Dengarkan suara ${persona?.name || 'pembicara'}`}
                                  >
                                    {isPlaying ? <VolumeX size={12} /> : <Volume2 size={12} />}
                                    <span>{isPlaying ? 'Stop' : 'Dengar'}</span>
                                  </button>
                                </div>
                                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
                                  "{tc.text}"
                                </div>
                                {tc.keyDifference && (
                                  <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', background: 'var(--bg-card-hover)', padding: '4px 6px', borderRadius: '4px' }}>
                                    💡 {tc.keyDifference}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Summary in Indonesian */}
                    {item.data?.overallSummary && (
                      <div style={{
                        fontSize: '0.84rem',
                        color: 'var(--text-sub)',
                        background: 'var(--bg-card-hover)',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        lineHeight: 1.5
                      }}>
                        💡 {item.data.overallSummary}
                      </div>
                    )}

                    {/* Toggle Explanation Accordion */}
                    <div>
                      <button
                        onClick={() => handleToggleArchiveExplanation(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#1cb0f6',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 0'
                        }}
                      >
                        <BookOpen size={15} />
                        <span>{isExpanded ? 'Sembunyikan Rincian Penjelasan' : `Lihat Rincian Penjelasan (${changes.length} Poin)`}</span>
                        {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                      </button>

                      {isExpanded && (
                        <div style={{
                          marginTop: '10px',
                          borderTop: '1px solid var(--border-color)',
                          paddingTop: '12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}>
                          {changes.length > 0 ? (
                            changes.map((ch, cIdx) => (
                              <div
                                key={cIdx}
                                style={{
                                  background: 'var(--bg-primary)',
                                  borderRadius: '8px',
                                  padding: '10px 12px',
                                  borderLeft: '3px solid #1cb0f6',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '6px'
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                  <span style={{
                                    background: 'rgba(255, 75, 75, 0.15)',
                                    color: '#ff4b4b',
                                    textDecoration: 'line-through',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 700
                                  }}>
                                    {ch.original}
                                  </span>
                                  <ArrowRight size={13} color="var(--text-sub)" />
                                  <span style={{
                                    background: 'rgba(88, 204, 2, 0.18)',
                                    color: '#58cc02',
                                    padding: '1px 6px',
                                    borderRadius: '4px',
                                    fontSize: '0.8rem',
                                    fontWeight: 800
                                  }}>
                                    {ch.improved}
                                  </span>
                                  {ch.type && (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      color: '#ce82ff',
                                      background: 'rgba(206, 130, 255, 0.15)',
                                      padding: '1px 6px',
                                      borderRadius: '4px'
                                    }}>
                                      {ch.type}
                                    </span>
                                  )}
                                </div>
                                <p style={{ margin: 0, fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                                  {ch.explanation}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                              Tidak ada perubahan struktural besar.
                            </p>
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
