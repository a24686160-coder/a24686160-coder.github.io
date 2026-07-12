// ---- солнце опускается и небо темнеет при скролле ----
const root = document.documentElement;

function updateSky(){
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const p = Math.min(window.scrollY / max, 1); // 0 → верх страницы, 1 → низ

  // солнце идёт от 22vh (высоко, ясный день) до 118vh (скрылось за горизонтом)
  const sunY = 22 + p * 96;
  root.style.setProperty('--sun-y', `${sunY}vh`);

  // ночь нарастает во второй половине скролла
  const night = Math.max(0, (p - 0.35) / 0.65);
  root.style.setProperty('--night', night.toFixed(3));
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

// ---- запуск к планете и переход к уроку через вспышку света ----
const flash = document.querySelector('.warp-flash');

function goToLesson(targetId, planetBtn){
  if(planetBtn) planetBtn.classList.add('launching');

  // экран начинает постепенно ярко светиться
  flash.classList.remove('flash-out');
  flash.classList.add('flash-in');

  setTimeout(() => {
    const section = document.getElementById(targetId);
    if(section){
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
      const card = section.querySelector('.lesson-card');
      if(card) card.classList.add('in-view');
    }

    // свет постепенно гаснет, открывая урок
    flash.classList.remove('flash-in');
    flash.classList.add('flash-out');

    setTimeout(() => {
      flash.classList.remove('flash-out');
      const section2 = document.getElementById(targetId);
      const card2 = section2 && section2.querySelector('.lesson-card');
      if(card2){
        card2.classList.add('landed');
        setTimeout(() => card2.classList.remove('landed'), 1100);
      }
      if(planetBtn) planetBtn.classList.remove('launching');
    }, 600);
  }, 650);
}

document.querySelectorAll('.planet').forEach(planet => {
  planet.addEventListener('click', () => {
    goToLesson(planet.dataset.target, planet);
  });
});

// ---- назад к планетам ----
const scenes = document.querySelectorAll('.planet-scene');
document.querySelectorAll('.back-up').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.scene, 10) - 1;
    const scene = scenes[idx];
    if(scene) scene.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
