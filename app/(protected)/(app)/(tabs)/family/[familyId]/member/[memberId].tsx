import { Redirect, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';
import { useFamilyQuery } from '@/src/features/family/queries';
import FamilyMemberDetailScreen from '@/src/screens/family/FamilyMemberDetailScreen';

export default function FamilyMemberRoute() {
    const { familyId, memberId, tab } = useLocalSearchParams<{
        familyId: string;
        memberId: string;
        tab?: string;
    }>();
    const normalizedFamilyId =
        typeof familyId === 'string' ? familyId : (familyId?.[0] ?? '');
    const normalizedMemberId =
        typeof memberId === 'string' ? memberId : (memberId?.[0] ?? '');
    const { data: family, isLoading } = useFamilyQuery(normalizedFamilyId);

    if (!normalizedFamilyId) {
        return <Redirect href='/family' />;
    }

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
        return <Redirect href='/family' />;
    }

    const member = family.members.find(
        (m: any) => String(m.id) === String(normalizedMemberId),
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
