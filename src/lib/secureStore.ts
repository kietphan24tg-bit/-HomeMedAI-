import * as ExpoSecureStore from 'expo-secure-store';

const DELETE_SENTINEL = '__hm_deleted__';
const memoryStore = new Map<string, string>();

type SecureStoreOptions = Parameters<typeof ExpoSecureStore.getItemAsync>[1];

function isMissingMethodError(error: unknown, methodName: string): boolean {
    return error instanceof TypeError && error.message.includes(methodName);
}

export async function getItemAsync(
    key: string,
    options?: SecureStoreOptions,
): Promise<string | null> {
    try {
        const value = await ExpoSecureStore.getItemAsync(key, options);
        return value === DELETE_SENTINEL ? null : value;
    } catch (error) {
        if (isMissingMethodError(error, 'getValueWithKeyAsync')) {
            return memoryStore.get(key) ?? null;
        }

        throw error;
    }
}

export async function setItemAsync(
    key: string,
    value: string,
    options?: SecureStoreOptions,
): Promise<void> {
    try {
        await ExpoSecureStore.setItemAsync(key, value, options);
    } catch (error) {
        if (isMissingMethodError(error, 'setValueWithKeyAsync')) {
            memoryStore.set(key, value);
            return;
        }

        throw error;
    }
}

export async function deleteItemAsync(
    key: string,
    options?: SecureStoreOptions,
): Promise<void> {
    try {
        await ExpoSecureStore.deleteItemAsync(key, options);
    } catch (error) {
        if (isMissingMethodError(error, 'deleteValueWithKeyAsync')) {
            try {
                await ExpoSecureStore.setItemAsync(
                    key,
                    DELETE_SENTINEL,
                    options,
                );
            } catch (setError) {
                if (!isMissingMethodError(setError, 'setValueWithKeyAsync')) {
                    throw setError;
                }
            }

            memoryStore.delete(key);
            return;
        }

        if (isMissingMethodError(error, 'setValueWithKeyAsync')) {
            memoryStore.delete(key);
            return;
        }

        if (!isMissingMethodError(error, 'deleteValueWithKeyAsync')) {
            throw error;
        }
    }
}
