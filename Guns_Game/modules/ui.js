// UI 업데이트 관리
export class UIManager {
    constructor(gameState) {
        this.gameState = gameState;
    }

    updateAll() {
        this.updatePlayerInfo();
        this.updateHighScores();
        this.updateCurrentWeaponStats();
    }

    updatePlayerInfo() {
        const data = this.gameState.data;
        document.getElementById('levelDisplay').textContent = data.level;
        document.getElementById('coinsAmount').textContent = data.coins;

        const currentXP = data.xp;
        const nextLevelXP = this.gameState.constructor.prototype.LEVEL_XP 
            ? this.gameState.constructor.prototype.LEVEL_XP[data.level] 
            : (data.level < 10 ? [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300][data.level] : 3300);
        const prevLevelXP = data.level > 1 ? [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300][data.level - 1] : 0;
        const xpProgress = ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100;
        
        document.getElementById('xpBar').style.width = xpProgress + '%';
        document.getElementById('xpText').textContent = `${currentXP} / ${nextLevelXP}`;
    }

    updateHighScores() {
        const data = this.gameState.data;
        document.getElementById('highScoreDisplay').textContent = data.highScore;
        document.getElementById('bestAccuracyDisplay').textContent = data.bestAccuracy + '%';
        document.getElementById('bestComboDisplay').textContent = data.bestCombo;
    }

    updateCurrentWeaponStats() {
        // 이 메서드는 main에서 구현
    }

    updateGameHUD(score, time, ammo, accuracy) {
        document.getElementById('scoreDisplay').textContent = score;
        document.getElementById('timeDisplay').textContent = time;
        document.getElementById('ammoDisplay').textContent = ammo;
        document.getElementById('accuracyDisplay').textContent = accuracy;
    }

    updateSessionStats(hits, headshots, combo) {
        document.getElementById('hitsDisplay').textContent = hits;
        document.getElementById('headshotsDisplay').textContent = headshots;
        document.getElementById('comboDisplay').textContent = combo;
    }

    showNotification(message, duration = 2000) {
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, duration);
    }

    showAchievementNotification(achievement) {
        const notif = document.getElementById('notification');
        notif.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 32px;">${achievement.icon}</span>
                <div style="text-align: left;">
                    <div style="font-size: 16px; font-weight: bold;">업적 달성!</div>
                    <div style="font-size: 14px;">${achievement.name}</div>
                    <div style="font-size: 12px; color: #999;">+${achievement.reward} 포인트</div>
                </div>
            </div>
        `;
        notif.classList.add('show');
        setTimeout(() => {
            notif.classList.remove('show');
        }, 3000);
    }
}

