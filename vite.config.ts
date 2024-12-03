import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';


export default defineConfig({
  base: '/ctorgame/',

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

    strictPort: true, // Не пытаться использовать другой порт если 3000 занят
    port: 3000,
  },
});
