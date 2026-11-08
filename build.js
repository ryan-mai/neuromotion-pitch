// Concatenates slides/*.html (+ optional slides/*.css, slides/*.js with same basename) into index.html
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'slides');
const names = [...new Set(fs.readdirSync(dir).filter(f => /^\d\d-.*\.(html|css|js)$/.test(f)).map(f => f.replace(/\.(html|css|js)$/, '')))].sort();
const rd = (n, e) => { const p = path.join(dir, n + '.' + e); return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : ''; };
let html = fs.readFileSync(path.join(__dirname, 'shell.html'), 'utf8');
html = html.replace('/*__SLIDE_CSS__*/', () => names.map(n => `/* ${n} */\n` + rd(n, 'css')).join('\n'))
           .replace('<!--__SLIDES__-->', () => names.map(n => rd(n, 'html')).join('\n'))
           .replace('/*__SLIDE_JS__*/', () => names.map(n => rd(n, 'js')).join('\n'));
fs.writeFileSync(path.join(__dirname, 'index.html'), html);
console.log('built', names.length, 'slides:', names.join(', '));
