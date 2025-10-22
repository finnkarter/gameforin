// 타르코프 스타일 세분화된 부착물 데이터
const ATTACHMENTS = {
    // 조준경 (Sights)
    sights: [
        // 아이언사이트
        { id: 'iron_sight', name: '기본 아이언사이트', accuracy: 0, price: 0, level: 1, type: 'iron', compatible: ['권총', '기관단총', '돌격소총'] },
        
        // 리플렉스 사이트
        { id: 'eotech_xps3', name: 'EOTech XPS3-0', accuracy: 4, price: 120, level: 2, type: 'reflex', compatible: ['기관단총', '돌격소총'] },
        { id: 'aimpoint_t1', name: 'Aimpoint Micro T-1', accuracy: 3, price: 80, level: 2, type: 'reflex', compatible: ['권총', '기관단총', '돌격소총'] },
        { id: 'okp7', name: 'OKP-7 도브테일', accuracy: 2, price: 45, level: 1, type: 'reflex', compatible: ['돌격소총'] },
        { id: 'cobra', name: 'Cobra EKP-8-18', accuracy: 3, price: 65, level: 2, type: 'reflex', compatible: ['돌격소총'] },
        
        // 홀로그래픽
        { id: 'eotech_553', name: 'EOTech 553', accuracy: 5, price: 180, level: 3, type: 'holo', compatible: ['기관단총', '돌격소총'] },
        { id: 'razor', name: 'Vortex Razor AMG UH-1', accuracy: 6, price: 220, level: 4, type: 'holo', compatible: ['돌격소총'] },
        
        // 스코프
        { id: 'acog_ta31', name: 'Trijicon ACOG TA31RCO', accuracy: 8, price: 350, level: 5, type: 'scope', compatible: ['돌격소총'] },
        { id: 'elcan_specter', name: 'ELCAN SpecterDR', accuracy: 9, price: 420, level: 6, type: 'scope', compatible: ['돌격소총'] },
        { id: 'vudu', name: 'EOTech Vudu 1-6x24', accuracy: 10, price: 480, level: 7, type: 'scope', compatible: ['돌격소총'] },
        { id: 'leupold_mk4', name: 'Leupold Mark 4 LR/T', accuracy: 15, price: 800, level: 8, type: 'sniper_scope', compatible: ['저격소총'] },
        { id: 'nightforce', name: 'Nightforce ATACR 7-35x56', accuracy: 18, price: 1200, level: 9, type: 'sniper_scope', compatible: ['저격소총'] }
    ],
    
    // 총열 부착물 (Barrel)
    barrel: [
        // 소음기 (9mm)
        { id: 'rotor43_9mm', name: 'Rotor 43 9mm', accuracy: 3, damage: -3, stealth: 80, price: 180, level: 3, caliber: '9mm', compatible: ['권총', '기관단총'] },
        { id: 'gemtech_9mm', name: 'Gemtech ONE 9mm', accuracy: 2, damage: -2, stealth: 70, price: 140, level: 2, caliber: '9mm', compatible: ['권총', '기관단총'] },
        
        // 소음기 (5.56/.223)
        { id: 'saker556', name: 'SilencerCo Saker 556', accuracy: 4, damage: -4, stealth: 85, price: 320, level: 5, caliber: '556', compatible: ['돌격소총'] },
        { id: 'socom556', name: 'Surefire SOCOM556-RC2', accuracy: 3, damage: -3, stealth: 75, price: 280, level: 4, caliber: '556', compatible: ['돌격소총'] },
        
        // 소음기 (7.62x39)
        { id: 'pbs1', name: 'PBS-1 소음기', accuracy: 2, damage: -5, stealth: 70, price: 200, level: 4, caliber: '762x39', compatible: ['돌격소총'] },
        
        // 소음기 (.308/7.62x51)
        { id: 'gemtech308', name: 'Gemtech GM-300BLK', accuracy: 5, damage: -6, stealth: 90, price: 450, level: 7, caliber: '308', compatible: ['저격소총'] },
        
        // 머즐 브레이크
        { id: 'dtk1', name: 'AK DTK-1', accuracy: 4, recoil: -15, price: 85, level: 3, compatible: ['돌격소총'] },
        { id: 'rrd4c', name: 'Rainer Arms RRD-4C', accuracy: 5, recoil: -20, price: 120, level: 4, compatible: ['돌격소총'] },
        { id: 'lantac_dragon', name: 'Lantac Dragon', accuracy: 6, recoil: -25, price: 160, level: 5, compatible: ['돌격소총'] },
        
        // 컴펜세이터
        { id: 'kac_qdc', name: 'KAC QDC', accuracy: 7, recoil: -30, price: 200, level: 6, compatible: ['돌격소총'] },
        { id: 'jp_tank', name: 'JP Tank Brake', accuracy: 8, recoil: -35, price: 280, level: 7, compatible: ['저격소총'] }
    ],
    
    // 탄창 (Magazine)
    magazine: [
        // 권총 탄창
        { id: 'glock_17rd', name: 'Glock 17발 탄창', magBonus: 0, price: 25, level: 1, weaponType: '권총', compatible: ['glock17'] },
        { id: 'glock_33rd', name: 'Glock 33발 확장탄창', magBonus: 94, price: 80, level: 3, weaponType: '권총', compatible: ['glock17'] },
        { id: 'deagle_7rd', name: 'Desert Eagle 7발 탄창', magBonus: 0, price: 30, level: 1, weaponType: '권총', compatible: ['deagle'] },
        
        // 기관단총 탄창
        { id: 'mp5_30rd', name: 'MP5 30발 탄창', magBonus: 0, price: 40, level: 1, weaponType: '기관단총', compatible: ['mp5'] },
        { id: 'mp5_40rd', name: 'MP5 40발 확장탄창', magBonus: 33, price: 90, level: 4, weaponType: '기관단총', compatible: ['mp5'] },
        { id: 'p90_50rd', name: 'P90 50발 탄창', magBonus: 0, price: 60, level: 1, weaponType: '기관단총', compatible: ['p90'] },
        
        // 돌격소총 탄창 (5.56)
        { id: 'stanag_30rd', name: 'STANAG 30발 탄창', magBonus: 0, price: 35, level: 1, weaponType: '돌격소총', compatible: ['m4a1', 'scarl'] },
        { id: 'pmag_30rd', name: 'Magpul PMAG 30발', magBonus: 0, reliability: 10, price: 55, level: 2, weaponType: '돌격소총', compatible: ['m4a1', 'scarl'] },
        { id: 'pmag_60rd', name: 'Magpul PMAG D-60', magBonus: 100, price: 180, level: 6, weaponType: '돌격소총', compatible: ['m4a1', 'scarl'] },
        
        // 돌격소총 탄창 (7.62x39)
        { id: 'ak_30rd', name: 'AK 30발 바켈라이트 탄창', magBonus: 0, price: 30, level: 1, weaponType: '돌격소총', compatible: ['ak47'] },
        { id: 'ak_40rd', name: 'AK 40발 RPK 탄창', magBonus: 33, price: 75, level: 4, weaponType: '돌격소총', compatible: ['ak47'] },
        { id: 'ak_75rd', name: 'AK 75발 드럼탄창', magBonus: 150, price: 220, level: 7, weaponType: '돌격소총', compatible: ['ak47'] },
        
        // 저격소총 탄창
        { id: 'awp_10rd', name: 'AWP 10발 탄창', magBonus: 0, price: 80, level: 1, weaponType: '저격소총', compatible: ['awp', 'barrett'] }
    ],
    
    // 손잡이 (Grip)
    grip: [
        { id: 'rvg', name: 'Magpul RVG', accuracy: 3, recoil: -10, price: 65, level: 2, compatible: ['기관단총', '돌격소총'] },
        { id: 'bcm_gunfighter', name: 'BCM Gunfighter', accuracy: 4, recoil: -12, price: 85, level: 3, compatible: ['돌격소총'] },
        { id: 'afg', name: 'Magpul AFG', accuracy: 5, recoil: -15, price: 95, level: 4, compatible: ['돌격소총'] },
        { id: 'fortis_shift', name: 'Fortis Shift', accuracy: 6, recoil: -18, price: 120, level: 5, compatible: ['돌격소총'] },
        { id: 'troy_grip', name: 'Troy M7A1 PDW', accuracy: 4, recoil: -14, price: 110, level: 4, compatible: ['기관단총', '돌격소총'] }
    ],
    
    // 개머리판 (Stock)
    stock: [
        { id: 'magpul_ctr', name: 'Magpul MOE SL-K', accuracy: 3, recoil: -8, price: 75, level: 2, compatible: ['돌격소총'] },
        { id: 'b5_sopmod', name: 'B5 Systems SOPMOD', accuracy: 4, recoil: -12, price: 95, level: 3, compatible: ['돌격소총'] },
        { id: 'magpul_prs', name: 'Magpul PRS Gen3', accuracy: 6, recoil: -15, price: 180, level: 5, compatible: ['저격소총'] },
        { id: 'ak_wood', name: 'AK 목재 개머리판', accuracy: 2, recoil: -5, price: 40, level: 1, compatible: ['돌격소총'] },
        { id: 'ak_zenit', name: 'Zenit PT-1', accuracy: 5, recoil: -14, price: 140, level: 4, compatible: ['돌격소총'] }
    ],
    
    // 레이저/조명 (Tactical)
    tactical: [
        { id: 'peq15', name: 'AN/PEQ-15', accuracy: 2, price: 180, level: 4, compatible: ['기관단총', '돌격소총'] },
        { id: 'x400', name: 'SureFire X400U', accuracy: 3, price: 220, level: 5, compatible: ['권총', '기관단총', '돌격소총'] },
        { id: 'perst3', name: 'Zenit Perst-3', accuracy: 2, price: 160, level: 3, compatible: ['돌격소총'] },
        { id: 'tlr1', name: 'Streamlight TLR-1 HL', accuracy: 1, price: 95, level: 2, compatible: ['권총'] }
    ]
};

const CATEGORY_NAMES = {
    sights: '조준경',
    barrel: '총열 부착물',
    magazine: '탄창',
    grip: '손잡이',
    stock: '개머리판',
    tactical: '전술 장비'
};

function getAttachmentById(id) {
    for (let category in ATTACHMENTS) {
        const attachment = ATTACHMENTS[category].find(a => a.id === id);
        if (attachment) return { ...attachment, category };
    }
    return null;
}

// 무기와 부착물 호환성 체크
function isAttachmentCompatible(weapon, attachment) {
    if (!attachment || !attachment.compatible) return true;
    
    // 무기 타입 호환성 체크
    if (!attachment.compatible.includes(weapon.type) && !attachment.compatible.includes(weapon.id)) {
        return false;
    }
    
    // 특정 무기 호환성 체크 (탄창 등)
    if (attachment.weaponType && attachment.weaponType !== weapon.type) {
        return false;
    }
    
    return true;
}

// 무기별 호환 가능한 부착물 필터링
function getCompatibleAttachments(weapon, category) {
    if (!ATTACHMENTS[category]) return [];
    
    return ATTACHMENTS[category].filter(attachment => 
        isAttachmentCompatible(weapon, attachment)
    );
}

// 탄종별 그룹핑 (소음기 등을 위한)
function getWeaponCaliber(weapon) {
    const caliberMap = {
        'glock17': '9mm',
        'deagle': '50ae',
        'mp5': '9mm',
        'p90': '57mm',
        'ak47': '762x39',
        'm4a1': '556',
        'scarl': '556',
        'awp': '338',
        'barrett': '50bmg'
    };
    return caliberMap[weapon.id] || 'unknown';
}

function calculateWeaponStats(weapon, equippedAttachments) {
    let stats = {
        damage: weapon.damage,
        accuracy: weapon.accuracy,
        mag: weapon.mag,
        reloadSpeed: weapon.reloadSpeed,
        recoil: 100, // 기본 반동값
        stealth: 0,  // 은밀성 (소음기 등)
        reliability: 100 // 신뢰성
    };

    Object.entries(equippedAttachments).forEach(([category, attachmentId]) => {
        if (!attachmentId) return;
        const attachment = getAttachmentById(attachmentId);
        if (!attachment || !isAttachmentCompatible(weapon, attachment)) return;

        // 기본 스탯 적용
        if (attachment.damage) stats.damage += attachment.damage;
        if (attachment.accuracy) stats.accuracy += attachment.accuracy;
        if (attachment.recoil) stats.recoil += attachment.recoil; // 반동 감소는 음수값
        if (attachment.stealth) stats.stealth = Math.max(stats.stealth, attachment.stealth);
        if (attachment.reliability) stats.reliability += attachment.reliability;
        
        // 탄창 관련
        if (attachment.magBonus) {
            stats.mag += Math.floor(weapon.mag * attachment.magBonus / 100);
        }
        
        // 재장전 속도
        if (attachment.reloadBonus) {
            stats.reloadSpeed *= (1 - attachment.reloadBonus / 100);
        }
    });

    // 스탯 제한
    stats.accuracy = Math.max(0, Math.min(100, stats.accuracy));
    stats.recoil = Math.max(0, stats.recoil);
    stats.reliability = Math.max(0, Math.min(100, stats.reliability));

    return stats;
}

// 부착물 카테고리별 개수 제한
const ATTACHMENT_SLOTS = {
    '권총': ['sights', 'barrel', 'magazine', 'tactical'],
    '기관단총': ['sights', 'barrel', 'magazine', 'grip', 'stock', 'tactical'],
    '돌격소총': ['sights', 'barrel', 'magazine', 'grip', 'stock', 'tactical'],
    '저격소총': ['sights', 'barrel', 'magazine', 'stock', 'tactical']
};

function getAvailableSlots(weapon) {
    return ATTACHMENT_SLOTS[weapon.type] || ['sights', 'barrel', 'magazine'];
}

// 전역 변수로 노출
window.ATTACHMENTS = ATTACHMENTS;
window.CATEGORY_NAMES = CATEGORY_NAMES;
window.getAttachmentById = getAttachmentById;
window.isAttachmentCompatible = isAttachmentCompatible;
window.getCompatibleAttachments = getCompatibleAttachments;
window.getWeaponCaliber = getWeaponCaliber;
window.calculateWeaponStats = calculateWeaponStats;
window.ATTACHMENT_SLOTS = ATTACHMENT_SLOTS;
window.getAvailableSlots = getAvailableSlots;

