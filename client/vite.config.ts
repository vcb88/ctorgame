import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: process.cwd(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
      host: 'localhost'
    },
    watch: {
      usePolling: true,
    },
    fs: {
      strict: false,
      allow: ['.']
    },
    middlewareMode: false
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
  }
});