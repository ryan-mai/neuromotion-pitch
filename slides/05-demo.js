(() => {
  let t;
  NM.on('s-demo', {
    enter(el) {
      const n = el.querySelector('.dm-n'), t0 = performance.now() + 1500;
      n.textContent = '1:30'; clearInterval(t);
      t = setInterval(() => {
        const left = Math.max(0, 90 - Math.floor((performance.now() - t0) / 1000));
        n.textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
        if (!left) clearInterval(t);
      }, 250);
    },
    leave() { clearInterval(t); }
  });
})();
