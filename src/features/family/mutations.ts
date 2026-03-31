import { useMutation } from '@tanstack/react-query';
import { appQueryClient } from '@/src/lib/query-client';
import { appToast } from '@/src/lib/toast';
import { familiesServices } from '@/src/services/families.services';
import { familyQueryKeys } from './queryKeys';

export function useRejectFamilyInviteMutation() {
    return useMutation({
        mutationFn: ({ inviteId }: { inviteId: string }) =>
            familiesServices.rejectInvite({ invite_id: inviteId }),
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Th�nh c�ng', '�� t? ch?i l?i m?i.');
        },
        onError: () => {
            appToast.showError('L?i', 'Kh�ng th? t? ch?i l?i m?i l�c n�y.');
        },
    });
}

export function useAcceptFamilyInviteMutation() {
    return useMutation({
        mutationFn: ({
            inviteId,
            fullName,
        }: {
            inviteId: string;
            fullName: string | null;
        }) => {
            if (!fullName) {
                throw new Error('missing_full_name');
            }

            return familiesServices.acceptInvite({
                invite_id: inviteId,
                full_name: fullName,
            });
        },
        onSuccess: () => {
            appQueryClient.invalidateQueries({ queryKey: familyQueryKeys.all });
            appToast.showSuccess('Th�nh c�ng', '�� ch?p nh?n l?i m?i.');
        },
        onError: (error) => {
            if (
                error instanceof Error &&
                error.message === 'missing_full_name'
            ) {
                appToast.showError(
                    'Thi?u d? li?u',
                    'Backend chua tr? d? full_name d? ch?p nh?n l?i m?i.',
                );
                return;
            }

            appToast.showError('L?i', 'Kh�ng th? ch?p nh?n l?i m?i l�c n�y.');
        },
    });
}
