import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  BookOpen, 
  GitBranch, 
  Layers, 
  ArrowRight, 
  AlertCircle, 
  Mic, 
  MicOff, 
  Info,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Cpu,
  RefreshCw
} from 'lucide-react';
import { nuanceDictionaryService, QUICK_SUGGESTION_WORDS } from '../services/nuanceDictionaryService';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';

export default function IndonesianEnglishWordExplorer({ onAddXp }) {
  const [searchTerm, setSearchTerm] = useState('manusia');
  const [activeResult, setActiveResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [playingAudioId, setPlayingAudioId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [searchHistory, setSearchHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('lingo_nuance_search_history');
      return saved ? JSON.parse(saved) : ['manusia', 'rajin', 'sukses'];
    } catch {
      return ['manusia', 'rajin', 'sukses'];
    }
  });

  const inputRef = useRef(null);

  // Load initial search on mount
  useEffect(() => {
    handleSearch('manusia');
  }, []);

  const handleSearch = async (wordToSearch) => {
    const query = (wordToSearch || searchTerm || '').trim();
    if (!query) return;

    soundService.playClick();
    setIsLoading(true);

    try {
      const res = await nuanceDictionaryService.searchWordNuances(query);
      setActiveResult(res);
      setSearchTerm(query);

      // Save to recent search history
      setSearchHistory(prev => {
        const filtered = prev.filter(w => w.toLowerCase() !== query.toLowerCase());
        const updated = [query, ...filtered].slice(0, 8);
        try {
          localStorage.setItem('lingo_nuance_search_history', JSON.stringify(updated));
        } catch (e) {
          console.warn(e);
        }
        return updated;
      });

      if (onAddXp) onAddXp(5);
    } catch (err) {
      console.error('Search failed:', err);
      soundService.playWrong();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text, audioId) => {
    soundService.playClick();
    if (playingAudioId === audioId) {
      speechService.stop();
      setPlayingAudioId(null);
    } else {
      setPlayingAudioId(audioId);
      speechService.speak(text, {
        onEnd: () => setPlayingAudioId(null),
        onError: () => setPlayingAudioId(null)
      });
    }
  };

  const handleCopy = (text, id) => {
    soundService.playClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Speech Recognition for Indonesian Voice Search
  const toggleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Browser Anda belum mendukung input suara.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        soundService.playClick();
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim().toLowerCase();
        // Remove trailing periods or punctuation
        const cleanWord = transcript.replace(/[.,?!]/g, '');
        setSearchTerm(cleanWord);
        setIsListening(false);
        handleSearch(cleanWord);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.warn(e);
      setIsListening(false);
    }
  };

  const data = activeResult?.data;

  return (
    <div className="nuance-explorer-root">
      {/* Header Banner */}
      <div className="nuance-header-card">
        <div className="header-badge-row">
          <span className="hero-pill">
            <Sparkles size={14} color="#f59e0b" />
            <span>Kamus Padanan & Nuansa Bahasa Indonesia ➔ Inggris</span>
          </span>
          {activeResult?.source && (
            <span className="engine-source-pill">
              <Cpu size={12} />
              <span>{activeResult.source}</span>
            </span>
          )}
        </div>

        <h2 className="header-title">Temukan Kata Inggris yang Paling Tepat</h2>
        <p className="header-desc">
          Sering bingung memilih antara <strong>"human"</strong> atau <strong>"man"</strong>? Atau <strong>"diligent"</strong> vs <strong>"hardworking"</strong>? 
          Ketik 1 kata bahasa Indonesia di bawah untuk melihat perbandingan nuansa, sinonim, antonim, dan keluarga katanya!
        </p>

        {/* Search Input Bar */}
        <form 
          className="search-form-row" 
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch(searchTerm);
          }}
        >
          <div className="search-input-wrap">
            <Search size={18} className="search-icon-inside" />
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ketik kata Indonesia (misal: manusia, rajin, sukses, adil, marah)..."
              className="search-input-field"
            />
            {searchTerm && (
              <button 
                type="button" 
                onClick={() => setSearchTerm('')} 
                className="clear-input-btn"
                title="Hapus"
              >
                ×
              </button>
            )}
          </div>

          {/* Voice Search Button */}
          <button
            type="button"
            onClick={toggleVoiceSearch}
            className={`voice-search-btn ${isListening ? 'listening' : ''}`}
            title="Cari lewat suara (Bahasa Indonesia)"
          >
            {isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>

          {/* Submit Search Button */}
          <button 
            type="submit" 
            disabled={isLoading || !searchTerm.trim()}
            className={`search-submit-btn ${isLoading ? 'loading' : ''}`}
          >
            {isLoading ? (
              <>
                <RefreshCw size={16} className="spin-icon" />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <span>Cari Padanan</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="quick-suggestions-row">
          <span className="quick-title">Coba Kata Populer:</span>
          <div className="quick-chips-wrap">
            {QUICK_SUGGESTION_WORDS.map((item) => (
              <button
                key={item.word}
                type="button"
                onClick={() => handleSearch(item.word)}
                className={`quick-chip-btn ${searchTerm.toLowerCase() === item.word.toLowerCase() ? 'active' : ''}`}
              >
                <span className="chip-word">{item.word}</span>
                <span className="chip-hint">({item.hint})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="explorer-loading-card">
          <div className="loading-spinner" />
          <p>Menganalisis nuansa linguistik dan padanan kata untuk <strong>"{searchTerm}"</strong>...</p>
        </div>
      )}

      {/* Results View */}
      {!isLoading && data && (
        <div className="explorer-results-container">
          {/* Summary Banner */}
          <div className="query-summary-banner">
            <div className="summary-left">
              <span className="summary-query-label">KATA INDONESIA:</span>
              <h3 className="summary-query-word">"{data.query}"</h3>
            </div>
            <p className="summary-desc-text">{data.summary}</p>
          </div>

          {/* Section 1: Distinct English Equivalents (Perbandingan Nuansa) */}
          <div className="section-block">
            <div className="section-title-row">
              <BookOpen size={18} color="#00e5ff" />
              <h3>Pilihan Padanan Kata Bahasa Inggris & Rasa Bahasanya</h3>
              <span className="section-count-badge">{data.equivalents?.length || 0} Pilihan Kata</span>
            </div>

            <div className="equivalents-grid">
              {data.equivalents?.map((item, idx) => {
                const audioKey = `equiv_${item.word}_${idx}`;
                const isPlaying = playingAudioId === audioKey;

                return (
                  <div key={item.word} className="equivalent-card">
                    <div className="equiv-header">
                      <div className="equiv-word-wrap">
                        <div className="word-and-speech">
                          <h4 className="equiv-english-word">{item.word}</h4>
                          <button
                            type="button"
                            onClick={() => handleSpeak(item.word, audioKey)}
                            className={`audio-bubble-btn ${isPlaying ? 'playing' : ''}`}
                            title="Dengarkan pengucapan"
                          >
                            {isPlaying ? <VolumeX size={15} /> : <Volume2 size={15} />}
                          </button>
                        </div>
                        {item.ipa && <span className="equiv-ipa-text">{item.ipa}</span>}
                      </div>

                      <div className="equiv-badges-wrap">
                        <span className="pos-badge">{item.partOfSpeech}</span>
                        {item.formality && <span className="formality-badge">{item.formality}</span>}
                      </div>
                    </div>

                    {item.badge && (
                      <div className="nuance-highlight-chip">
                        <span>{item.badge}</span>
                      </div>
                    )}

                    {/* Deep Nuance Explanation */}
                    <div className="nuance-explanation-box">
                      <p className="nuance-desc">{item.nuanceExplanation}</p>
                      {item.whenToUse && (
                        <div className="when-to-use-tip">
                          <strong>Kapan dipakai:</strong> {item.whenToUse}
                        </div>
                      )}
                    </div>

                    {/* Example Sentence */}
                    {item.exampleSentenceEn && (
                      <div className="example-sentence-box">
                        <div className="example-en-row">
                          <p className="example-en-text">"{item.exampleSentenceEn}"</p>
                          <div className="example-actions">
                            <button
                              type="button"
                              onClick={() => handleSpeak(item.exampleSentenceEn, `sentence_${idx}`)}
                              className="example-audio-btn"
                              title="Dengarkan kalimat"
                            >
                              <Volume2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopy(item.exampleSentenceEn, `copy_${idx}`)}
                              className="example-copy-btn"
                              title="Salin kalimat"
                            >
                              {copiedId === `copy_${idx}` ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                        {item.exampleSentenceId && (
                          <p className="example-id-text">{item.exampleSentenceId}</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 2: Word Family / Pohon Kata Turunan */}
          {data.wordFamily && data.wordFamily.length > 0 && (
            <div className="section-block">
              <div className="section-title-row">
                <GitBranch size={18} color="#a855f7" />
                <h3>Keluarga & Turunan Kata (Word Family)</h3>
                <span className="section-helper-text">Bentuk Noun, Adjective, Verb, dan Adverb</span>
              </div>

              <div className="word-family-grid">
                {data.wordFamily.map((wf, wIdx) => {
                  const wfAudioKey = `wf_${wf.word}_${wIdx}`;
                  return (
                    <div key={wf.word} className="word-family-item-card">
                      <div className="wf-top-row">
                        <div className="wf-word-group">
                          <span className="wf-word">{wf.word}</span>
                          <button
                            type="button"
                            onClick={() => handleSpeak(wf.word, wfAudioKey)}
                            className="mini-speak-btn"
                          >
                            <Volume2 size={13} />
                          </button>
                        </div>
                        <span className="wf-pos-chip">{wf.partOfSpeech}</span>
                      </div>
                      {wf.ipa && <span className="wf-ipa">{wf.ipa}</span>}
                      <p className="wf-meaning">{wf.meaning}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 3: Synonyms & Antonyms (Dua Kolom Komparatif) */}
          <div className="synonym-antonym-dual-row">
            {/* Synonyms */}
            <div className="lexical-col synonyms">
              <div className="col-header">
                <span className="col-icon">✨</span>
                <h4>Sinonim (Kata Serupa)</h4>
              </div>
              <div className="chips-container">
                {data.synonyms?.map((syn) => (
                  <div key={syn.word} className="lexical-chip syn">
                    <div className="chip-head">
                      <strong className="chip-word-en">{syn.word}</strong>
                      <button
                        type="button"
                        onClick={() => handleSpeak(syn.word, `syn_${syn.word}`)}
                        className="micro-audio-btn"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                    {syn.nuance && <span className="chip-nuance-id">{syn.nuance}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Antonyms */}
            <div className="lexical-col antonyms">
              <div className="col-header">
                <span className="col-icon">⚡</span>
                <h4>Antonim (Lawan Kata)</h4>
              </div>
              <div className="chips-container">
                {data.antonyms?.map((ant) => (
                  <div key={ant.word} className="lexical-chip ant">
                    <div className="chip-head">
                      <strong className="chip-word-en">{ant.word}</strong>
                      <button
                        type="button"
                        onClick={() => handleSpeak(ant.word, `ant_${ant.word}`)}
                        className="micro-audio-btn"
                      >
                        <Volume2 size={12} />
                      </button>
                    </div>
                    {ant.meaning && <span className="chip-nuance-id">{ant.meaning}</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Common Mistakes & Practical Tips */}
          {data.commonMistakes && (
            <div className="common-mistakes-card">
              <div className="mistakes-header">
                <AlertCircle size={18} color="#f59e0b" />
                <h4>Perhatian & Kesalahan Umum Pembelajar</h4>
              </div>
              <p className="mistakes-body">{data.commonMistakes}</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .nuance-explorer-root {
          width: 100%;
          max-width: 900px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* Header Card */
        .nuance-header-card {
          background: var(--bg-card, #131b26);
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          border-radius: var(--radius-lg, 18px);
          padding: 24px 28px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
        }

        .header-badge-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 12px;
        }

        .hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 4px 12px;
          border-radius: 20px;
          letter-spacing: 0.02em;
        }

        .engine-source-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.72rem;
          color: var(--text-sub, #94a3b8);
          background: rgba(255, 255, 255, 0.05);
          padding: 3px 8px;
          border-radius: 12px;
        }

        .header-title {
          font-size: 1.6rem;
          font-weight: 900;
          color: var(--text-main, #ffffff);
          margin: 0 0 8px;
          letter-spacing: -0.01em;
        }

        .header-desc {
          margin: 0 0 20px;
          font-size: 0.9rem;
          color: var(--text-sub, #94a3b8);
          line-height: 1.5;
        }

        .header-desc strong {
          color: var(--text-main, #ffffff);
        }

        /* Search Form */
        .search-form-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .search-input-wrap {
          position: relative;
          flex: 1;
          display: flex;
          align-items: center;
        }

        .search-icon-inside {
          position: absolute;
          left: 14px;
          color: var(--text-sub, #94a3b8);
          pointer-events: none;
        }

        .search-input-field {
          width: 100%;
          background: rgba(15, 23, 42, 0.75);
          border: 1.5px solid var(--border-color, rgba(255,255,255,0.12));
          border-radius: var(--radius-md, 12px);
          padding: 12px 38px 12px 42px;
          color: var(--text-main, #ffffff);
          font-size: 0.98rem;
          font-weight: 600;
          outline: none;
          transition: all 0.2s;
        }

        .search-input-field:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 0 4px rgba(0, 229, 255, 0.15);
          background: rgba(15, 23, 42, 0.9);
        }

        .clear-input-btn {
          position: absolute;
          right: 12px;
          background: transparent;
          border: none;
          color: var(--text-sub, #94a3b8);
          font-size: 1.2rem;
          cursor: pointer;
          line-height: 1;
        }

        .voice-search-btn {
          width: 46px;
          height: 46px;
          border-radius: var(--radius-md, 12px);
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid var(--border-color, rgba(255,255,255,0.12));
          color: var(--text-main, #ffffff);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .voice-search-btn:hover {
          background: rgba(255, 255, 255, 0.12);
        }

        .voice-search-btn.listening {
          background: rgba(239, 68, 68, 0.2);
          border-color: #ef4444;
          color: #ef4444;
          animation: pulseRed 1.2s infinite;
        }

        @keyframes pulseRed {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.08); }
        }

        .search-submit-btn {
          background: linear-gradient(135deg, #00e5ff, #00b4d8);
          color: #03141f;
          border: none;
          border-radius: var(--radius-md, 12px);
          padding: 0 22px;
          height: 46px;
          font-size: 0.92rem;
          font-weight: 800;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(0, 229, 255, 0.35);
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .search-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(0, 229, 255, 0.45);
        }

        .search-submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spin-icon {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        /* Quick Suggestion Chips */
        .quick-suggestions-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .quick-title {
          font-size: 0.78rem;
          color: var(--text-sub, #94a3b8);
          font-weight: 700;
        }

        .quick-chips-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .quick-chip-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          padding: 4px 10px;
          border-radius: 14px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          transition: all 0.2s;
        }

        .quick-chip-btn:hover {
          background: rgba(0, 229, 255, 0.12);
          border-color: rgba(0, 229, 255, 0.3);
          transform: translateY(-1px);
        }

        .quick-chip-btn.active {
          background: rgba(0, 229, 255, 0.18);
          border-color: #00e5ff;
        }

        .chip-word {
          font-size: 0.8rem;
          font-weight: 800;
          color: var(--text-main, #ffffff);
        }

        .chip-hint {
          font-size: 0.7rem;
          color: var(--text-sub, #94a3b8);
        }

        /* Loading View */
        .explorer-loading-card {
          padding: 48px 24px;
          background: var(--bg-card, #131b26);
          border-radius: 16px;
          border: 1px dashed var(--border-color, rgba(255,255,255,0.1));
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: var(--text-sub, #94a3b8);
          font-size: 0.95rem;
        }

        .loading-spinner {
          width: 38px;
          height: 38px;
          border: 3px solid rgba(0, 229, 255, 0.2);
          border-top-color: #00e5ff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Results Container */
        .explorer-results-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Query Summary Banner */
        .query-summary-banner {
          background: linear-gradient(135deg, rgba(0, 229, 255, 0.08), rgba(99, 102, 241, 0.08));
          border: 1px solid rgba(0, 229, 255, 0.25);
          border-radius: var(--radius-md, 14px);
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .summary-left {
          flex-shrink: 0;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          padding-right: 20px;
        }

        .summary-query-label {
          font-size: 0.7rem;
          font-weight: 900;
          color: #00e5ff;
          letter-spacing: 0.06em;
        }

        .summary-query-word {
          margin: 2px 0 0;
          font-size: 1.4rem;
          font-weight: 900;
          color: var(--text-main, #ffffff);
          text-transform: capitalize;
        }

        .summary-desc-text {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-sub, #cbd5e1);
          line-height: 1.5;
        }

        /* Section Generic */
        .section-block {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .section-title-row h3 {
          margin: 0;
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--text-main, #ffffff);
        }

        .section-count-badge {
          background: rgba(0, 229, 255, 0.12);
          color: #00e5ff;
          font-size: 0.75rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .section-helper-text {
          font-size: 0.8rem;
          color: var(--text-sub, #94a3b8);
        }

        /* Equivalents Grid */
        .equivalents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
          gap: 16px;
        }

        .equivalent-card {
          background: var(--bg-card, #131b26);
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          border-radius: var(--radius-md, 14px);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        }

        .equivalent-card:hover {
          border-color: rgba(0, 229, 255, 0.3);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        }

        .equiv-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .word-and-speech {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .equiv-english-word {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 900;
          color: #00e5ff;
        }

        .audio-bubble-btn {
          background: rgba(0, 229, 255, 0.12);
          border: 1px solid rgba(0, 229, 255, 0.25);
          color: #00e5ff;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .audio-bubble-btn:hover {
          background: rgba(0, 229, 255, 0.25);
          transform: scale(1.08);
        }

        .audio-bubble-btn.playing {
          background: #00e5ff;
          color: #03141f;
        }

        .equiv-ipa-text {
          font-family: monospace;
          font-size: 0.8rem;
          color: var(--text-sub, #94a3b8);
        }

        .equiv-badges-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }

        .pos-badge {
          font-size: 0.72rem;
          font-weight: 800;
          background: rgba(255, 255, 255, 0.08);
          color: var(--text-main, #ffffff);
          padding: 2px 8px;
          border-radius: 8px;
        }

        .formality-badge {
          font-size: 0.72rem;
          font-weight: 700;
          background: rgba(99, 102, 241, 0.15);
          color: #a5b4fc;
          padding: 2px 8px;
          border-radius: 8px;
        }

        .nuance-highlight-chip {
          background: rgba(245, 158, 11, 0.12);
          border: 1px solid rgba(245, 158, 11, 0.3);
          color: #fbbf24;
          font-size: 0.74rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: 6px;
          align-self: flex-start;
          letter-spacing: 0.04em;
        }

        .nuance-explanation-box {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 8px;
          padding: 10px 12px;
          border-left: 3px solid #00e5ff;
        }

        .nuance-desc {
          margin: 0 0 6px;
          font-size: 0.86rem;
          color: var(--text-main, #ffffff);
          line-height: 1.5;
        }

        .when-to-use-tip {
          font-size: 0.8rem;
          color: var(--text-sub, #cbd5e1);
          line-height: 1.4;
        }

        .when-to-use-tip strong {
          color: #00e5ff;
        }

        /* Example Sentence */
        .example-sentence-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid var(--border-color, rgba(255,255,255,0.06));
          border-radius: 8px;
          padding: 10px 12px;
        }

        .example-en-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .example-en-text {
          margin: 0 0 4px;
          font-size: 0.86rem;
          font-weight: 700;
          color: var(--text-main, #ffffff);
          line-height: 1.4;
          font-style: italic;
        }

        .example-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .example-audio-btn, .example-copy-btn {
          background: transparent;
          border: none;
          color: var(--text-sub, #94a3b8);
          cursor: pointer;
          padding: 3px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          transition: all 0.2s;
        }

        .example-audio-btn:hover, .example-copy-btn:hover {
          color: #00e5ff;
        }

        .example-id-text {
          margin: 0;
          font-size: 0.78rem;
          color: var(--text-sub, #94a3b8);
        }

        /* Word Family Grid */
        .word-family-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 10px;
        }

        .word-family-item-card {
          background: var(--bg-card, #131b26);
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          transition: all 0.2s;
        }

        .word-family-item-card:hover {
          border-color: rgba(168, 85, 247, 0.4);
          transform: translateY(-1px);
        }

        .wf-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .wf-word-group {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .wf-word {
          font-size: 0.95rem;
          font-weight: 800;
          color: #c084fc;
        }

        .mini-speak-btn {
          background: transparent;
          border: none;
          color: var(--text-sub, #94a3b8);
          cursor: pointer;
          padding: 2px;
          display: flex;
          align-items: center;
        }

        .mini-speak-btn:hover {
          color: #c084fc;
        }

        .wf-pos-chip {
          font-size: 0.68rem;
          font-weight: 800;
          background: rgba(168, 85, 247, 0.15);
          color: #c084fc;
          padding: 1px 6px;
          border-radius: 6px;
        }

        .wf-ipa {
          font-family: monospace;
          font-size: 0.74rem;
          color: var(--text-sub, #64748b);
        }

        .wf-meaning {
          margin: 4px 0 0;
          font-size: 0.8rem;
          color: var(--text-sub, #cbd5e1);
          line-height: 1.35;
        }

        /* Synonyms & Antonyms Dual Row */
        .synonym-antonym-dual-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .lexical-col {
          background: var(--bg-card, #131b26);
          border: 1px solid var(--border-color, rgba(255,255,255,0.08));
          border-radius: 14px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .col-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .col-header h4 {
          margin: 0;
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-main, #ffffff);
        }

        .chips-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .lexical-chip {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 8px;
          padding: 8px 10px;
          border: 1px solid var(--border-color, rgba(255,255,255,0.06));
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .lexical-chip.syn {
          border-left: 3px solid #10b981;
        }

        .lexical-chip.ant {
          border-left: 3px solid #f43f5e;
        }

        .chip-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chip-word-en {
          font-size: 0.88rem;
          color: var(--text-main, #ffffff);
        }

        .micro-audio-btn {
          background: transparent;
          border: none;
          color: var(--text-sub, #94a3b8);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .micro-audio-btn:hover {
          color: #00e5ff;
        }

        .chip-nuance-id {
          font-size: 0.76rem;
          color: var(--text-sub, #94a3b8);
        }

        /* Common Mistakes Box */
        .common-mistakes-card {
          background: rgba(245, 158, 11, 0.08);
          border: 1px solid rgba(245, 158, 11, 0.3);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .mistakes-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mistakes-header h4 {
          margin: 0;
          font-size: 0.92rem;
          font-weight: 800;
          color: #fbbf24;
        }

        .mistakes-body {
          margin: 0;
          font-size: 0.85rem;
          color: var(--text-sub, #fde68a);
          line-height: 1.45;
        }

        @media (max-width: 640px) {
          .equivalents-grid {
            grid-template-columns: 1fr;
          }
          .synonym-antonym-dual-row {
            grid-template-columns: 1fr;
          }
          .search-form-row {
            flex-direction: column;
            align-items: stretch;
          }
          .query-summary-banner {
            flex-direction: column;
            align-items: flex-start;
          }
          .summary-left {
            border-right: none;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            padding-right: 0;
            padding-bottom: 8px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
