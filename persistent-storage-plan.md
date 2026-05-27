# Plan: Shared Persistent Storage via Neon Postgres

## Context

The app currently stores drills in `localStorage` (or Claude artifact storage), which is per-browser and not shared. The goal is a single shared store so any user — on any device, anywhere — sees the same drill library. The user asked about Neon Postgres vs Neon Redis; **Postgres is the right choice**: this app does structured CRUD on drill objects, not caching or ephemeral session data. Redis would be a misuse of the tool.

The app's storage abstraction (`storage.get` / `storage.set`) was explicitly designed for this swap. The implementation is a Vercel serverless API backed by a single Neon Postgres table, with minimal frontend changes.

---

## Storage Design: "Whole Array" JSONB

Store the entire drills array as a single JSONB value keyed by `'drills'`. This matches the existing get/set interface exactly (no refactoring of `loadDrills`, `saveDrills`, or any CRUD functions).

**Why not per-row REST CRUD?** The frontend already manages the array in memory. A whole-array PUT/GET API surface mirrors that shape with zero structural refactoring. Race conditions (two users saving simultaneously) are negligible for 4 users who aren't concurrently editing.

---

## Database Schema

File: `db/schema.sql` (run once manually in Neon's SQL editor or via `psql`)

```sql
CREATE TABLE IF NOT EXISTS kv_store (
  key        TEXT PRIMARY KEY,
  value      JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## New Files

### `api/drills.js`

Single serverless function handling both methods:

- **GET** — `SELECT value FROM kv_store WHERE key = 'drills'`. If no row exists, insert `DEFAULT_DRILLS` and return them. Returns `{ drills: [...] }`.
- **PUT** — Upsert: `INSERT ... ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = now()`. Body: `{ drills: [...] }`. Returns `{ ok: true }`.

Include `DEFAULT_DRILLS` inline (copy from `index.html`). Use `@neondatabase/serverless`:

```javascript
const { neon } = require('@neondatabase/serverless');
const sql = neon(process.env.DATABASE_URL);
```

### `db/schema.sql`

The CREATE TABLE statement above. Manual one-time run — no migration framework needed.

---

## Modified Files

### `public/index.html` — storage object only (~15 lines changed)

Replace the `storage` object (lines 478–494) with a three-branch version. **`loadDrills` and `saveDrills` are not touched.**

```javascript
const storage = {
  async get(key) {
    if (window.storage && window.storage.get) {          // branch 1: Claude artifact
      const result = await window.storage.get(key, true);
      return result ? result.value : null;
    }
    try {                                                 // branch 2: API (production)
      const res = await fetch(`/api/${key}`);
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      return JSON.stringify(data[key]);                  // re-stringify so loadDrills can JSON.parse it
    } catch(e) {
      return localStorage.getItem(key);                  // branch 3: graceful fallback
    }
  },
  async set(key, value) {
    if (window.storage && window.storage.set) {          // branch 1: Claude artifact
      await window.storage.set(key, value, true);
      return;
    }
    try {                                                 // branch 2: API (production)
      await fetch(`/api/${key}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [key]: JSON.parse(value) })
      });
    } catch(e) {
      localStorage.setItem(key, value);                  // branch 3: graceful fallback
    }
  }
};
```

### `package.json`

- Add `@neondatabase/serverless` to `dependencies`
- Add `vercel` to `devDependencies`
- Change `dev` script from `serve public -p 3000` to `vercel dev` (so API routes work locally)

### `vercel.json`

Add `functions` block (optional but explicit about limits):

```json
{
  "outputDirectory": "public",
  "functions": {
    "api/*.js": { "memory": 128, "maxDuration": 10 }
  }
}
```

---

## Environment Variables

| Variable | Value | Where |
|---|---|---|
| `DATABASE_URL` | Neon pooled connection string | Vercel dashboard + `.env.local` for local dev |

Get from Neon dashboard → Connection Details → use the **"Serverless driver compatible"** pooled string.

Add `.env.local` to `.gitignore` (confirm it's already there).

---

## Seeding

On first `GET /api/drills`, if the table is empty, the API inserts `DEFAULT_DRILLS` and returns them. No manual seed script needed. The first user to load the deployed app triggers the seed.

---

## Implementation Sequence

1. Create Neon project (or use existing), copy `DATABASE_URL`
2. Run `db/schema.sql` in Neon SQL editor
3. Write `api/drills.js`
4. Update `package.json` (dep + dev script)
5. Update `vercel.json`
6. Update `storage` object in `public/index.html`
7. Add `DATABASE_URL` to Vercel env vars (dashboard or `vercel env add`)
8. Create `.env.local` with `DATABASE_URL` for local dev
9. `npm install && vercel dev` — test locally (GET seeds DB, CRUD persists)
10. Push to `main` — Vercel autodeploys

---

## Verification

- `vercel dev`: open app, create a drill, refresh — drill persists (confirm via Neon SQL editor: `SELECT * FROM kv_store`)
- Open in a second browser / incognito — same drills appear
- Edit and delete a drill — changes reflected everywhere
- Kill and restart `vercel dev` — drills survive (stored in Neon, not memory)

---

## Gotchas

- **Staleness check as implicit migration**: `loadDrills` wipes drills if any drill lacks `startPositions`. If you ever add a required field and old DB data lacks it, all drills get reset to defaults. Intentional for now; note in code.
- **No auth**: anyone with the URL can delete all drills. Accepted per README ("it's four people, not a product").
- **`vercel dev` required locally**: `npm run dev` (old `serve`) won't run API routes. Use `vercel dev` after this change.
