// 타르코프 스타일 타겟 타입
const TARGET_TYPES = {
    scav: {
        id: 'scav',
        name: '스캐브',
        health: 60,
        size: 60,
        color: '#666',
        borderColor: '#999',
        speed: 1.0,
        reward: {
            points: 15,
            coins: 5,
            xp: 10
        },
        spawnWeight: 70, // 70% 확률
        ai: {
            movePattern: 'basic',
            reactionTime: 800,
            accuracy: 0.3
        }
    },
    pmc: {
        id: 'pmc',
        name: 'PMC',
        health: 100,
        size: 45,
        color: '#444',
        borderColor: '#777',
        speed: 1.5,
        reward: {
            points: 50,
            coins: 20,
            xp: 30
        },
        spawnWeight: 25, // 25% 확률
        ai: {
            movePattern: 'smart',
            reactionTime: 400,
            accuracy: 0.7
        }
    },
    boss: {
        id: 'boss',
        name: '보스',
        health: 200,
        size: 55,
        color: '#333',
        borderColor: '#555',
        speed: 1.2,
        reward: {
            points: 150,
            coins: 50,
            xp: 100
        },
        spawnWeight: 5, // 5% 확률
        ai: {
            movePattern: 'aggressive',
            reactionTime: 200,
            accuracy: 0.9
        }
    }
};

// 타겟 클래스
class TarkovTarget {
    constructor(type, x, y, settings = {}) {
        this.type = type;
        this.config = TARGET_TYPES[type];
        this.x = x;
        this.y = y;
        this.size = settings.targetSize || this.config.size;
        this.health = this.config.health;
        this.maxHealth = this.config.health;
        this.createdAt = Date.now();
        this.lifetime = settings.targetLifetime || 5000;
        this.isSpecial = false;
        this.isDead = false;
        
        // 움직임 관련
        if (settings.movingTargets) {
            this.initMovement();
        }
        
        // AI 관련
        this.lastMoveTime = Date.now();
        this.moveDirection = Math.random() * Math.PI * 2;
        this.nextMoveTime = Date.now() + Math.random() * 2000;
    }
    
    initMovement() {
        const angle = Math.random() * Math.PI * 2;
        const speed = this.config.speed;
        this.velocity = {
            x: Math.cos(angle) * speed,
            y: Math.sin(angle) * speed
        };
    }
    
    update(deltaTime, canvasWidth, canvasHeight) {
        if (this.isDead) return;
        
        const now = Date.now();
        
        // AI 기반 움직임
        if (now > this.nextMoveTime) {
            this.updateAI();
            this.nextMoveTime = now + (1000 + Math.random() * 1500);
        }
        
        // 위치 업데이트
        if (this.velocity) {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            
            // 경계 반사
            if (this.x < this.size || this.x > canvasWidth - this.size) {
                this.velocity.x *= -1;
            }
            if (this.y < this.size || this.y > canvasHeight - this.size) {
                this.velocity.y *= -1;
            }
            
            // 경계 내 유지
            this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
            this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
        }
    }
    
    updateAI() {
        const aiConfig = this.config.ai;
        
        switch (aiConfig.movePattern) {
            case 'basic':
                // 기본 랜덤 움직임
                if (Math.random() < 0.3) {
                    this.changeDirection();
                }
                break;
                
            case 'smart':
                // 더 자주 방향 변경
                if (Math.random() < 0.6) {
                    this.changeDirection();
                }
                break;
                
            case 'aggressive':
                // 매우 빠른 방향 변경
                if (Math.random() < 0.8) {
                    this.changeDirection();
                }
                break;
        }
    }
    
    changeDirection() {
        if (!this.velocity) {
            this.initMovement();
        } else {
            const angle = Math.random() * Math.PI * 2;
            const speed = this.config.speed;
            this.velocity.x = Math.cos(angle) * speed;
            this.velocity.y = Math.sin(angle) * speed;
        }
    }
    
    hit(damage = 35, isHeadshot = false) {
        if (this.isDead) return false;
        
        let actualDamage = damage;
        if (isHeadshot) {
            actualDamage *= 2; // 헤드샷 2배 데미지
        }
        
        this.health -= actualDamage;
        
        if (this.health <= 0) {
            this.isDead = true;
            return true; // 킬 확정
        }
        
        return false; // 아직 살아있음
    }
    
    getHealthPercentage() {
        return Math.max(0, this.health / this.maxHealth);
    }
    
    shouldDespawn() {
        const age = Date.now() - this.createdAt;
        return age > this.lifetime || this.isDead;
    }
}

// 타겟 스포너
function spawnRandomTarget(x, y, settings = {}) {
    const rand = Math.random() * 100;
    let cumulativeWeight = 0;
    
    for (let type in TARGET_TYPES) {
        cumulativeWeight += TARGET_TYPES[type].spawnWeight;
        if (rand <= cumulativeWeight) {
            return new TarkovTarget(type, x, y, settings);
        }
    }
    
    // 기본값
    return new TarkovTarget('scav', x, y, settings);
}

// 전역 변수로 노출
window.TARGET_TYPES = TARGET_TYPES;
window.TarkovTarget = TarkovTarget;
window.spawnRandomTarget = spawnRandomTarget;