import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Clipboard,
    FlatList,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useCreateProfileInFamilyMutation,
    useRotateInviteMutation,
} from '@/src/features/family/mutations';
import { appToast } from '@/src/lib/toast';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { formSystem } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import { MethodCard, ROLE_OPTIONS } from './familyShared';
import { styles } from './styles';

function SectionTitle({ title, top = 18 }: { title: string; top?: number }) {
    return (
        <View
            style={{
                paddingHorizontal: scale(20),
                marginTop: verticalScale(top),
                marginBottom: verticalScale(8),
            }}
        >
            <Text style={formSystem.sectionTitle}>{title}</Text>
        </View>
    );
}

export default function FamilyAddMemberScreen({
    family,
}: {
    family: FamilyGroup;
}): React.JSX.Element {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [proxyFullName, setProxyFullName] = useState('');
    const [proxyRelationId, setProxyRelationId] = useState<string | null>(null);

    const rotateMutation = useRotateInviteMutation();
    const createProfileMutation = useCreateProfileInFamilyMutation();

    const handleRotate = async () => {
        try {
            await rotateMutation.mutateAsync({ familyId: family.id });
        } catch {
            // Error handled by mutation
        }
    };

    const handleCopy = (code: string) => {
        Clipboard.setString(code);
        appToast.showSuccess('Thành công', 'Đã sao chép mã mời.');
    };

    const submitProxyProfile = async () => {
        const name = proxyFullName.trim();
        if (!name || !proxyRelationId) {
            appToast.showError(
                'Thiếu thông tin',
                'Nhập họ tên và chọn vai trò.',
            );
            return;
        }
        const rel = ROLE_OPTIONS.find((r) => r.id === proxyRelationId);
        try {
            await createProfileMutation.mutateAsync({
                familyId: family.id,
                data: {
                    role: 'MEMBER',
                    relation_role: rel?.label ?? 'Người thân',
                    full_name: name,
                },
            });
            setCreateModalOpen(false);
            setProxyFullName('');
            setProxyRelationId(null);
        } catch {
            /* handled in mutation */
        }
    };

    const heroColor = family.gradientColors?.[0] ?? '#1A7F6D';

    return (
        <SafeAreaView
            edges={['left', 'right', 'bottom']}
            style={styles.container}
        >
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
                <View
                    style={[
                        styles.inviteHero,
                        {
                            backgroundColor: heroColor,
                        },
                    ]}
                >
                    <SafeAreaView
                        edges={['top']}
                        style={{ backgroundColor: heroColor }}
                    />
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name='chevron-back' size={14} color='#fff' />
                        <Text style={styles.backBtnText}>Gia đình</Text>
                    </Pressable>
                    <View style={styles.inviteHeroInner}>
                        <Text style={styles.inviteTitle}>Thêm thành viên</Text>
                        <Text
                            style={[
                                styles.detailSub,
                                { color: 'rgba(255,255,255,0.72)' },
                            ]}
                        >
                            {family.name}
                        </Text>
                    </View>
                </View>

                <SectionTitle title='Mã mời' top={16} />
                <View style={{ paddingHorizontal: scale(20) }}>
                    <View style={styles.linkBox}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.linkLabel}>
                                Mã mời gia đình
                            </Text>
                            <Text
                                style={
                                    family.invite_code
                                        ? styles.linkText
                                        : styles.linkPlaceholderText
                                }
                                numberOfLines={family.invite_code ? 1 : 2}
                            >
                                {family.invite_code ||
                                    'Chia sẻ mã để liên kết thành viên'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: scale(8) }}>
                            <Pressable
                                style={[
                                    styles.linkActionBtn,
                                    { backgroundColor: colors.primary },
                                ]}
                                onPress={() =>
                                    handleCopy(family.invite_code || '')
                                }
                            >
                                <Ionicons
                                    name='copy-outline'
                                    size={20}
                                    color='#fff'
                                />
                            </Pressable>
                        </View>
                    </View>
                </View>

                <SectionTitle title='Đã có tài khoản HomeMedAI' />

                <MethodCard
                    icon='call-outline'
                    iconColor={colors.primary}
                    iconBg={colors.primaryBg}
                    title='Tìm bằng số điện thoại'
                    subtitle='Nhập SĐT người thân đã có tài khoản HomeMedAI'
                    style={{ marginBottom: 0 }}
                    onPress={() =>
                        router.push(`/family/${family.id}/search-phone`)
                    }
                />

                <SectionTitle title='Chưa có tài khoản' />

                <MethodCard
                    icon='person-add-outline'
                    iconColor={colors.secondary}
                    iconBg={colors.secondaryBg}
                    title='Tạo hồ sơ người thân'
                    subtitle='Dành cho người chưa dùng HomeMedAI, bạn sẽ quản lý hộ'
                    style={{ marginBottom: verticalScale(12) }}
                    onPress={() => setCreateModalOpen(true)}
                />
            </ScrollView>

            <Modal
                visible={createModalOpen}
                transparent
                animationType='slide'
                onRequestClose={() => setCreateModalOpen(false)}
            >
                <Pressable
                    style={createModalStyles.overlay}
                    onPress={() => setCreateModalOpen(false)}
                >
                    <Pressable
                        style={createModalStyles.sheet}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text style={createModalStyles.title}>
                            Tạo hồ sơ người thân
                        </Text>
                        <Text style={createModalStyles.label}>Họ và tên</Text>
                        <TextInput
                            value={proxyFullName}
                            onChangeText={setProxyFullName}
                            placeholder='Ví dụ: Nguyễn Văn A'
                            placeholderTextColor={colors.text3}
                            style={createModalStyles.input}
                        />
                        <Text
                            style={[createModalStyles.label, { marginTop: 14 }]}
                        >
                            Vai trò trong gia đình
                        </Text>
                        <FlatList
                            data={[...ROLE_OPTIONS]}
                            keyExtractor={(item) => item.id}
                            style={{ maxHeight: verticalScale(220) }}
                            renderItem={({ item }) => {
                                const selected = proxyRelationId === item.id;
                                return (
                                    <Pressable
                                        onPress={() =>
                                            setProxyRelationId(item.id)
                                        }
                                        style={[
                                            createModalStyles.roleRow,
                                            selected
                                                ? createModalStyles.roleRowOn
                                                : null,
                                        ]}
                                    >
                                        <Text
                                            style={createModalStyles.roleEmoji}
                                        >
                                            {item.emoji}
                                        </Text>
                                        <Text
                                            style={createModalStyles.roleLabel}
                                        >
                                            {item.label}
                                        </Text>
                                    </Pressable>
                                );
                            }}
                        />
                        <Pressable
                            style={[
                                createModalStyles.submit,
                                createProfileMutation.isPending ||
                                !proxyFullName.trim() ||
                                !proxyRelationId
                                    ? { opacity: 0.5 }
                                    : null,
                            ]}
                            disabled={
                                createProfileMutation.isPending ||
                                !proxyFullName.trim() ||
                                !proxyRelationId
                            }
                            onPress={submitProxyProfile}
                        >
                            {createProfileMutation.isPending ? (
                                <ActivityIndicator color='#fff' />
                            ) : (
                                <Text style={createModalStyles.submitText}>
                                    Tạo hồ sơ
                                </Text>
                            )}
                        </Pressable>
                        <Pressable
                            style={createModalStyles.cancelBtn}
                            onPress={() => setCreateModalOpen(false)}
                        >
                            <Text style={createModalStyles.cancelText}>
                                Hủy
                            </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const createModalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.45)',
        justifyContent: 'flex-end',
    },
    sheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(18),
        paddingBottom: verticalScale(24),
        maxHeight: '90%',
    },
    title: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(18),
        color: colors.text,
        marginBottom: verticalScale(12),
    },
    label: {
        ...formSystem.fieldLabel,
        marginBottom: verticalScale(6),
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(12),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(15),
        color: colors.text,
    },
    roleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(12),
        borderRadius: 12,
        marginBottom: verticalScale(6),
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.bg,
    },
    roleRowOn: {
        borderColor: colors.text2,
        backgroundColor: colors.card,
    },
    roleEmoji: { fontSize: 20 },
    roleLabel: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    submit: {
        backgroundColor: colors.primary,
        borderRadius: 14,
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        marginTop: verticalScale(16),
    },
    submitText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: '#fff',
    },
    cancelBtn: {
        marginTop: verticalScale(12),
        alignItems: 'center',
        paddingVertical: verticalScale(8),
    },
    cancelText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text2,
    },
});
