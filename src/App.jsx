import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeaderNav from './components/HeaderNav';
import LearningPath from './components/LearningPath';
import LocalTranslatorView from './components/LocalTranslatorView';
import PronunciationStudio from './components/PronunciationStudio';
import AIRoleplayView from './components/AIRoleplayView';
import MatchMadnessView from './components/MatchMadnessView';
import LeaderboardView from './components/LeaderboardView';
import ShopView from './components/ShopView';
import ProfileView from './components/ProfileView';
import EnglishEditorChatbotView from './components/EnglishEditorChatbotView';
import LinguisticsTutorView from './components/LinguisticsTutorView';
import LessonModal from './components/LessonModal';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';
import { activityLoggerService } from './services/activityLoggerService';

export default function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [userState, setUserState] = useState(() => storageService.getUserState());
  const [theme, setTheme] = useState('dark');
  const [soundMuted, setSoundMuted] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

  // Start activity session when project runs
  useEffect(() => {
    activityLoggerService.startSession();
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    storageService.saveUserState(userState);
  }, [userState]);

  // Handle Theme Switch
  const toggleTheme = () => {
    soundService.playClick();
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    if (newTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  };

  // Lesson handlers
  const handleStartLesson = (lesson) => {
    if (userState.hearts <= 0) {
      soundService.playWrong();
      alert("Nyawa Anda habis! Silakan isi ulang di Toko Permata atau tunggu beberapa waktu.");
      setActiveTab('shop');
      return;
    }
    setActiveLesson(lesson);
  };

  const handleLessonComplete = (completedLesson) => {
    setUserState((prev) => {
      const newCompleted = prev.completedLessons.includes(completedLesson.id)
        ? prev.completedLessons
        : [...prev.completedLessons, completedLesson.id];

      return {
        ...prev,
        xp: prev.xp + completedLesson.xpReward,
        gems: prev.gems + 20,
        completedLessons: newCompleted
      };
    });

    activityLoggerService.logActivity({
      type: 'lesson',
      title: `Menyelesaikan Pelajaran: ${completedLesson.title || 'Materi Belajar'}`,
      detail: `Memperoleh +${completedLesson.xpReward} XP dan +20 Permata (Gems).`,
      score: 100,
      xpEarned: completedLesson.xpReward,
      metadata: { lessonId: completedLesson.id }
    });

    setActiveLesson(null);
  };

  const handleDeductHeart = () => {
    setUserState((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1)
    }));
  };

  // XP / Gem / Token modifiers
  const handleAddXp = (amount) => {
    setUserState((prev) => ({ ...prev, xp: prev.xp + amount }));
  };

  const handleAddGems = (amount) => {
    setUserState((prev) => ({ ...prev, gems: prev.gems + amount }));
  };

  const handleAddTokens = (amount) => {
    setUserState((prev) => ({ ...prev, tokens: Math.max(0, (prev.tokens || 0) + amount) }));
  };

  const handleBuyItem = (item) => {
    setUserState((prev) => {
      let newInventory = { ...prev.inventory };
      let newHearts = prev.hearts;

      if (item.id === 'streak_freeze') {
        newInventory.streakFreeze = (newInventory.streakFreeze || 0) + 1;
      } else if (item.id === 'refill_hearts') {
        newHearts = prev.maxHearts;
      } else if (item.id === 'double_xp') {
        newInventory.doubleXp = (newInventory.doubleXp || 0) + 1;
      }

      return {
        ...prev,
        gems: prev.gems - item.cost,
        hearts: newHearts,
        inventory: newInventory
      };
    });
  };

  const handleResetProgress = () => {
    const fresh = storageService.resetProgress();
    setUserState(fresh);
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userState={userState}
        soundMuted={soundMuted}
        setSoundMuted={setSoundMuted}
      />

      {/* Main App Content View */}
      <main className="main-content">
        <HeaderNav
          userState={userState}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {activeTab === 'editor' && (
          <EnglishEditorChatbotView
            userState={userState}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'linguistics' && (
          <LinguisticsTutorView
            _userState={userState}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'learn' && (
          <LearningPath
            userState={userState}
            onStartLesson={handleStartLesson}
          />
        )}

        {activeTab === 'translator' && (
          <LocalTranslatorView
            userState={userState}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'pronunciation' && (
          <PronunciationStudio
            userState={userState}
            onAddXp={handleAddXp}
          />
        )}

        {activeTab === 'roleplay' && (
          <AIRoleplayView
            userState={userState}
            onAddXp={handleAddXp}
            onAddTokens={handleAddTokens}
          />
        )}

        {activeTab === 'madness' && (
          <MatchMadnessView
            userState={userState}
            onAddXp={handleAddXp}
            onAddGems={handleAddGems}
            onAddTokens={handleAddTokens}
          />
        )}

        {activeTab === 'leaderboard' && (
          <LeaderboardView
            userState={userState}
          />
        )}

        {activeTab === 'shop' && (
          <ShopView
            userState={userState}
            onBuyItem={handleBuyItem}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            userState={userState}
            onResetProgress={handleResetProgress}
            onAddTokens={handleAddTokens}
          />
        )}
      </main>

      {/* Active Lesson Modal */}
      {activeLesson && (
        <LessonModal
          lesson={activeLesson}
          userState={userState}
          onComplete={handleLessonComplete}
          onClose={() => setActiveLesson(null)}
          onDeductHeart={handleDeductHeart}
        />
      )}
    </div>
  );
}
