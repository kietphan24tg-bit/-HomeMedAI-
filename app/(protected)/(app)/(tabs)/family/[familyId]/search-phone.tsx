import { Redirect, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import StatePanel from '@/src/components/state/StatePanel';
import { useFamilyQuery } from '@/src/features/family/queries';
import FamilySearchPhoneScreen from '@/src/screens/family/FamilySearchPhoneScreen';
import { colors } from '@/src/styles/tokens';

export default function FamilySearchPhoneRoute() {
    const { familyId: familyIdParam } = useLocalSearchParams<{
        familyId?: string | string[];
    }>();
    const familyId =
        typeof familyIdParam === 'string'
            ? familyIdParam
            : (familyIdParam?.[0] ?? '');
    const { data: family, isLoading } = useFamilyQuery(familyId);

    if (!familyId) {
        return <Redirect href='/family' />;
    }

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.bg,
                    justifyContent: 'center',
                }}
            >
                <StatePanel
                    variant='loading'
                    title='Đang tải dữ liệu gia đình...'
                />
            </View>
        );
    }

    if (!family) {
        return <Redirect href='/family' />;
    }

    return <FamilySearchPhoneScreen family={family} />;
}
