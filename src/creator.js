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
    document.getElementById('f-goal').value = '';
    document.getElementById('f-notes').value = '';
    document.getElementById('f-players').value = '4';
    addStepField();
  }

  showView('creator');
}

export function renderStepCourt(idx) {
  const positions = {};
  PLAYER_LABELS.forEach(label => {
    const el = document.getElementById(`step-pos-${idx}-${label}`);
    if (el && el.value.trim()) positions[label] = el.value.trim().toUpperCase();
  });
  const svg = document.getElementById(`step-court-svg-${idx}`);
  if (svg) svg.innerHTML = buildCourtSVG(positions);
}

function prefillForm(drill) {
  document.getElementById('f-name').value = drill.name;
  document.getElementById('f-desc').value = drill.desc;
  document.getElementById('f-goal').value = drill.goal;
  document.getElementById('f-notes').value = (drill.notes || []).join('\n');
  document.getElementById('f-players').value = String(drill.players);

  state.selectedTags = [...(drill.tags || [])];
  document.querySelectorAll('.tag-toggle').forEach(btn => {
    if (state.selectedTags.includes(btn.dataset.tag)) btn.classList.add('selected');
  });
  const picker = document.getElementById('tag-picker');
  (drill.tags || []).filter(t => !ALL_TAGS.includes(t)).forEach(t => picker.appendChild(makeCustomTagBtn(t)));

  document.getElementById('step-builder').innerHTML = '';
  state.stepCount = 0;
  (drill.steps || []).forEach((s, i) => {
    // Migrate old drills: seed first step with top-level startPositions if step has none
    const positions = s.positions || (i === 0 && drill.startPositions ? drill.startPositions : {});
    addStepField(s.title, s.desc, positions);
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

export function toggleTag(btn, tag) {
  if (state.selectedTags.includes(tag)) {
    state.selectedTags = state.selectedTags.filter(t => t !== tag);
    btn.classList.remove('selected');
  } else {
    state.selectedTags.push(tag);
    btn.classList.add('selected');
  }
}

export function addStepField(title = '', desc = '', positions = {}) {
  const idx = state.stepCount++;
  const posInputs = PLAYER_LABELS.map((label, i) => `
    <div class="position-input-row">
      <div class="position-label" style="color:${PLAYER_COLORS[i]}">${label}</div>
      <input class="position-input" id="step-pos-${idx}-${label}" maxlength="3"
        placeholder="e.g. C3" oninput="renderStepCourt(${idx})"
        style="border-color:${PLAYER_COLORS[i]}40"/>
    </div>
  `).join('');

  const div = document.createElement('div');
  div.className = 'step-item-builder';
  div.id = `step-${idx}`;
  div.innerHTML = `
    <div class="step-item-header">
      <div class="step-item-label">Step ${idx + 1}</div>
      <button class="step-remove" onclick="removeStep(${idx})">×</button>
    </div>
    <div class="step-court-editor">
      <div class="step-court-preview">
        <svg id="step-court-svg-${idx}" viewBox="0 0 390 540" xmlns="http://www.w3.org/2000/svg"></svg>
      </div>
      <div class="step-position-inputs">${posInputs}</div>
    </div>
    <div class="form-group" style="margin-bottom:8px;margin-top:10px">
      <input class="form-input" id="step-title-${idx}" placeholder="Step title" value="${esc(title)}" style="font-size:13px;padding:8px 10px"/>
    </div>
    <textarea class="form-textarea" id="step-desc-${idx}" placeholder="What happens in this step?" style="min-height:64px;font-size:13px">${esc(desc)}</textarea>
  `;
  document.getElementById('step-builder').appendChild(div);

  PLAYER_LABELS.forEach(label => {
    if (positions && positions[label]) {
      const el = document.getElementById(`step-pos-${idx}-${label}`);
      if (el) el.value = positions[label];
    }
  });
  renderStepCourt(idx);
}

export function removeStep(idx) {
  const el = document.getElementById(`step-${idx}`);
  if (el) el.remove();
}

export async function saveDrill() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { showToast('Drill needs a name'); return; }

  const players = parseInt(document.getElementById('f-players').value);

  const steps = [];
  document.querySelectorAll('.step-item-builder').forEach((el, i) => {
    const id = el.id.replace('step-', '');
    const t = document.getElementById(`step-title-${id}`)?.value.trim() || '';
    const d = document.getElementById(`step-desc-${id}`)?.value.trim() || '';
    const positions = {};
    PLAYER_LABELS.forEach(label => {
      const pos = document.getElementById(`step-pos-${id}-${label}`);
      if (pos && pos.value.trim()) {
        const v = pos.value.trim().toUpperCase();
        if (gridToXY(v)) positions[label] = v;
      }
    });
    if (t || d || Object.keys(positions).length > 0) {
      steps.push({ title: t || `Step ${i + 1}`, desc: d, positions });
    }
  });

  const notesRaw = document.getElementById('f-notes').value.trim();
  const notes = notesRaw ? notesRaw.split('\n').map(s => s.trim()).filter(Boolean) : [];

  const drill = {
    id: state.editingId || `drill-${Date.now()}`,
    name,
    players,
    desc: document.getElementById('f-desc').value.trim(),
    goal: document.getElementById('f-goal').value.trim(),
    tags: state.selectedTags,
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
