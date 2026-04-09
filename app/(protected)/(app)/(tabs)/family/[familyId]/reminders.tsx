import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import FamilyRemindersScreen from '@/src/screens/family/FamilyRemindersScreen';

export default function FamilyRemindersRoute() {
    const { familyId } = useLocalSearchParams();
    return <FamilyRemindersScreen familyId={familyId as string} />;
}
