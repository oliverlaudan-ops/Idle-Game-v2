/** src/modules/core.js
Kern-Logik mit integriertem Content-System
**/

// Modul-Import
import gameState from './game-state.js';
import resourceDefinitions from './resources-def.js';
import upgradeDefinitions, { calculateUpgradeCost, checkUpgradeUnlock } from './upgrades-def.js';
import researchDefinitions, { checkResearchUnlock } from './research-def.js';
import prestigeUpgradesList, { calculatePrestigeBonuses } from './prestige-upgrades.js';
import { calculatePrestigePoints, doPrestige } from './prestige.js';
import achievementManager from './achievement-manager.js';
import { showResearchNotification, showMilestoneNotification, showWarning, showInfo } from './notification-system.js';

// [... Rest des Codes bleibt gleich bis zur getEfficiencyMultiplier Methode ...]
