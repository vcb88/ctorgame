/// <reference types="vitest" />
/// <reference types="@testing-library/jest-dom" />

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';
import type { Vi } from 'vitest';

declare global {
    interface Window {
        vi: Vi;
    }

    namespace Vi {
        interface Assertion<T = any> extends jest.Matchers<void, T> {}
        interface AsymmetricMatchersContaining extends jest.Matchers<void, any> {}
    }

    interface Matchers<R = void, T = {}> extends TestingLibraryMatchers<typeof expect.stringContaining, R> {}
}