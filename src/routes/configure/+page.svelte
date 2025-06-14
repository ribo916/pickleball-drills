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
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // Grid system for playable area (extends beyond court boundaries)
  // Playable area is 30ft wide (A-O) and 46ft long (2-24)
  // Each cell is 2ft × 2ft
  // Court is a subset of the playable area:
  // - Court width: C2-M2 (20ft)
  // - Court length: C2-C24 (44ft)
  // - Net: C13-M13
  // - Kitchen lines: C10-M10 and C16-M16
  // Players can be positioned anywhere in the playable area (A2-O24)
  const COLUMNS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O'];
  const ROWS = Array.from({ length: 25 }, (_, i) => (i + 1).toString());

  // Convert grid reference to court coordinates
  function gridToCourtCoordinates(ref: string): { x: number, z: number } | null {
    if (ref.length < 2) return null;
    const col = ref[0].toUpperCase();
    const row = ref.slice(1);
    
    const colIndex = COLUMNS.indexOf(col);
    const rowIndex = ROWS.indexOf(row);
    
    if (colIndex === -1 || rowIndex === -1) return null;

    // Convert to court coordinates
    // Playable area extends beyond court boundaries:
    // - Court is 20ft wide (C-M) and 44ft long (2-24)
    // - Net is at row 13 (z=0)
    // - Kitchen lines are at rows 10 and 16 (z=±7)
    // - Court boundaries are at columns C and M, rows 2 and 24
    const x = (colIndex - 6) * 2; // Center court at column G (index 6)
    const z = (rowIndex - 12) * 2; // Net is at row 13 (index 12)
    
    return { x, z };
  }

  // Convert court coordinates to grid reference
  function courtToGridCoordinates(x: number, z: number): string {
    // Convert from court coordinates to grid coordinates
    // Playable area extends beyond court boundaries
    // Column G (index 6) is center of court (x=0)
    // Row 13 (index 12) is exactly at the net (z=0)
    const colIndex = Math.round((x / 2) + 6);
    const rowIndex = Math.round((z / 2) + 12);
    
    if (colIndex < 0 || colIndex >= COLUMNS.length || rowIndex < 0 || rowIndex >= ROWS.length) {
      return '';
    }
    
    return `${COLUMNS[colIndex]}${ROWS[rowIndex]}`;
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

  // State for drill selection
  let selectedDrillId: string | null = null;
  let availableDrills: Drill[] = [];
  let loading = true;

  // Load available drills
  onMount(async () => {
    if (!browser) return;
    
    try {
      await drillsStore.load();
      availableDrills = drillsStore.getDrills();
      loading = false;
    } catch (error) {
      console.error('Error loading drills:', error);
      loading = false;
    }
  });

  // Handle drill selection
  function loadDrill(drillId: string) {
    const drill = drillsStore.getDrillById(drillId);
    if (drill) {
      currentDrill = { ...drill } as Partial<Drill>;
      selectedDrillId = drillId;
      currentStepIndex = 0;
      if (drill.steps && drill.steps.length > 0) {
        currentStep = { ...drill.steps[0] } as Partial<DrillStep>;
      }
    }
  }

  // Handle saving drill
  function saveDrill() {
    if (!currentDrill.name) {
      alert('Please enter a drill name');
      return;
    }

    // Generate ID if new drill
    if (!currentDrill.id) {
      currentDrill.id = currentDrill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }

    // Ensure steps array exists
    if (!currentDrill.steps) {
      currentDrill.steps = [];
    }

    // Save to store
    drillsStore.saveDrill(currentDrill as Drill);
    selectedDrillId = currentDrill.id;
    availableDrills = drillsStore.getDrills();
  }

  // Handle creating new drill
  function createNewDrill() {
    currentDrill = {
      name: '',
      description: '',
      category: 'fundamentals',
      type: 'third-shot',
      players: 4,
      difficulty: 'beginner',
      goal: '',
      steps: []
    };
    currentStep = {
      note: '',
      players: [],
      ball: { x: 0, z: 0 }
    };
    currentStepIndex = 0;
    selectedDrillId = null;
  }

  // Handle adding a position to the current step
  function addPosition(entity: 'P1' | 'P2' | 'P3' | 'P4' | 'ball', position: string) {
    const coords = gridToCourtCoordinates(position);
    if (!coords) return;

    if (entity === 'ball') {
      currentStep.ball = coords;
    } else {
      if (!currentStep.players) {
        currentStep.players = [];
      }
      const existingIndex = currentStep.players.findIndex(p => p.id === entity);
      if (existingIndex === -1) {
        currentStep.players.push({ id: entity, ...coords });
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

  // Handle step navigation
  function goToStep(index: number) {
    if (currentDrill.steps && index >= 0 && index < currentDrill.steps.length) {
      currentStepIndex = index;
      const step = currentDrill.steps[index];
      if (step) {
        currentStep = {
          note: step.note,
          players: [...step.players],
          ball: { ...step.ball }
        };
      }
    }
  }

  // Handle step deletion
  function deleteStep(index: number) {
    if (!currentDrill.steps) return;
    if (confirm('Are you sure you want to delete this step?')) {
      const newSteps = currentDrill.steps.filter((_, i) => i !== index);
      currentDrill = { ...currentDrill, steps: newSteps };
      if (currentStepIndex >= newSteps.length) {
        currentStepIndex = Math.max(0, newSteps.length - 1);
      }
      if (newSteps.length > 0) {
        const step = newSteps[currentStepIndex];
        if (step) {
          currentStep = {
            note: step.note,
            players: [...step.players],
            ball: { ...step.ball }
          };
        }
      } else {
        currentStep = {
          note: '',
          players: [],
          ball: { x: 0, z: 0 }
        };
      }
    }
  }

  // Handle position input changes
  function handlePositionChange(event: Event, entity: 'P1' | 'P2' | 'P3' | 'P4' | 'ball') {
    const input = event.target as HTMLInputElement | null;
    if (input?.value) {
      addPosition(entity, input.value);
    }
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
      
      {#if loading}
        <div class="loading">Loading drills...</div>
      {:else}
        <div class="drill-selector">
          <div class="form-group">
            <label for="drill-select">Select Drill</label>
            <select 
              id="drill-select" 
              bind:value={selectedDrillId}
              on:change={(e) => loadDrill(e.target.value)}
            >
              <option value="">Create New Drill</option>
              {#each availableDrills as drill}
                <option value={drill.id}>{drill.name}</option>
              {/each}
            </select>
          </div>
          <button class="new-drill-button" on:click={createNewDrill}>New Drill</button>
        </div>

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
          <div class="step-header">
            <h3>Step {currentStepIndex + 1}</h3>
            <div class="step-navigation">
              <button 
                class="nav-button" 
                on:click={() => goToStep(currentStepIndex - 1)}
                disabled={currentStepIndex === 0}
              >
                ←
              </button>
              <button 
                class="nav-button" 
                on:click={() => goToStep(currentStepIndex + 1)}
                disabled={!currentDrill.steps || currentStepIndex === currentDrill.steps.length - 1}
              >
                →
              </button>
            </div>
          </div>

          <!-- Step list -->
          {#if currentDrill.steps && currentDrill.steps.length > 0}
            <div class="step-list">
              {#each currentDrill.steps as step, index}
                <div 
                  class="step-item" 
                  class:active={index === currentStepIndex}
                  on:click={() => goToStep(index)}
                >
                  <div class="step-item-header">
                    <span class="step-number">Step {index + 1}</span>
                    <button 
                      class="delete-step-button"
                      on:click|stopPropagation={() => deleteStep(index)}
                    >
                      ×
                    </button>
                  </div>
                  <div class="step-note">{step.note || 'No note'}</div>
                  <div class="step-positions">
                    {#each step.players as player}
                      <div class="position">
                        {player.id}: {courtToGridCoordinates(player.x, player.z)}
                      </div>
                    {/each}
                    <div class="position">
                      Ball: {courtToGridCoordinates(step.ball.x, step.ball.z)}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/if}
          
          <!-- Step form -->
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
            <div class="form-group">
              <label>Ball Position</label>
              <input 
                type="text" 
                placeholder="e.g., A1" 
                value={currentStep.ball ? courtToGridCoordinates(currentStep.ball.x, currentStep.ball.z) : ''}
                on:change={(e) => handlePositionChange(e, 'ball')}
              />
            </div>

            {#each ['P1', 'P2', 'P3', 'P4'] as player}
              {#if parseInt(currentDrill.players?.toString() || '0') >= parseInt(player[1])}
                <div class="form-group">
                  <label>{player} Position</label>
                  <input 
                    type="text" 
                    placeholder="e.g., A1" 
                    value={currentStep.players?.find(p => p.id === player) 
                      ? courtToGridCoordinates(
                          currentStep.players.find(p => p.id === player)?.x ?? 0,
                          currentStep.players.find(p => p.id === player)?.z ?? 0
                        )
                      : ''}
                    on:change={(e) => handlePositionChange(e, player as 'P1' | 'P2' | 'P3' | 'P4')}
                  />
                </div>
              {/if}
            {/each}
          </div>

          <div class="step-buttons">
            <button on:click={saveStep}>Save Step</button>
            <button on:click={() => {
              if (!currentDrill.steps) currentDrill.steps = [];
              currentDrill.steps.push({
                note: '',
                players: [],
                ball: { x: 0, z: 0 }
              });
              currentStepIndex = currentDrill.steps.length - 1;
              currentStep = { ...currentDrill.steps[currentStepIndex] };
            }}>
              Add Step
            </button>
          </div>
        </div>

        <div class="save-controls">
          <button class="save-button" on:click={saveDrill}>
            {selectedDrillId ? 'Update Drill' : 'Save New Drill'}
          </button>
          {#if selectedDrillId}
            <button 
              class="delete-button" 
              on:click={() => {
                if (confirm('Are you sure you want to delete this drill?')) {
                  drillsStore.deleteDrill(selectedDrillId!);
                  createNewDrill();
                  availableDrills = drillsStore.getDrills();
                }
              }}
            >
              Delete Drill
            </button>
          {/if}
        </div>
      {/if}
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
                class:kitchen-line={rowIndex === 9 || rowIndex === 15}
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
    overflow: auto;
  }

  .content {
    display: flex;
    flex: 1;
    overflow: auto;
    padding: 20px;
    gap: 20px;
    align-items: flex-start;
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
    width: 240px;  /* 20ft × 12px/ft */
    height: 528px; /* 44ft × 12px/ft */
    margin: 0;
    padding: 0;
  }

  .court {
    position: absolute;
    top: 0;
    left: 0;
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
    /* Position grid so court is centered within it */
    top: -60px;  /* (648px - 528px) / 2 to center court in total grid height */
    left: -84px; /* (360px - 240px) / 2 to center court horizontally */
    z-index: 2;
    margin: 0;
    display: grid;
    grid-template-columns: repeat(15, 24px); /* 2ft × 12px/ft */
    grid-template-rows: 24px repeat(25, 24px); /* 2ft × 12px/ft */
    width: 360px;  /* 15 columns × 24px */
    height: 648px; /* 26 rows × 24px */
  }

  .grid-columns {
    display: contents;
  }

  .grid-column-label {
    grid-row: 1;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.9em;
    width: 24px;
    margin: 0;
    padding: 0;
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
    width: 24px;
    margin: 0;
    padding: 0;
  }

  .grid-row-cells {
    display: contents;
  }

  .grid-cell {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7em;
    color: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.15);
    margin: 0;
    padding: 0;
  }

  .grid-cell.kitchen-line {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .drill-selector {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .drill-selector .form-group {
    flex: 1;
  }

  .new-drill-button {
    padding: 8px 12px;
    background: #2196F3;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    white-space: nowrap;
  }

  .new-drill-button:hover {
    background: #1976D2;
  }

  .save-controls {
    margin-top: auto;
    padding-top: 20px;
    display: flex;
    gap: 10px;
  }

  .save-button {
    flex: 1;
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

  .delete-button {
    padding: 12px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 1.1em;
    cursor: pointer;
  }

  .delete-button:hover {
    background: #d32f2f;
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
    margin-bottom: 16px;
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

  .loading {
    padding: 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.7);
  }

  .step-navigation {
    display: flex;
    gap: 8px;
  }

  .nav-button {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: white;
    border-radius: 4px;
    cursor: pointer;
  }

  .nav-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .step-list {
    margin-bottom: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }

  .step-item {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    padding: 8px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .step-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .step-item.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .step-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
  }

  .step-number {
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .delete-step-button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 1.2em;
    cursor: pointer;
    padding: 0 4px;
  }

  .delete-step-button:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  .step-note {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 4px;
  }

  .step-positions {
    font-size: 0.8em;
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .position {
    display: flex;
    gap: 8px;
  }
</style> 