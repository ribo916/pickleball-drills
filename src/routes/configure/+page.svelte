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
  import type { Drill, DrillStep, Player, Ball } from '$lib/types/drills';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  // State for the current drill being configured
  let currentDrill: Drill = {
    id: '',
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
  let currentStep: DrillStep = {
    note: '',
    players: [
      { id: 'P1', x: 0, z: 0 },
      { id: 'P2', x: 0, z: 0 },
      { id: 'P3', x: 0, z: 0 },
      { id: 'P4', x: 0, z: 0 }
    ],
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

  function loadDrill(drillId: string) {
    const drill = drillsStore.getDrillById(drillId);
    if (drill && typeof drill === 'object' && 'steps' in drill) {
      const d = drill as Drill;
      currentDrill = { ...d, steps: Array.isArray(d.steps) ? d.steps : [] };
      selectedDrillId = drillId;
      currentStepIndex = 0;
      if (currentDrill.steps.length > 0) {
        currentStep = { ...currentDrill.steps[0] };
      }
    }
  }

  function saveDrill() {
    if (!currentDrill.name) {
      alert('Please enter a drill name');
      return;
    }
    if (!currentDrill.id) {
      currentDrill.id = currentDrill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    if (!Array.isArray(currentDrill.steps)) {
      currentDrill.steps = [];
    }
    drillsStore.saveDrill(currentDrill);
    selectedDrillId = currentDrill.id;
    availableDrills = drillsStore.getDrills();
  }

  function createNewDrill() {
    currentDrill = {
      id: '',
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
      players: [
        { id: 'P1', x: 0, z: 0 },
        { id: 'P2', x: 0, z: 0 },
        { id: 'P3', x: 0, z: 0 },
        { id: 'P4', x: 0, z: 0 }
      ],
      ball: { x: 0, z: 0 }
    };
    currentStepIndex = 0;
    selectedDrillId = null;
  }

  function saveStep() {
    if (!Array.isArray(currentDrill.steps)) currentDrill.steps = [];
    currentDrill.steps[currentStepIndex] = { ...currentStep };
    currentStep = {
      note: '',
      players: [
        { id: 'P1', x: 0, z: 0 },
        { id: 'P2', x: 0, z: 0 },
        { id: 'P3', x: 0, z: 0 },
        { id: 'P4', x: 0, z: 0 }
      ],
      ball: { x: 0, z: 0 }
    };
  }

  function goToStep(index: number) {
    if (Array.isArray(currentDrill.steps) && index >= 0 && index < currentDrill.steps.length) {
      currentStepIndex = index;
      const step = currentDrill.steps[index];
      if (step) {
        currentStep = { ...step };
      }
    }
  }

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
          currentStep = { ...step };
        }
      } else {
        currentStep = {
          note: '',
          players: [
            { id: 'P1', x: 0, z: 0 },
            { id: 'P2', x: 0, z: 0 },
            { id: 'P3', x: 0, z: 0 },
            { id: 'P4', x: 0, z: 0 }
          ],
          ball: { x: 0, z: 0 }
        };
      }
    }
  }
</script>

<div class="configure-page">
  <div class="main-content">
    <div class="section">
      <div class="section-title">Drill Details</div>
      <div class="form-grid">
        <div class="form-group">
          <label for="drill-select">Select Drill</label>
          <select id="drill-select" bind:value={selectedDrillId} on:change={(e) => loadDrill((e.target as HTMLSelectElement).value)}>
            <option value="">Create New Drill</option>
            {#each availableDrills as drill}
              <option value={drill.id}>{drill.name}</option>
            {/each}
          </select>
        </div>
        <div class="form-group">
          <label for="drill-name">Drill Name</label>
          <input type="text" id="drill-name" bind:value={currentDrill.name} placeholder="Enter drill name" />
        </div>
        <div class="form-group">
          <label for="drill-type">Type</label>
          <select id="drill-type" bind:value={currentDrill.type}>
            {#each Object.entries($drillsStore?.types || {}) as [key, type]}
              <option value={key}>{type.name}</option>
            {/each}
          </select>
        </div>
        <div class="form-group">
          <label for="drill-players">Number of Players</label>
          <select id="drill-players" bind:value={currentDrill.players}>
            <option value={2}>2 Players</option>
            <option value={3}>3 Players</option>
            <option value={4}>4 Players</option>
          </select>
        </div>
        <div class="form-group">
          <label for="drill-difficulty">Difficulty</label>
          <select id="drill-difficulty" bind:value={currentDrill.difficulty}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label for="drill-description">Description</label>
          <textarea id="drill-description" bind:value={currentDrill.description} placeholder="Enter drill description"></textarea>
        </div>
        <div class="form-group" style="grid-column: 1 / -1;">
          <label for="drill-goal">Goal</label>
          <textarea id="drill-goal" bind:value={currentDrill.goal} placeholder="Enter drill goal"></textarea>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="section-title">Drill Steps</div>
      <div class="step-section">
        <div class="step-list">
          {#each currentDrill.steps as step, index}
            <div class="step-item-row">
              <button type="button" class="step-item" class:active={index === currentStepIndex} on:click={() => goToStep(index)}>
                <div class="step-item-header">
                  <span class="step-number">Step {index + 1}</span>
                </div>
                <div class="step-note">{step.note || 'No note'}</div>
                <div class="step-positions">
                  {#each step.players as player}
                    <div class="position">{player.id}: ({player.x}, {player.z})</div>
                  {/each}
                  <div class="position">Ball: ({step.ball.x}, {step.ball.z})</div>
                </div>
              </button>
              <button class="delete-step-button" on:click={() => deleteStep(index)} aria-label="Delete step">×</button>
            </div>
          {/each}
        </div>
        <div class="step-editor">
          <div class="step-header">
            <h3 style="margin:0;font-size:1.1em;">Step {currentStepIndex + 1}</h3>
            <div class="step-navigation">
              <button class="nav-button" on:click={() => goToStep(currentStepIndex - 1)} disabled={currentStepIndex === 0}>←</button>
              <button class="nav-button" on:click={() => goToStep(currentStepIndex + 1)} disabled={!currentDrill.steps || currentStepIndex === currentDrill.steps.length - 1}>→</button>
            </div>
          </div>
          <div class="form-group">
            <label for="step-note">Step Note</label>
            <input type="text" id="step-note" bind:value={currentStep.note} placeholder="Enter step description" />
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="ball-x">Ball Position (X, Z)</label>
              <input id="ball-x" type="number" placeholder="X coordinate" bind:value={currentStep.ball.x} step="0.1" style="width: 100px; display: inline-block; margin-right: 8px;" />
              <input id="ball-z" type="number" placeholder="Z coordinate" bind:value={currentStep.ball.z} step="0.1" style="width: 100px; display: inline-block;" />
            </div>
            {#each currentStep.players as player, idx}
              {#if idx < currentDrill.players}
                <div class="form-group">
                  <label for="player-{player.id}-x">{player.id} Position (X, Z)</label>
                  <input id="player-{player.id}-x" type="number" placeholder="X coordinate" bind:value={currentStep.players[idx].x} step="0.1" style="width: 100px; display: inline-block; margin-right: 8px;" />
                  <input id="player-{player.id}-z" type="number" placeholder="Z coordinate" bind:value={currentStep.players[idx].z} step="0.1" style="width: 100px; display: inline-block;" />
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
                players: [
                  { id: 'P1', x: 0, z: 0 },
                  { id: 'P2', x: 0, z: 0 },
                  { id: 'P3', x: 0, z: 0 },
                  { id: 'P4', x: 0, z: 0 }
                ],
                ball: { x: 0, z: 0 }
              });
              currentStepIndex = currentDrill.steps.length - 1;
              currentStep = { ...currentDrill.steps[currentStepIndex] };
            }}>Add Step</button>
          </div>
        </div>
      </div>
    </div>
    <div class="save-controls">
      <button class="save-button" on:click={saveDrill}>{selectedDrillId ? 'Update Drill' : 'Save New Drill'}</button>
      {#if selectedDrillId}
        <button class="delete-button" on:click={() => {
          if (confirm('Are you sure you want to delete this drill?')) {
            drillsStore.deleteDrill(selectedDrillId!);
            createNewDrill();
            availableDrills = drillsStore.getDrills();
          }
        }}>Delete Drill</button>
      {/if}
    </div>
  </div>
</div>

<style>
  .configure-page {
    min-height: 100vh;
    background: #181a1b;
    color: #fff;
    overflow: auto;
  }
  .main-content {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    gap: 32px;
  }
  .section {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid #23272a;
  }
  .section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  .section-title {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: #b3e5fc;
    letter-spacing: 0.5px;
  }
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px 32px;
    align-items: end;
  }
  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }
  .form-group label {
    font-weight: 500;
    color: #b0bec5;
    font-size: 0.98em;
  }
  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 8px 10px;
    border: 1px solid #333;
    border-radius: 4px;
    background: #23272a;
    color: #fff;
    font-size: 1em;
    width: 100%;
    box-sizing: border-box;
  }
  .form-group textarea {
    min-height: 70px;
    resize: vertical;
  }
  .step-section {
    display: flex;
    gap: 32px;
    align-items: stretch;
    flex-wrap: wrap;
  }
  .step-list {
    min-width: 180px;
    max-width: 220px;
    flex: 1 1 0;
    min-height: 100%;
    background: #23272a;
    border-radius: 6px;
    border: 1px solid #23272a;
    padding: 8px 0;
    box-shadow: 0 2px 8px 0 #0002;
    display: flex;
    flex-direction: column;
  }
  .step-item-row {
    display: flex;
    align-items: stretch;
    gap: 4px;
    margin-bottom: 6px;
  }
  .step-item {
    background: none;
    border: none;
    text-align: left;
    flex: 1 1 auto;
    padding: 8px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.15s, border 0.15s;
    border: 1.5px solid transparent;
    color: #fff;
    font-size: 1em;
  }
  .step-item.active {
    background: #263238;
    border-color: #29b6f6;
    color: #29b6f6;
  }
  .delete-step-button {
    background: #d32f2f;
    color: #fff;
    border: none;
    border-radius: 4px;
    width: 32px;
    height: 32px;
    font-size: 1.2em;
    cursor: pointer;
    align-self: center;
    transition: background 0.15s;
  }
  .delete-step-button:hover {
    background: #b71c1c;
  }
  .step-editor {
    flex: 2 1 0;
    background: #23272a;
    border-radius: 6px;
    padding: 18px 18px 12px 18px;
    box-shadow: 0 2px 8px 0 #0002;
    border: 1px solid #23272a;
    min-width: 260px;
    max-width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: column;
  }
  .step-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .step-navigation {
    display: flex;
    gap: 8px;
  }
  .nav-button {
    background: #37474f;
    color: #b3e5fc;
    border: none;
    border-radius: 4px;
    padding: 4px 12px;
    font-size: 1.1em;
    cursor: pointer;
    transition: background 0.15s;
  }
  .nav-button:disabled {
    background: #23272a;
    color: #789;
    cursor: not-allowed;
  }
  .step-buttons {
    display: flex;
    gap: 10px;
    margin-top: 10px;
  }
  .save-controls {
    display: flex;
    gap: 16px;
    margin-top: 18px;
    justify-content: flex-end;
  }
  .save-button {
    background: #29b6f6;
    color: #181a1b;
    border: none;
    border-radius: 4px;
    padding: 10px 22px;
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .save-button:hover {
    background: #039be5;
  }
  .delete-button {
    background: #d32f2f;
    color: #fff;
    border: none;
    border-radius: 4px;
    padding: 10px 18px;
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.15s;
  }
  .delete-button:hover {
    background: #b71c1c;
  }
  @media (max-width: 700px) {
    .main-content {
      max-width: 100vw;
      padding: 8px 2vw;
      gap: 18px;
    }
    .form-grid {
      grid-template-columns: 1fr;
      gap: 14px 0;
    }
    .step-section {
      flex-direction: column;
      gap: 18px;
    }
    .step-list, .step-editor {
      min-height: unset;
      flex: unset;
    }
    .step-list {
      max-width: 100%;
      min-width: 0;
      margin-bottom: 10px;
    }
    .step-editor {
      min-width: 0;
      padding: 12px 6px 8px 6px;
    }
    .save-controls {
      flex-direction: column;
      gap: 10px;
      align-items: stretch;
    }
  }
</style> 