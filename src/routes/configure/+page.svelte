<!-- svelte-ignore a11y-autofocus -->
<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-role-has-required-aria-props -->
<!-- svelte-ignore a11y-role-supports-aria-props -->
<!-- svelte-ignore a11y-valid-aria-props -->
<!-- svelte-ignore a11y-valid-aria-values -->
<!-- svelte-ignore a11y-valid-role -->

<script lang="ts">
  import { drillsStore } from '$lib/stores/drills';
  import type { Drill, DrillStep } from '$lib/types/drills';

  // Update grid dimensions
  const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];
  const ROWS = Array.from({ length: 20 }, (_, i) => (i + 1).toString());

  // Convert grid reference to court coordinates
  function gridToCourtCoordinates(ref: string): { x: number, z: number } | null {
    if (ref.length !== 2) return null;
    const col = ref[0].toUpperCase();
    const row = ref[1];
    
    const colIndex = COLUMNS.indexOf(col);
    const rowIndex = ROWS.indexOf(row);
    
    if (colIndex === -1 || rowIndex === -1) return null;

    // Convert to court coordinates (-10 to +10, -22 to +22)
    // Court is 20ft wide (-10 to +10) and 44ft long (-22 to +22)
    // Grid extends beyond court boundaries
    // Column G (index 6) is center of court
    // Row 10 (index 9) is exactly at the net (z=0)
    const x = (colIndex - 6) * 2; // Center court at column G (index 6)
    const z = (rowIndex - 9) * 2; // Net is at row 10 (index 9)
    
    return { x, z };
  }

  // State for the current drill being configured
  let currentDrill: Partial<Drill> = {
    name: '',
    description: '',
    category: 'fundamentals',
    type: 'third-shot',
    players: 4,
    difficulty: 'beginner',
    goal: '',
    steps: []
  };

  // State for the current step being edited
  let currentStepIndex = 0;
  let currentStep: Partial<DrillStep> = {
    note: '',
    players: [],
    ball: { x: 0, z: 0 }
  };

  // Handle adding a position to the current step
  function addPosition(entity: 'P1' | 'P2' | 'P3' | 'P4' | 'ball', position: string) {
    const coords = gridToCourtCoordinates(position);
    if (!coords) return;

    if (entity === 'ball') {
      currentStep.ball = coords;
    } else {
      const existingIndex = currentStep.players?.findIndex(p => p.id === entity) ?? -1;
      if (existingIndex === -1) {
        currentStep.players?.push({ id: entity, ...coords });
      } else {
        currentStep.players[existingIndex] = { id: entity, ...coords };
      }
    }
  }

  // Handle saving the current step
  function saveStep() {
    if (!currentDrill.steps) currentDrill.steps = [];
    currentDrill.steps[currentStepIndex] = currentStep as DrillStep;
    currentStep = {
      note: '',
      players: [],
      ball: { x: 0, z: 0 }
    };
  }

  // Generate grid cells for reference
  $: gridCells = COLUMNS.flatMap(col => 
    ROWS.map(row => ({
      id: `${col}${row}`,
      col,
      row
    }))
  );
</script>

<div class="configure-page">
  <div class="content">
    <div class="sidebar">
      <h2>Drill Configuration</h2>
      
      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="form-group">
        <label for="drill-name">Drill Name</label>
        <input 
          type="text" 
          id="drill-name" 
          bind:value={currentDrill.name} 
          placeholder="Enter drill name"
        />
      </div>

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="form-group">
        <label for="drill-description">Description</label>
        <textarea 
          id="drill-description" 
          bind:value={currentDrill.description} 
          placeholder="Enter drill description"
        ></textarea>
      </div>

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="form-group">
        <label for="drill-type">Type</label>
        <select id="drill-type" bind:value={currentDrill.type}>
          {#each Object.entries($drillsStore?.types || {}) as [key, type]}
            <option value={key}>{type.name}</option>
          {/each}
        </select>
      </div>

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="form-group">
        <label for="drill-players">Number of Players</label>
        <select id="drill-players" bind:value={currentDrill.players}>
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
        </select>
      </div>

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="form-group">
        <label for="drill-difficulty">Difficulty</label>
        <select id="drill-difficulty" bind:value={currentDrill.difficulty}>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      <!-- svelte-ignore a11y-label-has-associated-control -->
      <div class="form-group">
        <label for="drill-goal">Goal</label>
        <textarea 
          id="drill-goal" 
          bind:value={currentDrill.goal} 
          placeholder="Enter drill goal"
        ></textarea>
      </div>

      <div class="step-editor">
        <h3>Step {currentStepIndex + 1}</h3>
        
        <!-- svelte-ignore a11y-label-has-associated-control -->
        <div class="form-group">
          <label for="step-note">Step Note</label>
          <input 
            type="text" 
            id="step-note" 
            bind:value={currentStep.note} 
            placeholder="Enter step description"
          />
        </div>

        <div class="position-inputs">
          <!-- svelte-ignore a11y-label-has-associated-control -->
          <div class="form-group">
            <label>Ball Position</label>
            <input 
              type="text" 
              placeholder="e.g., A1" 
              on:change={(e) => addPosition('ball', e.target.value)}
            />
          </div>

          {#each ['P1', 'P2', 'P3', 'P4'] as player}
            {#if parseInt(currentDrill.players?.toString() || '0') >= parseInt(player[1])}
              <!-- svelte-ignore a11y-label-has-associated-control -->
              <div class="form-group">
                <label>{player} Position</label>
                <input 
                  type="text" 
                  placeholder="e.g., A1" 
                  on:change={(e) => addPosition(player as 'P1' | 'P2' | 'P3' | 'P4', e.target.value)}
                />
              </div>
            {/if}
          {/each}
        </div>

        <div class="step-buttons">
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <button on:click={saveStep}>Save Step</button>
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <button on:click={() => {
            if (!currentDrill.steps) currentDrill.steps = [];
            currentDrill.steps.push({
              note: '',
              players: [],
              ball: { x: 0, z: 0 }
            });
            currentStepIndex = currentDrill.steps.length - 1;
          }}>
            Add Step
          </button>
        </div>
      </div>

      <div class="save-controls">
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <button class="save-button" on:click={() => {
          console.log('Save drill:', currentDrill);
        }}>
          Save Drill
        </button>
      </div>
    </div>

    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="court-section">
      <div class="court-container">
        <!-- Court outline -->
        <div class="court">
          <!-- Net -->
          <div class="net"></div>
          
          <!-- Kitchen lines -->
          <div class="kitchen-line near"></div>
          <div class="kitchen-line far"></div>
          
          <!-- Court boundaries -->
          <div class="court-boundary"></div>
        </div>

        <!-- Grid overlay using CSS Grid -->
        <div class="grid-overlay">
          <!-- Column labels -->
          {#each COLUMNS as col, colIndex}
            <div class="grid-column-label" style="grid-column: {colIndex + 2}">{col}</div>
          {/each}

          <!-- Grid cells -->
          {#each ROWS as row, rowIndex}
            <div class="grid-row-label" style="grid-row: {rowIndex + 2}">{row}</div>
            {#each COLUMNS as col, colIndex}
              <div 
                class="grid-cell" 
                style="grid-column: {colIndex + 2}; grid-row: {rowIndex + 2}"
              >
                {col}{row}
              </div>
            {/each}
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .configure-page {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #1a1a1a;
    color: #fff;
    overflow: hidden;
  }

  .content {
    display: flex;
    flex: 1;
    overflow: hidden;
    padding: 20px;
    gap: 20px;
    align-items: center;
  }

  .court-section {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    min-width: 0;
    height: 100%;
  }

  .court-container {
    position: relative;
    width: 240px;
    height: 528px;
    margin: 0;
    padding: 0;
  }

  .court {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 240px;
    height: 528px;
    background: #2a2a2a;
    border: 2px solid #666;
    z-index: 1;
  }

  .net {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #888;
    transform: translateY(-50%);
    z-index: 3;
  }

  .kitchen-line {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background: #666;
  }

  .kitchen-line.near {
    top: calc(50% - 84px);
  }

  .kitchen-line.far {
    top: calc(50% + 84px);
  }

  .court-boundary {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border: 2px solid #666;
    z-index: 3;
  }

  .grid-overlay {
    position: absolute;
    top: -60px;
    left: -120px;
    right: 0;
    bottom: 0;
    z-index: 2;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(13, 1fr);
    grid-template-rows: 20px repeat(21, 1fr);
    width: 390px;
  }

  .grid-columns {
    display: contents;
  }

  .grid-column-label {
    grid-row: 1;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9em;
    width: 30px;
  }

  .grid-rows {
    display: contents;
  }

  .grid-row {
    display: contents;
  }

  .grid-row-label {
    grid-column: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9em;
    padding: 0 4px;
  }

  .grid-row-cells {
    display: contents;
  }

  .grid-cell {
    width: 30px;
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8em;
    color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }

  .grid-cell:nth-child(odd) {
    background: rgba(255, 255, 255, 0.01);
  }

  .grid-cell:nth-child(even) {
    background: rgba(255, 255, 255, 0.03);
  }

  .save-controls {
    margin-top: auto;
    padding-top: 20px;
  }

  .save-button {
    width: 100%;
    padding: 12px;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1em;
    cursor: pointer;
  }

  .save-button:hover {
    background: #45a049;
  }

  .sidebar {
    width: 300px;
    background: #2a2a2a;
    padding: 20px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .form-group label {
    font-weight: bold;
    color: #fff;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 8px;
    border: 1px solid #444;
    border-radius: 4px;
    background: #333;
    color: #fff;
  }

  .form-group textarea {
    min-height: 100px;
    resize: vertical;
  }

  .step-editor {
    margin-top: 20px;
    padding: 16px;
    background: #333;
    border-radius: 4px;
  }

  .position-inputs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin: 16px 0;
  }

  .step-buttons {
    display: flex;
    gap: 8px;
  }

  .step-buttons button {
    padding: 8px 12px;
    border: 1px solid #444;
    border-radius: 4px;
    background: #333;
    color: white;
    cursor: pointer;
  }

  .button-group {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }

  button {
    padding: 8px 16px;
    border: none;
    border-radius: 4px;
    background: #444;
    color: #fff;
    cursor: pointer;
    transition: background 0.2s;
  }

  button:hover {
    background: #555;
  }

  button.primary {
    background: #0066cc;
  }

  button.primary:hover {
    background: #0055aa;
  }

  button.danger {
    background: #cc0000;
  }

  button.danger:hover {
    background: #aa0000;
  }

  .step-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .step-item {
    background: #333;
    padding: 10px;
    border-radius: 4px;
    border: 1px solid #444;
  }

  .step-item.active {
    border-color: #0066cc;
  }

  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .step-number {
    font-weight: bold;
    color: #fff;
  }

  .step-actions {
    display: flex;
    gap: 5px;
  }

  .step-content {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .position-inputs {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .position-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .position-group label {
    font-size: 0.9em;
    color: #ccc;
  }

  .position-input {
    display: flex;
    gap: 8px;
  }

  .position-input input {
    flex: 1;
  }
</style> 