import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import commonjs from '@rollup/plugin-commonjs'

export default defineConfig({
  plugins: [
    react(),
    commonjs(), // Usually unnecessary unless dealing with legacy packages
  ],

  optimizeDeps: {
    exclude: ['lucide-react', '@apify/log', 'ansi-colors'], // This is fine
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
      clientPort: 443, // Use this only if you're behind an HTTPS proxy (e.g., Vercel preview)
      timeout: 120_000,
    },
    // allowedHosts is not a valid Vite option. Use `origin` check manually in middleware if needed
  },

  preview: {
    port: 3000,
    host: true,
  },
})