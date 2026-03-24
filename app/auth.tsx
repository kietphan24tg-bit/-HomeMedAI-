import { useLocalSearchParams } from 'expo-router';
import AuthScreen from '@/src/screens/auth/AuthScreen';

export default function AuthRoute() {
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    const initialMode = mode === 'signup' ? 'signup' : 'signin';

    return <AuthScreen initialMode={initialMode} />;
}
