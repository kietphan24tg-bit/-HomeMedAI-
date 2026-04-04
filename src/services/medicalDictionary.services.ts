import apiClient from '../api/client';
import type {
    DictionaryDetailResponse,
    DictionaryEntryType,
    DictionarySearchResponse,
} from '../types/medical-dictionary';

export const medicalDictionaryService = {
    search: async ({
        query,
        type,
        page = 1,
        limit = 20,
    }: {
        query: string;
        type?: DictionaryEntryType | null;
        page?: number;
        limit?: number;
    }): Promise<DictionarySearchResponse> => {
        const res = await apiClient.get('/medical-dictionary/search', {
            params: {
                q: query,
                type: type ?? undefined,
                page,
                limit,
            },
        });
        return res.data;
    },
    getDetail: async (
        entryType: DictionaryEntryType,
        itemId: string,
    ): Promise<DictionaryDetailResponse> => {
        const res = await apiClient.get(
            `/medical-dictionary/${entryType}/${itemId}`,
        );
        return res.data;
    },
};
