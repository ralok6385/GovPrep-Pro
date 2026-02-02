import { describe, it, expect, vi } from 'vitest';
import { fetchContent } from './contentService';
import api from '@/lib/api';

vi.mock('@/lib/api', () => ({
    default: {
        get: vi.fn(),
    },
}));

describe('contentService', () => {
    it('fetchContent should call api.get with correct params', async () => {
        const mockData = [{ _id: '1', title: 'Test' }];
        (api.get as any).mockResolvedValue({ data: mockData });

        const result = await fetchContent('sub123', 'video');

        expect(api.get).toHaveBeenCalledWith('/content', {
            params: { subjectId: 'sub123', type: 'video' },
        });
        expect(result).toEqual(mockData);
    });

    it('fetchContent should throw error on failure', async () => {
        (api.get as any).mockRejectedValue(new Error('API Error'));

        await expect(fetchContent()).rejects.toThrow('API Error');
    });
});
