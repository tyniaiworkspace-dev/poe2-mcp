/**
 * Svelte stores for application state management.
 *
 * @author HivemindMinion
 */

import { writable, derived } from 'svelte/store';

// Currently selected jewel socket
export const selectedSocket = writable(null);

// Current seed value
export const currentSeed = writable(12345);

// Current tribute/leader name
export const currentTribute = writable('Amanamu');

// Passive tree data (loaded from JSON)
export const passiveTree = writable(null);

// Spawn weight data (loaded from JSON)
export const spawnWeights = writable(null);

// Current analysis result
export const analysisResult = writable(null);

// Loading states
export const isLoading = writable(true);
export const loadError = writable(null);

// Available jewel sockets (derived from passiveTree)
export const jewelSockets = derived(passiveTree, ($passiveTree) => {
  if (!$passiveTree) return [];

  const sockets = [];
  for (const [nodeId, node] of Object.entries($passiveTree)) {
    if (node.name === 'Jewel Socket') {
      sockets.push({
        nodeId: parseInt(nodeId),
        x: node.x || 0,
        y: node.y || 0
      });
    }
  }
  return sockets.sort((a, b) => a.nodeId - b.nodeId);
});

// UI state
export const showTooltip = writable(false);
export const tooltipData = writable(null);
export const tooltipPosition = writable({ x: 0, y: 0 });

// Current route (hash-based)
export const currentRoute = writable(window.location.hash || '#/');

// Listen for hash changes
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    currentRoute.set(window.location.hash || '#/');
  });
}

/**
 * Navigate to a route.
 * @param {string} route - Hash route (e.g., '#/calculator')
 */
export function navigate(route) {
  window.location.hash = route;
}
