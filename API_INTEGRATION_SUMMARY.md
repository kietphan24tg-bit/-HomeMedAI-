# API Integration: `/users/me` Endpoint

## Overview

The HealthScreen now properly fetches and displays health data from the backend `/users/me` API endpoint with comprehensive data sanitization and error handling.

---

## Data Flow

### 1. **API Call Layer**

```
GET /users/me
└─ authService.fetchMe()
   └─ apiClient.get('/users/me')
```

**Location**: `src/services/auth.services.ts`

### 2. **Data Normalization & Sanitization**

```
meService.getOverview()
└─ authService.fetchMe()
   └─ normalizeMeOverview(data)
      ├─ sanitizeProfile(profile)
      │  └─ Converts bad numeric strings (height_cm, weight_kg)
      │  └─ Returns null for invalid data
      │
      └─ sanitizeHealthProfile(healthProfile)
         ├─ sanitizeMedicineInventory()
         │  └─ Fixes: quantity_stock, dosage_value, etc.
         │
         └─ Filters & validates all arrays
```

**Location**: `src/features/me/types.ts` (Lines 1-300)

### 3. **React Query Hook**

```
useMeOverviewQuery()
└─ queryKey: ['me', 'overview']
└─ staleTime: 10 minutes
└─ cacheTime: 60 minutes
```

**Location**: `src/features/me/queries.ts`

### 4. **HealthScreen Component**

```
HealthScreen.tsx
└─ const { data: meOverview, isLoading, error } = useMeOverviewQuery()
   ├─ Debug logging (if __DEV__)
   ├─ Loading indicator (with "📡 Đang tải dữ liệu từ máy chủ...")
   ├─ Error indicator (if request fails)
   └─ Display health data with formatNumericDisplay()
```

**Location**: `src/screens/health/HealthScreen.tsx` (Line 328)

---

## Data Sanitization Features

### Numeric Field Handling

Backend can send bad numeric data:

```json
{
    "height_cm": "000000000000...95453319052480",
    "weight_kg": "-055043768959306...",
    "quantity_stock": "000000000340207771...",
    "dosage_value": "+0000000000...66468732442270240680"
}
```

**Sanitization Process**:

```typescript
safeParseNumeric(value: unknown): number | null
├─ Skip if string length > 50 (corrupted data detection)
├─ Parse with parseFloat()
├─ Validate with Number.isFinite()
└─ Return null if invalid
```

**Display Format**:

```typescript
formatNumericDisplay(value, precision): string
├─ Call safeParseNumeric(value)
├─ If valid: return value.toFixed(precision)
└─ If invalid: return "-- (Không rõ)"
```

### Example:

```tsx
// Before: Shows raw bad string
{
    height;
} // "000000000...95453"

// After: Shows formatted or error placeholder
{
    formatNumericDisplay(height, 0);
}
cm; // "178 cm" or "-- (Không rõ)"
```

---

## Data Normalization Rules

### Profile Priority

```
response.profile (if available)
└─ Fallback to response.profiles[0]?.profile
   └─ Fallback to null
```

### Health Profile Priority

```
response.health_profile (if available)
└─ Fallback to response.profiles[0]?.health_profile
   └─ Fallback to null
```

### Array Filtering

- Removes null/undefined entries
- Filters out empty strings from string arrays
- Validates object structures
- Example: `chronic_diseases` only includes non-empty strings

---

## Error Handling

### Loading State

```tsx
{isLoading && (
    <View style={{...}}>
        <Text>📡 Đang tải dữ liệu từ máy chủ...</Text>
    </View>
)}
```

### Error State

```tsx
{error && (
    <View style={{...}}>
        <Text>⚠️ Lỗi: {error?.message || 'Không thể tải dữ liệu'}</Text>
    </View>
)}
```

### Debug Logging (Development only)

```typescript
if (__DEV__) {
    console.log('[HealthScreen] Loading data from /users/me...');
    console.error('[HealthScreen] Error fetching /users/me:', error);
    console.log('[HealthScreen] ✅ API data received:', {...});
}
```

---

## Utility Functions (Exported)

### `safeParseNumeric(value: unknown): number | null`

Safely parse numeric values, returns null for bad data.

### `formatNumericDisplay(value: unknown, precision = 1): string`

Format numeric values for display, returns `"-- (Không rõ)"` for invalid data.

### `ERROR_PLACEHOLDER: string`

Constant: `"-- (Không rõ)"`

**Location**: `src/features/me/types.ts` (Lines 468-470)

---

## Usage Examples

### Basic Data Display

```tsx
const { data: meOverview } = useMeOverviewQuery();
const profile = meOverview?.profile;
const height = profile?.height_cm; // Already sanitized

// Display with safe formatting
<Text>{formatNumericDisplay(height, 0)} cm</Text>;
```

### Component Integration

```tsx
// In HealthScreen.tsx
const height = numberValue(profile.height_cm);
const weight = numberValue(profile.weight_kg);
const bmi = calculateBmi(height, weight);

// Display safely
<Text>
    {formatNumericDisplay(height, 0)} cm · {formatNumericDisplay(weight, 1)} kg
</Text>;
```

---

## Testing the Integration

### Check API Response

Open DevTools and look for console logs in development:

```
[HealthScreen] Loading data from /users/me...
[HealthScreen] ✅ API data received: {...}
```

### Verify Sanitization

Look for any console warnings about skipped numeric strings:

```
[Data Sanitization] Skipping excessively long numeric string: 000000000...
```

### Verify Display

- Blood type: Shows value or `"-- (Không rõ)"`
- Height/Weight: Shows formatted values or `"-- (Không rõ)"`
- Chronic diseases: Shows valid diseases only
- Medicines: Shows list properly formatted

---

## Backend Response Structure

The API returns this structure:

```json
{
  "user": { ... },
  "profile": { ... },
  "health_profile": { ... },
  "profiles": [
    {
      "profile": { ... },
      "health_profile": { ... },
      "family_ids": [ ... ]
    }
  ],
  "post_login_flow_completed": boolean
}
```

---

## Common Issues & Solutions

| Issue                                | Solution                                                              |
| ------------------------------------ | --------------------------------------------------------------------- |
| Numbers showing as error placeholder | Check console for "Skipping excessively long numeric string" warnings |
| API not being called                 | Check: Network tab, React Query DevTools, console logs                |
| Stale data                           | Data refreshes every 10 minutes or call `refetch()` manually          |
| Loading indicator stuck              | Check network request status, verify API response                     |

---

## Files Modified

1. **`src/features/me/types.ts`**
    - Added: `safeParseNumeric()`, `formatNumericDisplay()`
    - Added: `sanitizeProfile()`, `sanitizeHealthProfile()`, `sanitizeMedicineInventory()`
    - Updated: `normalizeMeOverview()` to apply sanitization

2. **`src/screens/health/HealthScreen.tsx`**
    - Imported: `formatNumericDisplay`, `ERROR_PLACEHOLDER`
    - Added: Loading/error states with visual indicators
    - Added: Debug logging for API responses
    - Updated: BMI section to use `formatNumericDisplay()`

---

## Next Steps

1. ✅ API integration complete
2. ✅ Data sanitization implemented
3. ✅ Error handling added
4. ✅ Loading states displayed
5. ⏭️ Consider: Add manual refresh button
6. ⏭️ Consider: Add offline caching
7. ⏭️ Consider: Add data validation toast notifications
