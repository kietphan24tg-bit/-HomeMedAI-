import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import FamilySearchPhoneScreen from '@/src/screens/family/FamilySearchPhoneScreen';
import { getFamilyById } from '@/src/screens/family/familyShared';

export default function FamilySearchPhoneRoute() {
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const family = getFamilyById(familyId);

    if (!family) {
        return (
            <View>
                <Text>Không tìm thấy gia đình.</Text>
            </View>
        );
    }

    return <FamilySearchPhoneScreen family={family} />;
}
