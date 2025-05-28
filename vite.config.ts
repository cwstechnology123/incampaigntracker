import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';

export default defineConfig({
  plugins: [react(), commonjs()],
  optimizeDeps: {
    exclude: ['lucide-react', '@apify/log', 'ansi-colors'],
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      clientPort: 443,
      timeout: 120000
    },
    allowedHosts: ['localhost', 'incampaigntracker.vercel.app']
  },
  preview: {
    port: 3000,
    host: true,
  },
});