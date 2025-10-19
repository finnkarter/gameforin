// 업적 시스템
export const ACHIEVEMENTS = [
    { 
        id: 'first_shot', 
        name: '첫 발', 
        description: '첫 타겟 명중', 
        icon: '🎯',
        condition: (stats) => stats.totalHits >= 1,
        reward: 50
    },
    { 
        id: 'sharpshooter', 
        name: '명사수', 
        description: '명중률 80% 이상 달성', 
        icon: '🏆',
        condition: (stats) => stats.bestAccuracy >= 80,
        reward: 100
    },
    { 
        id: 'headhunter', 
        name: '헤드헌터', 
        description: '헤드샷 50회', 
        icon: '💀',
        condition: (stats) => stats.totalHeadshots >= 50,
        reward: 150
    },
    { 
        id: 'combo_master', 
        name: '콤보 마스터', 
        description: '10 연속 명중', 
        icon: '⚡',
        condition: (stats) => stats.bestCombo >= 10,
        reward: 200
    },
    { 
        id: 'speed_demon', 
        name: '스피드 데몬', 
        description: '스피드 모드 점수 500 이상', 
        icon: '🏃',
        condition: (stats) => stats.speedModeHighScore >= 500,
        reward: 150
    },
    { 
        id: 'precision_king', 
        name: '정밀왕', 
        description: '프리시전 모드 점수 1000 이상', 
        icon: '👑',
        condition: (stats) => stats.precisionModeHighScore >= 1000,
        reward: 150
    },
    { 
        id: 'level_5', 
        name: '중급자', 
        description: '레벨 5 달성', 
        icon: '⭐',
        condition: (stats) => stats.level >= 5,
        reward: 250
    },
    { 
        id: 'level_10', 
        name: '전문가', 
        description: '레벨 10 달성', 
        icon: '🌟',
        condition: (stats) => stats.level >= 10,
        reward: 500
    },
    { 
        id: 'millionaire', 
        name: '백만장자', 
        description: '1000 포인트 획득', 
        icon: '💰',
        condition: (stats) => stats.totalCoinsEarned >= 1000,
        reward: 300
    },
    { 
        id: 'collector', 
        name: '수집가', 
        description: '모든 부착물 구매', 
        icon: '🎁',
        condition: (stats) => stats.ownedAttachments >= 14,
        reward: 400
    },
    { 
        id: 'arsenal', 
        name: '무기고', 
        description: '모든 무기 해금', 
        icon: '🔫',
        condition: (stats) => stats.level >= 10,
        reward: 500
    },
    { 
        id: 'marathon', 
        name: '마라톤', 
        description: '총 1000발 발사', 
        icon: '🎖️',
        condition: (stats) => stats.totalShots >= 1000,
        reward: 200
    }
];

export function checkAchievements(stats, unlockedAchievements) {
    const newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
        if (!unlockedAchievements.includes(achievement.id)) {
            if (achievement.condition(stats)) {
                newAchievements.push(achievement);
            }
        }
    });
    
    return newAchievements;
}

