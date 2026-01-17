<script>
  import {
    passiveTree,
    spawnWeights,
    selectedSocket,
    currentSeed,
    currentTribute,
    analysisResult,
    jewelSockets
  } from '../lib/stores.js';
  import { TimelessSeedMapper, ABYSS_LEADERS, JEWEL_RADIUS } from '../lib/seedMapper.js';

  import PassiveTreeView from '../components/PassiveTreeView.svelte';
  import SeedInput from '../components/SeedInput.svelte';
  import ResultsPanel from '../components/ResultsPanel.svelte';

  let mapper = $state(null);

  // Initialize mapper when data is loaded - Svelte 5 effect
  $effect(() => {
    if ($passiveTree && $spawnWeights && !mapper) {
      mapper = new TimelessSeedMapper($spawnWeights, $passiveTree);
    }
  });

  // Recalculate when inputs change - Svelte 5 effect
  $effect(() => {
    if (mapper && $selectedSocket && $currentSeed && $currentTribute) {
      try {
        const result = mapper.analyzeSeed(
          $selectedSocket.nodeId,
          $currentSeed,
          $currentTribute,
          JEWEL_RADIUS.VERY_LARGE
        );
        analysisResult.set(result);
      } catch (err) {
        console.error('Analysis error:', err);
        analysisResult.set(null);
      }
    }
  });

  // Auto-select first socket if none selected - Svelte 5 effect
  $effect(() => {
    if ($jewelSockets.length > 0 && !$selectedSocket) {
      selectedSocket.set($jewelSockets[0]);
    }
  });

  function handleSocketSelect(event) {
    const socket = event.detail;
    selectedSocket.set(socket);
  }
</script>

<div class="calculator">
  <div class="calculator-header">
    <h1>Undying Hate Seed Calculator</h1>
    <p>Select a jewel socket and enter your seed to see the transformation</p>
  </div>

  <div class="calculator-layout">
    <aside class="controls-panel">
      <SeedInput />

      <div class="socket-list">
        <h3>Jewel Sockets</h3>
        <div class="sockets">
          {#each $jewelSockets as socket}
            <button
              class="socket-btn"
              class:selected={$selectedSocket?.nodeId === socket.nodeId}
              on:click={() => selectedSocket.set(socket)}
            >
              Socket {socket.nodeId}
              <span class="coords">({socket.x.toFixed(0)}, {socket.y.toFixed(0)})</span>
            </button>
          {/each}
        </div>
      </div>
    </aside>

    <main class="tree-container">
      <PassiveTreeView
        on:socketSelect={handleSocketSelect}
      />
    </main>

    <aside class="results-panel">
      <ResultsPanel />
    </aside>
  </div>
</div>

<style>
  .calculator {
    height: calc(100vh - 180px);
    display: flex;
    flex-direction: column;
  }

  .calculator-header {
    margin-bottom: 1rem;
  }

  .calculator-header h1 {
    color: var(--accent);
    margin-bottom: 0.25rem;
  }

  .calculator-header p {
    color: var(--text-secondary);
  }

  .calculator-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 280px 1fr 320px;
    gap: 1rem;
    min-height: 0;
  }

  .controls-panel {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .socket-list {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    flex: 1;
    overflow-y: auto;
  }

  .socket-list h3 {
    color: var(--accent);
    font-size: 0.9rem;
    margin-bottom: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .sockets {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .socket-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
  }

  .socket-btn:hover {
    border-color: var(--accent);
  }

  .socket-btn.selected {
    background: rgba(175, 96, 37, 0.2);
    border-color: var(--accent);
  }

  .coords {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }

  .tree-container {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
    min-height: 400px;
  }

  .results-panel {
    overflow-y: auto;
  }

  @media (max-width: 1200px) {
    .calculator-layout {
      grid-template-columns: 1fr;
      grid-template-rows: auto 1fr auto;
    }

    .controls-panel {
      flex-direction: row;
    }

    .socket-list {
      max-height: 150px;
    }

    .sockets {
      flex-direction: row;
      flex-wrap: wrap;
    }
  }
</style>
