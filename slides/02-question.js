NM.on('s-question', {
  enter(el) {
    const out = el.querySelector('#q-months'); let raf;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { out.textContent = '24'; return; }
    out.textContent = '0';
    const t0 = performance.now() + 1000, dur = 4000;
    const tick = (t) => {
      if (!el.classList.contains('is-active')) return;
      const k = Math.max(0, Math.min(1, (t - t0) / dur));
      out.textContent = Math.round(24 * k);
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }
});
