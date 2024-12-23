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

    strictPort: false, // Разрешаем использовать другой порт если основной занят
    port: 5173, // Стандартный порт Vite
  },
});
