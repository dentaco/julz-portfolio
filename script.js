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
    gsap.set('.badge-pill, .sticker', { opacity: 1, scale: 1 });
    return;
  }
  gsap.to('.hero-title .word', {
    y: '0%', duration: 1.1, ease: 'power4.out', stagger: 0.06, delay: 0.1
  });
  gsap.to('.hero-badge, .hero-sub, .hero-cta', {
    opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .12, delay: .5
  });
  gsap.to('.badge-pill, .sticker', {
    opacity: 1, scale: 1, duration: .8, ease: 'back.out(1.7)', stagger: .08, delay: .7
  });
}
gsap.set('.hero-badge, .hero-sub, .hero-cta', { opacity: 0, y: 20 });
gsap.set('.badge-pill, .sticker', { opacity: 0, scale: .5 });

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
    el.addEventListener('mouseenter', () => cursorRing.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursorRing.classList.remove('is-hover'));
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

/* ============ WORK DECK ============ */
(() => {
  const deck = document.getElementById('deck');
  const deckOverlay = document.getElementById('deckOverlay');
  if (!deck || !deckOverlay) return;

  const cards = Array.from(deck.querySelectorAll('.deck-card'));
  const mid = (cards.length - 1) / 2;
  const REST = cards.map((_, i) => ({ rot: (i - mid) * 4, y: Math.abs(i - mid) * 10 }));
  let activeCard = null;

  function layoutDeck() {
    if (!hasFineCursor) { deck.classList.add('is-ready'); return; }
    const deckRect = deck.getBoundingClientRect();
    const cardW = 230, cardH = 322, overlap = 150;
    const totalWidth = cardW + overlap * (cards.length - 1);
    const startX = Math.max(0, (deckRect.width - totalWidth) / 2);
    cards.forEach((card, i) => {
      const left = Math.round(startX + i * overlap) + 'px';
      const top = '60px';
      card.dataset.restLeft = left;
      card.dataset.restTop = top;
      card.dataset.restWidth = cardW + 'px';
      card.dataset.restHeight = cardH + 'px';
      if (!card.classList.contains('is-active')) {
        card.style.width = cardW + 'px';
        card.style.height = cardH + 'px';
        card.style.left = left;
        card.style.top = top;
        gsap.set(card, { x: 0, y: REST[i].y, rotation: REST[i].rot, scale: 1, zIndex: i + 1 });
      }
    });
    deck.classList.add('is-ready');
  }
  layoutDeck();
  window.addEventListener('resize', () => { if (!activeCard) layoutDeck(); });

  if (hasFineCursor) {
    deck.addEventListener('mousemove', (e) => {
      if (activeCard) return;
      const mouseX = e.clientX;
      let closestIndex = 0, closestDist = Infinity;
      cards.forEach((card, i) => {
        const r = card.getBoundingClientRect();
        const d = Math.abs(mouseX - (r.left + r.width / 2));
        if (d < closestDist) { closestDist = d; closestIndex = i; }
      });
      cards.forEach((card, i) => {
        const delta = i - closestIndex;
        if (delta === 0) {
          gsap.to(card, { rotation: 0, y: -40, scale: 1.12, x: 0, zIndex: 100, duration: .4, ease: 'power3.out' });
        } else {
          const dist = Math.min(Math.abs(delta), 3);
          gsap.to(card, {
            rotation: REST[i].rot, y: REST[i].y + dist * 6,
            x: Math.sign(delta) * dist * 18, scale: 1 - dist * 0.02,
            zIndex: 50 - dist, duration: .4, ease: 'power3.out'
          });
        }
      });
    });
    deck.addEventListener('mouseleave', () => {
      if (activeCard) return;
      cards.forEach((card, i) => {
        gsap.to(card, { rotation: REST[i].rot, y: REST[i].y, x: 0, scale: 1, zIndex: i + 1, duration: .5, ease: 'power3.out' });
      });
    });
  }

  function openCard(card) {
    if (activeCard === card) return;
    if (activeCard) closeCard(activeCard);
    activeCard = card;
    const state = Flip.getState(card);
    card.classList.add('is-active');
    deck.classList.add('has-active');
    deckOverlay.classList.add('is-visible');
    const isMobile = window.innerWidth < 640;
    const w = isMobile ? Math.min(window.innerWidth - 48, 340) : 400;
    const h = Math.round(w * 1.4);
    card.style.width = w + 'px';
    card.style.height = h + 'px';
    card.style.left = Math.round((window.innerWidth - w) / 2) + 'px';
    card.style.top = Math.round((window.innerHeight - h) / 2) + 'px';
    gsap.set(card, { rotation: 0, scale: 1, x: 0, y: 0, zIndex: 1000 });
    Flip.from(state, { duration: .65, ease: 'power3.inOut', scale: true, absolute: true });
  }

  function closeCard(card) {
    const state = Flip.getState(card);
    const idx = cards.indexOf(card);
    card.classList.remove('is-active');
    card.classList.remove('is-flipped');
    deck.classList.remove('has-active');
    deckOverlay.classList.remove('is-visible');
    if (hasFineCursor) {
      card.style.width = card.dataset.restWidth;
      card.style.height = card.dataset.restHeight;
      card.style.left = card.dataset.restLeft;
      card.style.top = card.dataset.restTop;
      gsap.set(card, { rotation: REST[idx].rot, y: REST[idx].y, x: 0, scale: 1, zIndex: idx + 1 });
    } else {
      card.style.width = ''; card.style.height = ''; card.style.left = ''; card.style.top = '';
      gsap.set(card, { clearProps: 'all' });
    }
    Flip.from(state, { duration: .55, ease: 'power3.inOut', scale: true, absolute: true });
    if (activeCard === card) activeCard = null;
  }

  deck.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('.card-close');
    const cardEl = e.target.closest('.deck-card');
    if (!cardEl) return;
    if (closeBtn) { e.stopPropagation(); closeCard(cardEl); return; }
    if (cardEl.classList.contains('is-active')) {
      cardEl.classList.toggle('is-flipped');
    } else {
      openCard(cardEl);
    }
  });
  deckOverlay.addEventListener('click', () => { if (activeCard) closeCard(activeCard); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && activeCard) closeCard(activeCard); });
})();

/* ============ DECK REEL VIDEOS — lazy load + play only when visible ============ */
/* Card fronts hold real Instagram reels (self-hosted, muted loops). The mp4
   only loads once the deck scrolls near the viewport, and playback pauses
   offscreen so the page stays light. Reduced-motion users keep the poster. */
(() => {
  const videos = document.querySelectorAll('.card-video');
  if (!videos.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        if (!v.src) { v.src = v.dataset.videoSrc; v.load(); }
        if (!reduceMotion) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    });
  }, { rootMargin: '200px 0px' });

  videos.forEach((v) => io.observe(v));

  /* play() while the tab is hidden gets rejected, so reels opened in a
     background tab would sit frozen — kick the visible ones on return. */
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible' || reduceMotion) return;
    videos.forEach((v) => {
      if (!v.src || !v.paused) return;
      const r = v.getBoundingClientRect();
      if (r.bottom > -200 && r.top < window.innerHeight + 200) v.play().catch(() => {});
    });
  });
})();

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
