import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from './styles';
import { PERMS } from '../../data/onboarding-data';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';

interface Props {
    width: number;
    goTo: (page: number) => void;
    renderDots: () => React.JSX.Element;
}

export default function PermissionPage({
    width,
    goTo,
    renderDots,
}: Props): React.JSX.Element {
    const bellPulse = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(bellPulse, {
                    toValue: 1.15,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(bellPulse, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ]),
        ).start();
    }, []);

    return (
        <View style={[styles.page, { width }]}>
            {renderDots()}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.sScroll}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.s3Illo}>
                    <View style={styles.s3BellArea}>
                        <View style={styles.s3PulseRing2} />
                        <View style={styles.s3PulseRing1} />
                        <Animated.View
                            style={[
                                styles.bellWrap,
                                { transform: [{ scale: bellPulse }] },
                            ]}
                        >
                            <Ionicons
                                name='notifications'
                                size={52}
                                color={colors.cReminder}
                            />
                        </Animated.View>
                    </View>
                    <Text style={styles.s3IlloTitle}>Nhắc nhở thông minh</Text>
                </View>
                <View
                    style={[
                        shared.inlineBadge,
                        { backgroundColor: colors.cReminderBg },
                    ]}
                >
                    <Ionicons
                        name='notifications-outline'
                        size={11}
                        color={colors.cReminder}
                    />
                    <Text
                        style={[
                            shared.inlineBadgeText,
                            { color: colors.cReminder },
                        ]}
                    >
                        Thông báo
                    </Text>
                </View>
                <Text style={styles.s2Title}>
                    HomeMedAI luôn{'\n'}
                    <Text style={{ color: '#F59E0B' }}>ở đây</Text> nhắc bạn
                </Text>
                <Text style={styles.s3Desc}>
                    Cho phép thông báo để không bỏ lỡ lịch hẹn, thuốc hay
                    vaccine quan trọng.
                </Text>
                <View style={styles.permList}>
                    {PERMS.map((p) => (
                        <View key={p.title} style={styles.permRow}>
                            <View
                                style={[
                                    styles.permIcon,
                                    { backgroundColor: p.bg },
                                ]}
                            >
                                {p.iconComponent}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.permTitle}>{p.title}</Text>
                                <Text style={styles.permDetail}>{p.desc}</Text>
                            </View>
                            <View style={styles.permCheck}>
                                <Feather
                                    name='check'
                                    size={12}
                                    color={colors.primary}
                                />
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View style={styles.sBtn}>
                <Pressable
                    style={({ pressed }) => [
                        shared.btnFilled,
                        {
                            backgroundColor: colors.cReminder,
                            shadowColor: colors.cReminder,
                        },
                        pressed && shared.pressed,
                    ]}
                    onPress={() => goTo(3)}
                >
                    <Ionicons
                        name='notifications'
                        size={16}
                        color='#fff'
                        style={{ marginRight: 8 }}
                    />
                    <Text style={shared.btnFilledText}>Cho phép thông báo</Text>
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        styles.btnSkip,
                        pressed && shared.pressed,
                    ]}
                    onPress={() => goTo(3)}
                >
                    <Text style={styles.btnSkipText}>Bỏ qua, để sau</Text>
                </Pressable>
            </View>
        </View>
    );
}
