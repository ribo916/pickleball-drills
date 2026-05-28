import { state } from './state.js';
import { ALL_TAGS } from './constants.js';
import { esc } from './utils.js';
import { showView } from './navigation.js';

const rState = {
  selectedTags: new Set(),
  pickedDrill: null,
};

export function showRandomizer() {
  rState.selectedTags.clear();
  rState.pickedDrill = null;

  const drillTags = new Set(state.drills.flatMap(d => d.tags));
  const allTags = [...new Set([...ALL_TAGS, ...drillTags])];

  const container = document.getElementById('randomizer-tags');
  container.innerHTML = allTags
    .map(t => `<button class="tag-toggle" data-tag="${esc(t)}">${esc(t)}</button>`)
    .join('');

  container.onclick = e => {
    const btn = e.target.closest('[data-tag]');
    if (!btn) return;
    const tag = btn.dataset.tag;
    if (rState.selectedTags.has(tag)) {
      rState.selectedTags.delete(tag);
      btn.classList.remove('selected');
    } else {
      rState.selectedTags.add(tag);
      btn.classList.add('selected');
    }
  };

  const result = document.getElementById('randomizer-result');
  result.innerHTML = '';
  result.className = 'randomizer-result';

  showView('randomizer');
}

export function pickRandomDrill() {
  const pool = rState.selectedTags.size === 0
    ? state.drills
    : state.drills.filter(d => d.tags.some(t => rState.selectedTags.has(t)));

  const result = document.getElementById('randomizer-result');

  if (pool.length === 0) {
    result.innerHTML = `
      <div class="randomizer-empty">
        <div class="randomizer-empty-icon">🥒</div>
        <div class="randomizer-empty-msg">No drills match those tags.</div>
        <div class="randomizer-empty-hint">Try fewer filters or add more drills.</div>
      </div>`;
    result.className = 'randomizer-result randomizer-result--visible';
    return;
  }

  rState.pickedDrill = pool[Math.floor(Math.random() * pool.length)];
  result.innerHTML = '';
  result.className = 'randomizer-result';

  launchConfetti();

  setTimeout(() => {
    const d = rState.pickedDrill;
    result.innerHTML = `
      <div class="randomizer-reveal">
        <div class="randomizer-reveal-label">Today's drill</div>
        <div class="randomizer-drill-name">${esc(d.name)}</div>
        <div class="randomizer-drill-tags">${d.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
        <div class="randomizer-reveal-btns">
          <button class="btn btn-primary randomizer-go-btn" onclick="openPickedDrill()">Let's go →</button>
          <button class="btn btn-ghost" onclick="pickRandomDrill()">Roll again</button>
        </div>
      </div>`;
    result.className = 'randomizer-result randomizer-result--visible';
  }, 650);
}

export function openPickedDrill() {
  if (rState.pickedDrill) window.openDrill(rState.pickedDrill.id);
}

function launchConfetti() {
  const canvas = document.getElementById('randomizer-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;

  const COLORS = ['#b5e853', '#53e8a0', '#e8a053', '#e853a0', '#e8f0e9'];
  const particles = Array.from({ length: 120 }, () => ({
    x:     canvas.width * (0.2 + Math.random() * 0.6),
    y:     -10,
    vx:    (Math.random() - 0.5) * 9,
    vy:    Math.random() * 4 + 3,
    rot:   Math.random() * Math.PI * 2,
    rotV:  (Math.random() - 0.5) * 0.3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    w:     Math.random() * 8 + 5,
    h:     Math.random() * 4 + 3,
  }));

  let frame = 0;
  const GRAVITY = 0.25;
  const MAX_FRAMES = 180;

  (function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = 0;
    for (const p of particles) {
      p.vy += GRAVITY; p.x += p.vx; p.y += p.vy; p.rot += p.rotV;
      if (p.y > canvas.height + 20) continue;
      alive++;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.globalAlpha = frame > 120 ? 1 - (frame - 120) / 60 : 1;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    frame++;
    if (alive > 0 && frame < MAX_FRAMES) requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  })();
}
