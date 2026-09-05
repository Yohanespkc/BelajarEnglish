import React from 'react';
import { 
  BookOpen, 
  Mic, 
  MessageSquare, 
  Trophy, 
  ShoppingBag, 
  User, 
  Zap, 
  Sparkles, 
  Volume2, 
  VolumeX,
  Languages,
  BookMarked
} from 'lucide-react';
import { soundService } from '../services/soundService';

export default function Sidebar({ activeTab, setActiveTab, userState, soundMuted, setSoundMuted }) {
  const navItems = [
    { id: 'editor', label: 'AI Editor', icon: Sparkles, color: '#00d26a', badge: 'AI CHAT' },
    { id: 'linguistics', label: 'Tanya Kata & Grammar', icon: BookMarked, color: '#1cb0f6', badge: 'LINGUIST' },
    { id: 'learn', label: 'Belajar', icon: BookOpen, color: '#58cc02' },
    { id: 'translator', label: 'AI Translator', icon: Languages, color: '#58cc02', badge: 'LOCAL AI' },
    { id: 'pronunciation', label: 'Pronunciation', icon: Mic, color: '#1cb0f6', badge: 'PRO' },
    { id: 'roleplay', label: 'AI Roleplay', icon: MessageSquare, color: '#ce82ff', badge: 'AI' },
    { id: 'madness', label: 'Match Game', icon: Zap, color: '#ffc800' },
    { id: 'leaderboard', label: 'Liga Top', icon: Trophy, color: '#ff9600' },
    { id: 'shop', label: 'Toko', icon: ShoppingBag, color: '#1cb0f6' },
    { id: 'profile', label: 'Profil Saya', icon: User, color: '#ff4b4b' },
  ];

  const handleNavClick = (id) => {
    soundService.playClick();
    setActiveTab(id);
  };

  const toggleSound = () => {
    const isMuted = soundService.toggleMute();
    setSoundMuted(isMuted);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="desktop-sidebar">
        <div className="sidebar-logo">
          <div className="logo-badge">
            <span>🦉</span>
          </div>
          <h2>LingoMaster</h2>
        </div>

        <nav className="sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`nav-btn ${isActive ? 'active' : ''}`}
                style={{
                  '--nav-color': item.color
                }}
              >
                <Icon size={22} color={isActive ? item.color : '#9ca3af'} />
                <span className="nav-label">{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button onClick={toggleSound} className="sound-toggle-btn">
            {soundMuted ? <VolumeX size={20} color="#ff4b4b" /> : <Volume2 size={20} color="#58cc02" />}
            <span>{soundMuted ? 'Suara Off' : 'Suara On'}</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} color={isActive ? item.color : '#9ca3af'} />
              <span className="mobile-nav-label" style={{ color: isActive ? item.color : '#9ca3af' }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <style>{`
        .desktop-sidebar {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          width: 250px;
          background: var(--bg-card);
          border-right: 2px solid var(--border-color);
          padding: 24px 16px;
          flex-direction: column;
          z-index: 100;
        }

        @media (min-width: 768px) {
          .desktop-sidebar {
            display: flex;
          }
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 0 12px 24px 12px;
          border-bottom: 2px solid var(--border-color);
          margin-bottom: 16px;
        }

        .logo-badge {
          font-size: 2rem;
          background: rgba(88, 204, 2, 0.15);
          border-radius: 12px;
          padding: 4px 8px;
        }

        .sidebar-logo h2 {
          font-size: 1.4rem;
          font-weight: 900;
          letter-spacing: -0.5px;
          background: linear-gradient(135deg, #58cc02 0%, #1cb0f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .sidebar-menu {
          display: flex;
          flex-direction: column;
          gap: 8px;
          flex: 1;
        }

        .nav-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          background: transparent;
          border: 2px solid transparent;
          color: var(--text-sub);
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          position: relative;
        }

        .nav-btn:hover {
          background: var(--bg-card-hover);
          color: var(--text-main);
        }

        .nav-btn.active {
          background: rgba(255, 255, 255, 0.05);
          border-color: var(--nav-color);
          color: var(--nav-color);
        }

        .nav-badge {
          margin-left: auto;
          background: var(--blue-primary);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .sidebar-footer {
          padding-top: 16px;
          border-top: 2px solid var(--border-color);
        }

        .sound-toggle-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 14px;
          border-radius: var(--radius-md);
          background: var(--bg-card-hover);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          font-weight: 700;
          cursor: pointer;
        }

        /* Mobile Bottom Nav */
        .mobile-bottom-nav {
          display: flex;
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          height: 65px;
          background: var(--bg-card);
          border-top: 2px solid var(--border-color);
          justify-content: space-around;
          align-items: center;
          z-index: 100;
        }

        @media (min-width: 768px) {
          .mobile-bottom-nav {
            display: none;
          }
        }

        .mobile-nav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
        }

        .mobile-nav-label {
          font-size: 0.65rem;
          font-weight: 800;
        }
      `}</style>
    </>
  );
}
