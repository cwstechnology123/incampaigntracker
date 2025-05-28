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
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // Your backend server
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