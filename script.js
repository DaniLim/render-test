// Floating doodle particles on a canvas background
const canvas = document.getElementById('doodle-bg');
const ctx = canvas.getContext('2d');

let particles = [];
const colors = ['#7c5cff', '#ff6fd8', '#5cffb0', '#ffd166'];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function makeParticles(count) {
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 3 + 1.5,
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.4,
    color: colors[Math.floor(Math.random() * colors.length)],
  }));
}
makeParticles(60);

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (const p of particles) {
    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width) p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = 0.5;
    ctx.fill();
  }
  requestAnimationFrame(tick);
}
tick();

// Mood doodle button
const moods = ['✨ feeling groovy', '🌈 vibes: immaculate', '🚀 shipping mode', '🐛 debug energy', '🎨 doodling intensifies', '☁️ floating along'];
const moodBtn = document.getElementById('mood-btn');
const moodText = document.getElementById('mood-text');
moodBtn.addEventListener('click', () => {
  moodText.textContent = moods[Math.floor(Math.random() * moods.length)];
});

// Counter
let count = 0;
const countEl = document.getElementById('count');
document.getElementById('inc').addEventListener('click', () => {
  countEl.textContent = ++count;
});
document.getElementById('dec').addEventListener('click', () => {
  countEl.textContent = --count;
});

// Backend status check
// Set this to your deployed .NET backend URL (or leave for localhost during dev).
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:5080'
  : 'https://render-test-backend-n0e3.onrender.com';

const backendDot = document.getElementById('backend-dot');
const backendText = document.getElementById('backend-text');

fetch(`${API_BASE}/health`)
  .then((res) => {
    if (!res.ok) throw new Error('bad response');
    return res.json();
  })
  .then(() => {
    backendDot.classList.add('online');
    backendText.textContent = 'backend online';
  })
  .catch(() => {
    backendDot.classList.add('offline');
    backendText.textContent = 'backend offline';
  });

// Live clock
const clockEl = document.getElementById('clock');
function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);
