import { router } from 'expo-router';
import RecordsScreen from '@/src/screens/health/RecordsScreen';

export default function MemberRecordsRoute() {
    return <RecordsScreen onClose={() => router.back()} />;
}
