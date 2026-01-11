// 粒子背景特效
class ParticleBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: null, y: null, radius: 150 };
        
        this.init();
    }

    init() {
        // 設置 canvas 樣式
        this.canvas.id = 'particle-canvas';
        this.canvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        `;
        document.body.prepend(this.canvas);
        
        this.resize();
        this.createParticles();
        this.animate();
        
        // 事件監聽
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseout', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.createParticles();
    }

    createParticles() {
        this.particles = [];
        const numParticles = Math.floor((this.canvas.width * this.canvas.height) / 12000);
        
        for (let i = 0; i < numParticles; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 1.5,
                speedY: (Math.random() - 0.5) * 1.5,
                opacity: Math.random() * 0.5 + 0.3,
                hue: Math.random() * 60 + 200 // 藍紫色調
            });
        }
    }

    drawParticle(p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        this.ctx.fill();
        
        // 發光效果
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = `hsla(${p.hue}, 80%, 70%, 0.5)`;
    }

    connectParticles() {
        const maxDistance = 120;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.4;
                    const gradient = this.ctx.createLinearGradient(
                        this.particles[i].x, this.particles[i].y,
                        this.particles[j].x, this.particles[j].y
                    );
                    gradient.addColorStop(0, `hsla(${this.particles[i].hue}, 80%, 70%, ${opacity})`);
                    gradient.addColorStop(1, `hsla(${this.particles[j].hue}, 80%, 70%, ${opacity})`);
                    
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }

    updateParticle(p) {
        // 滑鼠互動
        if (this.mouse.x !== null && this.mouse.y !== null) {
            const dx = p.x - this.mouse.x;
            const dy = p.y - this.mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.mouse.radius) {
                const force = (this.mouse.radius - distance) / this.mouse.radius;
                const angle = Math.atan2(dy, dx);
                p.x += Math.cos(angle) * force * 3;
                p.y += Math.sin(angle) * force * 3;
            }
        }
        
        // 移動
        p.x += p.speedX;
        p.y += p.speedY;
        
        // 邊界處理
        if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
        if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
        
        // 顏色漸變
        p.hue += 0.1;
        if (p.hue > 280) p.hue = 200;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 繪製粒子和連線
        this.connectParticles();
        
        this.particles.forEach(p => {
            this.updateParticle(p);
            this.drawParticle(p);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// 頁面載入後啟動粒子效果
document.addEventListener('DOMContentLoaded', () => {
    new ParticleBackground();
});
