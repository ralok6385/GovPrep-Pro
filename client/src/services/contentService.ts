import api from '@/lib/api';

export interface ContentItem {
    _id: string;
    title: string;
    type: 'video' | 'pdf';
    url: string;
    subjectId: {
        _id: string;
        name: string;
    };
    topicName: string;
    isPremium: boolean;
    createdAt: string;
}

export const fetchContent = async (subjectId?: string, type?: 'video' | 'pdf' | 'all') => {
    try {
        const response = await api.get('/content', {
            params: { subjectId, type }
        });
        return response.data as ContentItem[];
    } catch (error) {
        throw error;
    }
};

export const fetchSubjects = async () => {
    // We might need a proper subject route later, but for now let's assume content carries subject info
    // or we fetch distinct from content. 
    // Wait, let's check backend if there is a subject route.
    // server/routes/subjectRoutes.js? No.
    // server/controllers? No subjectController.
    // I should probably add a quick way to get subjects or just rely on hardcoded for now?
    // The seed created subjects. Ideally we need an endpoint.
    // Let's stick to just content fetching for now and maybe extract subjects from there or add endpoint.
    // Actually, I'll add a simple fetchSubjects to api/dashboard if it exists?
    // Let's just keep it simple: fetchContent is enough for the page if we filter by tabs.
    // But to show "Subject" filter, we need subjects.

    // For this iteration, I'll mock subjects on frontend or just fetch all content and filter client side if needed, 
    // BUT the controller supports subjectId filtering.
    // I will add a temporary Subject fetch if needed, but let's stick to content first.
    return [];
};
