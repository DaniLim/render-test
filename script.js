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
  ? 'http://localhost:8080'
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

// Visit counter (shared, backed by the .NET API)
const visitCountEl = document.getElementById('visit-count');
fetch(`${API_BASE}/api/visits`, { method: 'POST' })
  .then((res) => res.json())
  .then((data) => { visitCountEl.textContent = data.visits; })
  .catch(() => { visitCountEl.textContent = '?'; });

// Guestbook
const gbForm = document.getElementById('guestbook-form');
const gbNameInput = document.getElementById('gb-name');
const gbMessageInput = document.getElementById('gb-message');
const gbError = document.getElementById('gb-error');
const gbList = document.getElementById('guestbook-list');

function timeAgo(isoString) {
  const seconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function renderGuestbook(entries) {
  if (!entries.length) {
    gbList.innerHTML = '<li class="gb-empty">No messages yet — be the first to sign!</li>';
    return;
  }
  gbList.innerHTML = entries.map((e) => `
    <li>
      <div class="gb-meta"><span>${escapeHtml(e.name)}</span><span>${timeAgo(e.createdAt)}</span></div>
      <div>${escapeHtml(e.message)}</div>
    </li>
  `).join('');
}

function loadGuestbook() {
  return fetch(`${API_BASE}/api/guestbook`)
    .then((res) => res.json())
    .then(renderGuestbook)
    .catch(() => {
      gbList.innerHTML = '<li class="gb-empty">Couldn\'t reach the backend.</li>';
    });
}

gbForm.addEventListener('submit', (e) => {
  e.preventDefault();
  gbError.textContent = '';

  fetch(`${API_BASE}/api/guestbook`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: gbNameInput.value, message: gbMessageInput.value }),
  })
    .then(async (res) => {
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Something went wrong.');
      }
      gbMessageInput.value = '';
      return loadGuestbook();
    })
    .catch((err) => {
      gbError.textContent = err.message;
    });
});

loadGuestbook();

// Live clock
const clockEl = document.getElementById('clock');
function updateClock() {
  clockEl.textContent = new Date().toLocaleTimeString();
}
updateClock();
setInterval(updateClock, 1000);

// Click sparkles
const card = document.querySelector('.card');
card.addEventListener('click', (e) => {
  if (e.target.closest('button')) return;
  const sparkle = document.createElement('span');
  sparkle.className = 'sparkle';
  sparkle.textContent = '✨';
  sparkle.style.left = `${e.clientX}px`;
  sparkle.style.top = `${e.clientY}px`;
  document.body.appendChild(sparkle);
  sparkle.addEventListener('animationend', () => sparkle.remove());
});
