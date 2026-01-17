<script>
  import { analysisResult } from '../lib/stores.js';

  // Group transformed nodes by type - Svelte 5 derived
  let notables = $derived($analysisResult?.transformedNodes?.filter(n => n.originalType === 'notable') || []);
  let keystones = $derived($analysisResult?.transformedNodes?.filter(n => n.originalType === 'keystone') || []);
  let smallNodes = $derived($analysisResult?.transformedNodes?.filter(n => n.originalType === 'small') || []);

  // Count notable occurrences - Svelte 5 derived
  let notableDistribution = $derived(notables.reduce((acc, n) => {
    acc[n.newName] = (acc[n.newName] || 0) + 1;
    return acc;
  }, {}));

  let sortedNotables = $derived(Object.entries(notableDistribution)
    .sort((a, b) => b[1] - a[1]));
</script>

<div class="results-panel">
  <h3>Analysis Results</h3>

  {#if !$analysisResult}
    <div class="empty-state">
      <p>Select a socket and enter a seed to see results</p>
    </div>
  {:else}
    <div class="summary">
      <div class="stat">
        <span class="value">{$analysisResult.seed}</span>
        <span class="label">Seed</span>
      </div>
      <div class="stat">
        <span class="value">{$analysisResult.notableCount}</span>
        <span class="label">Notables</span>
      </div>
      <div class="stat">
        <span class="value">{$analysisResult.smallCount}</span>
        <span class="label">Small</span>
      </div>
      <div class="stat">
        <span class="value">{$analysisResult.totalTribute}</span>
        <span class="label">Tribute</span>
      </div>
    </div>

    {#if keystones.length > 0}
      <div class="section">
        <h4>Keystone Replacement</h4>
        {#each keystones as node}
          <div class="node-item keystone">
            <span class="original">{node.originalName}</span>
            <span class="arrow">becomes</span>
            <span class="new">{node.newName}</span>
          </div>
        {/each}
      </div>
    {/if}

    <div class="section">
      <h4>Notable Distribution ({notables.length} total)</h4>
      <div class="distribution">
        {#each sortedNotables as [name, count]}
          <div class="dist-item">
            <span class="name">{name}</span>
            <span class="count">{count}x</span>
          </div>
        {/each}
      </div>
    </div>

    <div class="section collapsible">
      <details>
        <summary>
          <h4>All Transformed Notables</h4>
        </summary>
        <div class="node-list">
          {#each notables as node}
            <div class="node-item notable">
              <div class="node-header">
                <span class="original">{node.originalName}</span>
                <span class="arrow">-></span>
                <span class="new">{node.newName}</span>
              </div>
              <span class="distance">{node.distance.toFixed(0)} units</span>
            </div>
          {/each}
        </div>
      </details>
    </div>

    <div class="section collapsible">
      <details>
        <summary>
          <h4>Small Passives ({smallNodes.length})</h4>
        </summary>
        <div class="small-summary">
          <p>All small passives become <strong>Tribute</strong> nodes.</p>
          <p>Total tribute value: <strong>{$analysisResult.totalTribute}</strong></p>
          <ul>
            <li>Base nodes: 5 tribute each</li>
            <li>Attribute nodes: 8 tribute each (+3 bonus)</li>
          </ul>
        </div>
      </details>
    </div>
  {/if}
</div>

<style>
  .results-panel {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem;
    height: 100%;
    overflow-y: auto;
  }

  h3 {
    color: var(--accent);
    font-size: 0.9rem;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }

  h4 {
    color: var(--text-primary);
    font-size: 0.85rem;
    margin: 0;
  }

  .empty-state {
    color: var(--text-secondary);
    text-align: center;
    padding: 2rem;
    font-style: italic;
  }

  .summary {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .stat {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem;
    text-align: center;
  }

  .stat .value {
    display: block;
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--accent);
  }

  .stat .label {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .section {
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border);
  }

  .section:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .section h4 {
    margin-bottom: 0.5rem;
  }

  .node-item {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
  }

  .node-item:last-child {
    margin-bottom: 0;
  }

  .node-item.keystone {
    border-color: rgba(175, 96, 37, 0.5);
    background: rgba(175, 96, 37, 0.1);
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .original {
    color: var(--text-secondary);
  }

  .arrow {
    color: var(--text-secondary);
    font-size: 0.8rem;
  }

  .new {
    color: var(--accent);
    font-weight: 500;
  }

  .distance {
    display: block;
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .distribution {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .dist-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: var(--bg-primary);
    border-radius: 4px;
    font-size: 0.85rem;
  }

  .dist-item .name {
    color: var(--text-primary);
  }

  .dist-item .count {
    color: var(--accent);
    font-weight: 500;
  }

  details {
    cursor: pointer;
  }

  summary {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  summary::before {
    content: '>';
    color: var(--accent);
    transition: transform 0.2s;
  }

  details[open] summary::before {
    transform: rotate(90deg);
  }

  .node-list {
    margin-top: 0.5rem;
    max-height: 300px;
    overflow-y: auto;
  }

  .small-summary {
    font-size: 0.85rem;
    color: var(--text-secondary);
    margin-top: 0.5rem;
  }

  .small-summary ul {
    margin: 0.5rem 0 0 1.5rem;
    padding: 0;
  }

  .small-summary li {
    margin-bottom: 0.25rem;
  }

  .small-summary strong {
    color: var(--accent);
  }
</style>
