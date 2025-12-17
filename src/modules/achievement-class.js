// achievement-class.js
// Basis-Klasse für Achievements

export class Achievement {
    constructor({
        id,
        name,
        desc,
        category = 'general',
        icon = '🏆',
        checkFn,
        rewardFn = null,
        hidden = false,
        progressFn = null,
        maxProgress = 0
    }) {
        this.id = id;
        this.name = name;
        this.desc = desc;
        this.category = category;
        this.icon = icon;
        this.checkFn = checkFn;
        this.rewardFn = rewardFn;
        this.hidden = hidden;
        this.progressFn = progressFn;
        this.maxProgress = maxProgress;

        this.unlocked = false;
        this.unlockedAt = null;
        this.progress = 0;
    }

    check(game) {
        if (this.unlocked) return false;

        // Fortschritt aktualisieren, falls vorhanden
        if (typeof this.progressFn === 'function') {
            try {
                this.progress = this.progressFn(game);
            } catch (e) {
                console.error(`Fehler in progressFn von Achievement "${this.id}":`, e);
            }
        }

        // Bedingung prüfen
        let isComplete = false;
        try {
            isComplete = typeof this.checkFn === 'function' ? this.checkFn(game) : false;
        } catch (e) {
            console.error(`Fehler in checkFn von Achievement "${this.id}":`, e);
        }

        if (isComplete) {
            this.unlock(game);
            return true;
        }

        return false;
    }

    unlock(game) {
        if (this.unlocked) return;

        this.unlocked = true;
        this.unlockedAt = Date.now();

        if (typeof this.rewardFn === 'function') {
            try {
                this.rewardFn(game);
            } catch (e) {
                console.error(`Fehler in rewardFn von Achievement "${this.id}":`, e);
            }
        }
    }

    getProgressPercent() {
        if (!this.progressFn || this.maxProgress === 0) return 0;
        return Math.min(100, (this.progress / this.maxProgress) * 100);
    }

    toJSON() {
        return {
            id: this.id,
            unlocked: this.unlocked,
            unlockedAt: this.unlockedAt,
            progress: this.progress
        };
    }

    loadFromSave(data) {
        if (!data) return;
        this.unlocked = data.unlocked || false;
        this.unlockedAt = data.unlockedAt || null;
        this.progress = data.progress || 0;
    }
}
