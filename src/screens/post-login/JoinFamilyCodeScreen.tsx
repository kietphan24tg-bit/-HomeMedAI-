import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
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
import StatePanel from '@/src/components/state/StatePanel';
import { appToast } from '@/src/lib/toast';
import { familiesServices } from '@/src/services/families.services';
import { useAuthStore } from '@/src/stores/useAuthStore';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { buttonSystem, formSystem, inputSystem } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';

type PreviewState = 'idle' | 'loading' | 'success' | 'error';

type PreviewData = {
    family_id?: string;
    family_name?: string;
    invite_code?: string;
    address?: string;
    created_at?: string;
    valid?: boolean;
    expires_at?: string;
};

type LinkableProfileRow = {
    profile_id: string;
    full_name: string;
    dob?: string | null;
    gender?: string | null;
    avatar_url?: string | null;
    status?: string | null;
};

const APP_TABS_ROUTE = '/(protected)/(app)/(tabs)' as const;
const DEFAULT_FAMILY_ADDRESS = 'Chưa cập nhật địa chỉ';
const PROFILE_AVATAR_BACKGROUNDS = ['#D8F3E5', '#DCEAFE', '#FDE2E2', '#FEF3C7'];

const formatPreviewDate = (value?: string): string => {
    if (!value) {
        return '--/--/----';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '--/--/----';
    }

    return new Intl.DateTimeFormat('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

const getFamilyInitial = (name?: string): string => {
    const initial = name?.trim().charAt(0).toUpperCase();
    return initial || 'G';
};

function initialsFromFullName(fullName: string): string {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase() || '?';
}

export default function JoinFamilyCodeScreen(): React.JSX.Element {
    const syncMeOverview = useAuthStore((state) => state.syncMeOverview);
    const [inviteCode, setInviteCode] = useState('');
    const [previewState, setPreviewState] = useState<PreviewState>('idle');
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
        null,
    );
    const [linkableProfiles, setLinkableProfiles] = useState<
        LinkableProfileRow[]
    >([]);
    const [linkModalLoading, setLinkModalLoading] = useState(false);

    const handlePreview = async () => {
        if (!inviteCode.trim()) {
            setPreviewState('error');
            setPreviewData(null);
            setShowLinkModal(false);
            return;
        }

        try {
            setPreviewState('loading');
            const res = await familiesServices.previewInviteCode(
                inviteCode.trim(),
            );
            setPreviewData(res);
            setPreviewState('success');
            setShowLinkModal(false);
            setSelectedProfileId(null);
        } catch (error) {
            console.error(error);
            setPreviewData(null);
            setPreviewState('error');
            setShowLinkModal(false);
            setSelectedProfileId(null);
        }
    };

    const handleComplete = async () => {
        const overview = await syncMeOverview();

        if (!overview?.post_login_flow_completed) {
            appToast.showInfo(
                'Chưa hoàn tất',
                'Flow tham gia gia đình hiện chưa có bước liên kết hồ sơ hoàn chỉnh. Vui lòng tiếp tục từ lời mời hoặc tạo hồ sơ cá nhân.',
            );
            return;
        }

        router.replace(APP_TABS_ROUTE);
    };

    const handleOpenLinkModal = async () => {
        const code = inviteCode.trim();
        if (!code) {
            appToast.showInfo('Thiếu mã', 'Vui lòng nhập mã gia đình trước.');
            return;
        }

        try {
            setLinkModalLoading(true);
            const data =
                await familiesServices.listLinkableProfilesByInvite(code);
            const profiles: LinkableProfileRow[] = Array.isArray(data?.profiles)
                ? data.profiles
                : [];
            if (!profiles.length) {
                appToast.showInfo(
                    'Chưa có hồ sơ',
                    'Không tìm thấy hồ sơ nào có thể liên kết với mã này. Kiểm tra mã hoặc liên hệ chủ gia đình.',
                );
                return;
            }
            setLinkableProfiles(profiles);
            setSelectedProfileId(profiles[0]?.profile_id ?? null);
            setShowLinkModal(true);
        } catch (error) {
            console.error(error);
            appToast.showError(
                'Lỗi',
                'Không tải được danh sách hồ sơ. Vui lòng thử lại.',
            );
        } finally {
            setLinkModalLoading(false);
        }
    };

    const handleConfirmLink = async () => {
        if (!selectedProfileId) {
            appToast.showInfo(
                'Chọn hồ sơ',
                'Vui lòng chọn một hồ sơ để tiếp tục liên kết.',
            );
            return;
        }

        const selectedProfile = linkableProfiles.find(
            (row) => row.profile_id === selectedProfileId,
        );

        if (!selectedProfile) {
            appToast.showError(
                'Không tìm thấy hồ sơ',
                'Hồ sơ đã chọn không còn hợp lệ. Vui lòng chọn lại.',
            );
            return;
        }

        try {
            setShowLinkModal(false);
            await familiesServices.linkProfileByInvite({
                invite_code: inviteCode.trim(),
                profile_id: selectedProfile.profile_id,
            });
            await handleComplete();
        } catch (error) {
            console.error(error);
            appToast.showError(
                'Liên kết thất bại',
                'Không thể liên kết hồ sơ với gia đình lúc này.',
            );
        }
    };

    return (
        <SafeAreaView style={styles.page}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.backText}>Quay lại</Text>
                </Pressable>

                <View style={styles.hero}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Mã gia đình</Text>
                    </View>
                    <Text style={styles.title}>
                        Nhập mã để{'\n'}
                        <Text style={styles.titleAccent}>
                            tham gia gia đình
                        </Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Nếu gia đình của bạn đã có hồ sơ được tạo sẵn, bước tiếp
                        theo sẽ dùng mã này để tìm đúng dữ liệu tương ứng.
                    </Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mã gia đình / mã mời</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons
                            name='key-outline'
                            size={18}
                            color={colors.text3}
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            style={styles.input}
                            value={inviteCode}
                            onChangeText={setInviteCode}
                            placeholder='Ví dụ: ABC123'
                            placeholderTextColor={colors.text3}
                            autoCapitalize='characters'
                        />
                    </View>
                </View>

                <View style={styles.primaryWrap}>
                    <Pressable
                        style={[
                            styles.primaryBtn,
                            previewState === 'loading' &&
                                styles.primaryBtnLoading,
                        ]}
                        onPress={handlePreview}
                        disabled={previewState === 'loading'}
                    >
                        <View style={styles.primaryBtnContent}>
                            {previewState === 'loading' ? (
                                <ActivityIndicator size='small' color='#fff' />
                            ) : null}
                            <Text style={styles.primaryBtnText}>
                                {previewState === 'loading'
                                    ? 'Đang kiểm tra...'
                                    : 'Kiểm tra mã'}
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {previewState === 'success' && previewData ? (
                    <View style={styles.previewCard}>
                        <View style={styles.previewHeaderRow}>
                            <View style={styles.previewHeaderIconWrap}>
                                <Ionicons
                                    name='checkmark'
                                    size={11}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.previewLabel}>
                                Đã tìm thấy gia đình
                            </Text>
                        </View>

                        <View style={styles.previewBody}>
                            <View style={styles.previewFamilyRow}>
                                <View style={styles.previewAvatar}>
                                    <Text style={styles.previewAvatarText}>
                                        {getFamilyInitial(
                                            previewData.family_name,
                                        )}
                                    </Text>
                                </View>

                                <View style={styles.previewFamilyInfo}>
                                    <Text style={styles.previewTitle}>
                                        {previewData.family_name ||
                                            'Gia đình hợp lệ'}
                                    </Text>
                                    <View style={styles.previewLocationRow}>
                                        <Ionicons
                                            name='location-sharp'
                                            size={13}
                                            color={colors.text3}
                                        />
                                        <Text
                                            style={styles.previewLocationText}
                                            numberOfLines={1}
                                        >
                                            {previewData.address ||
                                                DEFAULT_FAMILY_ADDRESS}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.previewInfoCard}>
                                <View style={styles.previewInfoRow}>
                                    <Text style={styles.previewInfoLabel}>
                                        Mã mời
                                    </Text>
                                    <View style={styles.previewCodeChip}>
                                        <Text style={styles.previewCodeText}>
                                            {(
                                                previewData.invite_code ||
                                                inviteCode.trim()
                                            ).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.previewDivider} />

                                <View style={styles.previewInfoRow}>
                                    <Text style={styles.previewInfoLabel}>
                                        Ngày tạo
                                    </Text>
                                    <Text style={styles.previewInfoValue}>
                                        {formatPreviewDate(
                                            previewData.created_at,
                                        )}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                style={[
                                    styles.joinBtn,
                                    linkModalLoading && { opacity: 0.65 },
                                ]}
                                onPress={() => {
                                    void handleOpenLinkModal();
                                }}
                                disabled={linkModalLoading}
                            >
                                {linkModalLoading ? (
                                    <ActivityIndicator color='#fff' />
                                ) : (
                                    <Text style={styles.joinBtnText}>
                                        Tham gia gia đình này
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                ) : null}

                {previewState === 'error' ? (
                    <StatePanel
                        variant='error'
                        title='Không kiểm tra được mã gia đình'
                        message='Mã không hợp lệ hoặc hiện chưa thể xác minh. Vui lòng thử lại.'
                        compact
                    />
                ) : null}
            </ScrollView>

            <Modal
                visible={showLinkModal}
                transparent
                animationType='slide'
                onRequestClose={() => setShowLinkModal(false)}
            >
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setShowLinkModal(false)}
                >
                    <Pressable
                        style={styles.modalSheet}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={styles.modalHandle}>
                            <View style={styles.modalHandleBar} />
                        </View>

                        <View style={styles.modalHeader}>
                            <View style={styles.modalHeaderTextWrap}>
                                <Text style={styles.modalTitle}>
                                    Liên kết tài khoản
                                </Text>
                                <Text style={styles.modalSubtitle}>
                                    Bạn là thành viên nào trong gia đình?
                                </Text>
                            </View>
                        </View>

                        <View style={styles.modalDivider} />

                        <ScrollView
                            style={styles.modalScroll}
                            contentContainerStyle={styles.modalScrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <View style={styles.modalHintCard}>
                                <Ionicons
                                    name='information-circle-outline'
                                    size={18}
                                    color={colors.secondary}
                                />
                                <Text style={styles.modalHintText}>
                                    Chọn hồ sơ của bạn trong gia đình để liên
                                    kết với tài khoản này. Mỗi hồ sơ chỉ liên
                                    kết được một tài khoản.
                                </Text>
                            </View>

                            <Text style={styles.modalSectionTitle}>
                                Thành viên chưa có tài khoản
                            </Text>

                            {linkableProfiles.map((member, index) => {
                                const isSelected =
                                    selectedProfileId === member.profile_id;
                                const avatarBg =
                                    PROFILE_AVATAR_BACKGROUNDS[
                                        index %
                                            PROFILE_AVATAR_BACKGROUNDS.length
                                    ];

                                return (
                                    <Pressable
                                        key={member.profile_id}
                                        style={[
                                            styles.profileOption,
                                            isSelected &&
                                                styles.profileOptionSelected,
                                        ]}
                                        onPress={() =>
                                            setSelectedProfileId(
                                                member.profile_id,
                                            )
                                        }
                                    >
                                        <View
                                            style={[
                                                styles.profileAvatar,
                                                { backgroundColor: avatarBg },
                                            ]}
                                        >
                                            <Text
                                                style={styles.profileAvatarText}
                                            >
                                                {initialsFromFullName(
                                                    member.full_name,
                                                )}
                                            </Text>
                                        </View>

                                        <View style={styles.profileInfo}>
                                            <Text style={styles.profileName}>
                                                {member.full_name}
                                            </Text>
                                            <Text style={styles.profileRole}>
                                                {member.status
                                                    ? String(member.status)
                                                    : 'Chưa liên kết tài khoản'}
                                            </Text>
                                        </View>

                                        <View
                                            style={[
                                                styles.profileCheck,
                                                isSelected &&
                                                    styles.profileCheckSelected,
                                            ]}
                                        >
                                            {isSelected ? (
                                                <Ionicons
                                                    name='checkmark'
                                                    size={13}
                                                    color='#fff'
                                                />
                                            ) : null}
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <Pressable
                            style={[
                                styles.confirmBtn,
                                !selectedProfileId && styles.confirmBtnDisabled,
                            ]}
                            onPress={() => {
                                void handleConfirmLink();
                            }}
                            disabled={!selectedProfileId}
                        >
                            <Text style={styles.confirmBtnText}>
                                Xác nhận liên kết
                            </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    scrollContent: {
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(28),
    },
    backBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        marginBottom: verticalScale(18),
    },
    backText: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
    },
    hero: {
        marginBottom: verticalScale(10),
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primaryBg,
        borderRadius: 999,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(12),
    },
    badgeText: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
    },
    title: {
        color: colors.text,
        fontFamily: typography.font.black,
        fontSize: scaleFont(26),
        lineHeight: verticalScale(34),
        marginBottom: verticalScale(8),
        letterSpacing: -0.4,
    },
    titleAccent: {
        color: colors.primary,
    },
    subtitle: {
        color: colors.text2,
        fontFamily: typography.font.regular,
        fontSize: scaleFont(14),
        lineHeight: verticalScale(22),
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        ...formSystem.fieldLabel,
        lineHeight: verticalScale(16),
        marginBottom: verticalScale(7),
    },
    inputWrap: {
        ...inputSystem.fieldIcon,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        minHeight: verticalScale(45),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(13),
    },
    input: {
        ...inputSystem.text,
        fontFamily: typography.font.medium,
        color: colors.text,
        fontSize: scaleFont(12.5),
        lineHeight: scaleFont(16),
        textAlignVertical: 'center',
    },
    primaryWrap: {
        marginTop: verticalScale(8),
        marginBottom: verticalScale(18),
    },
    primaryBtn: {
        width: '100%',
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(45),
        borderRadius: moderateScale(11),
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    primaryBtnLoading: {
        backgroundColor: 'rgba(15, 110, 86, 0.72)',
        opacity: 0.88,
    },
    primaryBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    primaryBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(13.5),
    },
    previewCard: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: scale(20),
        overflow: 'hidden',
        marginBottom: verticalScale(18),
        ...shadows.card,
    },
    previewHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        backgroundColor: colors.primary,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
    },
    previewHeaderIconWrap: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewLabel: {
        color: '#ECFDF5',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    previewBody: {
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(16),
    },
    previewFamilyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(14),
        marginBottom: verticalScale(18),
    },
    previewAvatar: {
        width: moderateScale(48),
        height: moderateScale(48),
        borderRadius: moderateScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.primaryBg,
        borderWidth: 1,
        borderColor: 'rgba(15, 110, 86, 0.14)',
    },
    previewAvatarText: {
        color: colors.primary,
        fontFamily: typography.font.black,
        fontSize: scaleFont(22),
    },
    previewFamilyInfo: {
        flex: 1,
        minWidth: 0,
    },
    previewTitle: {
        color: colors.text,
        fontFamily: typography.font.black,
        fontSize: scaleFont(18),
        lineHeight: verticalScale(24),
        marginBottom: verticalScale(4),
    },
    previewLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
    },
    previewLocationText: {
        flex: 1,
        color: colors.text2,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
    },
    previewInfoCard: {
        backgroundColor: '#F8F8F7',
        borderRadius: moderateScale(16),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(6),
        borderWidth: 1,
        borderColor: colors.divider,
        marginBottom: verticalScale(18),
    },
    previewInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: scale(10),
        minHeight: verticalScale(44),
    },
    previewInfoLabel: {
        flex: 1,
        color: colors.text2,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
    },
    previewCodeChip: {
        backgroundColor: colors.primaryBg,
        borderRadius: scale(999),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(6),
        alignItems: 'center',
    },
    previewCodeText: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
    },
    previewDivider: {
        height: 1,
        backgroundColor: colors.border,
    },
    previewInfoValue: {
        color: colors.text,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
    },
    joinBtn: {
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(46),
        borderRadius: moderateScale(14),
    },
    joinBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(13.5),
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.35)',
        justifyContent: 'flex-end',
    },
    modalSheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        maxHeight: '84%',
        overflow: 'hidden',
        paddingBottom: verticalScale(22),
    },
    modalHandle: {
        alignItems: 'center',
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(4),
    },
    modalHandleBar: {
        width: scale(36),
        height: verticalScale(4),
        borderRadius: moderateScale(2),
        backgroundColor: colors.border,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(14),
    },
    modalHeaderTextWrap: {
        flex: 1,
        justifyContent: 'center',
    },
    modalTitle: {
        color: colors.text,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        marginBottom: verticalScale(2),
    },
    modalSubtitle: {
        color: colors.text2,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        marginTop: verticalScale(3),
    },
    modalDivider: {
        height: 1,
        backgroundColor: colors.border,
    },
    modalScroll: {
        flexGrow: 0,
    },
    modalScrollContent: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(16),
    },
    modalHintCard: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(10),
        backgroundColor: colors.primaryBg,
        borderRadius: moderateScale(16),
        borderWidth: 1.5,
        borderColor: colors.primaryLight,
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(14),
        marginBottom: verticalScale(18),
    },
    modalHintText: {
        flex: 1,
        color: colors.text2,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        lineHeight: verticalScale(21),
    },
    modalSectionTitle: {
        color: colors.text2,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: verticalScale(12),
    },
    profileOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        backgroundColor: colors.card,
        borderRadius: moderateScale(20),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(12),
        marginBottom: verticalScale(12),
        ...shadows.card,
    },
    profileOptionSelected: {
        backgroundColor: colors.primaryBg,
        borderColor: colors.primary,
    },
    profileAvatar: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(13),
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileAvatarText: {
        color: colors.text2,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13.5),
    },
    profileInfo: {
        flex: 1,
        minWidth: 0,
    },
    profileName: {
        color: colors.text,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        marginBottom: verticalScale(2),
    },
    profileRole: {
        color: colors.text3,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11.5),
    },
    profileCheck: {
        width: moderateScale(24),
        height: moderateScale(24),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileCheckSelected: {
        backgroundColor: '#22C55E',
        borderColor: '#22C55E',
    },
    confirmBtn: {
        ...buttonSystem.primary,
        marginHorizontal: scale(20),
        marginTop: verticalScale(4),
        backgroundColor: colors.primary,
        minHeight: verticalScale(48),
        borderRadius: moderateScale(16),
    },
    confirmBtnDisabled: {
        backgroundColor: colors.primaryLight,
    },
    confirmBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(13.5),
    },
});
