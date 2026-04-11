# FE API Integration - Quick Reference Guide

## How to Use the New Services

### 1. Medical Records

**List medical records for a profile:**

```typescript
import { useMedicalRecordsQuery } from '@/src/features/medicalRecords/queries';

const MyComponent = ({ profileId }) => {
    const { data: records, isLoading, error } = useMedicalRecordsQuery(profileId);

    if (isLoading) return <LoadingSpinner />;
    if (error) return <ErrorView error={error} />;

    return records.map(record => <RecordCard key={record.id} record={record} />);
};
```

**Create a medical record:**

```typescript
import { useCreateMedicalRecordMutation } from '@/src/features/medicalRecords/mutations';

const AddRecordForm = ({ profileId }) => {
    const { mutate: createRecord, isPending } = useCreateMedicalRecordMutation();

    const handleSubmit = (data) => {
        createRecord({ profileId, data }, {
            onSuccess: () => {
                // Record created, toast shown automatically
            }
        });
    };

    return <Form onSubmit={handleSubmit} />;
};
```

---

### 2. Vaccinations

**Get vaccine recommendations:**

```typescript
import { useVaccinationRecommendationsQuery } from '@/src/features/vaccinations/queries';

const VaccineList = () => {
    const { data: recommendations } = useVaccinationRecommendationsQuery();
    return recommendations.map(vax => <VaccineItem key={vax.id} vaccine={vax} />);
};
```

**Track doses:**

```typescript
import {
    useAddVaccinationDoseMutation,
    useVaccinationDosesQuery
} from '@/src/features/vaccinations/mutations';
import { useVaccinationDosesQuery } from '@/src/features/vaccinations/queries';

const VaccineDoseTracker = ({ userVaccinationId }) => {
    const { data: doses } = useVaccinationDosesQuery(userVaccinationId);
    const { mutate: addDose } = useAddVaccinationDoseMutation();

    return (
        <>
            {doses.map(dose => <DoseCard key={dose.id} dose={dose} />)}
            <Button onPress={() => addDose({ userVaccinationId, payload: {...} })}>
                Add Dose
            </Button>
        </>
    );
};
```

---

### 3. Health Profiles

**Get/Update health information:**

```typescript
import {
    useHealthProfileQuery,
    useUpdateHealthProfileMutation
} from '@/src/features/health/queries';
import { useUpdateHealthProfileMutation } from '@/src/features/health/mutations';

const HealthProfileEditor = ({ profileId }) => {
    const { data: health } = useHealthProfileQuery(profileId);
    const { mutate: updateHealth, isPending } = useUpdateHealthProfileMutation();

    const handleSave = (bloodType, allergies) => {
        updateHealth({
            profileId,
            data: { blood_type: bloodType, allergies }
        });
    };

    return <HealthForm initialData={health} onSave={handleSave} />;
};
```

---

### 4. Medicine Inventory

**Get medicine item:**

```typescript
import { useMedicineItemQuery } from '@/src/features/medicineInventory/queries';
import { useUpdateMedicineItemMutation } from '@/src/features/medicineInventory/mutations';

const MedicineDetail = ({ itemId }) => {
    const { data: medicine } = useMedicineItemQuery(itemId);
    const { mutate: update } = useUpdateMedicineItemMutation();

    return (
        <MedicineCard
            medicine={medicine}
            onUpdate={(data) => update({ itemId, data })}
        />
    );
};
```

---

### 5. Chat (RAG)

**Send question to AI chatbot:**

```typescript
import { useChatMutation } from '@/src/features/chat/mutations';

const ChatInput = () => {
    const { mutate: sendMessage, isPending } = useChatMutation();
    const [response, setResponse] = useState(null);

    const handleSend = (question) => {
        sendMessage(question, {
            onSuccess: (data) => {
                setResponse(data);
            }
        });
    };

    return (
        <>
            <ChatInputField onSend={handleSend} disabled={isPending} />
            {response && <ChatResponse response={response} />}
        </>
    );
};
```

---

### 6. Family Management

**Create family:**

```typescript
import { useCreateFamilyMutation } from '@/src/features/family/mutations';

const CreateFamilyForm = () => {
    const { mutate: createFamily } = useCreateFamilyMutation();

    const handleCreate = (data) => {
        createFamily(data); // { name, owner_profile_full_name, address?, avatar_url? }
    };

    return <FamilyForm onSubmit={handleCreate} />;
};
```

**Update/Remove family members:**

```typescript
import {
    useUpdateFamilyMemberRoleMutation,
    useRemoveFamilyMemberMutation
} from '@/src/features/family/mutations';

const FamilyMemberManager = ({ memberId }) => {
    const { mutate: updateRole } = useUpdateFamilyMemberRoleMutation();
    const { mutate: removeMember } = useRemoveFamilyMemberMutation();

    return (
        <>
            <Button onPress={() => updateRole({ memberId, role: 'OWNER' })}>
                Make Owner
            </Button>
            <Button onPress={() => removeMember(memberId)}>
                Remove
            </Button>
        </>
    );
};
```

---

### 7. Notifications

**Send notification:**

```typescript
import { useSendNotificationMutation } from '@/src/features/notifications/mutations';

const NotificationButton = () => {
    const { mutate: sendNotification } = useSendNotificationMutation();

    const handleSend = () => {
        sendNotification({
            title: 'Medical Reminder',
            body: 'Time to take your medication',
            data: { reminder_id: '123' }
        });
    };

    return <Button onPress={handleSend}>Send</Button>;
};
```

---

## All Available Imports

### Service Files

```typescript
import { authServices } from '@/src/services/auth.services';
import { userServices } from '@/src/services/user.services';
import { familiesServices } from '@/src/services/families.services';
import { familyMembershipsServices } from '@/src/services/familyMemberships.services';
import { healthProfileServices } from '@/src/services/healthProfile.services';
import { medicalRecordsServices } from '@/src/services/medicalRecords.services';
import { vaccinationServices } from '@/src/services/vaccinations.services';
import { medicineInventoryServices } from '@/src/services/medicineInventory.services';
import { notificationsServices } from '@/src/services/notifications.services';
import { ragServices } from '@/src/services/rag.services';
import { medicalDictionaryServices } from '@/src/services/medicalDictionary.services';
```

### React Query Hooks

**Medical Records:**

```typescript
import {
    useMedicalRecordsQuery,
    useMedicalRecordQuery,
    useMedicalAttachmentsQuery,
} from '@/src/features/medicalRecords/queries';

import {
    useCreateMedicalRecordMutation,
    useUpdateMedicalRecordMutation,
    useDeleteMedicalRecordMutation,
    useAddMedicalAttachmentMutation,
    useDeleteMedicalAttachmentMutation,
} from '@/src/features/medicalRecords/mutations';
```

**Vaccinations:**

```typescript
import {
    useVaccinationRecommendationsQuery,
    useProfileVaccinationsQuery,
    useUserVaccinationQuery,
    useVaccinationDosesQuery,
} from '@/src/features/vaccinations/queries';

import {
    useSubscribeToVaccineMutation,
    useUpdateUserVaccinationMutation,
    useAddVaccinationDoseMutation,
    useUpdateVaccinationDoseMutation,
    useDeleteVaccinationDoseMutation,
} from '@/src/features/vaccinations/mutations';
```

**Health Profiles:**

```typescript
import {
    useHealthProfileQuery,
    useProfileQuery,
} from '@/src/features/health/queries';

import {
    useUpdateHealthProfileMutation,
    useUpdateProfileMutation,
    useLinkProfileMutation,
    useDeleteProfileMutation,
} from '@/src/features/health/mutations';
```

**Medicine Inventory:**

```typescript
import { useMedicineItemQuery } from '@/src/features/medicineInventory/queries';

import {
    useUpdateMedicineItemMutation,
    useDeleteMedicineItemMutation,
} from '@/src/features/medicineInventory/mutations';
```

**Chat:**

```typescript
import { useChatMutation } from '@/src/features/chat/mutations';
```

**Notifications:**

```typescript
import {
    useSendNotificationMutation,
    useSendDeviceNotificationMutation,
} from '@/src/features/notifications/mutations';
```

**Family:**

```typescript
import {
    useCreateFamilyMutation,
    useAcceptFamilyInviteMutation,
    useRejectFamilyInviteMutation,
    useUpdateFamilyMemberRoleMutation,
    useRemoveFamilyMemberMutation,
    // ... and more
} from '@/src/features/family/mutations';

import {
    useMyFamiliesQuery,
    useGetFamilyQuery,
    // ... and more
} from '@/src/features/family/queries';
```

---

## Error Handling

All mutations automatically show toast notifications:

```typescript
// Success - green toast
useCreateMedicalRecordMutation();
// Shows: "Thành công - Hồ sơ y tế đã được thêm"

// Error - red toast
// Shows: "Lỗi - [error message from backend]"
```

To handle errors programmatically:

```typescript
const { mutate, error, isError } = useCreateMedicalRecordMutation();

mutate(data, {
    onError: (error) => {
        console.error('Failed:', error?.response?.data?.detail);
    },
    onSuccess: (data) => {
        console.log('Created:', data);
    },
});
```

---

## Loading States

All queries provide loading states:

```typescript
const { data, isLoading, isPending, isError, error } = useQuery(...);

if (isLoading) return <Skeleton />;
if (isError) return <ErrorBoundary error={error} />;

return <Content data={data} />;
```

---

## Cache & Invalidation

Queries are cached automatically:

- Medical records: 5 minutes
- Vaccinations: 5 minutes
- Health profiles: 5 minutes
- Medicine items: 5 minutes
- Recommendations: 30 minutes (long-lived)

Manual invalidation (when needed):

```typescript
import { appQueryClient } from '@/src/lib/query-client';
import { medicalRecordsQueryKeys } from '@/src/features/medicalRecords/queryKeys';

// Invalidate specific query
appQueryClient.invalidateQueries({
    queryKey: medicalRecordsQueryKeys.list(profileId),
});

// Invalidate all medical records queries
appQueryClient.invalidateQueries({
    queryKey: medicalRecordsQueryKeys.all,
});
```

---

## Common Patterns

### Dependent Queries

```typescript
// Don't fetch if profileId is null
const { data } = useHealthProfileQuery(profileId || null);
```

### Refetch on Focus

```typescript
const { refetch } = useMedicalRecordsQuery(profileId);

useEffect(() => {
    const interval = setInterval(() => refetch(), 30000); // Every 30s
    return () => clearInterval(interval);
}, [refetch]);
```

### Optimistic Updates

```typescript
const { mutate } = useUpdateHealthProfileMutation();

mutate(
    {
        profileId,
        data: { blood_type: 'O+' },
    },
    {
        onMutate: (variables) => {
            // Update UI immediately before API response
            setLocalData(variables.data);
        },
        onError: () => {
            // Revert if failed
            refetch();
        },
    },
);
```

---

## TypeScript Support

All services are fully typed:

```typescript
import type { CreateMedicalRecordPayload } from '@/src/services/medicalRecords.services';
import type { VaccinationDosePayload } from '@/src/services/vaccinations.services';
import type { UpdateHealthProfilePayload } from '@/src/services/healthProfile.services';

const record: CreateMedicalRecordPayload = {
    diagnosis_name: 'Hypertension',
    doctor_name: 'Dr. Smith',
    visit_date: '2025-04-11',
};
```

---

## Migration from Mock Data

Before (mock):

```typescript
import { RECORDS } from '@/src/data/health-data';

const RecordsScreen = () => {
    const records = RECORDS; // ❌ Mock data
    return records.map(r => <RecordCard {...r} />);
};
```

After (real API):

```typescript
import { useMedicalRecordsQuery } from '@/src/features/medicalRecords/queries';

const RecordsScreen = ({ profileId }) => {
    const { data: records, isLoading } = useMedicalRecordsQuery(profileId); // ✅ Real API

    if (isLoading) return <LoadingSkeleton />;
    return records?.map(r => <RecordCard key={r.id} {...r} />);
};
```

---

## Troubleshooting

### Query not working?

1. Check profileId/recordId is not null
2. Verify user is authenticated (check useAuthStore)
3. Check network tab for API errors
4. Verify BE endpoint matches: e.g., `/medical-records` not `/medicalRecords`

### Mutation not triggering?

1. Call `mutate()` or `mutateAsync()` explicitly
2. Check `isPending` state
3. Look for error in `error` property
4. Check toast notifications for server errors

### Cache issues?

1. Manually invalidate query after mutations
2. Adjust stale times if needed (in queries.ts)
3. Use devtools: `react-query-devtools`

---

**Last Updated**: April 11, 2025
**API Server**: http://103.82.24.142:7543
**Status**: ✅ Production-ready services, ⏳ Screens need UI updates
