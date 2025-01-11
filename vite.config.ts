import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


export default defineConfig({
  base: '/',

  plugins: [react()],
  root: '.', // 
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html'  
    }
  },  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',  // Явно указываем слушать все интерфейсы
    strictPort: true, // Используем только указанный порт
    port: 5173, // Стандартный порт Vite
    proxy: {
      '/socket.io': {
        target: 'http://server:3000',
        ws: true,
        changeOrigin: true
      },
      '/api': {
        target: 'http://server:3000',
        changeOrigin: true
      }
    }
  },
});
