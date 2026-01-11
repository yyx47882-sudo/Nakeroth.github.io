// 流體墨水特效 - Fluid Ink Effect
class FluidInkBackground {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.blobs = [];
        this.time = 0;
        this.mouse = { x: null, y: null };
        this.init();
    }

    init() {
        this.canvas.id = 'fluid-canvas';
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
        this.createBlobs();
        this.animate();
        
        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createBlobs() {
        // 創建流動的墨水團
        const colors = [
            { r: 20, g: 80, b: 120 },   // 深藍
            { r: 80, g: 40, b: 100 },   // 暗紫
            { r: 30, g: 100, b: 80 },   // 深青
            { r: 100, g: 50, b: 70 },   // 暗紅
            { r: 40, g: 60, b: 90 },    // 灰藍
        ];

        for (let i = 0; i < 8; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            this.blobs.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: Math.random() * 300 + 200,
                color: color,
                speedX: (Math.random() - 0.5) * 0.5,
                speedY: (Math.random() - 0.5) * 0.5,
                phase: Math.random() * Math.PI * 2,
                frequency: Math.random() * 0.005 + 0.002
            });
        }
    }

    drawBlob(blob) {
        const wobble = Math.sin(this.time * blob.frequency + blob.phase) * 50;
        const currentRadius = blob.radius + wobble;
        
        const gradient = this.ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, currentRadius
        );
        
        gradient.addColorStop(0, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0.4)`);
        gradient.addColorStop(0.5, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0.2)`);
        gradient.addColorStop(1, `rgba(${blob.color.r}, ${blob.color.g}, ${blob.color.b}, 0)`);
        
        this.ctx.beginPath();
        this.ctx.arc(blob.x, blob.y, currentRadius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }

    updateBlob(blob) {
        // 滑鼠吸引效果
        if (this.mouse.x && this.mouse.y) {
            const dx = this.mouse.x - blob.x;
            const dy = this.mouse.y - blob.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 400) {
                blob.x += dx * 0.002;
                blob.y += dy * 0.002;
            }
        }
        
        blob.x += blob.speedX;
        blob.y += blob.speedY;
        
        // 邊界反彈
        if (blob.x < -200 || blob.x > this.canvas.width + 200) blob.speedX *= -1;
        if (blob.y < -200 || blob.y > this.canvas.height + 200) blob.speedY *= -1;
    }

    drawNoise() {
        // 添加微弱噪點紋理
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const noise = (Math.random() - 0.5) * 15;
            data[i] += noise;
            data[i + 1] += noise;
            data[i + 2] += noise;
        }
        
        this.ctx.putImageData(imageData, 0, 0);
    }

    drawScanlines() {
        // CRT 掃描線效果
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
        for (let y = 0; y < this.canvas.height; y += 3) {
            this.ctx.fillRect(0, y, this.canvas.width, 1);
        }
    }

    animate() {
        this.time++;
        
        // 深黑背景帶微弱漸層
        const bgGradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width
        );
        bgGradient.addColorStop(0, '#0d0d0d');
        bgGradient.addColorStop(1, '#050505');
        this.ctx.fillStyle = bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 混合模式讓顏色更有層次
        this.ctx.globalCompositeOperation = 'screen';
        
        this.blobs.forEach(blob => {
            this.updateBlob(blob);
            this.drawBlob(blob);
        });
        
        this.ctx.globalCompositeOperation = 'source-over';
        
        // 加入掃描線和噪點（每隔幾幀更新一次噪點避免效能問題）
        this.drawScanlines();
        if (this.time % 3 === 0) {
            this.drawNoise();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FluidInkBackground();
});
