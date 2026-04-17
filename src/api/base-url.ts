import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_DEV_API_PORT = '8080';

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '');
}

function getExpoHostFromConstants() {
    const expoConfigHost = Constants.expoConfig?.hostUri;
    if (expoConfigHost) {
        return expoConfigHost.split(':')[0];
    }

    const expoGoConfig = Constants as unknown as {
        expoGoConfig?: { debuggerHost?: string };
    };
    const debuggerHost = expoGoConfig.expoGoConfig?.debuggerHost;

    if (debuggerHost) {
        return debuggerHost.split(':')[0];
    }

    return null;
}

function normalizeLocalhostForAndroid(url: string) {
    if (Platform.OS !== 'android') {
        return url;
    }

    return url
        .replace('://localhost', '://10.0.2.2')
        .replace('://127.0.0.1', '://10.0.2.2');
}

function parseUrl(value: string) {
    try {
        return new URL(value);
    } catch {
        return null;
    }
}

export function resolveAndroidLoopbackFallbackUrl(baseUrl: string) {
    const parsed = parseUrl(baseUrl);
    if (!parsed) {
        return null;
    }

    const hostname = parsed.hostname.toLowerCase();
    if (hostname === '10.0.2.2') {
        return null;
    }

    // Android emulator reaches host machine through 10.0.2.2.
    parsed.hostname = '10.0.2.2';
    return trimTrailingSlash(parsed.toString());
}

export function resolveApiBaseUrl() {
    const envBaseUrl = process.env.EXPO_PUBLIC_BE_URL?.trim();

    if (envBaseUrl) {
        return normalizeLocalhostForAndroid(trimTrailingSlash(envBaseUrl));
    }

    const expoHost = getExpoHostFromConstants();
    if (expoHost) {
        return `http://${expoHost}:${DEFAULT_DEV_API_PORT}`;
    }

    return `http://localhost:${DEFAULT_DEV_API_PORT}`;
}
