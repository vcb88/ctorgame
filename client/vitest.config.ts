import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'clover'],
      reportsDirectory: './coverage',
      exclude: [
        'coverage/**',
        'dist/**',
        '**/*.d.ts',
        'test{,s}/**',
        '**/*.config.{js,ts}',
        '**/*.test.{ts,tsx}',
        '**/test-utils.ts',
      ],
    },
    deps: {
      optimizer: {
        web: {
          include: [/@testing-library\/react/, /@ctor-game\/shared/]
        }
      }
    },
    mockReset: true,
    restoreMocks: true,
    clearMocks: true,
  },
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, './src')
      },
      {
        find: '@ctor-game/shared',
        replacement: resolve(__dirname, '../shared')
      },
      {
        find: 'test-utils',
        replacement: resolve(__dirname, './src/test/test-utils')
      }
    ]
  }
});