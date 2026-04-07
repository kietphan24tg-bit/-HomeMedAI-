import { useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useFamilyQuery } from '@/src/features/family/queries';
import FamilyMemberDetailScreen from '@/src/screens/family/FamilyMemberDetailScreen';

export default function FamilyMemberRoute() {
    const { familyId, memberId, tab } = useLocalSearchParams<{
        familyId: string;
        memberId: string;
        tab?: string;
    }>();
    const { data: family, isLoading } = useFamilyQuery(familyId);

    if (isLoading) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text>Đang tải...</Text>
            </View>
        );
    }

    if (!family) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text>Không tìm thấy gia đình.</Text>
            </View>
        );
    }

    const member = family.members.find(
        (m: any) => String(m.id) === String(memberId),
    );

    if (!member) {
        return (
            <View
                style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Text>Không tìm thấy thành viên.</Text>
            </View>
        );
    }

    return (
        <FamilyMemberDetailScreen
            family={family}
            member={member}
            initialTab={tab as any}
        />
    );
}
