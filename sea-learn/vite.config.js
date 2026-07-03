import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// SEA Learn is deployed as its own standalone Vercel project, linked from
// the main SEA website nav bar (not nested under a sub-path).
export default defineConfig({
  plugins: [react()],
  base: '/',
});
