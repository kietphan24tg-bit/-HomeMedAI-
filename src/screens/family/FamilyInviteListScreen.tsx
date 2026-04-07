import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import {
    ActivityIndicator,
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
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { colors, typography } from '@/src/styles/tokens';
import { InviteCard } from './familyShared';
import { styles } from './styles';

export default function FamilyInviteListScreen(): React.JSX.Element {
    const {
        data: inviteList = [],
        isLoading,
        isError,
        refetch,
    } = useFamilyInvitesQuery({ status: 'pending', page: 1, limit: 20 });
    const acceptInviteMutation = useAcceptFamilyInviteMutation();
    const rejectInviteMutation = useRejectFamilyInviteMutation();

    const acceptInvite = (inviteId: string, fullName: string | null) => {
        acceptInviteMutation.mutate({ inviteId, fullName });
    };

    const rejectInvite = (inviteId: string) => {
        rejectInviteMutation.mutate({ inviteId });
    };

    const isMutating =
        acceptInviteMutation.isPending || rejectInviteMutation.isPending;

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
