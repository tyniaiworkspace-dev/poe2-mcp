/**
 * TinyMT32 Pseudo Random Number Generator - Path of Exile Modified Version
 *
 * JavaScript port of the Python implementation for browser-based seed calculations.
 * This implementation matches PoE's modified TinyMT32 (RFC 8682) with:
 * - Different internal state size (5 elements instead of 4)
 * - Modified next_state function
 * - Different parameter usage for mat1, mat2, and tmat
 *
 * @author HivemindMinion
 */

// PoE-specific initialization constants
const INITIAL_STATE_0 = 0x40336050;
const INITIAL_STATE_1 = 0xCFA3723C;
const INITIAL_STATE_2 = 0x3CAC5F6F;
const INITIAL_STATE_3 = 0x3793FDFF;

// Standard TinyMT32 parameters (RFC 8682)
const MAT1 = 0x8F7011EE;
const MAT2 = 0xFC78FF1F;
const TMAT = 0x3793FDFF;

// Mask for 31-bit operations
const MASK = 0x7FFFFFFF;

// Helper to ensure 32-bit unsigned
function u32(n) {
  return n >>> 0;
}

/**
 * Alpha manipulation function used during initialization.
 * Formula: ((value ^ (value >>> 27)) * 0x19660D) & 0xFFFFFFFF
 */
function manipulateAlpha(value) {
  value = u32(value);
  const shifted = value >>> 27;
  const xored = u32(value ^ shifted);
  // Multiply using BigInt to avoid overflow, then convert back
  const result = BigInt(xored) * BigInt(0x19660D);
  return Number(result & BigInt(0xFFFFFFFF));
}

/**
 * Bravo manipulation function used during initialization.
 * Formula: ((value ^ (value >>> 27)) * 0x5D588B65) & 0xFFFFFFFF
 */
function manipulateBravo(value) {
  value = u32(value);
  const shifted = value >>> 27;
  const xored = u32(value ^ shifted);
  const result = BigInt(xored) * BigInt(0x5D588B65);
  return Number(result & BigInt(0xFFFFFFFF));
}

/**
 * TinyMT32 PRNG class for Path of Exile Timeless Jewel calculations.
 */
export class TinyMT32 {
  constructor(seeds) {
    this._state = [0, 0, 0, 0, 0];
    this._initialize(seeds);
  }

  /**
   * Create a TinyMT32 instance using PoE's seed format.
   * @param {number} nodeId - Passive skill graph identifier
   * @param {number} jewelSeed - Timeless Jewel seed value
   * @returns {TinyMT32} Initialized instance
   */
  static fromPoeSeed(nodeId, jewelSeed) {
    return new TinyMT32([u32(nodeId), u32(jewelSeed)]);
  }

  /**
   * Initialize the internal state with seed values.
   */
  _initialize(seeds) {
    // Phase 1: Initialize state with constants
    this._state = [
      0,
      INITIAL_STATE_0,
      INITIAL_STATE_1,
      INITIAL_STATE_2,
      INITIAL_STATE_3
    ];

    let index = 1;

    // Phase 2: Mix in seed values
    for (let i = 0; i < seeds.length; i++) {
      let seed = u32(seeds[i]);

      let roundState = manipulateAlpha(
        u32(this._state[(index % 4) + 1] ^
            this._state[((index + 1) % 4) + 1] ^
            this._state[(((index + 4) - 1) % 4) + 1])
      );

      this._state[((index + 1) % 4) + 1] = u32(
        this._state[((index + 1) % 4) + 1] + roundState
      );

      roundState = u32(roundState + seed + index);

      this._state[(((index + 1) + 1) % 4) + 1] = u32(
        this._state[(((index + 1) + 1) % 4) + 1] + roundState
      );
      this._state[(index % 4) + 1] = roundState;

      index = (index + 1) % 4;
    }

    // Phase 3: Additional alpha mixing (5 rounds)
    for (let i = 0; i < 5; i++) {
      let roundState = manipulateAlpha(
        u32(this._state[(index % 4) + 1] ^
            this._state[((index + 1) % 4) + 1] ^
            this._state[(((index + 4) - 1) % 4) + 1])
      );

      this._state[((index + 1) % 4) + 1] = u32(
        this._state[((index + 1) % 4) + 1] + roundState
      );

      roundState = u32(roundState + index);

      this._state[(((index + 1) + 1) % 4) + 1] = u32(
        this._state[(((index + 1) + 1) % 4) + 1] + roundState
      );
      this._state[(index % 4) + 1] = roundState;

      index = (index + 1) % 4;
    }

    // Phase 4: Bravo mixing with XOR operations (4 rounds)
    for (let i = 0; i < 4; i++) {
      let roundState = manipulateBravo(
        u32(this._state[(index % 4) + 1] +
            this._state[((index + 1) % 4) + 1] +
            this._state[(((index + 4) - 1) % 4) + 1])
      );

      this._state[((index + 1) % 4) + 1] = u32(
        this._state[((index + 1) % 4) + 1] ^ roundState
      );

      roundState = u32(roundState - index);

      this._state[(((index + 1) + 1) % 4) + 1] = u32(
        this._state[(((index + 1) + 1) % 4) + 1] ^ roundState
      );
      this._state[(index % 4) + 1] = roundState;

      index = (index + 1) % 4;
    }

    // Phase 5: Warm-up with 8 state transitions
    for (let i = 0; i < 8; i++) {
      this.nextState();
    }
  }

  /**
   * Advance the internal state by one step.
   */
  nextState() {
    let a = this._state[4];
    let b = u32((this._state[1] & MASK) ^ this._state[2] ^ this._state[3]);

    a = u32(a ^ (a << 1));
    b = u32(b ^ (b >>> 1) ^ a);

    this._state[1] = this._state[2];
    this._state[2] = this._state[3];
    this._state[3] = u32(a ^ (b << 10));
    this._state[4] = b;

    if (b & 1) {
      this._state[2] = u32(this._state[2] ^ MAT1);
      this._state[3] = u32(this._state[3] ^ MAT2);
    }

    this._state[0] = u32(this._state[0] + 1);
  }

  /**
   * Apply the tempering transformation to produce output.
   */
  _temper() {
    let a = this._state[4];
    let b = u32(this._state[1] + (this._state[3] >>> 8));

    a = u32(a ^ b);

    if (b & 1) {
      a = u32(a ^ TMAT);
    }

    return a;
  }

  /**
   * Generate the next random uint32 value.
   * @returns {number} Random uint32 in range [0, 2^32 - 1]
   */
  generateUint32() {
    this.nextState();
    return this._temper();
  }

  /**
   * Generate a random float in the range [0, 1).
   * @returns {number} Random float
   */
  generateFloat() {
    return this.generateUint32() / 0x100000000;
  }

  /**
   * Generate a random value in range [0, exclusiveMax).
   * Uses rejection sampling to ensure uniform distribution.
   * @param {number} exclusiveMax - Upper bound (exclusive)
   * @returns {number} Random value in range [0, exclusiveMax - 1]
   */
  generateRange(exclusiveMax) {
    if (exclusiveMax <= 0) return 0;
    if (exclusiveMax === 1) return 0;

    const maxValue = exclusiveMax - 1;
    let roundState = 0;
    let value = 0;

    while (true) {
      while (true) {
        value = u32(this.generateUint32() | (2 * ((value << 31) >>> 0)));
        roundState = u32(0xFFFFFFFF | (2 * ((roundState << 31) >>> 0)));
        if (roundState >= maxValue) break;
      }

      if (!((Math.floor(value / exclusiveMax) >= roundState) &&
            (roundState % exclusiveMax !== maxValue))) {
        break;
      }
    }

    return value % exclusiveMax;
  }

  /**
   * Get current state for debugging.
   * @returns {number[]} State array
   */
  getState() {
    return [...this._state];
  }
}

/**
 * Convenience function to create a TinyMT32 for Timeless Jewel calculations.
 * @param {number} nodeId - Passive skill graph identifier
 * @param {number} jewelSeed - Timeless Jewel seed value
 * @returns {TinyMT32} Initialized instance
 */
export function createTimelessRng(nodeId, jewelSeed) {
  return TinyMT32.fromPoeSeed(nodeId, jewelSeed);
}

/**
 * Generate the seed array for PoE's Timeless Jewel PRNG.
 * @param {number} nodeId - Passive skill graph identifier
 * @param {number} jewelSeed - Timeless Jewel seed value
 * @returns {number[]} Seed array [nodeId, jewelSeed]
 */
export function generatePoeSeed(nodeId, jewelSeed) {
  return [u32(nodeId), u32(jewelSeed)];
}

export default TinyMT32;
