import { GoogleSignin } from '@react-native-google-signin/google-signin';

/**
 * Khởi tạo Google Sign-In — gọi 1 lần khi app khởi động (trong AuthScreen).
 */
export function configureGoogleSignIn() {
    GoogleSignin.configure({
        // Web Client ID (Server Client ID) — dùng để backend verify idToken
        webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
        // iOS Client ID (chỉ cần khi build iOS)
        iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
        // false = không cần server-side access, chỉ cần idToken phía client
        offlineAccess: false,
        // Luôn show account picker để user có thể chọn đúng tài khoản
        forceCodeForRefreshToken: false,
    });
}

export { GoogleSignin };
