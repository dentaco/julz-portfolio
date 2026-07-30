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
/* Every reel on screen animates — the row is meant to look alive. The one
   exception is pulling a card out: that solos it and the rest hold still. */
const deckReels = (() => {
  const inView = new Set();
  let solo = null, frozen = false;

  const all = () => document.querySelectorAll('.card-video');
  const load = (v) => { if (v && !v.src) { v.src = v.dataset.videoSrc; v.load(); } };

  function sync() {
    const awake = document.visibilityState === 'visible' && !frozen;
    all().forEach((v) => {
      const wanted = awake && inView.has(v) && (solo ? v === solo : !reduceMotion);
      if (wanted) { load(v); if (v.paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    });
  }

  return {
    load, sync,
    track(v, visible) { visible ? inView.add(v) : inView.delete(v); sync(); },
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

/* ============ WORK DECK — one big fan that opens into small themed ones ============ */
(() => {
  const deck = document.getElementById('deck');
  const deckOverlay = document.getElementById('deckOverlay');
  const collapseBtn = document.getElementById('deckCollapse');
  if (!deck || !deckOverlay) return;

  const cards = Array.from(deck.querySelectorAll('.deck-card'));
  if (!cards.length) return;
  const groups = Array.from(deck.querySelectorAll('.deck-group'));
  const groupCards = new Map(groups.map((g) => [g, Array.from(g.querySelectorAll('.deck-card'))]));

  let activeCard = null;
  let expanded = false;

  /* ---- fan geometry ----
     A stack of cards rotated about a pivot below them becomes an arc. Rise and
     reach are tied by rise = reach * tan(spread/4), so the sweep angle sets how
     bent it looks and the container sets how wide. Same maths drives the big
     fan and the small per-theme ones. */
  const RATIO = 1.72;              // card height / width
  const SPREAD = 20;               // big fan, end to end
  const MINI_STEP = 9;             // degrees between neighbours in a mini deck
  const MINI_MAX = 46;             // and a cap on the total sweep
  let fan = null;                          // big-fan geometry
  const miniFans = new Map();              // group -> mini-fan geometry

  function fanGeometry(boxW, cardW, spread) {
    const cardH = Math.round(cardW * RATIO);
    const half = (spread / 2) * Math.PI / 180;
    const reach = spread > 0 ? Math.max(0, (boxW * 0.92 - cardW) / 2) : 0;
    const radius = spread > 0 ? reach / Math.sin(half) : 1;
    const rise = spread > 0 ? radius * (1 - Math.cos(half)) : 0;
    return {
      cardW: Math.round(cardW), cardH, radius, spread,
      originPct: ((radius + cardH / 2) / cardH) * 100,
      pivotY: cardH / 2 + radius,            // from the fan box's top
      height: Math.round(cardH + rise),
      left: Math.round((boxW - cardW) / 2)
    };
  }

  const angleAt = (i, count, spread) =>
    count < 2 ? 0 : -spread / 2 + (spread / (count - 1)) * i;

  function placeCard(card, geo, i, count, top) {
    card.style.width = geo.cardW + 'px';
    card.style.height = geo.cardH + 'px';
    card.style.left = geo.left + 'px';
    card.style.top = top + 'px';
    gsap.set(card, {
      rotation: angleAt(i, count, geo.spread),
      transformOrigin: `50% ${geo.originPct}%`,
      x: 0, y: 0, scale: 1, zIndex: i + 1
    });
  }

  /* ---- the big fan, collapsed ---- */
  function layoutFan() {
    if (expanded) return;
    const deckW = deck.clientWidth || 1;
    const cardW = Math.max(72, Math.min(190, deckW * 0.155));
    fan = fanGeometry(deckW, cardW, SPREAD);
    fan.top = 18;
    deck.style.setProperty('--fan-h', (fan.height + fan.top + 92) + 'px');
    cards.forEach((card, i) => placeCard(card, fan, i, cards.length, fan.top));
    deck.classList.add('is-ready');
  }

  /* ---- one small fan per theme, expanded ---- */
  function layoutMiniFans() {
    if (!expanded) return;
    miniFans.clear();
    groups.forEach((group) => {
      const box = group.querySelector('.deck-group-fan');
      const members = groupCards.get(group) || [];
      if (!box || !members.length) return;
      const boxW = box.clientWidth || 1;
      const cardW = Math.max(64, Math.min(168, boxW * 0.44));
      const spread = Math.min(MINI_MAX, MINI_STEP * (members.length - 1));
      const geo = fanGeometry(boxW, cardW, spread);
      box.style.height = geo.height + 'px';
      miniFans.set(group, geo);
      members.forEach((card, i) => {
        if (card === activeCard) return;     // the open one is out of the deck
        placeCard(card, geo, i, members.length, 0);
      });
    });
  }

  const relayout = () => (expanded ? layoutMiniFans() : layoutFan());

  /* Put a card back where its mini deck expects it. */
  function restoreToMini(card) {
    const group = card.closest('.deck-group');
    const geo = miniFans.get(group);
    const members = groupCards.get(group);
    if (!geo || !members) return false;
    placeCard(card, geo, members.indexOf(card), members.length, 0);
    return true;
  }

  /* ---- which card is under the pointer ----
     Worked out from the angle around the fan's pivot, not from which element
     caught the event: the cards overlap and the lifted one jumps to the front,
     so hit-testing skips around instead of stepping neighbour to neighbour. */
  function pickFrom(geo, list, boxRect, x, y) {
    if (!geo || !list.length) return null;
    if (list.length < 2) return list[0];
    const px = boxRect.left + geo.left + geo.cardW / 2;
    const py = boxRect.top + geo.pivotY;
    const dx = x - px, dy = py - y;
    const dist = Math.hypot(dx, dy);
    if (dist < geo.radius - geo.cardH / 2 - 24 || dist > geo.radius + geo.cardH / 2 + 24) return null;
    const deg = Math.atan2(dx, dy) * 180 / Math.PI;
    const i = Math.round((deg + geo.spread / 2) / (geo.spread / (list.length - 1)));
    if (i < 0 || i > list.length - 1) return null;
    return list[i];
  }

  function pickCard(x, y) {
    if (!expanded) {
      if (!fan) return null;
      const r = deck.getBoundingClientRect();
      return pickFrom(fan, cards, { left: r.left, top: r.top + fan.top }, x, y);
    }
    for (const group of groups) {
      const box = group.querySelector('.deck-group-fan');
      if (!box) continue;
      const r = box.getBoundingClientRect();
      if (x < r.left - 12 || x > r.right + 12 || y < r.top - 12 || y > r.bottom + 12) continue;
      return pickFrom(miniFans.get(group), groupCards.get(group) || [], r, x, y);
    }
    return null;
  }

  function homeZ(card) {
    const list = expanded ? (groupCards.get(card.closest('.deck-group')) || []) : cards;
    return list.indexOf(card) + 1;
  }

  /* Hovering thumbs a card up out of the hand. */
  function liftCard(card, on) {
    if (!card || card.classList.contains('is-active')) return;
    gsap.to(card, {
      y: on ? (expanded ? -16 : -26) : 0,
      scale: on ? 1.06 : 1,
      zIndex: on ? 200 : homeZ(card),
      duration: .38, ease: 'power3.out'
    });
  }

  /* ---- fold / unfold ---- */
  function expand() {
    if (expanded) return;
    const state = Flip.getState(cards);
    expanded = true;
    deck.classList.remove('is-collapsed', 'is-lit');
    deck.classList.add('is-expanded');
    deck.style.removeProperty('--fan-h');
    layoutMiniFans();
    Flip.from(state, {
      duration: .9, ease: 'power3.inOut', absolute: true, stagger: .012,
      onComplete: () => ScrollTrigger.refresh()
    });
  }

  function collapse() {
    if (!expanded) return;
    if (activeCard) closeCard(activeCard);
    const state = Flip.getState(cards);
    expanded = false;
    deck.classList.remove('is-expanded');
    deck.classList.add('is-collapsed');
    groups.forEach((g) => {
      const box = g.querySelector('.deck-group-fan');
      if (box) box.style.height = '';
    });
    layoutFan();
    Flip.from(state, {
      duration: .8, ease: 'power3.inOut', absolute: true,
      stagger: { each: .01, from: 'end' },
      onComplete: () => ScrollTrigger.refresh()
    });
  }

  /* ---- one card pulled out to play ---- */
  function openCard(card) {
    if (activeCard === card) return;
    if (activeCard) closeCard(activeCard);     // the last one folds back first
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
    deckReels.solo(card.querySelector('.card-video'));
  }

  function closeCard(card) {
    const state = Flip.getState(card);
    card.classList.remove('is-active');
    card.classList.remove('is-flipped');
    deck.classList.remove('has-active');
    deckOverlay.classList.remove('is-visible');
    if (activeCard === card) activeCard = null;
    if (!(expanded && restoreToMini(card))) {
      card.style.width = ''; card.style.height = ''; card.style.left = ''; card.style.top = '';
      gsap.set(card, { clearProps: 'transform,zIndex' });
    }
    Flip.from(state, { duration: .55, ease: 'power3.inOut', scale: true, absolute: true });
    deckReels.release();
  }

  /* ---- wiring ---- */
  layoutFan();
  window.addEventListener('resize', () => { if (!activeCard) relayout(); });

  if (hasFineCursor) {
    let hovered = null;
    const setHover = (card) => {
      if (card === hovered) return;
      if (hovered) liftCard(hovered, false);
      hovered = card;
      if (card) liftCard(card, true);
    };
    deck.addEventListener('mousemove', (e) => setHover(activeCard ? null : pickCard(e.clientX, e.clientY)));
    deck.addEventListener('mouseleave', () => setHover(null));
  }

  /* Clicking the closed fan lights the whole thing up first, then unfolds —
     the flare is the acknowledgement, so it has to land before the layout moves. */
  function lightUpAndExpand() {
    if (expanded || deck.classList.contains('is-lit')) return;
    deck.classList.add('is-lit');
    if (reduceMotion) { expand(); deck.classList.remove('is-lit'); return; }
    gsap.to(cards, { y: -20, duration: .34, ease: 'power2.out', stagger: { each: .014, from: 'center' } });
    gsap.delayedCall(.54, () => {
      gsap.set(cards, { y: 0 });
      expand();
      gsap.delayedCall(.55, () => deck.classList.remove('is-lit'));
    });
  }

  deck.addEventListener('click', (e) => {
    if (e.target.closest('.card-req-btn')) return;   // let the mailto link work
    if (e.target.closest('.deck-collapse')) return;  // handled on the button
    if (!expanded) { lightUpAndExpand(); return; }

    const closeBtn = e.target.closest('.card-close');
    const cardEl = e.target.closest('.deck-card');
    if (closeBtn && cardEl) { e.stopPropagation(); closeCard(cardEl); return; }
    if (cardEl && cardEl.classList.contains('is-active')) {
      // flipped to the request side — hold the reel, resume on the way back
      deckReels.freeze(cardEl.classList.toggle('is-flipped'));
      return;
    }
    // pick by angle, same as the hover, so you get the card you can see
    const picked = e.target.closest('.deck-group-fan') ? pickCard(e.clientX, e.clientY) : cardEl;
    if (picked) openCard(picked);
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
