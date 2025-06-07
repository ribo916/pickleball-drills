<script>
    import { onMount } from 'svelte';
  
    onMount(async () => {
      // Only runs on the client — avoids SSR crashes
      await import('$lib/drills/main.js');
    });
  </script>
  
  <svelte:head>
    <title>Pickleball Drill POC</title>
    <style>
      body {
        margin: 0;
        overflow: hidden;
      }
  
      #ui {
        position: absolute;
        top: 10px;
        left: 10px;
        z-index: 10;
      }
  
      button {
        margin-right: 5px;
      }
    </style>
  </svelte:head>
  
  <div id="ui">
    <button id="prevBtn">Previous</button>
    <button id="nextBtn">Next</button>
    
    <div id="instructionBox">
      Drill 1: First 3 shots 🎯
    </div>
  </div>
  
  
  <canvas id="court" style="width: 100%; height: 100vh;"></canvas>
  
  <style>
    #instructionBox {
      margin-top: 10px;
      padding: 12px 16px;
      border: 2px solid white;
      border-radius: 8px;
      color: white;
      font-family: 'Orbitron', sans-serif;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      max-width: 300px;
      line-height: 1.4;
    }
  </style>
  