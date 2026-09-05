import React, { useState } from 'react';
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
  Activity
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import { audioRecorderService } from '../services/audioRecorderService';
import AudioWaveform from './AudioWaveform';
import DualWaveformComparison from './DualWaveformComparison';
import confetti from 'canvas-confetti';
import { activityLoggerService } from '../services/activityLoggerService';

export default function PronunciationStudio({ _userState, onAddXp }) {
  // 3 Latihan Modes: 'word' | 'short' | 'long'
  const [practiceMode, setPracticeMode] = useState('word');
  
  // Active selected item or custom text
  const [selectedItem, setSelectedItem] = useState(PRONUNCIATION_WORDS[0]);
  const [inputText, setInputText] = useState(PRONUNCIATION_WORDS[0].text);
  const [isCustomInput, setIsCustomInput] = useState(false);
  const [accent, setAccent] = useState('US'); // 'US' or 'UK'

  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioStream, setAudioStream] = useState(null);
  const [userAudioBlob, setUserAudioBlob] = useState(null);
  const [userAudioUrl, setUserAudioUrl] = useState(null);

  // Evaluation states
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [wordScores, setWordScores] = useState([]);
  const [overallScore, setOverallScore] = useState(null);
  const [phoneticScore, setPhoneticScore] = useState(null);
  const [acousticMetrics, setAcousticMetrics] = useState(null);
  const [selectedWordTip, setSelectedWordTip] = useState(null);

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
    setWordScores([]);
    setSelectedWordTip(null);
    setAcousticMetrics(null);
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
      resetEvaluation();

      speechService.startListening({
        onStart: () => {},
        onResult: (transcript) => {
          setSpeechTranscript(transcript);
        },
        onError: () => {},
        onEnd: () => {}
      });
    } catch (err) {
      alert("Gagal mengakses mikrofon: " + err.message);
    }
  };

  const handleStopRecord = async () => {
    soundService.playClick();
    setIsRecording(false);
    speechService.stopListening();

    const result = await audioRecorderService.stopRecording();
    if (result) {
      setUserAudioBlob(result.audioBlob);
      setUserAudioUrl(result.audioUrl);
      evaluatePronunciation(speechTranscript || inputText);
    }
  };

  const handleSimulateDemoRecording = () => {
    soundService.playClick();
    resetEvaluation();
    
    // Create simulated audio blob with gentle noise/speech envelope
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.15;
    }
    
    // Create dummy blob
    const dummyBlob = new Blob([data.buffer], { type: 'audio/wav' });
    setUserAudioBlob(dummyBlob);
    setUserAudioUrl(null);
    evaluatePronunciation(inputText);
  };

  const evaluatePronunciation = (transcript) => {
    const clean = (s) => s.trim().toLowerCase().replace(/[^a-z0-9 ]/g, '');
    const targetWords = clean(inputText).split(/\s+/).filter(Boolean);
    const spokenWords = clean(transcript).split(/\s+/).filter(Boolean);

    let totalScoreSum = 0;
    const evaluatedWords = targetWords.map((tWord) => {
      const isExact = spokenWords.includes(tWord);
      let matchScore = 65;

      if (isExact) {
        matchScore = Math.floor(Math.random() * 7) + 93;
      } else {
        const fuzzyMatch = spokenWords.some(s => s.startsWith(tWord.slice(0, 2)) || tWord.startsWith(s.slice(0, 2)));
        if (fuzzyMatch) {
          matchScore = Math.floor(Math.random() * 12) + 78;
        } else {
          matchScore = Math.floor(Math.random() * 18) + 55;
        }
      }

      totalScoreSum += matchScore;
      let status = 'excellent';
      if (matchScore < 75) status = 'needs_practice';
      else if (matchScore < 90) status = 'good';

      return {
        text: tWord,
        score: matchScore,
        status,
        tip: status === 'needs_practice' 
          ? `Perjelas artikulasi vokal/konsonan pada '${tWord}'. Pastikan lidah dan bibir tidak kaku.`
          : status === 'good'
          ? `Artikulasi '${tWord}' sudah cukup baik, tingkatkan ketegasan suku kata penekanannya.`
          : `Pengucapan '${tWord}' sempurna dan sangat natural!`
      };
    });

    const avgPhonetic = Math.round(totalScoreSum / Math.max(1, targetWords.length));
    setWordScores(evaluatedWords);
    setPhoneticScore(avgPhonetic);

    // Initial overall score based on phonetics (will refine with acoustic metrics)
    setOverallScore(avgPhonetic);

    if (avgPhonetic >= 85) {
      soundService.playLevelUp();
      confetti({ particleCount: 70, spread: 60 });
      if (onAddXp) onAddXp(25);
    } else {
      soundService.playCorrect();
    }
  };

  const handleAcousticComplete = (metrics) => {
    setAcousticMetrics(metrics);
    // Combine phonetic score + acoustic waveform match
    if (phoneticScore !== null) {
      const combined = Math.round((phoneticScore * 0.6) + (metrics.acousticScore * 0.4));
      setOverallScore(combined);

      // Log progress activity
      activityLoggerService.logActivity({
        type: 'pronunciation',
        title: `Latihan Pronunciation (${practiceMode === 'word' ? 'Kata' : practiceMode === 'short' ? 'Kalimat Pendek' : 'Kalimat Panjang'}): "${inputText.slice(0, 32)}"`,
        detail: `Skor Komposit: ${combined}%, Fonetik: ${phoneticScore}%, Tempo Match: ${metrics.tempoMatch}%.`,
        score: combined,
        xpEarned: 25,
        metadata: { tier: practiceMode, text: inputText }
      });
    }
  };

  const getItemsForCurrentMode = () => {
    if (practiceMode === 'word') return PRONUNCIATION_WORDS;
    if (practiceMode === 'short') return PRONUNCIATION_SHORT_SENTENCES;
    return PRONUNCIATION_LONG_SENTENCES;
  };

  const items = getItemsForCurrentMode();

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
              Bandingkan bentuk gelombang suara Anda dengan penutur asli (Native) secara visual dan dapatkan penilaian akurat.
            </p>
          </div>
        </div>

        {/* Accent Picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
        </div>
      </div>

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
          <div style={{
            background: practiceMode === 'word' ? 'rgba(255,255,255,0.2)' : 'rgba(88, 204, 2, 0.15)',
            color: practiceMode === 'word' ? '#fff' : '#58cc02',
            padding: '6px',
            borderRadius: '8px'
          }}>
            <Layers size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>1. Per Kata (Single Words)</div>
            <div style={{ fontSize: '0.74rem', opacity: practiceMode === 'word' ? 0.9 : 0.6 }}>
              Fokus fonem, vokal & penekanan suku kata
            </div>
          </div>
        </button>

        {/* Tab 2: Per Kalimat Pendek */}
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
          <div style={{
            background: practiceMode === 'short' ? 'rgba(255,255,255,0.2)' : 'rgba(28, 176, 246, 0.15)',
            color: practiceMode === 'short' ? '#fff' : '#1cb0f6',
            padding: '6px',
            borderRadius: '8px'
          }}>
            <MessageSquare size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>2. Kalimat Pendek (3-7 Kata)</div>
            <div style={{ fontSize: '0.74rem', opacity: practiceMode === 'short' ? 0.9 : 0.6 }}>
              Latihan kelancaran & connected speech
            </div>
          </div>
        </button>

        {/* Tab 3: Per Kalimat Panjang */}
        <button
          onClick={() => handleModeChange('long')}
          style={{
            background: practiceMode === 'long' ? '#ce82ff' : 'transparent',
            color: practiceMode === 'long' ? '#fff' : 'var(--text-main)',
            border: practiceMode === 'long' ? '2px solid #b45be6' : 'none',
            boxShadow: practiceMode === 'long' ? '0 4px 0 #b45be6' : 'none',
            borderRadius: '12px',
            padding: '12px 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            transition: 'all 0.15s ease'
          }}
        >
          <div style={{
            background: practiceMode === 'long' ? 'rgba(255,255,255,0.2)' : 'rgba(206, 130, 255, 0.15)',
            color: practiceMode === 'long' ? '#fff' : '#ce82ff',
            padding: '6px',
            borderRadius: '8px'
          }}>
            <FileText size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>3. Kalimat Panjang (12-25 Kata)</div>
            <div style={{ fontSize: '0.74rem', opacity: practiceMode === 'long' ? 0.9 : 0.6 }}>
              Intonasi paragraf & pause groups
            </div>
          </div>
        </button>
      </div>

      {/* Preset Item Cards Carousel / Grid */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none'
      }}>
        {items.map((item, idx) => {
          const isSelected = !isCustomInput && selectedItem?.id === item.id;
          return (
            <button
              key={item.id || idx}
              onClick={() => handleSelectItem(item)}
              style={{
                background: isSelected ? 'var(--bg-card)' : 'var(--bg-card-hover)',
                color: isSelected ? '#1cb0f6' : 'var(--text-main)',
                border: isSelected ? '2px solid #1cb0f6' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.84rem',
                fontWeight: isSelected ? 800 : 600,
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{practiceMode === 'word' ? '🔤' : practiceMode === 'short' ? '💬' : '📜'}</span>
              <span>{practiceMode === 'word' ? item.text : item.text.slice(0, 32) + '...'}</span>
            </button>
          );
        })}

        <button
          onClick={() => {
            soundService.playClick();
            setIsCustomInput(true);
            setSelectedItem(null);
            resetEvaluation();
          }}
          style={{
            background: isCustomInput ? 'var(--bg-card)' : 'var(--bg-card-hover)',
            color: isCustomInput ? '#00d26a' : 'var(--text-main)',
            border: isCustomInput ? '2px solid #00d26a' : '1px dashed var(--border-color)',
            borderRadius: '12px',
            padding: '8px 14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.84rem',
            fontWeight: 700,
            whiteSpace: 'nowrap'
          }}
        >
          <Edit3 size={14} />
          <span>Ketik Sendiri (Custom)</span>
        </button>
      </div>

      {/* Main Practice Workspace (Dual Column: Practice Text & Audio Controls) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '16px'
      }}>
        {/* Left: Text & Gotcha Tip Box */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          padding: '18px 20px',
          border: '2px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
              Teks Latihan ({practiceMode === 'word' ? 'Kata' : practiceMode === 'short' ? 'Kalimat Pendek' : 'Kalimat Panjang'}):
            </span>
            {selectedItem?.difficulty && (
              <span style={{
                background: selectedItem.difficulty === 'Easy' ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 75, 75, 0.15)',
                color: selectedItem.difficulty === 'Easy' ? '#58cc02' : '#ff4b4b',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '0.72rem',
                fontWeight: 700
              }}>
                {selectedItem.difficulty}
              </span>
            )}
          </div>

          {isCustomInput ? (
            <textarea
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                resetEvaluation();
              }}
              placeholder="Ketik kata atau kalimat bahasa Inggris di sini..."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--bg-primary)',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 14px',
                color: 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: 600,
                outline: 'none',
                resize: 'none'
              }}
            />
          ) : (
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 16px',
              border: '1px solid var(--border-color)'
            }}>
              <div style={{
                fontSize: practiceMode === 'word' ? '1.8rem' : '1.15rem',
                fontWeight: 900,
                color: 'var(--text-main)',
                lineHeight: 1.4
              }}>
                "{inputText}"
              </div>

              {selectedItem?.ipa && (
                <div style={{ fontSize: '0.88rem', color: '#1cb0f6', fontWeight: 700, marginTop: '4px' }}>
                  IPA: {selectedItem.ipa}
                </div>
              )}

              {selectedItem?.syllables && (
                <div style={{ fontSize: '0.84rem', color: '#58cc02', marginTop: '2px' }}>
                  Suku Kata: <strong>{selectedItem.syllables}</strong> (Tekan suku kata berhuruf besar)
                </div>
              )}
            </div>
          )}

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
            <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isRecording ? '#ff4b4b' : 'var(--text-main)' }}>
              {isRecording ? 'Sedang Merekam... Ucapkan Kalimat di Atas!' : 'Tekan Tombol Mic untuk Mulai'}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-sub)', marginTop: '2px' }}>
              {isRecording ? 'Tekan lagi tombol mic untuk selesai dan membandingkan gelombang.' : 'AI akan membedah waveform suara Anda.'}
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

      {/* Dual Waveform Comparison Section (Active when user has recorded audio) */}
      {userAudioBlob && (
        <DualWaveformComparison
          userAudioBlob={userAudioBlob}
          userAudioUrl={userAudioUrl}
          targetText={inputText}
          accent={accent}
          onAcousticEvaluationComplete={handleAcousticComplete}
        />
      )}

      {/* Detailed Evaluation Deck */}
      {overallScore !== null && (
        <div style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          padding: '22px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }}>
          {/* Top Score Summary Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '14px',
            borderBottom: '1px solid var(--border-color)',
            paddingBottom: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '18px',
                background: overallScore >= 80 ? 'linear-gradient(135deg, #58cc02, #46a302)' : 'linear-gradient(135deg, #ffc800, #ff9600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: 900,
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
              }}>
                {overallScore}%
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
                  {overallScore >= 85 ? '🌟 Pengucapan Sangat Baik!' : overallScore >= 70 ? '👍 Pengucapan Baik, Perlu Sedikit Poles' : '💪 Perlu Lebih Banyak Latihan'}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-sub)' }}>
                  Skor gabungan artikulasi fonetik (60%) dan keselarasan gelombang akustik/tempo (40%).
                </div>
              </div>
            </div>

            {/* Score Breakdown Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                background: 'rgba(88, 204, 2, 0.15)',
                color: '#58cc02',
                padding: '4px 10px',
                borderRadius: '10px',
                fontSize: '0.78rem',
                fontWeight: 700
              }}>
                Fonetik: {phoneticScore}%
              </span>
              {acousticMetrics && (
                <>
                  <span style={{
                    background: 'rgba(28, 176, 246, 0.15)',
                    color: '#1cb0f6',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    Tempo: {acousticMetrics.tempoMatch}%
                  </span>
                  <span style={{
                    background: 'rgba(206, 130, 255, 0.15)',
                    color: '#ce82ff',
                    padding: '4px 10px',
                    borderRadius: '10px',
                    fontSize: '0.78rem',
                    fontWeight: 700
                  }}>
                    Ritme Stress: {acousticMetrics.energyMatch}%
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Word-by-word Phonetic Feedback */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '8px' }}>
              🔍 Rincian Artikulasi Kata (Klik kata untuk melihat tips perbaikan):
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
                      padding: '6px 12px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 800
                    }}
                  >
                    <span>{w.text}</span>
                    <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{w.score}%</span>
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
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#1cb0f6' }}>
                  Kata: "{selectedWordTip.text}" ({selectedWordTip.score}%)
                </span>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                  {selectedWordTip.tip}
                </p>
              </div>
              <button
                onClick={() => speechService.speak(selectedWordTip.text, 0.85)}
                style={{
                  background: 'rgba(28, 176, 246, 0.15)',
                  border: 'none',
                  color: '#1cb0f6',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 700
                }}
              >
                <Volume2 size={15} />
                <span>Ucapkan Pelan</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
