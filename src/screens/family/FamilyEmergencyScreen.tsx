import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useFamilyMembersQuery,
    useFamilyQuery,
} from '@/src/features/family/queries';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import {
    buttonSystem,
    cardSystem,
    formSystem,
    shared,
} from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';

function roleLabel(role?: string): string {
    if (role === 'OWNER') return 'Chủ gia đình';
    return role || 'Thành viên';
}

function initialsOf(name?: string): string {
    if (!name) return 'NA';
    return name
        .split(' ')
        .filter(Boolean)
        .map((n: string) => n[0])
        .join('')
        .slice(-2)
        .toUpperCase();
}

function getMemberAge(member: any): number {
    const directAge = Number(member?.age);
    if (Number.isFinite(directAge) && directAge > 0) return directAge;

    const dobRaw = member?.date_of_birth ?? member?.dateOfBirth ?? member?.dob;
    if (typeof dobRaw !== 'string') return 0;

    const dob = new Date(dobRaw);
    if (Number.isNaN(dob.getTime())) return 0;

    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    const dayDiff = now.getDate() - dob.getDate();
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        age -= 1;
    }
    return Math.max(0, age);
}

function getPhone(member: any): string {
    return member?.phone || member?.phone_number || '0909 123 456';
}

function getPriorityTag(index: number) {
    if (index === 0) {
        return { label: 'Ưu tiên cao', color: colors.danger };
    }
    if (index === 1) {
        return { label: 'Ưu tiên vừa', color: colors.warning };
    }
    return { label: 'Ưu tiên theo dõi', color: colors.text2 };
}

function asTextList(value: any, fallback: string): string {
    if (Array.isArray(value)) {
        const cleaned = value.filter(Boolean).map((v) => String(v).trim());
        return cleaned.length > 0 ? cleaned.join(', ') : fallback;
    }
    if (typeof value === 'string' && value.trim()) return value.trim();
    return fallback;
}

export default function FamilyEmergencyScreen({
    familyId,
}: {
    familyId: string;
}): React.JSX.Element {
    const { data: family } = useFamilyQuery(familyId);
    const { data: members = [] } = useFamilyMembersQuery(familyId);

    if (!family) {
        return <View style={styles.container} />;
    }

    const owners = members.filter((m) => m.role === 'OWNER');
    const primaryContact =
        owners.length > 0 ? owners[0] : members.length > 0 ? members[0] : null;
    const sortedPriorityMembers = [...members].sort(
        (a, b) => getMemberAge(b) - getMemberAge(a),
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Pressable
                    style={styles.headerBackBtn}
                    onPress={() => router.back()}
                    hitSlop={10}
                >
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={styles.headerTitleWrap}>
                    <Text style={styles.headerTitle}>Thông tin khẩn cấp</Text>
                    <Text style={styles.headerSubtitle}>
                        {family?.name || 'Phan Family'}
                    </Text>
                </View>
                <Pressable style={styles.headerActionBtn} hitSlop={10}>
                    <Ionicons
                        name='alert-circle-outline'
                        size={18}
                        color={colors.danger}
                    />
                </Pressable>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.sectionTitle}>NGƯỜI LIÊN HỆ CHÍNH</Text>
                <View style={styles.primaryCard}>
                    <View style={styles.primaryAvatar}>
                        <Text style={styles.primaryAvatarText}>
                            {initialsOf(primaryContact?.name)}
                        </Text>
                    </View>
                    <View style={styles.primaryInfo}>
                        <Text style={styles.primaryName}>
                            {primaryContact?.name || 'Nguyễn Văn An'}
                        </Text>
                        <Text style={styles.primaryMeta}>
                            {roleLabel(primaryContact?.role)} ·{' '}
                            {getPhone(primaryContact)}
                        </Text>
                    </View>
                    <Pressable
                        style={styles.callButton}
                        onPress={() => {
                            const phone = getPhone(primaryContact);
                            Linking.openURL(`tel:${phone}`);
                        }}
                    >
                        <Ionicons
                            name='call-outline'
                            size={16}
                            color={colors.danger}
                        />
                    </Pressable>
                </View>

                <Text style={styles.sectionTitle}>HỒ SƠ ƯU TIÊN TRUY CẬP</Text>
                {sortedPriorityMembers.map((member, index) => {
                    const age = getMemberAge(member);
                    const priorityTag = getPriorityTag(index);
                    return (
                        <View key={member.id} style={styles.memberCard}>
                            <View style={styles.memberHead}>
                                <View style={styles.memberAvatar}>
                                    <Text style={styles.memberAvatarText}>
                                        {initialsOf(member.name)}
                                    </Text>
                                </View>
                                <View style={styles.memberHeadInfo}>
                                    <Text style={styles.memberName}>
                                        {member.name}
                                    </Text>
                                    <Text style={styles.memberMeta}>
                                        {roleLabel(member.role)} ·{' '}
                                        {age > 0
                                            ? `${age} tuổi`
                                            : 'Chưa rõ tuổi'}
                                    </Text>
                                </View>
                                <View style={styles.priorityWrap}>
                                    <View
                                        style={[
                                            styles.priorityDot,
                                            {
                                                backgroundColor:
                                                    priorityTag.color,
                                            },
                                        ]}
                                    />
                                    <Text
                                        style={[
                                            styles.priorityText,
                                            { color: priorityTag.color },
                                        ]}
                                    >
                                        {priorityTag.label}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.memberDivider} />

                            <View style={styles.detailList}>
                                <View style={styles.detailRow}>
                                    <Ionicons
                                        name='water-outline'
                                        size={16}
                                        color={colors.danger}
                                        style={styles.detailIcon}
                                    />
                                    <Text style={styles.detailLabel}>
                                        Nhóm máu:
                                    </Text>
                                    <Text
                                        style={
                                            member.bloodType ||
                                            member.blood_type
                                                ? styles.detailValueDefault
                                                : styles.detailValueWarning
                                        }
                                    >
                                        {member.bloodType ||
                                            member.blood_type ||
                                            'Chưa cập nhật'}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons
                                        name='heart-outline'
                                        size={16}
                                        color={colors.primary}
                                        style={styles.detailIcon}
                                    />
                                    <Text style={styles.detailLabel}>
                                        Bệnh nền:
                                    </Text>
                                    <Text
                                        style={
                                            asTextList(
                                                member.chronicConditions ??
                                                    member.chronic_conditions,
                                                'Chưa cập nhật',
                                            ) === 'Chưa cập nhật'
                                                ? styles.detailValueWarning
                                                : asTextList(
                                                        member.chronicConditions ??
                                                            member.chronic_conditions,
                                                        'Chưa cập nhật',
                                                    ).toLowerCase() ===
                                                        'không' ||
                                                    asTextList(
                                                        member.chronicConditions ??
                                                            member.chronic_conditions,
                                                        'Chưa cập nhật',
                                                    ).toLowerCase() ===
                                                        'không có'
                                                  ? styles.detailValueSuccess
                                                  : styles.detailValueDanger
                                        }
                                    >
                                        {asTextList(
                                            member.chronicConditions ??
                                                member.chronic_conditions,
                                            'Chưa cập nhật',
                                        )}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons
                                        name='alert-circle-outline'
                                        size={16}
                                        color={colors.warning}
                                        style={styles.detailIcon}
                                    />
                                    <Text style={styles.detailLabel}>
                                        Dị ứng:
                                    </Text>
                                    <Text
                                        style={
                                            asTextList(
                                                member.allergies,
                                                'Chưa cập nhật',
                                            ) === 'Chưa cập nhật'
                                                ? styles.detailValueWarning
                                                : asTextList(
                                                        member.allergies,
                                                        'Chưa cập nhật',
                                                    ).toLowerCase() ===
                                                        'không' ||
                                                    asTextList(
                                                        member.allergies,
                                                        'Chưa cập nhật',
                                                    ).toLowerCase() ===
                                                        'không có'
                                                  ? styles.detailValueSuccess
                                                  : styles.detailValueDanger
                                        }
                                    >
                                        {asTextList(
                                            member.allergies,
                                            'Chưa cập nhật',
                                        )}
                                    </Text>
                                </View>
                                <View style={styles.detailRow}>
                                    <Ionicons
                                        name='medical-outline'
                                        size={16}
                                        color={colors.secondary}
                                        style={styles.detailIcon}
                                    />
                                    <Text style={styles.detailLabel}>
                                        Thuốc đang dùng:
                                    </Text>
                                    <Text style={styles.detailValueDefault}>
                                        {member.medicationCount ??
                                            member.medication_count ??
                                            0}{' '}
                                        loại
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                style={styles.quickActionBtn}
                                onPress={() =>
                                    router.push({
                                        pathname:
                                            '/family/[familyId]/member/[memberId]',
                                        params: {
                                            familyId,
                                            memberId: member.id,
                                            tab: 'health',
                                        },
                                    })
                                }
                            >
                                <Text style={styles.quickActionText}>
                                    Mở thẻ y tế nhanh
                                </Text>
                            </Pressable>
                        </View>
                    );
                })}
                <View style={styles.bottomSpacer} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(6),
        backgroundColor: 'transparent',
    },
    headerBackBtn: {
        width: scale(28),
        height: scale(28),
        borderRadius: scale(14),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        borderWidth: 0,
    },
    headerActionBtn: {
        ...shared.iconBtn,
    },
    headerTitleWrap: {
        alignItems: 'center',
    },
    headerTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(17),
        color: colors.text,
    },
    headerSubtitle: {
        marginTop: verticalScale(1),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(40),
        gap: verticalScale(8),
    },
    sectionTitle: {
        ...formSystem.sectionTitle,
        letterSpacing: 0.4,
        marginTop: verticalScale(6),
        marginBottom: verticalScale(5),
    },
    primaryCard: {
        ...cardSystem.shell,
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: scale(16),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(10),
    },
    primaryAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        backgroundColor: colors.primaryBg,
        borderWidth: 1.5,
        borderColor: '#B7E4D4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    primaryAvatarText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.primary,
    },
    primaryInfo: {
        flex: 1,
    },
    primaryName: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    primaryMeta: {
        marginTop: verticalScale(1),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text3,
    },
    callButton: {
        width: scale(36),
        height: scale(36),
        borderRadius: scale(18),
        backgroundColor: colors.dangerBg,
        borderWidth: 1,
        borderColor: '#FECACA',
        alignItems: 'center',
        justifyContent: 'center',
    },
    memberCard: {
        ...cardSystem.shell,
        borderRadius: scale(16),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(10),
        marginBottom: verticalScale(10),
    },
    memberHead: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: verticalScale(10),
    },
    memberAvatar: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(12),
        backgroundColor: colors.primaryBg,
        borderWidth: 1.5,
        borderColor: '#B7E4D4',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    memberAvatarText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.primary,
    },
    memberHeadInfo: {
        flex: 1,
    },
    memberName: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    memberMeta: {
        marginTop: verticalScale(1),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text3,
    },
    priorityWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priorityDot: {
        width: scale(8),
        height: scale(8),
        borderRadius: scale(4),
        backgroundColor: colors.danger,
        marginRight: scale(6),
    },
    priorityText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11.5),
        color: colors.danger,
    },
    memberDivider: {
        height: 1,
        backgroundColor: colors.border,
        marginBottom: verticalScale(10),
    },
    detailList: {
        gap: verticalScale(7),
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    detailIcon: {
        width: scale(20),
        marginTop: verticalScale(1),
    },
    detailLabel: {
        width: scale(88),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    detailValueDanger: {
        flex: 1,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12.3),
        lineHeight: scaleFont(16.5),
        color: colors.danger,
    },
    detailValueWarning: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        lineHeight: scaleFont(16.5),
        color: colors.text3,
        fontStyle: 'italic',
    },
    detailValueDefault: {
        flex: 1,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12.3),
        lineHeight: scaleFont(16.5),
        color: colors.text,
    },
    detailValueSuccess: {
        flex: 1,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12.3),
        lineHeight: scaleFont(16.5),
        color: colors.success,
    },
    quickActionBtn: {
        marginTop: verticalScale(12),
        ...buttonSystem.outline,
        minHeight: verticalScale(40),
        borderRadius: scale(12),
        backgroundColor: colors.primaryBg,
        borderColor: '#B7E4D4',
        paddingVertical: verticalScale(6),
    },
    quickActionText: {
        ...buttonSystem.textOutline,
        fontSize: scaleFont(12.5),
        color: colors.primary,
    },
    bottomSpacer: {
        height: verticalScale(28),
    },
});
