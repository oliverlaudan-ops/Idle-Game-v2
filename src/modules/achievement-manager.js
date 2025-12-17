/**
 * achievement-manager.js
 * Zentrales Achievement-Management
 */

import achievementsList from './achievements-list.js';
import gameState from './game-state.js';

class AchievementManager {
  constructor() {
    this.achievements = [];
    this.categories = {
      sammler: { name: 'Sammler', icon: '📦', color: '#4CAF50' },
      klicker: { name: 'Klicker', icon: '👆', color: '#2196F3' },
      upgrade: { name: 'Upgrades', icon: '⬆️', color: '#FF9800' },
      prestige: { name: 'Prestige', icon: '🌟', color: '#9C27B0' },
      forschung: { name: 'Forschung', icon: '🔬', color: '#00BCD4' },
      spezial: { name: 'Spezial', icon: '✨', color: '#E91E63' }
    };
    
    this.onAchievementUnlock = null;
  }

  loadAchievements() {
    this.achievements = achievementsList.map(ach => {
      const achievement = Object.assign(
        Object.create(Object.getPrototypeOf(ach)), 
        ach
      );
      return achievement;
    });
  }

  checkAll(game) {
    const newUnlocks = [];
    
    for (let ach of this.achievements) {
      if (!ach.unlocked) {
        const unlocked = ach.check(game);
        if (unlocked) {
          newUnlocks.push(ach);
          console.log(`🏆 Achievement freigeschaltet: ${ach.name}`);
          
          if (this.onAchievementUnlock) {
            this.onAchievementUnlock(ach);
          }
        }
      }
    }
    
    return newUnlocks;
  }

  getAchievement(id) {
    return this.achievements.find(a => a.id === id);
  }

  getByCategory(category) {
    return this.achievements.filter(a => a.category === category);
  }

  getUnlocked() {
    return this.achievements.filter(a => a.unlocked);
  }

  getLocked() {
    return this.achievements.filter(a => !a.unlocked && !a.hidden);
  }

  getHidden() {
    return this.achievements.filter(a => !a.unlocked && a.hidden);
  }

  getStats() {
    const total = this.achievements.length;
    const unlocked = this.getUnlocked().length;
    const percent = total > 0 ? (unlocked / total) * 100 : 0;
    
    const byCategory = {};
    for (let cat in this.categories) {
      const catAchievements = this.getByCategory(cat);
      const catUnlocked = catAchievements.filter(a => a.unlocked).length;
      byCategory[cat] = {
        total: catAchievements.length,
        unlocked: catUnlocked,
        percent: catAchievements.length > 0 ? (catUnlocked / catAchievements.length) * 100 : 0
      };
    }
    
    return {
      total,
      unlocked,
      locked: total - unlocked,
      percent,
      byCategory
    };
  }

  syncToState() {
    gameState.achievements = this.achievements.map(a => a.toJSON());
  }

  syncFromState() {
    if (!Array.isArray(gameState.achievements)) {
      gameState.achievements = [];
    }
    
    for (let ach of this.achievements) {
      const saved = gameState.achievements.find(s => s.id === ach.id);
      if (saved) {
        ach.loadFromSave(saved);
      }
    }
  }
}

const achievementManager = new AchievementManager();

export default achievementManager;
export { AchievementManager };
