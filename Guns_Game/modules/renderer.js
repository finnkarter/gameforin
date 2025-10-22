// 렌더링 로직
class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTarget(target, ageRatio) {
        const alpha = 1 - ageRatio * 0.3;
        const ctx = this.ctx;
        
        // 타르코프 스타일 타겟인지 확인(new!)
        if (target.config && target.config.id) {
            this.drawTarkovTarget(target, alpha);
            return;
        }
        
        // 특수 타겟인지 확인
        if (target.isSpecial && target.config) {
            this.drawSpecialTarget(target, alpha);
            return;
        }
        
        // 일반 타겟
        // 외곽 (10점)
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(90, 90, 90, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(140, 140, 140, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 중간 (20점)
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(120, 120, 120, ${alpha})`;
        ctx.fill();

        // 중심 (30점 - 헤드샷)
        ctx.beginPath();
        ctx.arc(target.x, target.y, target.size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(160, 160, 160, ${alpha})`;
        ctx.fill();

        // 움직이는 타겟 표시
        if (target.velocity) {
            ctx.strokeStyle = `rgba(180, 180, 180, ${alpha * 0.5})`;
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(target.x, target.y, target.size + 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

//new!

    drawTarkovTarget(target, alpha) {
        const ctx = this.ctx;
        const x = target.x;
        const y = target.y;
        const size = target.size;
        const config = target.config;
        
        // 체력에 따른 알파값 조정
        const healthPercent = target.getHealthPercentage();
        const targetAlpha = alpha * (0.3 + healthPercent * 0.7);
        
        // 타겟 타입별 색상
        const baseColor = config.color;
        const borderColor = config.borderColor;
        
        ctx.save();
        
        // 보스는 글로우 효과
        if (config.id === 'boss') {
            ctx.shadowColor = 'rgba(255, 200, 100, 0.5)';
            ctx.shadowBlur = 10;
        }
        
        // 메인 원
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `${baseColor}${Math.floor(targetAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.fill();
        ctx.strokeStyle = `${borderColor}${Math.floor(targetAlpha * 255).toString(16).padStart(2, '0')}`;
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // 내부 원 (헤드샷 존)
        ctx.beginPath();
        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 100, 100, ${targetAlpha})`;
        ctx.fill();
        
        // 타겟 타입 표시
        ctx.fillStyle = `rgba(255, 255, 255, ${targetAlpha})`;
        ctx.font = `${size * 0.3}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let displayText = '';
        switch (config.id) {
            case 'scav': displayText = 'S'; break;
            case 'pmc': displayText = 'P'; break;
            case 'boss': displayText = 'B'; break;
        }
        ctx.fillText(displayText, x, y);
        
        // 체력바
        if (healthPercent < 1.0) {
            const barWidth = size * 1.5;
            const barHeight = 4;
            const barX = x - barWidth / 2;
            const barY = y - size - 15;
            
            // 배경
            ctx.fillStyle = `rgba(100, 100, 100, ${targetAlpha})`;
            ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 체력
            ctx.fillStyle = healthPercent > 0.3 ? 
                `rgba(100, 200, 100, ${targetAlpha})` : 
                `rgba(200, 100, 100, ${targetAlpha})`;
            ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        }
        
        // 움직이는 타겟 표시
        if (target.velocity) {
            ctx.strokeStyle = `rgba(255, 255, 100, ${targetAlpha * 0.6})`;
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(x, y, size + 8, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        ctx.restore();
    }
//end of new!

    drawSpecialTarget(target, alpha) {
        const ctx = this.ctx;
        const x = target.x;
        const y = target.y;
        const size = target.size;

        // 사람 모양 타겟 그리기
        ctx.save();
        
        // 배경 글로우
        ctx.shadowColor = 'rgba(200, 200, 200, 0.3)';
        ctx.shadowBlur = 15;
        
        // 머리
        const headRadius = size * 0.15;
        ctx.beginPath();
        ctx.arc(x, y - size * 0.35, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = target.hits.head >= target.config.requiredHits.head 
            ? `rgba(140, 140, 140, ${alpha})` 
            : `rgba(180, 180, 180, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 몸통
        ctx.beginPath();
        ctx.rect(x - size * 0.2, y - size * 0.2, size * 0.4, size * 0.5);
        const bodyHits = target.hits.body;
        const requiredBody = target.config.requiredHits.body;
        ctx.fillStyle = bodyHits >= requiredBody 
            ? `rgba(140, 140, 140, ${alpha})` 
            : `rgba(180, 180, 180, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        // 다리
        ctx.beginPath();
        ctx.rect(x - size * 0.15, y + size * 0.3, size * 0.1, size * 0.25);
        ctx.rect(x + size * 0.05, y + size * 0.3, size * 0.1, size * 0.25);
        ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.restore();

        // 진행도 표시
        ctx.fillStyle = `rgba(200, 200, 200, ${alpha})`;
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(target.getProgress(), x, y + size * 0.7);

        // 특수 타겟 표시
        ctx.strokeStyle = `rgba(200, 200, 200, ${alpha * 0.8})`;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(x, y, size * 0.9, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawCrosshair(style, color, size) {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const ctx = this.ctx;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        if (style === 'default') {
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY);
            ctx.lineTo(centerX - 5, centerY);
            ctx.moveTo(centerX + 5, centerY);
            ctx.lineTo(centerX + size, centerY);
            ctx.moveTo(centerX, centerY - size);
            ctx.lineTo(centerX, centerY - 5);
            ctx.moveTo(centerX, centerY + 5);
            ctx.lineTo(centerX, centerY + size);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        } else if (style === 'dot') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        } else if (style === 'cross') {
            ctx.beginPath();
            ctx.moveTo(centerX - size, centerY - size);
            ctx.lineTo(centerX + size, centerY + size);
            ctx.moveTo(centerX + size, centerY - size);
            ctx.lineTo(centerX - size, centerY + size);
            ctx.stroke();
        } else if (style === 'circle') {
            ctx.beginPath();
            ctx.arc(centerX, centerY, size * 0.8, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, 2, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        }
    }

    createHitEffect(x, y, isHeadshot) {
        const rect = this.canvas.getBoundingClientRect();
        const container = this.canvas.parentElement;
        
        for (let i = 0; i < 6; i++) {
            const particle = document.createElement('div');
            particle.className = 'hit-particle';
            particle.style.left = (rect.left + x) + 'px';
            particle.style.top = (rect.top + y) + 'px';
            
            if (isHeadshot) {
                particle.style.background = '#aaa';
                particle.style.width = '5px';
                particle.style.height = '5px';
            }
            
            const angle = (Math.PI * 2 * i) / 6;
            const distance = isHeadshot ? 35 : 25;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            particle.style.setProperty('--tx', tx + 'px');
            particle.style.setProperty('--ty', ty + 'px');
            
            container.appendChild(particle);
            
            setTimeout(() => particle.remove(), 500);
        }
    }

    drawReloadBar(progress) {
        const ctx = this.ctx;
        const barWidth = 200;
        const barHeight = 20;
        const x = (this.canvas.width - barWidth) / 2;
        const y = this.canvas.height - 50;

        ctx.fillStyle = 'rgba(50, 50, 50, 0.8)';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = 'rgba(160, 160, 160, 0.9)';
        ctx.fillRect(x, y, barWidth * progress, barHeight);

        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#d4d4d4';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('재장전 중...', this.canvas.width / 2, y - 5);
    }
}

// 전역 변수로 노출
window.Renderer = Renderer;

