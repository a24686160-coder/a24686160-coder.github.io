// ---- закат → ночь при скролле ----
const sunEl = document.querySelector('.sun');
const nightLayer = document.querySelector('.sky-night');
const starsEl = document.querySelector('.stars');

function updateSky(){
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const p = Math.min(window.scrollY / Math.min(max, window.innerHeight * 1.4), 1);

  nightLayer.style.opacity = p;
  starsEl.style.opacity = p;
  if(sunEl){
    sunEl.style.transform = `translateY(${p * 55}vh)`;
    sunEl.style.opacity = String(1 - p * 0.9);
  }
}
window.addEventListener('scroll', updateSky, { passive: true });
window.addEventListener('resize', updateSky);
updateSky();

// ---- появление карточек модулей при скролле ----
const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => io.observe(el));

// ---- открытие / закрытие модулей ----
document.querySelectorAll('.module').forEach(btn => {
  btn.addEventListener('click', () => {
    const panel = document.getElementById('detail-' + btn.dataset.target);
    if(panel){
      panel.classList.add('open');
      document.body.style.overflow = 'hidden';
      panel.scrollTop = 0;
    }
  });
});

document.querySelectorAll('[data-close]').forEach(btn => {
  btn.addEventListener('click', () => {
    btn.closest('.detail').classList.remove('open');
    document.body.style.overflow = '';
  });
});

document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape'){
    document.querySelectorAll('.detail.open').forEach(p => p.classList.remove('open'));
    document.body.style.overflow = '';
  }
});
