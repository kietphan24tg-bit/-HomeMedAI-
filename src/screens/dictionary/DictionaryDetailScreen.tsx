import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
import { medicalDictionaryService } from '@/src/services/medicalDictionary.services';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { colors, radius, shadows, typography } from '@/src/styles/tokens';
import type {
    DictionaryDetailResponse,
    DictionaryEntryType,
} from '@/src/types/medical-dictionary';

function getTypeLabel(type: DictionaryEntryType): string {
    if (type === 'disease') return 'Disease';
    if (type === 'drug') return 'Drug';
    return 'Vaccine';
}

function getTypeTheme(type: DictionaryEntryType) {
    if (type === 'disease') {
        return {
            colors: ['#7F1D1D', '#DC2626', '#FB7185'],
            icon: 'pulse-outline' as const,
            softBg: '#FFF1F2',
            softText: '#BE123C',
        };
    }

    if (type === 'drug') {
        return {
            colors: ['#1E3A8A', '#2563EB', '#60A5FA'],
            icon: 'medkit-outline' as const,
            softBg: '#EFF6FF',
            softText: '#1D4ED8',
        };
    }

    return {
        colors: ['#115E59', '#0F766E', '#2DD4BF'],
        icon: 'shield-checkmark-outline' as const,
        softBg: '#F0FDFA',
        softText: '#0F766E',
    };
}

function humanizeKey(key: string): string {
    return key
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return 'No data available';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    if (Array.isArray(value)) {
        if (value.length === 0) return 'No data available';
        return value.map((item) => formatValue(item)).join('\n• ');
    }
    if (typeof value === 'object') {
        const entries = Object.entries(value);
        if (entries.length === 0) return 'No data available';
        return entries
            .map(
                ([entryKey, entryValue]) =>
                    `${humanizeKey(entryKey)}: ${formatValue(entryValue)}`,
            )
            .join('\n');
    }
    return String(value);
}

export default function DictionaryDetailScreen(): React.JSX.Element {
    const params = useLocalSearchParams<{
        entryType?: DictionaryEntryType;
        itemId?: string;
    }>();
    const [detail, setDetail] = useState<DictionaryDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const entryType = params.entryType;
    const itemId = params.itemId;

    useEffect(() => {
        async function loadDetail() {
            if (!entryType || !itemId) {
                setError('Unable to find the selected dictionary item.');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const res = await medicalDictionaryService.getDetail(
                    entryType,
                    itemId,
                );
                setDetail(res);
            } catch {
                setError('Unable to load dictionary detail right now.');
            } finally {
                setLoading(false);
            }
        }

        loadDetail();
    }, [entryType, itemId]);

    const typeTheme = getTypeTheme(entryType ?? 'drug');

    return (
        <SafeAreaView style={styles.page}>
            <StatusBar
                barStyle='light-content'
                backgroundColor='transparent'
                translucent
            />

            <LinearGradient
                colors={typeTheme.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <View style={styles.heroOverlayCircle} />

                <View style={styles.heroTop}>
                    <Pressable
                        onPress={() => router.back()}
                        style={styles.iconBtn}
                    >
                        <Ionicons
                            name='chevron-back'
                            size={18}
                            color='#FFFFFF'
                        />
                    </Pressable>

                    <View
                        style={[
                            styles.typeBadge,
                            { backgroundColor: 'rgba(255,255,255,0.18)' },
                        ]}
                    >
                        <Ionicons
                            name={typeTheme.icon}
                            size={14}
                            color='#FFFFFF'
                        />
                        <Text style={styles.typeBadgeText}>
                            {getTypeLabel(entryType ?? 'drug')}
                        </Text>
                    </View>
                </View>

                <Text style={styles.heroTitle}>
                    {detail?.title ?? 'Loading detail...'}
                </Text>

                <Text style={styles.heroSubtitle}>
                    {detail?.summary?.trim() ||
                        'Detailed API content will appear here once loaded.'}
                </Text>
            </LinearGradient>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.feedbackCard}>
                        <ActivityIndicator color={colors.primary} />
                        <Text style={styles.feedbackText}>
                            Loading detail...
                        </Text>
                    </View>
                ) : null}

                {error ? (
                    <View style={styles.feedbackCard}>
                        <Ionicons
                            name='alert-circle-outline'
                            size={20}
                            color='#DC2626'
                        />
                        <Text style={styles.feedbackText}>{error}</Text>
                    </View>
                ) : null}

                {!loading && detail ? (
                    <>
                        {detail.aliases.length > 0 ? (
                            <View style={styles.card}>
                                <Text style={styles.sectionTitle}>
                                    Related Keywords
                                </Text>
                                <View style={styles.aliasWrap}>
                                    {detail.aliases.map((alias) => (
                                        <View
                                            key={alias}
                                            style={[
                                                styles.aliasChip,
                                                {
                                                    backgroundColor:
                                                        typeTheme.softBg,
                                                },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.aliasChipText,
                                                    {
                                                        color: typeTheme.softText,
                                                    },
                                                ]}
                                            >
                                                {alias}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        ) : null}

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>Summary</Text>
                            <Text style={styles.sectionBody}>
                                {detail.summary?.trim() ||
                                    'No summary available for this item.'}
                            </Text>
                        </View>

                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>
                                Detail Content
                            </Text>
                            {Object.keys(detail.content).length > 0 ? (
                                Object.entries(detail.content).map(
                                    ([key, value]) => (
                                        <View
                                            key={key}
                                            style={styles.infoBlock}
                                        >
                                            <Text style={styles.infoLabel}>
                                                {humanizeKey(key)}
                                            </Text>
                                            <Text style={styles.infoValue}>
                                                {formatValue(value)}
                                            </Text>
                                        </View>
                                    ),
                                )
                            ) : (
                                <Text style={styles.sectionBody}>
                                    No structured content available for this
                                    item.
                                </Text>
                            )}
                        </View>
                    </>
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    hero: {
        marginHorizontal: scale(16),
        marginTop: verticalScale(12),
        borderRadius: moderateScale(30),
        paddingHorizontal: scale(18),
        paddingTop: verticalScale(18),
        paddingBottom: verticalScale(22),
        overflow: 'hidden',
    },
    heroOverlayCircle: {
        position: 'absolute',
        width: scale(170),
        height: scale(170),
        borderRadius: 999,
        top: -40,
        right: -30,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: verticalScale(18),
    },
    iconBtn: {
        width: scale(34),
        height: scale(34),
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.18)',
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        borderRadius: 999,
    },
    typeBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: '#FFFFFF',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    heroTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(24),
        lineHeight: scaleFont(30),
        color: '#FFFFFF',
    },
    heroSubtitle: {
        marginTop: verticalScale(10),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(20),
        color: 'rgba(255,255,255,0.82)',
    },
    content: {
        flex: 1,
    },
    contentInner: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(32),
        gap: verticalScale(12),
    },
    feedbackCard: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(24),
        ...shadows.card,
    },
    feedbackText: {
        marginTop: verticalScale(8),
        textAlign: 'center',
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(19),
        color: colors.text2,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        padding: scale(16),
        ...shadows.card,
    },
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        color: colors.text,
    },
    sectionBody: {
        marginTop: verticalScale(10),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(20),
        color: colors.text,
    },
    aliasWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
        marginTop: verticalScale(12),
    },
    aliasChip: {
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
        borderRadius: 999,
    },
    aliasChipText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
    },
    infoBlock: {
        marginTop: verticalScale(14),
        paddingTop: verticalScale(14),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    infoLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    infoValue: {
        marginTop: verticalScale(8),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(20),
        color: colors.text,
    },
});
