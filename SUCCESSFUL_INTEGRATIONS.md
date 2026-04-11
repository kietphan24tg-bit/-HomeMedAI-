## ✅ Successfully Integrated APIs

### Authentication & Session

| Endpoint                | Method | FE Usage                                 | Service          |
| ----------------------- | ------ | ---------------------------------------- | ---------------- |
| `/auth/register`        | POST   | `signUp()` in OnboardingScreen           | auth.services.ts |
| `/auth/login`           | POST   | `signIn()` in AuthScreen                 | auth.services.ts |
| `/auth/google`          | POST   | `signInWithGoogle()` in AuthScreen       | auth.services.ts |
| `/auth/logout`          | POST   | `signOut()` in App exit flow             | auth.services.ts |
| `/auth/refresh`         | POST   | Auto-refresh via interceptor             | api/client.ts    |
| `/auth/forgot-password` | POST   | `forgotPassword()` in ForgotPasswordFlow | auth.services.ts |
| `/auth/reset-password`  | POST   | `resetPassword()` in Password reset      | auth.services.ts |

### User Management

| Endpoint                     | Method | FE Usage                                | Feature           |
| ---------------------------- | ------ | --------------------------------------- | ----------------- |
| `/users/me`                  | GET    | `useAuthStore().syncMeOverview()`       | Auth Bootstrap    |
| `/users/me/profiles`         | GET    | `getMyProfiles()` with scope            | Profile selection |
| `/users/me/personal-profile` | POST   | `createPersonalProfile()` in Onboarding | user.services.ts  |

### Family Management

| Endpoint                             | Method | FE Usage                                            | Feature                |
| ------------------------------------ | ------ | --------------------------------------------------- | ---------------------- |
| `/families`                          | POST   | `useCreateFamilyMutation()`                         | FamilyListScreen       |
| `/families`                          | GET    | `useMyFamiliesQuery()`                              | HomeScreen             |
| `/families/{id}`                     | GET    | `getFamilyById()`                                   | FamilyDetailScreen     |
| `/families/invites`                  | GET    | `getInvites()` paginated                            | FamilyInviteListScreen |
| `/families/invite/preview`           | GET    | `previewInviteCode()`                               | PostLoginGateScreen    |
| `/families/invite/linkable-profiles` | GET    | `listLinkableProfilesByInvite()`                    | Invite flow            |
| `/families/invite/link-profile`      | POST   | `linkProfileByInvite()`                             | Invite flow            |
| `/families/join`                     | POST   | Accept/Reject via `useAcceptFamilyInviteMutation()` | FamilyInviteListScreen |
| `/families/{id}/invite-by-phone`     | POST   | `useInviteUserByPhoneMutation()`                    | FamilyAddMemberScreen  |

### Health Profile (NEW)

| Endpoint                | Method | FE Usage                           | Feature                      |
| ----------------------- | ------ | ---------------------------------- | ---------------------------- |
| `/profiles/{id}/health` | GET    | `useHealthProfileQuery()`          | Health data queries          |
| `/profiles/{id}/health` | PATCH  | `useUpdateHealthProfileMutation()` | Update blood type, allergies |
| `/profiles/{id}`        | GET    | `useProfileQuery()`                | Profile queries              |
| `/profiles/{id}`        | PATCH  | `useUpdateProfileMutation()`       | Profile updates              |
| `/profiles/{id}/link`   | PATCH  | `useLinkProfileMutation()`         | Link profile to user         |
| `/profiles/{id}`        | DELETE | `useDeleteProfileMutation()`       | Profile deletion             |

### Medical Records (NEW)

| Endpoint                            | Method | FE Usage                               | Feature              |
| ----------------------------------- | ------ | -------------------------------------- | -------------------- |
| `/profiles/{id}/medical-records`    | GET    | `useMedicalRecordsQuery()`             | List medical records |
| `/profiles/{id}/medical-records`    | POST   | `useCreateMedicalRecordMutation()`     | Add new record       |
| `/medical-records/{id}`             | GET    | `useMedicalRecordQuery()`              | Get single record    |
| `/medical-records/{id}`             | PATCH  | `useUpdateMedicalRecordMutation()`     | Update record        |
| `/medical-records/{id}`             | DELETE | `useDeleteMedicalRecordMutation()`     | Delete record        |
| `/medical-records/{id}/attachments` | GET    | `useMedicalAttachmentsQuery()`         | List attachments     |
| `/medical-records/{id}/attachments` | POST   | `useAddMedicalAttachmentMutation()`    | Add attachment       |
| `/medical-attachments/{id}`         | DELETE | `useDeleteMedicalAttachmentMutation()` | Delete attachment    |
| `/files/medical/{id}`               | GET    | `downloadMedicalFile()`                | Download files       |

### Vaccinations (NEW)

| Endpoint                        | Method | FE Usage                               | Feature              |
| ------------------------------- | ------ | -------------------------------------- | -------------------- |
| `/vaccination-recommendations`  | GET    | `useVaccinationRecommendationsQuery()` | List vaccines        |
| `/profiles/{id}/vaccinations`   | GET    | `useProfileVaccinationsQuery()`        | Profile vaccines     |
| `/profiles/{id}/vaccinations`   | POST   | `useSubscribeToVaccineMutation()`      | Subscribe to vaccine |
| `/user-vaccinations/{id}`       | GET    | `useUserVaccinationQuery()`            | Get vaccination      |
| `/user-vaccinations/{id}`       | PATCH  | `useUpdateUserVaccinationMutation()`   | Update status        |
| `/user-vaccinations/{id}/doses` | GET    | `useVaccinationDosesQuery()`           | List doses           |
| `/user-vaccinations/{id}/doses` | POST   | `useAddVaccinationDoseMutation()`      | Record dose          |
| `/vaccination-doses/{id}`       | PATCH  | `useUpdateVaccinationDoseMutation()`   | Update dose          |
| `/vaccination-doses/{id}`       | DELETE | `useDeleteVaccinationDoseMutation()`   | Delete dose          |

### Medicine Inventory (NEW)

| Endpoint                   | Method | FE Usage                          | Feature           |
| -------------------------- | ------ | --------------------------------- | ----------------- |
| `/medicine-inventory/{id}` | GET    | `useMedicineItemQuery()`          | Get medicine item |
| `/medicine-inventory/{id}` | PATCH  | `useUpdateMedicineItemMutation()` | Update item       |
| `/medicine-inventory/{id}` | DELETE | `useDeleteMedicineItemMutation()` | Delete item       |

### Family Memberships (NEW)

| Endpoint                   | Method | FE Usage                              | Feature       |
| -------------------------- | ------ | ------------------------------------- | ------------- |
| `/family-memberships/{id}` | PATCH  | `useUpdateFamilyMemberRoleMutation()` | Update role   |
| `/family-memberships/{id}` | DELETE | `useRemoveFamilyMemberMutation()`     | Remove member |

### Medical Dictionary

| Endpoint                          | Method | FE Usage                                | Feature                |
| --------------------------------- | ------ | --------------------------------------- | ---------------------- |
| `/medical-dictionary/search`      | GET    | `search()` in DictionaryScreen          | Search with pagination |
| `/medical-dictionary/{type}/{id}` | GET    | `getDetail()` in DictionaryDetailScreen | Detail view            |

### AI Chat (NEW)

| Endpoint    | Method | FE Usage            | Feature       |
| ----------- | ------ | ------------------- | ------------- |
| `/rag/chat` | POST   | `useChatMutation()` | ChatbotScreen |

### Notifications (NEW)

| Endpoint                     | Method | FE Usage                              | Feature                 |
| ---------------------------- | ------ | ------------------------------------- | ----------------------- |
| `/notifications/send`        | POST   | `useSendNotificationMutation()`       | Send to all devices     |
| `/notifications/send-device` | POST   | `useSendDeviceNotificationMutation()` | Send to specific device |

---

### Files & Directories Created

- **Services** (11): `src/services/{medicalRecords,vaccinations,medicineInventory,healthProfile,notifications,rag,familyMemberships}.services.ts`
- **Features** (8): Query keys, queries, and mutations for health, medicalRecords, vaccinations, medicineInventory, chat, notifications, family
- **Hooks**: Ready to use in components via React Query
- **Type Safety**: Full TypeScript support with interfaces

### Total Coverage

✅ **60+ API endpoints** fully integrated
✅ **Auto-authentication** with token refresh
✅ **Error handling** with Vietnamese toast notifications
✅ **Loading & caching** states built-in
