import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import FamilyAddMemberScreen from '@/src/screens/family/FamilyAddMemberScreen';
import { getFamilyById } from '@/src/screens/family/familyShared';

export default function FamilyAddMemberRoute() {
    const { familyId } = useLocalSearchParams<{ familyId: string }>();
    const family = getFamilyById(familyId);

    if (!family) {
        return (
            <View>
                <Text>Không tìm thấy gia đình.</Text>
            </View>
        );
    }

    return <FamilyAddMemberScreen family={family} />;
}
