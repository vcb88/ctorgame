import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/test/setup.ts'],
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