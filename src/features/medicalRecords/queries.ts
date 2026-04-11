import { useQuery } from '@tanstack/react-query';
import { medicalRecordsQueryKeys } from './queryKeys';
import { medicalRecordsServices } from '../../services/medicalRecords.services';

export function useMedicalRecordsQuery(profileId: string) {
    return useQuery({
        queryKey: medicalRecordsQueryKeys.list(profileId),
        queryFn: () => medicalRecordsServices.getMedicalRecords(profileId),
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useMedicalRecordQuery(recordId: string | null | undefined) {
    return useQuery({
        queryKey: recordId
            ? medicalRecordsQueryKeys.detail(recordId)
            : ['disabled'],
        queryFn: () =>
            recordId ? medicalRecordsServices.getMedicalRecord(recordId) : null,
        enabled: !!recordId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
}

export function useMedicalAttachmentsQuery(recordId: string) {
    return useQuery({
        queryKey: medicalRecordsQueryKeys.attachments(recordId),
        queryFn: () => medicalRecordsServices.getMedicalAttachments(recordId),
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 30,
    });
}
