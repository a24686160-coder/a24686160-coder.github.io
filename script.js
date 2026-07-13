// ==========================================================
// AI Engineering — Space Landing
// Canvas: starfield + animated sun, scroll reveals, form
// ==========================================================
(() => {
  'use strict';

  const canvas = document.getElementById('space-canvas');
  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);
  let stars = [];
  let pointer = { x: 0, y: 0, active: false };
  let scrollT = 0; // 0..1 progress through hero, drives sun parallax
  let frame = 0;

  // ---- setup / resize -------------------------------------------------
  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = buildStars(density());
  };

  const density = () => Math.round((width * height) / 9000);

  const buildStars = (count) => {
    const arr = new Array(count);
    for (let i = 0; i < count; i++) {
      arr[i] = {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.3 + 0.2,
        baseAlpha: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.015 + 0.004,
        twinklePhase: Math.random() * Math.PI * 2,
        parallax: Math.random() * 0.4 + 0.1,
      };
    }
    return arr;
  };

  // ---- sun geometry -----------------------------------------------------
  const sunCenter = () => ({
    x: width * 0.82,
    y: height * 0.28 + scrollT * height * 0.5,
  });

  const drawSun = (time) => {
    const { x: cx, y: cy } = sunCenter();
    const baseR = Math.min(width, height) * 0.16;
    const pulse = prefersReducedMotion ? 0 : Math.sin(time * 0.0006) * 0.04;
    const r = baseR * (1 + pulse);

    // outer glow / corona
    const coronaR = r * 3.4;
    const corona = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, coronaR);
    corona.addColorStop(0, 'rgba(255, 200, 120, 0.35)');
    corona.addColorStop(0.35, 'rgba(255, 140, 60, 0.14)');
    corona.addColorStop(1, 'rgba(255, 90, 30, 0)');
    ctx.fillStyle = corona;
    ctx.beginPath();
    ctx.arc(cx, cy, coronaR, 0, Math.PI * 2);
    ctx.fill();

    // rotating flare rays (subtle, not cartoonish)
    if (!prefersReducedMotion) {
      const rayCount = 10;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.00006);
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2;
        const len = r * (2.1 + 0.4 * Math.sin(time * 0.0009 + i));
        const grad = ctx.createLinearGradient(0, 0, Math.cos(angle) * len, Math.sin(angle) * len);
        grad.addColorStop(0, 'rgba(255, 190, 110, 0.10)');
        grad.addColorStop(1, 'rgba(255, 190, 110, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = r * 0.18;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
        ctx.stroke();
      }
      ctx.restore();
    }

    // sun disc — layered radial gradient for a "real" photosphere look
    const disc = ctx.createRadialGradient(
      cx - r * 0.3, cy - r * 0.3, r * 0.05,
      cx, cy, r
    );
    disc.addColorStop(0, '#fff8e8');
    disc.addColorStop(0.35, '#ffd98a');
    disc.addColorStop(0.65, '#ffb347');
    disc.addColorStop(1, '#ff5a1f');
    ctx.fillStyle = disc;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // granulation / surface flicker (very subtle noise dots)
    if (!prefersReducedMotion) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();
      for (let i = 0; i < 18; i++) {
        const seed = (time * 0.0002 + i * 12.9898) % 1;
        const a = seed * Math.PI * 2;
        const dist = r * (0.15 + 0.75 * ((i * 37) % 100) / 100);
        const px = cx + Math.cos(a + i) * dist;
        const py = cy + Math.sin(a + i) * dist;
        const rad = r * (0.05 + 0.05 * Math.sin(time * 0.001 + i));
        ctx.fillStyle = `rgba(255, 120, 30, ${0.08 + 0.05 * Math.sin(time * 0.002 + i)})`;
        ctx.beginPath();
        ctx.arc(px, py, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // limb highlight
    ctx.strokeStyle = 'rgba(255, 245, 220, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawStars = (time) => {
    const { x: cx, y: cy } = sunCenter();
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      const twinkle = prefersReducedMotion
        ? s.baseAlpha
        : s.baseAlpha * (0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinklePhase));

      const dx = (pointer.active ? pointer.x - width / 2 : 0) * s.parallax * 0.02;
      const dy = (pointer.active ? pointer.y - height / 2 : 0) * s.parallax * 0.02;

      ctx.beginPath();
      ctx.fillStyle = `rgba(245, 247, 250, ${Math.max(0, Math.min(1, twinkle))})`;
      ctx.arc(s.x + dx, s.y + dy, s.r, 0, Math.PI * 2);
      ctx.fill();

      // faint warm tint on stars near the sun (light "catching")
      const distToSun = Math.hypot(s.x - cx, s.y - cy);
      if (distToSun < 260) {
        ctx.fillStyle = `rgba(255, 180, 100, ${0.15 * (1 - distToSun / 260)})`;
        ctx.beginPath();
        ctx.arc(s.x + dx, s.y + dy, s.r * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  };

  const render = (time) => {
    ctx.clearRect(0, 0, width, height);
    drawStars(time);
    drawSun(time);
    frame = requestAnimationFrame(render);
  };

  // ---- input --------------------------------------------------------------
  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
  });
  window.addEventListener('pointerleave', () => { pointer.active = false; });

  const heroEl = document.querySelector('.hero');
  const updateScrollT = () => {
    const h = heroEl.offsetHeight || height;
    scrollT = Math.max(0, Math.min(1, window.scrollY / h));
  };
  window.addEventListener('scroll', updateScrollT, { passive: true });
  window.addEventListener('resize', () => { resize(); updateScrollT(); });

  resize();
  updateScrollT();
  render(0);

  // ---- scroll cue -----------------------------------------------------
  const scrollCue = document.getElementById('scroll-cue');
  scrollCue?.addEventListener('click', () => {
    document.getElementById('phases')?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  // ---- reveal on scroll -------------------------------------------------
  const revealItems = document.querySelectorAll('.orbit__item');
  if ('IntersectionObserver' in window && revealItems.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    revealItems.forEach((item) => io.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  // ---- form (front-end only demo) ----------------------------------------
  const form = document.getElementById('cta-form');
  const status = document.getElementById('cta-status');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email')?.value.trim();
    if (!email) return;
    status.textContent = `Маршрут отправлен на ${email}. Проверьте почту через пару минут.`;
    form.reset();
  });
})();
