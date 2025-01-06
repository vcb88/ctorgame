import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { MockInstance } from 'vitest';

declare module 'vitest' {
  interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    interface Assertion<T = any> extends TestingLibraryMatchers<T, void> {}
  }

  interface Window {
    vi: typeof vi;
  }

  // Добавляем совместимость с Jest типами
  type Mock<T> = MockInstance<T>;
  
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    type Mock<T = any> = MockInstance<T>;
  }
}