import React, { useState, useEffect } from 'react';
import { Volume2, Volume1, Mic, MicOff, Check, X, HelpCircle, ArrowRight, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';
import ExplanationModal from './ExplanationModal';

export default function LessonModal({ lesson, userState, onComplete, onClose, onDeductHeart }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [wordBankSelected, setWordBankSelected] = useState([]);
  const [wordBankPool, setWordBankPool] = useState([]);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [selectedPairLeft, setSelectedPairLeft] = useState(null);
  
  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState('');
  const [speechAccuracy, setSpeechAccuracy] = useState(null);

  // Status & Feedback state
  const [status, setStatus] = useState('answering'); // 'answering', 'correct', 'wrong'
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = lesson.questions[currentIndex];

  useEffect(() => {
    // Reset question state
    setStatus('answering');
    setSelectedOption(null);
    setWordBankSelected([]);
    setMatchedPairs([]);
    setSelectedPairLeft(null);
    setSpeechTranscript('');
    setSpeechAccuracy(null);

    if (currentQuestion) {
      if (currentQuestion.type === 'word_bank' && currentQuestion.wordOptions) {
        setWordBankPool([...currentQuestion.wordOptions]);
      }
      // Auto play audio for listening & speaking
      if (currentQuestion.audioText && (currentQuestion.type === 'listening' || currentQuestion.type === 'speaking')) {
        speechService.speak(currentQuestion.audioText);
      }
    }
  }, [currentIndex, currentQuestion]);

  if (!currentQuestion) return null;

  const playAudio = (rate = 1.0) => {
    soundService.playClick();
    if (currentQuestion.audioText) {
      speechService.speak(currentQuestion.audioText, rate);
    }
  };

  // Word Bank actions
  const handleAddWord = (word, index) => {
    soundService.playClick();
    setWordBankSelected([...wordBankSelected, word]);
    const newPool = [...wordBankPool];
    newPool.splice(index, 1);
    setWordBankPool(newPool);
  };

  const handleRemoveWord = (word, index) => {
    soundService.playClick();
    const newSelected = [...wordBankSelected];
    newSelected.splice(index, 1);
    setWordBankSelected(newSelected);
    setWordBankPool([...wordBankPool, word]);
  };

  // Speech Recognition handler
  const handleStartMic = () => {
    soundService.playClick();
    setIsListening(true);
    setSpeechTranscript('');

    speechService.startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript, isFinal) => {
        setSpeechTranscript(transcript);
        if (isFinal) {
          setIsListening(false);
          // Calculate similarity score
          const target = currentQuestion.targetText.toLowerCase().replace(/[^a-z0-9 ]/g, '');
          const spoken = transcript.toLowerCase().replace(/[^a-z0-9 ]/g, '');
          
          if (spoken.includes(target) || target.includes(spoken)) {
            setSpeechAccuracy(95);
          } else {
            setSpeechAccuracy(60);
          }
        }
      },
      onError: (err) => {
        setIsListening(false);
      },
      onEnd: () => setIsListening(false)
    });
  };

  // Check Answer Handler
  const handleCheckAnswer = () => {
    let isCorrect = false;

    if (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'listening' || currentQuestion.type === 'fill_blank') {
      isCorrect = selectedOption === currentQuestion.correctAnswer;
    } else if (currentQuestion.type === 'word_bank') {
      const userSentence = wordBankSelected.join(' ');
      const targetSentence = currentQuestion.correctOrder.join(' ');
      isCorrect = userSentence === targetSentence;
    } else if (currentQuestion.type === 'speaking') {
      isCorrect = speechTranscript.length > 0 && (speechAccuracy >= 70 || speechTranscript.toLowerCase().includes('hello') || speechTranscript.toLowerCase().includes('meet') || speechTranscript.toLowerCase().includes('from') || speechTranscript.toLowerCase().includes('coffee'));
    } else if (currentQuestion.type === 'match_pairs') {
      isCorrect = matchedPairs.length === currentQuestion.pairs.length;
    }

    if (isCorrect) {
      soundService.playCorrect();
      setStatus('correct');
    } else {
      soundService.playWrong();
      setStatus('wrong');
      onDeductHeart();
    }
  };

  // Continue to Next Question or Complete
  const handleContinue = () => {
    soundService.playClick();
    if (currentIndex + 1 < lesson.questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Completed lesson!
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      soundService.playLevelUp();
      onComplete(lesson);
    }
  };

  const progressPercent = ((currentIndex + 1) / lesson.questions.length) * 100;

  return (
    <div className="lesson-screen">
      {/* Top Header Bar */}
      <div className="lesson-top-bar">
        <button onClick={onClose} className="exit-btn">
          <X size={24} color="#9ca3af" />
        </button>

        <div className="lesson-progress-bg">
          <div className="lesson-progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>

        <div className="hearts-indicator">
          <span className="flame-icon">❤️</span>
          <span>{userState.hearts}</span>
        </div>
      </div>

      {/* Main Question Container */}
      <div className="question-container">
        <h2 className="question-prompt">{currentQuestion.prompt}</h2>

        {/* 1. Multiple Choice / Fill Blank */}
        {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'fill_blank') && (
          <div className="options-grid">
            {currentQuestion.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  soundService.playClick();
                  setSelectedOption(opt);
                }}
                className={`option-card ${selectedOption === opt ? 'selected' : ''}`}
              >
                <span className="opt-number">{i + 1}</span>
                <span className="opt-text">{opt}</span>
              </button>
            ))}
          </div>
        )}

        {/* 2. Listening Challenge */}
        {currentQuestion.type === 'listening' && (
          <div className="listening-wrapper">
            <div className="audio-controls">
              <button onClick={() => playAudio(1.0)} className="audio-btn normal" title="Kecepatan Normal">
                <Volume2 size={32} color="#fff" />
              </button>
              <button onClick={() => playAudio(0.65)} className="audio-btn slow" title="Kecepatan Pelan">
                <Volume1 size={24} color="#1cb0f6" />
                <span>Pelan</span>
              </button>
            </div>

            <div className="options-grid">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    soundService.playClick();
                    setSelectedOption(opt);
                  }}
                  className={`option-card ${selectedOption === opt ? 'selected' : ''}`}
                >
                  <span className="opt-text">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. Word Bank Sentence Builder */}
        {currentQuestion.type === 'word_bank' && (
          <div className="wordbank-wrapper">
            {/* Target Area */}
            <div className="wordbank-dropzone">
              {wordBankSelected.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRemoveWord(word, idx)}
                  className="word-chip active"
                >
                  {word}
                </button>
              ))}
              {wordBankSelected.length === 0 && (
                <span className="placeholder-hint">Ketuk kata di bawah untuk menyusun kalimat...</span>
              )}
            </div>

            {/* Source Pool */}
            <div className="wordbank-pool">
              {wordBankPool.map((word, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddWord(word, idx)}
                  className="word-chip"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 4. Speaking Pronunciation Test */}
        {currentQuestion.type === 'speaking' && (
          <div className="speaking-wrapper">
            <div className="speaking-card">
              <button onClick={() => playAudio(1.0)} className="audio-prompt-btn">
                <Volume2 size={24} color="#58cc02" />
                <span className="target-text">"{currentQuestion.targetText}"</span>
              </button>
              {currentQuestion.targetPhonetic && (
                <p className="phonetic-hint">Pelafalan: <i>{currentQuestion.targetPhonetic}</i></p>
              )}
            </div>

            <div className="mic-action-area">
              <button
                onClick={handleStartMic}
                className={`mic-big-btn ${isListening ? 'listening' : ''}`}
              >
                {isListening ? <MicOff size={36} color="#fff" /> : <Mic size={36} color="#fff" />}
              </button>
              <p className="mic-hint-text">
                {isListening ? 'Mendengarkan ucapanmu...' : 'Ketuk mikrofon & ucapkan kalimat di atas'}
              </p>

              {speechTranscript && (
                <div className="transcript-box">
                  <span>Terdeteksi: <b>"{speechTranscript}"</b></span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. Match Pairs */}
        {currentQuestion.type === 'match_pairs' && (
          <div className="match-pairs-grid">
            <div className="pair-column">
              {currentQuestion.pairs.map((p, i) => {
                const isMatched = matchedPairs.includes(p.english);
                const isSelected = selectedPairLeft === p.english;
                return (
                  <button
                    key={i}
                    disabled={isMatched}
                    onClick={() => {
                      soundService.playClick();
                      setSelectedPairLeft(p.english);
                    }}
                    className={`pair-btn ${isMatched ? 'matched' : ''} ${isSelected ? 'selected' : ''}`}
                  >
                    {p.english}
                  </button>
                );
              })}
            </div>
            <div className="pair-column">
              {currentQuestion.pairs.map((p, i) => {
                const isMatched = matchedPairs.includes(p.english);
                return (
                  <button
                    key={i}
                    disabled={isMatched}
                    onClick={() => {
                      if (selectedPairLeft === p.english) {
                        soundService.playCorrect();
                        setMatchedPairs([...matchedPairs, p.english]);
                        setSelectedPairLeft(null);
                      } else {
                        soundService.playWrong();
                      }
                    }}
                    className={`pair-btn ${isMatched ? 'matched' : ''}`}
                  >
                    {p.indonesian}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Footer Feedback Bar */}
      <div className={`lesson-footer-bar ${status}`}>
        {status === 'answering' && (
          <div className="footer-content">
            <button
              onClick={handleCheckAnswer}
              disabled={
                (currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'fill_blank' || currentQuestion.type === 'listening') && !selectedOption ||
                currentQuestion.type === 'word_bank' && wordBankSelected.length === 0
              }
              className="btn-3d btn-green check-btn"
            >
              Periksa Jawaban
            </button>
          </div>
        )}

        {status === 'correct' && (
          <div className="footer-content result correct">
            <div className="result-info">
              <div className="icon-circle green">
                <Check size={28} color="#fff" />
              </div>
              <div className="result-text">
                <h3>Luar biasa! Tepat sekali! 🎉</h3>
              </div>
            </div>
            <button onClick={handleContinue} className="btn-3d btn-green next-btn">
              Lanjut <ArrowRight size={20} />
            </button>
          </div>
        )}

        {status === 'wrong' && (
          <div className="footer-content result wrong">
            <div className="result-info">
              <div className="icon-circle red">
                <X size={28} color="#fff" />
              </div>
              <div className="result-text">
                <h3>Jawaban Belum Tepat</h3>
                <p>Jawaban benar: <b>{currentQuestion.correctAnswer || (currentQuestion.correctOrder ? currentQuestion.correctOrder.join(' ') : currentQuestion.targetText)}</b></p>
              </div>
            </div>

            <div className="wrong-actions">
              <button onClick={() => setShowExplanation(true)} className="explain-ai-btn">
                <HelpCircle size={18} />
                <span>Explain My Mistake</span>
              </button>
              <button onClick={handleContinue} className="btn-3d btn-blue next-btn">
                Lanjut <ArrowRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Explanation Pop-up */}
      {showExplanation && (
        <ExplanationModal
          question={currentQuestion}
          userAnswer={currentQuestion.type === 'word_bank' ? wordBankSelected : (selectedOption || speechTranscript)}
          onClose={() => setShowExplanation(false)}
        />
      )}

      <style>{`
        .lesson-screen {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: var(--bg-primary);
          z-index: 150;
          display: flex;
          flex-direction: column;
        }

        .lesson-top-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 24px;
          max-width: 800px;
          margin: 0 auto;
          width: 100%;
        }

        .exit-btn {
          background: none;
          border: none;
          cursor: pointer;
        }

        .lesson-progress-bg {
          flex: 1;
          height: 16px;
          background: var(--border-color);
          border-radius: 10px;
          overflow: hidden;
        }

        .lesson-progress-fill {
          height: 100%;
          background: var(--green-primary);
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .hearts-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          font-weight: 800;
          color: var(--red-primary);
          font-size: 1.1rem;
        }

        .question-container {
          flex: 1;
          max-width: 700px;
          margin: 0 auto;
          width: 100%;
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .question-prompt {
          font-size: 1.5rem;
          font-weight: 900;
          text-align: center;
          margin-bottom: 32px;
        }

        .options-grid {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .option-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px 20px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          box-shadow: 0 4px 0 var(--border-color);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--text-main);
          transition: all 0.15s ease;
          text-align: left;
        }

        .option-card:hover {
          background: var(--bg-card-hover);
        }

        .option-card.selected {
          border-color: var(--blue-primary);
          background: rgba(28, 176, 246, 0.1);
          box-shadow: 0 4px 0 var(--blue-shadow);
        }

        .opt-number {
          background: var(--border-color);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        /* Listening */
        .listening-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
        }

        .audio-controls {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .audio-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          box-shadow: 0 6px 0 rgba(0, 0, 0, 0.2);
        }

        .audio-btn.normal {
          width: 70px;
          height: 70px;
          background: var(--blue-primary);
        }

        .audio-btn.slow {
          padding: 8px 16px;
          border-radius: 20px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          color: var(--blue-primary);
          font-weight: 800;
        }

        /* Wordbank */
        .wordbank-wrapper {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .wordbank-dropzone {
          min-height: 100px;
          border-bottom: 2px dashed var(--border-color);
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          padding: 12px;
        }

        .placeholder-hint {
          color: var(--text-sub);
          font-weight: 700;
          font-size: 0.95rem;
        }

        .wordbank-pool {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          justify-content: center;
        }

        .word-chip {
          padding: 10px 18px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          box-shadow: 0 4px 0 var(--border-color);
          border-radius: var(--radius-md);
          font-size: 1rem;
          font-weight: 800;
          color: var(--text-main);
          cursor: pointer;
        }

        .word-chip.active {
          border-color: var(--blue-primary);
          color: var(--blue-primary);
        }

        /* Speaking */
        .speaking-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          width: 100%;
        }

        .speaking-card {
          text-align: center;
        }

        .audio-prompt-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          padding: 14px 24px;
          border-radius: var(--radius-md);
          cursor: pointer;
        }

        .target-text {
          font-size: 1.3rem;
          font-weight: 900;
        }

        .phonetic-hint {
          margin-top: 8px;
          color: var(--text-sub);
          font-size: 0.9rem;
        }

        .mic-big-btn {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: var(--green-primary);
          box-shadow: 0 6px 0 var(--green-shadow);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }

        .mic-big-btn.listening {
          background: var(--red-primary);
          box-shadow: 0 6px 0 var(--red-shadow);
          animation: pulse 1s infinite;
        }

        .mic-action-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .mic-hint-text {
          font-weight: 700;
          color: var(--text-sub);
          font-size: 0.95rem;
        }

        .transcript-box {
          background: var(--bg-card);
          border: 2px solid var(--green-primary);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 0.95rem;
        }

        /* Match Pairs */
        .match-pairs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          width: 100%;
        }

        .pair-column {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .pair-btn {
          padding: 14px;
          background: var(--bg-card);
          border: 2px solid var(--border-color);
          box-shadow: 0 4px 0 var(--border-color);
          border-radius: var(--radius-md);
          font-weight: 800;
          color: var(--text-main);
          cursor: pointer;
        }

        .pair-btn.selected {
          border-color: var(--blue-primary);
          color: var(--blue-primary);
        }

        .pair-btn.matched {
          opacity: 0.3;
          cursor: not-allowed;
          box-shadow: none;
        }

        /* Footer Feedback Bar */
        .lesson-footer-bar {
          padding: 20px 24px;
          border-top: 2px solid var(--border-color);
          background: var(--bg-card);
        }

        .lesson-footer-bar.correct {
          background: #d7ffb8;
          border-color: #58cc02;
        }

        .lesson-footer-bar.wrong {
          background: #ffdfe0;
          border-color: #ff4b4b;
        }

        .footer-content {
          max-width: 800px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .check-btn {
          max-width: 250px;
          margin-left: auto;
        }

        .result-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-circle {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-circle.green { background: var(--green-primary); }
        .icon-circle.red { background: var(--red-primary); }

        .result-text h3 {
          font-size: 1.2rem;
          font-weight: 900;
          color: #1f2937;
        }

        .result-text p {
          color: #4b5563;
          font-size: 0.95rem;
        }

        .wrong-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .explain-ai-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--purple-primary);
          color: #fff;
          border-radius: var(--radius-md);
          border: none;
          font-weight: 800;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
