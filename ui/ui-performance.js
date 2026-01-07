/**
 * ui-performance.js
 * Performance-Optimierungen für Space Colonies
 * ⚡ Reduziert unnötige Redraws und verbessert die Performance
 */

// ⚡ Render-Debouncing
let renderScheduled = false;
let lastRenderTime = 0;
const MIN_RENDER_INTERVAL = 100; // Minimum 100ms zwischen Renders (10 FPS)

// 💾 Cached Values für Smart Updates
const renderCache = {
  resources: {}, // { resourceId: { amount, perSecond } }
  upgradeCounts: {}, // { upgradeId: count }
  space: { used: 0, max: 0 },
  affordability: {}, // { upgradeId: canAfford }
  lastUpdateHash: null
};

/**
 * ⚡ Smart Render Scheduler
 * Plant ein Render nur wenn nötig und respektiert Rate Limits
 */
export function scheduleRender(game, renderFunction, force = false) {
  const now = Date.now();
  
  // Forced Render (z.B. bei Kauf)
  if (force) {
    lastRenderTime = now;
    renderFunction(game);
    return;
  }
  
  // Bereits geplant
  if (renderScheduled) return;
  
  // Rate Limit
  const timeSinceLastRender = now - lastRenderTime;
  if (timeSinceLastRender < MIN_RENDER_INTERVAL) {
    // Schedule für später
    renderScheduled = true;
    setTimeout(() => {
      renderScheduled = false;
      lastRenderTime = Date.now();
      renderFunction(game);
    }, MIN_RENDER_INTERVAL - timeSinceLastRender);
    return;
  }
  
  // Sofort rendern
  lastRenderTime = now;
  renderFunction(game);
}

/**
 * 🔍 Smart Update Detection
 * Prüft ob sich etwas geändert hat das ein Render rechtfertigt
 */
export function needsUpdate(game) {
  // Erstelle Hash des aktuellen Zustands
  const currentHash = createStateHash(game);
  
  if (currentHash === renderCache.lastUpdateHash) {
    return false;
  }
  
  renderCache.lastUpdateHash = currentHash;
  return true;
}

/**
 * 🏷️ Erstellt einen simplen Hash des Game-States
 */
function createStateHash(game) {
  const parts = [];
  
  // Ressourcen (nur signifikante Änderungen)
  for (const [id, resource] of Object.entries(game.resources)) {
    if (!resource.unlocked) continue;
    
    // Runde auf 2 Dezimalstellen für Hash
    const amount = Math.floor(resource.amount * 100);
    const perSecond = Math.floor(resource.perSecond * 100);
    parts.push(`${id}:${amount}:${perSecond}`);
  }
  
  // Upgrade-Counts
  for (const [id, count] of Object.entries(game.upgrades)) {
    if (count > 0) {
      parts.push(`u${id}:${count}`);
    }
  }
  
  // Space
  parts.push(`s${game.usedSpace}:${game.maxSpace}`);
  
  return parts.join('|');
}

/**
 * 📊 Partial Update: Nur Stats Bar
 * Schnelles Update für häufige Resource-Änderungen
 */
export function updateStatsBarOnly(game) {
  if (!game.statsBarEl) return;
  
  // Update nur die Zahlen, nicht die gesamte DOM-Struktur
  for (const [id, resource] of Object.entries(game.resources)) {
    if (!resource.unlocked) continue;
    
    const statPill = document.getElementById(`stat-${id}`);
    if (!statPill) continue;
    
    const label = statPill.querySelector('.label');
    const details = statPill.querySelector('.details');
    
    if (label) {
      const amount = formatAmount(resource.amount);
      label.textContent = `${resource.icon} ${resource.name}: ${amount}`;
    }
    
    if (details) {
      const perSecond = formatRate(resource.perSecond);
      
      if (resource.clickValue > 0) {
        let totalClickValue = resource.clickValue;
        if (game.prestigeBonuses) {
          totalClickValue += game.prestigeBonuses.clickPower;
          totalClickValue *= (1 + game.prestigeBonuses.clickMultiplier);
        }
        details.textContent = `+${perSecond}/s, +${formatRate(totalClickValue)}/klick`;
      } else {
        details.textContent = `+${perSecond}/s`;
      }
    }
  }
  
  // Update Space-Pill
  const spacePill = document.querySelector('.stat-space');
  if (spacePill) {
    const label = spacePill.querySelector('.label');
    if (label) {
      label.textContent = `🏭️ Bauplätze: ${game.usedSpace} / ${game.maxSpace}`;
    }
  }
}

/**
 * ⭐ Smart Affordability Check
 * Cached und optimiert für bessere Performance
 */
export function updateAffordability(game) {
  const changes = [];
  
  for (const def of game.upgradeDefinitions) {
    if (!def.unlocked) continue;
    
    const canAfford = game.canBuyUpgrade(def.id);
    const cached = renderCache.affordability[def.id];
    
    // Nur wenn sich etwas geändert hat
    if (cached !== canAfford) {
      renderCache.affordability[def.id] = canAfford;
      changes.push({ upgradeId: def.id, canAfford });
    }
  }
  
  return changes;
}

/**
 * 🎨 Visual Update: Affordability Highlighting
 * Updated nur die CSS-Klassen der betroffenen Karten
 */
export function applyAffordabilityChanges(changes) {
  for (const { upgradeId, canAfford } of changes) {
    // Finde alle Cards mit dieser upgradeId
    const cards = document.querySelectorAll(`[data-upgrade-id="${upgradeId}"]`);
    
    cards.forEach(card => {
      if (canAfford) {
        card.classList.remove('not-affordable', 'partially-affordable');
        card.classList.add('affordable');
        
        // Pulsing effect für neu erschwingliche Items
        card.classList.add('newly-affordable');
        setTimeout(() => card.classList.remove('newly-affordable'), 1000);
      } else {
        card.classList.remove('affordable');
        card.classList.add('not-affordable');
      }
    });
  }
}

/**
 * 💾 Cache Management
 */
export function invalidateCache() {
  renderCache.resources = {};
  renderCache.upgradeCounts = {};
  renderCache.affordability = {};
  renderCache.lastUpdateHash = null;
}

export function updateResourceCache(game) {
  for (const [id, resource] of Object.entries(game.resources)) {
    renderCache.resources[id] = {
      amount: resource.amount,
      perSecond: resource.perSecond
    };
  }
}

export function updateSpaceCache(game) {
  renderCache.space = {
    used: game.usedSpace,
    max: game.maxSpace
  };
}

/**
 * 🔧 Helper Functions
 */
function formatAmount(n) {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'G';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(2) + 'K';
  return n.toFixed(0);
}

function formatRate(n) {
  const abs = Math.abs(n);
  if (abs === 0) return '0';
  if (abs < 0.01) return n.toFixed(4);
  if (abs < 1) return n.toFixed(2);
  if (abs < 1000) return n.toFixed(1);
  return formatAmount(n);
}

/**
 * 🎯 Performance Monitor (Debug-Tool)
 */
const performanceMetrics = {
  renderCount: 0,
  averageRenderTime: 0,
  lastRenderDuration: 0
};

export function measureRender(renderFunction) {
  return function(game) {
    const start = performance.now();
    renderFunction(game);
    const duration = performance.now() - start;
    
    performanceMetrics.renderCount++;
    performanceMetrics.lastRenderDuration = duration;
    performanceMetrics.averageRenderTime = 
      (performanceMetrics.averageRenderTime * (performanceMetrics.renderCount - 1) + duration) / 
      performanceMetrics.renderCount;
    
    // Warn bei langsamen Renders
    if (duration > 50) {
      console.warn(`⚠️ Langsamer Render: ${duration.toFixed(2)}ms`);
    }
  };
}

export function getPerformanceMetrics() {
  return { ...performanceMetrics };
}

/**
 * 🚀 Optimized Game Loop Integration
 */
export function createOptimizedRenderLoop(game, fullRenderFunction) {
  let ticksSinceLastFullRender = 0;
  const FULL_RENDER_INTERVAL = 5; // Full render alle 5 Ticks (5 Sekunden)
  
  return function onTick() {
    ticksSinceLastFullRender++;
    
    // Quick Update: Nur Stats Bar
    if (ticksSinceLastFullRender < FULL_RENDER_INTERVAL) {
      updateStatsBarOnly(game);
      
      // Check Affordability
      const changes = updateAffordability(game);
      if (changes.length > 0) {
        applyAffordabilityChanges(changes);
      }
      return;
    }
    
    // Full Render
    ticksSinceLastFullRender = 0;
    
    if (needsUpdate(game)) {
      scheduleRender(game, fullRenderFunction, false);
    }
  };
}