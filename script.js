// ---- солнце (звезда) дрейфует вниз по мере погружения в космос ----
const root = document.documentElement;

function updateSky(){
  const max = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
  const p = Math.min(window.scrollY / max, 1); // 0 → верх страницы, 1 → низ

  // солнце идёт от 18vh (высоко над сценой) до 150vh (уходит далеко вниз, за кадр)
  const sunY = 18 + p * 132;
  root.style.setProperty('--sun-y', `${sunY}vh`);
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

  // свет начинает расходиться из точки, где стоит планета
  if(planetBtn){
    const rect = planetBtn.getBoundingClientRect();
    const fx = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const fy = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    flash.style.setProperty('--fx', `${fx}%`);
    flash.style.setProperty('--fy', `${fy}%`);
  }

  flash.classList.remove('flash-out');
  flash.classList.add('flash-in');

  setTimeout(() => {
    const section = document.getElementById(targetId);
    if(section){
      section.scrollIntoView({ behavior: 'auto', block: 'start' });
      const card = section.querySelector('.lesson-card');
      if(card) card.classList.add('in-view');
    }

    // свет гаснет, открывая урок
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
    }, 550);
  }, 600);
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
