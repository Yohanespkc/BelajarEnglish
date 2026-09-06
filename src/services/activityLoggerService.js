/**
 * Activity Logger & Progress Report Service
 * Automatically logs user activities across all modules every time the project is run/used.
 * Persists session metrics, chronological timeline, and learning insights to LocalStorage.
 */

const STORAGE_KEY_ACTIVITIES = 'lingo_activity_logs';
const STORAGE_KEY_SESSIONS = 'lingo_sessions';

// Seed initial history if first time so the report is immediately rich
const INITIAL_ACTIVITIES = [
  {
    id: 'act_init_1',
    sessionId: 'session_init',
    timestamp: new Date(Date.now() - 3600 * 1000 * 4).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(Date.now() - 3600 * 1000 * 4).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    type: 'editor',
    title: 'Edit Teks Bahasa Inggris (Konteks Becanda)',
    detail: 'Mengoreksi: "I very like playing game with my bro and he is very noob lol" ➔ "I really love playing games with my bro, and he\'s such a noob – lol!"',
    score: 95,
    xpEarned: 15,
    metadata: { context: 'Becanda & Santai' }
  },
  {
    id: 'act_init_2',
    sessionId: 'session_init',
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(Date.now() - 3600 * 1000 * 2).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    type: 'linguistics',
    title: 'Bedah Kata & Etimologi: "Bright"',
    detail: 'Mempelajari asal-usul Old English (beorht), 4 kata turunan (brightness, brighten, dll.), dan 5 idiom populer.',
    score: 100,
    xpEarned: 20,
    metadata: { word: 'Bright' }
  },
  {
    id: 'act_init_3',
    sessionId: 'session_init',
    timestamp: new Date(Date.now() - 3600 * 1000 * 1).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date(Date.now() - 3600 * 1000 * 1).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
    type: 'pronunciation',
    title: 'Latihan Pronunciation: Kata "Comfortable"',
    detail: 'Menganalisis perbandingan gelombang suara Native vs Rekaman. Artikulasi fonetik: 94%, Tempo: 92%.',
    score: 94,
    xpEarned: 25,
    metadata: { tier: 'Per Kata', text: 'Comfortable' }
  }
];

class ActivityLoggerService {
  constructor() {
    this.currentSessionId = null;
    this.sessionStartTime = null;
  }

  // Start or resume a session when project runs
  startSession() {
    const now = Date.now();
    this.currentSessionId = 'sess_' + now;
    this.sessionStartTime = now;

    try {
      const existingSessions = this.getSessions();
      const newSession = {
        id: this.currentSessionId,
        startTime: now,
        date: new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        activitiesCount: 0,
        xpGained: 0
      };

      const updatedSessions = [newSession, ...existingSessions].slice(0, 50);
      localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(updatedSessions));
    } catch (e) {
      console.warn('Could not save session to localStorage', e);
    }
  }

  // Log a new activity item
  logActivity({ type, title, detail, score = null, xpEarned = 0, tokensEarned = 0, metadata = {} }) {
    if (!this.currentSessionId) {
      this.startSession();
    }

    const now = Date.now();
    const newActivity = {
      id: 'act_' + now + '_' + Math.random().toString(36).substr(2, 4),
      sessionId: this.currentSessionId,
      timestamp: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date(now).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      type, // 'editor' | 'linguistics' | 'pronunciation' | 'lesson' | 'game' | 'roleplay'
      title,
      detail,
      score,
      xpEarned,
      tokensEarned,
      metadata
    };

    try {
      const activities = this.getActivities();
      const updated = [newActivity, ...activities].slice(0, 150); // Keep last 150 activities
      localStorage.setItem(STORAGE_KEY_ACTIVITIES, JSON.stringify(updated));

      // Update current session stats
      const sessions = this.getSessions();
      const current = sessions.find(s => s.id === this.currentSessionId);
      if (current) {
        current.activitiesCount = (current.activitiesCount || 0) + 1;
        current.xpGained = (current.xpGained || 0) + xpEarned;
        current.tokensGained = (current.tokensGained || 0) + tokensEarned;
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      }
    } catch (e) {
      console.warn('Could not log activity to localStorage', e);
    }

    return newActivity;
  }

  // Get activities list
  getActivities() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ACTIVITIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read activities from localStorage', e);
    }
    return INITIAL_ACTIVITIES;
  }

  // Get sessions list
  getSessions() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SESSIONS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Could not read sessions from localStorage', e);
    }
    return [
      {
        id: 'session_init',
        startTime: Date.now() - 3600 * 1000 * 4,
        date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        time: 'Sesi Awal',
        activitiesCount: 3,
        xpGained: 60,
        tokensGained: 30
      }
    ];
  }

  // Generate aggregate metrics for Progress Report
  getProgressSummary() {
    const activities = this.getActivities();
    const sessions = this.getSessions();

    const totalActivities = activities.length;
    const totalSessions = Math.max(1, sessions.length);

    // Distribution by module
    const distribution = {
      editor: activities.filter(a => a.type === 'editor').length,
      linguistics: activities.filter(a => a.type === 'linguistics').length,
      pronunciation: activities.filter(a => a.type === 'pronunciation').length,
      lesson: activities.filter(a => a.type === 'lesson').length,
      game: activities.filter(a => a.type === 'game').length,
      roleplay: activities.filter(a => a.type === 'roleplay').length,
    };

    // Pronunciation average score
    const pronActs = activities.filter(a => a.type === 'pronunciation' && typeof a.score === 'number');
    const avgPronScore = pronActs.length > 0
      ? Math.round(pronActs.reduce((acc, a) => acc + a.score, 0) / pronActs.length)
      : 88;

    // Total XP logged
    const totalLoggedXp = activities.reduce((acc, a) => acc + (a.xpEarned || 0), 0);
    const totalLoggedTokens = activities.reduce((acc, a) => acc + (a.tokensEarned || 0), 0);

    return {
      totalSessions,
      totalActivities,
      distribution,
      avgPronScore,
      totalLoggedXp,
      totalLoggedTokens
    };
  }

  // Clear all logged activities
  clearLogs() {
    localStorage.removeItem(STORAGE_KEY_ACTIVITIES);
    localStorage.removeItem(STORAGE_KEY_SESSIONS);
    this.startSession();
  }
}

export const activityLoggerService = new ActivityLoggerService();
