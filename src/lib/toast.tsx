import { Alert, Platform, ToastAndroid } from 'react-native';

type ShowToastParams = {
    title: string;
    description?: string;
    duration?: number;
};
function getAndroidDuration(duration?: number) {
    return duration && duration > 3500 ? ToastAndroid.LONG : ToastAndroid.SHORT;
}

function showToast({ title, description, duration }: ShowToastParams) {
    const message = description ? `${title}\n${description}` : title;

    if (Platform.OS === 'android') {
        ToastAndroid.show(message, getAndroidDuration(duration));
        return;
    }

    Alert.alert(title, description);
}

export const appToast = {
    showSuccess: (title: string, description?: string, duration?: number) =>
        showToast({ title, description, duration }),
    showError: (title: string, description?: string, duration?: number) =>
        showToast({ title, description, duration }),
    showWarning: (title: string, description?: string, duration?: number) =>
        showToast({ title, description, duration }),
    showInfo: (title: string, description?: string, duration?: number) =>
        showToast({ title, description, duration }),
};
