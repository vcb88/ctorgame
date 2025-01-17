import { describe, it, expect } from 'vitest';
import { formatDate } from './date.js';

describe('formatDate', () => {
    it('formats date in US format', () => {
        const date = new Date('2024-12-24');
        expect(formatDate(date)).toBe('December 24, 2024');
    });

    it('handles different months correctly', () => {
        const date = new Date('2024-03-15');
        expect(formatDate(date)).toBe('March 15, 2024');
    });
});