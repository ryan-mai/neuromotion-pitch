(() => {
  const box = document.querySelector('#s-title .pts');
  if (!box) return;
  let seed = 7; const r = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 46; i++) {
    const p = document.createElement('i'), s = 3 + r() * 6;
    p.style.cssText = `left:${(r() * 1920) | 0}px;top:${(300 + r() * 780) | 0}px;width:${s}px;height:${s}px;--t:${(9 + r() * 9).toFixed(1)}s;--dl:${(-r() * 14).toFixed(1)}s;--dx:${((r() - .5) * 160) | 0}px;--o:${(.2 + r() * .5).toFixed(2)};` +
      (r() > .8 ? 'background:var(--orange-l)' : r() > .6 ? 'background:var(--cream)' : '');
    box.append(p);
  }
})();
