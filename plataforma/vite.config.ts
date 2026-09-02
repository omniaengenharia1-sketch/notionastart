import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Sem acoplamento a Vercel ou Netlify: build estático puro em dist/.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: { outDir: 'dist', sourcemap: false },
});
