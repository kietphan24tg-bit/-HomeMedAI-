import { useMutation } from '@tanstack/react-query';
import { appToast } from '../../lib/toast';
import { ragServices } from '../../services/rag.services';

export function useChatMutation() {
    return useMutation({
        mutationFn: (question: string) => ragServices.chat(question),
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể gửi câu hỏi',
            );
        },
    });
}
