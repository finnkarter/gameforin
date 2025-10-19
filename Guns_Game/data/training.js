// 훈련 프로그램
export const TRAINING_PROGRAMS = {
    tracking: {
        name: '추적 훈련',
        description: '움직이는 타겟 추적',
        icon: '🎯',
        settings: {
            duration: 60,
            targetSpeed: 2,
            targetSize: 50,
            targetLifetime: 5000,
            movingTargets: true
        }
    },
    flicking: {
        name: '플리킹 훈련',
        description: '빠른 조준 전환',
        icon: '⚡',
        settings: {
            duration: 60,
            targetSpeed: 0,
            targetSize: 60,
            targetLifetime: 1500,
            movingTargets: false,
            spawnDelay: 500
        }
    },
    precision: {
        name: '정밀도 훈련',
        description: '작은 타겟 명중',
        icon: '🎪',
        settings: {
            duration: 90,
            targetSpeed: 0,
            targetSize: 30,
            targetLifetime: 8000,
            movingTargets: false
        }
    },
    reaction: {
        name: '반응속도 훈련',
        description: '순간 반응 훈련',
        icon: '💨',
        settings: {
            duration: 45,
            targetSpeed: 0,
            targetSize: 70,
            targetLifetime: 800,
            movingTargets: false,
            spawnDelay: 300
        }
    },
    endurance: {
        name: '지구력 훈련',
        description: '장시간 집중력',
        icon: '💪',
        settings: {
            duration: 180,
            targetSpeed: 1,
            targetSize: 55,
            targetLifetime: 3000,
            movingTargets: true
        }
    },
    mixed: {
        name: '종합 훈련',
        description: '다양한 패턴 혼합',
        icon: '🎲',
        settings: {
            duration: 120,
            targetSpeed: 1.5,
            targetSize: 50,
            targetLifetime: 2500,
            movingTargets: true,
            randomSize: true
        }
    }
};

export const DIFFICULTY_LEVELS = {
    easy: {
        name: '쉬움',
        targetSizeMultiplier: 1.3,
        targetSpeedMultiplier: 0.7,
        targetLifetimeMultiplier: 1.5,
        scoreMultiplier: 0.8
    },
    normal: {
        name: '보통',
        targetSizeMultiplier: 1.0,
        targetSpeedMultiplier: 1.0,
        targetLifetimeMultiplier: 1.0,
        scoreMultiplier: 1.0
    },
    hard: {
        name: '어려움',
        targetSizeMultiplier: 0.8,
        targetSpeedMultiplier: 1.3,
        targetLifetimeMultiplier: 0.7,
        scoreMultiplier: 1.5
    },
    extreme: {
        name: '극한',
        targetSizeMultiplier: 0.6,
        targetSpeedMultiplier: 1.6,
        targetLifetimeMultiplier: 0.5,
        scoreMultiplier: 2.0
    }
};

