import { state } from './state.js';
import { buildCourtSVG } from './court.js';
import { esc, parseVideoUrl } from './utils.js';
import { showView } from './navigation.js';

let currentStepIdx = 0;
let currentSteps = [];

function handleTouchStart(e) { _touchStartX = e.touches[0].clientX; }
function handleTouchEnd(e) {
  const dx = e.changedTouches[0].clientX - _touchStartX;
  if (Math.abs(dx) > 50) stepNav(dx < 0 ? 1 : -1);
}
let _touchStartX = 0;

export function stepNav(dir) {
  currentStepIdx = Math.max(0, Math.min(currentSteps.length - 1, currentStepIdx + dir));
  renderCurrentStep();
}

function renderCurrentStep() {
  const s = currentSteps[currentStepIdx];
  const total = currentSteps.length;

  document.getElementById('step-indicator').textContent = `Step ${currentStepIdx + 1} / ${total}`;
  document.getElementById('step-prev').disabled = currentStepIdx === 0;
  document.getElementById('step-next').disabled = currentStepIdx === total - 1;

  const hasPositions = s.positions && Object.keys(s.positions).length > 0;
  const courtHtml = hasPositions
    ? `<div class="step-card-court"><svg viewBox="0 0 390 540" xmlns="http://www.w3.org/2000/svg">${buildCourtSVG(s.positions)}</svg></div>`
    : '';

  document.getElementById('step-slide').innerHTML = `
    <div class="step-card">
      ${courtHtml}
      <div class="step-card-body">
        ${s.desc ? `<div class="step-desc">${esc(s.desc)}</div>` : ''}
      </div>
    </div>
  `;
}

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

  // Legacy court — old drills with startPositions but no per-step positions
  const legacySection = document.getElementById('legacy-court-section');
  const hasLegacyPositions = drill.startPositions && Object.keys(drill.startPositions).length > 0;
  const hasStepPositions = drill.steps && drill.steps.some(s => s.positions && Object.keys(s.positions).length > 0);
  if (hasLegacyPositions && !hasStepPositions) {
    legacySection.innerHTML = `<div class="court-wrap"><svg viewBox="0 0 390 540" xmlns="http://www.w3.org/2000/svg">${buildCourtSVG(drill.startPositions)}</svg></div>`;
    legacySection.style.display = '';
  } else {
    legacySection.style.display = 'none';
  }

  // Steps slideshow
  const stepsWrap = document.getElementById('steps-section-wrap');
  if (drill.steps && drill.steps.length) {
    currentSteps = drill.steps;
    currentStepIdx = 0;
    renderCurrentStep();

    const slide = document.getElementById('step-slide');
    slide.removeEventListener('touchstart', handleTouchStart);
    slide.removeEventListener('touchend', handleTouchEnd);
    slide.addEventListener('touchstart', handleTouchStart, { passive: true });
    slide.addEventListener('touchend', handleTouchEnd, { passive: true });

    stepsWrap.style.display = '';
  } else {
    stepsWrap.style.display = 'none';
  }

  // Video embed
  const videoSection = document.getElementById('detail-video-section');
  const embedUrl = drill.videoUrl ? (parseVideoUrl(drill.videoUrl) || drill.videoUrl) : null;
  if (embedUrl) {
    videoSection.innerHTML = `
      <div class="video-embed-wrap">
        <iframe
          src="${esc(embedUrl)}"
          title="Drill video"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
        ></iframe>
      </div>
    `;
    videoSection.style.display = '';
  } else {
    videoSection.innerHTML = '';
    videoSection.style.display = 'none';
  }

  showView('detail');
}
