import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
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

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
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
                        <Text style={styles.memberBackText}>Gia d�nh</Text>
                    </Pressable>
                </View>
                <Text
                    style={[
                        styles.memberName,
                        { fontSize: scaleFont(22), marginBottom: 6 },
                    ]}
                >
                    L?i m?i tham gia
                </Text>
                <Text style={styles.memberMeta}>
                    {inviteList.length} l?i m?i dang ch? ph?n h?i
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
                        title='�ang t?i l?i m?i gia d�nh'
                        message='Vui l�ng ch? trong gi�y l�t d? d?ng b? l?i m?i m?i nh?t.'
                    />
                ) : null}

                {isError ? (
                    <StatePanel
                        variant='error'
                        title='Kh�ng t?i du?c l?i m?i'
                        message='�� c� l?i khi l?y danh s�ch l?i m?i. Vui l�ng th? l?i.'
                        actionLabel='Th? l?i'
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
                                backgroundColor: colors.bgHealth,
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
                            Kh�ng c� l?i m?i
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
                            Khi ai d� m?i b?n tham gia gia d�nh, l?i m?i s? xu?t
                            hi?n ? d�y.
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
        </SafeAreaView>
    );
}
