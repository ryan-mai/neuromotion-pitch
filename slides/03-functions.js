(() => {
  // build the speech waveform (bars decay over time = declining speaking ability) + trend line
  const root = document.getElementById('s-functions');
  const g = root.querySelector('.sp-bars'), trend = root.querySelector('.sp-trend');
  const NS = 'http://www.w3.org/2000/svg', N = 22;
  let d = '';
  for (let i = 0; i < N; i++) {
    const env = 1 - (i / (N - 1)) * 0.7;
    const h = Math.max(10, 150 * env * (0.62 + 0.38 * Math.abs(Math.sin(i * 1.7 + 0.6))));
    const x = 18 + i * 10.2, cy = 130;
    const r = document.createElementNS(NS, 'rect');
    r.setAttribute('x', x.toFixed(1)); r.setAttribute('y', (cy - h / 2).toFixed(1));
    r.setAttribute('width', 6); r.setAttribute('height', h.toFixed(1)); r.setAttribute('rx', 3);
    r.style.setProperty('--dl', (-(i % 7) * 0.17).toFixed(2) + 's');
    r.style.setProperty('--t', (0.8 + (i % 5) * 0.15).toFixed(2) + 's');
    g.appendChild(r);
    const ex = 18 + 3 + i * 10.2, ey = cy - 150 * env * 0.8 / 2 - 6;
    d += (i ? 'L' : 'M') + ex.toFixed(1) + ' ' + ey.toFixed(1);
  }
  trend.setAttribute('d', d);
})();
