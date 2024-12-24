import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
  },
  env: {
    apiUrl: 'http://localhost:3000',
  },
  retries: {
    runMode: 2,
    openMode: 0,
  },
});