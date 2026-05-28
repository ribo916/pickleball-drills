const { neon } = require('@neondatabase/serverless');

const DEFAULT_DRILLS = [
  {
    id: 'drill-drip',
    name: 'Drip Practice',
    players: 4,
    desc: 'P1 simulates a bad return from near the baseline. P3 and P4 (Team B) work the 3rd-shot drop. P2 (Team A) threatens the poach from the NVZ.',
    goal: "Train the 3rd-shot drop under realistic game pressure. P3 must drip to P1's feet to neutralize the point and earn the transition forward. P1 practices recovering from a bad situation by moving forward and split-stepping. P2 creates poach pressure from the NVZ while staying honest to the backside.",
    tags: ['3rd shot drop', 'NVZ', 'driving', 'reset', 'poaching'],
    startPositions: { P1: 'F10', P2: 'D7', P3: 'F1', P4: 'C2' },
    roles: [
      { label: 'P1 — Bad Returner (Team A)', color: 0, desc: "Starts near the baseline right, simulating a player who just hit a poor return that landed short. Feeds a high floaty ball to P3, then immediately moves forward toward the NVZ and split-steps — feet should land as P3 makes contact." },
      { label: 'P2 — Poach Threat (Team A)', color: 1, desc: "Holds position just behind the kitchen line, left-center, shading the middle. Read P3's contact before committing to a poach. If the ball pops up, take it. Don't abandon the backside early." },
      { label: 'P3 — 3rd Shot Driver (Team B)', color: 2, desc: "Starts at the baseline right. Receives P1's feed and executes the 3rd-shot drop, targeting P1's feet to force a reset and neutralize P2's poach. Keep moving toward NVZ after contact — the drop is a transition, not a destination." },
      { label: 'P4 — Baseline Support (Team B)', color: 3, desc: "Starts at the baseline left. Mirrors P3's starting position. Watches P1 — if P1 pops the drop up, P4 is in position to put pressure on. Begin moving forward together with P3 after the drop lands." },
    ],
    steps: [
      { title: 'Setup', desc: "P1 (Team A) is near the baseline right with a ball — simulating a bad return. P2 (Team A) is just behind the kitchen line, shading the middle. P3 and P4 (Team B) are both at the baseline on their respective sides." },
      { title: 'P1 Feeds', desc: "P1 hits a high, floaty ball toward P3, simulating a return that came up short and sits in the court. The moment the ball leaves P1's paddle, P1 starts moving forward toward NVZ." },
      { title: 'P3 Drops — P1 Split-Steps — P2 Reads', desc: "P3 moves to the ball and drops cross-court toward P1's feet. P1 split-steps as P3 contacts — feet land, ready to move either direction. P2 reads P3's paddle face before committing to the poach." },
      { title: 'Resolution', desc: "Clean drop at P1's feet: P1 is forced to reset low, P3 and P4 advance together toward NVZ, P2 holds. Popup: P2 attacks, P4 reacts. Either way — P3 and P4 keep moving forward." },
      { title: 'Rotate', desc: "P3 and P4 rotate spots each rep. After 5 reps, P1 and P2 swap sides with P3 and P4 so everyone practices both roles." },
    ],
    notes: [
      "P1: move the instant the ball leaves your paddle — not after you watch where it lands.",
      "P1: split-step timing — feet land as P3 contacts. Early is wrong, late is wrong.",
      "P3: the drop targets P1's feet, not P2. Targeting P2's body hands P2 an easy ball.",
      "P2: read shoulder and paddle face before committing. Early poach = exposed backside.",
      "P4: don't just stand there — start your transition forward as soon as P3 contacts.",
    ],
  },
  {
    id: 'drill-dink-cross',
    name: 'Cross-Court Dink Rally',
    players: 4,
    desc: 'Two parallel cross-court dink rallies run simultaneously at the NVZ. Each pair competes for longest unbroken rally.',
    goal: "Build dinking consistency under low stress. Aim for long unbroken rallies while placing the ball at the opponent's outside hip. Patience over aggression.",
    tags: ['dinking', 'NVZ', 'consistency', 'reset'],
    startPositions: { P1: 'C4', P2: 'F4', P3: 'C6', P4: 'F6' },
    roles: [
      { label: 'P1 — Left (Team A)', color: 0, desc: "Just behind the kitchen line, left side. Rallies cross-court with P4 (Team B right). Count aloud with P2 — competing against P3/P4's count." },
      { label: 'P2 — Right (Team A)', color: 1, desc: "Just behind the kitchen line, right side. Rallies cross-court with P3 (Team B left). Count aloud with P1 — first pair to 25 unbroken wins the round." },
      { label: 'P3 — Left (Team B)', color: 2, desc: "Just behind the kitchen line, left side. Rallies cross-court with P2 (Team A right). Competing against P1/P2's count simultaneously." },
      { label: 'P4 — Right (Team B)', color: 3, desc: "Just behind the kitchen line, right side. Rallies cross-court with P1 (Team A left). Target the outside hip — harder to reset than center body." },
    ],
    steps: [
      { title: 'Setup', desc: "All four players just behind their kitchen line. P1 and P2 (Team A) on the top half, P3 and P4 (Team B) on the bottom half. P1 is cross-court from P4, P2 is cross-court from P3. Each cross-court pair has a ball." },
      { title: 'Parallel Rallies Begin', desc: "P1↔P4 and P2↔P3 both start rallying cross-court simultaneously. Ball must stay in the kitchen or land just beyond the NVZ line. No speed-ups — pure consistency work." },
      { title: 'Count Aloud', desc: "P1/P4 count together, P2/P3 count together. First pair to 25 unbroken wins the round. Error = reset to zero while the other pair keeps going." },
      { title: 'Variation — Straight Ahead', desc: "After 3 rounds, switch to straight-ahead dinking: P1↔P3, P2↔P4 (same-side partners hitting straight across the net). Changes the angle and resets muscle memory." },
    ],
    notes: [
      'Paddle up and ready before the ball arrives — not a last-second lift.',
      "If you're speeding up during dink rallies, you're doing it wrong.",
      'Aim for the outside hip, not center body — harder to reset.',
      '25+ for both pairs simultaneously means everyone is in a good headspace.',
    ],
  },
];

module.exports = async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  if (req.method === 'GET') {
    const rows = await sql`SELECT value FROM kv_store WHERE key = 'drills'`;
    if (rows.length === 0) {
      const valueStr = JSON.stringify(DEFAULT_DRILLS);
      await sql`INSERT INTO kv_store (key, value) VALUES ('drills', ${valueStr}::jsonb)`;
      return res.status(200).json({ drills: DEFAULT_DRILLS });
    }
    return res.status(200).json({ drills: rows[0].value });
  }

  if (req.method === 'PUT') {
    const { drills } = req.body;
    const valueStr = JSON.stringify(drills);
    await sql`
      INSERT INTO kv_store (key, value, updated_at)
      VALUES ('drills', ${valueStr}::jsonb, now())
      ON CONFLICT (key) DO UPDATE SET value = ${valueStr}::jsonb, updated_at = now()
    `;
    return res.status(200).json({ ok: true });
  }

  res.status(405).json({ error: 'Method not allowed' });
};
