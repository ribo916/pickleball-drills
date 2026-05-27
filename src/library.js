import { state } from './state.js';
import { esc } from './utils.js';

export function renderLibrary() {
  const allTags = new Set(['all']);
  state.drills.forEach(d => d.tags.forEach(t => allTags.add(t)));
  document.getElementById('filter-bar').innerHTML = [...allTags].map(t => `
    <button class="filter-chip ${state.activeFilter === t ? 'active' : ''}" onclick="setFilter('${t}')">${t === 'all' ? 'All' : t}</button>
  `).join('');

  const filtered = state.activeFilter === 'all'
    ? state.drills
    : state.drills.filter(d => d.tags.includes(state.activeFilter));

  const grid = document.getElementById('drill-grid');
  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state"><h2>No drills yet</h2><p>Add your first drill with the + New button</p></div>`;
    return;
  }
  grid.innerHTML = filtered.map(d => `
    <div class="drill-card" onclick="openDrill('${d.id}')">
      <div class="card-top">
        <div class="drill-name">${esc(d.name)}</div>
        <div class="player-badge">${d.players}P</div>
      </div>
      <div class="drill-desc">${esc(d.desc)}</div>
      <div class="tag-row">${d.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <div class="step-count">${d.steps.length} steps</div>
    </div>
  `).join('');
}

export function setFilter(tag) {
  state.activeFilter = tag;
  renderLibrary();
}
