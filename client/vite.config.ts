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
      '@ctor-game/shared': path.resolve(__dirname, '../shared/src'),
      '@ctor-game/shared/src': path.resolve(__dirname, '../shared/src'),
      '@ctor-game/shared/utils': path.resolve(__dirname, '../shared/src/utils'),
      '@ctor-game/shared/types': path.resolve(__dirname, '../shared/src/types'),
      '@ctor-game/shared/config': path.resolve(__dirname, '../shared/src/config')
    },
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    host: true, // Доступ извне контейнера
    port: 5173,
    strictPort: true,
    proxy: {
      '/socket.io': {
        target: 'http://server:3000',
        ws: true,
        changeOrigin: true,
        secure: false
      },
      '/api': {
        target: 'http://server:3000',
        changeOrigin: true,
        secure: false
      }
    },
    watch: {
      usePolling: true,
    },
    fs: {
      strict: false,
      allow: ['.']
    }
  },
  preview: {
    port: 5173,
    strictPort: true,
    host: '0.0.0.0',
  }
});