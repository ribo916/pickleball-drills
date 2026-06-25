import { state } from './state.js';
import { esc, showToast } from './utils.js';
import { saveDrills } from './storage.js';

export function renderLibrary() {
  const allTags = new Set(['all']);
  state.drills.forEach(d => (d.tags || []).forEach(t => allTags.add(t)));
  document.getElementById('filter-bar').innerHTML = [...allTags].map(t => `
    <button class="filter-chip ${state.activeFilter === t ? 'active' : ''}" data-tag="${esc(t)}" onclick="setFilter(this.dataset.tag)">${t === 'all' ? 'All' : esc(t)}</button>
  `).join('');

  const filtered = state.activeFilter === 'all'
    ? state.drills
    : state.drills.filter(d => (d.tags || []).includes(state.activeFilter));

  const grid = document.getElementById('drill-grid');
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><h2>No drills yet</h2><p>Add your first drill with the + New button</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(d => `
    <div class="drill-card${d.steps.length === 0 ? ' drill-card--empty' : ''}" onclick="openDrill('${d.id}')">
      <div class="card-top">
        <div class="drill-name">${esc(d.name)}</div>
        <div class="player-badge">${d.players}P</div>
      </div>
      <div class="drill-desc">${esc(d.desc)}</div>
      <div class="tag-row">${(d.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <div class="step-count">
        ${d.steps.length === 0
          ? `<span class="no-steps-badge">no steps</span>`
          : `${d.steps.length} step${d.steps.length === 1 ? '' : 's'}`}
      </div>
    </div>
  `).join('');
}

export function setFilter(tag) {
  state.activeFilter = tag;
  renderLibrary();
}

export function openQuickAdd() {
  document.getElementById('qa-name').value = '';
  document.getElementById('qa-desc').value = '';
  const modal = document.getElementById('modal-quick-add');
  modal.style.display = 'flex';
  requestAnimationFrame(() => document.getElementById('qa-name').focus());
}

export function closeQuickAdd() {
  document.getElementById('modal-quick-add').style.display = 'none';
}

export async function saveQuickAdd() {
  const name = document.getElementById('qa-name').value.trim();
  if (!name) {
    document.getElementById('qa-name').focus();
    showToast('Drill needs a name');
    return;
  }
  const desc = document.getElementById('qa-desc').value.trim();
  const drill = {
    id: `drill-${Date.now()}`,
    name,
    players: 4,
    desc,
    goal: desc,
    tags: [],
    steps: [],
    roles: [],
    notes: [],
  };
  state.drills.push(drill);
  await saveDrills();
  closeQuickAdd();
  showToast('Drill added');
  renderLibrary();
}
