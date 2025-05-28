import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import commonjs from '@rollup/plugin-commonjs';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
  plugins: [react(), commonjs(), legacy({
      targets: ['defaults', 'not IE 11']
    })],
  optimizeDeps: {
    exclude: ['lucide-react', '@apify/log', 'ansi-colors'],
  },
  build: {
    outDir: 'dist',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js')) {
              return 'chartjs';
            }
            if (id.includes('react-chartjs-2')) {
              return 'chartjs-react';
            }
            if (id.includes('react')) {
              return 'react-vendor';
            }
            return 'vendor';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000, // Increase chunk size limit to avoid warnings
  },
  server: {
    port: 3000,
    host: true,
    hmr: {
      clientPort: 443,
      timeout: 120000
    },
    allowedHosts: ['localhost', 'incampaigntracker.cwsdev1.com', '2f1c-2401-4900-73ec-551c-55f3-d7c6-8948-7072.ngrok-free.app']
  },
  preview: {
    port: 3000,
    host: true,
  },
});