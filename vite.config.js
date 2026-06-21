import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative paths for assets so the project can deploy to any subdirectory (e.g., GitHub Pages subfolder)
  base: './',
});
