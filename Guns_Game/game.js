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
        
        if (weapon.level > gameState.data.level) {
            div.classList.add('locked');
        }
        
        if (weapon.id === gameState.data.currentWeapon) {
            div.classList.add('active');
        }

        div.innerHTML = `
            <div class="weapon-name">${weapon.name}</div>
            <div class="weapon-stats">
                ${weapon.type} | DMG: ${weapon.damage} | ACC: ${weapon.accuracy}%<br>
                탄창: ${weapon.mag}발
            </div>
            ${weapon.level > gameState.data.level ? `<div class="weapon-level-req">레벨 ${weapon.level} 필요</div>` : ''}
        `;

        if (weapon.level <= gameState.data.level) {
            div.onclick = () => selectWeapon(weapon.id);
        }

        list.appendChild(div);
    });
}

// 무기 선택
function selectWeapon(weaponId) {
    gameState.data.currentWeapon = weaponId;
    const weapon = window.getWeaponById(weaponId);
    const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments);
    maxAmmo = stats.mag;
    currentAmmo = maxAmmo;
    reloadSpeed = stats.reloadSpeed;
    renderWeaponList();
    updateCurrentWeaponStats();
    updateAmmoDisplay();
    gameState.save();
}

// 현재 무기 스탯 업데이트
function updateCurrentWeaponStats() {
    const weapon = window.getWeaponById(gameState.data.currentWeapon);
    const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments);
    
    const statsDiv = document.getElementById('currentWeaponStats');
    statsDiv.innerHTML = `
        <div class="stat-item">
            <span class="stat-label">무기</span>
            <span class="stat-value">${weapon.name}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">데미지</span>
            <span class="stat-value">${stats.damage}</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">정확도</span>
            <span class="stat-value">${stats.accuracy}%</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">탄창</span>
            <span class="stat-value">${stats.mag}</span>
        </div>
    `;
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
    list.innerHTML = '';

    for (let category in window.ATTACHMENTS) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'attachment-category';
        
        categoryDiv.innerHTML = `<div class="category-title">${window.CATEGORY_NAMES[category]}</div>`;

        window.ATTACHMENTS[category].forEach(attachment => {
            const div = document.createElement('div');
            div.className = 'attachment-item';
            
            const owned = gameState.data.ownedAttachments.includes(attachment.id);
            const equipped = gameState.data.equippedAttachments[category] === attachment.id;
            
            if (owned) div.classList.add('owned');
            if (equipped) div.classList.add('equipped');

            let effects = [];
            if (attachment.accuracy) effects.push(`정확도 +${attachment.accuracy}%`);
            if (attachment.damage) effects.push(`데미지 ${attachment.damage > 0 ? '+' : ''}${attachment.damage}`);
            if (attachment.magBonus) effects.push(`탄창 +${attachment.magBonus}%`);
            if (attachment.reloadBonus) effects.push(`재장전 +${attachment.reloadBonus}%`);

            const locked = attachment.level > gameState.data.level;

            div.innerHTML = `
                <div class="attachment-info">
                    <div class="attachment-name">${attachment.name}</div>
                    <div class="attachment-effects">${effects.join(', ')}</div>
                    ${locked ? `<div style="color: #666; font-size: 10px;">레벨 ${attachment.level} 필요</div>` : ''}
                </div>
                ${!locked ? `
                    ${!owned ? `<div class="attachment-price">${attachment.price}</div>` : ''}
                    <button class="btn-small ${equipped ? 'equipped' : ''}" 
                        data-action="${owned ? (equipped ? 'unequip' : 'equip') : 'buy'}"
                        data-category="${category}"
                        data-id="${attachment.id}">
                        ${owned ? (equipped ? '해제' : '장착') : '구매'}
                    </button>
                ` : ''}
            `;

            const btn = div.querySelector('.btn-small');
            if (btn) {
                btn.onclick = () => {
                    const action = btn.dataset.action;
                    if (action === 'buy') buyAttachment(attachment.id);
                    else if (action === 'equip') equipAttachment(category, attachment.id);
                    else if (action === 'unequip') unequipAttachment(category);
                };
            }

            categoryDiv.appendChild(div);
        });

        list.appendChild(categoryDiv);
    }
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

function equipAttachment(category, attachmentId) {
    gameState.data.equippedAttachments[category] = attachmentId;
    const weapon = window.getWeaponById(gameState.data.currentWeapon);
    const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments);
    maxAmmo = stats.mag;
    currentAmmo = maxAmmo;
    reloadSpeed = stats.reloadSpeed;
    uiManager.updateAll();
    renderAttachments();
    updateAmmoDisplay();
    gameState.save();
}

function unequipAttachment(category) {
    gameState.data.equippedAttachments[category] = null;
    const weapon = window.getWeaponById(gameState.data.currentWeapon);
    const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments);
    maxAmmo = stats.mag;
    currentAmmo = maxAmmo;
    reloadSpeed = stats.reloadSpeed;
    uiManager.updateAll();
    renderAttachments();
    updateAmmoDisplay();
    gameState.save();
}

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
    
    // 특수 타겟 생성 확인 (5% 확률 new!)
    const specialType = window.shouldSpawnSpecialTarget(1.0);
    if (specialType && Math.random() < 0.05) {
        const specialTarget = new window.SpecialTarget(specialType, x, y);
        targets.push(specialTarget);
        uiManager.showNotification(`⚡ ${specialTarget.config.name} 출현!`, 1500);
    } else {
        // 타르코프 스타일 타겟 생성 (85% 확률)
        if (Math.random() < 0.85) {
            const tarkovTarget = window.spawnRandomTarget(x, y, currentSettings);
            targets.push(tarkovTarget);
            
            // 보스 출현시 알림
            if (tarkovTarget.config.id === 'boss') {
                uiManager.showNotification(`🔥 보스 출현!`, 2000);
            } else if (tarkovTarget.config.id === 'pmc') {
                uiManager.showNotification(`⚠️ PMC 발견!`, 1000);
            }
        } else {
            // 기존 일반 타겟 (10% 확률)
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
        } //end of new fix
    }

    const nextDelay = currentSettings.spawnDelay || 1500;
    setTimeout(spawnTarget, nextDelay);
}

// 타겟 업데이트
function updateTargets() {
    const now = Date.now();
    targets = targets.filter(target => {
        // 타르코프 타겟인지 확인(new!)
        if (target.update && typeof target.update === 'function') {
            target.update(16, canvas.width, canvas.height); // 16ms delta time
            return !target.shouldDespawn();
        } // end of new!
        
        // 기존 타겟 처리
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
        
        // 타르코프 타겟 처리 new!
        if (target.config && target.config.id) {
            const dist = Math.sqrt((clickX - target.x) ** 2 + (clickY - target.y) ** 2);
            
            if (dist <= target.size) {
                hit = true;
                
                // 헤드샷 체크 (내부 원)
                isHeadshot = dist <= target.size * 0.3;
                
                // 무기 데미지 계산
                const weapon = window.getWeaponById(gameState.data.currentWeapon);
                const stats = window.calculateWeaponStats(weapon, gameState.data.equippedAttachments);
                const damage = stats.damage;
                
                // 타겟에 데미지 적용
                const killed = target.hit(damage, isHeadshot);
                
                if (killed) {
                    // 타겟 처치 완료
                    hits++;
                    combo++;
                    if (combo > maxCombo) maxCombo = combo;
                    if (isHeadshot) headshots++;
                    
                    // 보상 적용
                    const reward = target.config.reward;
                    hitScore = reward.points;
                    gameState.addXP(reward.xp);
                    gameState.addCoins(reward.coins);
                    
                    // 콤보 보너스
                    if (combo > 1) {
                        const comboBonus = combo * 2;
                        hitScore += comboBonus;
                        gameState.addXP(comboBonus);
                    }
                    
                    targets.splice(i, 1);
                    uiManager.showNotification(`${target.config.name} 처치! +${hitScore}점`, 1000);
                } else {
                    // 타겟이 아직 살아있음
                    hitScore = 5; // 히트 점수
                    gameState.addXP(2);
                    uiManager.showNotification(`히트! HP: ${Math.ceil(target.health)}`, 500);
                }
                
                renderer.createHitEffect(clickX, clickY, isHeadshot);
                break;
            }
        } // end of new!
        // 특수 타겟 처리 new fix
        else if (target.isSpecial && target.config) {
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
