import { state } from './state.js';
import { PLAYER_COLORS, PLAYER_LABELS, ALL_TAGS } from './constants.js';
import { gridToXY, buildCourtSVG } from './court.js';
import { esc, showToast } from './utils.js';
import { saveDrills } from './storage.js';
import { showView } from './navigation.js';

export function showCreator(id) {
  state.editingId = id;
  state.selectedTags = [];
  state.stepCount = 0;
  document.getElementById('creator-title').textContent = id ? 'Edit Drill' : 'New Drill';

  // Tags
  document.getElementById('tag-picker').innerHTML = ALL_TAGS.map(t =>
    `<button class="tag-toggle" onclick="toggleTag(this,'${t}')">${t}</button>`
  ).join('');

  // Steps
  document.getElementById('step-builder').innerHTML = '';

  // Roles
  document.getElementById('role-builder').innerHTML = [0, 1, 2, 3].map(i => `
    <div class="role-row">
      <input class="form-input" id="role-label-${i}" placeholder="${PLAYER_LABELS[i]} role" style="padding:8px 10px;font-size:13px"/>
      <textarea class="form-textarea" id="role-desc-${i}" placeholder="What ${PLAYER_LABELS[i]} does..." style="min-height:60px;font-size:13px"></textarea>
    </div>
  `).join('');

  if (id) {
    const drill = state.drills.find(d => d.id === id);
    if (drill) prefillForm(drill);
  } else {
    document.getElementById('f-name').value = '';
    document.getElementById('f-desc').value = '';
    document.getElementById('f-goal').value = '';
    document.getElementById('f-notes').value = '';
    document.getElementById('f-players').value = '4';
    addStepField();
  }

  buildPositionInputs();
  showView('creator');
}

export function buildPositionInputs() {
  const count = parseInt(document.getElementById('f-players').value);
  const container = document.getElementById('position-inputs');
  container.innerHTML = PLAYER_LABELS.slice(0, count).map((label, i) => `
    <div class="position-input-row">
      <div class="position-label" style="color:${PLAYER_COLORS[i]}">${label}</div>
      <input class="position-input" id="pos-${label}" maxlength="3"
        placeholder="—" oninput="renderCreatorCourt()"
        style="border-color:${PLAYER_COLORS[i]}40"/>
    </div>
  `).join('');
  renderCreatorCourt();
}

export function updateCreatorCourt() {
  buildPositionInputs();
}

export function renderCreatorCourt() {
  const count = parseInt(document.getElementById('f-players').value);
  const positions = {};
  PLAYER_LABELS.slice(0, count).forEach(label => {
    const el = document.getElementById(`pos-${label}`);
    if (el && el.value.trim()) positions[label] = el.value.trim().toUpperCase();
  });
  document.getElementById('creator-court-svg').innerHTML = buildCourtSVG(positions);
}

function prefillForm(drill) {
  document.getElementById('f-name').value = drill.name;
  document.getElementById('f-desc').value = drill.desc;
  document.getElementById('f-goal').value = drill.goal;
  document.getElementById('f-notes').value = (drill.notes || []).join('\n');
  document.getElementById('f-players').value = String(drill.players);

  state.selectedTags = [...(drill.tags || [])];
  document.querySelectorAll('.tag-toggle').forEach(btn => {
    if (state.selectedTags.includes(btn.textContent)) btn.classList.add('selected');
  });

  drill.roles.forEach((r, i) => {
    const l = document.getElementById(`role-label-${i}`);
    const d = document.getElementById(`role-desc-${i}`);
    if (l) l.value = r.label;
    if (d) d.value = r.desc;
  });

  document.getElementById('step-builder').innerHTML = '';
  state.stepCount = 0;
  drill.steps.forEach(s => addStepField(s.title, s.desc));

  if (drill.startPositions) {
    setTimeout(() => {
      Object.entries(drill.startPositions).forEach(([label, coord]) => {
        const el = document.getElementById(`pos-${label}`);
        if (el) el.value = coord;
      });
      updateCreatorCourt();
    }, 0);
  }
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

export function addStepField(title = '', desc = '') {
  const idx = state.stepCount++;
  const div = document.createElement('div');
  div.className = 'step-item-builder';
  div.id = `step-${idx}`;
  div.innerHTML = `
    <div class="step-item-header">
      <div class="step-item-label">Step ${idx + 1}</div>
      <button class="step-remove" onclick="removeStep(${idx})">×</button>
    </div>
    <div class="form-group" style="margin-bottom:8px">
      <input class="form-input" id="step-title-${idx}" placeholder="Step title" value="${esc(title)}" style="font-size:13px;padding:8px 10px"/>
    </div>
    <textarea class="form-textarea" id="step-desc-${idx}" placeholder="What happens in this step?" style="min-height:64px;font-size:13px">${esc(desc)}</textarea>
  `;
  document.getElementById('step-builder').appendChild(div);
}

export function removeStep(idx) {
  const el = document.getElementById(`step-${idx}`);
  if (el) el.remove();
}

export async function saveDrill() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('Drill needs a name'); return; }

  const players = parseInt(document.getElementById('f-players').value);

  const startPositions = {};
  PLAYER_LABELS.slice(0, players).forEach(label => {
    const el = document.getElementById(`pos-${label}`);
    if (el && el.value.trim()) {
      const v = el.value.trim().toUpperCase();
      if (gridToXY(v)) startPositions[label] = v;
    }
  });

  const steps = [];
  document.querySelectorAll('.step-item-builder').forEach((el, i) => {
    const id = el.id.replace('step-', '');
    const t = document.getElementById(`step-title-${id}`)?.value.trim() || '';
    const d = document.getElementById(`step-desc-${id}`)?.value.trim() || '';
    if (t || d) steps.push({ title: t || `Step ${i + 1}`, desc: d });
  });

  const roles = [];
  for (let i = 0; i < players && i < 4; i++) {
    roles.push({
      label: document.getElementById(`role-label-${i}`)?.value.trim() || PLAYER_LABELS[i],
      color: i,
      desc: document.getElementById(`role-desc-${i}`)?.value.trim() || '',
    });
  }

  const notesRaw = document.getElementById('f-notes').value.trim();
  const notes = notesRaw ? notesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const drill = {
    id: state.editingId || `drill-${Date.now()}`,
    name,
    players,
    desc: document.getElementById('f-desc').value.trim(),
    goal: document.getElementById('f-goal').value.trim(),
    tags: state.selectedTags,
    startPositions,
    roles,
    steps,
    notes,
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
