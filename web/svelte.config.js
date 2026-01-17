import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

export default {
  preprocess: vitePreprocess(),
  compilerOptions: {
    // Enable runtime checks in dev
    dev: true,
    // Disable runes mode - use legacy Svelte 4 reactivity
    runes: false
  }
};
