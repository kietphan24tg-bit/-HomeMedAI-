import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import FamilyMemberDetailScreen from '@/src/screens/family/FamilyMemberDetailScreen';
import {
    getFamilyById,
    getMemberById,
} from '@/src/screens/family/familyShared';

export default function FamilyMemberRoute() {
    const { familyId, memberId } = useLocalSearchParams<{
        familyId: string;
        memberId: string;
    }>();
    const family = getFamilyById(familyId);
    const member = getMemberById(familyId, memberId);

    if (!family || !member) {
        return (
            <View>
                <Text>Không tìm thấy thành viên.</Text>
            </View>
        );
    }

    return <FamilyMemberDetailScreen family={family} member={member} />;
}
