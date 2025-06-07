// drills.js

export const standard3ShotDrill = {
    name: "3 Shot Pattern",
    description: "Serve, return, and third shot drop with natural player movement",
    steps: [
      {
        note: "Initial positions",
        players: [
          { id: 'P1', x: 4, z: -23 },  // Server on right side
          { id: 'P2', x: -4, z: -23 }, // Partner on left
          { id: 'P3', x: -4, z: 23 },  // Returner on left
          { id: 'P4', x: 4, z: 7 }     // Partner at kitchen line
        ],
        ball: { x: 4, z: -23 }
      },
      {
        note: "Serve crosses net, returner steps to meet it",
        players: [
          { id: 'P1', x: 4, z: -23 },
          { id: 'P2', x: -4, z: -23 },
          { id: 'P3', x: -4, z: 21 },
          { id: 'P4', x: 4, z: 7 }
        ],
        ball: { x: -4, z: 18 } // cross-court serve
      },
      {
        note: "Returner hits deep return, server prepares",
        players: [
          { id: 'P1', x: 4, z: -21 },
          { id: 'P2', x: -4, z: -23 },
          { id: 'P3', x: -4, z: 18 },
          { id: 'P4', x: 4, z: 7 }
        ],
        ball: { x: 4, z: -18 }
      },
      {
        note: "Third shot drop and advance",
        players: [
          { id: 'P1', x: 4, z: -7 },
          { id: 'P2', x: -4, z: -15 },
          { id: 'P3', x: -4, z: 16 },
          { id: 'P4', x: 4, z: 7 }
        ],
        ball: { x: 0, z: 5.5 }
      }
    ]
  };
  