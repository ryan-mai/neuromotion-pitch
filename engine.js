/* NeuroMotion deck engine: scaling, navigation, View-Transition slide changes, text splitting,
   counters, stagger indices, logo injection, per-slide hooks. */
(() => {
  const stage = document.getElementById('stage');
  const slides = [...document.querySelectorAll('#deck > .slide')];
  const progress = document.getElementById('progress');
  const counter = document.getElementById('counter');
  const root = document.documentElement;
  let cur = -1, busy = false;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasVT = 'startViewTransition' in document && !reduce;
  if (!hasVT) root.classList.add('no-vt');

  /* ---- fit 1920x1080 stage to the window ---- */
  function fit() {
    const s = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = `translate(${(innerWidth - 1920 * s) / 2}px,${(innerHeight - 1080 * s) / 2}px) scale(${s})`;
    stage.style.setProperty('--scale', s);
  }
  addEventListener('resize', fit); fit();

  /* ---- prep: split text, stagger indices, chrome, logos ---- */
  const split = (el) => {
    const mode = el.dataset.split || 'chars'; let i = 0;
    const walk = (node) => [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        const parts = mode === 'words' ? n.textContent.split(/(\s+)/) : [...n.textContent];
        parts.forEach((p) => {
          if (/^\s+$/.test(p)) { frag.append(p); return; }
          if (p === '') return;
          const w = document.createElement('span'); w.className = mode === 'words' ? 'wd' : 'ch';
          w.style.setProperty('--i', i++); w.textContent = p; frag.append(w);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && !n.matches('br,svg,img')) { n.classList.add('split-in'); walk(n); }
    });
    walk(el);
  };
  document.querySelectorAll('[data-split]').forEach(split);
  document.querySelectorAll('[data-stagger]').forEach((p) => {
    const st = p.dataset.stagger; if (st) p.style.setProperty('--st', st + 'ms');
    [...p.children].forEach((c, i) => c.style.setProperty('--i', i));
  });

  const LOGOS = { // simple-icons CDN (loaded by the viewer's browser) with styled text fallback
    vultr:      { slug: 'vultr',        name: 'Vultr',       color: '007BFC' },
    gemini:     { local: 'assets/gemini.png', name: 'Gemini' },
    elevenlabs: { slug: 'elevenlabs',   name: 'ElevenLabs',  color: 'ffffff' },
    tigerdata:  { slug: 'timescale',    name: 'Tiger Data',  color: 'FDB515' },
    mediapipe:  { slug: 'mediapipe',    name: 'MediaPipe',   color: '0097A7' },
    supabase:   { slug: 'supabase',     name: 'Supabase',    color: '3FCF8E' },
  };
  document.querySelectorAll('.logo[data-logo]').forEach((el) => {
    const L = LOGOS[el.dataset.logo]; if (!L) return;
    const img = new Image(); img.alt = L.name;
    img.src = L.local || `https://cdn.simpleicons.org/${L.slug}/${el.dataset.color || L.color}`;
    img.onerror = () => img.remove();
    el.append(img);
    if (!el.hasAttribute('data-mark-only')) { const t = document.createElement('span'); t.className = 'lw'; t.textContent = L.name; el.append(t); }
  });

  slides.forEach((s, i) => {
    if (s.hasAttribute('data-chrome') && s.dataset.chrome === 'off') return;
    const c = document.createElement('div'); c.className = 'chrome-top';
    c.innerHTML = `<div class="brand"><img src="assets/nm-logo.svg" alt="">NeuroMotion</div><div>${s.dataset.section || ''}</div>`;
    s.append(c);
  });

  /* ---- counters: <span data-count="81" data-dur="1400" data-dec="0"> ---- */
  const runCounters = (s) => s.querySelectorAll('[data-count]').forEach((el) => {
    const to = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), dur = +(el.dataset.dur || 1400), delay = +(el.dataset.delay || 500);
    const t0 = performance.now() + delay; el.textContent = (0).toFixed(dec);
    const tick = (t) => {
      if (!s.classList.contains('is-active')) return;
      const k = Math.max(0, Math.min(1, (t - t0) / dur)), e = 1 - Math.pow(1 - k, 4);
      el.textContent = (to * e).toFixed(dec); if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ---- per-slide hooks: window.NM.on('s-title', {enter(el){}, leave(el){}}) ---- */
  const hooks = {}; window.NM = { on: (id, h) => (hooks[id] = h) };

  /* ---- go ---- */
  function swap(n, dir) {
    const prev = slides[cur];
    if (prev) { prev.classList.remove('is-active'); prev.classList.add('is-leaving'); hooks[prev.id]?.leave?.(prev);
      setTimeout(() => prev.classList.remove('is-leaving'), 1000); }
    cur = n; const s = slides[n];
    s.querySelectorAll('video').forEach((v) => { v.currentTime = 0; v.play().catch(() => {}); });
    s.classList.add('is-active');
    progress.style.transform = `scaleX(${(n + 1) / slides.length})`;
    counter.textContent = `${String(n + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    runCounters(s); hooks[s.id]?.enter?.(s);
    history.replaceState(null, '', '#' + (n + 1));
  }
  function go(n) {
    n = Math.max(0, Math.min(slides.length - 1, n));
    if (n === cur || busy) return;
    const dir = n > cur ? 'next' : 'prev'; root.dataset.dir = dir;
    if (cur < 0 || !hasVT) { swap(n, dir); return; }
    busy = true;
    const t = document.startViewTransition(() => swap(n, dir));
    t.ready.catch(() => {}); t.updateCallbackDone.catch(() => {});
    t.finished.catch(() => {}).finally(() => { busy = false; if (cur !== n) swap(n, dir); });
  }
  const next = () => go(cur + 1), prev = () => go(cur - 1);
  addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') go(0); else if (e.key === 'End') go(slides.length - 1);
    else if (e.key === 'f' || e.key === 'F') document.fullscreenElement ? document.exitFullscreen() : root.requestFullscreen?.();
  });
  addEventListener('click', (e) => { if (e.target.closest('a,button,video,[data-noadvance]')) return; (e.clientX < innerWidth * 0.2 ? prev : next)(); });
  let tx = 0; addEventListener('touchstart', (e) => (tx = e.touches[0].clientX), { passive: true });
  addEventListener('touchend', (e) => { const d = e.changedTouches[0].clientX - tx; if (Math.abs(d) > 50) (d < 0 ? next : prev)(); });
  addEventListener('pointermove', (e) => {
    const r = stage.getBoundingClientRect(), k = r.width / 1920;
    stage.style.setProperty('--mx', ((e.clientX - r.left) / k) + 'px'); stage.style.setProperty('--my', ((e.clientY - r.top) / k) + 'px');
  });
  addEventListener('hashchange', () => go((parseInt(location.hash.slice(1)) || 1) - 1));
  document.fonts?.ready.then(() => go((parseInt(location.hash.slice(1)) || 1) - 1));
  setTimeout(() => { if (cur < 0) go(0); }, 1200);
  window.NM.go = go;
})();
