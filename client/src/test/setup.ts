import '@testing-library/jest-dom';
import { expect, afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Make vitest APIs available globally
declare global {
  interface Window {
    vi: typeof vi;
  }
}

window.vi = vi;

// Extend vitest's expect with jest-dom matchers
expect.extend(matchers);

// Setup for each test
beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
});