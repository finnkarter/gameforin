// 무기 데이터 (타르코프 스타일 확장)
const WEAPONS = [
    { 
        id: 'glock17', 
        name: 'Glock 17', 
        type: '권총', 
        caliber: '9mm',
        damage: 35, 
        accuracy: 85, 
        fireRate: 'normal', 
        mag: 17, 
        level: 1,
        price: 0, // 기본 무기는 무료
        reloadSpeed: 1.5,
        baseRecoil: 85,
        ergonomics: 75,
        description: '오스트리아제 폴리머 권총, 높은 신뢰성'
    },
    { 
        id: 'deagle', 
        name: 'Desert Eagle .50 AE', 
        type: '권총', 
        caliber: '.50 AE',
        damage: 55, 
        accuracy: 90, 
        fireRate: 'slow', 
        mag: 7, 
        level: 2,
        price: 800,
        reloadSpeed: 2.0,
        baseRecoil: 120,
        ergonomics: 45,
        description: '이스라엘제 대구경 권총, 강력한 화력'
    },
    { 
        id: 'mp5', 
        name: 'HK MP5', 
        type: '기관단총', 
        caliber: '9mm',
        damage: 30, 
        accuracy: 80, 
        fireRate: 'fast', 
        mag: 30, 
        level: 3,
        price: 1500,
        reloadSpeed: 1.8,
        baseRecoil: 70,
        ergonomics: 85,
        description: '독일제 기관단총, 뛰어난 정확도'
    },
    { 
        id: 'ak47', 
        name: 'Kalashnikov AK-47', 
        type: '돌격소총', 
        caliber: '7.62x39mm',
        damage: 45, 
        accuracy: 75, 
        fireRate: 'normal', 
        mag: 30, 
        level: 4,
        price: 2200,
        reloadSpeed: 2.2,
        baseRecoil: 95,
        ergonomics: 60,
        description: '소련제 돌격소총, 높은 내구성과 화력'
    },
    { 
        id: 'm4a1', 
        name: 'Colt M4A1', 
        type: '돌격소총', 
        caliber: '5.56x45mm',
        damage: 40, 
        accuracy: 88, 
        fireRate: 'fast', 
        mag: 30, 
        level: 5,
        price: 2800,
        reloadSpeed: 1.9,
        baseRecoil: 80,
        ergonomics: 75,
        description: '미국제 돌격소총, 높은 정확도와 모듈성'
    },
    { 
        id: 'awp', 
        name: 'Accuracy International AWM', 
        type: '저격소총', 
        caliber: '.338 Lapua',
        damage: 100, 
        accuracy: 98, 
        fireRate: 'verySlow', 
        mag: 10, 
        level: 6,
        price: 4500,
        reloadSpeed: 2.5,
        baseRecoil: 150,
        ergonomics: 35,
        description: '영국제 정밀 저격소총, 극도의 정확도'
    },
    { 
        id: 'scarl', 
        name: 'FN SCAR-L', 
        type: '돌격소총', 
        caliber: '5.56x45mm',
        damage: 48, 
        accuracy: 92, 
        fireRate: 'normal', 
        mag: 30, 
        level: 7,
        price: 3500,
        reloadSpeed: 2.0,
        baseRecoil: 85,
        ergonomics: 70,
        description: '벨기에제 모듈식 돌격소총, 균형잡힌 성능'
    },
    { 
        id: 'p90', 
        name: 'FN P90', 
        type: '기관단총', 
        caliber: '5.7x28mm',
        damage: 28, 
        accuracy: 82, 
        fireRate: 'veryFast', 
        mag: 50, 
        level: 8,
        price: 2800,
        reloadSpeed: 2.3,
        baseRecoil: 60,
        ergonomics: 90,
        description: '벨기에제 불펍 기관단총, 독특한 디자인'
    },
    { 
        id: 'barrett', 
        name: 'Barrett M82A1', 
        type: '저격소총', 
        caliber: '.50 BMG',
        damage: 120, 
        accuracy: 99, 
        fireRate: 'verySlow', 
        mag: 10, 
        level: 9,
        price: 8000,
        reloadSpeed: 3.0,
        baseRecoil: 200,
        ergonomics: 20,
        description: '미국제 대구경 저격소총, 최강의 화력'
    },
    { 
        id: 'goldeagle', 
        name: 'Golden Desert Eagle', 
        type: '권총(특수)', 
        caliber: '.50 AE',
        damage: 75, 
        accuracy: 95, 
        fireRate: 'normal', 
        mag: 9, 
        level: 10,
        price: 12000,
        reloadSpeed: 1.7,
        baseRecoil: 110,
        ergonomics: 55,
        description: '황금 도금된 특수 권총, 수집가용 아이템'
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

