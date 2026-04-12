import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { notificationsService } from '@/src/services/notifications.services';
import type { NotificationApiItem } from '@/src/services/notifications.services';
import { moderateScale, scale, verticalScale } from '@/src/styles/responsive';
import type { NotiDay, NotificationItem, NotiType } from '@/src/types/health';
import { styles } from './styles';
import { RICH_NOTIFICATIONS } from '../../data/health-data';
import { colors } from '../../styles/tokens';

const NOTI_TYPE_META: Record<
    NotiType,
    { iconBg: string; iconColor: string; accent: string }
> = {
    med: {
        iconBg: '#FFF3E8',
        iconColor: '#E4871B',
        accent: '#EC8B24',
    },
    appt: {
        iconBg: '#EAF7F1',
        iconColor: '#1C7B63',
        accent: '#0F6E56',
    },
    vax: {
        iconBg: '#F3EDFF',
        iconColor: '#8564D8',
        accent: '#8C6BE6',
    },
};

const GROUPS: { key: NotiDay; label: string }[] = [
    { key: 'today', label: 'Hôm nay' },
    { key: 'yesterday', label: 'Hôm qua' },
    { key: 'before', label: 'Trước đó' },
];

interface Props {
    onClose: () => void;
}

function getDayGroup(isoDate?: string | null): NotiDay {
    if (!isoDate) return 'today';
    const date = new Date(isoDate);
    const today = new Date();
    const todayKey = today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = yesterday.toDateString();

    const valueKey = date.toDateString();
    if (valueKey === todayKey) return 'today';
    if (valueKey === yesterdayKey) return 'yesterday';
    return 'before';
}

function formatTime(item: NotificationApiItem) {
    if (item.remind_time) return item.remind_time;
    if (item.scheduled_at) {
        const date = new Date(item.scheduled_at);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }
    return '--:--';
}

function mapApiNotification(item: NotificationApiItem): NotificationItem {
    const isCompleted = item.status === 'COMPLETED';
    const title = item.title || 'Nhắc uống thuốc';
    const summary = item.medicine_name || undefined;
    const detailParts: string[] = [];
    if (item.medicine_name) {
        detailParts.push(item.medicine_name);
    }
    if (item.dosage_per_time) {
        detailParts.push(`Liều ${item.dosage_per_time}`);
    }
    const detail = detailParts.length
        ? detailParts.join(' • ')
        : (item.body ?? undefined);

    const st = item.status ?? '';
    const showCompliance =
        item.category === 'MEDICINE' && st !== 'COMPLETED' && st !== 'PAUSED';

    return {
        id: item.id,
        day: getDayGroup(item.scheduled_at),
        type: 'med',
        unread: !isCompleted,
        title,
        summary,
        detail,
        time: formatTime(item),
        context: item.family_name ?? item.profile_name ?? undefined,
        statusLabel: isCompleted ? 'Đã dùng' : 'Đến giờ',
        statusTone: isCompleted ? 'success' : 'warning',
        showComplianceActions: showCompliance,
    };
}

function groupTodayByTime(
    list: NotificationItem[],
): [string, NotificationItem[]][] {
    const m = new Map<string, NotificationItem[]>();
    for (const it of list) {
        const k = it.time;
        if (!m.has(k)) m.set(k, []);
        m.get(k)!.push(it);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
}

export default function NotificationScreen({
    onClose,
}: Props): React.JSX.Element {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery({
        queryKey: ['notifications', 'me'],
        queryFn: notificationsService.getMyNotifications,
        staleTime: 1000 * 60,
    });

    const isLiveApi = Boolean(data?.items?.length);

    const mappedItems = useMemo(() => {
        if (!data?.items?.length) {
            return RICH_NOTIFICATIONS.map((item) => ({ ...item }));
        }
        return data.items.map(mapApiNotification);
    }, [data]);

    const [items, setItems] = useState<NotificationItem[]>(mappedItems);

    useEffect(() => {
        setItems(mappedItems);
    }, [mappedItems]);

    const complianceMutation = useMutation({
        mutationFn: ({
            scheduleId,
            outcome,
        }: {
            scheduleId: string;
            outcome: 'taken' | 'skipped';
        }) => notificationsService.logScheduleCompliance(scheduleId, outcome),
        onSuccess: () => {
            void queryClient.invalidateQueries({
                queryKey: ['notifications', 'me'],
            });
        },
    });

    const markRead = useCallback((id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, unread: false } : item,
            ),
        );
    }, []);

    const todaySubtitle = useMemo(
        () =>
            new Date().toLocaleDateString('vi-VN', {
                weekday: 'long',
                day: 'numeric',
                month: 'numeric',
                year: 'numeric',
            }),
        [],
    );

    return (
        <SafeAreaView
            style={{
                flex: 1,
                backgroundColor: styles.notiPage.backgroundColor,
            }}
        >
            <StatusBar
                barStyle='dark-content'
                backgroundColor={styles.notiPage.backgroundColor}
            />

            <View style={styles.notiTopbar}>
                <Pressable style={styles.subBackBtn} onPress={onClose}>
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <View style={{ flex: 1 }}>
                    <Text style={styles.notiTitle}>Thông báo</Text>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.notiScrollContent}
                showsVerticalScrollIndicator={false}
            >
                {isLoading ? (
                    <ActivityIndicator
                        color={colors.text2}
                        style={{ marginTop: verticalScale(16) }}
                    />
                ) : null}
                {!isLoading && items.length === 0 ? (
                    <View style={styles.notiEmptyState}>
                        <Text style={styles.notiEmptyTitle}>
                            Chưa có thông báo
                        </Text>
                        <Text style={styles.notiEmptyDesc}>
                            Khi có lịch nhắc uống thuốc, bạn sẽ thấy thông báo ở
                            đây.
                        </Text>
                    </View>
                ) : null}
                {GROUPS.map((group) => {
                    const groupItems = items.filter(
                        (item) => item.day === group.key,
                    );
                    if (groupItems.length === 0) return null;

                    if (group.key === 'today') {
                        const sorted = [...groupItems].sort((a, b) =>
                            a.time.localeCompare(b.time),
                        );
                        const buckets = groupTodayByTime(sorted);
                        return (
                            <View key={group.key}>
                                <Text style={styles.notiGroupLabel}>
                                    {group.label}
                                </Text>
                                <Text
                                    style={{
                                        fontSize: moderateScale(12),
                                        color: colors.text3,
                                        marginBottom: verticalScale(10),
                                        marginTop: verticalScale(-4),
                                    }}
                                >
                                    {todaySubtitle}
                                </Text>
                                {buckets.map(([time, list]) => (
                                    <View
                                        key={time}
                                        style={{
                                            marginBottom: verticalScale(6),
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: moderateScale(13),
                                                fontWeight: '700',
                                                color: colors.text2,
                                                marginBottom: verticalScale(8),
                                            }}
                                        >
                                            {time}
                                        </Text>
                                        {list.map((item) => (
                                            <NotiCard
                                                key={item.id}
                                                item={item}
                                                isLiveApi={isLiveApi}
                                                onPress={() =>
                                                    markRead(item.id)
                                                }
                                                onCompliance={(outcome) =>
                                                    complianceMutation.mutate({
                                                        scheduleId: item.id,
                                                        outcome,
                                                    })
                                                }
                                                compliancePending={
                                                    complianceMutation.isPending
                                                }
                                            />
                                        ))}
                                    </View>
                                ))}
                            </View>
                        );
                    }

                    return (
                        <View key={group.key}>
                            <Text style={styles.notiGroupLabel}>
                                {group.label}
                            </Text>
                            {groupItems.map((item) => (
                                <NotiCard
                                    key={item.id}
                                    item={item}
                                    isLiveApi={isLiveApi}
                                    onPress={() => markRead(item.id)}
                                    onCompliance={(outcome) =>
                                        complianceMutation.mutate({
                                            scheduleId: item.id,
                                            outcome,
                                        })
                                    }
                                    compliancePending={
                                        complianceMutation.isPending
                                    }
                                />
                            ))}
                        </View>
                    );
                })}
            </ScrollView>
        </SafeAreaView>
    );
}

function NotiCard({
    item,
    onPress,
    isLiveApi,
    onCompliance,
    compliancePending,
}: {
    item: NotificationItem;
    onPress: () => void;
    isLiveApi: boolean;
    onCompliance: (outcome: 'taken' | 'skipped') => void;
    compliancePending: boolean;
}) {
    const meta = NOTI_TYPE_META[item.type];
    const showActions =
        isLiveApi && item.showComplianceActions && item.type === 'med';

    return (
        <View style={styles.notiCard}>
            <Pressable onPress={onPress}>
                <View style={styles.notiCardHeader}>
                    <View style={styles.notiCardHeaderLeft}>
                        <View
                            style={[
                                styles.notiIcon,
                                { backgroundColor: meta.iconBg },
                            ]}
                        >
                            <NotiTypeIcon
                                type={item.type}
                                color={meta.iconColor}
                            />
                        </View>

                        <View style={styles.notiHeaderMeta}>
                            <Text
                                style={[
                                    styles.notiHeaderType,
                                    { color: meta.iconColor },
                                ]}
                            >
                                {item.title.toUpperCase()}
                            </Text>
                            <Text style={styles.notiSummary}>
                                {item.summary ?? item.title}
                            </Text>
                            <Text style={styles.notiBody} numberOfLines={2}>
                                {item.detail ?? item.body ?? ''}
                            </Text>
                            {item.context ? (
                                <Text
                                    style={{
                                        fontSize: moderateScale(11),
                                        color: colors.text3,
                                        marginTop: verticalScale(4),
                                    }}
                                >
                                    {item.context}
                                </Text>
                            ) : null}
                        </View>
                    </View>

                    <View style={styles.notiTimeWrap}>
                        <Text style={styles.notiTime}>{item.time}</Text>
                    </View>
                </View>
            </Pressable>
            {showActions ? (
                <View
                    style={{
                        flexDirection: 'row',
                        gap: scale(10),
                        marginTop: verticalScale(12),
                        paddingTop: verticalScale(10),
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                    }}
                >
                    <Pressable
                        onPress={() => onCompliance('skipped')}
                        disabled={compliancePending}
                        style={{
                            flex: 1,
                            paddingVertical: verticalScale(10),
                            borderRadius: moderateScale(12),
                            borderWidth: 1,
                            borderColor: colors.border,
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                fontWeight: '600',
                                color: colors.text2,
                            }}
                        >
                            Bỏ qua
                        </Text>
                    </Pressable>
                    <Pressable
                        onPress={() => onCompliance('taken')}
                        disabled={compliancePending}
                        style={{
                            flex: 1,
                            paddingVertical: verticalScale(10),
                            borderRadius: moderateScale(12),
                            backgroundColor: '#0E8A7D',
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ fontWeight: '600', color: '#fff' }}>
                            Đã uống
                        </Text>
                    </Pressable>
                </View>
            ) : null}
        </View>
    );
}

function NotiTypeIcon({ type, color }: { type: NotiType; color: string }) {
    if (type === 'med') {
        return <MaterialCommunityIcons name='pill' size={18} color={color} />;
    }
    if (type === 'vax') {
        return <MaterialCommunityIcons name='needle' size={18} color={color} />;
    }
    return <Ionicons name='calendar-outline' size={18} color={color} />;
}
