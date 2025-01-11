import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Custom logger plugin
const loggerPlugin = (): Plugin => ({
  name: 'logger',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const start = Date.now();
      res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
      });
      next();
    });
  }
});

export default defineConfig({
  root: process.cwd(),
  plugins: [react(), loggerPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@ctor-game/shared': path.resolve(__dirname, '../shared/src')
    }
  },
  optimizeDeps: {
    include: ['@ctor-game/shared']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 80,
      host: 'localhost',
      path: '/_vite'
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