// ---- закат → ночь при скролле ----
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
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if(entry.isIntersecting) entry.target.classList.add('in-view');
  });
}, { threshold: 0.2 });
cards.forEach(el => cardObserver.observe(el));

// ---- разрушение камня и переход к уроку ----
function spawnRubble(container){
  for(let i = 0; i < 9; i++){
    const piece = document.createElement('div');
    piece.className = 'rubble';
    const angle = Math.random() * Math.PI * 2;
    const dist = 60 + Math.random() * 120;
    piece.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    piece.style.setProperty('--dy', `${Math.sin(angle) * dist + 80}px`);
    piece.style.setProperty('--rot', `${(Math.random() * 360) - 180}deg`);
    piece.style.animationDelay = `${Math.random() * 0.1}s`;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 900);
  }
}

function goToLesson(targetId, stoneScene){
  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 650);

  if(stoneScene){
    const stoneBtn = stoneScene.querySelector('.stone');
    const wrap = stoneScene.querySelector('.stone-wrap');
    if(stoneBtn && wrap){
      spawnRubble(wrap);
      stoneBtn.classList.add('falling');
      setTimeout(() => stoneBtn.classList.remove('falling'), 900);
    }
  }

  setTimeout(() => {
    const section = document.getElementById(targetId);
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
  }, 550);
}

document.querySelectorAll('.stone').forEach(stone => {
  stone.addEventListener('click', () => {
    const scene = stone.closest('.stone-scene');
    goToLesson(stone.dataset.target, scene);
  });
});

// ---- назад к скалам ----
const scenes = document.querySelectorAll('.stone-scene');
document.querySelectorAll('.back-up').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.scene, 10) - 1;
    const scene = scenes[idx];
    if(scene) scene.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
