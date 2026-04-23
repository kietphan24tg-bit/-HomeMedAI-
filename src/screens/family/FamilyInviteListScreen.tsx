import Ionicons from '@expo/vector-icons/Ionicons';
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
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatePanel from '@/src/components/state/StatePanel';
import {
    useAcceptFamilyInviteMutation,
    useRejectFamilyInviteMutation,
} from '@/src/features/family/mutations';
import { useFamilyInvitesQuery } from '@/src/features/family/queries';
import { getApiErrorStatus } from '@/src/lib/api-error';
import { userService } from '@/src/services/user.services';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { colors, typography } from '@/src/styles/tokens';
import { InviteCard } from './familyShared';
import { styles } from './styles';

type ProfileOption = {
    id: string;
    name: string;
};

export default function FamilyInviteListScreen(): React.JSX.Element {
    const {
        data: inviteList = [],
        isLoading,
        isError,
        refetch,
    } = useFamilyInvitesQuery({ status: 'pending', page: 1, limit: 20 });
    const acceptInviteMutation = useAcceptFamilyInviteMutation();
    const rejectInviteMutation = useRejectFamilyInviteMutation();
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
    const [selectedProfileId, setSelectedProfileId] = useState<string | null>(
        null,
    );
    const [targetInviteId, setTargetInviteId] = useState<string | null>(null);
    const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

    const loadMyProfiles = async () => {
        const res = await userService.getMyProfiles('all');
        const rows = Array.isArray(res)
            ? res
            : Array.isArray((res as any)?.data)
              ? (res as any).data
              : Array.isArray((res as any)?.profiles)
                ? (res as any).profiles
                : [];

        return rows
            .map((item: any) => ({
                id: String(item?.id ?? item?.profile_id ?? ''),
                name: String(
                    item?.full_name ?? item?.name ?? item?.profile_name ?? '',
                ),
            }))
            .filter((item: ProfileOption) => item.id.length > 0);
    };

    const acceptInvite = async (inviteId: string, fullName: string | null) => {
        try {
            await acceptInviteMutation.mutateAsync({ inviteId, fullName });
        } catch (error) {
            const status = getApiErrorStatus(error);
            if (status !== 409) {
                return;
            }

            setIsLoadingProfiles(true);
            try {
                const profiles = await loadMyProfiles();
                if (!profiles.length) return;
                setProfileOptions(profiles);
                setSelectedProfileId(profiles[0]?.id ?? null);
                setTargetInviteId(inviteId);
                setShowProfileModal(true);
            } finally {
                setIsLoadingProfiles(false);
            }
        }
    };

    const retryAcceptWithProfile = async () => {
        if (!targetInviteId || !selectedProfileId) return;
        try {
            await acceptInviteMutation.mutateAsync({
                inviteId: targetInviteId,
                profileId: selectedProfileId,
            });
            setShowProfileModal(false);
        } catch {
            // toast handled in mutation
        }
    };

    const rejectInvite = (inviteId: string) => {
        rejectInviteMutation.mutate({ inviteId });
    };

    const isMutating =
        acceptInviteMutation.isPending ||
        rejectInviteMutation.isPending ||
        isLoadingProfiles;

    return (
        <SafeAreaView
            edges={['left', 'right', 'bottom']}
            style={styles.container}
        >
            <StatusBar barStyle='dark-content' backgroundColor={colors.card} />
            <SafeAreaView
                edges={['top']}
                style={{ backgroundColor: colors.card }}
            />
            <View style={styles.memberHeader}>
                <View style={styles.memberHeaderTop}>
                    <Pressable
                        style={styles.memberBackBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name='chevron-back'
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={styles.memberBackText}>Gia đình</Text>
                    </Pressable>
                </View>
                <Text
                    style={[
                        styles.memberName,
                        { fontSize: scaleFont(22), marginBottom: 6 },
                    ]}
                >
                    Lời mời tham gia
                </Text>
                <Text style={styles.memberMeta}>
                    {inviteList.length} lời mời đang chờ phản hồi
                </Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: scale(20),
                        paddingTop: verticalScale(18),
                        gap: verticalScale(12),
                    },
                ]}
            >
                {isLoading ? (
                    <StatePanel
                        variant='loading'
                        title='Đang tải lời mời gia đình'
                        message='Vui lòng chờ trong giây lát để đồng bộ lời mời mới nhất.'
                    />
                ) : null}

                {isError ? (
                    <StatePanel
                        variant='error'
                        title='Không tải được lời mời'
                        message='Đã có lỗi khi lấy danh sách lời mời. Vui lòng thử lại.'
                        actionLabel='Thử lại'
                        onAction={() => {
                            refetch();
                        }}
                    />
                ) : null}

                {!isLoading && !isError && inviteList.length === 0 ? (
                    <View
                        style={{
                            backgroundColor: colors.card,
                            borderWidth: 1.5,
                            borderColor: colors.border,
                            borderRadius: 20,
                            paddingVertical: verticalScale(40),
                            paddingHorizontal: scale(20),
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                width: scale(64),
                                height: scale(64),
                                borderRadius: scale(20),
                                backgroundColor: '#F0F9FF',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: verticalScale(12),
                            }}
                        >
                            <Ionicons
                                name='notifications-outline'
                                size={28}
                                color={colors.text3}
                            />
                        </View>
                        <Text
                            style={{
                                fontFamily: typography.font.black,
                                fontSize: scaleFont(15),
                                color: colors.text,
                                marginBottom: verticalScale(6),
                            }}
                        >
                            Không có lời mời
                        </Text>
                        <Text
                            style={{
                                textAlign: 'center',
                                color: colors.text3,
                                fontFamily: typography.font.regular,
                                fontSize: scaleFont(12),
                                lineHeight: verticalScale(18),
                            }}
                        >
                            Khi ai đó mời bạn tham gia gia đình, lời mời sẽ xuất
                            hiện ở đây.
                        </Text>
                    </View>
                ) : null}

                {!isLoading && !isError
                    ? inviteList.map((invite) => (
                          <InviteCard
                              key={invite.id}
                              invite={invite}
                              onAccept={() =>
                                  acceptInvite(invite.id, invite.fullName)
                              }
                              onReject={() => rejectInvite(invite.id)}
                          />
                      ))
                    : null}
            </ScrollView>

            <Modal
                visible={showProfileModal}
                transparent
                animationType='slide'
                onRequestClose={() => setShowProfileModal(false)}
            >
                <Pressable
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: 'rgba(15,23,42,0.4)',
                        justifyContent: 'flex-end',
                    }}
                    onPress={() => setShowProfileModal(false)}
                >
                    <Pressable
                        style={{
                            backgroundColor: colors.card,
                            borderTopLeftRadius: 24,
                            borderTopRightRadius: 24,
                            paddingHorizontal: scale(20),
                            paddingTop: verticalScale(14),
                            paddingBottom: verticalScale(24),
                        }}
                        onPress={(e) => e.stopPropagation()}
                    >
                        <Text
                            style={{
                                color: colors.text,
                                fontFamily: typography.font.bold,
                                fontSize: scaleFont(16),
                                marginBottom: verticalScale(4),
                            }}
                        >
                            Chọn hồ sơ để tham gia
                        </Text>
                        <Text
                            style={{
                                color: colors.text3,
                                fontFamily: typography.font.medium,
                                fontSize: scaleFont(12),
                                marginBottom: verticalScale(14),
                            }}
                        >
                            Tài khoản của bạn có nhiều hồ sơ. Hãy chọn 1 hồ sơ
                            để chấp nhận lời mời.
                        </Text>

                        {profileOptions.map((profile) => {
                            const selected = selectedProfileId === profile.id;
                            return (
                                <Pressable
                                    key={profile.id}
                                    onPress={() =>
                                        setSelectedProfileId(profile.id)
                                    }
                                    style={{
                                        borderWidth: 1.5,
                                        borderColor: selected
                                            ? colors.primary
                                            : colors.border,
                                        backgroundColor: selected
                                            ? colors.primaryBg
                                            : colors.card,
                                        borderRadius: 14,
                                        paddingHorizontal: scale(14),
                                        paddingVertical: verticalScale(12),
                                        marginBottom: verticalScale(10),
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: selected
                                                ? colors.primary
                                                : colors.text,
                                            fontFamily: typography.font.bold,
                                            fontSize: scaleFont(13),
                                        }}
                                    >
                                        {profile.name || 'Hồ sơ'}
                                    </Text>
                                </Pressable>
                            );
                        })}

                        <Pressable
                            style={{
                                backgroundColor:
                                    selectedProfileId &&
                                    !acceptInviteMutation.isPending
                                        ? colors.primary
                                        : '#CBD5E1',
                                borderRadius: 14,
                                minHeight: verticalScale(46),
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginTop: verticalScale(6),
                            }}
                            disabled={
                                !selectedProfileId ||
                                acceptInviteMutation.isPending
                            }
                            onPress={() => {
                                void retryAcceptWithProfile();
                            }}
                        >
                            <Text
                                style={{
                                    color: '#fff',
                                    fontFamily: typography.font.bold,
                                    fontSize: scaleFont(13),
                                }}
                            >
                                {acceptInviteMutation.isPending
                                    ? 'Đang xử lý...'
                                    : 'Xác nhận'}
                            </Text>
                        </Pressable>
                    </Pressable>
                </Pressable>
            </Modal>

            {isMutating && (
                <View
                    style={{
                        ...StyleSheet.absoluteFillObject,
                        backgroundColor: 'rgba(255,255,255,0.6)',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999,
                    }}
                >
                    <ActivityIndicator size='large' color={colors.primary} />
                </View>
            )}
        </SafeAreaView>
    );
}
