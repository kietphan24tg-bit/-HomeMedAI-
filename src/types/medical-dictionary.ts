export type DictionaryEntryType = 'disease' | 'drug' | 'vaccine';

export type DictionarySearchItem = {
    id: string;
    type: DictionaryEntryType;
    title: string;
    aliases: string[];
    summary: string | null;
};

export type DictionarySearchResponse = {
    items: DictionarySearchItem[];
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
};

export type DictionaryDetailResponse = {
    id: string;
    type: DictionaryEntryType;
    title: string;
    aliases: string[];
    summary: string | null;
    content: Record<string, unknown>;
    source_file: string;
};
