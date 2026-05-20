import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
// Web deploys must use "/" so assets load on /login, /dashboard, etc.
// Electron builds set VITE_BASE_PATH=./ (see package.json electron-build).
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    assetsDir: 'assets',
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@mui/icons-material')) return 'mui-icons';
            if (id.includes('@mui/material') || id.includes('@mui/system') || id.includes('@emotion')) {
              return 'mui-core';
            }
            if (id.includes('recharts') || id.includes('d3-')) return 'charts';
            if (id.includes('lucide-react')) return 'lucide';
            if (
              id.includes('react-dom') ||
              id.includes('react-router') ||
              id.includes('/react/') ||
              id.includes('scheduler')
            ) {
              return 'react-vendor';
            }
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
})
