import { describe, it, expect } from 'vitest';
import { formatDuration, truncateText } from './format';

describe('format utils', () => {
    describe('formatDuration', () => {
        it('should format seconds into MM:SS correctly', () => {
            expect(formatDuration(65)).toBe('01:05');
            expect(formatDuration(0)).toBe('00:00');
            expect(formatDuration(59)).toBe('00:59');
        });

        it('should format hours into HH:MM:SS correctly', () => {
            expect(formatDuration(3665)).toBe('01:01:05');
        });
    });

    describe('truncateText', () => {
        it('should truncate long text', () => {
            expect(truncateText('Hello World', 5)).toBe('Hello...');
        });

        it('should not truncate short text', () => {
            expect(truncateText('Hello', 10)).toBe('Hello');
        });
    });
});
