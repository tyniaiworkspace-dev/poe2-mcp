<script>
  import { currentSeed, currentTribute } from '../lib/stores.js';
  import { ABYSS_LEADERS } from '../lib/seedMapper.js';

  const MIN_SEED = 79;
  const MAX_SEED = 30977;

  let seedInput = $currentSeed;
  let seedError = '';

  function validateSeed(value) {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      seedError = 'Enter a valid number';
      return false;
    }
    if (num < MIN_SEED || num > MAX_SEED) {
      seedError = `Seed must be ${MIN_SEED} - ${MAX_SEED}`;
      return false;
    }
    seedError = '';
    return true;
  }

  function handleSeedChange(e) {
    const value = e.target.value;
    seedInput = value;
    if (validateSeed(value)) {
      currentSeed.set(parseInt(value, 10));
    }
  }

  function handleTributeChange(e) {
    currentTribute.set(e.target.value);
  }

  function randomSeed() {
    const seed = Math.floor(Math.random() * (MAX_SEED - MIN_SEED + 1)) + MIN_SEED;
    seedInput = seed;
    currentSeed.set(seed);
    seedError = '';
  }
</script>

<div class="seed-input">
  <h3>Jewel Configuration</h3>

  <div class="input-group">
    <label for="seed">Seed Number</label>
    <div class="seed-row">
      <input
        type="number"
        id="seed"
        min={MIN_SEED}
        max={MAX_SEED}
        value={seedInput}
        on:input={handleSeedChange}
        class:error={seedError}
      />
      <button class="random-btn" on:click={randomSeed} title="Random seed">
        Random
      </button>
    </div>
    {#if seedError}
      <span class="error-text">{seedError}</span>
    {/if}
    <span class="hint">Valid range: {MIN_SEED} - {MAX_SEED.toLocaleString()}</span>
  </div>

  <div class="input-group">
    <label for="tribute">Tribute Name</label>
    <select id="tribute" value={$currentTribute} on:change={handleTributeChange}>
      {#each Object.entries(ABYSS_LEADERS) as [leader, keystone]}
        <option value={leader}>{leader} ({keystone})</option>
      {/each}
    </select>
  </div>

  <div class="keystone-info">
    <span class="label">Keystone:</span>
    <span class="keystone-name">{ABYSS_LEADERS[$currentTribute]}</span>
  </div>
</div>

<style>
  .seed-input {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
  }

  h3 {
    color: var(--accent);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .input-group {
    margin-bottom: 1rem;
  }

  label {
    display: block;
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .seed-row {
    display: flex;
    gap: 0.5rem;
  }

  input[type="number"] {
    flex: 1;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem;
    color: var(--text-primary);
    font-size: 1rem;
  }

  input[type="number"]:focus {
    outline: none;
    border-color: var(--accent);
  }

  input.error {
    border-color: #dc3545;
  }

  .random-btn {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    color: var(--text-secondary);
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .random-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .error-text {
    display: block;
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .hint {
    display: block;
    color: var(--text-secondary);
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  select {
    width: 100%;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem;
    color: var(--text-primary);
    font-size: 0.9rem;
    cursor: pointer;
  }

  select:focus {
    outline: none;
    border-color: var(--accent);
  }

  .keystone-info {
    background: rgba(175, 96, 37, 0.1);
    border: 1px solid rgba(175, 96, 37, 0.3);
    border-radius: 4px;
    padding: 0.75rem;
    margin-top: 0.5rem;
  }

  .keystone-info .label {
    font-size: 0.8rem;
    color: var(--text-secondary);
    display: block;
    margin-bottom: 0.25rem;
  }

  .keystone-name {
    color: var(--accent);
    font-weight: 600;
  }
</style>
