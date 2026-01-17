<script>
  import { jewelSockets } from '../lib/stores.js';
  import { ABYSS_LEADERS } from '../lib/seedMapper.js';
</script>

<div class="home">
  <section class="hero">
    <h1>Undying Hate Seed Calculator</h1>
    <p class="subtitle">Path of Exile 2 Timeless Jewel Tool</p>
    <a href="#/calculator" class="cta-button">Open Calculator</a>
  </section>

  <section class="info">
    <div class="card">
      <h2>What is Undying Hate?</h2>
      <p>
        Undying Hate is a Timeless Jewel (Historic) in Path of Exile 2 that transforms
        passive nodes within its radius based on a seed number and tribute name.
      </p>
      <ul>
        <li><strong>Seed Range:</strong> 79 - 30,977</li>
        <li><strong>Radius:</strong> Very Large (1500 units)</li>
        <li><strong>Faction:</strong> Abyss</li>
        <li><strong>Limit:</strong> 1 Historic jewel per character</li>
      </ul>
    </div>

    <div class="card">
      <h2>Keystones by Tribute</h2>
      <p>The tribute name on your jewel determines which keystone you get:</p>
      <ul class="keystones">
        {#each Object.entries(ABYSS_LEADERS) as [leader, keystone]}
          <li>
            <span class="leader">{leader}</span>
            <span class="arrow">→</span>
            <span class="keystone">{keystone}</span>
          </li>
        {/each}
      </ul>
    </div>

    <div class="card">
      <h2>How It Works</h2>
      <ol>
        <li>Select a jewel socket on the passive tree</li>
        <li>Enter your seed number (from the jewel)</li>
        <li>Select your tribute name</li>
        <li>See exactly which notables appear at each position</li>
      </ol>
      <p class="note">
        The same seed always produces the same results - this calculator uses
        the same algorithm as the game.
      </p>
    </div>
  </section>

  <section class="stats">
    <div class="stat">
      <span class="number">{$jewelSockets.length}</span>
      <span class="label">Jewel Sockets</span>
    </div>
    <div class="stat">
      <span class="number">30</span>
      <span class="label">Possible Notables</span>
    </div>
    <div class="stat">
      <span class="number">5</span>
      <span class="label">Keystones</span>
    </div>
    <div class="stat">
      <span class="number">30,899</span>
      <span class="label">Unique Seeds</span>
    </div>
  </section>
</div>

<style>
  .home {
    max-width: 1000px;
    margin: 0 auto;
  }

  .hero {
    text-align: center;
    padding: 3rem 1rem;
    background: linear-gradient(135deg, rgba(175, 96, 37, 0.1), rgba(175, 96, 37, 0.05));
    border-radius: 12px;
    margin-bottom: 2rem;
  }

  .hero h1 {
    font-size: 2.5rem;
    color: var(--accent);
    margin-bottom: 0.5rem;
  }

  .subtitle {
    color: var(--text-secondary);
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }

  .cta-button {
    display: inline-block;
    background: var(--accent);
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 1.1rem;
    transition: background 0.2s;
  }

  .cta-button:hover {
    background: var(--accent-hover);
  }

  .info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }

  .card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .card h2 {
    color: var(--accent);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    border-bottom: 1px solid var(--border);
    padding-bottom: 0.5rem;
  }

  .card ul, .card ol {
    margin-left: 1.5rem;
    line-height: 1.8;
  }

  .card li {
    margin-bottom: 0.25rem;
  }

  .keystones {
    list-style: none;
    margin-left: 0;
  }

  .keystones li {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .leader {
    color: var(--accent);
    font-weight: 500;
    min-width: 80px;
  }

  .arrow {
    color: var(--text-secondary);
  }

  .keystone {
    color: var(--text-primary);
  }

  .note {
    font-size: 0.9rem;
    color: var(--text-secondary);
    font-style: italic;
    margin-top: 1rem;
  }

  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
  }

  .stat {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
  }

  .stat .number {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: var(--accent);
  }

  .stat .label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: 1.8rem;
    }

    .stats {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
