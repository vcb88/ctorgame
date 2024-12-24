import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

/// <reference types="vitest" />
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
        types: ['vitest/globals', './src/test/types.d.ts'],
        include: ['src/hooks/__tests__/*.test.ts'],
        coverage: {
            reporter: ['text', 'lcov'],
            include: ['src/hooks/**/*.ts'],
            exclude: [
                'node_modules/**',
                'src/test/**',
                '**/*.d.ts',
                '**/*.test.ts'
            ]
        }
    }
});