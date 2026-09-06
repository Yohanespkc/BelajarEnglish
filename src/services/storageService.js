// Local storage persistence service for user progress, stats, and settings

const INITIAL_USER_STATE = {
  name: "Learner",
  avatar: "🦉",
  xp: 120,
  streak: 3,
  gems: 450,
  hearts: 5,
  maxHearts: 5,
  lastActiveDate: new Date().toISOString().split('T')[0],
  streakFreezeActive: true,
  completedLessons: ['unit-1-lesson-1'], // Array of lesson IDs
  completedUnits: [],
  masteredLessons: [],
  mistakeVault: [
    {
      id: 'mistake-1',
      question: "Terjemahkan: 'I want a cup of coffee'",
      userAnswer: "Saya suka secangkir kopi",
      correctAnswer: "Saya ingin secangkir kopi",
      explanation: "'Want' berarti 'ingin', sedangkan 'suka' adalah 'like'."
    }
  ],
  tokens: 150, // Honor Tokens for Professional Game Title ladder
  inventory: {
    streakFreeze: 1,
    doubleXp: 0,
    heartRefill: 2,
    mascotOutfit: 'classic' // 'classic', 'hero', 'wizard'
  },
  unlockedBadges: ['first_step', 'streak_3'],
  activeLeague: 'Bronze',
  leaguePosition: 4
};

export const storageService = {
  getUserState: () => {
    try {
      const data = localStorage.getItem('lingomaster_user_state');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.tokens === undefined) {
          parsed.tokens = 150;
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Error reading local storage", e);
    }
    return INITIAL_USER_STATE;
  },

  saveUserState: (state) => {
    try {
      localStorage.setItem('lingomaster_user_state', JSON.stringify(state));
    } catch (e) {
      console.warn("Error saving local storage", e);
    }
  },

  resetProgress: () => {
    localStorage.removeItem('lingomaster_user_state');
    return INITIAL_USER_STATE;
  }
};
