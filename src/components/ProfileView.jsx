import React, { useState, useEffect } from 'react';
import { ACHIEVEMENTS } from '../data/achievementsData';
import { 
  RotateCcw, 
  Activity, 
  Clock, 
  Calendar, 
  Copy, 
  Check, 
  Trash2, 
  Filter,
  Trophy,
  Award,
  Sparkles,
  ChevronRight,
  Shield,
  Star,
  Zap,
  Target,
  Layers,
  BookOpen
} from 'lucide-react';
import { soundService } from '../services/soundService';
import { activityLoggerService } from '../services/activityLoggerService';
import { honorScoringService, HONORARY_TITLES } from '../services/honorScoringService';

export default function ProfileView({ userState, onResetProgress, onAddTokens }) {
  const [activities, setActivities] = useState([]);
  const [_sessions, setSessions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isCopied, setIsCopied] = useState(false);
  const [activePrestigeTab, setActivePrestigeTab] = useState('overview'); // 'overview' | 'matrix' | 'ladder'

  const honorInfo = honorScoringService.getHonorTitle(userState?.tokens || 150);

  // Load progress report data
  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = () => {
    const act = activityLoggerService.getActivities();
    const sess = activityLoggerService.getSessions();
    const sum = activityLoggerService.getProgressSummary();
    setActivities(act);
    setSessions(sess);
    setSummary(sum);
  };

  const handleCopyReport = () => {
    soundService.playClick();
    if (!summary) return;

    const reportText = `📊 LAPORAN KEMAJUAN BELAJAR & GELAR KEHORMATAN (PROGRESS REPORT)
Nama Pembelajar: ${userState.name}
Gelar Kehormatan: ${honorInfo.name} (${honorInfo.nameId}) - Tier ${honorInfo.tier} dari 7
Token Kehormatan: ${userState?.tokens || 150} Token 🪙
Streak Saat Ini: ${userState.streak} Hari | Total XP: ${userState.xp} XP | Permata: ${userState.gems}

RINGKASAN SESI & AKTIVITAS:
- Total Sesi Belajar Dijalankan: ${summary.totalSessions} Sesi
- Total Aktivitas Tercatat: ${summary.totalActivities} Aktivitas
- Rata-rata Skor Pronunciation: ${summary.avgPronScore}%
- XP Latihan Terkumpul: +${summary.totalLoggedXp} XP

DISTRIBUSI MODUL:
- AI English Editor: ${summary.distribution.editor} latihan
- Tanya Kata & Grammar: ${summary.distribution.linguistics} topik
- Pronunciation & Waveform: ${summary.distribution.pronunciation} rekaman
- Materi Pelajaran: ${summary.distribution.lesson} unit
- AI Roleplay Skenario: ${summary.distribution.roleplay || 0} simulasi
- Match Game: ${summary.distribution.game || 0} game

Laporan digenerate dari aplikasi BelajarEnglish (LingoMaster)`;

    navigator.clipboard.writeText(reportText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2200);
  };

  const handleClearLogs = () => {
    if (window.confirm("Hapus seluruh catatan riwayat sesi & aktivitas latihan? (XP, Token, dan lencana akun Anda tetap aman)")) {
      soundService.playClick();
      activityLoggerService.clearLogs();
      loadProgressData();
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (selectedFilter === 'all') return true;
    return act.type === selectedFilter;
  });

  const getModuleBadge = (type) => {
    switch (type) {
      case 'editor':
        return { label: 'AI Editor', color: '#00d26a', bg: 'rgba(0, 210, 106, 0.15)', icon: '✍️' };
      case 'linguistics':
        return { label: 'Tanya Kata & Grammar', color: '#1cb0f6', bg: 'rgba(28, 176, 246, 0.15)', icon: '🔍' };
      case 'pronunciation':
        return { label: 'Pronunciation', color: '#ce82ff', bg: 'rgba(206, 130, 255, 0.15)', icon: '🎙️' };
      case 'lesson':
        return { label: 'Materi Belajar', color: '#58cc02', bg: 'rgba(88, 204, 2, 0.15)', icon: '📚' };
      case 'roleplay':
        return { label: 'AI Roleplay', color: '#ce82ff', bg: 'rgba(206, 130, 255, 0.15)', icon: '🎭' };
      case 'game':
        return { label: 'Match Game', color: '#ffc800', bg: 'rgba(255, 200, 0, 0.15)', icon: '⚡' };
      default:
        return { label: 'Aktivitas', color: '#9ca3af', bg: 'rgba(156, 163, 175, 0.15)', icon: '📌' };
    }
  };

  return (
    <div className="profile-container" style={{
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto',
      padding: '24px 20px 48px 20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      {/* Profile Header */}
      <div className="profile-card glass-card" style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '22px 26px',
        border: '2px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
      }}>
        <div className="avatar-big" style={{
          fontSize: '3.5rem',
          background: 'rgba(88, 204, 2, 0.15)',
          border: '3px solid #58cc02',
          width: '88px',
          height: '88px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {userState.avatar || '🦉'}
        </div>
        <div className="profile-details">
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text-main)' }}>
            {userState.name}
          </h2>
          <span style={{ color: 'var(--text-sub)', fontWeight: 700, fontSize: '0.9rem' }}>
            Pembelajar Aktif BelajarEnglish • Member Sejak 2026
          </span>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="stats-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '12px'
      }}>
        <div className="stat-card glass-card" style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '2rem' }}>🔥</span>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>{userState.streak} Hari</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, margin: 0 }}>Daily Streak</p>
          </div>
        </div>

        <div className="stat-card glass-card" style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '2rem' }}>⚡</span>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>{userState.xp} XP</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, margin: 0 }}>Total Pengalaman</p>
          </div>
        </div>

        <div className="stat-card glass-card" style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '2rem' }}>💎</span>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>{userState.gems}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, margin: 0 }}>Permata (Gems)</p>
          </div>
        </div>

        <div className="stat-card glass-card" style={{
          background: 'var(--bg-card)',
          border: '2px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '2rem' }}>🏆</span>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>{userState.activeLeague}</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 700, margin: 0 }}>Liga Mingguan</p>
          </div>
        </div>

        {/* 5th Stat Card: Honor Tokens & Title */}
        <div className="stat-card glass-card" style={{
          background: 'linear-gradient(135deg, rgba(255, 200, 0, 0.12), rgba(206, 130, 255, 0.08))',
          border: '2px solid rgba(255, 200, 0, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 4px 14px rgba(255, 200, 0, 0.15)'
        }}>
          <span style={{ fontSize: '2rem' }}>🪙</span>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0, color: '#ffc800' }}>
              {userState.tokens || 150} Token
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-sub)', fontWeight: 800, margin: 0 }}>
              Gelar: {honorInfo.name}
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SISTEM SKORING GAME PROFESIONAL & GELAR KEHORMATAN (BARU) */}
      {/* ========================================================================= */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid rgba(255, 200, 0, 0.35)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 8px 28px rgba(255, 200, 0, 0.12)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Glow ambient accent */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-60px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 200, 0, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #ffc800, #ff9600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#000',
              boxShadow: '0 4px 14px rgba(255, 200, 0, 0.35)'
            }}>
              <Trophy size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
                  Sistem Skoring Profesional & Gelar Kehormatan
                </h3>
                <span style={{
                  background: 'linear-gradient(135deg, rgba(255, 200, 0, 0.2), rgba(206, 130, 255, 0.2))',
                  color: '#ffc800',
                  border: '1px solid rgba(255, 200, 0, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 900
                }}>
                  GAME COMPETITIVE TIER
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
                Raih Skor S & A di AI Roleplay dan latihan untuk mengumpulkan Token Kehormatan & membuka 7 Gelar Bergengsi!
              </p>
            </div>
          </div>

          {/* Prestige Tabs */}
          <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-primary)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
            {[
              { id: 'overview', label: '🌟 Gelar Aktif' },
              { id: 'matrix', label: '⚖️ Cara Penilaian' },
              { id: 'ladder', label: '👑 Tangga 7 Gelar' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  soundService.playClick();
                  setActivePrestigeTab(tab.id);
                }}
                style={{
                  background: activePrestigeTab === tab.id ? 'linear-gradient(135deg, #ffc800, #ff9600)' : 'transparent',
                  color: activePrestigeTab === tab.id ? '#000' : 'var(--text-sub)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* TAB 1: OVERVIEW & ACTIVE HONOR TITLE */}
        {activePrestigeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Active Title Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.04), rgba(255, 200, 0, 0.06))',
              border: '2px solid rgba(255, 200, 0, 0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '20px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '18px', flex: 1, minWidth: '280px' }}>
                <div style={{
                  fontSize: '3.6rem',
                  width: '84px',
                  height: '84px',
                  borderRadius: '50%',
                  background: 'rgba(255, 200, 0, 0.15)',
                  border: '3px solid #ffc800',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 6px 20px rgba(255, 200, 0, 0.25)'
                }}>
                  {honorInfo.icon}
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#ffc800', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    👑 GELAR KEHORMATAN AKTIF • TIER {honorInfo.tier} DARI 7
                  </span>
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '2px 0 4px 0', color: 'var(--text-main)' }}>
                    {honorInfo.name} <span style={{ fontSize: '1rem', color: 'var(--text-sub)', fontWeight: 700 }}>({honorInfo.nameId})</span>
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                    {honorInfo.description}
                  </p>
                  <div style={{ marginTop: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(88, 204, 2, 0.12)', color: '#58cc02', padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                    <Check size={14} /> Hak Istimewa: {honorInfo.perks}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                minWidth: '220px',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem' }}>🪙</span>
                  <div>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffc800', lineHeight: 1 }}>
                      {userState.tokens || 150}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-sub)', fontWeight: 700 }}>Token Kehormatan</span>
                  </div>
                </div>

                {honorInfo.nextTitle && (
                  <div style={{ width: '100%', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-sub)', marginBottom: '4px' }}>
                      <span>Menuju {honorInfo.nextTitle.name}</span>
                      <span>{honorInfo.progressToNext}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', background: 'var(--bg-primary)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                      <div style={{ width: `${honorInfo.progressToNext}%`, height: '100%', background: 'linear-gradient(90deg, #ffc800, #ce82ff)', borderRadius: '6px' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', color: '#ffc800', fontWeight: 700, display: 'block', textAlign: 'right', marginTop: '3px' }}>
                      Butuh {honorInfo.tokensNeeded} Token lagi
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* How Tokens Are Earned in Games */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Sparkles size={16} color="#ce82ff" />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>AI Roleplay S-Rank</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                  Jawab pertanyaan skenario dengan tepat & alami untuk meraih hingga <b>+15 Token</b> per giliran.
                </p>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Zap size={16} color="#ffc800" />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Match Madness Permainan</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                  Cocokkan kata cepat dalam 60 detik tanpa salah sebaris untuk bonus token kombo.
                </p>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <Shield size={16} color="#58cc02" />
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Anti-Jawaban Ngawur</strong>
                </div>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                  Jawaban salah atau tidak nyambung dinilai <b>Grade D (0 Token)</b> agar kompetisi tetap adil dan bermutu!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 4-PILLAR SCORING MATRIX */}
        {activePrestigeTab === 'matrix' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1.5px solid rgba(88, 204, 2, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#58cc02', textTransform: 'uppercase' }}>1. Tata Bahasa</span>
                  <span style={{ background: 'rgba(88, 204, 2, 0.15)', color: '#58cc02', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>BOBOT 30%</span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: 'var(--text-main)' }}>Grammar & Syntax</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                  Ketepatan rumus waktu (*tenses*), *subject-verb agreement*, kata depan (*prepositions*), dan konjugasi kata kerja.
                </p>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1.5px solid rgba(28, 176, 246, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#1cb0f6', textTransform: 'uppercase' }}>2. Konteks Peran</span>
                  <span style={{ background: 'rgba(28, 176, 246, 0.15)', color: '#1cb0f6', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>BOBOT 35%</span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: 'var(--text-main)' }}>Situational Relevance</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                  Kesesuaian respon terhadap pertanyaan lawan bicara. Jawaban ngawur/off-topic langsung mendapat penalti nilai.
                </p>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1.5px solid rgba(206, 130, 255, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ce82ff', textTransform: 'uppercase' }}>3. Kekayaan Kata</span>
                  <span style={{ background: 'rgba(206, 130, 255, 0.15)', color: '#ce82ff', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>BOBOT 20%</span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: 'var(--text-main)' }}>Lexical Richness</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                  Variasi diksi, *phrasal verbs*, idiom alami, dan terminologi yang tepat untuk skenario (formal vs kasual).
                </p>
              </div>

              <div style={{ background: 'var(--bg-primary)', padding: '14px', borderRadius: '12px', border: '1.5px solid rgba(255, 200, 0, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 900, color: '#ffc800', textTransform: 'uppercase' }}>4. Kelancaran</span>
                  <span style={{ background: 'rgba(255, 200, 0, 0.15)', color: '#ffc800', padding: '2px 6px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: 900 }}>BOBOT 15%</span>
                </div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.92rem', color: 'var(--text-main)' }}>Spoken Fluency</h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-sub)', lineHeight: 1.4 }}>
                  Kehalusan struktur kalimat lisan, transisi klausa yang wajar, dan respon yang tidak kaku/sepotong-sepotong.
                </p>
              </div>
            </div>

            {/* Competitive Game Rank Table */}
            <div style={{ background: 'var(--bg-primary)', borderRadius: '12px', padding: '14px 16px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: 'var(--text-sub)', textTransform: 'uppercase' }}>
                Tabel Skala Peringkat Game & Hadiah Token:
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
                {[
                  { grade: 'S+', score: '95 - 100', token: '+15 Token 🪙', label: 'Grandmaster', color: '#ffc800' },
                  { grade: 'S', score: '90 - 94', token: '+12 Token 🪙', label: 'Flawless', color: '#58cc02' },
                  { grade: 'A', score: '80 - 89', token: '+8 Token 🪙', label: 'Sharp & Natural', color: '#1cb0f6' },
                  { grade: 'B', score: '70 - 79', token: '+4 Token 🪙', label: 'Competent', color: '#ce82ff' },
                  { grade: 'C', score: '50 - 69', token: '+1 Token 🪙', label: 'Needs Polish', color: '#ff9600' },
                  { grade: 'D', score: '< 50 Poin', token: '0 Token ❌', label: 'Salah / Off-Topic', color: '#ff4b4b' }
                ].map(r => (
                  <div key={r.grade} style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${r.color}40`,
                    borderRadius: '8px',
                    padding: '8px 10px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 900, color: r.color }}>{r.grade}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 700 }}>{r.score}</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: r.color, margin: '2px 0' }}>{r.token}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-sub)' }}>{r.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: 7 HONORARY TITLES LADDER */}
        {activePrestigeTab === 'ladder' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {HONORARY_TITLES.map((t) => {
              const isCurrent = honorInfo.id === t.id;
              const isUnlocked = (userState?.tokens || 150) >= t.minTokens;
              return (
                <div
                  key={t.id}
                  style={{
                    background: isCurrent ? 'linear-gradient(135deg, rgba(255, 200, 0, 0.15), rgba(206, 130, 255, 0.1))' : 'var(--bg-primary)',
                    border: isCurrent ? '2px solid #ffc800' : '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    opacity: isUnlocked ? 1 : 0.65
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '2rem' }}>{t.icon}</span>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: t.badgeColor }}>TIER {t.tier}</span>
                        <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>{t.name}</strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-sub)' }}>({t.nameId})</span>
                        {isCurrent && (
                          <span style={{ background: '#ffc800', color: '#000', padding: '1px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 900 }}>
                            SEDANG AKTIF
                          </span>
                        )}
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-sub)' }}>
                        {t.description} • <i>{t.perks}</i>
                      </p>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 900, color: isUnlocked ? '#58cc02' : 'var(--text-sub)' }}>
                      {isUnlocked ? 'TERBUKA ✅' : `Butuh ${t.minTokens} Token 🪙`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PROGRESS REPORT SECTION (BARU) */}
      {/* ========================================================================= */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--border-color)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 8px 28px rgba(0,0,0,0.15)'
      }}>
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #58cc02, #1cb0f6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(88, 204, 2, 0.3)'
            }}>
              <Activity size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0, color: 'var(--text-main)' }}>
                  Laporan Kemajuan Belajar (Progress Report)
                </h3>
                <span style={{
                  background: 'rgba(88, 204, 2, 0.15)',
                  color: '#58cc02',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '0.72rem',
                  fontWeight: 800
                }}>
                  OTOMATIS TERCATAT
                </span>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-sub)', margin: '2px 0 0 0' }}>
                Riwayat dan metrik latihan yang Anda jalankan setiap kali membuka aplikasi ini.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handleCopyReport}
              style={{
                background: isCopied ? '#58cc02' : 'var(--bg-card-hover)',
                color: isCopied ? '#fff' : 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '8px 14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.8rem',
                fontWeight: 700,
                transition: 'all 0.2s ease'
              }}
            >
              {isCopied ? <Check size={15} /> : <Copy size={15} />}
              <span>{isCopied ? 'Tersalin!' : 'Salin Laporan'}</span>
            </button>

            <button
              onClick={handleClearLogs}
              title="Bersihkan catatan riwayat aktivitas"
              style={{
                background: 'rgba(255, 75, 75, 0.08)',
                color: '#ff4b4b',
                border: '1px solid rgba(255, 75, 75, 0.25)',
                borderRadius: '10px',
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8rem',
                fontWeight: 700
              }}
            >
              <Trash2 size={15} />
              <span>Bersihkan Log</span>
            </button>
          </div>
        </div>

        {/* 4 Key Executive Metrics */}
        {summary && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
            gap: '12px'
          }}>
            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                🚀 Total Sesi Dijalankan
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#1cb0f6', marginTop: '2px' }}>
                {summary.totalSessions} Sesi
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>Waktu belajar tercatat</span>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                📈 Total Latihan Tercatat
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#58cc02', marginTop: '2px' }}>
                {summary.totalActivities} Aktivitas
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>Interaksi di seluruh modul</span>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                🎯 Rerata Skor Pronunciation
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ff9600', marginTop: '2px' }}>
                {summary.avgPronScore}%
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>Akurasi gelombang suara</span>
            </div>

            <div style={{
              background: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px',
              border: '1px solid var(--border-color)'
            }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-sub)', fontWeight: 800, textTransform: 'uppercase' }}>
                ⚡ XP Latihan Terkumpul
              </span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ce82ff', marginTop: '2px' }}>
                +{summary.totalLoggedXp} XP
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-sub)' }}>Dari seluruh aktivitas</span>
            </div>
          </div>
        )}

        {/* Module Breakdown Bar */}
        {summary && (
          <div style={{
            background: 'var(--bg-card-hover)',
            borderRadius: '12px',
            padding: '14px 16px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
              Distribusi Latihan per Modul:
            </span>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                ✍️ <strong>AI Editor:</strong> {summary.distribution.editor} latihan
              </div>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                🔍 <strong>Tanya Kata:</strong> {summary.distribution.linguistics} topik
              </div>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                🎙️ <strong>Pronunciation:</strong> {summary.distribution.pronunciation} rekaman
              </div>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-main)' }}>
                📚 <strong>Materi Belajar:</strong> {summary.distribution.lesson} unit
              </div>
              <span style={{ color: 'var(--border-color)' }}>•</span>
              <div style={{ fontSize: '0.82rem', color: '#ce82ff' }}>
                🎭 <strong>AI Roleplay:</strong> {summary.distribution.roleplay || 0} simulasi
              </div>
            </div>
          </div>
        )}

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Filter size={15} color="var(--text-sub)" />
            <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-sub)', textTransform: 'uppercase' }}>
              Filter Riwayat:
            </span>
          </div>

          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
            {[
              { id: 'all', label: 'Semua' },
              { id: 'editor', label: '✍️ AI Editor' },
              { id: 'linguistics', label: '🔍 Tanya Kata' },
              { id: 'pronunciation', label: '🎙️ Pronunciation' },
              { id: 'lesson', label: '📚 Pelajaran' },
              { id: 'roleplay', label: '🎭 AI Roleplay' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => {
                  soundService.playClick();
                  setSelectedFilter(f.id);
                }}
                style={{
                  background: selectedFilter === f.id ? '#1cb0f6' : 'var(--bg-primary)',
                  color: selectedFilter === f.id ? '#fff' : 'var(--text-main)',
                  border: selectedFilter === f.id ? '1px solid #1899d6' : '1px solid var(--border-color)',
                  borderRadius: '8px',
                  padding: '5px 12px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap'
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Activity Timeline Stream */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxHeight: '440px',
          overflowY: 'auto',
          paddingRight: '4px'
        }}>
          {filteredActivities.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '24px',
              color: 'var(--text-sub)',
              fontSize: '0.88rem'
            }}>
              Belum ada riwayat aktivitas pada filter ini.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const badge = getModuleBadge(act.type);
              return (
                <div
                  key={act.id}
                  style={{
                    background: 'var(--bg-primary)',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    transition: 'transform 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        background: badge.bg,
                        color: badge.color,
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>

                      <span style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {act.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {act.score !== null && (
                        <span style={{
                          background: act.score >= 80 ? 'rgba(88, 204, 2, 0.15)' : 'rgba(255, 200, 0, 0.15)',
                          color: act.score >= 80 ? '#58cc02' : '#ffc800',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 800
                        }}>
                          Skor: {act.score}%
                        </span>
                      )}

                      {act.xpEarned > 0 && (
                        <span style={{
                          background: 'rgba(206, 130, 255, 0.15)',
                          color: '#ce82ff',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 800
                        }}>
                          +{act.xpEarned} XP
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{
                    margin: '2px 0 0 0',
                    fontSize: '0.84rem',
                    color: 'var(--text-sub)',
                    lineHeight: 1.4
                  }}>
                    {act.detail}
                  </p>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.72rem',
                    color: 'var(--text-sub)',
                    borderTop: '1px dashed rgba(255,255,255,0.06)',
                    paddingTop: '6px',
                    marginTop: '2px'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} /> {act.date} • <Clock size={12} /> {act.timestamp}
                    </span>
                    <span>Tersimpan di Sesi</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Badges / Achievements Collection */}
      <div className="section-block" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <h3 className="section-title" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
          Lencana & Pencapaian
        </h3>
        <div className="badges-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px'
        }}>
          {ACHIEVEMENTS.map((badge) => {
            const isUnlocked = userState.unlockedBadges.includes(badge.id);
            return (
              <div 
                key={badge.id} 
                className={`badge-card glass-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                style={{
                  background: 'var(--bg-card)',
                  border: '2px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '6px',
                  padding: '16px',
                  opacity: isUnlocked ? 1 : 0.45,
                  filter: isUnlocked ? 'none' : 'grayscale(1)'
                }}
              >
                <span style={{ fontSize: '2.2rem' }}>{isUnlocked ? badge.unlockedIcon : '🔒'}</span>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{badge.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-sub)', margin: 0 }}>{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mistake Vault */}
      {userState.mistakeVault && userState.mistakeVault.length > 0 && (
        <div className="section-block" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 className="section-title" style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-main)' }}>
            Bank Perbaikan (Mistake Vault)
          </h3>
          <div className="mistakes-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {userState.mistakeVault.map((m) => (
              <div key={m.id} style={{
                background: 'var(--bg-card)',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>{m.question}</h4>
                <p style={{ color: '#ff4b4b', fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>❌ Jawabanmu: {m.userAnswer}</p>
                <p style={{ color: '#58cc02', fontSize: '0.85rem', fontWeight: 800, margin: 0 }}>✅ Jawaban benar: {m.correctAnswer}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-sub)', margin: 0 }}>💡 {m.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reset Progress Danger Zone */}
      <div style={{ marginTop: '10px' }}>
        <button
          onClick={() => {
            soundService.playClick();
            if (window.confirm("Apakah Anda yakin ingin mengulang seluruh progres dari 0?")) {
              onResetProgress();
            }
          }}
          style={{
            background: 'transparent',
            border: '2px solid #ff4b4b',
            color: '#ff4b4b',
            borderRadius: '12px',
            padding: '10px 18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 800,
            fontSize: '0.85rem'
          }}
        >
          <RotateCcw size={16} /> Reset Ulang Seluruh Progres
        </button>
      </div>
    </div>
  );
}
