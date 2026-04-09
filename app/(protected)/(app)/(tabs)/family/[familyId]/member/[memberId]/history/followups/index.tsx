import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React from 'react';
import {
    Pressable,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { colors } from '@/src/styles/tokens';

const UPCOMING = [
    {
        date: '15/04/2026',
        hospital: 'BV Đại học Y Dược',
        department: 'Khoa Tim mạch',
        doctor: 'BS. Lê Văn Hùng',
        purpose: 'Tái khám huyết áp',
        reminder: '1 ngày',
    },
    {
        date: '01/07/2026',
        hospital: 'PK Hoàn Mỹ Sài Gòn',
        department: 'Nội soi dạ dày',
        doctor: '',
        purpose: 'Khám định kỳ',
        reminder: '2 ngày',
    },
];

const PAST = [
    {
        date: '15/03/2026',
        hospital: 'BV Đại học Y Dược',
        summary: 'Tim mạch • Đã đi khám',
    },
    {
        date: '02/01/2026',
        hospital: 'PK Hoàn Mỹ Sài Gòn',
        summary: 'Nội tổng quát • Đã đi khám',
    },
];

export default function MemberFollowupsRoute() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgHealth }}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor={colors.bgHealth}
            />

            {/* TOP BAR */}
            <View style={styles.topbar}>
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.topbarTitle}>Lịch tái khám</Text>
                    <Text style={styles.topbarSubtitle}>Nguyễn Thị Bình</Text>
                </View>
                <Pressable
                    style={styles.topbarAction}
                    onPress={() => router.push('./new')}
                >
                    <Ionicons name='add' size={20} color={colors.primary} />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
                {/* SẮP TỚI */}
                <Text style={styles.sectionHeader}>SẮP TỚI</Text>
                {UPCOMING.map((item, index) => (
                    <View key={index} style={styles.card}>
                        <View style={styles.cardHeader}>
                            <Ionicons
                                name='calendar-outline'
                                size={18}
                                color={colors.primary}
                            />
                            <Text style={styles.cardDate}>{item.date}</Text>
                        </View>
                        <View style={styles.cardBody}>
                            <Text style={styles.cardHospital}>
                                {item.hospital}
                            </Text>
                            <Text style={styles.cardDetail}>
                                {item.department}
                            </Text>
                            {!!item.doctor && (
                                <Text style={styles.cardDetail}>
                                    {item.doctor}
                                </Text>
                            )}
                            <Text style={styles.cardDetail}>
                                {item.purpose}
                            </Text>

                            <View style={styles.reminderRow}>
                                <Text style={styles.reminderText}>
                                    Nhắc trước
                                </Text>
                                <View style={styles.reminderPill}>
                                    <Text style={styles.reminderPillText}>
                                        {item.reminder}
                                    </Text>
                                    <Ionicons
                                        name='chevron-down'
                                        size={12}
                                        color={colors.text2}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={styles.cardActions}>
                            <Pressable style={styles.actionBtn}>
                                <Text
                                    style={[
                                        styles.actionBtnText,
                                        { color: colors.primary },
                                    ]}
                                >
                                    Sửa
                                </Text>
                            </Pressable>
                            <View style={styles.actionDivider} />
                            <Pressable style={styles.actionBtn}>
                                <Text
                                    style={[
                                        styles.actionBtnText,
                                        { color: '#E11D48' },
                                    ]}
                                >
                                    Hủy lịch
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                ))}

                {/* ĐÃ KHÁM */}
                <Text style={[styles.sectionHeader, { marginTop: 16 }]}>
                    ĐÃ KHÁM
                </Text>
                {PAST.map((item, index) => (
                    <View
                        key={index}
                        style={[
                            styles.card,
                            {
                                padding: 16,
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 12,
                            },
                        ]}
                    >
                        <View style={styles.checkWrap}>
                            <Ionicons name='checkmark' size={16} color='#fff' />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.pastDate}>{item.date}</Text>
                            <Text style={styles.pastHospital}>
                                {item.hospital}
                            </Text>
                            <Text style={styles.pastSummary}>
                                {item.summary}
                            </Text>
                        </View>
                    </View>
                ))}

                <Pressable
                    style={styles.addBtn}
                    onPress={() => router.push('./new')}
                >
                    <Ionicons
                        name='add-circle-outline'
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.addBtnText}>Thêm lịch tái khám</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    topbar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 16,
        backgroundColor: colors.bgHealth,
        gap: 12,
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.card,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    topbarTitle: {
        fontFamily: 'Inter-Black',
        fontSize: 18,
        color: colors.text,
        letterSpacing: -0.3,
    },
    topbarSubtitle: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: colors.text2,
    },
    topbarAction: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primaryBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionHeader: {
        fontFamily: 'Inter-Black',
        fontSize: 13,
        color: colors.text2,
        letterSpacing: 0.5,
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: '#F8FAFC',
    },
    cardDate: {
        fontFamily: 'Inter-Bold',
        fontSize: 15,
        color: colors.primary,
    },
    cardBody: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cardHospital: {
        fontFamily: 'Inter-Bold',
        fontSize: 16,
        color: colors.text,
        marginBottom: 4,
    },
    cardDetail: {
        fontFamily: 'Inter-Regular',
        fontSize: 14,
        color: colors.text2,
        marginBottom: 2,
    },
    reminderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        gap: 8,
    },
    reminderText: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text2,
    },
    reminderPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    reminderPillText: {
        fontFamily: 'Inter-Medium',
        fontSize: 13,
        color: colors.text,
    },
    cardActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
    },
    actionBtnText: {
        fontFamily: 'Inter-SemiBold',
        fontSize: 14,
    },
    actionDivider: {
        width: 1,
        height: 24,
        backgroundColor: colors.border,
    },
    checkWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#10B981',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pastDate: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: colors.text,
        marginBottom: 2,
    },
    pastHospital: {
        fontFamily: 'Inter-Medium',
        fontSize: 14,
        color: colors.text2,
    },
    pastSummary: {
        fontFamily: 'Inter-Regular',
        fontSize: 13,
        color: colors.text3,
    },
    addBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: colors.card,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        borderStyle: 'dashed',
        marginTop: 8,
    },
    addBtnText: {
        fontFamily: 'Inter-Bold',
        fontSize: 14,
        color: colors.primary,
    },
});
