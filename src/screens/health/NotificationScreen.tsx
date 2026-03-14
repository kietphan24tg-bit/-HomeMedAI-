import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { NOTIFICATIONS } from '../../data/health-data';
import { colors, typography } from '../../styles/tokens';
import type { NotificationItem, NotiType } from '../../types';

/* ── Type metadata ── */
const NOTI_TYPE_META: Record<
    NotiType,
    { label: string; iconBg: string; iconColor: string }
> = {
    med: { label: 'Thuốc', iconBg: '#FFF7ED', iconColor: '#EA580C' },
    vax: { label: 'Vaccine', iconBg: '#F0FDF4', iconColor: '#16A34A' },
    appt: { label: 'Tái khám', iconBg: '#EFF6FF', iconColor: '#2563EB' },
};

const GROUPS = [
    { key: 'today' as const, label: 'Hôm nay' },
    { key: 'yesterday' as const, label: 'Hôm qua' },
    { key: 'before' as const, label: 'Trước đó' },
];

interface Props {
    onClose: () => void;
}

export default function NotificationScreen({
    onClose,
}: Props): React.JSX.Element {
    const [items, setItems] = useState(() =>
        NOTIFICATIONS.map((n) => ({ ...n })),
    );

    const unreadCount = items.filter((n) => n.unread).length;

    const markRead = useCallback((id: string) => {
        setItems((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        );
    }, []);

    const markAllRead = useCallback(() => {
        setItems((prev) => prev.map((n) => ({ ...n, unread: false })));
    }, []);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOPBAR */}
            <View style={styles.notiTopbar}>
                <Pressable style={styles.subBackBtn} onPress={onClose}>
                    <Ionicons
                        name='chevron-back'
                        size={16}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.notiTitle}>Thông báo</Text>
                    <Text style={styles.notiUnreadCount}>
                        {unreadCount > 0
                            ? `${unreadCount} chưa đọc`
                            : 'Tất cả đã đọc'}
                    </Text>
                </View>
                <Pressable style={styles.notiMarkAllBtn} onPress={markAllRead}>
                    <Text style={styles.notiMarkAllText}>Đọc tất cả</Text>
                </Pressable>
            </View>

            {/* LIST */}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {GROUPS.map((g) => {
                    const groupItems = items.filter((n) => n.day === g.key);
                    if (groupItems.length === 0) return null;
                    return (
                        <View key={g.key}>
                            <Text style={styles.notiGroupLabel}>{g.label}</Text>
                            {groupItems.map((n) => (
                                <NotiRow
                                    key={n.id}
                                    item={n}
                                    onPress={() => markRead(n.id)}
                                />
                            ))}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

/* ═══════════════════════════════════ */
/*  NotiRow                            */
/* ═══════════════════════════════════ */
function NotiRow({
    item,
    onPress,
}: {
    item: NotificationItem;
    onPress: () => void;
}) {
    const meta = NOTI_TYPE_META[item.type];

    return (
        <Pressable
            style={[
                styles.notiItem,
                item.unread ? styles.notiItemUnread : styles.notiItemRead,
            ]}
            onPress={onPress}
        >
            {/* Icon */}
            <View style={[styles.notiIcon, { backgroundColor: meta.iconBg }]}>
                <NotiTypeIcon type={item.type} color={meta.iconColor} />
            </View>

            {/* Content */}
            <View style={{ flex: 1, minWidth: 0 }}>
                <View style={styles.notiTitleRow}>
                    <Text
                        style={[
                            styles.notiItemTitle,
                            item.unread && { fontFamily: typography.font.bold },
                        ]}
                        numberOfLines={1}
                    >
                        {item.title}
                    </Text>
                    <Text style={styles.notiTime}>{item.time}</Text>
                </View>
                {item.type === 'vax' ? (
                    <VaxBody body={item.body} />
                ) : (
                    <Text style={styles.notiBody}>{item.body}</Text>
                )}
            </View>
        </Pressable>
    );
}

/* ── Icon by type ── */
function NotiTypeIcon({ type, color }: { type: NotiType; color: string }) {
    if (type === 'med') {
        return <MaterialCommunityIcons name='pill' size={18} color={color} />;
    }
    if (type === 'vax') {
        return <MaterialCommunityIcons name='needle' size={18} color={color} />;
    }
    // appt
    return <Ionicons name='heart-outline' size={18} color={color} />;
}

/* ── Vax body with chips ── */
function VaxBody({ body }: { body: string }) {
    const parts = body.split(' · ');
    const doseChip = parts[0] || '';
    const schedPart = parts[1] || '';
    const datePart = parts[2] || '';
    const isDone = !doseChip.startsWith('0');
    const chipColor = isDone ? '#D97706' : '#EF4444';
    const chipBg = isDone ? '#FFFBEB' : '#FFF1F2';
    const chipBorder = isDone ? '#FDE68A' : '#FECDD3';
    const lineText = [schedPart, datePart].filter(Boolean).join(' · ');

    return (
        <View>
            <View style={styles.notiVaxChips}>
                <View
                    style={[
                        styles.notiVaxChip,
                        {
                            backgroundColor: chipBg,
                            borderColor: chipBorder,
                        },
                    ]}
                >
                    <Text
                        style={[styles.notiVaxChipText, { color: chipColor }]}
                    >
                        {doseChip}
                    </Text>
                </View>
            </View>
            {lineText !== '' && (
                <View style={styles.notiVaxDateRow}>
                    <Ionicons
                        name='calendar-outline'
                        size={11}
                        color='#2563EB'
                    />
                    <Text style={styles.notiVaxDateText}>{lineText}</Text>
                </View>
            )}
        </View>
    );
}
