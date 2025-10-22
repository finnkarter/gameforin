// 게임 상태 관리
const LEVEL_XP = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3300];

class GameState {
    constructor() {
        this.data = {
            // 플레이어 정보
            level: 1,
            xp: 0,
            coins: 1000, // 시작 코인 증가
            
            // 무기 및 장비
            currentWeapon: 'glock17',
            ownedWeapons: ['glock17'], // 소유한 무기 목록 (기본 무기는 처음부터 소유)
            ownedAttachments: [],
            equippedAttachments: {}, // 무기별 부착물 저장: { weaponId: { category: attachmentId } }
            
            // 게임 설정
            gameMode: 'classic',
            difficulty: 'normal',
            trainingProgram: null,
            
            // 통계
            highScore: 0,
            bestAccuracy: 0,
            bestCombo: 0,
            totalGamesPlayed: 0,
            totalHits: 0,
            totalShots: 0,
            totalHeadshots: 0,
            totalCoinsEarned: 0,
            speedModeHighScore: 0,
            precisionModeHighScore: 0,
            classicModeHighScore: 0,
            
            // 업적
            unlockedAchievements: [],
            
            // 크로스헤어 설정
            crosshairStyle: 'default',
            crosshairColor: '#888',
            crosshairSize: 15
        };
    }

    load() {
        const saved = localStorage.getItem('aimGameSave');
        if (saved) {
            const loadedData = JSON.parse(saved);
            this.data = { ...this.data, ...loadedData };
        }
    }

    save() {
        localStorage.setItem('aimGameSave', JSON.stringify(this.data));
    }

    addXP(amount) {
        this.data.xp += amount;
        const levelsGained = [];
        
        while (this.data.level < 10 && this.data.xp >= LEVEL_XP[this.data.level]) {
            this.data.level++;
            this.data.coins += 100;
            this.data.totalCoinsEarned += 100;
            levelsGained.push(this.data.level);
        }
        
        this.save();
        return levelsGained;
    }

    addCoins(amount) {
        this.data.coins += amount;
        this.data.totalCoinsEarned += amount;
        this.save();
    }

    spendCoins(amount) {
        if (this.data.coins >= amount) {
            this.data.coins -= amount;
            this.save();
            return true;
        }
        return false;
    }

    updateStats(gameStats) {
        this.data.totalGamesPlayed++;
        this.data.totalHits += gameStats.hits;
        this.data.totalShots += gameStats.shots;
        this.data.totalHeadshots += gameStats.headshots;

        if (gameStats.score > this.data.highScore) {
            this.data.highScore = gameStats.score;
        }

        if (gameStats.accuracy > this.data.bestAccuracy) {
            this.data.bestAccuracy = gameStats.accuracy;
        }

        if (gameStats.combo > this.data.bestCombo) {
            this.data.bestCombo = gameStats.combo;
        }

        // 모드별 최고 점수
        if (this.data.gameMode === 'classic' && gameStats.score > this.data.classicModeHighScore) {
            this.data.classicModeHighScore = gameStats.score;
        } else if (this.data.gameMode === 'precision' && gameStats.score > this.data.precisionModeHighScore) {
            this.data.precisionModeHighScore = gameStats.score;
        } else if (this.data.gameMode === 'speed' && gameStats.score > this.data.speedModeHighScore) {
            this.data.speedModeHighScore = gameStats.score;
        }

        this.save();
    }

    checkAndUnlockAchievements() {
        const stats = {
            level: this.data.level,
            totalHits: this.data.totalHits,
            totalShots: this.data.totalShots,
            totalHeadshots: this.data.totalHeadshots,
            bestAccuracy: this.data.bestAccuracy,
            bestCombo: this.data.bestCombo,
            totalCoinsEarned: this.data.totalCoinsEarned,
            speedModeHighScore: this.data.speedModeHighScore,
            precisionModeHighScore: this.data.precisionModeHighScore,
            ownedAttachments: this.data.ownedAttachments.length,
            ownedWeapons: this.data.ownedWeapons.length
        };

        const newAchievements = window.checkAchievements(stats, this.data.unlockedAchievements);
        
        newAchievements.forEach(achievement => {
            this.data.unlockedAchievements.push(achievement.id);
            this.addCoins(achievement.reward);
        });

        if (newAchievements.length > 0) {
            this.save();
        }

        return newAchievements;
    }

    reset() {
        localStorage.removeItem('aimGameSave');
        this.data = new GameState().data;
    }
}

// 전역 변수로 노출
window.LEVEL_XP = LEVEL_XP;
window.GameState = GameState;

