gsap.registerPlugin(ScrollTrigger);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.getElementById('year').textContent = new Date().getFullYear();

/* ============ LENIS SMOOTH SCROLL ============ */
let lenis;
if (window.matchMedia('(hover: hover)').matches && window.Lenis) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
}

/* ============ PRELOADER ============ */
window.addEventListener('load', () => {
  const tl = gsap.timeline({
    onComplete: () => {
      document.querySelector('.preloader').style.pointerEvents = 'none';
      playHero();
    }
  });
  tl.to('.preloader-bar span', { width: '100%', duration: 1, ease: 'power2.inOut' })
    .to('.preloader-word', { y: -20, opacity: 0, duration: .4, ease: 'power2.in' }, '-=.1')
    .to('.preloader', { yPercent: -100, duration: .7, ease: 'power3.inOut' }, '-=.2');
});
// Fallback in case load event is slow/blocked
setTimeout(() => {
  if (document.querySelector('.preloader').style.pointerEvents !== 'none') {
    window.dispatchEvent(new Event('load'));
  }
}, 3500);

/* ============ HERO TITLE REVEAL ============ */
function playHero() {
  if (reduceMotion) {
    gsap.set('.hero-title .word', { y: '0%' });
    gsap.set('.hero-badge, .hero-sub, .hero-cta', { opacity: 1, y: 0 });
    gsap.set('.badge-pill', { opacity: 1, scale: 1 });
    return;
  }
  gsap.to('.hero-title .word', {
    y: '0%', duration: 1.1, ease: 'power4.out', stagger: 0.06, delay: 0.1
  });
  gsap.to('.hero-badge, .hero-sub, .hero-cta', {
    opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12, delay: .5
  });
  gsap.to('.badge-pill', {
    opacity: 1, scale: 1, duration: .8, ease: 'back.out(1.7)', stagger: .08, delay: .7
  });
}
gsap.set('.hero-badge, .hero-sub, .hero-cta', { opacity: 0, y: 20 });
gsap.set('.badge-pill', { opacity: 0, scale: .5 });

/* Parallax the hero copy gently as it scrolls away — adds depth over the
   drifting blobs without pulling focus. */
if (!reduceMotion) {
  gsap.to('.hero-content', {
    yPercent: -14, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
  });
}

/* ============ FLOATING ELEMENTS ============ */
if (!reduceMotion) {
  document.querySelectorAll('[data-float]').forEach((el, i) => {
    gsap.to(el, {
      y: '+=14', duration: 2.4 + (i % 3) * .4, ease: 'sine.inOut',
      repeat: -1, yoyo: true, delay: i * .15
    });
  });
}

/* ============ CUSTOM CURSOR ============ */
const cursorDot = document.querySelector('.cursor-dot');
const cursorRing = document.querySelector('.cursor-ring');
const hasFineCursor = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (hasFineCursor && cursorDot && cursorRing) {
  const dotX = gsap.quickTo(cursorDot, 'x', { duration: .12, ease: 'power2.out' });
  const dotY = gsap.quickTo(cursorDot, 'y', { duration: .12, ease: 'power2.out' });
  const ringX = gsap.quickTo(cursorRing, 'x', { duration: .35, ease: 'power2.out' });
  const ringY = gsap.quickTo(cursorRing, 'y', { duration: .35, ease: 'power2.out' });

  window.addEventListener('mousemove', (e) => {
    dotX(e.clientX); dotY(e.clientY);
    ringX(e.clientX); ringY(e.clientY);
  });

  document.querySelectorAll('[data-hover]').forEach((el) => {
    el.addEventListener('mouseenter', () => { cursorRing.classList.add('is-hover'); cursorDot.classList.add('is-hover'); });
    el.addEventListener('mouseleave', () => { cursorRing.classList.remove('is-hover'); cursorDot.classList.remove('is-hover'); });
  });
}

/* ============ MAGNETIC BUTTONS ============ */
if (hasFineCursor) {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const strength = 0.35;
    const moveX = gsap.quickTo(el, 'x', { duration: .5, ease: 'power3.out' });
    const moveY = gsap.quickTo(el, 'y', { duration: .5, ease: 'power3.out' });

    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - (rect.left + rect.width / 2);
      const relY = e.clientY - (rect.top + rect.height / 2);
      moveX(relX * strength);
      moveY(relY * strength);
    });
    el.addEventListener('mouseleave', () => { moveX(0); moveY(0); });
  });
}

/* ============ HEADER SHOW/HIDE ============ */
const header = document.querySelector('.site-header');
let lastY = 0;
ScrollTrigger.create({
  start: 'top top',
  end: 'max',
  onUpdate: (self) => {
    const y = self.scroll();
    header.classList.toggle('solid', y > 40);
    if (y > lastY && y > 200) header.classList.add('hide');
    else header.classList.remove('hide');
    lastY = y;
  }
});

/* ============ MOBILE MENU ============ */
const menuBtn = document.querySelector('.menu-btn');
const mobileMenu = document.querySelector('.mobile-menu');
menuBtn.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  menuBtn.classList.toggle('open', open);
  gsap.to(menuBtn.querySelector('span:first-child'), { rotate: open ? 45 : 0, y: open ? 9 : 0, duration: .3 });
  gsap.to(menuBtn.querySelector('span:last-child'), { rotate: open ? -45 : 0, y: open ? -9 : 0, duration: .3 });
});
mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mobileMenu.classList.remove('open');
}));

/* ============ SCROLL REVEALS ============ */
if (reduceMotion) {
  gsap.set('.reveal-up', { opacity: 1, y: 0 });
} else {
  gsap.utils.toArray('.reveal-up').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 88%' }
    });
  });
}

/* ============ SCROLL-VELOCITY MARQUEE ============ */
/* The word ribbon drifts on its own, then speeds up and skews with scroll
   velocity — faster as you scroll, easing back to a calm baseline at rest. */
(() => {
  const marquee = document.querySelector('.marquee');
  const track = document.querySelector('.marquee-track');
  if (!marquee || !track || reduceMotion) return;

  marquee.classList.add('js-driven');
  let half = track.scrollWidth / 2 || 1;
  const recalc = () => { half = track.scrollWidth / 2 || 1; };
  window.addEventListener('resize', recalc);

  let x = 0;
  let lastY = window.scrollY;
  let skew = 0;
  gsap.ticker.add(() => {
    const y = window.scrollY;
    const dv = y - lastY;
    lastY = y;
    const speed = 0.6 + Math.min(Math.abs(dv) * 0.22, 7);
    x -= speed;
    if (x <= -half) x += half;
    const targetSkew = gsap.utils.clamp(-10, 10, dv * 0.5);
    skew += (targetSkew - skew) * 0.08;
    track.style.transform = `translateX(${x}px) skewX(${skew.toFixed(2)}deg)`;
  });
})();

/* click flips a work card over to its short brand story (all devices) */
document.querySelectorAll('.brand-card').forEach((card) => {
  card.addEventListener('click', () => card.classList.toggle('is-flipped'));
});

/* ============ WORK CARDS — gentle idle float ============ */
/* Static brand cards drift on a slow, out-of-phase bob so the grid feels
   alive without pulling focus. Hover lift comes from the shared data-hover
   magnetic effect + a deeper shadow in CSS. */
if (!reduceMotion) {
  gsap.utils.toArray('.brand-card-art').forEach((art, i) => {
    gsap.to(art, {
      y: -6,
      rotation: i % 2 ? 1.1 : -1.1,
      duration: 3 + (i % 4) * 0.55,
      delay: i * 0.35,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });
  });

  /* 3D tilt that follows the cursor — the card leans toward the pointer
     while the image zooms (CSS) and a shine sweeps across (CSS ::after). */
  if (hasFineCursor) {
    document.querySelectorAll('.brand-card').forEach((card) => {
      const art = card.querySelector('.brand-card-art');
      const tiltX = gsap.quickTo(art, 'rotationX', { duration: .45, ease: 'power2.out' });
      const tiltY = gsap.quickTo(art, 'rotationY', { duration: .45, ease: 'power2.out' });
      gsap.set(art, { transformPerspective: 700 });
      card.addEventListener('mousemove', (e) => {
        const r = art.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - .5;
        const py = (e.clientY - r.top) / r.height - .5;
        tiltX(py * -14);
        tiltY(px * 14);
      });
      card.addEventListener('mouseleave', () => { tiltX(0); tiltY(0); });
    });
  }
}

/* ============ HERO BLOBS — ambient breathing + pointer parallax ============ */
if (!reduceMotion) {
  const blobs = document.querySelectorAll('.hero-blob');

  // slow autonomous scale/rotate so the hero breathes even without a mouse.
  // (scale/rotation are independent of the x/y the parallax drives, so gsap
  // composes both onto the same element without fighting.)
  blobs.forEach((b, i) => {
    gsap.to(b, {
      scale: 1.15, rotation: i % 2 ? 8 : -8,
      duration: 7 + i * 1.5, ease: 'sine.inOut', repeat: -1, yoyo: true
    });
  });

  if (hasFineCursor) {
    window.addEventListener('mousemove', (e) => {
      const xRatio = e.clientX / window.innerWidth - .5;
      const yRatio = e.clientY / window.innerHeight - .5;
      blobs.forEach((b, i) => {
        gsap.to(b, { x: xRatio * (30 + i * 20), y: yRatio * (30 + i * 20), duration: 1.2, ease: 'power2.out' });
      });
    });
  }
}

/* ============ SMOOTH ANCHOR SCROLL ============ */
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (id.length > 1) {
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        if (lenis) lenis.scrollTo(target, { offset: -20 });
        else target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });
});
