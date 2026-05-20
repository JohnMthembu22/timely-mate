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
    // Default chunking only — custom manualChunks split recharts/d3 into a
    // "charts" bundle that hit circular-init TDZ errors (blank screen on load).
  },
  server: {
    port: 3000,
    host: true,
  },
})
