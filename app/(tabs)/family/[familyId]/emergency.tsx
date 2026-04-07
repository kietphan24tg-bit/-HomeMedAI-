import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import FamilyEmergencyScreen from '@/src/screens/family/FamilyEmergencyScreen';

export default function FamilyEmergencyRoute() {
    const { familyId } = useLocalSearchParams();
    return <FamilyEmergencyScreen familyId={familyId as string} />;
}
