import Constants from 'expo-constants';
import { Platform } from 'react-native';
import * as SecureStore from '@/src/lib/secureStore';

const DEVICE_ID_KEY = 'device_installation_id';

function createFallbackDeviceId() {
    return `${Platform.OS}-${Date.now().toString(36)}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

async function getDeviceId() {
    const storedId = await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (storedId) {
        return storedId;
    }

    const nextId = createFallbackDeviceId();

    await SecureStore.setItemAsync(DEVICE_ID_KEY, nextId).catch((error) => {
        console.log(error);
    });

    return nextId;
}

export async function getDeviceMetadata() {
    const device_id = await getDeviceId();
    const device_name =
        Constants.deviceName?.trim() ||
        (Platform.OS === 'web' ? 'Web Browser' : 'Expo Device');

    return {
        device_id,
        device_name,
        platform: Platform.OS,
    };
}
