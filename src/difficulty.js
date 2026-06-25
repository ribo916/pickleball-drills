export const DIFFICULTIES = ['beginner', 'intermediate', 'advanced'];

const DIFFICULTY_COLORS = {
  beginner:     { bg: '#1a3a1a', text: '#7ecf2b' },
  intermediate: { bg: '#3a2a0a', text: '#e8a053' },
  advanced:     { bg: '#3a1010', text: '#e85353' },
};

export function difficultyBadgeHtml(difficulty) {
  if (!difficulty) return '';
  const c = DIFFICULTY_COLORS[difficulty] || {};
  return `<span class="difficulty-badge" style="background:${c.bg};color:${c.text}">${difficulty}</span>`;
}
