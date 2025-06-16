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
    sourcemap: true, 
    minify: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    chunkSizeWarningLimit: 2000, // Increase chunk size limit to avoid warnings
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      clientPort: 443,
      timeout: 120000
    },
    proxy: {
      '/api': {
        target: 'https://api.incampaigntracker.cwsdev1.com', // backend server
        changeOrigin: true,
        secure: false,
      }
    }
  },
  preview: {
    port: 3000,
    host: true,
  },
});