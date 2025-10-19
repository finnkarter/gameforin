// 특수 타겟 정의
export const SPECIAL_TARGET_TYPES = {
    mozambique: {
        id: 'mozambique',
        name: '모잠비크 타겟',
        description: '몸통 2발 + 머리 1발',
        requiredHits: {
            body: 2,
            head: 1
        },
        points: 150,
        coinReward: 50,
        xpReward: 100,
        dropChance: 0.8, // 80% 확률로 드롭
        spawnChance: 0.15, // 15% 확률로 출현
        lifetime: 8000,
        size: 80
    },
    rapid: {
        id: 'rapid',
        name: '고속 타겟',
        description: '5초 안에 3발 명중',
        requiredHits: {
            any: 3
        },
        timeLimit: 5000,
        points: 100,
        coinReward: 30,
        xpReward: 60,
        dropChance: 0.5,
        spawnChance: 0.10,
        lifetime: 5000,
        size: 60
    },
    precision: {
        id: 'precision',
        name: '정밀 타겟',
        description: '헤드샷만 3발',
        requiredHits: {
            head: 3
        },
        points: 200,
        coinReward: 60,
        xpReward: 120,
        dropChance: 0.9,
        spawnChance: 0.08,
        lifetime: 10000,
        size: 70
    }
};

export class SpecialTarget {
    constructor(type, x, y) {
        this.type = type;
        this.config = SPECIAL_TARGET_TYPES[type];
        this.x = x;
        this.y = y;
        this.size = this.config.size;
        this.createdAt = Date.now();
        this.lifetime = this.config.lifetime;
        this.hits = {
            body: 0,
            head: 0,
            any: 0
        };
        this.isSpecial = true;
        this.completed = false;
    }

    hit(isHead) {
        if (this.completed) return false;

        if (isHead) {
            this.hits.head++;
        } else {
            this.hits.body++;
        }
        this.hits.any++;

        return this.checkCompletion();
    }

    checkCompletion() {
        const req = this.config.requiredHits;
        
        if (req.body !== undefined && this.hits.body < req.body) {
            return false;
        }
        if (req.head !== undefined && this.hits.head < req.head) {
            return false;
        }
        if (req.any !== undefined && this.hits.any < req.any) {
            return false;
        }

        this.completed = true;
        return true;
    }

    getProgress() {
        const req = this.config.requiredHits;
        let progress = '';
        
        if (req.body !== undefined) {
            progress += `몸통: ${this.hits.body}/${req.body} `;
        }
        if (req.head !== undefined) {
            progress += `머리: ${this.hits.head}/${req.head}`;
        }
        if (req.any !== undefined) {
            progress += `${this.hits.any}/${req.any}`;
        }
        
        return progress.trim();
    }
}

export function shouldSpawnSpecialTarget(difficulty = 1.0) {
    const rand = Math.random();
    
    for (let type in SPECIAL_TARGET_TYPES) {
        const config = SPECIAL_TARGET_TYPES[type];
        if (rand < config.spawnChance * difficulty) {
            return type;
        }
    }
    
    return null;
}

