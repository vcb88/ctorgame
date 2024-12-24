/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { Vi } from 'vitest';

declare global {
    interface Window {
        vi: Vi;
    }

    namespace Vi {
        interface Assertion<T = unknown> extends jest.Matchers<void, T> {}
        interface AsymmetricMatchersContaining extends jest.Matchers<void, unknown> {}
    }

    interface Matchers<R = void> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
}