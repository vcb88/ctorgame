import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'tests/e2e/support/e2e.ts',
    specPattern: 'tests/e2e/**/*.cy.ts',
    video: true,
    screenshotOnRunFailure: true,
    viewportWidth: 1280,
    viewportHeight: 720,
    defaultCommandTimeout: 10000,  // 10 seconds
    requestTimeout: 10000,         // 10 seconds
    responseTimeout: 30000,        // 30 seconds
    pageLoadTimeout: 60000,        // 60 seconds
  },
  retries: {
    runMode: 2,     // Retry failed tests twice in CI
    openMode: 0     // No retries in interactive mode
  },
  env: {
    API_URL: 'http://localhost:3000',
  },
})