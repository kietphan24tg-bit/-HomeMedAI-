import apiClient from '../api/client';

export interface RagChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export const ragServices = {
    // Send a question to the RAG chatbot
    chat: async (question: string) => {
        const res = await apiClient.post('/rag/chat', {
            question,
        });
        return res.data;
    },
};
