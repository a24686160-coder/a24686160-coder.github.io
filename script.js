// ---- закат → ночь при скролле (затемняем фото постепенно) ----
const nightLayer = document.querySelector('.overlay-night');

function updateSky(){
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const p = Math.min(window.scrollY / max, 1);
  nightLayer.style.opacity = p;
}
window.addEventListener('scroll', updateSky, { passive: true });
window.addEventListener('resize', updateSky);
updateSky();

// ---- появление карточек уроков при скролле ----
const cards = document.querySelectorAll('.lesson-card');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting){
      entry.target.classList.add('in-view');
    }
  });
}, { threshold: 0.2 });
cards.forEach(el => io.observe(el));

// ---- клик по камню: плавный переход к уроку ----
document.querySelectorAll('.stone').forEach(stone => {
  stone.addEventListener('click', () => {
    const section = document.getElementById(stone.dataset.target);
    if(!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });

    const card = section.querySelector('.lesson-card');
    if(card){
      card.classList.add('in-view');
      setTimeout(() => {
        card.classList.add('landed');
        setTimeout(() => card.classList.remove('landed'), 1000);
      }, 500);
    }
  });
});
