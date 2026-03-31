import { router } from 'expo-router';
import React from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';

const OPTIONS = [
    {
        key: 'has-family',
        emoji: '🏠',
        iconBg: colors.primaryBg,
        title: 'Tôi đã có gia đình',
        description: 'Nhập mã mời để tìm và liên kết với hồ sơ đã có sẵn.',
        onPress: () => router.push('/join-family-code'),
    },
    {
        key: 'no-family',
        emoji: '👤',
        iconBg: colors.secondaryBg,
        title: 'Tôi chưa có gia đình',
        description:
            'Tạo hồ sơ cá nhân trước để bắt đầu sử dụng app ở chế độ riêng.',
        onPress: () => router.push('/personal-info'),
    },
];

export default function PostLoginGateScreen(): React.JSX.Element {
    return (
        <SafeAreaView style={styles.page}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            <View style={styles.content}>
                <View style={styles.hero}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Thiết lập ban đầu</Text>
                    </View>
                    <Text style={styles.title}>
                        Bạn đã có{'\n'}
                        <Text style={{ color: colors.primary }}>
                            gia đình
                        </Text>{' '}
                        chưa?
                    </Text>
                    <Text style={styles.subtitle}>
                        Chọn tình huống phù hợp để HomeMedAI thiết lập hồ sơ sức
                        khỏe cho bạn đúng cách.
                    </Text>
                </View>

                <View style={styles.optionWrap}>
                    {OPTIONS.map((option) => (
                        <Pressable
                            key={option.key}
                            style={({ pressed }) => [
                                styles.optionCard,
                                pressed && shared.pressed,
                            ]}
                            onPress={option.onPress}
                        >
                            <View
                                style={[
                                    styles.optionIcon,
                                    { backgroundColor: option.iconBg },
                                ]}
                            >
                                <Text style={styles.optionEmoji}>
                                    {option.emoji}
                                </Text>
                            </View>
                            <View style={styles.optionBody}>
                                <Text style={styles.optionTitle}>
                                    {option.title}
                                </Text>
                                <Text style={styles.optionDesc}>
                                    {option.description}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        flex: 1,
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(28),
        justifyContent: 'center',
    },
    hero: {
        marginBottom: verticalScale(28),
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primaryBg,
        borderRadius: 999,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(14),
    },
    badgeText: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
    },
    title: {
        color: colors.text,
        fontFamily: typography.font.black,
        fontSize: scaleFont(28),
        lineHeight: verticalScale(36),
        letterSpacing: -0.4,
        marginBottom: verticalScale(10),
    },
    subtitle: {
        color: colors.text2,
        fontFamily: typography.font.regular,
        fontSize: scaleFont(15),
        lineHeight: verticalScale(24),
        maxWidth: scale(330),
    },
    optionWrap: {
        gap: verticalScale(16),
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(14),
        backgroundColor: colors.card,
        borderRadius: scale(24),
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(18),
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    optionIcon: {
        width: scale(56),
        height: scale(56),
        borderRadius: scale(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionEmoji: {
        fontSize: scaleFont(28),
    },
    optionBody: {
        flex: 1,
    },
    optionTitle: {
        color: colors.text,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(18),
        marginBottom: verticalScale(4),
    },
    optionDesc: {
        color: colors.text2,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(14),
        lineHeight: verticalScale(21),
    },
});
