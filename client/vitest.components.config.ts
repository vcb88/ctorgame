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
        setupFiles: [
            './src/test/setup.ts',
            './src/test/react-18-setup.ts'
        ],
        types: ['vitest/globals', './src/test/types.d.ts'],
        include: ['src/components/**/__tests__/*.test.tsx'],
        coverage: {
            reporter: ['text', 'lcov'],
            include: ['src/components/**/*.tsx'],
            exclude: [
                'node_modules/**',
                'src/test/**',
                '**/*.d.ts',
                '**/*.test.tsx'
            ]
        }
    }
});