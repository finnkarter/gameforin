// 메인 게임 로직
// 모든 모듈은 HTML에서 순서대로 로딩되어 전역 변수로 사용 가능

// 게임 인스턴스
const gameState = new window.GameState();
const canvas = document.getElementById('gameCanvas');
const renderer = new window.Renderer(canvas);
const uiManager = new window.UIManager(gameState);

// 게임 변수
let gameRunning = false;
let gamePaused = false;
let isReloading = false;
let reloadProgress = 0;
let score = 0;
let hits = 0;
let shots = 0;
let headshots = 0;
let combo = 0;
let maxCombo = 0;
let timeLeft = 60;
let currentAmmo = 17;
let maxAmmo = 17;
let reloadSpeed = 1.5;
let targets = [];
let gameTimer = null;
let currentSettings = null;
let pauseStartTime = 0;
let totalPausedTime = 0;

// 초기화
function init() {
    gameState.load();
    uiManager.updateAll();
    renderWeaponList();
    updateCurrentWeaponStats();
    setupEventListeners();
    renderDifficultySelector();
    renderTrainingPrograms();
}

// 이벤트 리스너 설정
function setupEventListeners() {
    document.getElementById('startBtn').onclick = startGame;
    document.getElementById('pauseBtn').onclick = togglePause;
    document.getElementById('reloadBtn').onclick = () => !isReloading && reload();
    document.getElementById('attachmentsBtn').onclick = openAttachmentsModal;
    document.getElementById('closeModal').onclick = closeAttachmentsModal;
    document.getElementById('shopBtn').onclick = openShopModal;
    document.getElementById('closeShopModal').onclick = closeShopModal;
    document.getElementById('resetBtn').onclick = resetGame;
    document.getElementById('achievementsBtn').onclick = openAchievementsModal;
    document.getElementById('closeAchievementsModal').onclick = closeAchievementsModal;
    document.getElementById('settingsBtn').onclick = openSettingsModal;
    document.getElementById('closeSettingsModal').onclick = closeSettingsModal;
    document.getElementById('resumeBtn').onclick = togglePause;

    canvas.addEventListener('click', handleCanvasClick);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'r' || e.key === 'R') {
            !isReloading && reload();
        }
        if (e.key === 'Escape' || e.key === ' ') {
            if (gameRunning) {
                e.preventDefault();
                togglePause();
            }
        }
    });

    // 게임 모드 선택
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.data.gameMode = btn.dataset.mode;
            gameState.save();
        });
    });

    // 훈련 프로그램 선택
    document.querySelectorAll('.training-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.training-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.data.trainingProgram = btn.dataset.program;
            gameState.save();
        });
    });

    // 크로스헤어 스타일
    const crosshairStyleSelect = document.getElementById('crosshairStyle');
    if (crosshairStyleSelect) {
        crosshairStyleSelect.value = gameState.data.crosshairStyle;
        crosshairStyleSelect.onchange = (e) => {
            gameState.data.crosshairStyle = e.target.value;
            gameState.save();
        };
    }

    const crosshairColorSelect = document.getElementById('crosshairColor');
    if (crosshairColorSelect) {
        crosshairColorSelect.value = gameState.data.crosshairColor;
        crosshairColorSelect.onchange = (e) => {
            gameState.data.crosshairColor = e.target.value;
            gameState.save();
        };
    }
}

// 난이도 선택기 렌더링
function renderDifficultySelector() {
    const container = document.getElementById('difficultySelector');
    if (!container) return;

    container.innerHTML = '';
    Object.keys(window.DIFFICULTY_LEVELS).forEach(key => {
        const diff = window.DIFFICULTY_LEVELS[key];
        const btn = document.createElement('button');
        btn.className = 'difficulty-btn';
        btn.dataset.difficulty = key;
        btn.textContent = diff.name;
        if (gameState.data.difficulty === key) {
            btn.classList.add('active');
        }
        btn.onclick = () => {
            document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            gameState.data.difficulty = key;
            gameState.save();
        };
        container.appendChild(btn);
    });
}

// 훈련 프로그램 렌더링
function renderTrainingPrograms() {
    const container = document.getElementById('trainingList');
    if (!container) return;

    container.innerHTML = '';
    Object.keys(window.TRAINING_PROGRAMS).forEach(key => {
        const program = window.TRAINING_PROGRAMS[key];
        const div = document.createElement('div');
        div.className = 'training-item';
        div.innerHTML = `
            <div class="training-icon">${program.icon}</div>
            <div class="training-info">
                <div class="training-name">${program.name}</div>
                <div class="training-desc">${program.description}</div>
            </div>
        `;
        div.onclick = () => {
            document.querySelectorAll('.training-item').forEach(t => t.classList.remove('active'));
            div.classList.add('active');
            gameState.data.trainingProgram = key;
            gameState.save();
        };
        if (gameState.data.trainingProgram === key) {
            div.classList.add('active');
        }
        container.appendChild(div);
    });
}

// 무기 목록 렌더링
function renderWeaponList() {
    const list = document.getElementById('weaponList');
    list.innerHTML = '';

    window.WEAPONS.forEach(weapon => {
        const div = document.createElement('div');
        div.className = 'weapon-item';
        
        const owned = gameState.data.ownedWeapons.includes(weapon.id);
        const levelUnlocked = weapon.level <= gameState.data.level;
        const affordable = gameState.data.coins >= weapon.price;
        
        // 레벨 잠금
        if (!levelUnlocked) {
            div.classList.add('locked');
        }
        
        // 소유하지 않은 무기
        if (!owned && levelUnlocked) {
            div.classList.add('unowned');
        }
        
        // 현재 선택된 무기
        if (weapon.id === gameState.data.currentWeapon) {
            div.classList.add('active');
        }

        div.innerHTML = `
            <div class="weapon-header">
                <div class="weapon-name">${weapon.name}</div>
                ${owned ? '<div class="weapon-owned">✓ 소유</div>' : ''}
            </div>
            <div class="weapon-stats">
                ${weapon.type} | ${weapon.caliber}<br>
                DMG: ${weapon.damage} | ACC: ${weapon.accuracy}% | MAG: ${weapon.mag}발
            </div>
            <div class="weapon-description">${weapon.description}</div>
            ${!levelUnlocked ? `<div class="weapon-level-req">레벨 ${weapon.level} 필요</div>` : 
              !owned ? `<div class="weapon-price ${affordable ? '' : 'unaffordable'}">${weapon.price} 코인</div>` : ''}
            ${levelUnlocked && !owned ? `
                <button class="weapon-buy-btn ${affordable ? '' : 'disabled'}" 
                    onclick="buyWeapon('${weapon.id}')" 
                    ${!affordable ? 'disabled' : ''}>
                    ${affordable ? '구매' : '코인 부족'}
                </button>
            ` : ''}
        `;

        // 소유한 무기만 선택 가능
        if (owned) {
            div.onclick = () => selectWeapon(weapon.id);
            div.style.cursor = 'pointer';
        }

        list.appendChild(div);
    });
}

// 무기 구매
function buyWeapon(weaponId) {
    const weapon = window.getWeaponById(weaponId);
    if (!weapon) return;
    
    // 레벨 체크
    if (weapon.level > gameState.data.level) {
        uiManager.showNotification(`레벨 ${weapon.level}이 필요합니다.`);
        return;
    }
    
    // 이미 소유한 무기인지 체크
    if (gameState.data.ownedWeapons.includes(weaponId)) {
        uiManager.showNotification('이미 소유한 무기입니다.');
        return;
    }
    
    // 코인 체크 및 구매
    if (gameState.spendCoins(weapon.price)) {
        gameState.data.ownedWeapons.push(weaponId);
        uiManager.showNotification(`${weapon.name} 구매 완료!`);
        renderWeaponList();
        uiManager.updateAll();
        checkAndNotifyAchievements();
        gameState.save();
        
        // 구매 후 자동 선택
        selectWeapon(weaponId);
    } else {
        uiManager.showNotification('코인이 부족합니다.');
    }
}

// 무기 선택
function selectWeapon(weaponId) {
    // 소유한 무기인지 체크
    if (!gameState.data.ownedWeapons.includes(weaponId)) {
        uiManager.showNotification('소유하지 않은 무기입니다.');
        return;
    }
    
    gameState.data.currentWeapon = weaponId;
    const weapon = window.getWeaponById(weaponId);
    
    // 해당 무기의 부착물 설정 가져오기
    const weaponAttachments = gameState.data.equippedAttachments[weaponId] || {};
    const stats = window.calculateWeaponStats(weapon, weaponAttachments);
    
    maxAmmo = stats.mag;
    currentAmmo = maxAmmo;
    reloadSpeed = stats.reloadSpeed;
    
    renderWeaponList();
    updateCurrentWeaponStats();
    updateAmmoDisplay();
    gameState.save();
    
    uiManager.showNotification(`${weapon.name} 선택됨`);
}

// 전역 함수로 노출
window.buyWeapon = buyWeapon;

// 현재 무기 스탯 업데이트
function updateCurrentWeaponStats() {
    const weapon = window.getWeaponById(gameState.data.currentWeapon);
    if (!weapon) return;
    
    const equippedAttachments = gameState.data.equippedAttachments[weapon.id] || {};
    const stats = window.calculateWeaponStats(weapon, equippedAttachments);
    
    const statsDiv = document.getElementById('currentWeaponStats');
    if (statsDiv) {
        statsDiv.innerHTML = `
            <div class="weapon-header">
                <h3>${weapon.name}</h3>
                <span class="weapon-caliber">${weapon.caliber}</span>
            </div>
            <div class="weapon-stats">
                <div class="stat-bar">
                    <span class="stat-label">데미지</span>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" id="damageBar" style="width: ${Math.min(100, (stats.damage / 150) * 100)}%"></div>
                    </div>
                    <span class="stat-value">${stats.damage}</span>
                </div>
                <div class="stat-bar">
                    <span class="stat-label">정확도</span>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" id="accuracyBar" style="width: ${stats.accuracy}%"></div>
                    </div>
                    <span class="stat-value">${stats.accuracy}</span>
                </div>
                <div class="stat-bar">
                    <span class="stat-label">반동 제어</span>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" id="recoilBar" style="width: ${Math.max(0, 100 - (stats.recoil - 50))}%"></div>
                    </div>
                    <span class="stat-value">${Math.round(stats.recoil)}</span>
                </div>
                <div class="stat-bar">
                    <span class="stat-label">인체공학</span>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" id="ergoBar" style="width: ${weapon.ergonomics || 50}%"></div>
                    </div>
                    <span class="stat-value">${weapon.ergonomics || 50}</span>
                </div>
                ${stats.stealth > 0 ? `
                <div class="stat-bar">
                    <span class="stat-label">은밀성</span>
                    <div class="stat-bar-bg">
                        <div class="stat-bar-fill" id="stealthBar" style="width: ${stats.stealth}%"></div>
                    </div>
                    <span class="stat-value">${stats.stealth}</span>
                </div>
                ` : ''}
                <div class="stat-item">
                    <span class="stat-label">탄창 용량</span>
                    <span class="stat-value">${stats.mag}발</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">재장전 시간</span>
                    <span class="stat-value">${stats.reloadSpeed.toFixed(1)}초</span>
                </div>
            </div>
        `;
    }
    
    // UI 매니저를 통한 업데이트
    uiManager.updateCurrentWeaponStats();
}

// 부착물 모달
function openAttachmentsModal() {
    document.getElementById('attachmentsModal').classList.add('active');
    renderAttachments();
}

function closeAttachmentsModal() {
    document.getElementById('attachmentsModal').classList.remove('active');
}

function renderAttachments() {
    const list = document.getElementById('attachmentsList');
    const weapon = window.getWeaponById(gameState.data.currentWeapon);
    if (!weapon || !list) return;
    
    // 소유한 무기인지 체크
    if (!gameState.data.ownedWeapons.includes(gameState.data.currentWeapon)) {
        list.innerHTML = '<div class="no-attachments">무기를 먼저 구매해주세요.</div>';
        return;
    }

    list.innerHTML = '';

    // 무기별 사용 가능한 슬롯만 표시
    const availableSlots = window.getAvailableSlots(weapon);
    
    availableSlots.forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'attachment-category';
        
        categoryDiv.innerHTML = `
            <div class="category-title">
                ${window.CATEGORY_NAMES[category]}
                <span class="category-info">${weapon.name} 호환</span>
            </div>
        `;

        // 호환 가능한 부착물만 필터링
        const compatibleAttachments = window.getCompatibleAttachments(weapon, category);
        
        compatibleAttachments.forEach(attachment => {
            const div = document.createElement('div');
            div.className = 'attachment-item';
            
            const owned = gameState.data.ownedAttachments.includes(attachment.id);
            const currentWeaponAttachments = gameState.data.equippedAttachments[weapon.id] || {};
            const equipped = currentWeaponAttachments[category] === attachment.id;
            
            if (owned) div.classList.add('owned');
            if (equipped) div.classList.add('equipped');

            // 효과 표시 개선
            let effects = [];
            if (attachment.accuracy) effects.push(`정확도 +${attachment.accuracy}`);
            if (attachment.damage) effects.push(`데미지 ${attachment.damage > 0 ? '+' : ''}${attachment.damage}`);
            if (attachment.recoil) effects.push(`반동 ${attachment.recoil}`);
            if (attachment.magBonus) effects.push(`탄창 +${attachment.magBonus}%`);
            if (attachment.reloadBonus) effects.push(`재장전 +${attachment.reloadBonus}%`);
            if (attachment.stealth) effects.push(`은밀성 +${attachment.stealth}`);

            const locked = attachment.level > gameState.data.level;
            const affordable = gameState.data.coins >= attachment.price;

            div.innerHTML = `
                <div class="attachment-info">
                    <div class="attachment-name">${attachment.name}</div>
                    <div class="attachment-effects">${effects.join(', ')}</div>
                    ${attachment.caliber ? `<div class="attachment-caliber">탄종: ${attachment.caliber}</div>` : ''}
                    ${locked ? `<div class="attachment-locked">레벨 ${attachment.level} 필요</div>` : ''}
                </div>
                <div class="attachment-actions">
                    ${!locked ? `
                        ${!owned ? `<div class="attachment-price ${affordable ? '' : 'unaffordable'}">${attachment.price} 코인</div>` : ''}
                        <button class="btn-small ${equipped ? 'equipped' : ''} ${!affordable && !owned ? 'disabled' : ''}" 
                            data-action="${owned ? (equipped ? 'unequip' : 'equip') : 'buy'}"
                            data-category="${category}"
                            data-id="${attachment.id}"
                            ${!affordable && !owned ? 'disabled' : ''}>
                            ${owned ? (equipped ? '해제' : '장착') : '구매'}
                        </button>
                    ` : '<div class="attachment-locked-btn">잠김</div>'}
                </div>
            `;

            const btn = div.querySelector('.btn-small');
            if (btn && !btn.disabled) {
                btn.onclick = () => {
                    const action = btn.dataset.action;
                    if (action === 'buy') buyAttachment(attachment.id);
                    else if (action === 'equip') equipAttachment(weapon.id, category, attachment.id);
                    else if (action === 'unequip') unequipAttachment(weapon.id, category);
                };
            }

            categoryDiv.appendChild(div);
        });

        // 호환 부착물이 없는 경우
        if (compatibleAttachments.length === 0) {
            const noItemsDiv = document.createElement('div');
            noItemsDiv.className = 'no-attachments';
            noItemsDiv.textContent = '이 무기와 호환되는 부착물이 없습니다.';
            categoryDiv.appendChild(noItemsDiv);
        }

        list.appendChild(categoryDiv);
    });
}

function buyAttachment(attachmentId) {
    const attachment = window.getAttachmentById(attachmentId);
    if (!attachment) return;

    if (gameState.spendCoins(attachment.price)) {
        gameState.data.ownedAttachments.push(attachmentId);
        uiManager.showNotification(`${attachment.name} 구매 완료`);
        uiManager.updateAll();
        renderAttachments();
        checkAndNotifyAchievements();
    } else {
        uiManager.showNotification('포인트가 부족합니다');
    }
}

function equipAttachment(weaponId, category, attachmentId) {
    // 무기별 부착물 저장 구조로 변경
    if (!gameState.data.equippedAttachments[weaponId]) {
        gameState.data.equippedAttachments[weaponId] = {};
    }
    
    const attachment = window.getAttachmentById(attachmentId);
    const weapon = window.getWeaponById(weaponId);
    
    // 호환성 체크
    if (!window.isAttachmentCompatible(weapon, attachment)) {
        uiManager.showNotification('이 부착물은 해당 무기와 호환되지 않습니다.');
        return;
    }
    
    gameState.data.equippedAttachments[weaponId][category] = attachmentId;
    
    // 현재 무기의 스탯 업데이트
    if (weaponId === gameState.data.currentWeapon) {
        const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments[weaponId]);
        maxAmmo = stats.mag;
        currentAmmo = Math.min(currentAmmo, maxAmmo); // 탄창 용량이 줄어든 경우 대응
        reloadSpeed = stats.reloadSpeed;
        updateAmmoDisplay();
    }
    
    uiManager.showNotification(`${attachment.name} 장착 완료`);
    uiManager.updateAll();
    renderAttachments();
    gameState.save();
}

function unequipAttachment(weaponId, category) {
    if (!gameState.data.equippedAttachments[weaponId]) return;
    
    const attachmentId = gameState.data.equippedAttachments[weaponId][category];
    const attachment = window.getAttachmentById(attachmentId);
    
    gameState.data.equippedAttachments[weaponId][category] = null;
    
    // 현재 무기의 스탯 업데이트
    if (weaponId === gameState.data.currentWeapon) {
        const weapon = window.getWeaponById(weaponId);
        const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments[weaponId]);
        maxAmmo = stats.mag;
        currentAmmo = Math.min(currentAmmo, maxAmmo);
        reloadSpeed = stats.reloadSpeed;
        updateAmmoDisplay();
    }
    
    if (attachment) {
        uiManager.showNotification(`${attachment.name} 해제 완료`);
    }
    uiManager.updateAll();
    renderAttachments();
    gameState.save();
}

// 전역 함수로 노출 (UI에서 사용)
window.equipAttachment = equipAttachment;
window.unequipAttachment = unequipAttachment;
window.openAttachmentMenu = (weaponId, slotType) => {
    uiManager.showAttachmentMenu(weaponId, slotType);
};
window.closeAttachmentMenu = () => {
    const menuEl = document.getElementById('attachmentMenu');
    if (menuEl) menuEl.style.display = 'none';
};
window.removeAttachment = (weaponId, slotType) => {
    unequipAttachment(weaponId, slotType);
};

// 업적 확인 및 알림
function checkAndNotifyAchievements() {
    const newAchievements = gameState.checkAndUnlockAchievements();
    newAchievements.forEach(achievement => {
        setTimeout(() => {
            uiManager.showAchievementNotification(achievement);
        }, 500);
    });
    uiManager.updateAll();
}

// 업적 모달
function openAchievementsModal() {
    document.getElementById('achievementsModal').classList.add('active');
    renderAchievements();
}

function closeAchievementsModal() {
    document.getElementById('achievementsModal').classList.remove('active');
}

function renderAchievements() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '';

    window.ACHIEVEMENTS.forEach(achievement => {
        const unlocked = gameState.data.unlockedAchievements.includes(achievement.id);
        const div = document.createElement('div');
        div.className = `achievement-item ${unlocked ? 'unlocked' : 'locked'}`;
        
        div.innerHTML = `
            <div class="achievement-icon">${achievement.icon}</div>
            <div class="achievement-info">
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-desc">${achievement.description}</div>
                <div class="achievement-reward">+${achievement.reward} 포인트</div>
            </div>
            ${unlocked ? '<div class="achievement-check">✓</div>' : ''}
        `;

        list.appendChild(div);
    });
}

// 상점 모달
function openShopModal() {
    document.getElementById('shopModal').classList.add('active');
    renderShop();
}

function closeShopModal() {
    document.getElementById('shopModal').classList.remove('active');
}

function renderShop() {
    const ammoList = document.getElementById('ammoShopList');
    const specialList = document.getElementById('specialShopList');
    
    // 탄약 상점
    ammoList.innerHTML = '';
    window.SHOP_ITEMS.ammo.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">탄약 ${item.amount}발</div>
            </div>
            <div class="shop-item-price">${item.price}</div>
            <button class="btn-small" onclick="buyShopItem('ammo', '${item.id}')">구매</button>
        `;
        ammoList.appendChild(div);
    });
    
    // 특수 아이템
    specialList.innerHTML = '';
    window.SHOP_ITEMS.special.forEach(item => {
        const div = document.createElement('div');
        div.className = 'shop-item';
        div.innerHTML = `
            <div class="shop-item-info">
                <div class="shop-item-name">${item.name}</div>
                <div class="shop-item-desc">${item.description}</div>
            </div>
            <div class="shop-item-price">${item.price}</div>
            <button class="btn-small" onclick="buyShopItem('special', '${item.id}')">구매</button>
        `;
        specialList.appendChild(div);
    });
}

window.buyShopItem = function(category, itemId) {
    const item = window.SHOP_ITEMS[category].find(i => i.id === itemId);
    if (!item) return;

    if (gameState.spendCoins(item.price)) {
        if (category === 'ammo') {
            // 탄약 추가 로직은 나중에 구현
            uiManager.showNotification(`${item.name} 구매 완료!`);
        } else {
            uiManager.showNotification(`${item.name} 구매 완료!`);
        }
        uiManager.updateAll();
        renderShop();
    } else {
        uiManager.showNotification('포인트가 부족합니다');
    }
};

// 설정 모달
function openSettingsModal() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettingsModal() {
    document.getElementById('settingsModal').classList.remove('active');
}

// 일시정지 토글
function togglePause() {
    if (!gameRunning) return;

    gamePaused = !gamePaused;
    
    const pauseOverlay = document.getElementById('pauseOverlay');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (gamePaused) {
        pauseStartTime = Date.now();
        pauseOverlay.classList.add('active');
        pauseBtn.textContent = '재개';
        
        // 타이머 일시정지
        if (gameTimer) {
            clearInterval(gameTimer);
        }
    } else {
        // 일시정지된 시간 계산
        const pausedDuration = Date.now() - pauseStartTime;
        totalPausedTime += pausedDuration;
        
        // 타겟의 생성 시간 조정
        targets.forEach(target => {
            target.createdAt += pausedDuration;
        });
        
        pauseOverlay.classList.remove('active');
        pauseBtn.textContent = '일시정지';
        
        // 타이머 재시작
        if (timeLeft < 999) {
            gameTimer = setInterval(() => {
                timeLeft--;
                updateTimeDisplay();
                
                if (timeLeft <= 0) {
                    endGame();
                }
            }, 1000);
        }
        
        // 게임 루프 재시작
        gameLoop();
    }
}

// 게임 시작
function startGame() {
    if (gameRunning) return;

    gameRunning = true;
    gamePaused = false;
    score = 0;
    hits = 0;
    shots = 0;
    headshots = 0;
    combo = 0;
    maxCombo = 0;
    targets = [];
    totalPausedTime = 0;
    
    // 일시정지 버튼 표시 및 텍스트 초기화
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.style.display = 'inline-block';
    pauseBtn.textContent = '일시정지 (ESC)';
    
    const weapon = window.getWeaponById(gameState.data.currentWeapon);
    const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments);
    maxAmmo = stats.mag;
    currentAmmo = maxAmmo;
    reloadSpeed = stats.reloadSpeed;

    // 훈련 프로그램 또는 게임 모드 설정
    if (gameState.data.trainingProgram && window.TRAINING_PROGRAMS[gameState.data.trainingProgram]) {
        currentSettings = { ...window.TRAINING_PROGRAMS[gameState.data.trainingProgram].settings };
        timeLeft = currentSettings.duration;
    } else {
        currentSettings = getDefaultSettings();
        if (gameState.data.gameMode === 'classic') {
            timeLeft = 60;
        } else if (gameState.data.gameMode === 'precision') {
            timeLeft = 999;
        } else if (gameState.data.gameMode === 'speed') {
            timeLeft = 60;
        }
    }

    // 난이도 적용
    applyDifficulty();

    updateGameDisplay();
    spawnTarget();

    if (timeLeft < 999) {
        gameTimer = setInterval(() => {
            timeLeft--;
            updateTimeDisplay();
            
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);
    }

    gameLoop();
}

function getDefaultSettings() {
    if (gameState.data.gameMode === 'precision') {
        return {
            targetSize: 40,
            targetLifetime: 10000,
            movingTargets: false,
            spawnDelay: 1500
        };
    } else if (gameState.data.gameMode === 'speed') {
        return {
            targetSize: 50,
            targetLifetime: 1000,
            movingTargets: false,
            spawnDelay: 800
        };
    } else {
        return {
            targetSize: 60,
            targetLifetime: 3000,
            movingTargets: false,
            spawnDelay: 1500
        };
    }
}

function applyDifficulty() {
    const difficulty = window.DIFFICULTY_LEVELS[gameState.data.difficulty];
    if (currentSettings) {
        currentSettings.targetSize *= difficulty.targetSizeMultiplier;
        currentSettings.targetLifetime *= difficulty.targetLifetimeMultiplier;
        if (currentSettings.targetSpeed) {
            currentSettings.targetSpeed *= difficulty.targetSpeedMultiplier;
        }
    }
}

function endGame() {
    gameRunning = false;
    gamePaused = false;
    if (gameTimer) clearInterval(gameTimer);
    
    // 일시정지 관련 UI 초기화
    document.getElementById('pauseOverlay').classList.remove('active');
    document.getElementById('pauseBtn').style.display = 'none';
    
    const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;
    const finalScore = Math.round(score * window.DIFFICULTY_LEVELS[gameState.data.difficulty].scoreMultiplier);
    
    gameState.updateStats({
        score: finalScore,
        hits,
        shots,
        headshots,
        accuracy,
        combo: maxCombo
    });

    checkAndNotifyAchievements();
    uiManager.updateAll();
    
    uiManager.showNotification(`완료! 점수: ${finalScore} | 명중률: ${accuracy}%`, 3000);
}

// 재장전
function reload() {
    if (!gameRunning || isReloading || currentAmmo === maxAmmo) return;
    
    isReloading = true;
    reloadProgress = 0;
    
    const reloadInterval = setInterval(() => {
        reloadProgress += 0.05;
        if (reloadProgress >= 1) {
            clearInterval(reloadInterval);
            currentAmmo = maxAmmo;
            isReloading = false;
            reloadProgress = 0;
            updateAmmoDisplay();
        }
    }, reloadSpeed * 50);
}

// 타겟 생성
function spawnTarget() {
    if (!gameRunning) return;

    const padding = 80;
    const x = padding + Math.random() * (canvas.width - padding * 2);
    const y = padding + Math.random() * (canvas.height - padding * 2);
    
    // 특수 타겟 생성 확인
    const specialType = window.shouldSpawnSpecialTarget(1.0);
    if (specialType && Math.random() < 0.15) { // 15% 확률
        const specialTarget = new window.SpecialTarget(specialType, x, y);
        targets.push(specialTarget);
        uiManager.showNotification(`⚡ ${specialTarget.config.name} 출현!`, 1500);
    } else {
        // 일반 타겟
        const size = currentSettings.randomSize 
            ? currentSettings.targetSize * (0.7 + Math.random() * 0.6)
            : currentSettings.targetSize;

        const target = {
            x, y, size,
            createdAt: Date.now(),
            lifetime: currentSettings.targetLifetime,
            isSpecial: false
        };

        if (currentSettings.movingTargets) {
            const angle = Math.random() * Math.PI * 2;
            const speed = currentSettings.targetSpeed || 1;
            target.velocity = {
                x: Math.cos(angle) * speed,
                y: Math.sin(angle) * speed
            };
        }

        targets.push(target);
    }

    const nextDelay = currentSettings.spawnDelay || 1500;
    setTimeout(spawnTarget, nextDelay);
}

// 타겟 업데이트
function updateTargets() {
    const now = Date.now();
    targets = targets.filter(target => {
        const age = now - target.createdAt;
        if (age > target.lifetime) {
            combo = 0;
            updateSessionStats();
            return false;
        }

        // 움직이는 타겟
        if (target.velocity) {
            target.x += target.velocity.x;
            target.y += target.velocity.y;

            // 화면 경계 반사
            if (target.x < target.size || target.x > canvas.width - target.size) {
                target.velocity.x *= -1;
            }
            if (target.y < target.size || target.y > canvas.height - target.size) {
                target.velocity.y *= -1;
            }
        }
        
        return true;
    });
}

// 게임 루프
function gameLoop() {
    if (!gameRunning) {
        renderer.clear();
        return;
    }

    if (gamePaused) {
        return; // 일시정지 중에는 루프 중단
    }

    renderer.clear();
    updateTargets();

    // 타겟 그리기
    const now = Date.now();
    targets.forEach(target => {
        const age = now - target.createdAt;
        const ageRatio = age / target.lifetime;
        renderer.drawTarget(target, ageRatio);
    });

    // 재장전 바
    if (isReloading) {
        renderer.drawReloadBar(reloadProgress);
    }

    // 크로스헤어 그리기
    renderer.drawCrosshair(
        gameState.data.crosshairStyle,
        gameState.data.crosshairColor,
        gameState.data.crosshairSize
    );

    requestAnimationFrame(gameLoop);
}

// 캔버스 클릭 처리
function handleCanvasClick(e) {
    if (!gameRunning || gamePaused || currentAmmo <= 0 || isReloading) return;

    currentAmmo--;
    shots++;
    updateAmmoDisplay();

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    let hit = false;
    let hitScore = 0;
    let isHeadshot = false;

    for (let i = targets.length - 1; i >= 0; i--) {
        const target = targets[i];
        
        // 특수 타겟 처리
        if (target.isSpecial && target.config) {
            const hitResult = checkSpecialTargetHit(target, clickX, clickY);
            if (hitResult.hit) {
                hit = true;
                renderer.createHitEffect(clickX, clickY, hitResult.isHead);
                
                // 타겟에 히트 기록
                const completed = target.hit(hitResult.isHead);
                
                if (completed) {
                    // 특수 타겟 완료
                    handleSpecialTargetComplete(target, i);
                }
                break;
            }
        } else {
            // 일반 타겟 처리
            const dist = Math.sqrt((clickX - target.x) ** 2 + (clickY - target.y) ** 2);

            if (dist <= target.size) {
                hit = true;
                hits++;
                combo++;
                if (combo > maxCombo) maxCombo = combo;

                if (dist <= target.size * 0.25) {
                    hitScore = 30;
                    isHeadshot = true;
                    headshots++;
                    gameState.addXP(20);
                    gameState.addCoins(10);
                } else if (dist <= target.size * 0.6) {
                    hitScore = 20;
                    gameState.addXP(10);
                    gameState.addCoins(5);
                } else {
                    hitScore = 10;
                    gameState.addXP(10);
                    gameState.addCoins(5);
                }

                if (combo > 1) {
                    hitScore += combo;
                    gameState.addXP(5);
                }

                score += hitScore;
                targets.splice(i, 1);
                renderer.createHitEffect(clickX, clickY, isHeadshot);
                break;
            }
        }
    }

    if (!hit) {
        combo = 0;
    }

    updateGameDisplay();
    updateSessionStats();
    checkAndNotifyAchievements();
}

// 특수 타겟 히트 체크
function checkSpecialTargetHit(target, clickX, clickY) {
    const x = target.x;
    const y = target.y;
    const size = target.size;
    
    // 머리 체크
    const headRadius = size * 0.15;
    const headDist = Math.sqrt((clickX - x) ** 2 + (clickY - (y - size * 0.35)) ** 2);
    if (headDist <= headRadius) {
        return { hit: true, isHead: true };
    }
    
    // 몸통 체크
    if (clickX >= x - size * 0.2 && clickX <= x + size * 0.2 &&
        clickY >= y - size * 0.2 && clickY <= y + size * 0.3) {
        return { hit: true, isHead: false };
    }
    
    return { hit: false, isHead: false };
}

// 특수 타겟 완료 처리
function handleSpecialTargetComplete(target, targetIndex) {
    hits++;
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    
    // 점수 및 보상
    const hitScore = target.config.points;
    score += hitScore;
    gameState.addXP(target.config.xpReward);
    gameState.addCoins(target.config.coinReward);
    
    // 드롭 처리
    if (Math.random() < target.config.dropChance) {
        const drop = window.getRandomDrop(gameState.data.level, gameState.data.ownedAttachments);
        handleDrop(drop);
    }
    
    targets.splice(targetIndex, 1);
    uiManager.showNotification(`🎯 ${target.config.name} 완료! +${hitScore}점`, 2000);
}

// 드롭 처리
function handleDrop(drop) {
    if (drop.type === 'coins') {
        gameState.addCoins(drop.amount);
        uiManager.showNotification(`💰 ${drop.name}: +${drop.amount} 포인트`, 1500);
    } else if (drop.type === 'attachment') {
        // 랜덤 부착물 지급 (아직 소유하지 않은 것 중에서)
        const allAttachments = [];
        for (let category in window.ATTACHMENTS) {
            window.ATTACHMENTS[category].forEach(att => {
                if (!gameState.data.ownedAttachments.includes(att.id) && 
                    att.level <= gameState.data.level) {
                    allAttachments.push(att);
                }
            });
        }
        
        if (allAttachments.length > 0) {
            const randomAtt = allAttachments[Math.floor(Math.random() * allAttachments.length)];
            gameState.data.ownedAttachments.push(randomAtt.id);
            gameState.save();
            uiManager.showNotification(`🎁 ${randomAtt.name} 획득!`, 2500);
        } else {
            // 모든 부착물을 소유한 경우 포인트 지급
            gameState.addCoins(100);
            uiManager.showNotification(`💰 보상: +100 포인트`, 1500);
        }
    }
    
    updateGameDisplay();
    updateSessionStats();
    checkAndNotifyAchievements();
}

// 디스플레이 업데이트
function updateGameDisplay() {
    document.getElementById('scoreDisplay').textContent = score;
    const accuracy = shots > 0 ? Math.round((hits / shots) * 100) : 0;
    document.getElementById('accuracyDisplay').textContent = accuracy + '%';
}

function updateTimeDisplay() {
    if (timeLeft >= 999) {
        document.getElementById('timeDisplay').textContent = '∞';
    } else {
        document.getElementById('timeDisplay').textContent = timeLeft;
    }
}

function updateAmmoDisplay() {
    document.getElementById('ammoDisplay').textContent = `${currentAmmo}/${maxAmmo}`;
}

function updateSessionStats() {
    uiManager.updateSessionStats(hits, headshots, combo);
}

// 게임 초기화
function resetGame() {
    if (confirm('모든 진행 상황을 초기화하시겠습니까?')) {
        gameState.reset();
        location.reload();
    }
}

// 게임 시작
init();
