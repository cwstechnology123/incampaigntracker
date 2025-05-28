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
    allowedHosts: ['localhost', 'd61d-2401-4900-73e8-946c-c9c-1ba8-e729-cdc2.ngrok-free.app']
  },
  preview: {
    port: 3000,
    host: true,
  },
});