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
import { getApiErrorStatus } from '@/src/lib/api-error';
import { appToast } from '@/src/lib/toast';
import {
    familiesServices,
    type InvitePreviewResponse,
} from '@/src/services/families.services';
import { userService } from '@/src/services/user.services';
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

type PreviewData = InvitePreviewResponse & {
    family_id?: string;
    address?: string;
    created_at?: string;
};

type CandidateProfile = {
    id: string;
    initials: string;
    name: string;
    role?: string;
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

function toArray(data: unknown): Record<string, unknown>[] {
    if (Array.isArray(data)) return data as Record<string, unknown>[];
    if (Array.isArray((data as any)?.data)) return (data as any).data;
    if (Array.isArray((data as any)?.profiles)) return (data as any).profiles;
    return [];
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value : '';
}

function getProfileInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }

    return name.slice(0, 2).toUpperCase() || 'TV';
}

function mapProfileToCandidate(
    item: Record<string, unknown>,
    index: number,
): CandidateProfile | null {
    const profile =
        item.profile && typeof item.profile === 'object'
            ? (item.profile as Record<string, unknown>)
            : item;
    const id = stringValue(profile.id ?? item.profile_id);

    if (!id) {
        return null;
    }

    const name =
        stringValue(profile.full_name) ||
        stringValue(item.full_name) ||
        stringValue(item.name) ||
        `Hồ sơ ${index + 1}`;
    const role =
        stringValue(item.relation_role) ||
        stringValue(item.role) ||
        'Thành viên';

    return {
        id,
        initials: getProfileInitials(name),
        name,
        role,
    };
}

export default function JoinFamilyCodeScreen(): React.JSX.Element {
    const syncMeOverview = useAuthStore((state) => state.syncMeOverview);
    const [inviteCode, setInviteCode] = useState('');
    const [previewState, setPreviewState] = useState<PreviewState>('idle');
    const [previewData, setPreviewData] = useState<PreviewData | null>(null);
    const [candidateProfiles, setCandidateProfiles] = useState<
        CandidateProfile[]
    >([]);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
        null,
    );
    const [isJoining, setIsJoining] = useState(false);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

    const handlePreview = async () => {
        if (!inviteCode.trim()) {
            setPreviewState('error');
            setPreviewData(null);
            setCandidateProfiles([]);
            setShowLinkModal(false);
            return;
        }

        try {
            setPreviewState('loading');
            const res = await familiesServices.previewInviteCode(
                inviteCode.trim(),
            );
            setPreviewData({
                ...res,
                valid: Boolean(res.valid),
            });
            setCandidateProfiles([]);
            setPreviewState('success');
            setShowLinkModal(false);
            setSelectedProfileId(null);
        } catch (error) {
            console.error(error);
            setPreviewData(null);
            setCandidateProfiles([]);
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

    const loadMyProfiles = async () => {
        const profilesRes = await userService.getMyProfiles('all');
        const profiles = toArray(profilesRes)
            .map(mapProfileToCandidate)
            .filter((profile): profile is CandidateProfile => profile !== null);
        setCandidateProfiles(profiles);
        return profiles;
    };

    const handleJoinByCode = async (profileId?: string) => {
        if (!previewData?.invite_code || !previewData.valid || isJoining) {
            return;
        }

        try {
            setIsJoining(true);
            await familiesServices.joinByInviteCode({
                invite_code: previewData.invite_code,
                profile_id: profileId,
            });
            setShowLinkModal(false);
            await handleComplete();
        } catch (error) {
            const status = getApiErrorStatus(error);
            if (status === 409 && !profileId) {
                setIsLoadingProfiles(true);
                try {
                    const profiles = await loadMyProfiles();
                    if (!profiles.length) {
                        appToast.showInfo(
                            'Chưa có hồ sơ',
                            'Tài khoản của bạn chưa có hồ sơ để tham gia gia đình này.',
                        );
                        return;
                    }
                    setSelectedProfileId(profiles[0]?.id ?? null);
                    setShowLinkModal(true);
                    return;
                } finally {
                    setIsLoadingProfiles(false);
                }
            }

            if (status === 404) {
                appToast.showError(
                    'Mã mời không còn hiệu lực',
                    'Mã mời có thể đã hết hạn, đã được sử dụng hoặc đã bị rotate.',
                );
                return;
            }

            console.error(error);
            appToast.showError(
                'Tham gia thất bại',
                'Không thể tham gia gia đình lúc này.',
            );
        } finally {
            setIsJoining(false);
        }
    };

    const handleOpenLinkModal = async () => {
        if (!previewData?.valid) {
            appToast.showInfo(
                'Mã mời đã hết hiệu lực',
                'Vui lòng yêu cầu chủ gia đình gửi mã mời mới.',
            );
            return;
        }

        if (isJoining || isLoadingProfiles) {
            return;
        }

        await handleJoinByCode();
    };

    const handleConfirmLink = async () => {
        if (!selectedProfileId) {
            appToast.showInfo(
                'Chọn hồ sơ',
                'Vui lòng chọn một hồ sơ để tiếp tục tham gia gia đình.',
            );
            return;
        }

        await handleJoinByCode(selectedProfileId);
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
                                        Hết hạn
                                    </Text>
                                    <Text style={styles.previewInfoValue}>
                                        {formatPreviewDate(
                                            previewData.expires_at,
                                        )}
                                    </Text>
                                </View>
                            </View>

                            {!previewData.valid ? (
                                <View
                                    style={{
                                        backgroundColor: '#FFF1F2',
                                        borderWidth: 1,
                                        borderColor: '#FECDD3',
                                        borderRadius: moderateScale(12),
                                        paddingHorizontal: scale(12),
                                        paddingVertical: verticalScale(10),
                                        marginBottom: verticalScale(12),
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#BE123C',
                                            fontFamily: typography.font.bold,
                                            fontSize: scaleFont(11.5),
                                        }}
                                    >
                                        Mã mời không còn hiệu lực. Vui lòng yêu
                                        cầu chủ gia đình chia sẻ mã mới.
                                    </Text>
                                </View>
                            ) : null}

                            <Pressable
                                style={[
                                    styles.joinBtn,
                                    (!previewData.valid ||
                                        isJoining ||
                                        isLoadingProfiles) && { opacity: 0.55 },
                                ]}
                                onPress={handleOpenLinkModal}
                                disabled={
                                    !previewData.valid ||
                                    isJoining ||
                                    isLoadingProfiles
                                }
                            >
                                <Text style={styles.joinBtnText}>
                                    {isJoining || isLoadingProfiles
                                        ? 'Đang xử lý...'
                                        : 'Tham gia gia đình này'}
                                </Text>
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
                                    color={colors.info}
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

                            {candidateProfiles.map((member, index) => {
                                const isSelected =
                                    selectedProfileId === member.id;
                                const avatarBg =
                                    PROFILE_AVATAR_BACKGROUNDS[
                                        index %
                                            PROFILE_AVATAR_BACKGROUNDS.length
                                    ];

                                return (
                                    <Pressable
                                        key={member.id}
                                        style={[
                                            styles.profileOption,
                                            isSelected &&
                                                styles.profileOptionSelected,
                                        ]}
                                        onPress={() =>
                                            setSelectedProfileId(member.id)
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
                                                {member.initials ||
                                                    getFamilyInitial(
                                                        member.name,
                                                    )}
                                            </Text>
                                        </View>

                                        <View style={styles.profileInfo}>
                                            <Text style={styles.profileName}>
                                                {member.name}
                                            </Text>
                                            <Text style={styles.profileRole}>
                                                {member.role}
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
                                (!selectedProfileId || isJoining) &&
                                    styles.confirmBtnDisabled,
                            ]}
                            onPress={() => {
                                void handleConfirmLink();
                            }}
                            disabled={!selectedProfileId || isJoining}
                        >
                            <Text style={styles.confirmBtnText}>
                                {isJoining
                                    ? 'Đang xử lý...'
                                    : 'Xác nhận liên kết'}
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
        letterSpacing: 0,
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
        letterSpacing: 0,
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
        fontSize: scaleFont(16),
        marginBottom: verticalScale(2),
    },
    modalSubtitle: {
        color: colors.text2,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
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
        backgroundColor: colors.infoBg,
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: 'rgba(2, 132, 199, 0.18)',
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
        letterSpacing: 0,
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
        backgroundColor: '#F4FBF8',
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
        borderRadius: moderateScale(14),
    },
    confirmBtnDisabled: {
        backgroundColor: colors.primaryLight,
    },
    confirmBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(13.5),
    },
});
