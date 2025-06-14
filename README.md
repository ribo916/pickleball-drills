# 🏓 Pickleball Drill Visualizer

This SvelteKit app visualizes pickleball drills using a 3D court rendered with Three.js. The app animates player movement and ball flight through key shots like serves, returns, and third shot drops.

---

## 🛠 Development

### ✅ Setup
```bash
npm install
```

### ▶ Run Locally
```bash
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)

### 📦 Build for Production
```bash
npm run build
```

### 🔎 Preview Production Build
```bash
npm run preview
```

### 🚀 Deployment
This project uses `@sveltejs/adapter-auto` for production builds, which automatically detects and optimizes for the deployment platform (like Vercel). This configuration enables serverless deployment.

To deploy to Vercel:
1. Connect your GitHub repository to Vercel
2. Vercel will automatically detect the SvelteKit project
3. Deploy with default settings

> Note: The project is configured for serverless deployment. If deploying to a different platform, you may need to switch adapters. See [SvelteKit adapters](https://kit.svelte.dev/docs/adapters) for more information.

---

## 📁 File Structure & Purpose
```
src/
├── app.html                   # SvelteKit layout shell
├── routes/+page.svelte        # Canvas + UI + loads main.ts
└── lib/drills/                # All visualizer logic lives here
    ├── main.ts                # Entry point: sets up scene, loads court & drill, handles animation
    ├── court.ts               # Defines static court geometry (DO NOT MODIFY)
    ├── drills.ts              # Contains drill definitions (steps, ball, positions)
    ├── utils.ts               # Helper functions: create meshes, animate ball/players
    └── three.ts               # Central Three.js export
```

---

## 🚦 Court Coordinate System (DO NOT BREAK)

The coordinate system consists of two parts:

### 1. Playable Area Grid
- Uses chess notation (A-O for columns, 2-24 for rows)
- Each cell is 2ft × 2ft
- Playable area extends beyond court boundaries:
  - Width: 30ft (A-O)
  - Length: 46ft (2-24)
- Players can be positioned anywhere in the playable area

### 2. Court (subset of playable area)
- Court boundaries in chess notation:
  - Near baseline: C2-M2
  - Far baseline: C24-M24
  - Left sideline: C2-C24
  - Right sideline: M2-M24
  - Net: C13-M13
  - Kitchen lines: C10-M10 and C16-M16
- Court dimensions:
  - Width: 20ft (C-M)
  - Length: 44ft (2-24)
  - Kitchen zones: 7ft from net

### Coordinate System
- Origin (x=0, z=0) is at the net (C13-M13)
- x-axis: Positive is right, negative is left
- z-axis: Positive is far side, negative is near side
- Players can be positioned outside court boundaries
- All coordinates are in feet

---

## 📚 Defining Drills

Each drill is a structured object:
```ts
{
  name: string,
  description: string,
  steps: DrillStep[]
}
```

Each `step` looks like:
```ts
{
  note: "Optional label",
  players: [
    { id: 'P1', x: number, z: number },
    { id: 'P2', x: number, z: number },
    { id: 'P3', x: number, z: number },
    { id: 'P4', x: number, z: number }
  ],
  ball: { x: number, z: number }
}
```

### ✅ Step Rules
- Must define **exactly 4 players** (P1–P4)
- Only `{ x, z }` allowed — no `y`
- Ball is its own `{ x, z }` object
- Units = **feet**, aligned to court dimensions

---

## 💡 Drill Authoring Tips
- Steps should feel natural — 1–2 entities change per step
- Animate the ball across the net using `animateBall()`
- Use `note` to label or debug movement visually

---

## ➕ To Add a New Drill
1. Edit `src/lib/drills/drills.ts`
2. Copy the structure of `standard3ShotDrill`
3. Create your new drill object:
```ts
export const myDrill = {
  name: "Drop & Dink",
  steps: [ /* ... */ ]
}
```
4. Import it into `main.ts`
5. Optionally: create a dropdown or drill selector in the UI

---