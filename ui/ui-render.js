/**
 * ui-render.js
 * Alle Rendering- und Formatierungsfunktionen für Space Colonies
 * 🎨 Enhanced with visual hierarchy and better feedback
 * 🔧 QoL: Sorting, Filtering, Buy Max, Tooltips
 * 📊 Active Upgrades in Right Sidebar with Auto-Save Indicator
 */

import gameState from '../src/modules/game-state.js';
import { calculateUpgradeCost } from '../src/modules/upgrades-def.js';
import achievementManager from '../src/modules/achievement-manager.js';
import { showAchievementNotification } from '../src/modules/notification-system.js';

// 🔧 Global UI State
const uiState = {
  sortBy: 'default', // default | name | cost | production
  filterBy: 'all', // all | affordable | locked
  showTooltips: true,
  collapsedSections: {} // Track collapsed sections
};

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
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
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
  
  // 💾 Auto-Save Indicator
  const saveIndicator = document.createElement('div');
  saveIndicator.id = 'save-indicator';
  saveIndicator.className = 'stat-pill save-indicator';
  saveIndicator.innerHTML = `<span class="label">💾 Auto-Save</span>`;
  game.statsBarEl.appendChild(saveIndicator);
  
  updateActionsStickyTop();
}

// 💾 Show Save Indicator
export function showSaveIndicator() {
  const indicator = document.getElementById('save-indicator');
  if (indicator) {
    indicator.classList.add('saving');
    indicator.innerHTML = `<span class="label">💾 Speichern...</span>`;
    
    setTimeout(() => {
      indicator.classList.remove('saving');
      indicator.classList.add('saved');
      indicator.innerHTML = `<span class="label">✅ Gespeichert</span>`;
      
      setTimeout(() => {
        indicator.classList.remove('saved');
        indicator.innerHTML = `<span class="label">💾 Auto-Save</span>`;
      }, 2000);
    }, 300);
  }
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

// ========== Upgrades Rendering with Sidebar Layout ==========

export function renderUpgrades(game) {
  if (!game.upgradeGridEl) return;
  
  game.upgradeGridEl.innerHTML = '';
  
  // Create main layout with sidebar
  const layout = document.createElement('div');
  layout.style.cssText = 'display: grid; grid-template-columns: 1fr 320px; gap: 20px;';
  
  const mainColumn = document.createElement('div');
  mainColumn.style.cssText = 'min-width: 0;';
  
  const sidebar = document.createElement('div');
  sidebar.id = 'active-upgrades-sidebar';
  sidebar.style.cssText = 'position: sticky; top: 120px; max-height: calc(100vh - 140px); overflow-y: auto;';
  
  // 🔧 Add Sort/Filter Controls to main column
  const controlsBar = createControlsBar();
  mainColumn.appendChild(controlsBar);
  
  // Gruppiere Gebäude nach Typ
  let generators = [];
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
  
  // 📊 Aktive Upgrades in RIGHT SIDEBAR
  const activeUpgrades = [...efficiency, ...click, ...space].filter(def => {
    const count = game.getUpgradeCount(def.id);
    return count > 0;
  });
  
  if (activeUpgrades.length > 0) {
    const activeSection = createSidebarActiveUpgrades(game, activeUpgrades);
    sidebar.appendChild(activeSection);
  }
  
  // 🔧 Apply Filtering
  generators = applyFilter(game, generators);
  
  // 🔧 Apply Sorting
  generators = applySorting(game, generators);
  
  // Spalte für Generatoren in MAIN COLUMN
  if (generators.length > 0) {
    const section = createCollapsibleSection(
      'buildings',
      `🏭 Gebäude (${generators.length})`,
      () => {
        const container = document.createElement('div');
        container.className = 'upgrade-grid';
        container.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;';
        
        generators.forEach(def => {
          container.appendChild(createUpgradeCard(game, def));
        });
        
        return container;
      },
      true // Initially expanded
    );
    
    mainColumn.appendChild(section);
  }
  
  // Spalte für Upgrades (nur NICHT gekaufte) in MAIN COLUMN
  const availableUpgrades = [...efficiency, ...click, ...space].filter(def => {
    const count = game.getUpgradeCount(def.id);
    return count === 0 || (def.maxCount !== -1 && count < def.maxCount);
  });
  
  if (availableUpgrades.length > 0) {
    const section = createCollapsibleSection(
      'improvements',
      `⬆️ Verfügbare Verbesserungen (${availableUpgrades.length})`,
      () => {
        const container = document.createElement('div');
        container.className = 'upgrade-grid';
        container.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px;';
        
        availableUpgrades.forEach(def => {
          container.appendChild(createUpgradeCard(game, def));
        });
        
        return container;
      },
      true // Initially expanded
    );
    
    mainColumn.appendChild(section);
  }
  
  layout.appendChild(mainColumn);
  layout.appendChild(sidebar);
  game.upgradeGridEl.appendChild(layout);
}

// 📊 Create Sidebar Active Upgrades
function createSidebarActiveUpgrades(game, activeUpgrades) {
  const section = document.createElement('div');
  section.style.cssText = 'background: linear-gradient(135deg, var(--bg-panel-soft) 0%, var(--bg-panel) 100%); border-radius: 12px; border: 2px solid var(--success); padding: 16px;';
  
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-soft);';
  
  const icon = document.createElement('div');
  icon.style.cssText = 'font-size: 20px;';
  icon.textContent = '✅';
  
  const title = document.createElement('h3');
  title.style.cssText = 'margin: 0; color: var(--success); font-size: 16px; font-weight: 600;';
  title.textContent = 'Aktive Boni';
  
  header.appendChild(icon);
  header.appendChild(title);
  section.appendChild(header);
  
  // Group upgrades by base name
  const grouped = groupUpgradesByBaseName(activeUpgrades);
  
  // Render grouped cards (compact for sidebar)
  const container = document.createElement('div');
  container.style.cssText = 'display: flex; flex-direction: column; gap: 10px;';
  
  for (const group of grouped) {
    const card = createSidebarGroupCard(game, group);
    container.appendChild(card);
  }
  
  section.appendChild(container);
  
  return section;
}

// 📊 Create Compact Sidebar Group Card
function createSidebarGroupCard(game, group) {
  const card = document.createElement('div');
  card.style.cssText = 'padding: 10px; background: var(--bg-panel); border-radius: 6px; border: 1px solid var(--border-soft);';
  
  // Header
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; gap: 6px; margin-bottom: 6px;';
  
  const iconSpan = document.createElement('span');
  iconSpan.style.fontSize = '16px';
  iconSpan.textContent = group.icon;
  
  const nameSpan = document.createElement('span');
  nameSpan.style.cssText = 'font-weight: 600; color: var(--text-main); font-size: 13px;';
  nameSpan.textContent = group.baseName;
  
  const countBadge = document.createElement('span');
  countBadge.style.cssText = 'margin-left: auto; font-size: 10px; padding: 2px 6px; background: var(--accent); color: var(--bg-main); border-radius: 10px; font-weight: 600;';
  countBadge.textContent = group.upgrades.length;
  
  header.appendChild(iconSpan);
  header.appendChild(nameSpan);
  header.appendChild(countBadge);
  card.appendChild(header);
  
  // Effect summary
  const totalEffect = calculateGroupedEffect(game, group);
  
  if (totalEffect) {
    const effectDiv = document.createElement('div');
    effectDiv.style.cssText = 'padding: 6px 8px; background: rgba(52, 211, 153, 0.1); border-left: 2px solid var(--success); border-radius: 4px; font-size: 12px; color: var(--text-muted);';
    effectDiv.innerHTML = totalEffect;
    card.appendChild(effectDiv);
  }
  
  return card;
}

// 🔧 Create Collapsible Section
function createCollapsibleSection(id, title, contentFn, initiallyExpanded = true) {
  const section = document.createElement('div');
  section.className = 'collapsible-section';
  section.style.cssText = 'margin-bottom: 20px;';
  
  // Check if collapsed state exists
  const isCollapsed = uiState.collapsedSections[id] !== undefined ? uiState.collapsedSections[id] : !initiallyExpanded;
  
  const header = document.createElement('div');
  header.style.cssText = 'display: flex; align-items: center; gap: 8px; padding: 12px 16px; background: var(--bg-panel-soft); border-radius: 8px; border: 1px solid var(--border-soft); cursor: pointer; user-select: none; margin-bottom: 12px;';
  
  const collapseIcon = document.createElement('span');
  collapseIcon.style.cssText = 'font-size: 14px; transition: transform 0.2s;';
  collapseIcon.textContent = isCollapsed ? '▶' : '▼';
  
  const titleSpan = document.createElement('h4');
  titleSpan.style.cssText = 'margin: 0; font-size: 16px; font-weight: 600;';
  titleSpan.textContent = title;
  
  header.appendChild(collapseIcon);
  header.appendChild(titleSpan);
  
  const contentDiv = document.createElement('div');
  contentDiv.style.display = isCollapsed ? 'none' : 'block';
  contentDiv.appendChild(contentFn());
  
  header.onclick = () => {
    const isNowCollapsed = contentDiv.style.display !== 'none';
    contentDiv.style.display = isNowCollapsed ? 'none' : 'block';
    collapseIcon.textContent = isNowCollapsed ? '▶' : '▼';
    uiState.collapsedSections[id] = isNowCollapsed;
  };
  
  section.appendChild(header);
  section.appendChild(contentDiv);
  
  return section;
}

// 🔧 Group upgrades by base name (e.g., "Energie-Verstärker" or "Kolonien-Erweiterung")
function groupUpgradesByBaseName(upgrades) {
  const groups = {};
  
  upgrades.forEach(def => {
    // Extract base name (remove " I", " II", " III", etc.)
    const baseName = def.name.replace(/\s+(I{1,3}|IV|V|\d+)$/i, '').trim();
    
    if (!groups[baseName]) {
      groups[baseName] = {
        baseName,
        upgrades: [],
        icon: def.icon,
        type: def.type
      };
    }
    
    groups[baseName].upgrades.push(def);
  });
  
  // Convert to array and sort each group by name
  return Object.values(groups).map(group => {
    group.upgrades.sort((a, b) => a.name.localeCompare(b.name));
    return group;
  });
}

// 📊 Calculate total effect for a group
function calculateGroupedEffect(game, group) {
  if (group.type === 'efficiency') {
    // Sum up all efficiency multipliers
    let totalMultiplier = 1;
    let targetName = '';
    
    group.upgrades.forEach(def => {
      const count = game.getUpgradeCount(def.id);
      if (count > 0 && def.effect?.multiplier) {
        totalMultiplier *= def.effect.multiplier;
        
        // Get target name
        if (def.effect.target) {
          const targetDef = game.getUpgradeDefinition(def.effect.target);
          if (targetDef) {
            targetName = `${targetDef.icon} ${targetDef.name}`;
          }
        }
      }
    });
    
    const bonus = ((totalMultiplier - 1) * 100).toFixed(0);
    return `<strong>+${bonus}%</strong> ${targetName}`;
  }
  
  if (group.type === 'click') {
    // Sum up all click bonuses
    let totalBonus = 0;
    
    group.upgrades.forEach(def => {
      const count = game.getUpgradeCount(def.id);
      if (count > 0 && def.effect?.clickBonus) {
        totalBonus += def.effect.clickBonus;
      }
    });
    
    const baseClick = 1;
    const totalClick = baseClick + totalBonus;
    return `<strong>+${totalBonus}</strong> pro Klick (${totalClick}/Klick)`;
  }
  
  if (group.type === 'space') {
    // Sum up all space increases
    let totalSpace = 0;
    
    group.upgrades.forEach(def => {
      const count = game.getUpgradeCount(def.id);
      if (count > 0 && def.effect?.spaceIncrease) {
        totalSpace += def.effect.spaceIncrease;
      }
    });
    
    return `<strong>+${totalSpace}</strong> Bauplätze`;
  }
  
  return null;
}

// 🔧 Create Sort/Filter Controls
function createControlsBar() {
  const bar = document.createElement('div');
  bar.style.cssText = 'display: flex; gap: 12px; margin-bottom: 16px; padding: 12px; background: var(--bg-panel-soft); border-radius: 8px; border: 1px solid var(--border-soft); flex-wrap: wrap; align-items: center;';
  
  // Sort Label
  const sortLabel = document.createElement('span');
  sortLabel.textContent = '🔀 Sortierung:';
  sortLabel.style.cssText = 'font-weight: 600; color: var(--text-main);';
  bar.appendChild(sortLabel);
  
  // Sort Buttons
  const sortOptions = [
    { id: 'default', label: 'Standard', icon: '📋' },
    { id: 'name', label: 'Name', icon: '🔤' },
    { id: 'cost', label: 'Preis', icon: '💰' },
    { id: 'production', label: 'Produktion', icon: '📈' }
  ];
  
  sortOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = `${opt.icon} ${opt.label}`;
    btn.style.cssText = 'padding: 6px 12px; font-size: 13px;';
    
    if (uiState.sortBy === opt.id) {
      btn.style.background = 'var(--accent)';
      btn.style.color = 'var(--bg-main)';
    }
    
    btn.onclick = () => {
      uiState.sortBy = opt.id;
      const game = window.game; // Global reference
      renderUpgrades(game);
    };
    
    bar.appendChild(btn);
  });
  
  // Divider
  const divider = document.createElement('div');
  divider.style.cssText = 'width: 1px; height: 24px; background: var(--border-soft); margin: 0 8px;';
  bar.appendChild(divider);
  
  // Filter Label
  const filterLabel = document.createElement('span');
  filterLabel.textContent = '🔍 Filter:';
  filterLabel.style.cssText = 'font-weight: 600; color: var(--text-main);';
  bar.appendChild(filterLabel);
  
  // Filter Buttons
  const filterOptions = [
    { id: 'all', label: 'Alle', icon: '🌐' },
    { id: 'affordable', label: 'Bezahlbar', icon: '✅' },
    { id: 'locked', label: 'Gesperrt', icon: '🔒' }
  ];
  
  filterOptions.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = `${opt.icon} ${opt.label}`;
    btn.style.cssText = 'padding: 6px 12px; font-size: 13px;';
    
    if (uiState.filterBy === opt.id) {
      btn.style.background = 'var(--accent)';
      btn.style.color = 'var(--bg-main)';
    }
    
    btn.onclick = () => {
      uiState.filterBy = opt.id;
      const game = window.game;
      renderUpgrades(game);
    };
    
    bar.appendChild(btn);
  });
  
  return bar;
}

// 🔧 Apply Filtering
function applyFilter(game, buildings) {
  if (uiState.filterBy === 'all') return buildings;
  
  return buildings.filter(def => {
    if (uiState.filterBy === 'affordable') {
      return game.canBuyUpgrade(def.id);
    }
    if (uiState.filterBy === 'locked') {
      return !game.canBuyUpgrade(def.id);
    }
    return true;
  });
}

// 🔧 Apply Sorting
function applySorting(game, buildings) {
  if (uiState.sortBy === 'default') return buildings;
  
  const sorted = [...buildings];
  
  if (uiState.sortBy === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  if (uiState.sortBy === 'cost') {
    sorted.sort((a, b) => {
      const costA = calculateUpgradeCost(a, game.getUpgradeCount(a.id));
      const costB = calculateUpgradeCost(b, game.getUpgradeCount(b.id));
      
      // Sort by first resource cost
      const firstCostA = Object.values(costA)[0] || 0;
      const firstCostB = Object.values(costB)[0] || 0;
      
      return firstCostA - firstCostB;
    });
  }
  
  if (uiState.sortBy === 'production') {
    sorted.sort((a, b) => {
      // Calculate total production value
      const prodA = calculateTotalProduction(game, a);
      const prodB = calculateTotalProduction(game, b);
      
      return prodB - prodA; // Higher production first
    });
  }
  
  return sorted;
}

function calculateTotalProduction(game, def) {
  if (!def.produces) return 0;
  
  let total = 0;
  const count = game.getUpgradeCount(def.id);
  
  if (count === 0) return 0;
  
  for (const [resourceId, baseAmount] of Object.entries(def.produces)) {
    let production = baseAmount * count;
    production *= game.getEfficiencyMultiplier(def.id, resourceId);
    production *= game.getResearchMultiplier(def.id, resourceId);
    
    if (game.prestigeBonuses) {
      production *= (1 + game.prestigeBonuses.globalProduction);
      production *= (1 + game.prestigeBonuses.buildingProduction);
      
      if (game.prestigeBonuses.resourceProduction[resourceId]) {
        production *= (1 + game.prestigeBonuses.resourceProduction[resourceId]);
      }
    }
    
    total += production;
  }
  
  return total;
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

// ========== Statistics Rendering ==========

export function renderStatistics(game) {
  const container = document.getElementById('statisticsContainer');
  if (!container) return;
  
  container.innerHTML = '';
  
  const stats = game.getStatistics();
  
  // 🕒 Spielzeit Sektion
  const playtimeSection = document.createElement('div');
  playtimeSection.className = 'stats-section';
  playtimeSection.innerHTML = `
    <h3>🕒 Spielzeit</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Gesamte Spielzeit</div>
        <div class="stat-value accent">${formatPlaytime(stats.totalPlaytime)}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Total Klicks</div>
        <div class="stat-value">${formatAmount(stats.totalClicks)}</div>
      </div>
    </div>
  `;
  container.appendChild(playtimeSection);
  
  // ⚡ Ressourcen Sektion
  const resourceSection = document.createElement('div');
  resourceSection.className = 'stats-section';
  resourceSection.innerHTML = '<h3>⚡ Ressourcen (All-Time)</h3>';
  
  const resourceGrid = document.createElement('div');
  resourceGrid.className = 'stats-grid';
  
  for (const [resId, amount] of Object.entries(stats.totalResourcesEarned)) {
    const resource = game.resources[resId];
    if (!resource || !resource.unlocked) continue;
    
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `
      <div class="stat-label">${resource.icon} ${resource.name} (Total)</div>
      <div class="stat-value success">${formatAmount(amount)}</div>
    `;
    resourceGrid.appendChild(item);
  }
  
  resourceSection.appendChild(resourceGrid);
  container.appendChild(resourceSection);
  
  // 📈 Produktions-Rekorde
  const peakSection = document.createElement('div');
  peakSection.className = 'stats-section';
  peakSection.innerHTML = '<h3>📈 Peak Production Rates</h3>';
  
  const peakGrid = document.createElement('div');
  peakGrid.className = 'stats-grid';
  
  for (const [resId, peakRate] of Object.entries(stats.peakProduction)) {
    const resource = game.resources[resId];
    if (!resource || !resource.unlocked || peakRate === 0) continue;
    
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `
      <div class="stat-label">${resource.icon} ${resource.name}/s (Peak)</div>
      <div class="stat-value warning">${formatRate(peakRate)}</div>
    `;
    peakGrid.appendChild(item);
  }
  
  peakSection.appendChild(peakGrid);
  container.appendChild(peakSection);
  
  // 🏭 Gebäude & Upgrades
  const buildingSection = document.createElement('div');
  buildingSection.className = 'stats-section';
  buildingSection.innerHTML = '<h3>🏭 Gebäude & Upgrades</h3>';
  
  const buildingGrid = document.createElement('div');
  buildingGrid.className = 'stats-grid';
  
  // Most owned building
  let mostOwnedName = 'Noch keine';
  if (stats.mostOwnedBuilding.id) {
    const def = game.getUpgradeDefinition(stats.mostOwnedBuilding.id);
    if (def) {
      mostOwnedName = `${def.icon} ${def.name} (${stats.mostOwnedBuilding.count}x)`;
    }
  }
  
  buildingGrid.innerHTML = `
    <div class="stat-item">
      <div class="stat-label">Total gekaufte Upgrades</div>
      <div class="stat-value">${formatAmount(stats.totalUpgradesBought)}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Total abgerissene Gebäude</div>
      <div class="stat-value">${formatAmount(stats.totalUpgradesSold)}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Aktuelle Gebäude</div>
      <div class="stat-value accent">${stats.currentBuildings}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Meist gebautes Gebäude</div>
      <div class="stat-value" style="font-size: 14px;">${mostOwnedName}</div>
    </div>
  `;
  
  buildingSection.appendChild(buildingGrid);
  container.appendChild(buildingSection);
  
  // 🔬 Forschung
  const researchSection = document.createElement('div');
  researchSection.className = 'stats-section';
  researchSection.innerHTML = `
    <h3>🔬 Forschung</h3>
    <div class="stats-grid">
      <div class="stat-item">
        <div class="stat-label">Total Forschungen</div>
        <div class="stat-value">${stats.totalResearchCompleted}</div>
      </div>
      <div class="stat-item">
        <div class="stat-label">Aktuell erforscht</div>
        <div class="stat-value accent">${stats.currentResearch}</div>
      </div>
    </div>
  `;
  container.appendChild(researchSection);
  
  // 🌟 Prestige
  const prestigeSection = document.createElement('div');
  prestigeSection.className = 'stats-section';
  prestigeSection.innerHTML = '<h3>🌟 Prestige</h3>';
  
  const prestigeGrid = document.createElement('div');
  prestigeGrid.className = 'stats-grid';
  
  prestigeGrid.innerHTML = `
    <div class="stat-item">
      <div class="stat-label">Prestige-Zähler</div>
      <div class="stat-value warning">${stats.prestigeCount}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Total Prestige-Punkte</div>
      <div class="stat-value warning">${stats.totalPrestigePoints}</div>
    </div>
    <div class="stat-item">
      <div class="stat-label">Aktuelle Punkte</div>
      <div class="stat-value accent">${stats.currentPrestigePoints}</div>
    </div>
  `;
  
  prestigeSection.appendChild(prestigeGrid);
  
  // Prestige History
  if (stats.prestigeHistory.length > 0) {
    const historyDiv = document.createElement('div');
    historyDiv.innerHTML = '<h4 style="margin: 16px 0 8px; color: var(--text-muted); font-size: 14px;">Prestige-Historie (Letzte 10)</h4>';
    
    const historyList = document.createElement('div');
    historyList.className = 'prestige-history';
    
    // Zeige nur die letzten 10
    const recentHistory = stats.prestigeHistory.slice(-10).reverse();
    
    recentHistory.forEach(entry => {
      const date = new Date(entry.date);
      const item = document.createElement('div');
      item.className = 'prestige-history-item';
      item.innerHTML = `
        <span class="date">${date.toLocaleDateString('de-DE')} ${date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}</span>
        <span class="points">+${entry.pointsGained} 🌟</span>
      `;
      historyList.appendChild(item);
    });
    
    historyDiv.appendChild(historyList);
    prestigeSection.appendChild(prestigeGrid);
    prestigeSection.appendChild(historyDiv);
  } else {
    prestigeSection.appendChild(prestigeGrid);
  }
  
  container.appendChild(prestigeSection);
}

// ========== Upgrade Card Creation (🆕 ENHANCED with Buy Max & Tooltips) ==========

function createUpgradeCard(game, def) {
  const card = document.createElement('div');
  card.className = 'card';
  
  const currentCount = game.getUpgradeCount(def.id);
  const cost = calculateUpgradeCost(def, currentCount);
  
  // 🎯 Berechne Affordability Status
  const affordability = getAffordabilityStatus(game, cost);
  card.classList.add(affordability.cssClass);
  
  // 🏷️ Size Badge (nur bei Gebäuden mit size > 0)
  if (def.size > 0) {
    const sizeBadge = document.createElement('div');
    sizeBadge.className = `size-badge size-${def.size}`;
    sizeBadge.innerHTML = `📐 ${def.size}×${def.size}`;
    card.appendChild(sizeBadge);
  }
  
  // Titel mit Count Badge
  const titleContainer = document.createElement('div');
  titleContainer.style.display = 'flex';
  titleContainer.style.alignItems = 'center';
  titleContainer.style.gap = '6px';
  
  const title = document.createElement('h3');
  title.style.margin = '0';
  title.textContent = `${def.icon} ${def.name}`;
  titleContainer.appendChild(title);
  
  // Count Badge
  if (currentCount > 0) {
    const countBadge = document.createElement('span');
    countBadge.className = 'count-badge';
    countBadge.textContent = `×${currentCount}`;
    titleContainer.appendChild(countBadge);
  }
  
  card.appendChild(titleContainer);
  
  // 🆕 Tooltip mit detaillierten Infos
  if (uiState.showTooltips) {
    card.title = generateTooltip(game, def, currentCount);
  }
  
  // Beschreibung
  const desc = document.createElement('p');
  desc.textContent = def.description;
  card.appendChild(desc);
  
  // 💰 Kosten mit Color-Coding
  const costContainer = document.createElement('div');
  costContainer.className = 'cost-display';
  
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = game.resources[resourceId];
    if (!resource) continue;
    
    const costItem = document.createElement('div');
    costItem.className = 'cost-item';
    
    const canAfford = resource.amount >= amount;
    costItem.classList.add(canAfford ? 'affordable' : 'not-affordable');
    
    costItem.textContent = `${formatAmount(amount)} ${resource.icon}`;
    costContainer.appendChild(costItem);
  }
  
  card.appendChild(costContainer);
  
  // Owned/Platz-Info
  const info = document.createElement('p');
  info.className = 'muted';
  
  if (def.type === 'generator') {
    info.textContent = `Größe: ${def.size}×${def.size}`;
  } else if (def.maxCount !== -1) {
    info.textContent = `Stufe: ${currentCount} / ${def.maxCount}`;
  } else {
    info.textContent = `Stufe: ${currentCount}`;
  }
  
  card.appendChild(info);
  
  // 📊 Produktion anzeigen (bei Generatoren) - MIT ALLEN BONI
  if (def.produces && currentCount > 0) {
    const prodP = document.createElement('p');
    prodP.className = 'production-info';
    const prodParts = [];
    
    for (const [resourceId, baseAmount] of Object.entries(def.produces)) {
      const resource = game.resources[resourceId];
      if (!resource) continue;
      
      // Berechne Produktion mit allen Boni (wie in core.js recalculateProduction)
      let production = baseAmount * currentCount;
      
      // Effizienz-Upgrades anwenden
      production *= game.getEfficiencyMultiplier(def.id, resourceId);
      
      // Forschungs-Boni anwenden
      production *= game.getResearchMultiplier(def.id, resourceId);
      
      // Prestige-Boni anwenden
      if (game.prestigeBonuses) {
        production *= (1 + game.prestigeBonuses.globalProduction);
        production *= (1 + game.prestigeBonuses.buildingProduction);
        
        if (game.prestigeBonuses.resourceProduction[resourceId]) {
          production *= (1 + game.prestigeBonuses.resourceProduction[resourceId]);
        }
      }
      
      prodParts.push(`+${formatRate(production)} ${resource.icon}/s`);
    }
    
    prodP.innerHTML = `<strong>Produziert:</strong> ${prodParts.join(', ')}`;
    card.appendChild(prodP);
  }
  
  // Button-Container für Kauf & Abreißen
  const btnContainer = document.createElement('div');
  btnContainer.style.cssText = 'display: flex; gap: 8px; margin-top: 12px;';
  
  // 🆕 Buy Max Button (nur für günstige Gebäude)
  const canShowBuyMax = def.size > 0 && affordability.canAffordAll;
  
  if (canShowBuyMax) {
    const buyMaxBtn = document.createElement('button');
    buyMaxBtn.className = 'buy-btn';
    buyMaxBtn.style.flex = '0.5';
    buyMaxBtn.textContent = '🔝 Max';
    buyMaxBtn.title = 'Kaufe so viele wie möglich';
    
    buyMaxBtn.onclick = () => {
      let bought = 0;
      while (game.canBuyUpgrade(def.id) && bought < 100) { // Limit 100 für Performance
        if (game.buyUpgrade(def.id)) {
          bought++;
        } else {
          break;
        }
      }
      
      if (bought > 0) {
        renderAll(game);
        showBulkBuyNotification(def, bought);
      }
    };
    
    btnContainer.appendChild(buyMaxBtn);
  }
  
  // Kauf-Button
  const buyBtn = document.createElement('button');
  buyBtn.className = 'buy-btn';
  buyBtn.style.flex = '1';
  
  const canBuy = game.canBuyUpgrade(def.id);
  buyBtn.disabled = !canBuy;
  
  if (def.maxCount !== -1 && currentCount >= def.maxCount) {
    buyBtn.textContent = '✅ Maximum';
    buyBtn.disabled = true;
  } else if (def.size > 0 && game.usedSpace + def.size > game.maxSpace) {
    buyBtn.textContent = '❌ Kein Platz';
    buyBtn.disabled = true;
  } else {
    buyBtn.textContent = canBuy ? '🛒 Kaufen' : '💸 Zu teuer';
  }
  
  // Bulk-Buy mit Shift+Klick
  buyBtn.onclick = (event) => {
    const bulkAmount = event.shiftKey ? 10 : 1;
    
    if (bulkAmount === 10) {
      // Versuche 10x zu kaufen
      let bought = 0;
      for (let i = 0; i < 10; i++) {
        if (game.buyUpgrade(def.id)) {
          bought++;
        } else {
          break;
        }
      }
      
      if (bought > 0) {
        renderAll(game);
        showBulkBuyNotification(def, bought);
      }
    } else {
      // Normaler Einzelkauf
      if (game.buyUpgrade(def.id)) {
        renderAll(game);
      }
    }
  };
  
  // Tooltip für Bulk-Buy Hinweis
  buyBtn.title = 'Kaufen (⇧+Klick für 10×)';
  
  btnContainer.appendChild(buyBtn);
  
  // 💥 Abreißen-Button (nur bei Gebäuden mit size > 0 und count > 0)
  if (def.size > 0 && currentCount > 0) {
    const demolishBtn = document.createElement('button');
    demolishBtn.className = 'demolish-btn';
    demolishBtn.textContent = '💥';
    demolishBtn.title = 'Abreißen (50% Rückerstattung)';
    
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
  
  card.appendChild(btnContainer);
  
  // Fortschrittsbalken (nur wenn nicht vollständig bezahlbar)
  if (!affordability.canAffordAll) {
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
  
  return card;
}

// 🆕 Generate Detailed Tooltip
function generateTooltip(game, def, currentCount) {
  const lines = [];
  
  lines.push(`${def.icon} ${def.name}`);
  lines.push(`Stufe: ${currentCount}`);
  
  if (def.produces) {
    lines.push('\n📊 Produktion pro Gebäude:');
    
    for (const [resourceId, baseAmount] of Object.entries(def.produces)) {
      const resource = game.resources[resourceId];
      if (!resource) continue;
      
      let production = baseAmount;
      
      const effMult = game.getEfficiencyMultiplier(def.id, resourceId);
      const resMult = game.getResearchMultiplier(def.id, resourceId);
      
      let totalMult = effMult * resMult;
      
      if (game.prestigeBonuses) {
        totalMult *= (1 + game.prestigeBonuses.globalProduction);
        totalMult *= (1 + game.prestigeBonuses.buildingProduction);
        
        if (game.prestigeBonuses.resourceProduction[resourceId]) {
          totalMult *= (1 + game.prestigeBonuses.resourceProduction[resourceId]);
        }
      }
      
      production *= totalMult;
      
      lines.push(`  ${resource.icon} ${formatRate(baseAmount)}/s → ${formatRate(production)}/s (${(totalMult * 100).toFixed(0)}% Bonus)`);
    }
  }
  
  if (def.size > 0) {
    lines.push(`\n📐 Benötigt ${def.size}×${def.size} Bauplätze`);
  }
  
  const nextCost = calculateUpgradeCost(def, currentCount);
  lines.push('\n💰 Nächste Kosten:');
  for (const [resId, amount] of Object.entries(nextCost)) {
    const resource = game.resources[resId];
    if (resource) {
      lines.push(`  ${resource.icon} ${formatAmount(amount)}`);
    }
  }
  
  return lines.join('\n');
}

// 🆕 Helper: Affordability Status berechnen
function getAffordabilityStatus(game, cost) {
  let affordableCount = 0;
  let totalCount = 0;
  
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = game.resources[resourceId];
    if (resource) {
      totalCount++;
      if (resource.amount >= amount) {
        affordableCount++;
      }
    }
  }
  
  const canAffordAll = affordableCount === totalCount;
  const canAffordSome = affordableCount > 0 && !canAffordAll;
  
  return {
    canAffordAll,
    canAffordSome,
    canAffordNone: affordableCount === 0,
    cssClass: canAffordAll ? 'affordable' : (canAffordSome ? 'partially-affordable' : 'not-affordable')
  };
}

// 🆕 Notification für Bulk-Buy
function showBulkBuyNotification(def, amount) {
  let notification = document.getElementById('bulk-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'bulk-notification';
    notification.className = 'notification notification-success';
    document.body.appendChild(notification);
  }
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">🚀</div>
      <div class="notification-text">
        <strong>Bulk-Kauf</strong>
        <p class="notification-message">${amount}× ${def.icon} ${def.name} gekauft!</p>
      </div>
    </div>
  `;
  
  notification.classList.add('show');
  
  // Nach 2 Sekunden ausblenden
  setTimeout(() => {
    notification.classList.remove('show');
  }, 2000);
}

// ========== Research Card Creation ==========

function createResearchCard(game, def) {
  const card = document.createElement('div');
  card.className = 'card research-card';
  
  const cost = def.cost;
  const affordability = getAffordabilityStatus(game, cost);
  card.classList.add(affordability.cssClass);
  
  // Titel
  const title = document.createElement('h3');
  title.textContent = `${def.icon} ${def.name}`;
  
  // Beschreibung
  const desc = document.createElement('p');
  desc.textContent = def.description;
  
  // 💰 Kosten mit Color-Coding
  const costContainer = document.createElement('div');
  costContainer.className = 'cost-display';
  
  for (const [resourceId, amount] of Object.entries(cost)) {
    const resource = game.resources[resourceId];
    if (!resource) continue;
    
    const costItem = document.createElement('div');
    costItem.className = 'cost-item';
    
    const canAfford = resource.amount >= amount;
    costItem.classList.add(canAfford ? 'affordable' : 'not-affordable');
    
    costItem.textContent = `${formatAmount(amount)} ${resource.icon}`;
    costContainer.appendChild(costItem);
  }
  
  // Kauf-Button
  const btn = document.createElement('button');
  btn.className = 'buy-btn';
  
  const canResearch = game.canResearch(def.id);
  btn.disabled = !canResearch;
  btn.textContent = canResearch ? '🔬 Erforschen' : '💸 Zu teuer';
  
  btn.onclick = () => {
    if (game.performResearch(def.id)) {
      renderAll(game);
    }
  };
  
  card.appendChild(title);
  card.appendChild(desc);
  card.appendChild(costContainer);
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
    btn.textContent = '✅ Maximum';
    btn.disabled = true;
  } else {
    btn.textContent = canBuy ? '🛒 Kaufen' : '💸 Zu teuer';
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
  // 🆕 Make game globally accessible for controls
  window.game = game;
  
  renderStatsBar(game);
  renderActions(game);
  renderUpgrades(game);
  renderResearch(game);
  renderPrestigeContainer(game);
  
  // Tab-spezifisches Rendering
  const statisticsContainer = document.getElementById('statisticsContainer');
  if (statisticsContainer && statisticsContainer.style.display !== 'none') {
    renderStatistics(game);
  }
  
  const achievementContainer = document.getElementById('achievementsContainer');
  if (achievementContainer && achievementContainer.style.display !== 'none') {
    renderAchievements(game);
  }
}