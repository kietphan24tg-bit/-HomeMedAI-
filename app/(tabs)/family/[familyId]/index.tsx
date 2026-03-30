import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import FamilyDetailScreen from '@/src/screens/family/FamilyDetailScreen';
import { getFamilyById } from '@/src/screens/family/familyShared';

export default function FamilyDetailRoute() {
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const family = getFamilyById(familyId);

    if (!family) {
        return (
            <View>
                <Text>Không tìm thấy gia đình.</Text>
            </View>
        );
    }

    return <FamilyDetailScreen family={family} />;
}
