import { state } from './state.js';
import { esc, showToast } from './utils.js';
import { showView } from './navigation.js';

const sState = { items: [] };
let dragSrcId = null;

export function loadSession() {
  try { sState.items = JSON.parse(localStorage.getItem('pickle-session') || '[]'); }
  catch { sState.items = []; }
  updateSessionBadge();
}

function saveSession() {
  localStorage.setItem('pickle-session', JSON.stringify(sState.items));
}

export function isInSession(id) {
  return sState.items.includes(id);
}

function updateSessionBadge() {
  const badge = document.getElementById('session-badge');
  if (!badge) return;
  const count = sState.items.length;
  badge.textContent = count || '';
  badge.classList.toggle('visible', count > 0);
}

export function addToSession(id) {
  if (sState.items.includes(id)) {
    showToast('Already in session');
    return;
  }
  sState.items.push(id);
  saveSession();
  updateSessionBadge();
  showToast('Added to session');

  // Update card button if in library view
  document.querySelectorAll(`[data-session-id="${id}"]`).forEach(el => {
    el.classList.add('session-add-btn--in');
    el.textContent = '✓ Queued';
  });

  // Update detail button if visible
  const detailBtn = document.getElementById('detail-session-btn');
  if (detailBtn && detailBtn.dataset.sessionId === id) {
    detailBtn.classList.add('session-add-btn--in');
    detailBtn.textContent = '✓ In Session';
  }
}

export function removeFromSession(id) {
  sState.items = sState.items.filter(i => i !== id);
  saveSession();
  updateSessionBadge();
  if (document.getElementById('view-session')?.classList.contains('active')) {
    renderSession();
  }
}

export function clearSession() {
  sState.items = [];
  saveSession();
  updateSessionBadge();
  renderSession();
  showToast('Session cleared');
}

export function sessionMoveUp(id) {
  const idx = sState.items.indexOf(id);
  if (idx <= 0) return;
  [sState.items[idx - 1], sState.items[idx]] = [sState.items[idx], sState.items[idx - 1]];
  saveSession();
  renderSession();
}

export function sessionMoveDown(id) {
  const idx = sState.items.indexOf(id);
  if (idx < 0 || idx >= sState.items.length - 1) return;
  [sState.items[idx], sState.items[idx + 1]] = [sState.items[idx + 1], sState.items[idx]];
  saveSession();
  renderSession();
}

export function openSessionDrill(id) {
  window.openDrill(id);
}

export function showSession() {
  renderSession();
  showView('session');
}

export function renderSession() {
  const list = document.getElementById('session-list');
  if (!list) return;

  if (sState.items.length === 0) {
    list.innerHTML = `
      <div class="session-empty">
        <h2>No drills queued</h2>
        <p>Add drills from the library or detail view.</p>
      </div>`;
    return;
  }

  const last = sState.items.length - 1;
  list.innerHTML = sState.items.map((id, idx) => {
    const drill = state.drills.find(d => d.id === id);
    if (!drill) return '';
    return `
      <div class="session-item" draggable="true" data-drag-id="${id}">
        <div class="session-item-drag-handle">⠿</div>
        <div class="session-item-body" onclick="openSessionDrill('${id}')">
          <div class="session-item-name">${esc(drill.name)}</div>
          <div class="session-item-meta">${drill.players}P · ${drill.steps.length} step${drill.steps.length === 1 ? '' : 's'}</div>
        </div>
        <div class="session-item-controls">
          <button class="session-move-btn" onclick="sessionMoveUp('${id}')"${idx === 0 ? ' disabled' : ''}>↑</button>
          <button class="session-move-btn" onclick="sessionMoveDown('${id}')"${idx === last ? ' disabled' : ''}>↓</button>
          <button class="session-remove-btn" onclick="removeFromSession('${id}')">×</button>
        </div>
      </div>`;
  }).join('');

  // Attach drag-and-drop listeners after rendering
  list.querySelectorAll('.session-item').forEach(el => {
    el.addEventListener('dragstart', () => { dragSrcId = el.dataset.dragId; el.classList.add('dragging'); });
    el.addEventListener('dragend', () => el.classList.remove('dragging'));
    el.addEventListener('dragover', e => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', e => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const srcId = dragSrcId;
      const dstId = el.dataset.dragId;
      if (!srcId || srcId === dstId) return;
      const srcIdx = sState.items.indexOf(srcId);
      const dstIdx = sState.items.indexOf(dstId);
      if (srcIdx < 0 || dstIdx < 0) return;
      sState.items.splice(srcIdx, 1);
      sState.items.splice(dstIdx, 0, srcId);
      saveSession();
      renderSession();
    });
  });
}
