# pickleball-drills

A mobile-first SPA for a small group of pickleball players to manage, browse, and randomly select drills at the court. No auth — 4 friends all have the URL. Live at Vercel.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vanilla JS ES modules, Vite 5 bundler |
| Backend | Vercel serverless functions (Node.js) |
| Database | Neon PostgreSQL (serverless) |
| Dev server | Express 4 (API proxy on :3001) |
| Deployment | Vercel, auto-deploy on push to `master` |

## Running locally

```bash
npm install
npm run dev        # Vite (:5173) + Express API (:3001) concurrently
npm run build      # Production bundle → dist/
```

Required env var in `.env.local`:
```
DATABASE_URL=postgresql://...neon.tech/neondb?sslmode=require&channel_binding=require
```

## Architecture

### Frontend (src/)
Single-page app with 4 views toggled via CSS `.active` class:
- **Library** (`view-library`) — card grid, tag filter, "+ New" button
- **Detail** (`view-detail`) — drill info, SVG court, roles, steps, notes
- **Creator** (`view-creator`) — create/edit form with court position editor
- **Randomizer** (`view-randomizer`) — tag filter → random drill picker with confetti

Key files:
- `src/state.js` — single shared mutable state object (`drills`, `currentDrillId`, `editingId`, `activeFilter`, `selectedTags`, `stepCount`)
- `src/storage.js` — tiered fallback: Claude artifact API → `/api/drills` fetch → localStorage
- `src/court.js` — SVG court renderer, grid-to-XY conversion (`gridToXY('C3')`)
- `src/constants.js` — player colors, tags list, court grid dimensions
- `src/defaultDrills.js` — exported `DEFAULT_DRILLS` array (2 seed drills)

### Backend (api/)
Single endpoint: `api/drills.js`
- `GET /api/drills` — fetch drills array; seeds from `DEFAULT_DRILLS` if table empty
- `PUT /api/drills` — upsert entire drills array
- No ORM — uses `neon()` template-literal SQL from `@neondatabase/serverless`

### Database (db/)
Schema: `db/schema.sql`
```sql
CREATE TABLE IF NOT EXISTS kv_store (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```
Whole-array KV pattern: one row, `key='drills'`, `value=<JSONB array>`. Intentionally simple for ~dozen drills / 4 users.

## Core data model

```javascript
{
  id: string,           // 'drill-{timestamp}' or 'drill-drip', 'drill-dink-cross'
  name: string,
  players: number,      // 1–4 (always 4 in practice)
  desc: string,         // one-line summary (library card)
  goal: string,         // full description (detail view)
  tags: string[],       // subset of AVAILABLE_TAGS
  startPositions: { P1, P2, P3, P4 },  // court grid coords e.g. 'F10'
  roles: [{ label, color, desc }],      // one per player, color is 0–3 index
  steps: [{ title, desc }],
  notes: string[]
}
```

Teams: P1+P2 = Team A, P3+P4 = Team B (always).  
Colors: P1 lime `#b5e853`, P2 teal `#53e8a0`, P3 orange `#e8a053`, P4 pink `#e853a0`.

Available tags: `dinking, driving, 3rd shot drop, NVZ, poaching, reset, transition, feeding, defense, consistency`

## Court grid

8 cols (A–H) × 10 rows (1–10). Off-court: col A, H, row 1, 10.  
Court interior: cols B–G, rows 2–9.  
SVG viewport: 390×540px, cell 40px wide × 50px tall.

## No tests

No test suite. Manual browser testing only.
