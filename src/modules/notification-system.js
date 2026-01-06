/**
 * notification-system.js
 * Erweitertes Notification-System für verschiedene Ereignisse
 */

// Notification Queue und State
let notificationQueue = [];
let isShowingNotification = false;

// Notification Typen
export const NotificationType = {
  ACHIEVEMENT: 'achievement',
  RESEARCH: 'research',
  MILESTONE: 'milestone',
  WARNING: 'warning',
  INFO: 'info',
  SUCCESS: 'success'
};

// Notification Konfiguration pro Typ
const notificationConfig = {
  [NotificationType.ACHIEVEMENT]: {
    duration: 4000,
    icon: '🏆',
    color: '#4ade80',
    title: 'Achievement freigeschaltet!'
  },
  [NotificationType.RESEARCH]: {
    duration: 3500,
    icon: '🔬',
    color: '#38d6ff',
    title: 'Forschung abgeschlossen!'
  },
  [NotificationType.MILESTONE]: {
    duration: 4000,
    icon: '🎯',
    color: '#fbbf24',
    title: 'Meilenstein erreicht!'
  },
  [NotificationType.WARNING]: {
    duration: 3000,
    icon: '⚠️',
    color: '#ff4b6a',
    title: 'Warnung'
  },
  [NotificationType.INFO]: {
    duration: 2500,
    icon: 'ℹ️',
    color: '#9ca3c7',
    title: 'Info'
  },
  [NotificationType.SUCCESS]: {
    duration: 2500,
    icon: '✅',
    color: '#4ade80',
    title: 'Erfolg'
  }
};

/**
 * Zeigt eine Notification an
 * @param {Object} options - Notification Optionen
 * @param {string} options.type - NotificationType
 * @param {string} options.message - Haupt-Nachricht
 * @param {string} [options.subtitle] - Optional: Untertitel
 * @param {string} [options.customIcon] - Optional: Eigenes Icon
 * @param {number} [options.duration] - Optional: Eigene Anzeigedauer in ms
 */
export function showNotification(options) {
  const {
    type = NotificationType.INFO,
    message,
    subtitle = '',
    customIcon = null,
    duration = null
  } = options;

  const config = notificationConfig[type] || notificationConfig[NotificationType.INFO];
  
  const notification = {
    type,
    message,
    subtitle,
    icon: customIcon || config.icon,
    color: config.color,
    title: config.title,
    duration: duration || config.duration
  };

  notificationQueue.push(notification);
  
  if (!isShowingNotification) {
    processNextNotification();
  }
}

/**
 * Verarbeitet die nächste Notification in der Queue
 */
function processNextNotification() {
  if (notificationQueue.length === 0) {
    isShowingNotification = false;
    return;
  }

  isShowingNotification = true;
  const notification = notificationQueue.shift();

  const notificationEl = document.createElement('div');
  notificationEl.className = `notification notification-${notification.type}`;
  notificationEl.style.borderColor = notification.color;

  notificationEl.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon" style="font-size: 48px;">${notification.icon}</div>
      <div class="notification-text">
        <strong style="color: ${notification.color};">${notification.title}</strong>
        <p class="notification-message">${notification.message}</p>
        ${notification.subtitle ? `<p class="notification-subtitle">${notification.subtitle}</p>` : ''}
      </div>
    </div>
  `;

  document.body.appendChild(notificationEl);

  // Slide in animation
  setTimeout(() => {
    notificationEl.classList.add('show');
  }, 100);

  // Slide out animation
  setTimeout(() => {
    notificationEl.classList.remove('show');
    setTimeout(() => {
      notificationEl.remove();
      processNextNotification();
    }, 300);
  }, notification.duration);
}

/**
 * Zeigt eine Achievement-Notification
 * @param {Object} achievement - Achievement Objekt
 */
export function showAchievementNotification(achievement) {
  showNotification({
    type: NotificationType.ACHIEVEMENT,
    message: achievement.name,
    subtitle: achievement.desc,
    customIcon: achievement.icon
  });
}

/**
 * Zeigt eine Research-Complete Notification
 * @param {Object} research - Research Objekt
 */
export function showResearchNotification(research) {
  showNotification({
    type: NotificationType.RESEARCH,
    message: research.name,
    subtitle: research.description,
    customIcon: research.icon
  });
}

/**
 * Zeigt eine Meilenstein-Notification
 * @param {string} message - Meilenstein-Text
 * @param {string} [icon] - Optional: Custom Icon
 */
export function showMilestoneNotification(message, icon = null) {
  showNotification({
    type: NotificationType.MILESTONE,
    message,
    customIcon: icon
  });
}

/**
 * Zeigt eine Warnung
 * @param {string} message - Warnungs-Text
 */
export function showWarning(message) {
  showNotification({
    type: NotificationType.WARNING,
    message
  });
}

/**
 * Zeigt eine Info-Nachricht
 * @param {string} message - Info-Text
 */
export function showInfo(message) {
  showNotification({
    type: NotificationType.INFO,
    message
  });
}

/**
 * Zeigt eine Erfolgs-Nachricht
 * @param {string} message - Erfolgs-Text
 */
export function showSuccess(message) {
  showNotification({
    type: NotificationType.SUCCESS,
    message
  });
}

// Exportiere das gesamte System
export default {
  showNotification,
  showAchievementNotification,
  showResearchNotification,
  showMilestoneNotification,
  showWarning,
  showInfo,
  showSuccess,
  NotificationType
};
