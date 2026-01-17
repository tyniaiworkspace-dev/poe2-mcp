/**
 * Timeless Jewel Seed Mapper for Path of Exile 2
 *
 * Maps seeds to passive node transformations for the Undying Hate jewel.
 *
 * @author HivemindMinion
 */

import { TinyMT32 } from './tinymt32.js';

// Abyss faction leader-to-keystone mapping
export const ABYSS_LEADERS = {
  'Amanamu': 'Sacrifice of Flesh',
  'Ulaman': 'Sacrifice of Loyalty',
  'Kurgal': 'Sacrifice of Mind',
  'Tacati': 'Sacrifice of Blood',
  'Doryani': 'Sacrifice of Sight'
};

// Leader aliases for flexible input
const LEADER_ALIASES = {
  'amanamu': 'Amanamu',
  'ulaman': 'Ulaman',
  'kurgal': 'Kurgal',
  'tacati': 'Tacati',
  'tecrod': 'Tacati',
  'doryani': 'Doryani'
};

/**
 * Normalize tribute/leader name to canonical form.
 * @param {string} tribute - Input tribute name
 * @returns {string} Canonical leader name
 */
export function normalizeTributeName(tribute) {
  const normalized = LEADER_ALIASES[tribute.toLowerCase()] || tribute;
  if (!ABYSS_LEADERS[normalized]) {
    throw new Error(`Unknown tribute name: ${tribute}. Valid options: ${Object.keys(ABYSS_LEADERS).join(', ')}`);
  }
  return normalized;
}

/**
 * Calculate Euclidean distance between two points.
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @returns {number} Distance
 */
export function euclideanDistance(x1, y1, x2, y2) {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Jewel radius sizes in tree units.
 */
export const JEWEL_RADIUS = {
  SMALL: 800,
  MEDIUM: 1000,
  LARGE: 1075,
  VERY_LARGE: 1500
};

/**
 * TimelessSeedMapper class for calculating jewel transformations.
 */
export class TimelessSeedMapper {
  constructor(spawnWeights, passiveTree) {
    this.passiveTree = passiveTree;
    this.notables = [];
    this.cumulativeWeights = [];
    this.totalWeight = 0;
    this.keystones = {};
    this.smallPassive = { name: 'Tribute', id: 'abyss_small_tribute' };

    if (spawnWeights) {
      this._loadSpawnWeights(spawnWeights);
    }
  }

  /**
   * Load spawn weight data.
   * @param {Object} data - Spawn weight data from JSON
   */
  _loadSpawnWeights(data) {
    // Build notable pool (only notables with spawn_weight > 0)
    this.notables = (data.notables || []).filter(n => (n.spawn_weight || 0) > 0);

    // Calculate total weight and cumulative weights
    this.totalWeight = this.notables.reduce((sum, n) => sum + n.spawn_weight, 0);

    let cumulative = 0;
    this.cumulativeWeights = this.notables.map(n => {
      cumulative += n.spawn_weight;
      return { cumulative, notable: n };
    });

    // Load keystones
    this.keystones = {};
    for (const k of (data.keystones || [])) {
      this.keystones[k.leader] = k;
    }

    // Small passive
    if (data.small_passive) {
      this.smallPassive = data.small_passive;
    }
  }

  /**
   * Set passive tree data.
   * @param {Object} treeData - Passive tree node data
   */
  setPassiveTree(treeData) {
    this.passiveTree = treeData;
  }

  /**
   * Get all jewel socket nodes from tree.
   * @returns {Array} Jewel socket nodes
   */
  getJewelSockets() {
    if (!this.passiveTree) return [];

    const sockets = [];
    for (const [nodeId, node] of Object.entries(this.passiveTree)) {
      if (node.name === 'Jewel Socket') {
        sockets.push({
          nodeId: parseInt(nodeId),
          x: node.x || 0,
          y: node.y || 0,
          name: node.name,
          groupId: node.group_id
        });
      }
    }
    return sockets.sort((a, b) => a.nodeId - b.nodeId);
  }

  /**
   * Get nodes within radius of a socket.
   * @param {number} socketId - Socket node ID
   * @param {number} radius - Radius in tree units
   * @returns {Array} Affected nodes
   */
  getNodesInRadius(socketId, radius = JEWEL_RADIUS.VERY_LARGE) {
    if (!this.passiveTree) return [];

    const socketKey = String(socketId);
    const socketNode = this.passiveTree[socketKey];
    if (!socketNode) {
      throw new Error(`Socket ID ${socketId} not found`);
    }

    const socketX = socketNode.x || 0;
    const socketY = socketNode.y || 0;
    const affected = [];

    for (const [nodeId, node] of Object.entries(this.passiveTree)) {
      if (nodeId === socketKey) continue;
      if (node.x === undefined || node.y === undefined) continue;
      if (node.is_ascendancy) continue;

      const dist = euclideanDistance(socketX, socketY, node.x, node.y);

      if (dist <= radius) {
        affected.push({
          nodeId: parseInt(nodeId),
          name: node.name || '',
          distance: dist,
          isNotable: node.is_notable || false,
          isKeystone: node.is_keystone || false,
          stats: node.stats || [],
          x: node.x,
          y: node.y
        });
      }
    }

    return affected.sort((a, b) => a.distance - b.distance);
  }

  /**
   * Select which notable replaces a node based on seed.
   * @param {number} nodeId - Node graph ID
   * @param {number} seed - Jewel seed
   * @returns {Object} { id, name }
   */
  selectNotableForNode(nodeId, seed) {
    if (this.notables.length === 0) {
      return { id: 'unknown', name: 'Unknown Notable' };
    }

    const rng = TinyMT32.fromPoeSeed(nodeId, seed);
    const roll = rng.generateRange(this.totalWeight);

    for (const { cumulative, notable } of this.cumulativeWeights) {
      if (roll < cumulative) {
        return { id: notable.id, name: notable.name };
      }
    }

    // Fallback
    const last = this.notables[this.notables.length - 1];
    return { id: last.id, name: last.name };
  }

  /**
   * Calculate tribute value for a node.
   * @param {Object} node - Node data
   * @param {string} nodeType - 'keystone', 'notable', or 'small'
   * @returns {number} Tribute value
   */
  calculateTributeValue(node, nodeType) {
    if (nodeType !== 'small') return 0;

    // Check for attribute nodes (+3 bonus)
    if (node.stats) {
      for (const stat of node.stats) {
        const lower = stat.toLowerCase();
        if (lower.includes('strength') || lower.includes('dexterity') || lower.includes('intelligence')) {
          return 8; // 5 base + 3 attribute bonus
        }
      }
    }
    return 5;
  }

  /**
   * Analyze a seed at a specific socket.
   * @param {number} socketId - Jewel socket node ID
   * @param {number} seed - Seed number (79-30977)
   * @param {string} tribute - Leader name
   * @param {number} radius - Jewel radius
   * @returns {Object} Analysis result
   */
  analyzeSeed(socketId, seed, tribute, radius = JEWEL_RADIUS.VERY_LARGE) {
    const tributeName = normalizeTributeName(tribute);
    const keystoneName = ABYSS_LEADERS[tributeName];
    const affectedNodes = this.getNodesInRadius(socketId, radius);

    // Get socket info
    const socketNode = this.passiveTree[String(socketId)];
    const socket = {
      nodeId: socketId,
      x: socketNode?.x || 0,
      y: socketNode?.y || 0
    };

    const transformedNodes = [];

    for (const node of affectedNodes) {
      let nodeType, newName, newId, tributeValue;

      if (node.isKeystone) {
        nodeType = 'keystone';
        newName = keystoneName;
        newId = `abyss_keystone_${Object.keys(ABYSS_LEADERS).indexOf(tributeName) + 1}`;
        tributeValue = 0;
      } else if (node.isNotable) {
        nodeType = 'notable';
        const selected = this.selectNotableForNode(node.nodeId, seed);
        newName = selected.name;
        newId = selected.id;
        tributeValue = 0;
      } else {
        nodeType = 'small';
        newName = this.smallPassive.name;
        newId = this.smallPassive.id;
        tributeValue = this.calculateTributeValue(node, nodeType);
      }

      transformedNodes.push({
        originalNodeId: node.nodeId,
        originalName: node.name,
        originalType: nodeType,
        newName,
        newId,
        distance: node.distance,
        x: node.x,
        y: node.y,
        tributeValue
      });
    }

    // Calculate totals
    const totalTribute = transformedNodes.reduce((sum, n) => sum + n.tributeValue, 0);
    const notableCount = transformedNodes.filter(n => n.originalType === 'notable').length;
    const smallCount = transformedNodes.filter(n => n.originalType === 'small').length;
    const keystoneReplaced = transformedNodes.some(n => n.originalType === 'keystone');

    return {
      socket,
      seed,
      tributeName,
      keystone: keystoneName,
      radius,
      transformedNodes,
      totalTribute,
      notableCount,
      smallCount,
      keystoneReplaced
    };
  }

  /**
   * Get notable distribution for a seed.
   * @param {number} socketId - Socket ID
   * @param {number} seed - Seed
   * @param {string} tribute - Tribute name
   * @param {number} radius - Radius
   * @returns {Object} Notable name -> count
   */
  getNotableDistribution(socketId, seed, tribute, radius = JEWEL_RADIUS.VERY_LARGE) {
    const analysis = this.analyzeSeed(socketId, seed, tribute, radius);
    const distribution = {};

    for (const node of analysis.transformedNodes) {
      if (node.originalType === 'notable') {
        distribution[node.newName] = (distribution[node.newName] || 0) + 1;
      }
    }

    return distribution;
  }

  /**
   * Compare multiple seeds.
   * @param {number} socketId - Socket ID
   * @param {number[]} seeds - Seeds to compare
   * @param {string} tribute - Tribute name
   * @param {number} radius - Radius
   * @returns {Array} Analysis for each seed
   */
  compareSeeds(socketId, seeds, tribute, radius = JEWEL_RADIUS.VERY_LARGE) {
    return seeds.map(seed => this.analyzeSeed(socketId, seed, tribute, radius));
  }
}

export default TimelessSeedMapper;
