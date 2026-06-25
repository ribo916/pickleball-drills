import { state } from './state.js';
import { esc, showToast } from './utils.js';
import { saveDrills } from './storage.js';
import { isFavorite } from './favorites.js';
import { isInSession } from './session.js';

const savedSort = localStorage.getItem('pickle-sort');
if (savedSort) state.librarySort = savedSort;

export function setLibrarySort(val) {
  state.librarySort = val;
  localStorage.setItem('pickle-sort', val);
  renderLibrary();
}

export function renderLibrary() {
  const allTags = new Set();
  state.drills.forEach(d => (d.tags || []).forEach(t => allTags.add(t)));

  const noTagsSelected = state.selectedLibraryTags.size === 0;
  document.getElementById('filter-bar').innerHTML = [
    `<button class="filter-chip ${noTagsSelected && !state.favoritesFilter ? 'active' : ''}" onclick="clearLibraryTags()">All</button>`,
    ...[...allTags].map(t => `
      <button class="filter-chip ${state.selectedLibraryTags.has(t) ? 'active' : ''}" data-tag="${esc(t)}" onclick="toggleLibraryTag(this.dataset.tag)">${esc(t)}</button>
    `),
  ].join('');

  const favBtn = document.getElementById('fav-filter-btn');
  if (favBtn) favBtn.classList.toggle('active', state.favoritesFilter);

  const query = state.librarySearch.trim().toLowerCase();

  let filtered = noTagsSelected
    ? state.drills
    : state.drills.filter(d => (d.tags || []).some(t => state.selectedLibraryTags.has(t)));

  if (query) {
    filtered = filtered.filter(d =>
      d.name.toLowerCase().includes(query) ||
      (d.desc || '').toLowerCase().includes(query)
    );
  }

  if (state.favoritesFilter) {
    filtered = filtered.filter(d => isFavorite(d.id));
  }

  const sorted = [...filtered];
  if (state.librarySort === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
  else if (state.librarySort === 'newest') sorted.sort((a, b) => (parseInt(b.id.replace('drill-', '')) || 0) - (parseInt(a.id.replace('drill-', '')) || 0));
  else if (state.librarySort === 'players') sorted.sort((a, b) => a.players - b.players);

  document.querySelectorAll('.sort-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.sort === state.librarySort);
  });

  const grid = document.getElementById('drill-grid');
  if (!sorted.length) {
    grid.innerHTML = `<div class="empty-state"><h2>No drills found</h2><p>${query || state.selectedLibraryTags.size ? 'Try different filters or search terms.' : 'Add your first drill with the + New button.'}</p></div>`;
    return;
  }
  grid.innerHTML = sorted.map(d => `
    <div class="drill-card${d.steps.length === 0 ? ' drill-card--empty' : ''}" onclick="openDrill('${d.id}')">
      <div class="card-top">
        <div class="drill-name">${esc(d.name)}</div>
        <div class="player-badge">${d.players}P</div>
      </div>
      <div class="drill-desc">${esc(d.desc)}</div>
      <div class="tag-row">${(d.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
      <div class="card-bottom">
        <div class="step-count">
          ${d.steps.length === 0
            ? `<span class="no-steps-badge">no steps</span>`
            : `${d.steps.length} step${d.steps.length === 1 ? '' : 's'}`}
        </div>
        <div class="card-actions">
          <button class="card-fav-btn${isFavorite(d.id) ? ' card-fav-btn--on' : ''}" onclick="event.stopPropagation();toggleFavorite('${d.id}')" aria-label="Favorite">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 13.5C8 13.5 1.5 9.5 1.5 5.5C1.5 3.567 3.067 2 5 2C6.193 2 7.25 2.6 8 3.5C8.75 2.6 9.807 2 11 2C12.933 2 14.5 3.567 14.5 5.5C14.5 9.5 8 13.5 8 13.5Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </button>
          <button class="session-add-btn${isInSession(d.id) ? ' session-add-btn--in' : ''}" data-session-id="${d.id}" onclick="event.stopPropagation();addToSession('${d.id}')">${isInSession(d.id) ? '✓ Queued' : '＋ Queue'}</button>
        </div>
      </div>
    </div>
  `).join('');
}

export function toggleLibraryTag(tag) {
  if (state.selectedLibraryTags.has(tag)) {
    state.selectedLibraryTags.delete(tag);
  } else {
    state.selectedLibraryTags.add(tag);
  }
  renderLibrary();
}

export function clearLibraryTags() {
  state.selectedLibraryTags.clear();
  state.favoritesFilter = false;
  renderLibrary();
}

export function toggleFavoritesFilter() {
  state.favoritesFilter = !state.favoritesFilter;
  if (state.favoritesFilter) state.selectedLibraryTags.clear();
  renderLibrary();
}

export function setLibrarySearch(query) {
  state.librarySearch = query;
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
