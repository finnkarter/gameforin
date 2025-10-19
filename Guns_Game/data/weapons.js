// 무기 데이터
const WEAPONS = [
    { 
        id: 'glock17', 
        name: 'Glock 17', 
        type: '권총', 
        damage: 35, 
        accuracy: 85, 
        fireRate: 'normal', 
        mag: 17, 
        level: 1,
        reloadSpeed: 1.5
    },
    { 
        id: 'deagle', 
        name: 'Desert Eagle', 
        type: '권총', 
        damage: 55, 
        accuracy: 90, 
        fireRate: 'slow', 
        mag: 7, 
        level: 2,
        reloadSpeed: 2.0
    },
    { 
        id: 'mp5', 
        name: 'MP5', 
        type: '기관단총', 
        damage: 30, 
        accuracy: 80, 
        fireRate: 'fast', 
        mag: 30, 
        level: 3,
        reloadSpeed: 1.8
    },
    { 
        id: 'ak47', 
        name: 'AK-47', 
        type: '돌격소총', 
        damage: 45, 
        accuracy: 75, 
        fireRate: 'normal', 
        mag: 30, 
        level: 4,
        reloadSpeed: 2.2
    },
    { 
        id: 'm4a1', 
        name: 'M4A1', 
        type: '돌격소총', 
        damage: 40, 
        accuracy: 88, 
        fireRate: 'fast', 
        mag: 30, 
        level: 5,
        reloadSpeed: 1.9
    },
    { 
        id: 'awp', 
        name: 'AWP', 
        type: '저격소총', 
        damage: 100, 
        accuracy: 98, 
        fireRate: 'verySlow', 
        mag: 10, 
        level: 6,
        reloadSpeed: 2.5
    },
    { 
        id: 'scarl', 
        name: 'SCAR-L', 
        type: '돌격소총', 
        damage: 48, 
        accuracy: 92, 
        fireRate: 'normal', 
        mag: 30, 
        level: 7,
        reloadSpeed: 2.0
    },
    { 
        id: 'p90', 
        name: 'P90', 
        type: '기관단총', 
        damage: 28, 
        accuracy: 82, 
        fireRate: 'veryFast', 
        mag: 50, 
        level: 8,
        reloadSpeed: 2.3
    },
    { 
        id: 'barrett', 
        name: 'Barrett M82', 
        type: '저격소총', 
        damage: 120, 
        accuracy: 99, 
        fireRate: 'verySlow', 
        mag: 10, 
        level: 9,
        reloadSpeed: 3.0
    },
    { 
        id: 'goldeagle', 
        name: 'Gold Eagle', 
        type: '권총(특수)', 
        damage: 75, 
        accuracy: 95, 
        fireRate: 'normal', 
        mag: 9, 
        level: 10,
        reloadSpeed: 1.7
    }
];

function getWeaponById(id) {
    return WEAPONS.find(w => w.id === id);
}

function getUnlockedWeapons(level) {
    return WEAPONS.filter(w => w.level <= level);
}

// 전역 변수로 노출
window.WEAPONS = WEAPONS;
window.getWeaponById = getWeaponById;
window.getUnlockedWeapons = getUnlockedWeapons;

