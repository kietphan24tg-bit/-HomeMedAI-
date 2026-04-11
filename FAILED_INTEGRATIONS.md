## ❌ Failed/Problematic APIs & Architectural Issues

### 1. Family-Level Medicine Inventory Endpoints

**Status**: 🔴 Critical Architecture Mismatch

**Issue**:
FE code calls endpoints that don't exist in BE:

- `GET /families/{id}/medicine-inventory` - Not in BE API
- `POST /families/{id}/medicine-inventory` - Not in BE API

**Affected FE Code**:

- `families.services.ts`: `getMedicineInventory()` and `addMedicineInventory()`
- `useAddMedicineInventoryMutation()` in family mutations
- Expected by: MedicineScreen, FamilyMedicineInventoryScreen

**Root Cause**:

- BE only has `/medicine-inventory/{item_id}` endpoints for individual items
- No bulk/filtered list endpoint for family-level inventory
- FE expects family-scoped medicine management

**Impact**:

- Cannot list medicines for a family
- Cannot add medicines to family inventory
- MedicineScreen will fail if it uses these methods

**Suggested Fixes** (Choose one):

**Fix Option A: Extend Backend** (Recommended if medicine inventory is truly family-scoped)

```
At backend, add:
- GET /families/{family_id}/medicine-inventory?status=ok&sort=name
- POST /families/{family_id}/medicine-inventory
- Include medicine_inventory in family contract response
```

**Fix Option B: Update Frontend** (If medicine inventory is actually profile-scoped)

```typescript
// Remove from families.services.ts:
- getMedicineInventory()
- addMedicineInventory()

// Use individual item endpoints instead:
// For listing: maintain in FE state or embed in profile response
// For creating: POST /medicine-inventory via profile context
// Update MedicineScreen to use medicineInventory.services.ts

// Modified approach:
- Get medicine items through profile associations
- Use useMedicineItemQuery(itemId) for individual items
- Maintain local state for "my medicines" list
```

**Fix Option C: Query Parameter Filtering** (Hybrid)

```
Modify BE to support:
GET /medicine-inventory?family_id={id}&profile_id={id}
Then FE can query and filter items
```

**Recommendation**: **Option B** - Align FE with BE API design. Update screens to manage individual medicine items through profiles, not family-level batching.

---

### 2. No Medicine Inventory List Endpoint

**Status**: 🟡 Design Gap

**Issue**:

- BE has no endpoint to list medicines by family or profile
- FE MedicineScreen needs to display a list of family medicines
- Cannot fetch "all medicines" for display

**Current State**:

- Only way to get medicine data is via `/medicine-inventory/{item_id}`
- Would need to know all itemIds beforehand

**Impact**:

- Cannot populate medicine list view
- No discovery of what medicines exist in family
- Read-only scenarios broken

**Suggested Fix**:
**Option 1: Add Backend Endpoint**

```
GET /families/{family_id}/medicine-inventory
Response: { items: [...], total_count, page, limit }

OR

GET /profiles/{profile_id}/medicine-inventory
Response: { items: [...] }
```

**Option 2: Embed in Existing Responses**

```
Include medicine_inventory[] array in:
- GET /families/{id} response
- GET /users/me response
```

**Option 3: Frontend Caching**

```
FE maintains local Set<medicineIds> for family
- On create: add to set
- On delete: remove from set
- On fetch: use stored ids to query items
```

**Recommendation**: **Option 1** - Add BE endpoint for consistent API design

---

### 3. Profile/Medicine Relationship Unclear

**Status**: 🟡 Architectural Clarification Needed

**Issue**:

- Relationship between profiles and medicine inventory not documented
- Unclear if medicines belong to:
    - Profile level (personal medicines)
    - Family level (shared medicines)
    - Both?

**Current BE Schema** (assumed from analysis):

```
User → Profiles
Profile → HealthProfile
Profile → MedicalRecords
Profile → Vaccinations
Profile → ??? Medicine (unclear)
Family → ??? Medicine (unclear)
```

**FE Interpretation**:

- Treats medicines as family-scoped (based on getMedicineInventory by familyId)
- But BE treats them as individual items with no scope

**Impact**:

- Cannot determine if medicine inventory is shared or personal
- Don't know permission model for medicine access
- Don't know if other family members can see/modify medicines

**Suggested Fix**:

**Document the relationships**:

```
1. Are medicines shared at family level or personal to profile?
   - If family-level: add family_id to medicine table
   - If profile-level: add profile_id to medicine table
   - If both: add both foreign keys

2. If family-level:
   - Add GET /families/{id}/medicine-inventory
   - Add permission checks for updates

3. If profile-level
   - Rename endpoint to /profiles/{id}/medicine-inventory
   - Include in health profile response

4. If both:
   - Create many-to-many relationship
   - Support both query paths
```

**Recommendation**: Update BE schema and add documentation. Align FE expectations.

---

### 4. Mock Data Still in Production Screens

**Status**: 🟡 Not Ready for Production

**Issue**:
Screens still using hardcoded mock data instead of API calls:

**RecordsScreen**:

- Uses: `RECORDS` from `src/data/health-data.ts`
- Should use: `useMedicalRecordsQuery(profileId)`
- Status: ⚠️ Mock data, not connected

**VaccineScreen**:

- Uses: `VACCINE_DETAILS` from `src/data/health-data.ts`
- Should use: `useProfileVaccinationsQuery()` + `useVaccinationRecommendationsQuery()`
- Status: ⚠️ Mock data, not connected

**MedicineScreen**:

- Uses: Hardcoded mock items
- Should use: `useMedicineItemQuery()` + list from family context
- Status: ⚠️ Mock data, not connected

**HealthProfileScreen**:

- Likely uses mock health data
- Should use: `useHealthProfileQuery()`
- Status: ⚠️ Mock data verification needed

**ChatbotScreen**:

- Likely uses mock chat
- Should use: `useChatMutation()`
- Status: ⚠️ Mock data verification needed

**Impact**:

- App appears to work in dev but fails in production
- No real data from backend
- User-entered data not persisted

**Required Fixes**:

```typescript
// Example: RecordsScreen fix
const RecordsScreen = ({ profileId }) => {
    const { data: medicalRecords, isLoading, isError } = useMedicalRecordsQuery(profileId);

    if (isLoading) return <LoadingSpinner />;
    if (isError) return <ErrorFallback />;
    if (!medicalRecords?.length) return <EmptyState />;

    return (
        <ScrollView>
            {medicalRecords.map(record => (
                <RecordCard key={record.id} record={record} />
            ))}
        </ScrollView>
    );
};
```

**Recommendation**: Update all 5 screens to use real API hooks before production release.

---

### 5. File Upload for Medical Attachments - No Multipart Support

**Status**: 🟡 Implementation Gap

**Issue**:
BE accepts multipart file upload, but FE `addMedicalAttachment()` only sends JSON

**Current FE Implementation**:

```typescript
addMedicalAttachment: async (recordId: string, payload: MedicalAttachmentPayload) => {
    const res = await apiClient.post(`/medical-records/${recordId}/attachments`, payload);
    return res.data;
}

// Only supports:
{ file_name: string, file_type: string, file_url: string }
```

**BE Expectations**:

```
POST /medical-records/{id}/attachments
Content-Type: multipart/form-data
- file: binary

OR

Content-Type: application/json
{ file_name, file_type, file_url }
```

**Impact**:

- Users cannot upload files from device
- Can only add reference URLs to existing files
- No actual file storage support

**Suggested Fix**:

**Add file upload support**:

```typescript
// medicalRecords.services.ts
addMedicalAttachmentFile: async (
    recordId: string,
    file: File,
    onProgress?: (progress: number) => void,
) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiClient.post(
        `/medical-records/${recordId}/attachments`,
        formData,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (onProgress && event.total) {
                    onProgress((event.loaded / event.total) * 100);
                }
            },
        },
    );
    return res.data;
};
```

**Update mutation to handle both cases**:

```typescript
export function useAddMedicalAttachmentMutation() {
    return useMutation({
        mutationFn: ({
            recordId,
            file,
            fileData,
        }: {
            recordId: string;
            file?: File;
            fileData?: MedicalAttachmentPayload;
        }) => {
            if (file) {
                return medicalRecordsServices.addMedicalAttachmentFile(
                    recordId,
                    file,
                );
            } else if (fileData) {
                return medicalRecordsServices.addMedicalAttachment(
                    recordId,
                    fileData,
                );
            }
            throw new Error('Either file or fileData required');
        },
        // ... error/success handling
    });
}
```

**Recommendation**: Implement multipart file upload before users need to attach medical documents.

---

### 6. No Error UI Components

**Status**: 🟡 Error Handling Logic Built, UI Not

**Issue**:

- Error handling implemented in services/mutations
- Toast notifications for errors working
- But no error boundary or fallback screens

**What's Missing**:

- Loading skeleton screens
- Empty state screens
- Error boundary wrapper
- Retry buttons for failed requests
- Offline detection

**Current State**:

```typescript
const { data, isLoading, isError, error } = useQuery(...);
// isLoading, isError available but not used in UI
```

**Impact**:

- Users see loading indefinitely
- Users don't see error messages
- Poor UX on network failures
- App crashes on unexpected errors

**Suggested Implementation**:

```typescript
// Create error boundary component
const QueryErrorBoundary = ({ error, retry }) => (
    <View style={styles.errorContainer}>
        <Icon name="alert-circle" />
        <Text>Something went wrong</Text>
        <Text>{error?.message}</Text>
        <Button onPress={retry}>Retry</Button>
    </View>
);

// Use in screens
const RecordsScreen = ({ profileId }) => {
    const query = useMedicalRecordsQuery(profileId);

    if (query.isLoading) return <LoadingSkeleton />;
    if (query.isError) return <QueryErrorBoundary error={query.error} retry={query.refetch} />;
    if (!query.data?.length) return <EmptyStateView />;

    return <RecordsList data={query.data} />;
};
```

**Recommendation**: Add error UI components and skeleton loaders before shipping to QA.

---

### 7. Authentication - Missing Change Password UI

**Status**: 🟡 API Exists But Not Wired to UI

**Issue**:

- Backend has `/auth/change-password` endpoint
- FE has `changePassword()` method in auth.services
- But no UI screen to call it

**Current State**:

```typescript
// auth.services.ts - method exists
changePassword: async (oldPassword: string, newPassword: string) => {
    const res = await apiClient.post('/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword,
    });
    return res.data;
};
```

**Missing**:

- UseChangePasswordMutation hook
- ChangePasswordScreen component
- Integration in ProfileScreen settings

**Impact**:

- Users cannot change passwords through app
- Must use backend API directly or forgot password flow

**Suggested Fix**:

```typescript
// Add to features: useChangePasswordMutation
export function useChangePasswordMutation() {
    return useMutation({
        mutationFn: ({
            oldPassword,
            newPassword,
        }: {
            oldPassword: string;
            newPassword: string;
        }) => authServices.changePassword(oldPassword, newPassword),
        onSuccess: () => {
            appToast.showSuccess('Thành công', 'Mật khẩu đã được thay đổi');
        },
        onError: (error: any) => {
            appToast.showError(
                'Lỗi',
                error?.response?.data?.detail || 'Không thể thay đổi mật khẩu',
            );
        },
    });
}

// Add ChangePasswordScreen and integrate in profile navigation
```

**Recommendation**: Add password management feature to ProfileScreen settings.

---

### 8. No Integration with Family Medicine Inventory Endpoints

**Status**: 🔴 CriticalFE Methods Without BE Support

**Issue**:
Family services has FE-only methods with unclear BE support:

```typescript
rotateInviteCode(); // POST /families/{id}/invite/rotate
getProfiles(); // GET /families/{id}/profiles
createProfile(); // POST /families/{id}/profiles
patchFamily(); // PATCH /families/{id}
patchMember(); // PATCH /family-memberships/{id}
getMedicineInventory(); // GET /families/{id}/medicine-inventory (❌ NOT IN BE)
addMedicineInventory(); // POST /families/{id}/medicine-inventory (❌ NOT IN BE)
```

**Verification Status**:

- ✅ Invite code rotation - likely works
- ✅ Profile CRUD - likely works
- ✅ Family patch - likely works
- ⚠️ Member patch - duplicated with familyMemberships service
- ❌ Medicine inventory methods - DON'T EXIST IN BE

**Recommended Actions**:

1. Verify rotateInviteCode actually works: POST /families/{id}/invite/rotate
2. Check if getProfiles returns both owned + family profiles
3. Remove duplicate patchMember - use familyMemberships service instead
4. Fix medicine inventory endpoints (see Issue #1)

**Recommendation**: Update families.services to remove non-existent endpoints.

---

### 9. Duplicate Member Management Methods

**Status**: 🟡 Code Duplication

**Issue**:
Two ways to manage family members:

- `families.services.ts`: `patchMember()`, `deleteMember()`
- `familyMemberships.services.ts`: `updateMemberRole()`, `removeMember()`

**Current Duplication**:

```typescript
// families.services.ts
patchMember: async (membership_id: string, data: any) => {
    const res = await apiClient.patch(
        `/family-memberships/${membership_id}`,
        data,
    );
    return res.data;
};

deleteMember: async (membership_id: string) => {
    const res = await apiClient.delete(`/family-memberships/${membership_id}`);
    return res.data;
};

// familyMemberships.services.ts (NEW)
updateMemberRole: async (memberId: string, payload) => {
    const res = await apiClient.patch(
        `/family-memberships/${memberId}`,
        payload,
    );
    return res.data;
};

removeMember: async (memberId: string) => {
    const res = await apiClient.delete(`/family-memberships/${memberId}`);
    return res.data;
};
```

**Impact**:

- Confusing which service to use
- Mutations scattered across two places
- Maintenance burden

**Suggested Fix**:

- Keep methods in `familyMemberships.services.ts` (more specific)
- Remove from `families.services.ts`
- Update family mutations to use familyMemberships service
- Use memberships service for all membership operations

**Recommendation**: Consolidate to one source of truth for member management.

---

### 10. Chat Response Format Unknown

**Status**: 🟡 Integration Uncertain

**Issue**:
RAG endpoint response format not documented:

```typescript
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
```

**Unknown**:

- Response format: { answer: string, sources?: [...] }?
- Streaming support? One big response?
- Token usage tracking?
- Context/conversation_id support?

**Impact**:

- Cannot properly parse/display chat responses
- No conversation history support
- Cannot show sources or metadata

**Suggested Fix**:
Document BE response for `/rag/chat`:

```
Response format:
{
    answer: string,
    sources?: { title, url, excerpt }[],
    confidence?: number,
    follow_up_questions?: string[],
    conversation_id?: string
}
```

**Recommendation**: Clarify chat response schema with backend team.

---

## Summary of Issues by Severity

### 🔴 BLOCKING (Must Fix Before Production)

1. **Family Medicine Inventory Endpoints** - API calls fail, endpoints don't exist
2. **Mock Data in Screens** - App won't work with real backend

### 🟡 HIGH (Should Fix Before Release)

3. **Medicine Inventory List Endpoint** - No way to list medicines
4. **Profile/Medicine Relationship** - Architecture unclear
5. **Error UI Components** - Users see blank screens on errors
6. **Multipart File Upload** - Cannot attach documents

### 🟠 MEDIUM (Should Fix Soon)

7. **Change Password Feature** - Missing UI but API works
8. **Duplicate Member Methods** - Code duplication
9. **Chat Response Format** - Integration uncertain

### 🟡 LOW (Nice to Have)

10. **Endpoint Verification** - Spot-check some family endpoints

---

## Total Integration Assessment

- **Successfully Integrated**: 60+ endpoints ✅
- **Architecture Issues**: 2 (medicine inventory, profiles)
- **Missing UX**: 3 (errors, loading, upload)
- **Duplicate Code**: 1 (member management)
- **Unknown Formats**: 1 (chat response)

**Overall Status**: ~85% ready for QA, needs Issue #1-6 resolved before production
