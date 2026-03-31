import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, type ReactNode } from 'react';
import {
    Animated,
    Easing,
    Pressable,
    Text,
    View,
    type ViewStyle,
} from 'react-native';
import { styles } from './styles';
import { shared } from '../../styles/shared';
import { colors, gradients } from '../../styles/tokens';

interface Props {
    width: number;
    currentPage: number;
    totalPages: number;
    goTo: (page: number) => void;
    setAuthTab: (tab: 'login' | 'register') => void;
    renderDots: () => React.JSX.Element;
}

export default function WelcomePage({
    width,
    goTo,
    setAuthTab,
    renderDots,
}: Props): React.JSX.Element {
    const ringRotate = useRef(new Animated.Value(0)).current;
    const bellPulse = useRef(new Animated.Value(1)).current;
    const chip1Anim = useRef(new Animated.Value(0)).current;
    const chip2Anim = useRef(new Animated.Value(0)).current;
    const chip3Anim = useRef(new Animated.Value(0)).current;
    const chip4Anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.timing(ringRotate, {
                toValue: 1,
                duration: 18000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ).start();

        const chipAnims = [chip1Anim, chip2Anim, chip3Anim, chip4Anim];
        chipAnims.forEach((anim, i) => {
            Animated.timing(anim, {
                toValue: 1,
                duration: 500,
                delay: 300 + i * 150,
                easing: Easing.out(Easing.back(1.4)),
                useNativeDriver: true,
            }).start();
        });
    }, []);

    const ringSpin = ringRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });
    const ringSpinReverse = ringRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-360deg'],
    });

    const renderChip = (
        animValue: Animated.Value,
        style: ViewStyle,
        icon: ReactNode,
        title: string,
        sub: string,
    ) => (
        <Animated.View
            style={[
                styles.chip,
                style,
                { opacity: animValue, transform: [{ scale: animValue }] },
            ]}
        >
            {icon}
            <View>
                <Text style={styles.chipText}>{title}</Text>
                <Text style={styles.chipSub}>{sub}</Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={[styles.page, { width }]}>
            {renderDots()}
            <View style={styles.s1Content}>
                <View style={styles.s1Hero}>
                    <View style={styles.heroCircle1} />
                    <View style={styles.heroCircle2} />
                    <View style={styles.illusWrap}>
                        <Animated.View
                            style={[
                                styles.illusRing,
                                { transform: [{ rotate: ringSpin }] },
                            ]}
                        />
                        <Animated.View
                            style={[
                                styles.illusRing2,
                                { transform: [{ rotate: ringSpinReverse }] },
                            ]}
                        />
                        <LinearGradient
                            colors={gradients.brandDuo}
                            style={styles.illusCenter}
                        >
                            <Feather name='activity' size={44} color='#fff' />
                        </LinearGradient>
                        {renderChip(
                            chip1Anim,
                            styles.chip1,
                            <MaterialCommunityIcons
                                name='pill'
                                size={14}
                                color={colors.cReminder}
                            />,
                            'Nhắc thuốc',
                            'đúng giờ',
                        )}
                        {renderChip(
                            chip2Anim,
                            styles.chip2,
                            <MaterialCommunityIcons
                                name='file-document-outline'
                                size={14}
                                color={colors.cDanger}
                            />,
                            'Vaccine',
                            'đúng lịch',
                        )}
                        {renderChip(
                            chip3Anim,
                            styles.chip3,
                            <Ionicons
                                name='calendar-outline'
                                size={14}
                                color={colors.cMedical}
                            />,
                            'Tái khám',
                            'đúng hẹn',
                        )}
                        {renderChip(
                            chip4Anim,
                            styles.chip4,
                            <Ionicons
                                name='people-outline'
                                size={14}
                                color={colors.cFamily}
                            />,
                            'Gia đình',
                            'đầy đủ',
                        )}
                    </View>
                </View>
                <View style={styles.s1BodyText}>
                    <View
                        style={[
                            shared.inlineBadge,
                            { backgroundColor: colors.secondaryBg },
                        ]}
                    >
                        <Feather
                            name='activity'
                            size={12}
                            color={colors.secondary}
                        />
                        <Text
                            style={[
                                shared.inlineBadgeText,
                                { color: colors.secondary },
                            ]}
                        >
                            HomeMedAI
                        </Text>
                    </View>
                    <Text style={styles.s1Title}>
                        Một nơi quản lý{'\n'}
                        <Text style={{ color: colors.primary }}>
                            sức khoẻ
                        </Text>{' '}
                        cho bạn{'\n'}và gia đình
                    </Text>
                    <Text style={styles.s1Desc}>
                        Theo dõi lịch khám, nhắc uống thuốc và tiêm chủng — mọi
                        thứ trong tầm tay.
                    </Text>
                </View>
            </View>
            <View style={styles.sBtn}>
                <Pressable
                    style={({ pressed }) => [
                        shared.btnFilled,
                        {
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                        },
                        pressed && shared.pressed,
                    ]}
                    onPress={() => goTo(1)}
                >
                    <Text style={shared.btnFilledText}>Bắt đầu ngay</Text>
                    <Feather
                        name='arrow-right'
                        size={16}
                        color='#fff'
                        style={{ marginLeft: 8 }}
                    />
                </Pressable>
                <Pressable
                    style={({ pressed }) => [
                        shared.btnOutline,
                        { marginTop: 10 },
                        pressed && shared.pressed,
                    ]}
                    onPress={() => {
                        import('expo-router').then(({ router }) => {
                            router.push('/auth');
                        });
                    }}
                >
                    <Text style={shared.btnOutlineText}>
                        Tôi đã có tài khoản
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
