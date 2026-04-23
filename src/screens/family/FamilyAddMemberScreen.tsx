import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { useCreateProfileInFamilyMutation } from '@/src/features/family/mutations';
import { getApiErrorStatus } from '@/src/lib/api-error';
import { appToast } from '@/src/lib/toast';
import { familiesServices } from '@/src/services/families.services';
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
    const [inviteCode, setInviteCode] = useState(
        family.invite_code?.trim() ?? '',
    );
    const [checkingInviteCode, setCheckingInviteCode] = useState(false);

    const createProfileMutation = useCreateProfileInFamilyMutation();
    const isOwner = family.familyRole === 'OWNER';

    const rotateInviteCode = async ({
        showAutoMessage = false,
    }: {
        showAutoMessage?: boolean;
    } = {}) => {
        if (!isOwner) {
            appToast.showInfo(
                'Mã mời đã hết hạn',
                'Vui lòng nhờ chủ gia đình làm mới mã mời để tiếp tục mời thành viên.',
            );
            return false;
        }

        try {
            const rotated = await familiesServices.rotateInviteCode(family.id);
            const nextCode =
                typeof rotated?.invite_code === 'string'
                    ? rotated.invite_code.trim()
                    : '';

            if (!nextCode) {
                appToast.showError(
                    'Lỗi',
                    'Đã làm mới nhưng chưa nhận được mã mời mới. Vui lòng thử lại.',
                );
                return false;
            }

            setInviteCode(nextCode);
            if (showAutoMessage) {
                appToast.showInfo(
                    'Đã làm mới mã mời',
                    'Mã mời cũ đã hết hạn nên hệ thống đã tạo mã mới.',
                );
            } else {
                appToast.showSuccess('Thành công', 'Đã làm mới mã mời.');
            }
            return true;
        } catch (error) {
            const status = getApiErrorStatus(error);
            if (status === 403) {
                appToast.showError(
                    'Không đủ quyền',
                    'Chỉ chủ gia đình mới có thể làm mới mã mời.',
                );
                return false;
            }
            appToast.showError('Lỗi', 'Không thể làm mới mã mời lúc này.');
            return false;
        }
    };

    useEffect(() => {
        let cancelled = false;

        const ensureInviteCodeActive = async () => {
            const sourceCode = family.invite_code?.trim() ?? '';
            setInviteCode(sourceCode);

            if (!sourceCode) {
                return;
            }

            setCheckingInviteCode(true);
            try {
                const preview =
                    await familiesServices.previewInviteCode(sourceCode);

                if (cancelled) {
                    return;
                }

                if (preview.valid) {
                    setInviteCode(preview.invite_code?.trim() || sourceCode);
                    return;
                }

                await rotateInviteCode({ showAutoMessage: true });
            } catch (error) {
                if (cancelled) {
                    return;
                }
                const status = getApiErrorStatus(error);
                if (status === 404 || status === 410) {
                    await rotateInviteCode({ showAutoMessage: true });
                    return;
                }
                appToast.showError(
                    'Không kiểm tra được mã mời',
                    'Vui lòng kiểm tra kết nối mạng và thử lại.',
                );
            } finally {
                if (!cancelled) {
                    setCheckingInviteCode(false);
                }
            }
        };

        void ensureInviteCodeActive();

        return () => {
            cancelled = true;
        };
    }, [family.id, family.invite_code, isOwner]);

    const handleCopy = (code: string) => {
        const value = code.trim();
        if (!value) {
            appToast.showInfo(
                'Chưa có mã mời',
                'Mã mời chưa sẵn sàng. Vui lòng thử làm mới mã.',
            );
            return;
        }
        Clipboard.setString(value);
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
                        onPress={() =>
                            router.replace({
                                pathname: '/family/[familyId]',
                                params: { familyId: family.id },
                            })
                        }
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
                                    inviteCode
                                        ? styles.linkText
                                        : styles.linkPlaceholderText
                                }
                                numberOfLines={inviteCode ? 1 : 2}
                            >
                                {inviteCode ||
                                    'Chia sẻ mã để liên kết thành viên'}
                            </Text>
                        </View>
                        <View style={{ flexDirection: 'row', gap: scale(8) }}>
                            <Pressable
                                style={[
                                    styles.linkActionBtn,
                                    {
                                        backgroundColor: colors.primary,
                                        opacity:
                                            !inviteCode || checkingInviteCode
                                                ? 0.7
                                                : 1,
                                    },
                                ]}
                                disabled={!inviteCode || checkingInviteCode}
                                onPress={() => handleCopy(inviteCode)}
                            >
                                <Ionicons
                                    name='copy-outline'
                                    size={20}
                                    color='#fff'
                                />
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.linkActionBtn,
                                    {
                                        backgroundColor: colors.secondary,
                                        opacity: checkingInviteCode ? 0.7 : 1,
                                    },
                                ]}
                                disabled={checkingInviteCode}
                                onPress={() => {
                                    void rotateInviteCode();
                                }}
                            >
                                {checkingInviteCode ? (
                                    <ActivityIndicator color='#fff' />
                                ) : (
                                    <Ionicons
                                        name='refresh-outline'
                                        size={20}
                                        color='#fff'
                                    />
                                )}
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
                        router.push({
                            pathname: '/family/[familyId]/search-phone',
                            params: { familyId: family.id },
                        })
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
