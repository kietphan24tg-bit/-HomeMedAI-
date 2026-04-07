import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

export default function NotificationScreen({
    onClose,
}: Props): React.JSX.Element {
    const [items, setItems] = useState<NotificationItem[]>(() =>
        RICH_NOTIFICATIONS.map((item) => ({ ...item })),
    );

    const markRead = useCallback((id: string) => {
        setItems((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, unread: false } : item,
            ),
        );
    }, []);

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
                {GROUPS.map((group) => {
                    const groupItems = items.filter(
                        (item) => item.day === group.key,
                    );
                    if (groupItems.length === 0) return null;

                    return (
                        <View key={group.key}>
                            <Text style={styles.notiGroupLabel}>
                                {group.label}
                            </Text>
                            {groupItems.map((item) => (
                                <NotiCard
                                    key={item.id}
                                    item={item}
                                    onPress={() => markRead(item.id)}
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
}: {
    item: NotificationItem;
    onPress: () => void;
}) {
    const meta = NOTI_TYPE_META[item.type];

    return (
        <Pressable style={styles.notiCard} onPress={onPress}>
            <View style={styles.notiCardHeader}>
                <View style={styles.notiCardHeaderLeft}>
                    <View
                        style={[
                            styles.notiIcon,
                            { backgroundColor: meta.iconBg },
                        ]}
                    >
                        <NotiTypeIcon type={item.type} color={meta.iconColor} />
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
                        <Text style={styles.notiBody} numberOfLines={1}>
                            {item.detail ?? item.body ?? ''}
                        </Text>
                    </View>
                </View>

                <View style={styles.notiTimeWrap}>
                    <Text style={styles.notiTime}>{item.time}</Text>
                </View>
            </View>
        </Pressable>
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
