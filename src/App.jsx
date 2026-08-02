import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HeaderNav from './components/HeaderNav';
import LearningPath from './components/LearningPath';
import PronunciationStudio from './components/PronunciationStudio';
import AIRoleplayView from './components/AIRoleplayView';
import MatchMadnessView from './components/MatchMadnessView';
import LeaderboardView from './components/LeaderboardView';
import ShopView from './components/ShopView';
import ProfileView from './components/ProfileView';
import LessonModal from './components/LessonModal';
import { storageService } from './services/storageService';
import { soundService } from './services/soundService';

export default function App() {
  const [activeTab, setActiveTab] = useState('learn');
  const [userState, setUserState] = useState(() => storageService.getUserState());
  const [theme, setTheme] = useState('dark');
  const [soundMuted, setSoundMuted] = useState(false);
  const [activeLesson, setActiveLesson] = useState(null);

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
    setActiveLesson(null);
  };

  const handleDeductHeart = () => {
    setUserState((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1)
    }));
  };

  // XP / Gem modifiers
  const handleAddXp = (amount) => {
    setUserState((prev) => ({ ...prev, xp: prev.xp + amount }));
  };

  const handleAddGems = (amount) => {
    setUserState((prev) => ({ ...prev, gems: prev.gems + amount }));
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

        {activeTab === 'learn' && (
          <LearningPath
            userState={userState}
            onStartLesson={handleStartLesson}
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
          />
        )}

        {activeTab === 'madness' && (
          <MatchMadnessView
            userState={userState}
            onAddXp={handleAddXp}
            onAddGems={handleAddGems}
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
