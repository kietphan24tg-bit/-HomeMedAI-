import { Redirect, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import StatePanel from '@/src/components/state/StatePanel';
import { useFamilyQuery } from '@/src/features/family/queries';
import FamilyDetailScreen from '@/src/screens/family/FamilyDetailScreen';
import { colors } from '@/src/styles/tokens';

export default function FamilyDetailRoute() {
    const { familyId: familyIdParam } = useLocalSearchParams<{
        familyId?: string | string[];
    }>();
    const familyId =
        typeof familyIdParam === 'string'
            ? familyIdParam
            : (familyIdParam?.[0] ?? '');
    const { data: family, isLoading, isError } = useFamilyQuery(familyId);

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

    if (isError || !family) {
        return <Redirect href='/family' />;
    }

    return <FamilyDetailScreen family={family} />;
}
