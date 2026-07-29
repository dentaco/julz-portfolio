gsap.registerPlugin(ScrollTrigger, Flip);

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
  gsap.set('.preloader-fill', { '--rise': '-34%' });   // fully dark: feather below the glyphs
  gsap.set('.preloader-word', { y: 34 });
  gsap.set('.preloader-scan', { xPercent: -50, yPercent: -50, top: '84%', scale: .5, opacity: 0 });
  // свет мягко всплывает снизу вверх — имя разгорается, будто восходит солнце
  tl.to('.preloader-scan', { top: '50%', scale: 1.2, opacity: 1, duration: 1.5, ease: 'power2.out' }, 0)
    .to('.preloader-word', { y: 0, duration: 1.5, ease: 'power3.out' }, 0)
    .to('.preloader-fill', { '--rise': '100%', duration: 1.35, ease: 'power2.out' }, 0.12)
    .to('.preloader-scan', { opacity: 0, duration: .6, ease: 'power2.in' }, '-=.3')
    .to('.preloader-word', { y: -20, opacity: 0, duration: .4, ease: 'power2.in' }, '-=.15')
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

/* ============ DECK REEL PLAYBACK ============ */
/* Reels animate on their own — the deck is meant to look alive. Two things
   narrow that down: while the pile is folded only the top few cards are worth
   decoding, and pulling a card out solos it so the rest hold still. */
const deckReels = (() => {
  const inView = new Set();
  let allowed = null;          // null = anything in view may run
  let solo = null, frozen = false;

  const all = () => document.querySelectorAll('.card-video');
  const load = (v) => { if (v && !v.src) { v.src = v.dataset.videoSrc; v.load(); } };

  function sync() {
    const awake = document.visibilityState === 'visible' && !frozen;
    all().forEach((v) => {
      const ambient = !reduceMotion && (!allowed || allowed.has(v));
      const wanted = awake && inView.has(v) && (solo ? v === solo : ambient);
      if (wanted) { load(v); if (v.paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    });
  }

  return {
    load, sync,
    track(v, visible) { visible ? inView.add(v) : inView.delete(v); sync(); },
    /* Limit ambient playback to a subset (the visible top of the folded pile). */
    restrict(list) { allowed = list ? new Set(list) : null; sync(); },
    /* Pull one reel forward: it restarts, everything else stands down. */
    solo(v) {
      solo = v; frozen = false;
      if (v) { load(v); if (v.readyState) { try { v.currentTime = 0; } catch (_) {} } }
      sync();
    },
    release() { solo = null; frozen = false; sync(); },
    freeze(on) { frozen = on; sync(); }
  };
})();

/* ============ WORK DECK — a pile that fans out into themed rows ============ */
(() => {
  const deck = document.getElementById('deck');
  const deckOverlay = document.getElementById('deckOverlay');
  const collapseBtn = document.getElementById('deckCollapse');
  if (!deck || !deckOverlay) return;

  const cards = Array.from(deck.querySelectorAll('.deck-card'));
  if (!cards.length) return;
  const last = Math.max(cards.length - 1, 1);
  /* only the cards you can actually see on the folded pile decode video */
  const topVideos = cards.slice(-4).map((c) => c.querySelector('.card-video')).filter(Boolean);

  let activeCard = null;
  let expanded = false;

  /* ---- folded pile ---- */
  function pileVars(i, spread) {
    const t = i / last;                       // 0 at the back, 1 on top
    return {
      x: (t - .5) * 34 * spread,
      y: (t - .5) * -16 * spread,
      rotation: (t - .5) * 9 * spread,
      scale: 1 - (1 - t) * .05,
      zIndex: i + 1
    };
  }

  function layoutPile(spread = 1, animate = false) {
    if (expanded) return;
    const w = Math.min(260, Math.max(180, deck.clientWidth - 80));
    const h = Math.min(Math.round(w * 1.72), deck.clientHeight - 96);
    const left = Math.round((deck.clientWidth - w) / 2);
    const top = Math.round((deck.clientHeight - h) / 2) - 44;
    cards.forEach((card, i) => {
      card.style.width = w + 'px';
      card.style.height = h + 'px';
      card.style.left = left + 'px';
      card.style.top = top + 'px';
      const vars = pileVars(i, spread);
      animate ? gsap.to(card, { ...vars, duration: .55, ease: 'power3.out' }) : gsap.set(card, vars);
    });
    deck.classList.add('is-ready');
  }

  function clearInline(card) {
    card.style.width = ''; card.style.height = ''; card.style.left = ''; card.style.top = '';
  }

  /* ---- fold / unfold ---- */
  function expand() {
    if (expanded) return;
    expanded = true;
    const state = Flip.getState(cards);
    deck.classList.remove('is-collapsed', 'is-lit');
    deck.classList.add('is-expanded');
    cards.forEach((card) => { clearInline(card); gsap.set(card, { clearProps: 'transform,zIndex' }); });
    Flip.from(state, {
      duration: .9, ease: 'power3.inOut', absolute: true, stagger: .012,
      onComplete: () => ScrollTrigger.refresh()
    });
    deckReels.restrict(null);          // everything on screen animates now
  }

  function collapse() {
    if (!expanded) return;
    if (activeCard) closeCard(activeCard);
    const state = Flip.getState(cards);
    expanded = false;
    deck.classList.remove('is-expanded');
    deck.classList.add('is-collapsed');
    layoutPile();
    Flip.from(state, {
      duration: .8, ease: 'power3.inOut', absolute: true,
      stagger: { each: .01, from: 'end' },
      onComplete: () => ScrollTrigger.refresh()
    });
    deckReels.restrict(topVideos);
  }

  /* ---- one card pulled to the middle ---- */
  function openCard(card) {
    if (activeCard === card) return;
    if (activeCard) closeCard(activeCard);
    activeCard = card;
    // capture every card: the one leaving flow makes the rest reflow, and that
    // shift should glide rather than jump
    const state = Flip.getState(cards);
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
    deckReels.solo(card.querySelector('.card-video'));
  }

  function closeCard(card) {
    const state = Flip.getState(cards);
    card.classList.remove('is-active');
    card.classList.remove('is-flipped');
    deck.classList.remove('has-active');
    deckOverlay.classList.remove('is-visible');
    clearInline(card);
    gsap.set(card, { clearProps: 'transform,zIndex' });
    Flip.from(state, { duration: .55, ease: 'power3.inOut', scale: true, absolute: true });
    if (activeCard === card) activeCard = null;
    deckReels.release();
  }

  /* ---- wiring ---- */
  layoutPile();
  deckReels.restrict(topVideos);
  window.addEventListener('resize', () => { if (!expanded && !activeCard) layoutPile(); });

  if (hasFineCursor) {
    deck.addEventListener('mouseenter', () => {
      if (expanded) return;
      deck.classList.add('is-lit');       // glow up
      layoutPile(1.5, true);              // and breathe apart a little
    });
    deck.addEventListener('mouseleave', () => {
      deck.classList.remove('is-lit');
      if (!expanded) layoutPile(1, true);
    });
  }

  deck.addEventListener('click', (e) => {
    if (e.target.closest('.card-req-btn')) return;   // let the mailto link work
    if (e.target.closest('.deck-collapse')) return;  // handled on the button
    if (!expanded) { expand(); return; }

    const closeBtn = e.target.closest('.card-close');
    const cardEl = e.target.closest('.deck-card');
    if (!cardEl) return;
    if (closeBtn) { e.stopPropagation(); closeCard(cardEl); return; }
    if (cardEl.classList.contains('is-active')) {
      // flipped to the request side — hold the reel, resume on the way back
      deckReels.freeze(cardEl.classList.toggle('is-flipped'));
    } else {
      openCard(cardEl);
    }
  });

  if (collapseBtn) collapseBtn.addEventListener('click', collapse);
  deckOverlay.addEventListener('click', () => { if (activeCard) closeCard(activeCard); });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (activeCard) closeCard(activeCard);
    else if (expanded) collapse();
  });
})();

/* ============ DECK REEL VIDEOS — track what is on screen ============ */
(() => {
  const videos = document.querySelectorAll('.card-video');
  if (!videos.length) return;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(({ target: v, isIntersecting }) => deckReels.track(v, isIntersecting));
  }, { rootMargin: '250px 0px' });
  videos.forEach((v) => io.observe(v));
  document.addEventListener('visibilitychange', () => deckReels.sync());
})();

/* ============ WORK CARDS — gentle idle float ============ */
/* Static brand cards drift on a slow, out-of-phase bob so the grid feels
   alive without pulling focus. Hover lift comes from the shared data-hover
   magnetic effect + a deeper shadow in CSS. */
if (!reduceMotion) {
  gsap.utils.toArray('.zone-reels').forEach((art, i) => {
    gsap.to(art, {
      y: -7,
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
    document.querySelectorAll('.zone').forEach((card) => {
      const art = card.querySelector('.zone-reels');
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
