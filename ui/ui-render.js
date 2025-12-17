/**
 * ui-render.js
 * Alle Rendering- und Formatierungsfunktionen
 */

import gameState from './game-state.js';
import { getEffectivePrestigeBonus } from './prestige.js';
import achievementManager from './achievement-manager.js'; // ← NEU

// Achievement-Notification Queue
let achievementQueue = [];
let isShowingAchievement = false;


// ========== Formatierungs-Hilfsfunktionen ==========

export function formatAmount(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'G'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(0);
}

export function formatRate(n) {
  const abs = Math.abs(n);
  if (abs === 0) return '0';
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

// Buy-Mode button Hilfsfunktion
function getMaxAffordableLevels(game, upg) {
  const res = game.getResource(upg.costRes);
  if (!res) return 0;

  const currentAmount = res.amount;
  const base = upg.costBase;
  const mult = upg.costMult || 1;

  // Fallback für mult <= 1: defensiv linear hochzählen
  if (mult <= 1) {
    let count = 0;
    let cost = upg.getCurrentCost();
    let remaining = currentAmount;
    while (remaining >= cost && count < 1000) {
      remaining -= cost;
      count++;
    }
    return count;
  }

  const level = upg.level || 0;
  const factor = Math.pow(mult, level);
  const A = base * factor;
  const B = mult;

  const sumCost = (k) => {
    if (k <= 0) return 0;
    return A * (Math.pow(B, k) - 1) / (B - 1);
  };

  let low = 0;
  let high = 1;

  while (sumCost(high) <= currentAmount && high < 1e6) {
    high *= 2;
  }

  while (low < high) {
    const mid = Math.floor((low + high + 1) / 2);
    if (sumCost(mid) <= currentAmount) {
      low = mid;
    } else {
      high = mid - 1;
    }
  }

  return low;
}

// ========== Stats Bar Rendering ==========

export function renderStatsBar(game) {
  if (!game.statsBarEl) return;
  
  game.statsBarEl.innerHTML = '';
  
  const resList = Object.values(game.resources).filter(r => r.unlocked);
  
  resList.forEach(r => {
    const pill = document.createElement('div');
    pill.className = 'stat-pill';
    pill.id = 'stat-' + r.id;
    
    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `${r.icon} ${r.name}: ${formatAmount(r.amount)}`;
    
    const details = document.createElement('span');
    details.className = 'details';
    details.textContent = `+${formatRate(r.rps)}/s, +${formatRate(r.rpc)}/Klick`;
    
    pill.appendChild(label);
    pill.appendChild(details);
    game.statsBarEl.appendChild(pill);
  });
  
  // Meta-Informationen
  const meta = document.createElement('div');
  meta.className = 'stat-meta';
  meta.textContent = `Tick: ${(game.tickMs / 1000).toFixed(1)}s`;
  game.statsBarEl.appendChild(meta);
  
  updateActionsStickyTop();
}

// ========== Actions Rendering ==========

export function renderActions(game) {
  if (!game.actionsEl) return;
  
  game.actionsEl.innerHTML = '';
  
  Object.values(game.resources)
    .filter(r => r.unlocked)
    .forEach(r => {
      const btn = document.createElement('button');
      btn.className = `action-btn ${r.id}`;
      btn.id = r.id + 'Btn';
      btn.textContent = `${r.icon} ${r.name} sammeln (+${formatRate(r.rpc)})`;
      
      btn.onclick = () => {
        const mult = getEffectivePrestigeBonus(gameState);
        r.add(r.rpc * mult);
        
        // Klick-Counter erhöhen
        game.totalClicks++;
        
        renderStatsBar(game);
        renderUpgrades(game);
        
        // Achievements prüfen
        game.checkAchievements();
      };
      
      game.actionsEl.appendChild(btn);
    });
  
  updateActionsStickyTop();
}

// ========== Upgrades Rendering ==========

export function renderUpgrades(game) {
  if (!game.upgradeGridEl || !game.researchGridEl) return;
  
  game.upgradeGridEl.innerHTML = '';
  game.researchGridEl.innerHTML = '';
  
  // Upgrades nach Typ trennen
  const normalUpgrades = game.upgrades.filter(u => !u.research);
  const researchUpgrades = game.upgrades.filter(u => u.research);
  
  // Normale Upgrades gruppieren
  const grouped = {};
  for (const upg of normalUpgrades) {
    if (upg.single && upg.unlocksResourceId) {
      grouped.unlock = grouped.unlock || [];
      grouped.unlock.push(upg);
    } else {
      const key = upg.costRes || 'Sonstige';
      grouped[key] = grouped[key] || [];
      grouped[key].push(upg);
    }
  }
  
  // Freischaltungen zuerst rendern
  if (grouped.unlock && grouped.unlock.length > 0) {
    const col = document.createElement('div');
    col.className = 'upgrade-col upgrade-unlock-col';
    
    const header = document.createElement('h4');
    header.textContent = 'Freischaltungen';
    col.appendChild(header);
    
    grouped.unlock.forEach(upg => col.appendChild(createUpgradeCard(game, upg)));
    game.upgradeGridEl.appendChild(col);
  }
  
  // Restliche normale Upgrades nach Ressource
  for (const [res, arr] of Object.entries(grouped)) {
    if (res === 'unlock') continue;
    
    const col = document.createElement('div');
    col.className = 'upgrade-col';
    
    const header = document.createElement('h4');
    header.textContent = res.charAt(0).toUpperCase() + res.slice(1);
    col.appendChild(header);
    
    arr.forEach(upg => col.appendChild(createUpgradeCard(game, upg)));
    game.upgradeGridEl.appendChild(col);
  }
  
  // Forschungs-Upgrades nach costRes gruppieren
  const researchByRes = {};
  for (const upg of researchUpgrades) {
    const key = upg.costRes || 'sonstige';
    if (!researchByRes[key]) researchByRes[key] = [];
    researchByRes[key].push(upg);
  }
  
  for (const [res, arr] of Object.entries(researchByRes)) {
    const col = document.createElement('div');
    col.className = 'upgrade-col';
    
    const header = document.createElement('h4');
  
    const titleSpan = document.createElement('span');
    titleSpan.textContent = res.charAt(0).toUpperCase() + res.slice(1) + ' Forschung';
  
    const info = document.createElement('span');
    info.className = 'info-icon';
    info.textContent = 'i';
    info.title = 'Forschung verstärkt bestehende Produktion und skaliert mit deiner aktuellen RPS.';
  
    header.appendChild(titleSpan);
    header.appendChild(info);
    
    col.appendChild(header);
    
    arr.forEach(upg => col.appendChild(createUpgradeCard(game, upg)));
    game.researchGridEl.appendChild(col);
  }
}

// ========== Upgrade Card Creation ==========
export function createUpgradeCard(game, upg) {
  const costRes = game.getResource(upg.costRes);
  const card = document.createElement('div');
  card.className = 'card';

  // Titel
  const title = document.createElement('h3');
  title.textContent = upg.name;

  // Beschreibung
  const desc = document.createElement('p');
  desc.textContent = upg.desc;

  // Kosten-Element
  const costP = document.createElement('p');

  // Buy-Mode nur für nicht-single Upgrades initialisieren
  if (!upg.single && !upg.buyMode) {
    upg.buyMode = 'x1';
  }

  function updateCostText() {
    if (!costRes) {
      costP.textContent = '';
      return;
    }

    // Single-Upgrades: immer Einzelkosten
    if (upg.single) {
      const cost1 = upg.getCurrentCost();
      costP.textContent = `Kosten: ${formatAmount(cost1)} ${costRes.name}`;
      return;
    }

    const mode = upg.buyMode || 'x1';

    if (mode === 'x1') {
      const cost1 = upg.getCurrentCost();
      costP.textContent = `Kosten: ${formatAmount(cost1)} ${costRes.name}`;
      return;
    }

    // Levels je nach Modus
    let levels = 1;
    if (mode === 'x10') {
      levels = 10;
    } else if (mode === 'max') {
      levels = getMaxAffordableLevels(game, upg);
      if (levels <= 0) levels = 0;
    }

    if (levels <= 0) {
      const cost1 = upg.getCurrentCost();
      costP.textContent = `Kosten: ${formatAmount(cost1)} ${costRes.name}`;
      return;
    }

    const base = upg.costBase;
    const mult = upg.costMult || 1;
    const level = upg.level || 0;

    let totalCost;
    if (mult <= 1) {
      totalCost = base * levels;
    } else {
      const factor = Math.pow(mult, level);
      const A = base * factor;
      totalCost = A * (Math.pow(mult, levels) - 1) / (mult - 1);
    }

    costP.textContent =
      `Kosten (${mode.toUpperCase()}): ${formatAmount(totalCost)} ${costRes.name}`;
  }

  // Initiale Kostenanzeige
  updateCostText();

  // Besitzstatus
  const owned = document.createElement('p');
  owned.className = 'muted';
  owned.textContent = upg.single
    ? (upg.level > 0 ? 'Einmalig – bereits gekauft' : 'Einmalig')
    : `Stufe: ${upg.level}`;

  // Buy-Mode-Leiste nur für nicht-single Upgrades
  let modeBar = null;
  if (!upg.single) {
    modeBar = document.createElement('div');
    modeBar.className = 'buy-mode-bar';

    const modes = [
      { key: 'x1',  label: 'x1' },
      { key: 'x10', label: 'x10' },
      { key: 'max', label: 'Max' }
    ];

    modes.forEach(m => {
      const mBtn = document.createElement('button');
      mBtn.type = 'button';
      mBtn.className = 'buy-mode-btn' + (upg.buyMode === m.key ? ' active' : '');
      mBtn.textContent = m.label;
      mBtn.onclick = (e) => {
        e.stopPropagation();
        upg.buyMode = m.key;
        if (modeBar) {
          modeBar.querySelectorAll('.buy-mode-btn').forEach(b => b.classList.remove('active'));
        }
        mBtn.classList.add('active');
        updateCostText();
      };
      modeBar.appendChild(mBtn);
    });
  }

  // Kauf-Button
  const btn = document.createElement('button');
  btn.className = 'buy-btn';

  const canBuy = upg.canBuy(game);
  btn.disabled = !canBuy;
  btn.textContent = upg.single && upg.level > 0
    ? 'Gekauft'
    : (canBuy ? 'Kaufen' : 'Nicht genug');

  btn.onclick = () => {
    if (upg.single && upg.level > 0) return;

    let timesToBuy = 1;
    if (!upg.single) {
      if (upg.buyMode === 'x10') {
        timesToBuy = 10;
      } else if (upg.buyMode === 'max') {
        timesToBuy = getMaxAffordableLevels(game, upg);
      }
    }

    if (timesToBuy <= 0) return;

    let bought = 0;
    for (let i = 0; i < timesToBuy; i++) {
      if (!upg.canBuy(game)) break;
      if (!upg.buy(game)) break;
      bought++;
      if (upg.single) break;
    }

    if (bought > 0) {
      game.recalculateResourceBonuses();
      renderAll(game);
      game.checkAchievements();
    }
  };

  // Card zusammenbauen
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(costP);
  card.appendChild(owned);
  if (modeBar) card.appendChild(modeBar); // nur bei mehrfachen Upgrades
  card.appendChild(btn);

  // Progress-Bar (wie bisher)
  if (costRes) {
    const current = costRes.amount;
    const nextCost = upg.getCurrentCost();
    const percent = Math.min(100, (current / nextCost) * 100);
    const progressBar = document.createElement('div');
    progressBar.className = 'progress-bar';
    const progress = document.createElement('div');
    progress.className = 'progress';
    progress.style.width = percent + '%';
    progressBar.appendChild(progress);
    card.appendChild(progressBar);
  }

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
    Prestige setzt deine Ressourcen und Upgrades zurück, aber du behältst Prestige-Punkte und Prestige-Upgrades. Dein Prestige-Bonus multipliziert alle Produktionsraten.
    </p>
    <p>Aktuelle Prestige-Punkte: <strong>${info.currentPoints}</strong></p>
    <p>Effektiver Bonus: <strong>×${info.effectiveBonus.toFixed(2)}</strong></p>
    <p>Bei Prestige erhältst du: <strong>+${info.gained}</strong> Punkte</p>
    <button id="prestigeBtn" class="prestige-btn" ${game.canPrestige() ? '' : 'disabled'}>
      ${game.canPrestige() 
        ? `Prestige ausführen (+${info.gained} Punkt${info.gained !== 1 ? 'e' : ''})`
        : 'Noch nicht genug Ressourcen (benötigt 1 Punkt)'}
    </button>
    <p style="font-size: 12px; color: #9aa4b6; margin-top: 10px;">
      Tipp: 1 Mio Stein, 500k Holz, 250k Ton, 100k Metall oder 20k Kristall = 1 Punkt
    </p>
  `;
  
  const prestigeBtn = document.getElementById('prestigeBtn');
  if (prestigeBtn) {
    prestigeBtn.onclick = () => {
      if (game.performPrestige()) {
        renderAll(game);
        alert(`Prestige erfolgreich! Du hast ${info.gained} Punkte erhalten.`);
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
  
  game.prestigeUpgrades.forEach(upg => {
    const card = document.createElement('div');
    card.className = 'card';
    
    const title = document.createElement('h3');
    title.textContent = upg.name;
    
    const desc = document.createElement('p');
    desc.textContent = upg.desc;
    
    const costP = document.createElement('p');
    const cost = upg.getCurrentCost();
    costP.textContent = `Kosten: ${cost} Prestige-Punkte`;
    
    const owned = document.createElement('p');
    owned.className = 'muted';
    owned.textContent = `Stufe: ${upg.level}`;
    
    const btn = document.createElement('button');
    btn.className = 'buy-btn';
    const canBuy = upg.canBuy(gameState);
    btn.disabled = !canBuy;
    btn.textContent = canBuy ? 'Kaufen' : 'Nicht genug Punkte';
    
    btn.onclick = () => {
      if (upg.buy(game, gameState)) {
        game.syncToState();
        gameState.save();
        renderPrestigeContainer(game);
        renderStatsBar(game);
      }
    };
    
    card.appendChild(title);
    card.appendChild(desc);
    card.appendChild(costP);
    card.appendChild(owned);
    card.appendChild(btn);
    
    grid.appendChild(card);
  });
}

// ========== Achievement Rendering ========== NEU!

export function renderAchievements(game) {
  const container = document.getElementById('achievementsContainer');
  if (!container) {
    console.error('❌ achievementsContainer nicht gefunden!');
    return;
  }
  
  console.log('🏆 Rendering Achievements...');
  
  container.innerHTML = '';
  
  // Statistik-Header
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
  
  // NEU: Profil-/Session-Statistiken
  const profileBox = document.createElement('div');
  profileBox.className = 'achievement-profile-stats';

  const now = Date.now();
  // const playSeconds = Math.floor((now - game.startTime) / 1000);
  const prestigeCount = game.prestigeCount || 0;
  const totalPrestige = game.totalPrestigePoints || 0;
  const totalClicks = game.totalClicks || 0;
    
  // startTime stammt aus gameState und kann sehr alt sein.
  // Besser: begrenzen und nur aktuelle Session grob anzeigen:
  let playSeconds = 0;
  if (game.startTime) {
    const diffMs = now - game.startTime;
    // Negative oder zu große Werte abfangen
    if (diffMs > 0 && diffMs < 1000 * 60 * 60 * 24 * 365) {
      playSeconds = Math.floor(diffMs / 1000);
    }
  }
  
  profileBox.innerHTML = `
    <div class="profile-row">
      <div><strong>Spielzeit (aktuelle Session)</strong><span>${formatPlaytime(playSeconds)}</span></div>
      <div><strong>Gesamt-Klicks</strong><span>${formatAmount(totalClicks)}</span></div>
      <div><strong>Prestiges</strong><span>${prestigeCount}</span></div>
      <div><strong>Prestige-Punkte gesamt</strong><span>${totalPrestige}</span></div>
    </div>
  `;
  container.appendChild(profileBox);
  
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
      const card = createAchievementCard(ach);
      grid.appendChild(card);
    });
    
    section.appendChild(grid);
    container.appendChild(section);
  }
  
  // Versteckte Achievements-Sektion
  const hidden = achievementManager.getHidden();
  if (hidden.length > 0) {
    const section = document.createElement('div');
    section.className = 'achievement-category';
    section.innerHTML = `
      <div class="achievement-category-header">
        <h3>❓ Versteckte Achievements</h3>
        <span class="category-progress">${hidden.length} verborgen</span>
      </div>
      <p class="muted" style="padding: 10px;">
        ${hidden.length} versteckte Achievement${hidden.length > 1 ? 's' : ''} warten darauf, entdeckt zu werden...
      </p>
    `;
    container.appendChild(section);
  }
  
  console.log(`✅ ${stats.total} Achievements gerendert`);
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
  
  // Fortschrittsbalken (falls vorhanden)
  if (!achievement.unlocked && achievement.progressFn && achievement.maxProgress > 0) {
    const progressPercent = achievement.getProgressPercent();
    const progressBar = document.createElement('div');
    progressBar.className = 'achievement-progress-bar small';
    progressBar.innerHTML = `
      <div class="achievement-progress" style="width: ${progressPercent}%"></div>
      <span class="progress-text">${formatAmount(achievement.progress)} / ${formatAmount(achievement.maxProgress)}</span>
    `;
    content.appendChild(progressBar);
  }
  
  // Unlock-Zeitstempel
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

// Achievement-Notification anzeigen
export function showAchievementNotification(achievement) {
    achievementQueue.push(achievement);
    if (!isShowingAchievement) {
        processNextAchievementNotification();
    }
}

function processNextAchievementNotification() {
    if (achievementQueue.length === 0) {
        isShowingAchievement = false;
        return;
    }

    isShowingAchievement = true;
    const achievement = achievementQueue.shift();

    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    notification.setAttribute('role', 'status');
    notification.setAttribute('aria-live', 'polite');

    notification.innerHTML = `
        <div class="achievement-notification-content">
            <div class="achievement-notification-icon">${achievement.icon}</div>
            <div class="achievement-notification-text">
                <strong>Achievement freigeschaltet!</strong>
                <p>${achievement.name}</p>
            </div>
        </div>
    `;

    document.body.appendChild(notification);

    // Einblenden
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);

    const displayDuration = 4000; // später leicht variabel machbar

    // Ausblenden & aufräumen
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
            processNextAchievementNotification(); // nächstes in der Queue anzeigen
        }, 300);
    }, displayDuration);
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
  renderPrestigeContainer(game);
  renderPrestigeUpgrades(game);
  
  // Achievements nur rendern, wenn Tab aktiv ist
  const achievementContainer = document.getElementById('achievementsContainer');
  if (achievementContainer && achievementContainer.style.display !== 'none') {
    console.log('🏆 Rendering Achievements (Tab aktiv)...');
    renderAchievements(game);
  }
}
