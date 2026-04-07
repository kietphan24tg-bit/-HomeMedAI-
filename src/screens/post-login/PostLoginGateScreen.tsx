import { router } from 'expo-router';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
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

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
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
                        {
                            'Ch\u1ECDn t\u00ECnh hu\u1ED1ng ph\u00F9 h\u1EE3p \u0111\u1EC3 '
                        }
                        <Text style={styles.subtitleHighlight}>HomeMedAI</Text>
                        {
                            ' thi\u1EBFt l\u1EADp h\u1ED3 s\u01A1 s\u1EE9c kh\u1ECFe cho b\u1EA1n \u0111\u00FAng c\u00E1ch.'
                        }
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
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    content: {
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(72),
        paddingBottom: verticalScale(28),
        flexGrow: 1,
    },
    hero: {
        marginBottom: verticalScale(26),
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
        fontSize: scaleFont(24),
        lineHeight: verticalScale(31),
        letterSpacing: -0.4,
        marginBottom: verticalScale(8),
    },
    subtitle: {
        color: colors.text2,
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13.5),
        lineHeight: verticalScale(22),
        maxWidth: scale(320),
    },
    subtitleHighlight: {
        color: colors.primary,
        fontFamily: typography.font.bold,
    },
    optionWrap: {
        gap: verticalScale(14),
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        backgroundColor: colors.card,
        borderRadius: scale(20),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(14),
        borderWidth: 1,
        borderColor: colors.border,
        ...shadows.card,
    },
    optionIcon: {
        width: scale(50),
        height: scale(50),
        borderRadius: scale(16),
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionEmoji: {
        fontSize: scaleFont(24),
    },
    optionBody: {
        flex: 1,
    },
    optionTitle: {
        color: colors.text,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        marginBottom: verticalScale(3),
    },
    optionDesc: {
        color: colors.text2,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: verticalScale(20),
    },
});
