# Pickle Lab — Pickleball Drill Library

A mobile-friendly web app for a small group to share, create, and reference pickleball drills during weekend sessions.

---

## Background

Four people drill together on weekends. The recurring problem: someone says "let's do that drive-drop drill" and nobody can remember exactly how it goes — roles, setup, what each person is supposed to be doing. There's no shared repository.

This app solves that. Any of the four can add a drill, describe the setup, assign player roles, walk through the steps, and attach coaching notes. The court graphic shows starting positions using a grid coordinate system.

---

## Tech Stack

| Layer | What |
|---|---|
| Frontend | Vanilla HTML/CSS/JS, Vite |
| API | Vercel serverless functions (`api/`) |
| Storage | Neon Postgres (single JSONB row, whole-array pattern) |
| Deploy | Vercel via GitHub push to `master` |
| Dev tooling | Claude Code in VS Code |

---

## Local Development

Requires a `.env.local` file in the project root:

```
DATABASE_URL=postgresql://...your neon pooled connection string...
```

```bash
npm install
npm run dev
```

`npm run dev` runs Vite and a local Express API server concurrently. Vite proxies all `/api/*` requests to the Express server on port 3001, which loads `DATABASE_URL` from `.env.local` and uses the same handler as production.

Opens at `http://localhost:5173`.

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

### Deploy

Push to `master` on GitHub. Vercel autodeploys on every push — runs `npm run build` and serves `dist/`. Config is in `vercel.json`.

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
│   ├── defaultDrills.js    # Seed data (used by api/drills.js on first load)
│   ├── state.js            # Shared mutable state object
│   ├── storage.js          # Storage abstraction, loadDrills(), saveDrills()
│   ├── court.js            # gridToXY(), buildCourtSVG()
│   ├── utils.js            # esc(), showToast()
│   ├── navigation.js       # showView()
│   ├── library.js          # renderLibrary(), setFilter()
│   ├── detail.js           # openDrill()
│   └── creator.js          # All creator/form logic, saveDrill(), deleteCurrentDrill()
├── api/
│   └── drills.js           # Serverless function: GET seeds + returns, PUT upserts
├── db/
│   └── schema.sql          # One-time setup — run in Neon SQL editor
├── server.dev.js           # Local Express API server (dev only, not deployed)
├── vite.config.js          # Proxies /api/* to local Express server in dev
├── public/                 # Static assets — copied to dist/ verbatim
├── package.json
├── vercel.json
└── .gitignore
```

---

## Database

A single Neon Postgres table:

```sql
CREATE TABLE IF NOT EXISTS kv_store (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

The entire drills array is stored as one JSONB value under the key `'drills'`. On first `GET /api/drills`, if the table is empty, the API seeds from `DEFAULT_DRILLS` in `api/drills.js`. Every subsequent load reads that single row; every save upserts it.

**Scaling note:** At 4 users and a few dozen drills this design is fine — primary key lookup, no full scans. If the library ever grows to hundreds of drills, the right migration is per-row storage (`id TEXT PRIMARY KEY, data JSONB`) with proper REST endpoints. The frontend already tracks drills by ID so the change would be isolated to `api/drills.js` and `src/storage.js`.

---

## Storage Abstraction

`src/storage.js` has three branches, tried in order:

```js
const storage = {
  async get(key) {
    if (window.storage && window.storage.get) {   // Claude artifact env
      const result = await window.storage.get(key, true);
      return result ? result.value : null;
    }
    try {                                          // production + local dev (via proxy)
      const res = await fetch(`/api/${key}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return JSON.stringify(data[key]);
    } catch (e) {
      return localStorage.getItem(key);            // fallback
    }
  },
  async set(key, value) {
    if (window.storage && window.storage.set) {
      await window.storage.set(key, value, true);
      return;
    }
    try {
      await fetch(`/api/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: JSON.parse(value) }),
      });
    } catch (e) {
      localStorage.setItem(key, value);
    }
  },
};
```

`loadDrills()` and `saveDrills()` are not aware of which branch is active — they just call `storage.get` and `storage.set`.

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

**Stale check:** `loadDrills()` wipes and reseeds from defaults if any stored drill is missing `startPositions`. This acts as an implicit migration guard — if a required field is added and old DB data lacks it, all drills reset. Intentional for now given the small user base.

---

## Court Grid System

The court SVG uses a 6-column × 8-row grid:

```
Columns:  A   B  C  D  E  F  G   H   (left → right)
          off ←  court (B–G)  → off
Rows:     1–10   (1 and 10 are off-court; 2–9 are the court)
```

Row zones (within the court, rows 2–9):
- **2–3** — Team A baseline
- **4** — Team A NVZ interior (kitchen)
- **5** — Net zone (net at bottom of row 5)
- **6** — Team B NVZ interior (kitchen)
- **7** — Team B post-kitchen transition
- **8–9** — Team B baseline

Off-court positions: column A, column H, row 1, and row 10 — one cell outside the court boundary on all sides. Useful for placing players before they enter the court.

Kitchen lines sit at the bottom of row 4 (Team A) and bottom of row 6 (Team B).

Grid coordinate examples: `C3` = left side Team A baseline, `F4` = right side just inside Team A kitchen, `A5` = off-court left at net height.

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
| P1 | Bad Returner — Team A. Feeds a short floaty ball simulating a shanked return, then scrambles forward and split-steps | F10 |
| P2 | Poach Threat — Team A. Holds just behind kitchen line shading middle, reads P3's contact before committing | D7 |
| P3 | 3rd Shot Driver — Team B. Executes drop to P1's feet, keeps moving toward NVZ after contact | F1 |
| P4 | Baseline Support — Team B. Mirrors P3, watches for P1 popup, transitions forward with P3 | C2 |

### Cross-Court Dink Rally
Two simultaneous cross-court dink rallies. P1↔P4 and P2↔P3. All four players behind their respective kitchen lines. First pair to 25 unbroken wins the round.

| Player | Start |
|---|---|
| P1 (Team A left) | B3 |
| P2 (Team A right) | E3 |
| P3 (Team B left) | B6 |
| P4 (Team B right) | E6 |

---

## Known Issues / Next Steps

- [ ] Court graphic shows starting positions only — step-by-step court animation is explicitly deferred
- [ ] No drill reordering in the library
- [ ] Player count selector exists (1–4) but all drills assume 4 players; sub-4 support is untested
- [ ] No authentication — anyone with the URL has full access (acceptable: it's four people, not a product)

---

## Design Notes

- Fonts: Barlow Condensed (display/headings), Barlow (body), DM Mono (labels, tags, code)
- Color palette: dark green background (`#0f1410`), lime accent (`#b5e853`), teal secondary (`#53e8a0`)
- All layout decisions prioritize mobile readability — this gets used on a phone at the court
