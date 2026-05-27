export const PLAYER_COLORS = ['#b5e853', '#53e8a0', '#e8a053', '#e853a0'];
export const PLAYER_LABELS = ['P1', 'P2', 'P3', 'P4'];

export const GRID_COLS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const GRID_ROWS = 8;

// Court SVG dimensions
export const CW = 300, CH = 440;
export const COURT_PAD_X = 30, COURT_PAD_TOP = 20, COURT_PAD_BOT = 20;
export const COURT_W = CW - COURT_PAD_X * 2;
export const COURT_H = CH - COURT_PAD_TOP - COURT_PAD_BOT;
export const CELL_W = COURT_W / 6;
export const CELL_H = COURT_H / 8;

// Grid row boundaries
// Row 1-2: Team A baseline · Row 3: Team A NVZ · Row 4: Net zone · Row 5: Team B NVZ · Row 6-8: Team B side
export const NET_Y     = COURT_PAD_TOP + 4 * CELL_H;  // bottom of row 4
export const NVZ_TOP_Y = COURT_PAD_TOP + 3 * CELL_H;  // Team A kitchen line
export const NVZ_BOT_Y = COURT_PAD_TOP + 5 * CELL_H;  // Team B kitchen line

export const ALL_TAGS = [
  'dinking', 'driving', '3rd shot drop', 'NVZ', 'poaching',
  'reset', 'transition', 'feeding', 'defense', 'consistency',
];
