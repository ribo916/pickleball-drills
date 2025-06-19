<script lang="ts">
  import { drillsStore } from '$lib/stores/drills';
  import type { Drill } from '$lib/types/drills';
  import { showXYOverlay } from '$lib/stores/ui';
  
  let showMenu = false;
  let selectedType: string | null = null;
  let selectedPlayerCount: number | null = null;
  let availableDrills: Drill[] = [];

  function selectDrill(drillId: string) {
    const drills = drillsStore.getDrills();
    if (!drills) return;
    
    const index = drills.findIndex(d => d.id === drillId);
    if (index !== -1) {
      drillsStore.setCurrentDrill(index);
      showMenu = false;
    }
  }

  $: availableDrills = (() => {
    const drills = drillsStore.getDrills();
    if (!drills) return [] as Drill[];
    
    let filtered = [...drills];
    if (selectedType) {
      filtered = filtered.filter(d => d.type === selectedType);
    }
    if (selectedPlayerCount) {
      filtered = filtered.filter(d => d.players === selectedPlayerCount);
    }
    return filtered as Drill[];
  })();

  // Reset filters when menu is closed
  $: if (!showMenu) {
    selectedType = null;
    selectedPlayerCount = null;
  }
</script>

<div class="title-bar">
  <!-- svelte-ignore a11y-consider-explicit-label -->
  <button class="menu-button" on:click={() => showMenu = !showMenu} aria-label="Toggle drill menu">
    <span class="hamburger"></span>
  </button>
  <div class="nav-buttons">
    <a href="/" class="nav-button" aria-label="Home">
      🏠
    </a>
    <a href="/configure" class="nav-button" aria-label="Configure drills">
      ⚙️
    </a>
    <button
      on:click={() => showXYOverlay.update(v => !v)}
      aria-label="Toggle XY Coordinates"
      class="nav-button xy-toggle"
      style="background:none;border:none;padding:0 8px;display:flex;align-items:center;cursor:pointer;"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={$showXYOverlay ? '#4fc3f7' : '#888'} stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
      </svg>
    </button>
  </div>
</div>

{#if showMenu}
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="menu-overlay" on:click={() => showMenu = false}>
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="menu-content" on:click|stopPropagation>
      <h2>Select Drill</h2>
      
      <div class="filter-group">
        <label for="type">Drill Type</label>
        <select id="type" bind:value={selectedType}>
          <option value="">All Types</option>
          {#each Object.entries($drillsStore?.types || {}) as [key, type]}
            <option value={key}>{type.name}</option>
          {/each}
        </select>
      </div>

      <div class="filter-group">
        <label for="players">Number of Players</label>
        <select id="players" bind:value={selectedPlayerCount}>
          <option value="">Any</option>
          <option value={2}>2 Players</option>
          <option value={3}>3 Players</option>
          <option value={4}>4 Players</option>
        </select>
      </div>

      <div class="drill-list">
        {#each availableDrills as drill_ (drill_.id)}
          {@const drill = drill_ as Drill}
          <!-- svelte-ignore a11y-click-events-have-key-events -->
          <!-- svelte-ignore a11y-no-static-element-interactions -->
          <div 
            class="drill-item" 
            class:active={drill.id === drillsStore.getCurrentDrill()?.id}
            on:click={() => selectDrill(drill.id)}
          >
            <div class="drill-name">{drill.name}</div>
            <div class="drill-meta">
              <span>👥 {drill.players} Players</span>
              <span>📊 {drill.difficulty}</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<slot />

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    background: #1a1a1a;
    min-height: 100vh;
  }

  :global(#svelte) {
    min-height: 100vh;
    background: #1a1a1a;
  }

  .title-bar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px 20px;
    background: #1a1a1a;
    color: white;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    height: 48px;
    box-sizing: border-box;
    z-index: 1000;
  }

  .menu-button {
    background: none;
    border: none;
    padding: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hamburger {
    position: relative;
    width: 24px;
    height: 2px;
    background: white;
    transition: background 0.2s;
  }

  .hamburger::before,
  .hamburger::after {
    content: '';
    position: absolute;
    width: 24px;
    height: 2px;
    background: white;
    transition: transform 0.2s;
  }

  .hamburger::before {
    top: -8px;
  }

  .hamburger::after {
    bottom: -8px;
  }

  .menu-button:hover .hamburger,
  .menu-button:hover .hamburger::before,
  .menu-button:hover .hamburger::after {
    background: rgba(255, 255, 255, 0.8);
  }

  h1 {
    margin: 0;
    font-size: 1.2em;
    font-weight: 500;
  }

  .menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1001;
    display: flex;
    justify-content: flex-start;
  }

  .menu-content {
    background: #1a1a1a;
    width: 320px;
    height: 100%;
    padding: 24px;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.2);
    overflow-y: auto;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }

  .menu-content h2 {
    margin: 0 0 24px 0;
    font-size: 1.4em;
    color: white;
  }

  .filter-group {
    margin-bottom: 20px;
  }

  .filter-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.9);
  }

  .filter-group select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 4px;
    font-size: 14px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }

  .filter-group select:focus {
    outline: none;
    border-color: rgba(255, 255, 255, 0.3);
  }

  .drill-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .drill-item {
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(255, 255, 255, 0.05);
  }

  .drill-item:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }

  .drill-item.active {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
  }

  .drill-name {
    font-weight: 500;
    margin-bottom: 4px;
    color: white;
  }

  .drill-meta {
    font-size: 0.9em;
    opacity: 0.8;
    display: flex;
    gap: 16px;
    color: rgba(255, 255, 255, 0.7);
    flex-wrap: nowrap;
  }

  .drill-meta span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    white-space: nowrap;
  }

  .drill-item.active .drill-meta {
    opacity: 0.9;
  }

  @media (max-width: 768px) {
    .menu-content {
      width: 100%;
      max-width: 320px;
    }

    .drill-meta {
      gap: 12px;
    }
  }

  .nav-buttons {
    margin-left: auto;
    display: flex;
    gap: 12px;
  }

  .nav-button {
    font-size: 1.5em;
    text-decoration: none;
    color: white;
    opacity: 0.8;
    transition: opacity 0.2s;
  }

  .nav-button:hover {
    opacity: 1;
  }

  :global(main) {
    padding-top: 48px;
    min-height: calc(100vh - 48px);
  }
</style> 