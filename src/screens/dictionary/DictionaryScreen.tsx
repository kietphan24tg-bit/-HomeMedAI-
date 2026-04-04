import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
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
    DictionaryEntryType,
    DictionarySearchItem,
} from '@/src/types/medical-dictionary';

const FILTERS: {
    label: string;
    value: DictionaryEntryType | null;
    icon: keyof typeof Ionicons.glyphMap;
}[] = [
    { label: 'All', value: null, icon: 'grid-outline' },
    { label: 'Disease', value: 'disease', icon: 'pulse-outline' },
    { label: 'Drug', value: 'drug', icon: 'medkit-outline' },
    { label: 'Vaccine', value: 'vaccine', icon: 'shield-checkmark-outline' },
];

const QUICK_QUERIES = ['paracetamol', 'covid', 'flu', 'allergy', 'vaccine'];

async function searchDictionary({
    query,
    type,
    page,
}: {
    query: string;
    type: DictionaryEntryType | null;
    page: number;
}) {
    return medicalDictionaryService.search({
        query,
        type,
        page,
        limit: 12,
    });
}

function getTypeLabel(type: DictionaryEntryType): string {
    if (type === 'disease') return 'Disease';
    if (type === 'drug') return 'Drug';
    return 'Vaccine';
}

function getTypePalette(type: DictionaryEntryType) {
    if (type === 'disease') {
        return {
            bg: '#FFF1F2',
            border: '#FECDD3',
            text: '#BE123C',
            icon: 'pulse-outline' as const,
        };
    }

    if (type === 'drug') {
        return {
            bg: '#EFF6FF',
            border: '#BFDBFE',
            text: '#1D4ED8',
            icon: 'medkit-outline' as const,
        };
    }

    return {
        bg: '#F0FDFA',
        border: '#99F6E4',
        text: '#0F766E',
        icon: 'shield-checkmark-outline' as const,
    };
}

function ResultCard({ item }: { item: DictionarySearchItem }) {
    const palette = getTypePalette(item.type);

    return (
        <Pressable
            onPress={() =>
                router.push({
                    pathname: '/medical-dictionary/[entryType]/[itemId]',
                    params: {
                        entryType: item.type,
                        itemId: item.id,
                    },
                })
            }
            style={({ pressed }) => [
                styles.resultCard,
                pressed && styles.resultCardPressed,
            ]}
        >
            <View
                style={[styles.resultIconWrap, { backgroundColor: palette.bg }]}
            >
                <Ionicons name={palette.icon} size={18} color={palette.text} />
            </View>

            <View style={styles.resultBody}>
                <View style={styles.resultTop}>
                    <Text style={styles.resultTitle}>{item.title}</Text>
                    <View
                        style={[
                            styles.typePill,
                            {
                                backgroundColor: palette.bg,
                                borderColor: palette.border,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.typePillText,
                                { color: palette.text },
                            ]}
                        >
                            {getTypeLabel(item.type)}
                        </Text>
                    </View>
                </View>

                {item.aliases.length > 0 ? (
                    <Text style={styles.aliasText}>
                        Keywords: {item.aliases.slice(0, 3).join(', ')}
                    </Text>
                ) : null}

                <Text style={styles.resultSummary} numberOfLines={2}>
                    {item.summary?.trim() ||
                        'No short summary available for this item.'}
                </Text>
            </View>

            <Ionicons name='chevron-forward' size={16} color={colors.text3} />
        </Pressable>
    );
}

export default function DictionaryScreen(): React.JSX.Element {
    const [query, setQuery] = useState('');
    const [activeFilter, setActiveFilter] =
        useState<DictionaryEntryType | null>(null);
    const [items, setItems] = useState<DictionarySearchItem[]>([]);
    const [page, setPage] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const trimmedQuery = query.trim();

    async function handleLoadMore() {
        if (!trimmedQuery || loading || loadingMore || !hasNext) {
            return;
        }

        try {
            setError(null);
            setLoadingMore(true);

            const res = await searchDictionary({
                query: trimmedQuery,
                type: activeFilter,
                page: page + 1,
            });

            setItems((prev) => [...prev, ...res.items]);
            setPage(res.page);
            setHasNext(res.has_next);
            setTotal(res.total);
        } catch {
            setError('Unable to load dictionary data right now.');
        } finally {
            setLoadingMore(false);
        }
    }

    useEffect(() => {
        if (!trimmedQuery) {
            setItems([]);
            setPage(1);
            setHasNext(false);
            setTotal(0);
            setError(null);
            setLoading(false);
            setLoadingMore(false);
            return undefined;
        }

        let cancelled = false;

        const timer = setTimeout(async () => {
            try {
                setError(null);
                setLoading(true);

                const res = await searchDictionary({
                    query: trimmedQuery,
                    type: activeFilter,
                    page: 1,
                });

                if (cancelled) {
                    return;
                }

                setItems(res.items);
                setPage(res.page);
                setHasNext(res.has_next);
                setTotal(res.total);
            } catch {
                if (cancelled) {
                    return;
                }

                setError('Unable to load dictionary data right now.');
                setItems([]);
                setPage(1);
                setHasNext(false);
                setTotal(0);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }, 350);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [trimmedQuery, activeFilter]);

    return (
        <SafeAreaView style={styles.page}>
            <StatusBar
                barStyle='light-content'
                backgroundColor='transparent'
                translucent
            />

            <LinearGradient
                colors={['#0F172A', '#1D4ED8', '#14B8A6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
            >
                <View style={styles.heroGlowLarge} />
                <View style={styles.heroGlowSmall} />

                <View style={styles.heroTop}>
                    <View style={styles.heroBadge}>
                        <Ionicons
                            name='book-outline'
                            size={14}
                            color='#BFDBFE'
                        />
                        <Text style={styles.heroBadgeText}>
                            Medical Dictionary
                        </Text>
                    </View>
                </View>

                <Text style={styles.heroTitle}>
                    Search diseases, drugs, and vaccines
                </Text>
                <Text style={styles.heroSubtitle}>
                    Enter a keyword, narrow by type, then open the result to
                    view the API-backed detail page.
                </Text>

                <View style={styles.searchWrap}>
                    <Ionicons name='search-outline' size={18} color='#64748B' />
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder='Example: paracetamol, flu, vaccine...'
                        placeholderTextColor='#94A3B8'
                        style={styles.searchInput}
                        autoCapitalize='none'
                        autoCorrect={false}
                        returnKeyType='search'
                    />
                    {trimmedQuery ? (
                        <Pressable onPress={() => setQuery('')} hitSlop={10}>
                            <Ionicons
                                name='close-circle'
                                size={18}
                                color='#94A3B8'
                            />
                        </Pressable>
                    ) : null}
                </View>
            </LinearGradient>

            <View style={styles.filterRow}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterContent}
                >
                    {FILTERS.map((filter) => {
                        const active = activeFilter === filter.value;

                        return (
                            <Pressable
                                key={filter.label}
                                onPress={() => setActiveFilter(filter.value)}
                                style={[
                                    styles.filterChip,
                                    active && styles.filterChipActive,
                                ]}
                            >
                                <Ionicons
                                    name={filter.icon}
                                    size={15}
                                    color={active ? '#FFFFFF' : colors.text2}
                                />
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        active && styles.filterChipTextActive,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </Pressable>
                        );
                    })}
                </ScrollView>
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentInner}
                showsVerticalScrollIndicator={false}
            >
                {!trimmedQuery ? (
                    <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>
                            Start with a keyword
                        </Text>
                        <Text style={styles.emptyText}>
                            Search by disease, drug, or vaccine name. Use one of
                            the quick queries below to test the flow.
                        </Text>
                        <View style={styles.quickWrap}>
                            {QUICK_QUERIES.map((quickQuery) => (
                                <Pressable
                                    key={quickQuery}
                                    onPress={() => setQuery(quickQuery)}
                                    style={styles.quickChip}
                                >
                                    <Text style={styles.quickChipText}>
                                        {quickQuery}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                ) : null}

                {trimmedQuery ? (
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Search Results</Text>
                        <Text style={styles.sectionMeta}>
                            {loading ? 'Loading...' : `${total} items`}
                        </Text>
                    </View>
                ) : null}

                {loading && !loadingMore ? (
                    <View style={styles.feedbackCard}>
                        <ActivityIndicator color={colors.primary} />
                        <Text style={styles.feedbackText}>
                            Loading dictionary data...
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

                {!loading && trimmedQuery && !error && items.length === 0 ? (
                    <View style={styles.feedbackCard}>
                        <Ionicons
                            name='search-outline'
                            size={20}
                            color={colors.text3}
                        />
                        <Text style={styles.feedbackTitle}>
                            No matching results
                        </Text>
                        <Text style={styles.feedbackText}>
                            Try a shorter keyword or switch to another filter.
                        </Text>
                    </View>
                ) : null}

                <View style={styles.resultList}>
                    {items.map((item) => (
                        <ResultCard
                            key={`${item.type}-${item.id}`}
                            item={item}
                        />
                    ))}
                </View>

                {hasNext && !loading && !error ? (
                    <Pressable
                        onPress={handleLoadMore}
                        style={styles.loadMoreBtn}
                    >
                        {loadingMore ? (
                            <ActivityIndicator color='#FFFFFF' />
                        ) : (
                            <>
                                <Text style={styles.loadMoreText}>
                                    Load More Results
                                </Text>
                                <Ionicons
                                    name='arrow-down'
                                    size={16}
                                    color='#FFFFFF'
                                />
                            </>
                        )}
                    </Pressable>
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
        paddingBottom: verticalScale(18),
        overflow: 'hidden',
    },
    heroGlowLarge: {
        position: 'absolute',
        width: scale(180),
        height: scale(180),
        borderRadius: 999,
        top: -50,
        right: -40,
        backgroundColor: 'rgba(255,255,255,0.08)',
    },
    heroGlowSmall: {
        position: 'absolute',
        width: scale(100),
        height: scale(100),
        borderRadius: 999,
        bottom: -30,
        left: -20,
        backgroundColor: 'rgba(255,255,255,0.06)',
    },
    heroTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: verticalScale(14),
    },
    heroBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        alignSelf: 'flex-start',
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(6),
        borderRadius: 999,
        backgroundColor: 'rgba(15,23,42,0.2)',
    },
    heroBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: '#E2E8F0',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    heroTitle: {
        maxWidth: '86%',
        fontFamily: typography.font.black,
        fontSize: scaleFont(24),
        lineHeight: scaleFont(30),
        color: '#FFFFFF',
        letterSpacing: -0.6,
    },
    heroSubtitle: {
        marginTop: verticalScale(10),
        marginBottom: verticalScale(16),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(20),
        color: 'rgba(255,255,255,0.78)',
    },
    searchWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        backgroundColor: '#FFFFFF',
        borderRadius: moderateScale(16),
        paddingHorizontal: scale(14),
        minHeight: verticalScale(50),
    },
    searchInput: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        color: colors.text,
        paddingVertical: verticalScale(10),
    },
    filterRow: {
        paddingTop: verticalScale(12),
    },
    filterContent: {
        paddingHorizontal: scale(16),
        gap: scale(8),
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(10),
        borderRadius: 999,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    filterChipActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    filterChipText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    filterChipTextActive: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
    },
    contentInner: {
        paddingHorizontal: scale(16),
        paddingTop: verticalScale(14),
        paddingBottom: verticalScale(32),
    },
    emptyCard: {
        backgroundColor: colors.card,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: colors.border,
        padding: scale(18),
        ...shadows.card,
    },
    emptyTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(17),
        color: colors.text,
    },
    emptyText: {
        marginTop: verticalScale(8),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(20),
        color: colors.text2,
    },
    quickWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
        marginTop: verticalScale(14),
    },
    quickChip: {
        backgroundColor: colors.primaryBg,
        borderRadius: 999,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
    },
    quickChipText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.primary,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: verticalScale(16),
        marginBottom: verticalScale(12),
    },
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(16),
        color: colors.text,
    },
    sectionMeta: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    feedbackCard: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(22),
        ...shadows.card,
    },
    feedbackTitle: {
        marginTop: verticalScale(8),
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.text,
    },
    feedbackText: {
        marginTop: verticalScale(8),
        textAlign: 'center',
        fontFamily: typography.font.medium,
        fontSize: scaleFont(13),
        lineHeight: scaleFont(19),
        color: colors.text2,
    },
    resultList: {
        gap: verticalScale(10),
        marginTop: verticalScale(10),
    },
    resultCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
        padding: scale(14),
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.card,
        ...shadows.card,
    },
    resultCardPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.995 }],
    },
    resultIconWrap: {
        width: scale(44),
        height: scale(44),
        borderRadius: moderateScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    resultBody: {
        flex: 1,
    },
    resultTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: scale(8),
    },
    resultTitle: {
        flex: 1,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    typePill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(4),
    },
    typePillText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
    },
    aliasText: {
        marginTop: verticalScale(6),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text2,
    },
    resultSummary: {
        marginTop: verticalScale(6),
        fontFamily: typography.font.medium,
        fontSize: scaleFont(12.5),
        lineHeight: scaleFont(19),
        color: colors.text,
    },
    loadMoreBtn: {
        marginTop: verticalScale(14),
        minHeight: verticalScale(48),
        borderRadius: radius.md,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: scale(8),
    },
    loadMoreText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: '#FFFFFF',
    },
});
