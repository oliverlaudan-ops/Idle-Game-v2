/**
 * ui-render.js
 * Alle Rendering- und Formatierungsfunktionen für Space Colonies
 */

import gameState from '../src/modules/game-state.js';
import { calculateUpgradeCost } from '../src/modules/upgrades-def.js';
import achievementManager from '../src/modules/achievement-manager.js';
import { showAchievementNotification } from '../src/modules/notification-system.js';

// ========== Formatierungs-Hilfsfunktionen ==========

export function formatAmount(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'G';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(0);
}

export function formatRate(n) {
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs < 0.01) return n.toFixed(4);
  if (abs < 1) return n.toFixed(2);
  if (abs < 1000) return n.toFixed(1);
  return formatAmount(n);
}

function formatPlaytime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// ========== Stats Bar Rendering ==========

export function renderStatsBar(game) {
  if (!game.statsBarEl) return;
  
  game.statsBarEl.innerHTML = '';
  
  // Nur freigeschaltete Ressourcen anzeigen
  const unlockedResources = Object.values(game.resources)
    .filter(r => r.unlocked)
    .sort((a, b) => {
      // Sortierung: energy zuerst, dann nach category
      if (a.id === 'energy') return -1;
      if (b.id === 'energy') return 1;
      return 0;
    });
  
  unlockedResources.forEach(resource => {
    const pill = document.createElement('div');
    pill.className = 'stat-pill';
    pill.id = 'stat-' + resource.id;
    
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `${resource.icon} ${resource.name}: ${formatAmount(resource.amount)}`;
    
    const details = document.createElement('span');
    details.className = 'details';
    
    // Click-Ressource bekommt Click-Wert angezeigt
    if (resource.clickValue > 0) {
      // Berechne den tatsächlichen Click-Wert inklusive Prestige-Boni
      let totalClickValue = resource.clickValue;
      if (game.prestigeBonuses) {
        totalClickValue += game.prestigeBonuses.clickPower;
        totalClickValue *= (1 + game.prestigeBonuses.clickMultiplier);
      }
      details.textContent = `+${formatRate(resource.perSecond)}/s, +${formatRate(totalClickValue)}/klick`;
    } else {
      details.textContent = `+${formatRate(resource.perSecond)}/s`;
    }
    
    pill.appendChild(label);
    pill.appendChild(details);
    game.statsBarEl.appendChild(pill);
  });
  
  // Platz-Anzeige
  const spacePill = document.createElement('div');
  spacePill.className = 'stat-pill stat-space';
  spacePill.innerHTML = `
    <span class="label">🏭️ Bauplätze: ${game.usedSpace} / ${game.maxSpace}</span>
  `;
  game.statsBarEl.appendChild(spacePill);
  
  updateActionsStickyTop();
}

// ========== Actions Rendering ==========

export function renderActions(game) {
  if (!game.actionsEl) return;
  
  game.actionsEl.innerHTML = '';
  
  // Nur Energie ist klickbar
  const energyResource = game.resources.energy;
  if (energyResource && energyResource.unlocked) {
    const btn = document.createElement('button');
    btn.className = 'action-btn energy';
    btn.id = 'energyBtn';
    
    // Berechne den tatsächlichen Click-Wert (wie in handleClick)
    let clickValue = energyResource.clickValue;
    if (game.prestigeBonuses) {
      clickValue += game.prestigeBonuses.clickPower;
      clickValue *= (1 + game.prestigeBonuses.clickMultiplier);
    }
    
    btn.textContent = `⚡ Energie sammeln (+${formatRate(clickValue)})`;
    
    btn.onclick = () => {
      game.handleClick('energy');
      renderStatsBar(game);
    };
    
    game.actionsEl.appendChild(btn);
  }
  
  updateActionsStickyTop();
}

// ========== Upgrades Rendering ==========

export function renderUpgrades(game) {
  if (!game.upgradeGridEl) return;
  
  game.upgradeGridEl.innerHTML = '';
  
  // Gruppiere Gebäude nach Typ
  const generators = [];
  const efficiency = [];
  const space = [];
  const click = [];
  const unlock = [];
  
  for (const def of game.upgradeDefinitions) {
    if (!def.unlocked) continue;
    
    switch (def.type) {
      case 'generator':
        generators.push(def);
        break;
      case 'efficiency':
        efficiency.push(def);
        break;
      case 'space':
        space.push(def);
        break;
      case 'click':
        click.push(def);
        break;
      case 'unlock':
        unlock.push(def);
        break;
    }
  }
  
  // Spalte für Generatoren
  if (generators.length > 0) {
    const col = document.createElement('div');
    col.className = 'upgrade-col';
    
    const header = document.createElement('h4');
    header.textContent = '🏭 Gebäude';
    col.appendChild(header);
    
    generators.forEach(def => {
      col.appendChild(createUpgradeCard(game, def));
    });
    
    game.upgradeGridEl.appendChild(col);
  }
  
  // Spalte für Upgrades (Effizienz, Click, Platz)
  const upgradesList = [...efficiency, ...click, ...space];
  if (upgradesList.length > 0) {
    const col = document.createElement('div');
    col.className = 'upgrade-col';
    
    const header = document.createElement('h4');
    header.textContent = '⬆️ Verbesserungen';
    col.appendChild(header);
    
    upgradesList.forEach(def => {
      col.appendChild(createUpgradeCard(game, def));
    });
    
    game.upgradeGridEl.appendChild(col);
  }
}

// ========== Research Rendering ==========

export function renderResearch(game) {
  if (!game.researchGridEl) return;
  
  game.researchGridEl.innerHTML = '';
  
  // Gruppiere nach Tier
  const tiers = { 1: [], 2: [], 3: [] };
  
  for (const def of game.researchDefinitions) {
    if (!def.unlocked) continue;
    if (game.isResearchCompleted(def.id)) continue; // Bereits erforscht
    
    tiers[def.tier].push(def);
  }
  
  // Zeige jedes Tier in eigener Spalte
  for (const [tier, researches] of Object.entries(tiers)) {
    if (researches.length === 0) continue;
    
    const col = document.createElement('div');
    col.className = 'upgrade-col';
    
    const header = document.createElement('h4');
    header.textContent = `🔬 Tier ${tier} Forschung`;
    col.appendChild(header);
    
    researches.forEach(def => {
      col.appendChild(createResearchCard(game, def));
    });
    
    game.researchGridEl.appendChild(col);
  }
  
  // Zeige abgeschlossene Forschungen
  const completed = game.researchDefinitions.filter(r => game.isResearchCompleted(r.id));
  if (completed.length > 0) {
    const col = document.createElement('div');
    col.className = 'upgrade-col';
    
    const header = document.createElement('h4');
    header.innerHTML = `✅ Erforscht (${completed.length})`;
    col.appendChild(header);
    
    completed.forEach(def => {
      const card = document.createElement('div');
      card.className = 'card completed';
      card.innerHTML = `
        <h3>${def.icon} ${def.name}</h3>
        <p class="muted">${def.description}</p>
      `;
      col.appendChild(card);
    });
    
    game.researchGridEl.appendChild(col);
  }
}

// ========== Upgrade Card Creation ==========

function createUpgradeCard(game, def) {
  const card = document.createElement('div');
  card.className = 'card';
  
  const currentCount = game.getUpgradeCount(def.id);
  
  // Titel
  const title = document.createElement('h3');
  title.textContent = `${def.icon} ${def.name}`;
  
  // Beschreibung
  const desc = document.createElement('p');
  desc.textContent = def.description;
  
  // Kosten
  const cost = calculateUpgradeCost(def, currentCount);
  const costP = document.createElement('p');
  const costParts = [];
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = game.resources[resourceId];
    if (resource) {
      costParts.push(`${formatAmount(amount)} ${resource.icon}`);
    }
  }
  costP.textContent = `Kosten: ${costParts.join(', ')}`;
  
  // Owned/Platz-Info
  const info = document.createElement('p');
  info.className = 'muted';
  
  if (def.type === 'generator') {
    info.textContent = `Stufe: ${currentCount} | Größe: ${def.size}`;
  } else if (def.maxCount !== -1) {
    info.textContent = `Stufe: ${currentCount} / ${def.maxCount}`;
  } else {
    info.textContent = `Stufe: ${currentCount}`;
  }
  
  // Produktion anzeigen (bei Generatoren)
  if (def.produces && currentCount > 0) {
    const prodP = document.createElement('p');
    prodP.className = 'production-info';
    const prodParts = [];
    for (const [resourceId, amount] of Object.entries(def.produces)) {
      const resource = game.resources[resourceId];
      if (resource) {
        const totalProd = amount * currentCount; // Wird später mit Boni multipliziert
        prodParts.push(`+${formatRate(totalProd)} ${resource.icon}/s`);
      }
    }
    prodP.textContent = `Produziert: ${prodParts.join(', ')}`;
    desc.after(prodP);
  }
  
  // Button-Container für Kauf & Abreißen
  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 12px;';
  
  // Kauf-Button
  const buyBtn = document.createElement('button');
  buyBtn.className = 'buy-btn';
  buyBtn.style.flex = '1';
  
  const canBuy = game.canBuyUpgrade(def.id);
  buyBtn.disabled = !canBuy;
  
  if (def.maxCount !== -1 && currentCount >= def.maxCount) {
    buyBtn.textContent = 'Maximum erreicht';
    buyBtn.disabled = true;
  } else if (def.size > 0 && game.usedSpace + def.size > game.maxSpace) {
    buyBtn.textContent = 'Kein Platz';
    buyBtn.disabled = true;
  } else {
    buyBtn.textContent = canBuy ? 'Kaufen' : 'Nicht genug';
  }
  
  buyBtn.onclick = () => {
    if (game.buyUpgrade(def.id)) {
      renderAll(game);
    }
  };
  
  btnContainer.appendChild(buyBtn);
  
  // Abreißen-Button (nur bei Gebäuden mit size > 0 und count > 0)
  if (def.size > 0 && currentCount > 0) {
    const demolishBtn = document.createElement('button');
    demolishBtn.className = 'demolish-btn';
    demolishBtn.textContent = '💥';
    demolishBtn.title = 'Abreißen (50% Rückerstattung)';
    demolishBtn.style.cssText = 'width: 40px; padding: 8px; background: #d32f2f; border: none; border-radius: 4px; color: white; cursor: pointer; font-size: 16px;';
    
    demolishBtn.onclick = () => {
      // Berechne Refund für Anzeige
      const lastCost = calculateUpgradeCost(def, currentCount - 1);
      const refundParts = [];
      for (const [resId, amount] of Object.entries(lastCost)) {
        const resource = game.resources[resId];
        if (resource) {
          refundParts.push(`${formatAmount(Math.floor(amount * 0.5))} ${resource.icon}`);
        }
      }
      
      if (confirm(`${def.icon} ${def.name} abreißen?\n\nRückerstattung (50%): ${refundParts.join(', ')}`)) {
        if (game.demolishUpgrade(def.id)) {
          renderAll(game);
        }
      }
    };
    
    btnContainer.appendChild(demolishBtn);
  }
  
  // Fortschrittsbalken
  const hasProgress = Object.entries(cost).some(([resId, amount]) => {
    const resource = game.resources[resId];
    return resource && resource.amount < amount;
  });
  
  if (hasProgress) {
    const mainCost = Object.entries(cost)[0];
    if (mainCost) {
      const [resId, amount] = mainCost;
      const resource = game.resources[resId];
      if (resource) {
        const percent = Math.min(100, (resource.amount / amount) * 100);
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        const progress = document.createElement('div');
        progress.className = 'progress';
        progress.style.width = percent + '%';
        progressBar.appendChild(progress);
        card.appendChild(progressBar);
      }
    }
  }
  
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(costP);
  card.appendChild(info);
  card.appendChild(btnContainer);
  
  return card;
}

// ========== Research Card Creation ==========

function createResearchCard(game, def) {
  const card = document.createElement('div');
  card.className = 'card research-card';
  
  // Titel
  const title = document.createElement('h3');
  title.textContent = `${def.icon} ${def.name}`;
  
  // Beschreibung
  const desc = document.createElement('p');
  desc.textContent = def.description;
  
  // Kosten
  const costP = document.createElement('p');
  const costParts = [];
  for (const [resourceId, amount] of Object.entries(def.cost)) {
    const resource = game.resources[resourceId];
    if (resource) {
      costParts.push(`${formatAmount(amount)} ${resource.icon}`);
    }
  }
  costP.textContent = `Kosten: ${costParts.join(', ')}`;
  
  // Kauf-Button
  const btn = document.createElement('button');
  btn.className = 'buy-btn';
  
  const canResearch = game.canResearch(def.id);
  btn.disabled = !canResearch;
  btn.textContent = canResearch ? 'Erforschen' : 'Nicht genug';
  
  btn.onclick = () => {
    if (game.performResearch(def.id)) {
      renderAll(game);
    }
  };
  
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(costP);
  card.appendChild(btn);
  
  return card;
}

// ========== Prestige Container Rendering ==========

export function renderPrestigeContainer(game) {
  const el = document.getElementById('prestigeContainer');
  if (!el) return;
  
  const info = game.getPrestigeInfo();
  
  el.innerHTML = `
    <h3>🌟 Prestige</h3>
    <p style="font-size: 12px; color: #9aa4b6; margin-top: 10px;">
      Prestige setzt deine Ressourcen und Upgrades zurück, aber du behältst Prestige-Punkte 
      und Prestige-Upgrades. Diese geben dir permanente Boni.
    </p>
    <div class="prestige-info">
      <p>Aktuelle Prestige-Punkte: <strong>${info.currentPoints}</strong></p>
      <p>Bei Prestige erhältst du: <strong>+${info.gained}</strong> Punkt${info.gained !== 1 ? 'e' : ''}</p>
      <p class="muted">Basiert auf insgesamt gesammelter Energie: √(Energie/100.000)</p>
    </div>
    <button id="prestigeBtn" class="prestige-btn" ${game.canPrestige() ? '' : 'disabled'}>
      ${game.canPrestige() 
        ? `🚀 Prestige durchführen (+${info.gained} Punkt${info.gained !== 1 ? 'e' : ''})`
        : '⛔ Noch nicht genug Fortschritt (mindestens 1 Punkt nötig)'}
    </button>
  `;
  
  const prestigeBtn = document.getElementById('prestigeBtn');
  if (prestigeBtn) {
    prestigeBtn.onclick = () => {
      if (!confirm(`Bist du sicher? Du erhältst +${info.gained} Prestige-Punkt${info.gained !== 1 ? 'e' : ''} und fängst von vorne an.`)) {
        return;
      }
      
      if (game.performPrestige()) {
        renderAll(game);
        alert(`✨ Prestige erfolgreich! Du hast ${info.gained} Prestige-Punkt${info.gained !== 1 ? 'e' : ''} erhalten!`);
      }
    };
  }
  
  renderPrestigeUpgrades(game);
}

// ========== Prestige Upgrades Rendering ==========

export function renderPrestigeUpgrades(game) {
  const grid = document.getElementById('prestigeUpgrades');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  // Gruppiere nach Kategorie
  const categories = {
    production: [],
    utility: [],
    efficiency: [],
    unlock: [],
    prestige: []
  };
  
  game.prestigeUpgrades.forEach(upg => {
    if (categories[upg.category]) {
      categories[upg.category].push(upg);
    }
  });
  
  const categoryNames = {
    production: '🏭 Produktion',
    utility: '🛠️ Utilität',
    efficiency: '⚡ Effizienz',
    unlock: '🔓 Freischaltungen',
    prestige: '🌟 Prestige'
  };
  
  for (const [cat, upgrades] of Object.entries(categories)) {
    if (upgrades.length === 0) continue;
    
    const col = document.createElement('div');
    col.className = 'upgrade-col';
    
    const header = document.createElement('h4');
    header.textContent = categoryNames[cat] || cat;
    col.appendChild(header);
    
    upgrades.forEach(upg => {
      const card = createPrestigeUpgradeCard(game, upg);
      col.appendChild(card);
    });
    
    grid.appendChild(col);
  }
}

function createPrestigeUpgradeCard(game, upg) {
  const card = document.createElement('div');
  card.className = 'card prestige-card';
  
  const title = document.createElement('h3');
  title.textContent = `${upg.icon} ${upg.name}`;
  
  const desc = document.createElement('p');
  desc.textContent = upg.getFormattedDescription();
  
  const costP = document.createElement('p');
  const cost = upg.getCost();
  costP.textContent = `Kosten: ${formatAmount(cost)} 🌟`;
  
  const levelP = document.createElement('p');
  levelP.className = 'muted';
  levelP.textContent = upg.maxLevel !== -1 
    ? `Stufe: ${upg.level} / ${upg.maxLevel}` 
    : `Stufe: ${upg.level}`;
  
  const btn = document.createElement('button');
  btn.className = 'buy-btn';
  
  const prestigePoints = game.resources.prestige?.amount || 0;
  const canBuy = upg.canBuy(prestigePoints);
  
  btn.disabled = !canBuy;
  
  if (upg.maxLevel !== -1 && upg.level >= upg.maxLevel) {
    btn.textContent = 'Maximum erreicht';
    btn.disabled = true;
  } else {
    btn.textContent = canBuy ? 'Kaufen' : 'Nicht genug Punkte';
  }
  
  btn.onclick = () => {
    if (upg.buy(gameState)) {
      // Prestige-Boni neu berechnen
      game.prestigeBonuses = require('../src/modules/prestige-upgrades.js').calculatePrestigeBonuses(game.prestigeUpgrades);
      game.recalculateProduction();
      game.syncToState();
      gameState.save();
      renderAll(game);
    }
  };
  
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(costP);
  card.appendChild(levelP);
  card.appendChild(btn);
  
  return card;
}

// ========== Achievement Rendering ==========

export function renderAchievements(game) {
  const container = document.getElementById('achievementsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  // Header mit Stats
  const stats = achievementManager.getStats();
  const header = document.createElement('div');
  header.className = 'achievement-header';
  header.innerHTML = `
    <h2>🏆 Achievements</h2>
    <div class="achievement-stats">
      <span class="stat-highlight">${stats.unlocked} / ${stats.total}</span>
      <span class="stat-label">freigeschaltet (${stats.percent.toFixed(1)}%)</span>
    </div>
    <div class="achievement-progress-bar">
      <div class="achievement-progress" style="width: ${stats.percent}%"></div>
    </div>
  `;
  container.appendChild(header);
  
  // Nach Kategorien gruppieren
  for (let catKey in achievementManager.categories) {
    const category = achievementManager.categories[catKey];
    const achievements = achievementManager.getByCategory(catKey);
    
    if (achievements.length === 0) continue;
    
    const catStats = stats.byCategory[catKey];
    
    const section = document.createElement('div');
    section.className = 'achievement-category';
    
    const catHeader = document.createElement('div');
    catHeader.className = 'achievement-category-header';
    catHeader.style.borderLeftColor = category.color;
    catHeader.innerHTML = `
      <h3>${category.icon} ${category.name}</h3>
      <span class="category-progress">${catStats.unlocked} / ${catStats.total}</span>
    `;
    section.appendChild(catHeader);
    
    const grid = document.createElement('div');
    grid.className = 'achievement-grid';
    
    achievements.forEach(ach => {
      const achCard = createAchievementCard(ach);
      grid.appendChild(achCard);
    });
    
    section.appendChild(grid);
    container.appendChild(section);
  }
}

function createAchievementCard(achievement) {
  const card = document.createElement('div');
  card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
  
  const icon = document.createElement('div');
  icon.className = 'achievement-icon';
  icon.textContent = achievement.icon;
  
  const content = document.createElement('div');
  content.className = 'achievement-content';
  
  const name = document.createElement('h4');
  name.textContent = achievement.name;
  
  const desc = document.createElement('p');
  desc.className = 'achievement-desc';
  desc.textContent = achievement.desc;
  
  content.appendChild(name);
  content.appendChild(desc);
  
  if (achievement.unlocked && achievement.unlockedAt) {
    const date = new Date(achievement.unlockedAt);
    const timeAgo = document.createElement('p');
    timeAgo.className = 'achievement-time';
    timeAgo.textContent = `Freigeschaltet: ${date.toLocaleDateString('de-DE')}`;
    content.appendChild(timeAgo);
  }
  
  card.appendChild(icon);
  card.appendChild(content);
  
  return card;
}

// ========== Utility Functions ==========

export function updateActionsStickyTop() {
  const statsBar = document.querySelector('.stats-bar');
  const actions = document.querySelector('.actions');
  
  if (statsBar && actions) {
    const barHeight = statsBar.offsetHeight;
    actions.style.top = (barHeight + 12) + 'px';
  }
}

// ========== Render All ==========

export function renderAll(game) {
  renderStatsBar(game);
  renderActions(game);
  renderUpgrades(game);
  renderResearch(game);
  renderPrestigeContainer(game);
  
  // Achievements nur rendern wenn Tab aktiv
  const achievementContainer = document.getElementById('achievementsContainer');
  if (achievementContainer && achievementContainer.style.display !== 'none') {
    renderAchievements(game);
  }
}
