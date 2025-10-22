// UI 업데이트 관리
class UIManager {
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
        const data = this.gameState.data;
        const weapon = getWeaponById(data.selectedWeapon);
        if (!weapon) return;

        const equippedAttachments = data.equippedAttachments[weapon.id] || {};
        const stats = calculateWeaponStats(weapon, equippedAttachments);

        // 기본 무기 정보 업데이트
        const weaponInfoEl = document.getElementById('weaponInfo');
        if (weaponInfoEl) {
            weaponInfoEl.innerHTML = `
                <div class="weapon-details">
                    <h3>${weapon.name}</h3>
                    <p class="weapon-description">${weapon.description || ''}</p>
                    <div class="weapon-caliber">탄종: ${weapon.caliber}</div>
                </div>
            `;
        }

        // 무기 스탯 업데이트
        this.updateWeaponStatBars(weapon, stats);
        this.updateAttachmentSlots(weapon, equippedAttachments);
    }

    updateWeaponStatBars(weapon, stats) {
        const statElements = [
            { id: 'damageBar', value: stats.damage, max: 150 },
            { id: 'accuracyBar', value: stats.accuracy, max: 100 },
            { id: 'recoilBar', value: 100 - (stats.recoil - 50), max: 100 }, // 반전된 값 (낮을수록 좋음)
            { id: 'ergoBar', value: weapon.ergonomics || 50, max: 100 },
            { id: 'stealthBar', value: stats.stealth, max: 100 }
        ];

        statElements.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                const percentage = Math.min(100, (stat.value / stat.max) * 100);
                element.style.width = percentage + '%';
                
                // 값 표시
                const valueEl = element.parentElement.querySelector('.stat-value');
                if (valueEl) {
                    valueEl.textContent = Math.round(stat.value);
                }
            }
        });
    }

    updateAttachmentSlots(weapon, equippedAttachments) {
        const availableSlots = getAvailableSlots(weapon);
        const slotsContainer = document.getElementById('attachmentSlots');
        
        if (!slotsContainer) return;

        slotsContainer.innerHTML = '';
        availableSlots.forEach(slotType => {
            const slotEl = document.createElement('div');
            slotEl.className = 'attachment-slot';
            slotEl.dataset.slotType = slotType;
            
            const currentAttachment = equippedAttachments[slotType];
            const attachmentData = currentAttachment ? getAttachmentById(currentAttachment) : null;
            
            slotEl.innerHTML = `
                <div class="slot-header">
                    <span class="slot-name">${CATEGORY_NAMES[slotType]}</span>
                    ${attachmentData ? `<button class="slot-remove" onclick="removeAttachment('${weapon.id}', '${slotType}')">×</button>` : ''}
                </div>
                <div class="slot-content">
                    ${attachmentData ? 
                        `<div class="attachment-equipped">
                            <span class="attachment-name">${attachmentData.name}</span>
                            <div class="attachment-stats">${this.formatAttachmentStats(attachmentData)}</div>
                        </div>` : 
                        `<button class="slot-empty" onclick="openAttachmentMenu('${weapon.id}', '${slotType}')">
                            + 부착물 선택
                        </button>`
                    }
                </div>
            `;
            
            slotsContainer.appendChild(slotEl);
        });
    }

    formatAttachmentStats(attachment) {
        const stats = [];
        if (attachment.damage) stats.push(`데미지 ${attachment.damage > 0 ? '+' : ''}${attachment.damage}`);
        if (attachment.accuracy) stats.push(`정확도 +${attachment.accuracy}`);
        if (attachment.recoil) stats.push(`반동 ${attachment.recoil}`);
        if (attachment.magBonus) stats.push(`탄창 +${attachment.magBonus}%`);
        if (attachment.stealth) stats.push(`은밀성 ${attachment.stealth}`);
        return stats.join(', ');
    }

    showAttachmentMenu(weaponId, slotType) {
        const weapon = getWeaponById(weaponId);
        const compatibleAttachments = getCompatibleAttachments(weapon, slotType);
        const playerLevel = this.gameState.data.level;
        
        const menuEl = document.getElementById('attachmentMenu');
        if (!menuEl) return;

        const availableAttachments = compatibleAttachments.filter(att => att.level <= playerLevel);
        
        menuEl.innerHTML = `
            <div class="attachment-menu-header">
                <h3>${CATEGORY_NAMES[slotType]} 선택</h3>
                <button onclick="closeAttachmentMenu()">×</button>
            </div>
            <div class="attachment-list">
                ${availableAttachments.map(att => `
                    <div class="attachment-item" onclick="equipAttachment('${weaponId}', '${slotType}', '${att.id}')">
                        <div class="attachment-info">
                            <div class="attachment-name">${att.name}</div>
                            <div class="attachment-stats">${this.formatAttachmentStats(att)}</div>
                            <div class="attachment-price">가격: ${att.price} 코인</div>
                        </div>
                        ${this.gameState.data.coins >= att.price ? 
                            '<button class="equip-btn">장착</button>' : 
                            '<button class="equip-btn disabled">코인 부족</button>'
                        }
                    </div>
                `).join('')}
            </div>
        `;
        
        menuEl.style.display = 'block';
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

// 전역 변수로 노출
window.UIManager = UIManager;

