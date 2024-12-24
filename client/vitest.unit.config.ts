import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

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
        include: ['src/**/*.test.{ts,tsx}', 'src/**/*.spec.{ts,tsx}'],
        exclude: [
            'src/hooks/__tests__/**',
            'src/components/**/__tests__/**',
            'node_modules/**',
            '**/coverage/**'
        ],
        coverage: {
            reporter: ['text', 'lcov'],
            exclude: [
                'node_modules/**',
                'src/test/**',
                '**/*.d.ts',
                '**/*.test.{ts,tsx}',
                'src/hooks/__tests__/**',
                'src/components/**/__tests__/**'
            ]
        }
    }
});