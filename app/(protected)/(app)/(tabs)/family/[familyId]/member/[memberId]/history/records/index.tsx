import Ionicons from '@expo/vector-icons/Ionicons';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
    ActivityIndicator,
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { useFamilyQuery } from '@/src/features/family/queries';
import { medicalRecordsService } from '@/src/services/medicalRecords.services';
import { colors, typography } from '@/src/styles/tokens';

function normalizeParam(value: string | string[] | undefined): string {
    if (typeof value === 'string') return value;
    if (Array.isArray(value) && value.length > 0) return value[0] ?? '';
    return '';
}

function formatDate(value?: string | null): string {
    if (!value) return '--/--/----';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('vi-VN');
}

export default function MemberRecordsRoute() {
    const { familyId, memberId } = useLocalSearchParams<{
        familyId?: string | string[];
        memberId?: string | string[];
    }>();
    const normalizedFamilyId = normalizeParam(familyId);
    const normalizedMemberId = normalizeParam(memberId);
    const { data: family } = useFamilyQuery(normalizedFamilyId);

    const member = useMemo(
        () =>
            family?.members.find(
                (item) => String(item.id) === String(normalizedMemberId),
            ),
        [family?.members, normalizedMemberId],
    );
    const profileId = member?.healthProfileId ?? '';

    const {
        data: records = [],
        isLoading,
        isRefetching,
    } = useQuery({
        queryKey: ['medical-records', profileId],
        queryFn: () => medicalRecordsService.listForProfile(profileId),
        enabled: !!profileId,
    });

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <View style={styles.topbar}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.topbarTitle}>Hồ sơ khám bệnh</Text>
                    <Text style={styles.topbarSub}>
                        {member?.name ?? 'Thành viên'}
                    </Text>
                </View>
                <Pressable
                    style={styles.addBtn}
                    onPress={() => router.push('./new')}
                >
                    <Ionicons name='add' size={18} color={colors.primary} />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 28 }}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <View style={styles.center}>
                        <ActivityIndicator
                            size='small'
                            color={colors.primary}
                        />
                        <Text style={styles.helper}>Đang tải hồ sơ...</Text>
                    </View>
                ) : null}

                {!isLoading && !profileId ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>
                            Khong xac dinh duoc ho so suc khoe
                        </Text>
                        <Text style={styles.emptySub}>
                            Vui long quay lai danh sach thanh vien roi mo lai
                            man hinh.
                        </Text>
                    </View>
                ) : null}

                {!isLoading && !!profileId && records.length === 0 ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>
                            Chưa có hồ sơ khám
                        </Text>
                        <Text style={styles.emptySub}>
                            Nhấn nút + để thêm hồ sơ khám bệnh cho thành viên.
                        </Text>
                    </View>
                ) : null}

                {records.map((record) => (
                    <View key={record.id} style={styles.card}>
                        <View style={styles.row}>
                            <Ionicons
                                name='document-text-outline'
                                size={18}
                                color={colors.primary}
                            />
                            <Text style={styles.dateText}>
                                {formatDate(
                                    record.visit_date ?? record.created_at,
                                )}
                            </Text>
                        </View>
                        <Text style={styles.title}>
                            {record.diagnosis_name?.trim() ||
                                record.title?.trim() ||
                                'Hồ sơ khám'}
                        </Text>
                        <Text style={styles.meta}>
                            {record.hospital_name?.trim() ||
                                'Chưa cập nhật bệnh viện'}
                        </Text>
                        <Text style={styles.meta}>
                            {record.doctor_name?.trim() ||
                                'Chưa cập nhật bác sĩ'}
                        </Text>
                    </View>
                ))}

                {isRefetching ? (
                    <Text style={styles.refreshText}>
                        Đang làm mới dữ liệu...
                    </Text>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.bg,
        gap: 10,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topbarTitle: {
        fontFamily: typography.font.black,
        fontSize: 17,
        color: colors.text,
    },
    topbarSub: {
        fontFamily: typography.font.medium,
        fontSize: 12,
        color: colors.text2,
    },
    center: {
        alignItems: 'center',
        gap: 8,
        paddingVertical: 16,
    },
    helper: {
        fontFamily: typography.font.medium,
        fontSize: 13,
        color: colors.text2,
    },
    emptyCard: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 14,
        gap: 6,
    },
    emptyTitle: {
        fontFamily: typography.font.bold,
        fontSize: 15,
        color: colors.text,
    },
    emptySub: {
        fontFamily: typography.font.regular,
        fontSize: 13,
        color: colors.text2,
        lineHeight: 18,
    },
    card: {
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        borderRadius: 14,
        padding: 12,
        marginBottom: 10,
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontFamily: typography.font.medium,
        fontSize: 12,
        color: colors.primary,
    },
    title: {
        fontFamily: typography.font.bold,
        fontSize: 15,
        color: colors.text,
    },
    meta: {
        fontFamily: typography.font.regular,
        fontSize: 13,
        color: colors.text2,
    },
    refreshText: {
        fontFamily: typography.font.regular,
        fontSize: 12,
        color: colors.text3,
        marginTop: 8,
    },
});
