import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import StatePanel from '@/src/components/state/StatePanel';
import { useFamilyQuery } from '@/src/features/family/queries';
import FamilyDetailScreen from '@/src/screens/family/FamilyDetailScreen';
import { colors } from '@/src/styles/tokens';

export default function FamilyDetailRoute() {
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const { data: family, isLoading, isError } = useFamilyQuery(familyId);

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
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: colors.bg,
                    justifyContent: 'center',
                }}
            >
                <StatePanel
                    variant='empty'
                    title='Không tìm thấy gia đình'
                    message='Gia đình này không còn tồn tại hoặc dữ liệu chưa sẵn sàng.'
                />
            </View>
        );
    }

    return <FamilyDetailScreen family={family} />;
}
