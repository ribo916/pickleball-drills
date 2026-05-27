# Pickle Lab — Pickleball Drill Library

A mobile-friendly web app for a small group to share, create, and reference pickleball drills during weekend sessions. Currently a static site POC with client-side storage. Intended to grow into a full-stack app with a real database.

---

## Background

Four people drill together on weekends. The recurring problem: someone says "let's do that drive-drop drill" and nobody can remember exactly how it goes — roles, setup, what each person is supposed to be doing. There's no shared repository.

This app solves that. Any of the four can add a drill, describe the setup, assign player roles, walk through the steps, and attach coaching notes. The court graphic shows starting positions using a grid coordinate system.

---

## Current State (POC)

- Single HTML file (`public/index.html`) served as a static site
- No authentication — full access for all users
- Storage: `window.storage` (Claude artifact shared storage) with `localStorage` fallback for standard browsers
- Deployed to Vercel via GitHub push
- **Known limitation:** `localStorage` is per-browser/per-device. Shared persistence across users requires a real backend (planned).

---

## Tech Stack

| Layer | Current | Planned |
|---|---|---|
| Frontend | Vanilla HTML/CSS/JS | Same, or light framework if needed |
| Server | Static (Vercel) | Node/Express API routes |
| Storage | localStorage / window.storage | Postgres (Supabase or Neon) |
| Deploy | Vercel via GitHub | Same |
| Dev tooling | Claude Code in VS Code | Same |

---

## Local Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Uses `localStorage` for persistence in a standard browser.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

### Deploy

Push to `main` on GitHub. Vercel autodeploys on every push — runs `npm run build` and serves from `dist/`. Config is in `vercel.json`.

```bash
git add .
git commit -m "your message"
git push
```

---

## Project Structure

```
pickleball-drills/
├── index.html              # HTML shell — no inline CSS or JS
├── src/
│   ├── main.js             # Entry point: imports, window bindings, init
│   ├── style.css           # All styles
│   ├── constants.js        # PLAYER_COLORS, GRID_*, court dimensions, ALL_TAGS
│   ├── defaultDrills.js    # Seed data for first load
│   ├── state.js            # Shared mutable state object
│   ├── storage.js          # Storage abstraction, loadDrills(), saveDrills()
│   ├── court.js            # gridToXY(), buildCourtSVG()
│   ├── utils.js            # esc(), showToast()
│   ├── navigation.js       # showView()
│   ├── library.js          # renderLibrary(), setFilter()
│   ├── detail.js           # openDrill()
│   ├── creator.js          # All creator/form logic, saveDrill(), deleteCurrentDrill()
│   └── export.js           # exportDrills()
├── public/                 # Static assets (favicon etc.) — copied to dist/ verbatim
├── package.json            # Vite dev/build scripts
├── vercel.json             # Build command + output directory
├── .gitignore
└── README.md
```

When a backend is added:

```
├── api/                    # Vercel serverless functions
└── db/                     # Schema, migrations
```

---

## Data Model

Each drill object:

```js
{
  id: string,               // 'drill-{timestamp}' for user-created
  name: string,
  players: number,          // 1–4, currently always 4
  desc: string,             // one-line summary shown on library card
  goal: string,             // full goal description shown on detail view
  tags: string[],           // e.g. ['dinking', 'NVZ', '3rd shot drop']
  startPositions: {         // grid coordinates per player, e.g. { P1: 'C3', P2: 'E3' }
    P1?: string,
    P2?: string,
    P3?: string,
    P4?: string
  },
  roles: [                  // one entry per player, in P1–P4 order
    {
      label: string,        // e.g. 'P1 — Bad Returner (Team A)'
      color: number,        // index into PLAYER_COLORS (0–3)
      desc: string
    }
  ],
  steps: [                  // ordered drill progression
    { title: string, desc: string }
  ],
  notes: string[]           // coaching cues, one per entry
}
```

---

## Court Grid System

The court SVG uses a 6-column × 8-row grid:

```
Columns:  A  B  C  D  E  F   (left → right)
Rows:     1–8                 (Team A baseline → Team B baseline)
```

Row zones:
- **1–2** — Team A baseline
- **3** — Team A NVZ interior (kitchen)
- **4** — Net zone (net at bottom of row 4)
- **5** — Team B NVZ interior (kitchen)
- **6** — Team B post-kitchen transition
- **7–8** — Team B baseline

Kitchen lines sit at the bottom of row 3 (Team A) and bottom of row 5 (Team B). Players standing *behind* the kitchen line belong in row 3 (Team A) or row 6 (Team B).

Grid coordinate examples: `C2` = mid-court left Team A baseline area, `E3` = right side just inside Team A kitchen.

---

## Player Conventions

- **P1 + P2** = Team A (always)
- **P3 + P4** = Team B (always)
- Player colors: P1 = lime, P2 = teal, P3 = orange, P4 = pink
- Labels are always P1–P4, never A1/A2/B1/B2 — team membership is expressed in role descriptions

---

## Sample Drills

### Drip Practice
3rd-shot drop drill under realistic game pressure.

| Player | Role | Start |
|---|---|---|
| P1 | Bad Returner — Team A. Feeds a short floaty ball simulating a shanked return, then scrambles forward and split-steps | E8 |
| P2 | Poach Threat — Team A. Holds just behind kitchen line shading middle, reads P3's contact before committing | C6 |
| P3 | 3rd Shot Driver — Team B. Executes drop to P1's feet, keeps moving toward NVZ after contact | E1 |
| P4 | Baseline Support — Team B. Mirrors P3, watches for P1 popup, transitions forward with P3 | B1 |

### Cross-Court Dink Rally
Two simultaneous cross-court dink rallies. P1↔P4 and P2↔P3. All four players behind their respective kitchen lines. First pair to 25 unbroken wins the round.

| Player | Start |
|---|---|
| P1 (Team A left) | B3 |
| P2 (Team A right) | E3 |
| P3 (Team B left) | B6 |
| P4 (Team B right) | E6 |

---

## Storage Abstraction

The storage layer is abstracted so swapping in a real backend touches one place:

```js
const storage = {
  async get(key) {
    if (window.storage && window.storage.get) {
      // Claude artifact shared storage
      const result = await window.storage.get(key, true);
      return result ? result.value : null;
    }
    return localStorage.getItem(key);   // standard browser fallback
  },
  async set(key, value) {
    if (window.storage && window.storage.set) {
      await window.storage.set(key, value, true);
    } else {
      localStorage.setItem(key, value); // standard browser fallback
    }
  }
};
```

When adding a backend: add a third branch that calls your API route. No other changes needed in `loadDrills` or `saveDrills`.

---

## Export

The nav bar has an **Export** button that downloads all drills as a CSV (`pickleball-drills-YYYY-MM-DD.csv`). Columns: name, players, description, goal, tags, P1–P4 start positions, all 4 role labels + descriptions, up to 5 step titles + descriptions, coaching notes joined with ` | `.

This exists as a manual backup while the app uses client-side storage.

---

## Known Issues / Next Steps

- [ ] Replace `localStorage` with a real database (Postgres via Supabase or Neon recommended)
- [ ] Add API routes (Vercel serverless functions or Express)
- [ ] Court graphic shows starting positions only — step-by-step court animation is explicitly deferred (complexity not worth it at POC stage)
- [ ] No drill reordering in the library
- [ ] Steps beyond 5 are silently dropped in the CSV export
- [ ] Player count selector exists (1–4) but all sample drills and conventions assume 4 players; sub-4 support is untested
- [ ] No import from CSV (export only for now)

---

## Design Notes

- Fonts: Barlow Condensed (display/headings), Barlow (body), DM Mono (labels, tags, code)
- Color palette: dark green background (`#0f1410`), lime accent (`#b5e853`), teal secondary (`#53e8a0`)
- All layout decisions prioritize mobile readability — this gets used on a phone at the court
- No authentication planned for the near term — it's four people, not a product