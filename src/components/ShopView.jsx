import React from 'react';
import { Gem, Heart, Flame, Shield, Sparkles, Check } from 'lucide-react';
import { soundService } from '../services/soundService';

export default function ShopView({ userState, onBuyItem }) {
  const shopItems = [
    {
      id: 'streak_freeze',
      name: 'Streak Freeze',
      description: 'Melindungi Streak Anda jika melewatkan belajar 1 hari.',
      cost: 200,
      icon: '🛡️',
      owned: userState.inventory.streakFreeze
    },
    {
      id: 'refill_hearts',
      name: 'Refill Nyawa Penuh',
      description: 'Kembalikan nyawa Anda menjadi 5/5 secara instan.',
      cost: 150,
      icon: '❤️',
      owned: userState.hearts === userState.maxHearts ? 'Max' : 0
    },
    {
      id: 'double_xp',
      name: 'Double XP Potion',
      description: 'Dapatkan 2x lipat XP dari setiap pelajaran selama 15 menit.',
      cost: 300,
      icon: '🧪',
      owned: userState.inventory.doubleXp
    }
  ];

  const handlePurchase = (item) => {
    if (userState.gems < item.cost) {
      soundService.playWrong();
      alert("Permata (Gems) Anda tidak cukup!");
      return;
    }
    soundService.playGem();
    onBuyItem(item);
  };

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h2>Toko Permata LingoMaster</h2>
        <div className="shop-gems-balance">
          <Gem size={24} color="#1cb0f6" fill="#1cb0f6" />
          <span>{userState.gems} Permata</span>
        </div>
      </div>

      <div className="shop-items-grid">
        {shopItems.map((item) => (
          <div key={item.id} className="shop-card glass-card">
            <span className="item-icon">{item.icon}</span>
            <div className="item-details">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
            </div>
            <button
              onClick={() => handlePurchase(item)}
              className="btn-3d btn-blue buy-btn"
            >
              <Gem size={18} fill="#fff" />
              <span>{item.cost}</span>
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .shop-container {
          width: 100%;
          max-width: 650px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .shop-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .shop-header h2 {
          font-size: 1.6rem;
          font-weight: 900;
        }

        .shop-gems-balance {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(28, 176, 246, 0.15);
          border: 2px solid var(--blue-primary);
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 900;
          color: var(--blue-primary);
        }

        .shop-items-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .shop-card {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .item-icon {
          font-size: 2.5rem;
        }

        .item-details {
          flex: 1;
        }

        .item-details h3 {
          font-size: 1.1rem;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .item-details p {
          font-size: 0.85rem;
          color: var(--text-sub);
        }

        .buy-btn {
          max-width: 120px;
        }
      `}</style>
    </div>
  );
}
