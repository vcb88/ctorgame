import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/integration/**/*.test.ts'],
    environment: 'node',
    globals: true,
    setupFiles: ['tests/integration/setup.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: ['server/src/**/*.ts'],
      exclude: [
        'server/src/types/**',
        'server/src/config/**',
        'server/src/**/*.d.ts',
      ],
    },
    testTimeout: 10000,
  },
})