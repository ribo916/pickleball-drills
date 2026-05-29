export const PLAYER_COLORS = ['#b5e853', '#53e8a0', '#e8a053', '#e853a0'];
export const PLAYER_LABELS = ['P1', 'P2', 'P3', 'P4'];

// Grid: 8 cols (A-H) × 10 rows (1-10)
// Outer ring (col A, col H, row 1, row 10) = off-court area
// Court occupies cols B–G (0-indexed 1–6) and rows 2–9 (0-indexed 1–8)
export const GRID_COLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
export const GRID_ROWS = 10;

// Cell size — unchanged so the court interior stays the same physical size
export const CELL_W = 40;
export const CELL_H = 50;

export const COURT_PAD_X  = 30; // left margin (row labels)
export const COURT_PAD_TOP = 20; // top margin (col labels)
export const COURT_PAD_BOT = 20; // bottom margin

// Where the court boundary starts within the SVG (one outer cell in from each edge)
export const COURT_COL_START = 1; // 0-indexed column B
export const COURT_ROW_START = 1; // 0-indexed row 2
export const COURT_X = COURT_PAD_X  + COURT_COL_START * CELL_W; // 70
export const COURT_Y = COURT_PAD_TOP + COURT_ROW_START * CELL_H; // 70
export const COURT_W = 6 * CELL_W; // 240 — same as before
export const COURT_H = 8 * CELL_H; // 400 — same as before

// SVG viewport (expanded to fit 8×10 grid + label margins)
export const CW = COURT_PAD_X + 8 * CELL_W + 40; // 390
export const CH = COURT_PAD_TOP + 10 * CELL_H + COURT_PAD_BOT; // 540

// Court line positions (relative to COURT_Y so the court interior is identical)
// Court rows 1-2: Team A baseline · Row 3: Team A NVZ · Row 4: Net zone
// Row 5: Team B NVZ · Row 6: Team B transition · Rows 7-8: Team B baseline
export const NET_Y     = COURT_Y + 4 * CELL_H; // bottom of court row 4 (net)
export const NVZ_TOP_Y = COURT_Y + 3 * CELL_H; // bottom of court row 3 (Team A kitchen)
export const NVZ_BOT_Y = COURT_Y + 5 * CELL_H; // bottom of court row 5 (Team B kitchen)

export const ALL_TAGS = [
  'dinking', 'driving', '3rd shot drop', 'NVZ', 'poaching',
  'reset', 'transition', 'feeding', 'defense', 'consistency',
  'counter', 'speed up', 'lob', 'overhead', 'serve', 'return',
  'attacking', 'soft game', 'stacking', 'erne',
];
