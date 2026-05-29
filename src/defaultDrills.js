export const DEFAULT_DRILLS = [
  {
    id: 'drill-drip',
    name: 'Drip Practice',
    players: 4,
    desc: 'P1 simulates a bad return from near the baseline. P3 and P4 (Team B) work the 3rd-shot drop. P2 (Team A) threatens the poach from the NVZ.',
    goal: 'Train the 3rd-shot drop under realistic game pressure. P3 must drip to P1\'s feet to neutralize the point and earn the transition forward. P1 practices recovering from a bad situation by moving forward and split-stepping. P2 creates poach pressure from the NVZ while staying honest to the backside.',
    tags: ['3rd shot drop', 'NVZ', 'driving', 'reset', 'poaching'],
    steps: [
      { title: 'Setup', desc: 'P1 (Team A) is near the baseline right with a ball — simulating a bad return. P2 (Team A) is just behind the kitchen line, shading the middle. P3 and P4 (Team B) are both at the baseline on their respective sides.', positions: { P1: 'F10', P2: 'D7', P3: 'F1', P4: 'C2' } },
      { title: 'P1 Feeds', desc: 'P1 hits a high, floaty ball toward P3, simulating a return that came up short and sits in the court. The moment the ball leaves P1\'s paddle, P1 starts moving forward toward NVZ.', positions: {} },
      { title: 'P3 Drops — P1 Split-Steps — P2 Reads', desc: 'P3 moves to the ball and drops cross-court toward P1\'s feet. P1 split-steps as P3 contacts — feet land, ready to move either direction. P2 reads P3\'s paddle face before committing to the poach.', positions: {} },
      { title: 'Resolution', desc: 'Clean drop at P1\'s feet: P1 is forced to reset low, P3 and P4 advance together toward NVZ, P2 holds. Popup: P2 attacks, P4 reacts. Either way — P3 and P4 keep moving forward.', positions: {} },
      { title: 'Rotate', desc: 'P3 and P4 rotate spots each rep. After 5 reps, P1 and P2 swap sides with P3 and P4 so everyone practices both roles.', positions: {} },
    ],
    notes: [
      'P1: move the instant the ball leaves your paddle — not after you watch where it lands.',
      'P1: split-step timing — feet land as P3 contacts. Early is wrong, late is wrong.',
      'P3: the drop targets P1\'s feet, not P2. Targeting P2\'s body hands P2 an easy ball.',
      'P2: read shoulder and paddle face before committing. Early poach = exposed backside.',
      'P4: don\'t just stand there — start your transition forward as soon as P3 contacts.',
    ],
  },
  {
    id: 'drill-dink-cross',
    name: 'Cross-Court Dink Rally',
    players: 4,
    desc: 'Two parallel cross-court dink rallies run simultaneously at the NVZ. Each pair competes for longest unbroken rally.',
    goal: 'Build dinking consistency under low stress. Aim for long unbroken rallies while placing the ball at the opponent\'s outside hip. Patience over aggression.',
    tags: ['dinking', 'NVZ', 'consistency', 'reset'],
    steps: [
      { title: 'Setup', desc: 'All four players just behind their kitchen line. P1 and P2 (Team A) on the top half, P3 and P4 (Team B) on the bottom half. P1 is cross-court from P4, P2 is cross-court from P3. Each cross-court pair has a ball.', positions: { P1: 'C4', P2: 'F4', P3: 'C6', P4: 'F6' } },
      { title: 'Parallel Rallies Begin', desc: 'P1↔P4 and P2↔P3 both start rallying cross-court simultaneously. Ball must stay in the kitchen or land just beyond the NVZ line. No speed-ups — pure consistency work.', positions: {} },
      { title: 'Count Aloud', desc: 'P1/P4 count together, P2/P3 count together. First pair to 25 unbroken wins the round. Error = reset to zero while the other pair keeps going.', positions: {} },
      { title: 'Variation — Straight Ahead', desc: 'After 3 rounds, switch to straight-ahead dinking: P1↔P3, P2↔P4 (same-side partners hitting straight across the net). Changes the angle and resets muscle memory.', positions: {} },
    ],
    notes: [
      'Paddle up and ready before the ball arrives — not a last-second lift.',
      'If you\'re speeding up during dink rallies, you\'re doing it wrong.',
      'Aim for the outside hip, not center body — harder to reset.',
      '25+ for both pairs simultaneously means everyone is in a good headspace.',
    ],
  },
];
