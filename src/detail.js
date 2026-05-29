import { state } from './state.js';
import { PLAYER_COLORS, PLAYER_LABELS } from './constants.js';
import { buildCourtSVG } from './court.js';
import { esc } from './utils.js';
import { showView } from './navigation.js';

export function openDrill(id) {
  state.currentDrillId = id;
  const drill = state.drills.find(d => d.id === id);
  if (!drill) return;

  document.getElementById('detail-name').textContent = drill.name;
  document.getElementById('detail-meta').innerHTML = `
    <span class="player-badge">${drill.players} players</span>
    ${drill.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}
  `;
  document.getElementById('detail-goal').innerHTML = `
    <div class="label">Drill Goal</div><p>${esc(drill.goal)}</p>
  `;

  // Court
  const svg = document.getElementById('detail-court-svg');
  const hasPositions = drill.startPositions && Object.keys(drill.startPositions).length > 0;
  document.getElementById('court-section').style.display = hasPositions ? '' : 'none';
  if (hasPositions) svg.innerHTML = buildCourtSVG(drill.startPositions);

  // Steps
  const stepsWrap = document.getElementById('steps-section-wrap');
  if (drill.steps && drill.steps.length) {
    document.getElementById('steps-list').innerHTML = drill.steps.map((s, i) => `
      <div class="step-item">
        <div class="step-number">${i + 1}</div>
        <div>
          <div class="step-title">${esc(s.title)}</div>
          <div class="step-desc">${esc(s.desc)}</div>
        </div>
      </div>
    `).join('');
    stepsWrap.style.display = '';
  } else {
    stepsWrap.style.display = 'none';
  }

  // Roles
  const rolesWrap = document.getElementById('roles-section-wrap');
  const hasRoles = drill.roles && drill.roles.some(r => r.desc || (r.label && !PLAYER_LABELS.includes(r.label)));
  if (hasRoles) {
    document.getElementById('role-list').innerHTML = drill.roles.map((r, i) => `
      <div class="role-item">
        <div class="role-dot" style="background:${PLAYER_COLORS[i]}20;color:${PLAYER_COLORS[i]};border:1.5px solid ${PLAYER_COLORS[i]}">${PLAYER_LABELS[i]}</div>
        <div>
          <div class="role-name">${esc(r.label)}</div>
          <div class="role-desc">${esc(r.desc)}</div>
        </div>
      </div>
    `).join('');
    rolesWrap.style.display = '';
  } else {
    rolesWrap.style.display = 'none';
  }

  // Notes
  const notesList = document.getElementById('notes-list');
  if (drill.notes && drill.notes.length) {
    notesList.innerHTML = drill.notes.map(n => `<li>${esc(n)}</li>`).join('');
    document.getElementById('notes-section-wrap').style.display = '';
  } else {
    document.getElementById('notes-section-wrap').style.display = 'none';
  }

  showView('detail');
}
