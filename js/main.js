/* =========================================================
   JT SERVICE — interactions
   ========================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Header : ombre au scroll ---------- */
  const header = document.querySelector('.site-header');
  const onScrollHeader = () => {
    if(!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive:true });

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  const scrim = document.querySelector('.nav-scrim');
  const closeNav = () => {
    nav?.classList.remove('open');
    scrim?.classList.remove('show');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  };
  const openNav = () => {
    nav?.classList.add('open');
    scrim?.classList.add('show');
    toggle?.setAttribute('aria-expanded', 'true');
    document.body.classList.add('nav-open');
  };
  toggle?.addEventListener('click', () => {
    nav?.classList.contains('open') ? closeNav() : openNav();
  });
  scrim?.addEventListener('click', closeNav);
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  window.addEventListener('keydown', e => { if(e.key === 'Escape') closeNav(); });

  /* ---------- Reveal au scroll ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if('IntersectionObserver' in window && revealEls.length){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold:0.14, rootMargin:'0px 0px -60px 0px' });
    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i % 3) * 60 + 'ms';
      io.observe(el);
    });
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* ---------- Ligne de courant (spine) : suit la progression de scroll ---------- */
  const flow = document.querySelector('.power-spine .flow');
  if(flow){
    const totalLength = flow.getTotalLength();
    flow.style.strokeDasharray = totalLength;
    const updateSpine = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
      flow.style.strokeDashoffset = totalLength - totalLength * progress;
    };
    flow.style.strokeDashoffset = totalLength;
    updateSpine();
    window.addEventListener('scroll', updateSpine, { passive:true });
    window.addEventListener('resize', updateSpine);
  }

  /* ---------- Carousel hero (crossfade) ---------- */
  const heroCarousel = document.querySelector('#hero-carousel');
  if(heroCarousel){
    const slides = [...heroCarousel.querySelectorAll('.hero-slide')];
    const dots = [...document.querySelectorAll('.hero-carousel-dots .dot')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let current = slides.findIndex(s => s.classList.contains('active'));
    if(current < 0) current = 0;
    let timer = null;

    const goTo = (index) => {
      slides[current]?.classList.remove('active');
      dots[current]?.classList.remove('active');
      current = (index + slides.length) % slides.length;
      slides[current]?.classList.add('active');
      dots[current]?.classList.add('active');
    };
    const next = () => goTo(current + 1);
    const startAutoplay = () => {
      if(reduceMotion) return;
      stopAutoplay();
      timer = setInterval(next, 4500);
    };
    const stopAutoplay = () => { if(timer) clearInterval(timer); };

    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => { goTo(i); startAutoplay(); });
    });
    heroCarousel.addEventListener('mouseenter', stopAutoplay);
    heroCarousel.addEventListener('mouseleave', startAutoplay);

    startAutoplay();
  }

  /* ---------- Filtre projets ---------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      projectCards.forEach(card => {
        const match = filter === 'tous' || card.dataset.category === filter;
        card.style.display = match ? '' : 'none';
      });
    });
  });

  /* ---------- FAQ accordéon ---------- */
  document.querySelectorAll('.faq-q').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if(!wasOpen) item.classList.add('open');
    });
  });

  /* ---------- Formulaire de contact (démo front-end) ---------- */
  const form = document.querySelector('#contact-form');
  const status = document.querySelector('#form-status');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!form.checkValidity()){
      form.reportValidity();
      return;
    }
    status.textContent = 'Message envoyé — merci ! Notre équipe revient vers vous sous 24 à 48 h ouvrées.';
    status.classList.add('show', 'ok');
    form.reset();
  });

});
