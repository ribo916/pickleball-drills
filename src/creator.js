import { state } from './state.js';
import { PLAYER_COLORS, PLAYER_LABELS, ALL_TAGS } from './constants.js';
import { gridToXY, buildInteractiveCourtSVG } from './court.js';
import { esc, showToast } from './utils.js';
import { saveDrills } from './storage.js';
import { showView } from './navigation.js';

export function showCreator(id) {
  state.editingId = id;
  state.selectedTags = [];
  state.stepCount = 0;
  state.stepPositions = {};
  state.activePlayer = 'P1';
  state.modalStepIdx = null;
  document.getElementById('creator-title').textContent = id ? 'Edit Drill' : 'New Drill';

  document.getElementById('tag-picker').innerHTML = ALL_TAGS.map(t =>
    `<button class="tag-toggle" data-tag="${t}" onclick="toggleTag(this,'${t}')">${t}</button>`
  ).join('');

  document.getElementById('step-builder').innerHTML = '';

  if (id) {
    const drill = state.drills.find(d => d.id === id);
    if (drill) prefillForm(drill);
  } else {
    document.getElementById('f-name').value = '';
    document.getElementById('f-desc').value = '';
    selectPlayerCount(4);
    addStepField();
  }

  showView('creator');
}

// Opens the full-size interactive court modal for a step
export function openCourtModal(idx) {
  state.modalStepIdx = idx;
  state.activePlayer = 'P1';
  document.getElementById('court-modal-label').textContent = `Step ${idx + 1} — Positions`;
  document.getElementById('court-modal').classList.add('open');
  renderModalCourt();
}

export function closeCourtModal() {
  document.getElementById('court-modal').classList.remove('open');
}

function renderModalCourt() {
  const idx = state.modalStepIdx;
  const positions = state.stepPositions[idx] || {};
  document.getElementById('court-modal-svg').innerHTML = buildInteractiveCourtSVG(positions, idx);
  renderModalPlayerSelector(idx);
}

function renderModalPlayerSelector(idx) {
  const positions = state.stepPositions[idx] || {};
  const container = document.getElementById('modal-player-selector');
  if (!container) return;
  container.innerHTML = PLAYER_LABELS.map((label, i) => {
    const color = PLAYER_COLORS[i];
    const isActive = state.activePlayer === label;
    const isPlaced = !!positions[label];
    const activeStyle = isActive ? `background:${color}30;font-weight:700;` : '';
    return `<button class="player-select-btn${isActive ? ' active' : ''}"
      style="border-color:${color};color:${color};${activeStyle}"
      onclick="selectActivePlayer('${label}')">
      ${label}${isPlaced ? ' ✓' : ''}
    </button>`;
  }).join('');
}

// Called from interactive court SVG onclick
export function setPlayerPosition(stepIdx, coord) {
  if (!state.stepPositions[stepIdx]) state.stepPositions[stepIdx] = {};
  const positions = state.stepPositions[stepIdx];
  const active = state.activePlayer;

  if (positions[active] === coord) {
    delete positions[active];
  } else {
    delete positions[active];
    if (gridToXY(coord)) positions[active] = coord;
  }

  const next = PLAYER_LABELS.find(l => !positions[l] && l !== active);
  if (next) state.activePlayer = next;

  renderModalCourt();
}

// Called from modal player selector buttons
export function selectActivePlayer(label) {
  state.activePlayer = label;
  if (state.modalStepIdx !== null) renderModalPlayerSelector(state.modalStepIdx);
}

function prefillForm(drill) {
  document.getElementById('f-name').value = drill.name;
  const descVal = (drill.goal && drill.goal.length > (drill.desc || '').length)
    ? drill.goal : (drill.desc || '');
  document.getElementById('f-desc').value = descVal;
  selectPlayerCount(drill.players || 4);

  state.selectedTags = [...(drill.tags || [])];
  document.querySelectorAll('.tag-toggle').forEach(btn => {
    if (state.selectedTags.includes(btn.dataset.tag)) btn.classList.add('selected');
  });
  const picker = document.getElementById('tag-picker');
  (drill.tags || []).filter(t => !ALL_TAGS.includes(t)).forEach(t => picker.appendChild(makeCustomTagBtn(t)));

  document.getElementById('step-builder').innerHTML = '';
  state.stepCount = 0;
  (drill.steps || []).forEach((s, i) => {
    const positions = s.positions || (i === 0 && drill.startPositions ? drill.startPositions : {});
    addStepField(s.desc || '', positions);
  });
}

function makeCustomTagBtn(tag) {
  const btn = document.createElement('button');
  btn.className = 'tag-toggle selected';
  btn.dataset.tag = tag;
  btn.innerHTML = `${esc(tag)} <span class="tag-remove">×</span>`;
  btn.querySelector('.tag-remove').addEventListener('click', e => {
    e.stopPropagation();
    removeCustomTag(btn, tag);
  });
  btn.addEventListener('click', () => toggleTag(btn, tag));
  return btn;
}

export function addCustomTag() {
  const input = document.getElementById('custom-tag-input');
  const tag = input.value.trim().toLowerCase();
  if (!tag) return;
  input.value = '';

  const existing = Array.from(document.querySelectorAll('#tag-picker .tag-toggle'))
    .find(btn => btn.dataset.tag === tag);
  if (existing) {
    if (!existing.classList.contains('selected')) existing.click();
    return;
  }

  document.getElementById('tag-picker').appendChild(makeCustomTagBtn(tag));
  state.selectedTags.push(tag);
}

function removeCustomTag(btn, tag) {
  btn.remove();
  state.selectedTags = state.selectedTags.filter(t => t !== tag);
}

export function selectPlayerCount(count) {
  document.querySelectorAll('#player-count-picker .tag-toggle').forEach(b => {
    b.classList.toggle('selected', b.dataset.count === String(count));
  });
}

export function toggleTag(btn, tag) {
  if (state.selectedTags.includes(tag)) {
    state.selectedTags = state.selectedTags.filter(t => t !== tag);
    btn.classList.remove('selected');
  } else {
    state.selectedTags.push(tag);
    btn.classList.add('selected');
  }
}

export function addStepField(notes = '', positions = {}) {
  const idx = state.stepCount++;
  state.stepPositions[idx] = { ...positions };

  const div = document.createElement('div');
  div.className = 'step-item-builder';
  div.id = `step-${idx}`;
  div.innerHTML = `
    <div class="step-item-header">
      <div class="step-item-label">Step ${idx + 1}</div>
      <button class="step-remove" onclick="removeStep(${idx})">×</button>
    </div>
    <button class="set-positions-btn" onclick="openCourtModal(${idx})">⊕ Set Positions</button>
    <textarea class="form-textarea" id="step-notes-${idx}" placeholder="Notes (optional)" style="min-height:56px;font-size:13px;margin-top:8px">${esc(notes)}</textarea>
  `;
  document.getElementById('step-builder').appendChild(div);
}

export function removeStep(idx) {
  const el = document.getElementById(`step-${idx}`);
  if (el) el.remove();
  delete state.stepPositions[idx];
}

export async function saveDrill() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('Drill needs a name'); return; }
  const desc = document.getElementById('f-desc').value.trim();
  if (!desc) { showToast('Add a description'); return; }

  const steps = [];
  document.querySelectorAll('.step-item-builder').forEach((el, i) => {
    const id = el.id.replace('step-', '');
    const notes = document.getElementById(`step-notes-${id}`)?.value.trim() || '';
    const positions = {};
    Object.entries(state.stepPositions[id] || {}).forEach(([label, coord]) => {
      if (gridToXY(coord)) positions[label] = coord;
    });
    if (notes || Object.keys(positions).length > 0) {
      steps.push({ desc: notes, positions });
    }
  });

  const playersBtn = document.querySelector('#player-count-picker .tag-toggle.selected');
  const players = playersBtn ? parseInt(playersBtn.dataset.count) : 4;

  const drill = {
    id: state.editingId || `drill-${Date.now()}`,
    name,
    players,
    desc,
    goal: desc,
    tags: state.selectedTags,
    steps,
  };

  if (state.editingId) {
    const idx = state.drills.findIndex(d => d.id === state.editingId);
    if (idx >= 0) state.drills[idx] = drill; else state.drills.push(drill);
  } else {
    state.drills.push(drill);
  }

  await saveDrills();
  showToast(state.editingId ? 'Drill updated' : 'Drill saved');
  setTimeout(() => showView('library'), 400);
}

export function editCurrentDrill() {
  showCreator(state.currentDrillId);
}

export async function deleteCurrentDrill() {
  if (!confirm('Delete this drill?')) return;
  state.drills = state.drills.filter(d => d.id !== state.currentDrillId);
  await saveDrills();
  showView('library');
}
