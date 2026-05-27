import { state } from './state.js';
import { showToast } from './utils.js';

export function exportDrills() {
  if (!state.drills.length) { showToast('No drills to export'); return; }

  const csvCell = v => {
    const s = (v === null || v === undefined) ? '' : String(v);
    return '"' + s.replace(/"/g, '""') + '"';
  };

  const headers = [
    'Name', 'Players', 'Description', 'Goal', 'Tags',
    'P1 Start', 'P2 Start', 'P3 Start', 'P4 Start',
    'Role P1', 'Role P1 Desc',
    'Role P2', 'Role P2 Desc',
    'Role P3', 'Role P3 Desc',
    'Role P4', 'Role P4 Desc',
    'Step 1', 'Step 1 Desc',
    'Step 2', 'Step 2 Desc',
    'Step 3', 'Step 3 Desc',
    'Step 4', 'Step 4 Desc',
    'Step 5', 'Step 5 Desc',
    'Notes',
  ];

  const rows = state.drills.map(d => {
    const pos = d.startPositions || {};
    const roles = d.roles || [];
    const steps = d.steps || [];
    const notes = (d.notes || []).join(' | ');

    const cols = [
      d.name, d.players, d.desc, d.goal,
      (d.tags || []).join(', '),
      pos.P1 || '', pos.P2 || '', pos.P3 || '', pos.P4 || '',
    ];

    for (let i = 0; i < 4; i++) {
      cols.push(roles[i] ? roles[i].label : '');
      cols.push(roles[i] ? roles[i].desc  : '');
    }
    for (let i = 0; i < 5; i++) {
      cols.push(steps[i] ? steps[i].title : '');
      cols.push(steps[i] ? steps[i].desc  : '');
    }
    cols.push(notes);
    return cols.map(csvCell).join(',');
  });

  const csv = [headers.map(csvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'pickleball-drills-' + new Date().toISOString().slice(0, 10) + '.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('Exported ' + state.drills.length + ' drill' + (state.drills.length !== 1 ? 's' : ''));
}
