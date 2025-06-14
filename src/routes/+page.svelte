<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { drillsStore } from '$lib/stores/drills';
  import { initVisualization, cleanup } from '$lib/drills/main';
  import { browser } from '$app/environment';
  import type { Drill } from '$lib/types/drills';

  let loading = true;
  let error: string | null = null;
  let currentDrill: Drill | null = null;
  let currentStep: any = null;
  let currentStepIndex = 0;
  let totalSteps = 0;

  // Subscribe to store changes
  const unsubscribe = drillsStore.subscribe((store) => {
    if (store) {
      currentDrill = drillsStore.getCurrentDrill();
      currentStep = drillsStore.getCurrentStep();
      currentStepIndex = drillsStore.getCurrentStepIndex();
      totalSteps = drillsStore.getTotalSteps();
      console.log('Store updated:', { currentStepIndex, totalSteps });
    }
  });

  onMount(async () => {
    if (!browser) return;
    
    try {
      await drillsStore.load();
      await initVisualization();
      loading = false;
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to load drills';
      loading = false;
    }
  });

  onDestroy(() => {
    if (browser) {
      cleanup();
    }
    unsubscribe();
  });

  function handleNext() {
    if (!currentDrill) return;
    drillsStore.nextStep();
  }

  function handlePrevious() {
    if (!currentDrill) return;
    drillsStore.previousStep();
  }
</script>

<canvas id="court"></canvas>

{#if loading}
  <div class="loading">Loading drills...</div>
{:else if error}
  <div class="error">{error}</div>
{:else if currentDrill}
  <div class="instruction-box">
    <div class="title">{currentDrill.name}</div>
    <div class="description">{currentStep?.note || currentDrill.description}</div>
    <div class="meta">
      <span>👥 {currentDrill.players} Players</span>
      <span>📊 {currentDrill.difficulty}</span>
    </div>
  </div>

  <div class="controls">
    <button 
      class="nav-button prev" 
      on:click={handlePrevious}
      disabled={currentStepIndex === 0}
      aria-label="Previous step"
    >
      ←
    </button>
    <button 
      class="nav-button next" 
      on:click={handleNext}
      disabled={currentStepIndex === totalSteps - 1}
      aria-label="Next step"
    >
      →
    </button>
  </div>
{:else}
  <div class="no-drill">
    Select a drill from the menu to begin
  </div>
{/if}

<style>
  canvas {
    position: fixed;
    top: 56px;
    left: 0;
    width: 100%;
    height: calc(100vh - 56px);
    z-index: 1;
  }

  .instruction-box {
    position: fixed;
    top: 70px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(40, 40, 40, 0.95);
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 2;
    max-width: 600px;
    width: 90%;
    text-align: center;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .instruction-box .title {
    font-size: 1.2em;
    font-weight: 600;
    margin-bottom: 8px;
    color: white;
  }

  .instruction-box .description {
    font-size: 1em;
    line-height: 1.4;
    margin-bottom: 12px;
    color: rgba(255, 255, 255, 0.9);
  }

  .instruction-box .meta {
    display: flex;
    justify-content: center;
    gap: 24px;
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.7);
    flex-wrap: nowrap;
  }

  .instruction-box .meta span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .loading, .error, .no-drill {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(40, 40, 40, 0.95);
    color: white;
    padding: 24px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 2;
    text-align: center;
    backdrop-filter: blur(4px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .error {
    background: rgba(211, 47, 47, 0.95);
  }

  .controls {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    background: #1a1a1a;
    padding: 8px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 2;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .nav-button {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
    width: 40px;
    height: 40px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
  }

  .nav-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }

  .nav-button:disabled {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
    cursor: not-allowed;
    transform: none;
    opacity: 0.5;
  }

  @media (max-width: 768px) {
    .instruction-box {
      top: 70px;
      padding: 12px 16px;
    }

    .instruction-box .meta {
      gap: 16px;
    }

    .instruction-box .title {
      font-size: 1.1em;
    }

    .instruction-box .description {
      font-size: 0.9em;
    }

    .controls {
      bottom: 16px;
      padding: 6px;
      gap: 8px;
    }

    .nav-button {
      width: 36px;
      height: 36px;
      font-size: 18px;
    }
  }
</style>
  