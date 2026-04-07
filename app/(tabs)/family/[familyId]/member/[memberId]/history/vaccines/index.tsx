import { router } from 'expo-router';
import VaccineScreen from '@/src/screens/health/VaccineScreen';

export default function MemberVaccinesRoute() {
    return <VaccineScreen onClose={() => router.back()} />;
}
