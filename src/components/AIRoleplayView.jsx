import React, { useState, useEffect, useRef } from 'react';
import { ROLEPLAY_SCENARIOS } from '../data/roleplayData';
import { Send, Mic, MicOff, Volume2, Sparkles, ArrowLeft } from 'lucide-react';
import { soundService } from '../services/soundService';
import { speechService } from '../services/speechService';

export default function AIRoleplayView({ userState, onAddXp }) {
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatBottomRef = useRef(null);

  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAiTyping]);

  const handleStartScenario = (scenario) => {
    soundService.playClick();
    setSelectedScenario(scenario);
    setMessages([
      {
        sender: 'ai',
        text: scenario.initialMessage,
        audioText: scenario.initialMessage,
        grammarTip: null
      }
    ]);
    speechService.speak(scenario.initialMessage);
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    soundService.playClick();
    const userMsg = { sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsAiTyping(true);

    // Simulate AI response with real-time feedback
    setTimeout(() => {
      let aiResponseText = "That sounds great! Would you like anything else with that?";
      let grammarTip = null;

      const lower = text.toLowerCase();
      if (selectedScenario.id === 'cafe-order') {
        if (lower.includes('water') || lower.includes('coffee') || lower.includes('latte')) {
          aiResponseText = "Sure thing! What size would you like? Tall, Grande, or Venti?";
        } else if (lower.includes('size') || lower.includes('large') || lower.includes('medium') || lower.includes('venti') || lower.includes('grande')) {
          aiResponseText = "Got it! Can I get a name for your cup today?";
        } else {
          aiResponseText = "Perfect! Your order will be ready at the counter in just a minute. Anything else?";
          grammarTip = "Tips: Penggunaan frasa 'Can I get...' sangat natural dalam pemesanan kopi.";
        }
      } else if (selectedScenario.id === 'airport-customs') {
        if (lower.includes('vacation') || lower.includes('visit') || lower.includes('holiday')) {
          aiResponseText = "Welcome to London! How many days do you plan to stay in the UK?";
        } else {
          aiResponseText = "Thank you. Here is your passport back. Have a wonderful stay in London!";
          grammarTip = "Tips: Pengungkapan durasi waktu biasa menggunakan 'for 7 days' atau 'until next week'.";
        }
      } else if (selectedScenario.id === 'job-interview') {
        aiResponseText = "Excellent. What would you say is your biggest professional achievement so far?";
      }

      setIsAiTyping(false);
      const aiMsg = {
        sender: 'ai',
        text: aiResponseText,
        audioText: aiResponseText,
        grammarTip
      };
      setMessages((prev) => [...prev, aiMsg]);
      speechService.speak(aiResponseText);
      soundService.playGem();
      onAddXp(10);
    }, 1200);
  };

  const handleMicToggle = () => {
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
            handleSendMessage(transcript);
          }
        },
        onError: () => setIsListening(false),
        onEnd: () => setIsListening(false)
      });
    }
  };

  return (
    <div className="roleplay-container">
      {!selectedScenario ? (
        <div className="scenarios-selection">
          <div className="section-header">
            <div className="ai-badge">
              <Sparkles size={20} color="#ce82ff" />
              <span>Duolingo Max AI Scenario</span>
            </div>
            <h2>Latihan Percakapan AI (Roleplay)</h2>
            <p>Pilih skenario percakapan dunia nyata dan latih kelancaran berbicara Anda dengan umpan balik langsung!</p>
          </div>

          <div className="scenarios-grid">
            {ROLEPLAY_SCENARIOS.map((scen) => (
              <div
                key={scen.id}
                onClick={() => handleStartScenario(scen)}
                className="scenario-card glass-card"
                style={{ background: scen.bgGradient }}
              >
                <div className="card-top">
                  <span className="scen-avatar">{scen.avatar}</span>
                  <span className="diff-tag">{scen.difficulty}</span>
                </div>
                <h3>{scen.title}</h3>
                <span className="cat-tag">{scen.category}</span>
                <button className="btn-3d btn-purple start-roleplay-btn">
                  Mulai Simulasi
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-room-wrapper glass-card">
          {/* Chat Header */}
          <div className="chat-header">
            <button onClick={() => setSelectedScenario(null)} className="back-btn">
              <ArrowLeft size={20} />
            </button>
            <div className="chat-partner-info">
              <span className="partner-avatar">{selectedScenario.avatar}</span>
              <div>
                <h3>{selectedScenario.title}</h3>
                <span className="status-dot">● Online AI Partner</span>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages-list">
            {messages.map((m, idx) => (
              <div key={idx} className={`chat-message-bubble ${m.sender}`}>
                {m.sender === 'ai' && (
                  <button onClick={() => speechService.speak(m.audioText)} className="speak-msg-btn">
                    <Volume2 size={16} color="#ce82ff" />
                  </button>
                )}
                <div className="msg-content">
                  <p>{m.text}</p>
                  {m.grammarTip && (
                    <div className="grammar-tip-box">
                      <Sparkles size={14} color="#58cc02" />
                      <span>{m.grammarTip}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isAiTyping && (
              <div className="chat-message-bubble ai typing">
                <span>AI sedang mengetik...</span>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Suggested Prompts */}
          <div className="prompts-bar">
            {selectedScenario.suggestedPrompts.map((p, i) => (
              <button key={i} onClick={() => handleSendMessage(p)} className="prompt-chip">
                "{p}"
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="chat-input-bar">
            <input
              type="text"
              placeholder="Tulis balasan bahasa Inggris..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleMicToggle} className={`mic-chat-btn ${isListening ? 'active' : ''}`}>
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            <button onClick={() => handleSendMessage()} className="send-chat-btn">
              <Send size={20} />
            </button>
          </div>
        </div>
      )}

      <style>{`
        .roleplay-container {
          width: 100%;
          max-width: 800px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(206, 130, 255, 0.15);
          color: var(--purple-primary);
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 800;
          font-size: 0.85rem;
          margin-bottom: 12px;
        }

        .section-header h2 {
          font-size: 1.8rem;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .section-header p {
          color: var(--text-sub);
          font-weight: 600;
        }

        .scenarios-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .scenario-card {
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .scenario-card:hover {
          transform: translateY(-6px);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .scen-avatar {
          font-size: 2.5rem;
        }

        .diff-tag {
          background: rgba(0, 0, 0, 0.3);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 800;
        }

        .scenario-card h3 {
          font-size: 1.2rem;
          font-weight: 900;
        }

        .cat-tag {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        .start-roleplay-btn {
          margin-top: 8px;
        }

        /* Chat Room */
        .chat-room-wrapper {
          display: flex;
          flex-direction: column;
          height: 600px;
          padding: 0;
          overflow: hidden;
        }

        .chat-header {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 2px solid var(--border-color);
        }

        .back-btn {
          background: none;
          border: none;
          color: var(--text-main);
          cursor: pointer;
        }

        .chat-partner-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .partner-avatar {
          font-size: 2rem;
        }

        .status-dot {
          font-size: 0.75rem;
          color: var(--green-primary);
          font-weight: 800;
        }

        .chat-messages-list {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .chat-message-bubble {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          max-width: 80%;
        }

        .chat-message-bubble.user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .msg-content {
          background: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .chat-message-bubble.user .msg-content {
          background: var(--purple-primary);
          color: #fff;
        }

        .grammar-tip-box {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 0.8rem;
          color: var(--green-primary);
        }

        .speak-msg-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px;
        }

        .prompts-bar {
          display: flex;
          gap: 8px;
          padding: 10px 20px;
          overflow-x: auto;
          background: rgba(0, 0, 0, 0.1);
        }

        .prompt-chip {
          white-space: nowrap;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          padding: 6px 12px;
          border-radius: 14px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-sub);
          cursor: pointer;
        }

        .prompt-chip:hover {
          color: var(--text-main);
          border-color: var(--purple-primary);
        }

        .chat-input-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 20px;
          border-top: 2px solid var(--border-color);
        }

        .chat-input-bar input {
          flex: 1;
          background: var(--bg-primary);
          border: 2px solid var(--border-color);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--text-main);
          font-weight: 700;
          outline: none;
        }

        .mic-chat-btn, .send-chat-btn {
          background: var(--purple-primary);
          border: none;
          color: #fff;
          padding: 12px;
          border-radius: var(--radius-md);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mic-chat-btn.active {
          background: var(--red-primary);
          animation: pulse 1s infinite;
        }
      `}</style>
    </div>
  );
}
