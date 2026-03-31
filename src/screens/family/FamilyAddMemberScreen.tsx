import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, gradients } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import { MethodCard, RoleSelectionModal, SectionLabel } from './familyShared';
import { styles } from './styles';

export default function FamilyAddMemberScreen({
    family,
}: {
    family: FamilyGroup;
}): React.JSX.Element {
    const [showRoleSheet, setShowRoleSheet] = useState(false);
    const [selectedInviteRole, setSelectedInviteRole] = useState<string | null>(
        null,
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar
                barStyle='light-content'
                backgroundColor='transparent'
                translucent
            />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: 36 },
                ]}
            >
                <LinearGradient
                    colors={gradients.family}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.inviteHero}
                >
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name='chevron-back' size={14} color='#fff' />
                        <Text style={styles.backBtnText}>Gia đình</Text>
                    </Pressable>
                    <Text style={styles.inviteTitle}>Thêm thành viên</Text>
                    <Text
                        style={[
                            styles.detailSub,
                            { color: 'rgba(255,255,255,0.72)' },
                        ]}
                    >
                        {family.name}
                    </Text>
                </LinearGradient>

                <SectionLabel title='Đã có tài khoản CareSync' />

                <MethodCard
                    icon='call-outline'
                    iconColor={colors.primary}
                    iconBg={colors.primaryBg}
                    title='Tìm bằng số điện thoại'
                    subtitle='Nhập SĐT người thân đã có tài khoản CareSync'
                    onPress={() =>
                        router.push(`/(tabs)/family/${family.id}/search-phone`)
                    }
                />

                <SectionLabel title='Chưa có tài khoản' />

                <MethodCard
                    icon='person-add-outline'
                    iconColor={colors.cFamily}
                    iconBg={colors.secondaryBg}
                    title='Tạo hồ sơ người thân'
                    subtitle='Dành cho người chưa dùng CareSync, bạn sẽ quản lý hộ'
                    onPress={() => setShowRoleSheet(true)}
                />
            </ScrollView>

            <RoleSelectionModal
                visible={showRoleSheet}
                selectedRole={selectedInviteRole}
                onSelectRole={setSelectedInviteRole}
                onClose={() => setShowRoleSheet(false)}
            />
        </SafeAreaView>
    );
}
