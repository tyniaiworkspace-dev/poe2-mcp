<script>
  import { createEventDispatcher } from 'svelte';
  import {
    passiveTree,
    selectedSocket,
    analysisResult,
    jewelSockets,
    showTooltip,
    tooltipData,
    tooltipPosition
  } from '../lib/stores.js';
  import { JEWEL_RADIUS } from '../lib/seedMapper.js';

  const dispatch = createEventDispatcher();

  let svgElement = $state(null);
  let viewBox = $state({ x: -15000, y: -15000, width: 30000, height: 30000 });
  let isDragging = $state(false);
  let dragStart = $state({ x: 0, y: 0 });
  let scale = $state(1);

  // Transform tree coordinates to view coordinates
  function getNodePosition(node) {
    return { x: node.x || 0, y: node.y || 0 };
  }

  // Get nodes affected by selected socket - Svelte 5 derived
  let affectedNodeIds = $derived(new Set(
    ($analysisResult?.transformedNodes || []).map(n => n.originalNodeId)
  ));

  // Get transformed node info by original ID - Svelte 5 derived
  let transformedMap = $derived(new Map(
    ($analysisResult?.transformedNodes || []).map(n => [n.originalNodeId, n])
  ));

  // Filter visible nodes (exclude ascendancy, show relevant ones) - Svelte 5 derived
  let visibleNodes = $derived(Object.entries($passiveTree || {})
    .filter(([id, node]) => {
      if (node.is_ascendancy) return false;
      if (!node.x || !node.y) return false;
      return true;
    })
    .map(([id, node]) => ({
      id: parseInt(id),
      ...node,
      pos: getNodePosition(node)
    })));

  function handleWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.1, Math.min(10, scale * delta));

    // Zoom towards mouse position
    const rect = svgElement.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const svgX = viewBox.x + (mouseX / rect.width) * viewBox.width;
    const svgY = viewBox.y + (mouseY / rect.height) * viewBox.height;

    const newWidth = viewBox.width * (delta);
    const newHeight = viewBox.height * (delta);

    viewBox = {
      x: svgX - (mouseX / rect.width) * newWidth,
      y: svgY - (mouseY / rect.height) * newHeight,
      width: newWidth,
      height: newHeight
    };
    scale = newScale;
  }

  function handleMouseDown(e) {
    if (e.button === 0) {
      isDragging = true;
      dragStart = { x: e.clientX, y: e.clientY };
    }
  }

  function handleMouseMove(e) {
    if (isDragging) {
      const rect = svgElement.getBoundingClientRect();
      const dx = (e.clientX - dragStart.x) * (viewBox.width / rect.width);
      const dy = (e.clientY - dragStart.y) * (viewBox.height / rect.height);

      viewBox = {
        ...viewBox,
        x: viewBox.x - dx,
        y: viewBox.y - dy
      };

      dragStart = { x: e.clientX, y: e.clientY };
    }
  }

  function handleMouseUp() {
    isDragging = false;
  }

  function handleSocketClick(socket) {
    dispatch('socketSelect', socket);
  }

  function handleNodeHover(e, node) {
    const transformed = transformedMap.get(node.id);
    tooltipData.set({
      original: node,
      transformed
    });
    tooltipPosition.set({ x: e.clientX, y: e.clientY });
    showTooltip.set(true);
  }

  function handleNodeLeave() {
    showTooltip.set(false);
  }

  function getNodeClass(node) {
    const classes = ['node'];
    if (node.is_keystone) classes.push('keystone');
    else if (node.is_notable) classes.push('notable');
    else if (node.name === 'Jewel Socket') classes.push('socket');
    else classes.push('small');

    if (affectedNodeIds.has(node.id)) classes.push('affected');

    return classes.join(' ');
  }

  function getNodeRadius(node) {
    if (node.is_keystone) return 80;
    if (node.is_notable) return 50;
    if (node.name === 'Jewel Socket') return 60;
    return 30;
  }

  function centerOnSocket(socket) {
    viewBox = {
      x: socket.x - 2000,
      y: socket.y - 2000,
      width: 4000,
      height: 4000
    };
  }

  // Center on selected socket when it changes - Svelte 5 effect
  $effect(() => {
    if ($selectedSocket) {
      centerOnSocket($selectedSocket);
    }
  });

  function resetView() {
    viewBox = { x: -15000, y: -15000, width: 30000, height: 30000 };
    scale = 1;
  }
</script>

<div class="tree-view">
  <div class="controls">
    <button on:click={resetView} title="Reset view">Reset View</button>
    <span class="hint">Scroll to zoom, drag to pan</span>
  </div>

  <svg
    bind:this={svgElement}
    viewBox="{viewBox.x} {viewBox.y} {viewBox.width} {viewBox.height}"
    on:wheel={handleWheel}
    on:mousedown={handleMouseDown}
    on:mousemove={handleMouseMove}
    on:mouseup={handleMouseUp}
    on:mouseleave={handleMouseUp}
    role="img"
    aria-label="Passive skill tree visualization"
  >
    <!-- Background -->
    <rect
      x={viewBox.x - 1000}
      y={viewBox.y - 1000}
      width={viewBox.width + 2000}
      height={viewBox.height + 2000}
      fill="#0a0a0c"
    />

    <!-- Jewel radius indicator -->
    {#if $selectedSocket}
      <circle
        cx={$selectedSocket.x}
        cy={$selectedSocket.y}
        r={JEWEL_RADIUS.VERY_LARGE}
        fill="rgba(175, 96, 37, 0.1)"
        stroke="rgba(175, 96, 37, 0.4)"
        stroke-width="4"
        stroke-dasharray="20,10"
      />
    {/if}

    <!-- Draw nodes -->
    {#each visibleNodes as node (node.id)}
      <g
        class={getNodeClass(node)}
        transform="translate({node.pos.x}, {node.pos.y})"
        on:mouseenter={(e) => handleNodeHover(e, node)}
        on:mouseleave={handleNodeLeave}
        role="group"
        aria-label={node.name || 'Passive node'}
      >
        {#if node.name === 'Jewel Socket'}
          <!-- Jewel socket - clickable -->
          <circle
            r={getNodeRadius(node)}
            class="socket-bg"
            class:selected={$selectedSocket?.nodeId === node.id}
            on:click={() => handleSocketClick({ nodeId: node.id, x: node.x, y: node.y })}
            on:keydown={(e) => e.key === 'Enter' && handleSocketClick({ nodeId: node.id, x: node.x, y: node.y })}
            role="button"
            tabindex="0"
            aria-label="Jewel Socket {node.id}"
          />
          <text y="5" text-anchor="middle" class="socket-label">JS</text>
        {:else}
          <!-- Regular node -->
          <circle r={getNodeRadius(node)} class="node-bg" />
          {#if node.is_keystone || node.is_notable}
            <text y="5" text-anchor="middle" class="node-label">
              {node.name?.substring(0, 2) || '?'}
            </text>
          {/if}
        {/if}
      </g>
    {/each}
  </svg>

  <!-- Tooltip -->
  {#if $showTooltip && $tooltipData}
    <div
      class="tooltip"
      style="left: {$tooltipPosition.x + 15}px; top: {$tooltipPosition.y + 15}px;"
    >
      <div class="tooltip-header">{$tooltipData.original.name || 'Unknown'}</div>
      {#if $tooltipData.transformed}
        <div class="tooltip-transform">
          <span class="arrow">Becomes:</span>
          <span class="new-name">{$tooltipData.transformed.newName}</span>
        </div>
        {#if $tooltipData.transformed.tributeValue > 0}
          <div class="tribute">+{$tooltipData.transformed.tributeValue} Tribute</div>
        {/if}
      {/if}
      {#if $tooltipData.original.stats?.length > 0}
        <div class="stats">
          {#each $tooltipData.original.stats.slice(0, 3) as stat}
            <div class="stat">{stat}</div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .tree-view {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .controls {
    position: absolute;
    top: 0.5rem;
    left: 0.5rem;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .controls button {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
    color: var(--text-primary);
    cursor: pointer;
    font-size: 0.8rem;
  }

  .controls button:hover {
    border-color: var(--accent);
  }

  .hint {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  svg {
    width: 100%;
    height: 100%;
    cursor: grab;
  }

  svg:active {
    cursor: grabbing;
  }

  /* Node styles */
  .node circle.node-bg {
    fill: #1a1a1e;
    stroke: #333;
    stroke-width: 2;
    transition: all 0.2s;
  }

  .node.small circle.node-bg {
    fill: #1a1a1e;
    stroke: #444;
  }

  .node.notable circle.node-bg {
    fill: #1a1a2a;
    stroke: #4a6fa5;
    stroke-width: 3;
  }

  .node.keystone circle.node-bg {
    fill: #2a1a1a;
    stroke: #a54a4a;
    stroke-width: 4;
  }

  .node.affected circle.node-bg {
    fill: rgba(175, 96, 37, 0.3);
    stroke: var(--accent);
    stroke-width: 3;
  }

  .node.socket circle.socket-bg {
    fill: #1a2a1a;
    stroke: #4aa54a;
    stroke-width: 4;
    cursor: pointer;
    transition: all 0.2s;
  }

  .node.socket circle.socket-bg:hover {
    fill: #2a4a2a;
    stroke: #6fc56f;
  }

  .node.socket circle.socket-bg.selected {
    fill: rgba(175, 96, 37, 0.4);
    stroke: var(--accent);
    stroke-width: 6;
  }

  .node-label, .socket-label {
    fill: var(--text-secondary);
    font-size: 24px;
    font-weight: bold;
    pointer-events: none;
  }

  .socket-label {
    fill: #4aa54a;
  }

  .node.socket circle.selected + text {
    fill: var(--accent);
  }

  /* Tooltip */
  .tooltip {
    position: fixed;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.75rem;
    z-index: 100;
    max-width: 250px;
    pointer-events: none;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
  }

  .tooltip-header {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .tooltip-transform {
    margin-bottom: 0.5rem;
  }

  .tooltip-transform .arrow {
    color: var(--text-secondary);
    font-size: 0.85rem;
  }

  .tooltip-transform .new-name {
    color: var(--accent);
    font-weight: 500;
    display: block;
    margin-top: 0.25rem;
  }

  .tribute {
    color: #6fc56f;
    font-size: 0.85rem;
    margin-bottom: 0.5rem;
  }

  .stats {
    font-size: 0.8rem;
    color: var(--text-secondary);
  }

  .stats .stat {
    margin-bottom: 0.25rem;
  }
</style>
