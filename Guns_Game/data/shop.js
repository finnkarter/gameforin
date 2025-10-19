// 상점 아이템
export const SHOP_ITEMS = {
    ammo: [
        { id: 'ammo_small', name: '탄약 팩 (소)', amount: 50, price: 20 },
        { id: 'ammo_medium', name: '탄약 팩 (중)', amount: 150, price: 50 },
        { id: 'ammo_large', name: '탄약 팩 (대)', amount: 300, price: 90 },
        { id: 'ammo_mega', name: '탄약 팩 (특대)', amount: 500, price: 140 }
    ],
    special: [
        { id: 'medkit', name: '회복 키트', description: '체력 50% 회복', price: 30 },
        { id: 'boost', name: '경험치 부스터', description: '다음 게임 경험치 2배', price: 100 },
        { id: 'luck', name: '행운의 부적', description: '특수 타겟 출현율 증가', price: 150 }
    ]
};

export const DROP_CHANCES = {
    common: 0.40,      // 40% - 소량 포인트
    uncommon: 0.30,    // 30% - 중간 포인트
    rare: 0.20,        // 20% - 부착물 or 많은 포인트
    epic: 0.08,        // 8% - 좋은 부착물
    legendary: 0.02    // 2% - 최고급 부착물
};

export function getRandomDrop(playerLevel, unlockedAttachments) {
    const rand = Math.random();
    let dropType;
    
    if (rand < DROP_CHANCES.legendary) {
        dropType = 'legendary';
    } else if (rand < DROP_CHANCES.legendary + DROP_CHANCES.epic) {
        dropType = 'epic';
    } else if (rand < DROP_CHANCES.legendary + DROP_CHANCES.epic + DROP_CHANCES.rare) {
        dropType = 'rare';
    } else if (rand < DROP_CHANCES.legendary + DROP_CHANCES.epic + DROP_CHANCES.rare + DROP_CHANCES.uncommon) {
        dropType = 'uncommon';
    } else {
        dropType = 'common';
    }
    
    return generateDrop(dropType, playerLevel, unlockedAttachments);
}

function generateDrop(rarity, playerLevel, unlockedAttachments) {
    const drops = {
        common: {
            type: 'coins',
            amount: 10,
            rarity: 'common',
            name: '소량 포인트',
            color: '#888'
        },
        uncommon: {
            type: 'coins',
            amount: 25,
            rarity: 'uncommon',
            name: '중간 포인트',
            color: '#9a9a9a'
        },
        rare: {
            type: Math.random() > 0.5 ? 'coins' : 'attachment',
            amount: 50,
            rarity: 'rare',
            name: '많은 포인트',
            color: '#afafaf'
        },
        epic: {
            type: 'attachment',
            rarity: 'epic',
            name: '부착물',
            color: '#c0c0c0'
        },
        legendary: {
            type: 'attachment',
            rarity: 'legendary',
            name: '고급 부착물',
            color: '#d4d4d4'
        }
    };
    
    return drops[rarity];
}

