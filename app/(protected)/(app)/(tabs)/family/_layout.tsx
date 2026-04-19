import { Stack } from 'expo-router';
import { MOTION_PRESETS } from '@/src/navigation/motion';

export default function FamilyLayout() {
    return (
        <Stack
            screenOptions={{
                ...MOTION_PRESETS.root,
                ...MOTION_PRESETS.drillDown,
            }}
        >
            <Stack.Screen name='index' options={MOTION_PRESETS.tabEntry} />
            <Stack.Screen name='invites' options={MOTION_PRESETS.modal} />
            <Stack.Screen
                name='[familyId]'
                options={MOTION_PRESETS.drillDown}
            />
            <Stack.Screen
                name='[familyId]/add-member'
                options={MOTION_PRESETS.drillDown}
            />
            <Stack.Screen
                name='[familyId]/search-phone'
                options={MOTION_PRESETS.drillDown}
            />
            <Stack.Screen
                name='[familyId]/member/[memberId]'
                options={MOTION_PRESETS.drillDown}
            />
            <Stack.Screen
                name='[familyId]/member/[memberId]/history'
                options={MOTION_PRESETS.drillDown}
            />
            <Stack.Screen
                name='[familyId]/medicine'
                options={MOTION_PRESETS.drillDown}
            />
        </Stack>
    );
}
