import React, { useState, useEffect } from 'react';
import { 
  X, 
  Zap, 
  Cpu, 
  Sparkles, 
  Globe, 
  Key, 
  Check, 
  AlertTriangle, 
  ExternalLink, 
  RefreshCw, 
  ShieldCheck, 
  HelpCircle,
  Eye,
  EyeOff,
  Share2,
  Copy
} from 'lucide-react';
import { aiProviderService, AI_PROVIDERS, PROVIDER_METADATA } from '../services/aiProviderService';
import { soundService } from '../services/soundService';

export default function AISettingsModal({ isOpen, onClose }) {
  const [config, setConfig] = useState(() => aiProviderService.getConfig());
  const [activeTab, setActiveTab] = useState(config.provider || AI_PROVIDERS.GROQ);
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Test connection states
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [availableModels, setAvailableModels] = useState([]);
  const [copiedShareGuide, setCopiedShareGuide] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const currentConfig = aiProviderService.getConfig();
      setConfig(currentConfig);
      setActiveTab(currentConfig.provider);
      setTestResult(null);
      loadModelsForProvider(currentConfig.provider);
    }
  }, [isOpen]);

  const loadModelsForProvider = async (providerId) => {
    try {
      const models = await aiProviderService.getModels(providerId);
      setAvailableModels(models);
    } catch (e) {
      console.warn('Failed to load models for provider:', e);
    }
  };

  const handleTabChange = (providerId) => {
    soundService.playClick();
    setActiveTab(providerId);
    setTestResult(null);
    loadModelsForProvider(providerId);
    // Auto-sync model for the selected provider
    setConfig((prev) => ({
      ...prev,
      provider: providerId,
      selectedModel: aiProviderService.sanitizeModelForProvider(providerId, prev.selectedModel)
    }));
  };

  const handleTestConnection = async () => {
    soundService.playClick();
    setIsTesting(true);
    setTestResult(null);

    let keyOverride = null;
    if (activeTab === AI_PROVIDERS.GROQ) keyOverride = config.groqApiKey;
    if (activeTab === AI_PROVIDERS.GEMINI) keyOverride = config.geminiApiKey;
    if (activeTab === AI_PROVIDERS.OPENAI) keyOverride = config.openaiApiKey;

    const res = await aiProviderService.testConnection(activeTab, keyOverride);
    setIsTesting(false);
    setTestResult(res);

    if (res.success) {
      soundService.playCorrect();
    } else {
      soundService.playWrong();
    }
  };

  const handleSave = () => {
    soundService.playClick();
    const sanitizedModel = aiProviderService.sanitizeModelForProvider(activeTab, config.selectedModel);
    const updated = aiProviderService.saveConfig({
      ...config,
      provider: activeTab,
      selectedModel: sanitizedModel
    });
    setConfig(updated);
    onClose();
  };

  const handleCopyShareInstruction = () => {
    soundService.playClick();
    const text = `Cara bagikan BelajarEnglish ke teman tanpa perlu install Ollama:
1. Masukkan API Key gratis Groq (dari console.groq.com) atau Gemini di Pengaturan AI aplikasi ini.
2. Atau deploy repositori ke Vercel/Netlify dan pasang VITE_GROQ_API_KEY di Environment Variables.
3. Teman cukup buka link URL di browser HP/Laptop dan langsung aktif 100%!`;
    navigator.clipboard.writeText(text);
    setCopiedShareGuide(true);
    setTimeout(() => setCopiedShareGuide(false), 2500);
  };

  if (!isOpen) return null;

  const currentMeta = PROVIDER_METADATA[activeTab] || PROVIDER_METADATA[AI_PROVIDERS.GROQ];

  return (
    <div className="ai-modal-overlay" onClick={onClose}>
      <div className="ai-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-modal-header">
          <div className="header-title-wrap">
            <div className="ai-modal-badge">
              <Sparkles size={16} color="#00e5ff" />
              <span>AI Engine & Cloud Switcher</span>
            </div>
            <h2>Pengaturan Sumber AI</h2>
            <p className="ai-modal-subtitle">
              Pilih mesin AI untuk fitur <strong>AI English Editor</strong> & <strong>Linguistics Tutor</strong>. Bagikan ke teman tanpa repot!
            </p>
          </div>
          <button className="close-btn" onClick={onClose} title="Tutup">
            <X size={20} />
          </button>
        </div>

        {/* Provider Tabs */}
        <div className="provider-tabs-bar">
          <button 
            className={`provider-tab ${activeTab === AI_PROVIDERS.GROQ ? 'active groq' : ''}`}
            onClick={() => handleTabChange(AI_PROVIDERS.GROQ)}
          >
            <Zap size={16} className="tab-icon" />
            <div className="tab-label-wrap">
              <span className="tab-name">Groq Cloud</span>
              <span className="tab-pill recommended">GRATIS & TERCEPAT ⚡</span>
            </div>
          </button>

          <button 
            className={`provider-tab ${activeTab === AI_PROVIDERS.GEMINI ? 'active gemini' : ''}`}
            onClick={() => handleTabChange(AI_PROVIDERS.GEMINI)}
          >
            <Sparkles size={16} className="tab-icon" />
            <div className="tab-label-wrap">
              <span className="tab-name">Google Gemini</span>
              <span className="tab-pill">FREE TIER 🌟</span>
            </div>
          </button>

          <button 
            className={`provider-tab ${activeTab === AI_PROVIDERS.OLLAMA ? 'active ollama' : ''}`}
            onClick={() => handleTabChange(AI_PROVIDERS.OLLAMA)}
          >
            <Cpu size={16} className="tab-icon" />
            <div className="tab-label-wrap">
              <span className="tab-name">Local Ollama</span>
              <span className="tab-pill">OFFLINE 🖥️</span>
            </div>
          </button>

          <button 
            className={`provider-tab ${activeTab === AI_PROVIDERS.OPENAI ? 'active openai' : ''}`}
            onClick={() => handleTabChange(AI_PROVIDERS.OPENAI)}
          >
            <Globe size={16} className="tab-icon" />
            <div className="tab-label-wrap">
              <span className="tab-name">OpenAI / Custom</span>
              <span className="tab-pill">CUSTOM 🌐</span>
            </div>
          </button>
        </div>

        {/* Tab Body */}
        <div className="ai-modal-body">
          {/* Provider Overview Banner */}
          <div className={`provider-intro-card ${activeTab}`}>
            <div className="intro-header">
              <div className="intro-badge">{currentMeta.badge}</div>
              {currentMeta.recommended && (
                <div className="sharing-hero-chip">
                  <Share2 size={13} />
                  <span>Sangat Cocok untuk Teman Anda!</span>
                </div>
              )}
            </div>
            <p className="intro-desc">{currentMeta.description}</p>
          </div>

          {/* Form Fields according to Active Tab */}
          <div className="form-group-section">
            {/* GROQ FORM */}
            {activeTab === AI_PROVIDERS.GROQ && (
              <>
                <div className="field-block">
                  <div className="field-label-row">
                    <label className="field-label">
                      <Key size={14} />
                      Groq API Key (Gratis)
                    </label>
                    <a 
                      href={currentMeta.getKeyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="link-helper"
                    >
                      Dapatkan API Key Gratis (30 Detik) <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="input-password-wrapper">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="gsk_..."
                      value={config.groqApiKey || ''}
                      onChange={(e) => setConfig({ ...config, groqApiKey: e.target.value })}
                      className="styled-input"
                    />
                    <button 
                      type="button" 
                      className="toggle-vis-btn"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p className="field-hint">
                    API Key disimpan aman di browser Anda. Groq menyediakan 14.400 permintaan gratis per hari dengan kecepatan kilat.
                  </p>
                </div>

                <div className="field-block">
                  <label className="field-label">
                    <Cpu size={14} />
                    Pilihan Model AI
                  </label>
                  <select
                    value={config.selectedModel || 'llama-3.3-70b-versatile'}
                    onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                    className="styled-select"
                  >
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id}>{m.label || m.id}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* GEMINI FORM */}
            {activeTab === AI_PROVIDERS.GEMINI && (
              <>
                <div className="field-block">
                  <div className="field-label-row">
                    <label className="field-label">
                      <Key size={14} />
                      Google Gemini API Key
                    </label>
                    <a 
                      href={currentMeta.getKeyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="link-helper"
                    >
                      Dapatkan Key di Google AI Studio <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="input-password-wrapper">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="AIzaSy..."
                      value={config.geminiApiKey || ''}
                      onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                      className="styled-input"
                    />
                    <button 
                      type="button" 
                      className="toggle-vis-btn"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="field-block">
                  <label className="field-label">
                    <Cpu size={14} />
                    Pilihan Model Gemini
                  </label>
                  <select
                    value={config.selectedModel && config.selectedModel.startsWith('gemini') && config.selectedModel !== 'gemini-1.5-flash' ? config.selectedModel : 'gemini-flash-latest'}
                    onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                    className="styled-select"
                  >
                    {availableModels.map(m => (
                      <option key={m.id} value={m.id}>{m.label || m.id}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* OLLAMA FORM */}
            {activeTab === AI_PROVIDERS.OLLAMA && (
              <>
                <div className="field-block">
                  <label className="field-label">
                    <Globe size={14} />
                    Ollama Base URL / Proxy
                  </label>
                  <input
                    type="text"
                    value={config.ollamaBaseUrl || '/api/ollama'}
                    onChange={(e) => setConfig({ ...config, ollamaBaseUrl: e.target.value })}
                    className="styled-input"
                    placeholder="/api/ollama"
                  />
                  <p className="field-hint">
                    Default <code>/api/ollama</code> otomatis mem-proxy ke <code>http://localhost:11434</code> saat menjalankan vite dev.
                  </p>
                </div>

                <div className="field-block">
                  <label className="field-label">
                    <Cpu size={14} />
                    Model Lokal Terpasang
                  </label>
                  <select
                    value={config.selectedModel || 'gemma3:4b'}
                    onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                    className="styled-select"
                  >
                    {availableModels.map(m => (
                      <option key={m.id || m} value={m.id || m}>{m.label || m.id || m}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {/* OPENAI / CUSTOM FORM */}
            {activeTab === AI_PROVIDERS.OPENAI && (
              <>
                <div className="field-block">
                  <label className="field-label">
                    <Globe size={14} />
                    Base URL (OpenAI / OpenRouter / DeepSeek)
                  </label>
                  <input
                    type="text"
                    value={config.openaiBaseUrl || 'https://api.openai.com/v1'}
                    onChange={(e) => setConfig({ ...config, openaiBaseUrl: e.target.value })}
                    className="styled-input"
                    placeholder="https://api.openai.com/v1"
                  />
                </div>

                <div className="field-block">
                  <label className="field-label">
                    <Key size={14} />
                    API Key
                  </label>
                  <div className="input-password-wrapper">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      placeholder="sk-..."
                      value={config.openaiApiKey || ''}
                      onChange={(e) => setConfig({ ...config, openaiApiKey: e.target.value })}
                      className="styled-input"
                    />
                    <button 
                      type="button" 
                      className="toggle-vis-btn"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="field-block">
                  <label className="field-label">
                    <Cpu size={14} />
                    Nama Model
                  </label>
                  <input
                    type="text"
                    value={config.selectedModel || 'gpt-4o-mini'}
                    onChange={(e) => setConfig({ ...config, selectedModel: e.target.value })}
                    className="styled-input"
                    placeholder="gpt-4o-mini / deepseek-chat"
                  />
                </div>
              </>
            )}

            {/* Test Connection Button & Result */}
            <div className="test-row">
              <button 
                type="button" 
                onClick={handleTestConnection}
                disabled={isTesting}
                className={`test-conn-btn ${isTesting ? 'loading' : ''}`}
              >
                <RefreshCw size={15} className={isTesting ? 'spin-icon' : ''} />
                <span>{isTesting ? 'Menguji Koneksi...' : `Uji Koneksi ${currentMeta.name}`}</span>
              </button>

              {testResult && (
                <div className={`test-feedback-chip ${testResult.success ? 'success' : 'error'}`}>
                  {testResult.success ? <Check size={14} /> : <AlertTriangle size={14} />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>

            {/* Zero-Install Sharing Box */}
            <div className="share-guide-card">
              <div className="share-guide-header">
                <div className="icon-badge"><Share2 size={16} color="#00e5ff" /></div>
                <div>
                  <h4>Tips: Cara Berbagi ke Teman (Zero-Install)</h4>
                  <p>Teman Anda tidak perlu download apa pun untuk menikmati fitur AI ini!</p>
                </div>
              </div>
              <ul className="share-steps-list">
                <li><strong>Opsi 1 (Paling Cepat):</strong> Berikan free API Key Groq Anda ke teman untuk ditempel di menu ini.</li>
                <li><strong>Opsi 2 (Otomatis):</strong> Deploy aplikasi ini ke <strong>Vercel</strong> / <strong>Netlify</strong>, pasang variabel lingkungan <code>VITE_GROQ_API_KEY</code> di Vercel Dashboard. Teman Anda langsung tinggal buka link web dan semua fitur AI otomatis aktif!</li>
              </ul>
              <button 
                type="button" 
                onClick={handleCopyShareInstruction}
                className="copy-guide-btn"
              >
                {copiedShareGuide ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedShareGuide ? 'Panduan Tersalin ke Clipboard!' : 'Salin Ringkasan Panduan Berbagi'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="ai-modal-footer">
          <div className="footer-status-pill">
            <span className="dot-indicator active" />
            <span>Mode Aktif: <strong>{currentMeta.name}</strong></span>
          </div>

          <div className="footer-action-buttons">
            <button type="button" onClick={onClose} className="cancel-btn">
              Batal
            </button>
            <button type="button" onClick={handleSave} className="save-btn">
              <ShieldCheck size={16} />
              <span>Simpan & Terapkan</span>
            </button>
          </div>
        </div>

        <style>{`
          .ai-modal-overlay {
            position: fixed;
            inset: 0;
            z-index: 9999;
            background: rgba(8, 12, 20, 0.75);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px;
            animation: fadeIn 0.2s ease-out;
          }

          .ai-modal-container {
            background: var(--bg-card, #131b26);
            border: 1px solid rgba(0, 229, 255, 0.25);
            border-radius: var(--radius-lg, 16px);
            width: 100%;
            max-width: 680px;
            max-height: 90vh;
            display: flex;
            flex-direction: column;
            box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(0, 229, 255, 0.1);
            overflow: hidden;
            animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .ai-modal-header {
            padding: 20px 24px 16px;
            border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
          }

          .ai-modal-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: #00e5ff;
            background: rgba(0, 229, 255, 0.1);
            padding: 4px 10px;
            border-radius: 20px;
            margin-bottom: 6px;
          }

          .ai-modal-header h2 {
            margin: 0 0 4px;
            font-size: 1.35rem;
            font-weight: 800;
            color: var(--text-main, #ffffff);
          }

          .ai-modal-subtitle {
            margin: 0;
            font-size: 0.85rem;
            color: var(--text-sub, #94a3b8);
            line-height: 1.4;
          }

          .close-btn {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--border-color, rgba(255,255,255,0.1));
            color: var(--text-sub, #94a3b8);
            width: 34px;
            height: 34px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: rgba(255, 255, 255, 0.15);
            color: #fff;
          }

          .provider-tabs-bar {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
            padding: 12px 20px 0;
            background: rgba(0, 0, 0, 0.15);
            border-bottom: 1px solid var(--border-color, rgba(255,255,255,0.08));
          }

          .provider-tab {
            background: transparent;
            border: none;
            border-bottom: 2px solid transparent;
            padding: 10px 8px 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            transition: all 0.2s;
            color: var(--text-sub, #94a3b8);
          }

          .provider-tab:hover {
            color: var(--text-main, #ffffff);
            background: rgba(255, 255, 255, 0.03);
          }

          .provider-tab.active {
            color: #00e5ff;
            border-bottom-color: #00e5ff;
            background: rgba(0, 229, 255, 0.06);
          }

          .provider-tab.active.groq {
            color: #f59e0b;
            border-bottom-color: #f59e0b;
            background: rgba(245, 158, 11, 0.08);
          }

          .tab-label-wrap {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 2px;
          }

          .tab-name {
            font-size: 0.82rem;
            font-weight: 700;
          }

          .tab-pill {
            font-size: 0.65rem;
            padding: 2px 6px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.08);
            font-weight: 600;
          }

          .tab-pill.recommended {
            background: #f59e0b;
            color: #111;
            font-weight: 800;
          }

          .ai-modal-body {
            padding: 20px 24px;
            overflow-y: auto;
            flex: 1;
          }

          .provider-intro-card {
            background: rgba(0, 229, 255, 0.06);
            border: 1px solid rgba(0, 229, 255, 0.2);
            border-radius: var(--radius-md, 12px);
            padding: 14px 16px;
            margin-bottom: 20px;
          }

          .provider-intro-card.groq {
            background: rgba(245, 158, 11, 0.08);
            border-color: rgba(245, 158, 11, 0.3);
          }

          .intro-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .intro-badge {
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.05em;
            color: var(--text-main, #ffffff);
          }

          .sharing-hero-chip {
            display: inline-flex;
            align-items: center;
            gap: 5px;
            background: #10b981;
            color: #ffffff;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: 12px;
          }

          .intro-desc {
            margin: 0;
            font-size: 0.85rem;
            color: var(--text-sub, #cbd5e1);
            line-height: 1.5;
          }

          .field-block {
            margin-bottom: 16px;
          }

          .field-label-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 6px;
          }

          .field-label {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.85rem;
            font-weight: 700;
            color: var(--text-main, #ffffff);
            margin-bottom: 6px;
          }

          .link-helper {
            display: inline-flex;
            align-items: center;
            gap: 4px;
            font-size: 0.78rem;
            color: #00e5ff;
            text-decoration: none;
            font-weight: 600;
          }

          .link-helper:hover {
            text-decoration: underline;
          }

          .input-password-wrapper {
            position: relative;
            display: flex;
            align-items: center;
          }

          .styled-input, .styled-select {
            width: 100%;
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid var(--border-color, rgba(255,255,255,0.12));
            color: var(--text-main, #ffffff);
            padding: 10px 14px;
            border-radius: var(--radius-sm, 8px);
            font-size: 0.9rem;
            outline: none;
            transition: all 0.2s;
            font-family: inherit;
          }

          .styled-input:focus, .styled-select:focus {
            border-color: #00e5ff;
            box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.15);
          }

          .toggle-vis-btn {
            position: absolute;
            right: 10px;
            background: transparent;
            border: none;
            color: var(--text-sub, #94a3b8);
            cursor: pointer;
            padding: 4px;
            display: flex;
            align-items: center;
          }

          .field-hint {
            margin: 6px 0 0;
            font-size: 0.78rem;
            color: var(--text-sub, #94a3b8);
            line-height: 1.4;
          }

          .test-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 18px;
            padding-top: 14px;
            border-top: 1px dashed var(--border-color, rgba(255,255,255,0.1));
          }

          .test-conn-btn {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid var(--border-color, rgba(255,255,255,0.15));
            color: var(--text-main, #ffffff);
            padding: 8px 16px;
            border-radius: var(--radius-sm, 8px);
            font-size: 0.84rem;
            font-weight: 700;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
            transition: all 0.2s;
          }

          .test-conn-btn:hover {
            background: rgba(255, 255, 255, 0.15);
          }

          .test-conn-btn.loading {
            opacity: 0.7;
            cursor: wait;
          }

          .spin-icon {
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            100% { transform: rotate(360deg); }
          }

          .test-feedback-chip {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            font-size: 0.82rem;
            padding: 6px 12px;
            border-radius: 20px;
            animation: fadeIn 0.2s;
          }

          .test-feedback-chip.success {
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.3);
            color: #34d399;
          }

          .test-feedback-chip.error {
            background: rgba(239, 68, 68, 0.15);
            border: 1px solid rgba(239, 68, 68, 0.3);
            color: #f87171;
          }

          .share-guide-card {
            margin-top: 22px;
            background: rgba(30, 41, 59, 0.5);
            border: 1px solid rgba(0, 229, 255, 0.15);
            border-radius: var(--radius-md, 12px);
            padding: 16px;
          }

          .share-guide-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
          }

          .share-guide-header h4 {
            margin: 0 0 2px;
            font-size: 0.92rem;
            font-weight: 800;
            color: #00e5ff;
          }

          .share-guide-header p {
            margin: 0;
            font-size: 0.78rem;
            color: var(--text-sub, #94a3b8);
          }

          .share-steps-list {
            margin: 0 0 12px;
            padding-left: 20px;
            font-size: 0.82rem;
            color: var(--text-sub, #cbd5e1);
            line-height: 1.5;
          }

          .copy-guide-btn {
            background: rgba(0, 229, 255, 0.12);
            border: 1px solid rgba(0, 229, 255, 0.25);
            color: #00e5ff;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
          }

          .copy-guide-btn:hover {
            background: rgba(0, 229, 255, 0.2);
          }

          .ai-modal-footer {
            padding: 16px 24px;
            background: rgba(0, 0, 0, 0.2);
            border-top: 1px solid var(--border-color, rgba(255,255,255,0.08));
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .footer-status-pill {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            font-size: 0.82rem;
            color: var(--text-sub, #94a3b8);
          }

          .dot-indicator {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 8px #10b981;
          }

          .footer-action-buttons {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .cancel-btn {
            background: transparent;
            border: 1px solid var(--border-color, rgba(255,255,255,0.15));
            color: var(--text-sub, #94a3b8);
            padding: 8px 16px;
            border-radius: var(--radius-sm, 8px);
            font-size: 0.88rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }

          .cancel-btn:hover {
            color: var(--text-main, #ffffff);
            background: rgba(255,255,255,0.05);
          }

          .save-btn {
            background: linear-gradient(135deg, #00e5ff, #00b4d8);
            border: none;
            color: #03141f;
            padding: 8px 18px;
            border-radius: var(--radius-sm, 8px);
            font-size: 0.88rem;
            font-weight: 800;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            box-shadow: 0 4px 14px rgba(0, 229, 255, 0.35);
            transition: all 0.2s;
          }

          .save-btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 6px 20px rgba(0, 229, 255, 0.45);
          }

          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes slideUp {
            from { opacity: 0; transform: translateY(12px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }

          @media (max-width: 640px) {
            .provider-tabs-bar {
              grid-template-columns: repeat(2, 1fr);
            }
            .ai-modal-footer {
              flex-direction: column;
              gap: 12px;
              align-items: stretch;
            }
            .footer-action-buttons {
              justify-content: flex-end;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
