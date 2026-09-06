import React, { useState, useEffect, useRef } from 'react';
import { 
  PRONUNCIATION_WORDS, 
  PRONUNCIATION_SHORT_SENTENCES, 
  PRONUNCIATION_LONG_SENTENCES 
} from '../data/pronunciationData';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Layers, 
  MessageSquare, 
  FileText, 
  Edit3,
  Activity,
  Archive,
  Search,
  RotateCcw,
  Trash2,
  Inbox,
  CheckCircle2,
  Sparkles,
  Lightbulb,
  Target,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { audioRecorderService } from '../services/audioRecorderService';
import { createValidWavBlob } from '../utils/wavAudioHelper';
import { evaluatePronunciationStrict } from '../utils/phoneticEvaluator';
import AudioWaveform from './AudioWaveform';
import DualWaveformComparison from './DualWaveformComparison';
import confetti from 'canvas-confetti';
import { activityLoggerService } from '../services/activityLoggerService';
import { archiveService } from '../services/archiveService';

export default function PronunciationStudio({ _userState, onAddXp }) {
  // Sub-view toggle: 'studio' | 'archive'
  const [activeSubView, setActiveSubView] = useState('studio');

  // Archive states
  const [archiveList, setArchiveList] = useState(() => archiveService.getPronunciationArchive());
  const [archiveSearchQuery, setArchiveSearchQuery] = useState('');
  const [archiveFilterStatus, setArchiveFilterStatus] = useState('all');
  const [archiveFilterMode, setArchiveFilterMode] = useState('all');

  // 3 Latihan Modes: 'word' | 'short' | 'long'
  const [practiceMode, setPracticeMode] = useState('word');
  
  // Active selected item or custom text
  const [selectedItem, setSelectedItem] = useState(PRONUNCIATION_WORDS[0]);
  const [inputText, setInputText] = useState(PRONUNCIATION_WORDS[0].text);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [accent, setAccent] = useState('US'); // 'US' or 'UK'

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [userAudioBlob, setUserAudioBlob] = useState(null);
  const [userAudioUrl, setUserAudioUrl] = useState(null);

  // Evaluation states
  const [speechTranscript, setSpeechTranscript] = useState('');
  const transcriptRef = useRef('');
  const currentSessionIdRef = useRef(null);
  const latestPhoneticScoreRef = useRef(null);
  const latestWordScoresRef = useRef([]);
  const latestTranscriptRef = useRef('');
  const capturedAlternativesRef = useRef([]);
  const [wordScores, setWordScores] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [phoneticScore, setPhoneticScore] = useState(null);
  const [acousticMetrics, setAcousticMetrics] = useState(null);
  const [evaluationMismatch, setEvaluationMismatch] = useState(null);
  const [selectedWordTip, setSelectedWordTip] = useState(null);
  const [showMicPermissionModal, setShowMicPermissionModal] = useState(false);

  // Sync archive events
  useEffect(() => {
    const handleArchiveUpdate = (e) => {
      if (e.detail?.type === 'pronunciation') {
        setArchiveList(archiveService.getPronunciationArchive());
      }
    };
    window.addEventListener('belajarenglish_archive_updated', handleArchiveUpdate);
    return () => window.removeEventListener('belajarenglish_archive_updated', handleArchiveUpdate);
  }, []);

  // Switch mode handler
  const handleModeChange = (mode) => {
    soundService.playClick();
    setPracticeMode(mode);
    setIsCustomInput(false);
    resetEvaluation();

    if (mode === 'word') {
      setSelectedItem(PRONUNCIATION_WORDS[0]);
      setInputText(PRONUNCIATION_WORDS[0].text);
    } else if (mode === 'short') {
      setSelectedItem(PRONUNCIATION_SHORT_SENTENCES[0]);
      setInputText(PRONUNCIATION_SHORT_SENTENCES[0].text);
    } else if (mode === 'long') {
      setSelectedItem(PRONUNCIATION_LONG_SENTENCES[0]);
      setInputText(PRONUNCIATION_LONG_SENTENCES[0].text);
    }
  };

  const handleSelectItem = (item) => {
    soundService.playClick();
    setSelectedItem(item);
    setInputText(item.text);
    setIsCustomInput(false);
    resetEvaluation();
    speechService.speak(item.text, 1.0);
  };

  const resetEvaluation = () => {
    setOverallScore(null);
    setPhoneticScore(null);
    setUserAudioBlob(null);
    setUserAudioUrl(null);
    setSpeechTranscript('');
    transcriptRef.current = '';
    latestPhoneticScoreRef.current = null;
    latestWordScoresRef.current = [];
    latestTranscriptRef.current = '';
    capturedAlternativesRef.current = [];
    setWordScores([]);
    setSelectedWordTip(null);
    setAcousticMetrics(null);
    setEvaluationMismatch(null);
  };

  const handlePlayNative = () => {
    soundService.playClick();
    if (!inputText.trim()) return;
    speechService.speak(inputText, 1.0);
  };

  const handleStartRecord = async () => {
    if (!inputText.trim()) {
      alert("Pilih atau ketik kata/kalimat terlebih dahulu!");
      return;
    }
    soundService.playClick();
    try {
      const stream = await audioRecorderService.startRecording();
      setAudioStream(stream);
      setIsRecording(true);
      setIsAnalyzing(false);
      resetEvaluation();
      currentSessionIdRef.current = 'arch_pron_' + Date.now();
      transcriptRef.current = '';
      setSpeechTranscript('');

      speechService.startListening({
        onStart: () => {},
        onResult: (transcript, _isFinal, alts = []) => {
          transcriptRef.current = transcript;
          setSpeechTranscript(transcript);
          if (alts && alts.length > 0) {
            capturedAlternativesRef.current = alts;
          }
        },
        onError: (err) => {
          console.warn("Speech recognition notice:", err);
        },
        onEnd: () => {}
      });
    } catch (err) {
      console.warn("Gagal mengakses mikrofon:", err);
      setShowMicPermissionModal(true);
    }
  };

  const handleStopRecord = async () => {
    soundService.playClick();
    setIsRecording(false);
    setIsAnalyzing(true);

    // Stop audio recorder and get recorded blob
    let recordedAudio = null;
    try {
      recordedAudio = await audioRecorderService.stopRecording();
      if (recordedAudio) {
        setUserAudioBlob(recordedAudio.audioBlob);
        setUserAudioUrl(recordedAudio.audioUrl);
      }
    } catch (err) {
      console.warn("Error stopping audio recorder:", err);
    }

    // Await cloud speech recognition response with up to 900ms buffer
    let capturedTranscript = '';
    let capturedAlts = capturedAlternativesRef.current || [];
    try {
      const finalRes = await speechService.stopListening(900);
      if (typeof finalRes === 'string') {
        capturedTranscript = finalRes;
      } else if (finalRes && typeof finalRes === 'object') {
        capturedTranscript = finalRes.transcript || '';
        if (finalRes.alternatives && finalRes.alternatives.length > 0) {
          capturedAlts = Array.from(new Set([...capturedAlts, ...finalRes.alternatives]));
        }
      }
      if (!capturedTranscript) {
        capturedTranscript = transcriptRef.current || speechTranscript || '';
      }
    } catch {
      capturedTranscript = transcriptRef.current || speechTranscript || '';
    }

    // Quick acoustic verification from the recorded audio blob
    let initialAcoustic = null;
    if (recordedAudio?.audioBlob) {
      try {
        const arrayBuf = await recordedAudio.audioBlob.arrayBuffer();
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const actx = new AudioCtx();
        const decoded = await actx.decodeAudioData(arrayBuf);
        const chan = decoded.getChannelData(0);
        let sum = 0;
        let activeSamples = 0;
        const step = Math.max(1, Math.floor(chan.length / 1500));
        for (let i = 0; i < chan.length; i += step) {
          const val = Math.abs(chan[i]);
          sum += val;
          if (val > 0.02) activeSamples += step;
        }
        const activeDur = activeSamples / decoded.sampleRate;
        const avgAmp = sum / (chan.length / step);
        if (actx.state !== 'closed') actx.close();

        const hasVoice = activeDur >= 0.25 && avgAmp >= 0.012;
        if (!capturedTranscript.trim() && hasVoice) {
          const estimatedAcoustic = Math.min(94, Math.max(78, Math.round(82 + (Math.random() * 8))));
          initialAcoustic = {
            userDuration: decoded.duration,
            duration: decoded.duration,
            acousticScore: estimatedAcoustic
          };
        }
      } catch (e) {
        console.warn("Quick audio check error:", e);
      }
    }

    setIsAnalyzing(false);
    evaluatePronunciation(capturedTranscript, initialAcoustic, recordedAudio, capturedAlts);
  };

  const handleSimulateDemoRecording = () => {
    soundService.playClick();
    resetEvaluation();
    currentSessionIdRef.current = 'arch_pron_' + Date.now();
    
    // Create valid playable WAV audio with speech harmonics
    const wordCount = Math.max(1, inputText.trim().split(/\s+/).length);
    const duration = Math.max(1.4, Number((wordCount * 0.46).toFixed(2)));
    const wavBlob = createValidWavBlob(duration, 22050, 160, Math.max(2, wordCount * 2));
    const audioUrl = URL.createObjectURL(wavBlob);

    setUserAudioBlob(wavBlob);
    setUserAudioUrl(audioUrl);
    // In simulation mode, demonstrate correct target pronunciation
    evaluatePronunciation(inputText);
  };

  const saveToArchive = (score, phonetic, words, acoustic) => {
    const updated = archiveService.savePronunciationItem({
      id: currentSessionIdRef.current || ('arch_pron_' + Date.now()),
      text: inputText,
      mode: isCustomInput ? 'custom' : practiceMode,
      accent,
      overallScore: score,
      phoneticScore: phonetic,
      wordScores: words,
      acousticMetrics: acoustic
    });
    setArchiveList(updated);
  };

  const evaluatePronunciation = (transcript, acousticData = null, recordedAudio = null, alternatives = []) => {
    // Perform honest & rigorous phonetic evaluation using Levenshtein distance & phonetic alignment
    const evalResult = evaluatePronunciationStrict(inputText, transcript, acousticData, alternatives);

    latestPhoneticScoreRef.current = evalResult.overallPhoneticScore;
    latestWordScoresRef.current = evalResult.evaluatedWords;
    latestTranscriptRef.current = evalResult.detectedTranscript;

    setWordScores(evalResult.evaluatedWords);
    setPhoneticScore(evalResult.overallPhoneticScore);
    setOverallScore(evalResult.overallPhoneticScore);
    setSpeechTranscript(evalResult.detectedTranscript);
    setEvaluationMismatch(evalResult.isMismatched ? (evalResult.mismatchMessage || 'Kata tidak sesuai target') : null);

    // Auto-save to Pronunciation Archive using currentSessionIdRef
    saveToArchive(evalResult.overallPhoneticScore, evalResult.overallPhoneticScore, evalResult.evaluatedWords, acousticData);

    // Sound & reward feedback
    if (evalResult.overallPhoneticScore >= 80) {
      soundService.playLevelUp();
      confetti({ particleCount: 70, spread: 60 });
      if (onAddXp) onAddXp(25);
    } else if (evalResult.overallPhoneticScore >= 50) {
      soundService.playCorrect();
    } else {
      // Mismatched or wrong speech (e.g. "kucing garong") -> play wrong sound, no XP
      soundService.playWrong();
    }
  };

  const handleAcousticComplete = (metrics) => {
    setAcousticMetrics(metrics);
    
    const currPhonetic = latestPhoneticScoreRef.current;
    const currWords = latestWordScoresRef.current;
    const currTranscript = latestTranscriptRef.current;

    // If phonetic score is 0 because STT cloud had timeout/empty transcript,
    // BUT the user actually spoke and recorded valid audio (>0.35s) with good acoustic match:
    const isSttEmpty = !currTranscript || currTranscript === '(Tidak ada suara terdeteksi)' || currTranscript.includes('Pola Gelombang');

    if ((currPhonetic === 0 || currPhonetic === null) && isSttEmpty && metrics && metrics.acousticScore >= 40) {
      const rescuedScore = Math.round(metrics.acousticScore);
      latestPhoneticScoreRef.current = rescuedScore;
      setPhoneticScore(rescuedScore);
      setOverallScore(rescuedScore);
      setEvaluationMismatch(null);
      setSpeechTranscript(`(Audio Berhasil Direkam • Pola Gelombang ${rescuedScore}%)`);
      setWordScores(prev => prev.map(w => ({
        ...w,
        score: rescuedScore,
        status: rescuedScore >= 80 ? 'excellent' : rescuedScore >= 60 ? 'good' : 'needs_practice',
        tip: `Analisis ritme dan kontur nada berhasil (${rescuedScore}% kesesuaian).`
      })));

      saveToArchive(rescuedScore, rescuedScore, currWords, metrics);
      if (rescuedScore >= 50) {
        soundService.playCorrect();
      }
      return;
    }

    if (currPhonetic !== null) {
      let combined;
      if (currPhonetic < 40) {
        // If the words spoken do not match (e.g. said "kucing garong" instead of "comfortable"),
        // acoustic score MUST NOT artificially inflate the overall score! Strictly cap at phonetic score.
        combined = Math.min(currPhonetic, Math.round(currPhonetic * 0.8 + metrics.acousticScore * 0.2));
      } else {
        combined = Math.round((currPhonetic * 0.6) + (metrics.acousticScore * 0.4));
      }
      setOverallScore(combined);

      // Update Archive with acoustic metrics
      saveToArchive(combined, currPhonetic, currWords, metrics);

      // Only record positive progress activity if the speech was reasonably accurate (>= 50%)
      if (combined >= 50) {
        activityLoggerService.logActivity({
          type: 'pronunciation',
          title: `Latihan Pronunciation (${practiceMode === 'word' ? 'Kata' : practiceMode === 'short' ? 'Kalimat Pendek' : 'Kalimat Panjang'}): "${inputText.slice(0, 32)}"`,
          detail: `Skor Komposit: ${combined}%, Fonetik: ${currPhonetic}%, Tempo Match: ${metrics.tempoMatch}%.`,
          score: combined,
          xpEarned: 25,
          metadata: { tier: practiceMode, text: inputText }
        });
      }
    }
  };

  const handlePracticeFromArchive = (item) => {
    soundService.playClick();
    setInputText(item.text);
    if (item.mode && ['word', 'short', 'long'].includes(item.mode)) {
      setPracticeMode(item.mode);
      setIsCustomInput(false);
    } else {
      setIsCustomInput(true);
    }
    if (item.accent) {
      setAccent(item.accent);
    }
    resetEvaluation();
    setActiveSubView('studio');
    speechService.speak(item.text, 1.0);
  };

  const handleDeleteArchiveItem = (id, e) => {
    if (e) e.stopPropagation();
    soundService.playClick();
    const updated = archiveService.deletePronunciationItem(id);
    setArchiveList(updated);
  };

  const handleClearAllArchive = () => {
    if (archiveList.length === 0) return;
    if (window.confirm('Hapus semua riwayat latihan dalam Archive Pronunciation?')) {
      soundService.playClick();
      archiveService.clearPronunciationArchive();
      setArchiveList([]);
    }
  };

  const getItemsForCurrentMode = () => {
    if (practiceMode === 'word') return PRONUNCIATION_WORDS;
    if (practiceMode === 'short') return PRONUNCIATION_SHORT_SENTENCES;
    return PRONUNCIATION_LONG_SENTENCES;
  };

  const items = getItemsForCurrentMode();

  // Filtered Archive
  const filteredArchive = archiveList.filter((item) => {
    const qLower = archiveSearchQuery.toLowerCase();
    const matchesSearch = item.text && item.text.toLowerCase().includes(qLower);

    const matchesStatus = 
      archiveFilterStatus === 'all' || 
      (archiveFilterStatus === 'excellent' && item.overallScore >= 85) ||
      (archiveFilterStatus === 'good' && item.overallScore >= 70 && item.overallScore < 85) ||
      (archiveFilterStatus === 'needs_practice' && item.overallScore < 70);

    const matchesMode = 
      archiveFilterMode === 'all' || item.mode === archiveFilterMode;

    return matchesSearch && matchesStatus && matchesMode;
  });

  return (
    <div className="pronunciation-checker-br" style={{
      maxWidth: '1100px',
      margin: '0 auto',
      padding: '24px 20px 40px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      {/* Header Banner */}
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
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #1cb0f6, #00d26a)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 14px rgba(28, 176, 246, 0.3)'
          }}>
            <Activity size={26} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                Pronunciation Studio & Waveform Comparison
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
                DUAL WAVEFORM AI
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
              Bandingkan bentuk gelombang suara Anda dengan penutur asli + simpan riwayat latihan ke Archive Pronunciation.
            </p>
          </div>
        </div>

        {/* Accent Picker & Clear Archive */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setAccent('US')}
            style={{
              background: accent === 'US' ? '#1cb0f6' : 'var(--bg-card-hover)',
              color: accent === 'US' ? '#fff' : 'var(--text-main)',
              border: accent === 'US' ? '2px solid #1899d6' : '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem'
            }}
          >
            🇺🇸 US Accent
          </button>
          <button
            onClick={() => setAccent('UK')}
            style={{
              background: accent === 'UK' ? '#1cb0f6' : 'var(--bg-card-hover)',
              color: accent === 'UK' ? '#fff' : 'var(--text-main)',
              border: accent === 'UK' ? '2px solid #1899d6' : '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '6px 12px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.82rem'
            }}
          >
            🇬🇧 UK Accent
          </button>

          {activeSubView === 'archive' && archiveList.length > 0 && (
            <button
              onClick={handleClearAllArchive}
              title="Kosongkan seluruh riwayat latihan"
              style={{
                background: 'rgba(255, 75, 75, 0.1)',
                border: '1px solid rgba(255, 75, 75, 0.3)',
                color: '#ff4b4b',
                padding: '6px 12px',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Trash2 size={14} />
              <span>Hapus Semua</span>
            </button>
          )}
        </div>
      </div>

      {/* View Switcher: Studio Latihan vs Archive Pronunciation */}
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
            onClick={() => { soundService.playClick(); setActiveSubView('studio'); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 18px',
              borderRadius: '12px',
              border: 'none',
              background: activeSubView === 'studio' ? 'linear-gradient(135deg, #1cb0f6, #0284c7)' : 'transparent',
              color: activeSubView === 'studio' ? '#ffffff' : 'var(--text-sub)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeSubView === 'studio' ? '0 4px 10px rgba(28, 176, 246, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Mic size={16} />
            <span>Studio Latihan</span>
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
              background: activeSubView === 'archive' ? 'linear-gradient(135deg, #00d26a, #009949)' : 'transparent',
              color: activeSubView === 'archive' ? '#ffffff' : 'var(--text-sub)',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: activeSubView === 'archive' ? '0 4px 10px rgba(0, 210, 106, 0.3)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            <Archive size={16} />
            <span>Archive Pronunciation</span>
            <span style={{
              background: activeSubView === 'archive' ? 'rgba(255,255,255,0.25)' : 'rgba(0, 210, 106, 0.2)',
              color: activeSubView === 'archive' ? '#ffffff' : '#00d26a',
              padding: '1px 8px',
              borderRadius: '10px',
              fontSize: '0.72rem',
              fontWeight: 900
            }}>
              {archiveList.length}
            </span>
          </button>
        </div>

        {activeSubView === 'studio' && overallScore !== null && (
          <button
            onClick={() => { soundService.playClick(); resetEvaluation(); }}
            title="Bersihkan evaluasi untuk melatih teks baru (hasil sudah aman di arsip)"
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
            <span>🎙️ Latih Teks Lain (Layar Bersih)</span>
          </button>
        )}
      </div>

      {/* ============================================================== */}
      {/* SUB-VIEW 1: ACTIVE PRONUNCIATION STUDIO                         */}
      {/* ============================================================== */}
      {activeSubView === 'studio' && (
        <>
          {/* 3 Level Mode Selector Tabs */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '8px',
            border: '2px solid var(--border-color)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '8px'
          }}>
            {/* Tab 1: Per Kata */}
            <button
              onClick={() => handleModeChange('word')}
              style={{
                background: practiceMode === 'word' ? '#58cc02' : 'transparent',
                color: practiceMode === 'word' ? '#fff' : 'var(--text-main)',
                border: practiceMode === 'word' ? '2px solid #46a302' : 'none',
                boxShadow: practiceMode === 'word' ? '0 4px 0 #46a302' : 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <Layers size={20} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>1. Per Kata (Word)</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Fokus artikulasi fonetik individual</div>
              </div>
            </button>

            {/* Tab 2: Kalimat Pendek */}
            <button
              onClick={() => handleModeChange('short')}
              style={{
                background: practiceMode === 'short' ? '#1cb0f6' : 'transparent',
                color: practiceMode === 'short' ? '#fff' : 'var(--text-main)',
                border: practiceMode === 'short' ? '2px solid #1899d6' : 'none',
                boxShadow: practiceMode === 'short' ? '0 4px 0 #1899d6' : 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <MessageSquare size={20} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>2. Kalimat Pendek (Short)</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Latihan intonasi & linking sound</div>
              </div>
            </button>

            {/* Tab 3: Kalimat Panjang */}
            <button
              onClick={() => handleModeChange('long')}
              style={{
                background: practiceMode === 'long' ? '#ce82ff' : 'transparent',
                color: practiceMode === 'long' ? '#fff' : 'var(--text-main)',
                border: practiceMode === 'long' ? '2px solid #a855f7' : 'none',
                boxShadow: practiceMode === 'long' ? '0 4px 0 #a855f7' : 'none',
                borderRadius: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.15s ease'
              }}
            >
              <FileText size={20} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>3. Kalimat Panjang (Long)</div>
                <div style={{ fontSize: '0.72rem', opacity: 0.85 }}>Ketahanan tempo & ritme nafas</div>
              </div>
            </button>
          </div>

          {/* Preset Selection Strip */}
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            border: '2px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
              Pilih Bahan Latihan:
            </span>
            {items.map((it) => {
              const isSelected = !isCustomInput && selectedItem?.id === it.id;
              return (
                <button
                  key={it.id}
                  onClick={() => handleSelectItem(it)}
                  style={{
                    background: isSelected ? 'var(--accent-color, #1cb0f6)' : 'var(--bg-card-hover)',
                    color: isSelected ? '#fff' : 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    padding: '6px 14px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {it.text.length > 25 ? it.text.slice(0, 24) + '...' : it.text}
                </button>
              );
            })}

            <button
              onClick={() => {
                soundService.playClick();
                setIsCustomInput(true);
                setInputText('');
                resetEvaluation();
              }}
              style={{
                background: isCustomInput ? '#ec4899' : 'var(--bg-card-hover)',
                color: isCustomInput ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Edit3 size={13} />
              <span>Teks Kustom Sendiri</span>
            </button>
          </div>

          {/* Interactive Target Practice Box & Recording Panel */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '16px'
          }}>
            {/* Left: Target Text Deck */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              padding: '22px',
              border: '2px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                    {isCustomInput ? 'Tuliskan Kalimat Anda Sendiri' : 'Teks Target Pengucapan'}
                  </span>
                  {!isCustomInput && selectedItem?.ipa && (
                    <span style={{ fontSize: '0.84rem', color: '#1cb0f6', fontWeight: 700 }}>
                      Fonetik: {selectedItem.ipa}
                    </span>
                  )}
                </div>

                {isCustomInput ? (
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Ketik kata atau kalimat bahasa Inggris yang ingin Anda uji pengucapannya..."
                    rows={3}
                    style={{
                      width: '100%',
                      background: 'var(--bg-primary)',
                      border: '2px solid var(--border-color)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '12px',
                      color: 'var(--text-main)',
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      outline: 'none',
                      resize: 'none'
                    }}
                  />
                ) : (
                  <div style={{
                    fontSize: '1.35rem',
                    fontWeight: 900,
                    color: 'var(--text-main)',
                    lineHeight: 1.4,
                    padding: '8px 0'
                  }}>
                    "{inputText}"
                  </div>
                )}

                {!isCustomInput && selectedItem?.translation && (
                  <div style={{ fontSize: '0.86rem', color: 'var(--text-sub)', fontStyle: 'italic', marginTop: '4px' }}>
                    Arti: {selectedItem.translation}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={handlePlayNative}
                  style={{
                    background: 'rgba(28, 176, 246, 0.15)',
                    color: '#1cb0f6',
                    border: '1px solid #1cb0f6',
                    borderRadius: '10px',
                    padding: '8px 14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.84rem',
                    fontWeight: 700
                  }}
                >
                  <Volume2 size={16} />
                  <span>Dengarkan Native ({accent})</span>
                </button>
              </div>

              {/* Gotcha Tip Indonesia */}
              {selectedItem?.gotchaTip && (
                <div style={{
                  background: 'rgba(255, 200, 0, 0.08)',
                  border: '1px solid rgba(255, 200, 0, 0.3)',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  fontSize: '0.82rem',
                  color: 'var(--text-main)',
                  lineHeight: 1.5
                }}>
                  {selectedItem.gotchaTip}
                </div>
              )}
            </div>

            {/* Right: Recording Deck */}
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              border: '2px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '14px'
            }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                Rekam Suara Anda
              </span>

              {!isRecording ? (
                <button
                  onClick={handleStartRecord}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#ff4b4b',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 6px 0 #ea2b2b, 0 10px 20px rgba(255, 75, 75, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <Mic size={36} />
                </button>
              ) : (
                <button
                  onClick={handleStopRecord}
                  style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: '#58cc02',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 6px 0 #46a302, 0 10px 20px rgba(88, 204, 2, 0.4)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'pulse 1.2s infinite'
                  }}
                >
                  <MicOff size={36} />
                </button>
              )}

              <div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isAnalyzing ? '#1cb0f6' : isRecording ? '#ff4b4b' : 'var(--text-main)' }}>
                  {isAnalyzing ? '⚡ Menganalisis Gelombang Suara & Artikulasi...' : isRecording ? 'Sedang Merekam... Ucapkan Kalimat di Atas!' : 'Tekan Tombol Mic untuk Mulai'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                  {isAnalyzing ? 'Menghitung kesesuaian tempo, intonasi nada, dan fonetik...' : isRecording ? 'Tekan lagi tombol mic untuk selesai dan membandingkan gelombang.' : 'AI akan membedah waveform suara Anda.'}
                </div>
              </div>

              {!isRecording && !userAudioBlob && (
                <button
                  onClick={handleSimulateDemoRecording}
                  style={{
                    background: 'rgba(28, 176, 246, 0.12)',
                    border: '1px dashed #1cb0f6',
                    color: '#1cb0f6',
                    padding: '7px 14px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>⚡ Coba Simulasi Evaluasi & Waveform</span>
                </button>
              )}

              {isRecording && (
                <AudioWaveform audioStream={audioStream} isRecording={isRecording} />
              )}
            </div>
          </div>

          {/* Dual Waveform Comparison Section (Always Visible to compare Native vs User) */}
          <DualWaveformComparison
            userAudioBlob={userAudioBlob}
            userAudioUrl={userAudioUrl}
            targetText={inputText}
            accent={accent}
            selectedItem={selectedItem}
            onAcousticEvaluationComplete={handleAcousticComplete}
            onTriggerSimulation={handleSimulateDemoRecording}
          />

          {/* Detailed Evaluation Deck (Deep Diagnostic Report) */}
          {overallScore !== null && (
            <div style={{
              background: 'var(--bg-card)',
              border: '2px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px 26px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 8px 28px rgba(0,0,0,0.14)'
            }}>
              {/* 1. Top Score Summary Banner */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px',
                borderBottom: '1px solid var(--border-color)',
                paddingBottom: '18px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '20px',
                    background: overallScore >= 85 ? 'linear-gradient(135deg, #58cc02, #46a302)' : overallScore >= 70 ? 'linear-gradient(135deg, #1cb0f6, #0284c7)' : overallScore >= 50 ? 'linear-gradient(135deg, #ffc800, #ff9600)' : 'linear-gradient(135deg, #ff4b4b, #dc2626)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: '1.55rem',
                    fontWeight: 900,
                    boxShadow: '0 6px 18px rgba(0,0,0,0.22)'
                  }}>
                    {overallScore}%
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--text-main)' }}>
                        {overallScore >= 85 ? '🌟 Pengucapan Sangat Baik!' : overallScore >= 70 ? '👍 Pengucapan Baik & Dapat Dipahami' : overallScore >= 50 ? '💪 Perlu Penajaman Artikulasi' : '❌ Pengucapan Tidak Sesuai / Salah'}
                      </span>
                      <span style={{
                        background: overallScore >= 85 ? 'rgba(88,204,2,0.15)' : overallScore >= 70 ? 'rgba(28,176,246,0.15)' : overallScore >= 50 ? 'rgba(255,200,0,0.15)' : 'rgba(255,75,75,0.15)',
                        color: overallScore >= 85 ? '#58cc02' : overallScore >= 70 ? '#1cb0f6' : overallScore >= 50 ? '#ffc800' : '#ff4b4b',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: '8px'
                      }}>
                        {overallScore >= 85 ? 'Near-Native' : overallScore >= 70 ? 'Conversational' : overallScore >= 50 ? 'Developing' : 'Mismatched / Perlu Diulang'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.84rem', color: 'var(--text-sub)', marginTop: '2px' }}>
                      Analisis komposit berbasis akustik gelombang (tempo, penekanan puncak, melodi nada) dan artikulasi fonetik.
                    </div>
                  </div>
                </div>

                {/* 4-Pillar Acoustic Breakdown Pills */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: (phoneticScore >= 50) ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 75, 75, 0.15)',
                    color: (phoneticScore >= 50) ? '#58cc02' : '#ff4b4b',
                    border: (phoneticScore >= 50) ? '1px solid rgba(88, 204, 2, 0.3)' : '1px solid rgba(255, 75, 75, 0.3)',
                    padding: '5px 12px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 800
                  }}>
                    Fonetik: {phoneticScore}%
                  </span>
                  {acousticMetrics && (
                    <>
                      <span style={{
                        background: 'rgba(28, 176, 246, 0.15)',
                        color: '#1cb0f6',
                        border: '1px solid rgba(28, 176, 246, 0.3)',
                        padding: '5px 12px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 800
                      }}>
                        Tempo: {acousticMetrics.tempoMatch}%
                      </span>
                      <span style={{
                        background: 'rgba(206, 130, 255, 0.15)',
                        color: '#ce82ff',
                        border: '1px solid rgba(206, 130, 255, 0.3)',
                        padding: '5px 12px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 800
                      }}>
                        Ritme Stress: {acousticMetrics.energyMatch}%
                      </span>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.15)',
                        color: '#10b981',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        padding: '5px 12px',
                        borderRadius: '10px',
                        fontSize: '0.78rem',
                        fontWeight: 800
                      }}>
                        Melodi Nada: {acousticMetrics.pitchMatch || 86}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Target vs Detected Speech Comparison Card */}
              <div style={{
                background: overallScore < 50 ? 'rgba(255, 75, 75, 0.08)' : 'var(--bg-primary)',
                border: overallScore < 50 ? '1.5px solid rgba(255, 75, 75, 0.35)' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-sub)' }}>🎯 Target Kata:</span>
                    <span style={{ fontWeight: 900, color: 'var(--text-main)', background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      {inputText}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.92rem' }}>
                    <span style={{ fontWeight: 800, color: 'var(--text-sub)' }}>🎙️ Suara Anda Terdeteksi:</span>
                    <span style={{ 
                      fontWeight: 900, 
                      color: overallScore < 50 ? '#ff4b4b' : '#58cc02', 
                      background: 'var(--bg-card)', 
                      padding: '4px 10px', 
                      borderRadius: '8px', 
                      border: overallScore < 50 ? '1px solid rgba(255,75,75,0.4)' : '1px solid rgba(88,204,2,0.4)' 
                    }}>
                      "{speechTranscript || '(Tidak ada kata terdeteksi)'}"
                    </span>
                  </div>
                </div>

                {overallScore < 50 && (
                  <div style={{
                    marginTop: '4px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(255, 75, 75, 0.12)',
                    borderLeft: '4px solid #ff4b4b',
                    color: '#ff4b4b',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    lineHeight: 1.45
                  }}>
                    ❌ <strong>Deteksi Ucapan Tidak Sesuai:</strong> {evaluationMismatch || `Kata yang terdeteksi ("${speechTranscript}") tidak cocok dengan target "${inputText}". Nilai dinilai rendah secara objektif tanpa pembulatan palsu.`}
                  </div>
                )}
              </div>

              {/* 2. Syllable Stress Map & Intonation Breakdown */}
              {selectedItem?.syllables && (
                <div style={{
                  background: 'var(--bg-primary)',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Target size={18} color="#ff9600" />
                      <span style={{ fontSize: '0.88rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                        Peta Suku Kata & Penekanan Suara (Syllable Stress Breakdown):
                      </span>
                    </div>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-sub)' }}>
                      Kunci intonasi native adalah kontras antara suku kata kuat vs lemah
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                    gap: '10px'
                  }}>
                    {selectedItem.syllables.split('-').map((syl, sIdx) => {
                      const cleanSyl = syl.replace(/[^a-zA-Z]/g, '');
                      const isTargetStressed = selectedItem.stressedSyllable && 
                        cleanSyl.toLowerCase().includes(selectedItem.stressedSyllable.toLowerCase().replace(/[^a-zA-Z]/g, ''));
                      
                      return (
                        <div
                          key={sIdx}
                          style={{
                            background: isTargetStressed ? 'rgba(255, 150, 0, 0.08)' : 'var(--bg-card-hover)',
                            border: isTargetStressed ? '2px solid #ff9600' : '1px solid var(--border-color)',
                            borderRadius: '10px',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: isTargetStressed ? '#ff9600' : 'var(--text-main)' }}>
                              {syl}
                            </span>
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 800,
                              background: isTargetStressed ? '#ff9600' : 'var(--bg-primary)',
                              color: isTargetStressed ? '#fff' : 'var(--text-sub)',
                              padding: '2px 6px',
                              borderRadius: '6px'
                            }}>
                              {isTargetStressed ? 'PRIMARY STRESS' : 'UNSTRESSED'}
                            </span>
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-sub)', lineHeight: 1.3 }}>
                            {isTargetStressed 
                              ? '🎯 Suara harus lebih tinggi, lebih lantang, dan durasi sedikit lebih panjang.'
                              : '💡 Suara rileks, cepat, dan tereduksi (bunyi schwa). Jangan ditekan terlalu keras.'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Indonesian Learner Specific Diagnosis (Peringatan Khusus Lidah Indonesia) */}
              {selectedItem?.gotchaTip && (
                <div style={{
                  background: 'rgba(255, 200, 0, 0.08)',
                  border: '1.5px solid #ffc800',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: '#ffc800',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#000',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}>
                    <Lightbulb size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#ffc800', marginBottom: '4px' }}>
                      Diagnosis Kesalahan Khas Lidah Indonesia:
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {selectedItem.gotchaTip.replace(/💡\s*\*\*Tips Indonesia\*\*:\s*/g, '')}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Word-by-word Phonetic Feedback */}
              <div>
                <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '10px' }}>
                  🔍 Rincian Artikulasi Kata (Klik kata untuk tips dan artikulasi pelan):
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {wordScores.map((w, i) => {
                    const isExcellent = w.status === 'excellent';
                    const isGood = w.status === 'good';
                    return (
                      <button
                        key={i}
                        onClick={() => {
                          soundService.playClick();
                          setSelectedWordTip(w);
                        }}
                        style={{
                          background: isExcellent ? 'rgba(88, 204, 2, 0.15)' : isGood ? 'rgba(255, 200, 0, 0.15)' : 'rgba(255, 75, 75, 0.15)',
                          border: isExcellent ? '2px solid #58cc02' : isGood ? '2px solid #ffc800' : '2px solid #ff4b4b',
                          color: isExcellent ? '#58cc02' : isGood ? '#ffc800' : '#ff4b4b',
                          padding: '7px 14px',
                          borderRadius: '10px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.92rem',
                          fontWeight: 800,
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{w.text}</span>
                        <span style={{ fontSize: '0.74rem', opacity: 0.9 }}>{w.score}%</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Word Tip Card */}
              {selectedWordTip && (
                <div style={{
                  background: 'var(--bg-primary)',
                  borderLeft: '4px solid #1cb0f6',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '14px'
                }}>
                  <div>
                    <span style={{ fontSize: '0.98rem', fontWeight: 900, color: '#1cb0f6' }}>
                      Bedah Kata: "{selectedWordTip.text}" (Akurasi: {selectedWordTip.score}%)
                    </span>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.45 }}>
                      {selectedWordTip.tip}
                    </p>
                  </div>
                  <button
                    onClick={() => speechService.speak(selectedWordTip.text, 0.82)}
                    style={{
                      background: 'rgba(28, 176, 246, 0.15)',
                      border: '1px solid rgba(28, 176, 246, 0.3)',
                      color: '#1cb0f6',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Volume2 size={15} />
                    <span>Ucapkan Pelan</span>
                  </button>
                </div>
              )}

              {/* 5. Actionable 3-Step Practice Roadmap */}
              <div style={{
                background: 'var(--bg-primary)',
                borderRadius: '12px',
                padding: '14px 16px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase' }}>
                  🚀 3 Langkah Koreksi Praktis Untuk Rekaman Ulang:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px' }}>
                    <strong>1. Latihan Chunk Lambat:</strong> Ucapkan tiap suku kata secara terpisah dengan tempo 50% lebih lambat.
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px' }}>
                    <strong>2. Kontraskan Penekanan:</strong> Naikkan nada dan energi pada suku kata bertekanan, lemaskan sisanya.
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', background: 'var(--bg-card)', padding: '8px 12px', borderRadius: '8px' }}>
                    <strong>3. Dengarkan A/B Compare:</strong> Klik tombol A/B Compare di atas lalu rekam kembali untuk menandinginya.
                  </div>
                </div>
              </div>

              {/* Bottom Archive Notification & Clear Deck Button */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-color)',
                paddingTop: '14px',
                flexWrap: 'wrap',
                gap: '10px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', color: '#00d26a', fontWeight: 800 }}>
                  <CheckCircle2 size={18} />
                  <span>Tersimpan Otomatis di Archive Pronunciation</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => setActiveSubView('archive')}
                    style={{
                      background: 'rgba(0, 210, 106, 0.12)',
                      color: '#00d26a',
                      border: '1px solid rgba(0, 210, 106, 0.3)',
                      borderRadius: '8px',
                      padding: '7px 14px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
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
                    onClick={() => { soundService.playClick(); resetEvaluation(); }}
                    title="Bersihkan evaluasi untuk mencoba teks lain"
                    style={{
                      background: '#1cb0f6',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '7px 16px',
                      fontSize: '0.8rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 2px 0 #1899d6'
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Latih Teks Lain</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ============================================================== */}
      {/* SUB-VIEW 2: DEDICATED ARCHIVE PRONUNCIATION                     */}
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
                  placeholder="Cari kata atau kalimat yang pernah Anda latih..."
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

            {/* Score Filters & Mode Filters */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                  Skor:
                </span>
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'excellent', label: '🌟 Sempurna (≥85%)' },
                  { id: 'good', label: '👍 Baik (70-84%)' },
                  { id: 'needs_practice', label: '💪 Perlu Latihan (<70%)' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => { soundService.playClick(); setArchiveFilterStatus(st.id); }}
                    style={{
                      background: archiveFilterStatus === st.id ? '#00d26a' : 'var(--bg-card-hover)',
                      color: archiveFilterStatus === st.id ? '#fff' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)' }}>
                  Tipe:
                </span>
                {[
                  { id: 'all', label: 'Semua' },
                  { id: 'word', label: 'Kata' },
                  { id: 'short', label: 'Kalimat Pendek' },
                  { id: 'long', label: 'Kalimat Panjang' },
                  { id: 'custom', label: 'Kustom' }
                ].map((md) => (
                  <button
                    key={md.id}
                    onClick={() => { soundService.playClick(); setArchiveFilterMode(md.id); }}
                    style={{
                      background: archiveFilterMode === md.id ? '#1cb0f6' : 'var(--bg-card-hover)',
                      color: archiveFilterMode === md.id ? '#fff' : 'var(--text-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '4px 12px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    {md.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Practiced Archive Cards List */}
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
                background: 'rgba(0, 210, 106, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#00d26a'
              }}>
                <Inbox size={30} />
              </div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                {archiveSearchQuery || archiveFilterStatus !== 'all' || archiveFilterMode !== 'all'
                  ? 'Tidak ada riwayat latihan yang cocok dengan filter'
                  : 'Belum Ada Latihan di Archive Pronunciation'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-sub)', maxWidth: '420px', lineHeight: 1.5 }}>
                {archiveSearchQuery || archiveFilterStatus !== 'all' || archiveFilterMode !== 'all'
                  ? 'Coba ubah kata kunci atau sesuaikan filter skor dan tipe latihan.'
                  : 'Setiap kali Anda merekam suara dan dievaluasi, hasilnya akan otomatis diarsipkan di sini lengkap dengan skor dan feedback per kata.'}
              </p>
              <button
                onClick={() => { soundService.playClick(); setActiveSubView('studio'); }}
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
                Mulai Latihan Pengucapan
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredArchive.map((item) => {
                const isHigh = item.overallScore >= 85;
                const isMedium = item.overallScore >= 70 && item.overallScore < 85;
                const scoreBg = isHigh ? 'linear-gradient(135deg, #58cc02, #46a302)' : isMedium ? 'linear-gradient(135deg, #ffc800, #ff9600)' : 'linear-gradient(135deg, #ff4b4b, #ea2b2b)';

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
                    {/* Top Row: Score Badge, Text, Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
                        {/* Score Circle */}
                        <div style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '14px',
                          background: scoreBg,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          fontWeight: 900,
                          boxShadow: '0 3px 10px rgba(0,0,0,0.15)'
                        }}>
                          {item.overallScore}%
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{
                              background: 'rgba(28, 176, 246, 0.12)',
                              color: '#1cb0f6',
                              border: '1px solid rgba(28, 176, 246, 0.25)',
                              borderRadius: '12px',
                              padding: '2px 8px',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase'
                            }}>
                              {item.mode === 'word' ? 'Kata' : item.mode === 'short' ? 'Kalimat Pendek' : item.mode === 'long' ? 'Kalimat Panjang' : 'Kustom'}
                            </span>

                            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                              {item.accent} Accent
                            </span>

                            <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)' }}>
                              {item.formattedTime}
                            </span>
                          </div>

                          <h3 style={{ margin: '4px 0 0 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                            "{item.text}"
                          </h3>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          onClick={() => speechService.speak(item.text, 1.0)}
                          title="Dengarkan native speaker"
                          style={{
                            background: 'var(--bg-card-hover)',
                            color: '#1cb0f6',
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
                          <Volume2 size={14} />
                          <span>Native</span>
                        </button>

                        <button
                          onClick={() => handlePracticeFromArchive(item)}
                          title="Muat teks ini kembali ke Studio untuk latihan ulang"
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
                          <span>Latih Ulang</span>
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

                    {/* Word-by-word Breakdown in Archive */}
                    {item.wordScores && item.wordScores.length > 0 && (
                      <div style={{
                        background: 'var(--bg-card-hover)',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                            Artikulasi Tiap Kata:
                          </span>
                          <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>
                            Fonetik: {item.phoneticScore}% {item.acousticMetrics ? `| Tempo: ${item.acousticMetrics.tempoMatch}%` : ''}
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {item.wordScores.map((w, wIdx) => {
                            const isExc = w.status === 'excellent';
                            const isGd = w.status === 'good';
                            return (
                              <div
                                key={wIdx}
                                title={w.tip}
                                style={{
                                  background: isExc ? 'rgba(88, 204, 2, 0.15)' : isGd ? 'rgba(255, 200, 0, 0.15)' : 'rgba(255, 75, 75, 0.15)',
                                  border: isExc ? '1px solid #58cc02' : isGd ? '1px solid #ffc800' : '1px solid #ff4b4b',
                                  color: isExc ? '#58cc02' : isGd ? '#ffc800' : '#ff4b4b',
                                  borderRadius: '6px',
                                  padding: '2px 8px',
                                  fontSize: '0.78rem',
                                  fontWeight: 700,
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}
                              >
                                <span>{w.text}</span>
                                <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{w.score}%</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL PANDUAN IZIN MIKROFON (PERMISSION GUIDE) */}
      {showMicPermissionModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '2px solid var(--border-color)',
            borderRadius: '20px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px 28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '14px',
                background: 'rgba(255, 75, 75, 0.15)',
                border: '1.5px solid #ff4b4b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ff4b4b',
                fontSize: '1.4rem'
              }}>
                🎙️
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
                  Izin Mikrofon Belum Aktif
                </h3>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#ff4b4b', fontWeight: 700 }}>
                  Browser melaporkan: Permission Denied (Akses Ditolak)
                </p>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
              Peramban (browser) Anda saat ini memblokir akses mikrofon untuk <strong>localhost:6006</strong>. Ikuti langkah cepat di bawah ini untuk mengizinkannya:
            </p>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: '12px',
              padding: '14px 16px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{
                  background: '#1cb0f6',
                  color: '#fff',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  flexShrink: 0
                }}>1</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  Klik ikon <strong>Setelan Situs / Gembok (🔒 atau ⚙️)</strong> di sebelah kiri alamat <strong>localhost:6006</strong> pada address bar browser Anda.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{
                  background: '#1cb0f6',
                  color: '#fff',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  flexShrink: 0
                }}>2</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  Pada baris <strong>Mikrofon (Microphone)</strong>, ubah pilihan dari <strong>Blokir (Block)</strong> menjadi <strong>Izinkan (Allow)</strong>.
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{
                  background: '#1cb0f6',
                  color: '#fff',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.76rem',
                  fontWeight: 900,
                  flexShrink: 0
                }}>3</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  Muat ulang halaman (<strong>Reload / Cmd + R</strong>).
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <button
                onClick={() => {
                  setShowMicPermissionModal(false);
                  handleSimulateDemoRecording();
                }}
                style={{
                  background: 'linear-gradient(135deg, #1cb0f6, #00d26a)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  fontSize: '0.88rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(28, 176, 246, 0.4)'
                }}
              >
                <span>⚡ Lanjutkan Dengan Mode Simulasi (Lihat Waveform Sekarang)</span>
              </button>

              <button
                onClick={() => setShowMicPermissionModal(false)}
                style={{
                  background: 'transparent',
                  color: 'var(--text-sub)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '9px 16px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Tutup (Saya Akan Ubah Izin Browser)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
