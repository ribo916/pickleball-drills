import {
  PLAYER_COLORS, PLAYER_LABELS, GRID_COLS, GRID_ROWS,
  COURT_PAD_X, COURT_PAD_TOP,
  COURT_COL_START, COURT_ROW_START,
  COURT_X, COURT_Y, COURT_W, COURT_H,
  CELL_W, CELL_H, NET_Y, NVZ_TOP_Y, NVZ_BOT_Y,
} from './constants.js';

export function gridToXY(coord) {
  if (!coord || coord.length < 2) return null;
  const col = coord[0].toUpperCase();
  const row = parseInt(coord.slice(1));
  const ci = GRID_COLS.indexOf(col);
  if (ci < 0 || isNaN(row) || row < 1 || row > GRID_ROWS) return null;
  const x = COURT_PAD_X + ci * CELL_W + CELL_W / 2;
  const y = COURT_PAD_TOP + (row - 1) * CELL_H + CELL_H / 2;
  return { x, y };
}

export function buildCourtSVG(positions) {
  let s = '';

  // Court surface
  s += `<rect x="${COURT_X}" y="${COURT_Y}" width="${COURT_W}" height="${COURT_H}" rx="3" style="fill: var(--surface2)"/>`;

  // All grid cells (8 cols × 10 rows)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS.length; c++) {
      const x = COURT_PAD_X + c * CELL_W;
      const y = COURT_PAD_TOP + r * CELL_H;

      const inCourt = c >= COURT_COL_START && c < COURT_COL_START + 6 &&
                      r >= COURT_ROW_START && r < COURT_ROW_START + 8;

      if (!inCourt) {
        s += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" style="fill: var(--bg); stroke: var(--border); stroke-width: 0.5"/>`;
      } else {
        const courtRow = r - COURT_ROW_START;
        const isNVZ = courtRow >= 2 && courtRow <= 5;
        const fill = isNVZ ? 'var(--surface)' : 'none';
        s += `<rect x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" style="fill: ${fill}; stroke: var(--border); stroke-width: 0.5; opacity: 0.7"/>`;
      }
    }
  }

  // Column labels (A-H)
  GRID_COLS.forEach((col, i) => {
    const x = COURT_PAD_X + i * CELL_W + CELL_W / 2;
    s += `<text x="${x}" y="${COURT_PAD_TOP - 6}" text-anchor="middle" style="fill: var(--text-muted)" font-size="9" font-family="DM Mono, monospace">${col}</text>`;
  });

  // Row labels (1-10)
  for (let r = 0; r < GRID_ROWS; r++) {
    const y = COURT_PAD_TOP + r * CELL_H + CELL_H / 2 + 3;
    s += `<text x="${COURT_PAD_X - 6}" y="${y}" text-anchor="end" style="fill: var(--text-muted)" font-size="9" font-family="DM Mono, monospace">${r + 1}</text>`;
  }

  // NVZ lines
  s += `<line x1="${COURT_X}" y1="${NVZ_TOP_Y}" x2="${COURT_X + COURT_W}" y2="${NVZ_TOP_Y}" style="stroke: var(--text-dim); stroke-width: 1.5"/>`;
  s += `<line x1="${COURT_X}" y1="${NVZ_BOT_Y}" x2="${COURT_X + COURT_W}" y2="${NVZ_BOT_Y}" style="stroke: var(--text-dim); stroke-width: 1.5"/>`;

  // Center line
  s += `<line x1="${COURT_X + COURT_W / 2}" y1="${COURT_Y}" x2="${COURT_X + COURT_W / 2}" y2="${COURT_Y + COURT_H}" style="stroke: var(--border); stroke-width: 1"/>`;

  // Net
  s += `<rect x="${COURT_X}" y="${NET_Y - 3}" width="${COURT_W}" height="6" rx="2" style="fill: var(--border)"/>`;
  s += `<text x="${COURT_X + COURT_W / 2}" y="${NET_Y + 1.5}" text-anchor="middle" dominant-baseline="middle" style="fill: var(--text-dim)" font-size="8" font-family="DM Mono, monospace">NET</text>`;

  // Court border
  s += `<rect x="${COURT_X}" y="${COURT_Y}" width="${COURT_W}" height="${COURT_H}" rx="3" style="fill: none; stroke: var(--text-dim); stroke-width: 1.5"/>`;

  // Team labels
  s += `<text x="${COURT_X + COURT_W / 2}" y="${COURT_Y + CELL_H}" text-anchor="middle" style="fill: var(--text-muted)" font-size="10" font-family="DM Mono, monospace" font-weight="500">TEAM A</text>`;
  s += `<text x="${COURT_X + COURT_W / 2}" y="${COURT_Y + CELL_H * 7}" text-anchor="middle" style="fill: var(--text-muted)" font-size="10" font-family="DM Mono, monospace" font-weight="500">TEAM B</text>`;

  // Player tokens
  PLAYER_LABELS.forEach((label, i) => {
    const coord = positions && positions[label];
    if (!coord) return;
    const pos = gridToXY(coord);
    if (!pos) return;
    const color = PLAYER_COLORS[i];
    s += `<circle cx="${pos.x}" cy="${pos.y}" r="13" fill="${color}25" stroke="${color}" stroke-width="2"/>`;
    s += `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="middle" fill="${color}" font-size="10" font-family="DM Mono, monospace" font-weight="500">${label}</text>`;
  });

  return s;
}
