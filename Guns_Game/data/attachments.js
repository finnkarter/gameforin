// 부착물 데이터
export const ATTACHMENTS = {
    sights: [
        { id: 'reddot', name: '레드닷 사이트', accuracy: 3, price: 50, level: 2 },
        { id: 'holo', name: '홀로그래픽', accuracy: 5, price: 100, level: 4 },
        { id: 'acog', name: 'ACOG 스코프', accuracy: 8, price: 200, level: 6 },
        { id: 'sniper', name: '스나이퍼 스코프', accuracy: 12, price: 350, level: 8 }
    ],
    barrel: [
        { id: 'silencer', name: '소음기', accuracy: 2, damage: -5, price: 80, level: 3 },
        { id: 'longbarrel', name: '롱 배럴', damage: 10, price: 150, level: 5 },
        { id: 'compensator', name: '컴펜세이터', accuracy: 5, price: 200, level: 7 }
    ],
    magazine: [
        { id: 'extended', name: '확장 탄창', magBonus: 50, price: 120, level: 4 },
        { id: 'fast', name: '고속 탄창', reloadBonus: 30, price: 180, level: 6 }
    ],
    grip: [
        { id: 'vertical', name: '수직 손잡이', accuracy: 4, price: 90, level: 3 },
        { id: 'angled', name: '각진 손잡이', accuracy: 6, price: 160, level: 5 }
    ]
};

export const CATEGORY_NAMES = {
    sights: '조준경',
    barrel: '총열',
    magazine: '탄창',
    grip: '손잡이'
};

export function getAttachmentById(id) {
    for (let category in ATTACHMENTS) {
        const attachment = ATTACHMENTS[category].find(a => a.id === id);
        if (attachment) return attachment;
    }
    return null;
}

export function calculateWeaponStats(weapon, equippedAttachments) {
    let damage = weapon.damage;
    let accuracy = weapon.accuracy;
    let mag = weapon.mag;
    let reloadSpeed = weapon.reloadSpeed;

    Object.values(equippedAttachments).forEach(attachmentId => {
        if (!attachmentId) return;
        const attachment = getAttachmentById(attachmentId);
        if (attachment) {
            if (attachment.damage) damage += attachment.damage;
            if (attachment.accuracy) accuracy += attachment.accuracy;
            if (attachment.magBonus) mag += Math.floor(weapon.mag * attachment.magBonus / 100);
            if (attachment.reloadBonus) reloadSpeed *= (1 - attachment.reloadBonus / 100);
        }
    });

    return { damage, accuracy, mag, reloadSpeed };
}

