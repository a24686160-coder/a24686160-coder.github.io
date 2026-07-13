// ===== ЗВЁЗДНЫЙ ФОН (8K КАЧЕСТВО) =====
const starsCanvas = document.getElementById('starsCanvas');
const starsCtx = starsCanvas.getContext('2d');

let width, height;
const stars = [];
const STAR_COUNT = 1200;

function resizeStars() {
    width = window.innerWidth;
    height = window.innerHeight;
    starsCanvas.width = width * window.devicePixelRatio;
    starsCanvas.height = height * window.devicePixelRatio;
    starsCanvas.style.width = width + 'px';
    starsCanvas.style.height = height + 'px';
    starsCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function createStars() {
    stars.length = 0;
    for (let i = 0; i < STAR_COUNT; i++) {
        const depth = Math.random();
        stars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.2 + 0.3,
            baseAlpha: Math.random() * 0.7 + 0.3,
            alpha: 0,
            twinkleSpeed: Math.random() * 0.03 + 0.005,
            twinkleOffset: Math.random() * Math.PI * 2,
            depth: depth,
            hue: Math.random() < 0.1 ? 220 + Math.random() * 40 : 0,
            saturation: Math.random() < 0.1 ? '40%' : '0%',
            lightness: 80 + Math.random() * 20
        });
    }
    stars.sort((a, b) => b.depth - a.depth);
}

function drawStars(time) {
    starsCtx.clearRect(0, 0, width, height);
    
    stars.forEach(star => {
        star.alpha = star.baseAlpha + Math.sin(time * star.twinkleSpeed + star.twinkleOffset) * 0.3;
        star.alpha = Math.max(0.1, Math.min(1, star.alpha));
        
        const parallaxX = (star.x - width / 2) * star.depth * 0.02;
        const parallaxY = (star.y - height / 2) * star.depth * 0.02;
        const drawX = star.x + parallaxX;
        const drawY = star.y + parallaxY;
        
        if (star.hue > 0) {
            starsCtx.fillStyle = `hsla(${star.hue}, ${star.saturation}, ${star.lightness}%, ${star.alpha})`;
        } else {
            starsCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        }
        
        starsCtx.beginPath();
        starsCtx.arc(drawX, drawY, star.radius, 0, Math.PI * 2);
        starsCtx.fill();
        
        if (star.radius > 1.6 && star.alpha > 0.8) {
            starsCtx.fillStyle = `rgba(255, 255, 255, ${star.alpha * 0.2})`;
            starsCtx.beginPath();
            starsCtx.arc(drawX, drawY, star.radius * 3, 0, Math.PI * 2);
            starsCtx.fill();
        }
    });
}

// ===== ЧАСТИЦЫ =====
const particlesCanvas = document.getElementById('particlesCanvas');
const particlesCtx = particlesCanvas.getContext('2d');
const particles = [];
const PARTICLE_COUNT = 60;

function resizeParticles() {
    particlesCanvas.width = width * window.devicePixelRatio;
    particlesCanvas.height = height * window.devicePixelRatio;
    particlesCanvas.style.width = width + 'px';
    particlesCanvas.style.height = height + 'px';
    particlesCtx.scale(window.devicePixelRatio, window.devicePixelRatio);
}

function createParticles() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 1.5 + 0.5,
            alpha: Math.random() * 0.4 + 0.1,
            life: Math.random() * 300 + 100,
            maxLife: 400
        });
    }
}

function drawParticles() {
    particlesCtx.clearRect(0, 0, width, height);
    
    particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        
        if (p.life <= 0) {
            p.x = Math.random() * width;
            p.y = Math.random() * height;
            p.life = p.maxLife;
        }
        
        const lifeRatio = p.life / p.maxLife;
        const alpha = p.alpha * lifeRatio;
        
        particlesCtx.fillStyle = `rgba(255, 200, 150, ${alpha})`;
        particlesCtx.beginPath();
        particlesCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        particlesCtx.fill();
        
        particlesCtx.fillStyle = `rgba(255, 180, 100, ${alpha * 0.3})`;
        particlesCtx.beginPath();
        particlesCtx.arc(p.x, p.y, p.radius * 4, 0, Math.PI * 2);
        particlesCtx.fill();
    });
}

// ===== ИНИЦИАЛИЗАЦИЯ ФОНА =====
function initBackground() {
    resizeStars();
    resizeParticles();
    createStars();
    createParticles();
}

initBackground();

// ===== АНИМАЦИЯ =====
function animate(time) {
    drawStars(time);
    drawParticles();
    requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// ===== РЕСАЙЗ =====
window.addEventListener('resize', () => {
    initBackground();
});

// ===== ПАРАЛЛАКС ДЛЯ ПЛАНЕТ ПРИ ДВИЖЕНИИ МЫШИ =====
document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = (e.clientY / window.innerHeight - 0.5) * 20;
    
    document.querySelectorAll('.planet').forEach((planet, i) => {
        const depth = (i + 1) * 0.3;
        planet.style.transform = `translate(${x * depth}px, ${y * depth}px)`;
    });
    
    const sunContainer = document.querySelector('.sun-container');
    if (sunContainer) {
        sunContainer.style.transform = `translate(${x * 0.5}px, ${y * 0.5}px)`;
    }
});

// ===== НАВИГАЦИЯ ПО КНОПКАМ — ИСПРАВЛЕНО =====
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('data-target');
        const targetModal = document.getElementById(targetId);
        
        if (targetModal) {
            // Закрываем все открытые модалки
            document.querySelectorAll('.page-modal.active').forEach(modal => {
                modal.classList.remove('active');
            });
            
            // Открываем нужную
            targetModal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Прокручиваем содержимое в начало
            const scrollContainer = targetModal.querySelector('.modal-scroll');
            if (scrollContainer) {
                scrollContainer.scrollTop = 0;
                // Запускаем анимацию появления блоков
                setTimeout(() => {
                    showVisibleBlocks(scrollContainer);
                }, 150);
            }
        }
    });
});

// ===== ЗАКРЫТИЕ МОДАЛОК =====
function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const modal = this.closest('.page-modal');
        closeModal(modal);
    });
});

document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', function(e) {
        const modal = this.closest('.page-modal');
        closeModal(modal);
    });
});

// ===== ЗАКРЫТИЕ ПО ESC =====
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        document.querySelectorAll('.page-modal.active').forEach(modal => {
            closeModal(modal);
        });
    }
});

// ===== ЭФФЕКТ СВЕЧЕНИЯ ДЛЯ КНОПОК =====
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('mousemove', function(e) {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const glow = btn.querySelector('.btn-glow');
        if (glow) {
            glow.style.left = x + 'px';
            glow.style.top = y + 'px';
        }
    });
});

// ===== АНИМАЦИЯ ПОЯВЛЕНИЯ БЛОКОВ ПРИ СКРОЛЛЕ =====
function showVisibleBlocks(scrollContainer) {
    const blocks = scrollContainer.querySelectorAll('.content-block');
    blocks.forEach(block => {
        const rect = block.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        if (rect.top < windowHeight * 0.85) {
            block.style.opacity = '1';
            block.style.transform = 'translateX(0)';
        }
    });
}

document.querySelectorAll('.modal-scroll').forEach(scroll => {
    // Инициализация стилей для content-block
    scroll.querySelectorAll('.content-block').forEach(block => {
        block.style.opacity = '0';
        block.style.transform = 'translateX(-20px)';
        block.style.transition = 'all 0.6s ease';
    });
    
    // Показ блоков при скролле
    scroll.addEventListener('scroll', function() {
        showVisibleBlocks(this);
    });
});

// ===== МЕРЦАНИЕ ЗАГОЛОВКА =====
function glitchEffect() {
    const title = document.querySelector('.title-main');
    if (!title) return;
    
    setInterval(() => {
        if (Math.random() < 0.05) {
            title.style.textShadow = `
                ${Math.random() * 6 - 3}px ${Math.random() * 6 - 3}px rgba(255, 100, 0, 0.5),
                ${Math.random() * 6 - 3}px ${Math.random() * 6 - 3}px rgba(255, 200, 0, 0.3)
            `;
            setTimeout(() => {
                title.style.textShadow = 'none';
            }, 100);
        }
    }, 2000);
}

glitchEffect();

// ===== СЛУЧАЙНЫЕ МЕТЕОРЫ =====
function createMeteor() {
    const meteor = document.createElement('div');
    meteor.style.cssText = `
        position: fixed;
        width: 2px;
        height: 80px;
        background: linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0));
        border-radius: 1px;
        pointer-events: none;
        z-index: 1;
        top: ${Math.random() * 40}%;
        left: ${Math.random() * 80}%;
        transform: rotate(-40deg);
        animation: meteorFall ${Math.random() * 1 + 0.5}s linear forwards;
    `;
    
    const styleId = 'meteor-style-' + Date.now();
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        @keyframes meteorFall {
            0% { opacity: 1; transform: rotate(-40deg) translateX(0) translateY(0); }
            100% { opacity: 0; transform: rotate(-40deg) translateX(-400px) translateY(300px); }
        }
    `;
    document.head.appendChild(style);
    document.body.appendChild(meteor);
    
    setTimeout(() => {
        meteor.remove();
        const s = document.getElementById(styleId);
        if (s) s.remove();
    }, 1500);
}

setInterval(() => {
    if (Math.random() < 0.3) {
        createMeteor();
    }
}, 4000);

console.log('%c🌌 ИИ-Инженеринг — Космический Портал %cАктивирован',
    'color: #ffaa00; font-size: 20px; font-weight: bold;',
    'color: #ffffff;');
console.log('%cИсследуй вселенную искусственного интеллекта',
    'color: #ccccdd; font-style: italic;');