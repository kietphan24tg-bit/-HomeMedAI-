// src/screens/home/HomeScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from './styles';
import { FAMILIES } from '../../data/family-data';
import {
    ARTICLES,
    FAMILY,
    MEDS,
    SCHEDULE,
    STAT_CARDS,
} from '../../data/home-data';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';
import NotificationScreen from '../health/NotificationScreen';

const HERO_GRADIENT = ['#1D4ED8', '#2563EB', '#0D9488'] as const;
const HERO_GRADIENT_LOCS = [0, 0.55, 1] as const;

const { height: SCREEN_H } = Dimensions.get('window');

export default function HomeScreen(): React.JSX.Element {
    const [mode, setMode] = useState<'personal' | 'family'>('personal');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;

    const openPicker = () => {
        setPickerVisible(true);
        Animated.parallel([
            Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                damping: 20,
                stiffness: 180,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closePicker = () => {
        Animated.parallel([
            Animated.timing(backdropAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: SCREEN_H,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => setPickerVisible(false));
    };

    const selectFamily = (id: string) => {
        setSelectedFamily(id);
        setMode('family');
        closePicker();
    };

    if (showNotifications) {
        return (
            <NotificationScreen onClose={() => setShowNotifications(false)} />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOPBAR */}
            <View style={styles.topbar}>
                <Pressable style={styles.avatarWrap}>
                    <LinearGradient
                        colors={['#2563EB', '#14B8A6']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.avatar}
                    >
                        <Text style={styles.avatarText}>AN</Text>
                    </LinearGradient>
                    <View>
                        <Text style={styles.avatarName}>Nguyễn Văn An</Text>
                    </View>
                </Pressable>
                <View style={styles.topbarIcons}>
                    <Pressable
                        style={shared.iconBtn}
                        onPress={() => setShowNotifications(true)}
                    >
                        <Ionicons
                            name='notifications-outline'
                            size={17}
                            color={colors.text2}
                        />
                        <View style={styles.notifDot} />
                    </Pressable>
                    <Pressable style={shared.iconBtn}>
                        <Ionicons
                            name='search-outline'
                            size={17}
                            color={colors.text2}
                        />
                    </Pressable>
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                {/* HERO BANNER */}
                <View style={styles.hero}>
                    <LinearGradient
                        colors={[...HERO_GRADIENT]}
                        locations={[...HERO_GRADIENT_LOCS]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.heroGradient}
                    >
                        {/* Decorative heartbeat icon */}
                        <View style={styles.heroDeco}>
                            <Ionicons name='pulse' size={52} color='#fff' />
                        </View>
                        <Text style={styles.heroGreeting}>
                            👋 Chào buổi sáng, Văn An
                        </Text>
                        <Text style={styles.heroTitle}>
                            Chăm sóc sức khoẻ{'\n'}
                            <Text style={styles.heroTitleHighlight}>
                                mỗi ngày
                            </Text>
                        </Text>
                        <View style={styles.modeToggle}>
                            <Pressable
                                style={[
                                    styles.modeBtn,
                                    mode === 'personal' && styles.modeBtnActive,
                                ]}
                                onPress={() => setMode('personal')}
                            >
                                <Text
                                    style={[
                                        styles.modeTxt,
                                        mode === 'personal' &&
                                            styles.modeTxtActive,
                                    ]}
                                >
                                    Cá nhân
                                </Text>
                            </Pressable>
                            <Pressable
                                style={[
                                    styles.modeBtn,
                                    mode === 'family' && styles.modeBtnActive,
                                ]}
                                onPress={openPicker}
                            >
                                <Text
                                    style={[
                                        styles.modeTxt,
                                        mode === 'family' &&
                                            styles.modeTxtActive,
                                    ]}
                                >
                                    Gia đình
                                </Text>
                            </Pressable>
                        </View>
                    </LinearGradient>
                </View>

                {/* TỔNG QUAN */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Tổng quan</Text>
                    </View>
                    <View style={styles.statGrid}>
                        {STAT_CARDS.map((c) => (
                            <Pressable key={c.id} style={styles.statCard}>
                                <View style={styles.statTop}>
                                    <View
                                        style={[
                                            styles.statIcon,
                                            { backgroundColor: c.iconBg },
                                        ]}
                                    >
                                        <Ionicons
                                            name={c.iconName as any}
                                            size={18}
                                            color={c.iconColor}
                                        />
                                    </View>
                                    <View
                                        style={[
                                            styles.statBadge,
                                            { backgroundColor: c.badgeBg },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statBadgeText,
                                                { color: c.badgeColor },
                                            ]}
                                        >
                                            {c.badgeText}
                                        </Text>
                                    </View>
                                </View>
                                <Text
                                    style={[
                                        styles.statValue,
                                        c.valueColor && { color: c.valueColor },
                                        c.valueSize
                                            ? {
                                                  fontSize: c.valueSize,
                                                  fontWeight: '700',
                                              }
                                            : null,
                                    ]}
                                >
                                    {c.value}
                                </Text>
                                <Text style={styles.statLabel}>{c.label}</Text>
                                {c.sub ? (
                                    <Text style={styles.statSub}>{c.sub}</Text>
                                ) : null}
                                {c.progress !== undefined &&
                                c.progress !== null ? (
                                    <View style={styles.progWrap}>
                                        <View style={styles.progTrack}>
                                            <View
                                                style={[
                                                    styles.progFill,
                                                    {
                                                        width: `${c.progress}%`,
                                                        backgroundColor:
                                                            c.progressColor,
                                                    },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                ) : null}
                            </Pressable>
                        ))}
                    </View>
                </View>

                {/* GIA ĐÌNH */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>
                            Thành viên gia đình
                        </Text>
                    </View>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.familyScroll}
                >
                    {FAMILY.map((m) => {
                        return (
                            <Pressable key={m.code} style={[styles.famCard]}>
                                <LinearGradient
                                    colors={m.gradient as [string, string]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.famAvatar}
                                >
                                    <Text style={styles.famAvatarText}>
                                        {m.code}
                                    </Text>
                                </LinearGradient>
                                <Text style={styles.famName}>{m.name}</Text>
                                <Text style={styles.famRole}>{m.role}</Text>
                                <View
                                    style={[
                                        styles.famStatus,
                                        { backgroundColor: m.status },
                                    ]}
                                />
                            </Pressable>
                        );
                    })}
                    <Pressable style={styles.addFam}>
                        <Ionicons
                            name='add-circle-outline'
                            size={22}
                            color={colors.text3}
                        />
                        <Text style={styles.addFamLabel}>Thêm</Text>
                    </Pressable>
                </ScrollView>

                {/* LỊCH SẮP TỚI */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Lịch sắp tới</Text>
                    </View>
                    {SCHEDULE.map((s) => (
                        <Pressable
                            key={s.id}
                            style={({ hovered }: any) => [
                                styles.schedCard,
                                hovered && styles.schedCardHover,
                            ]}
                        >
                            <View
                                style={[
                                    styles.schedLeftStrip,
                                    { backgroundColor: s.color },
                                ]}
                            />
                            <LinearGradient
                                colors={s.gradient as [string, string]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.schedAvatar}
                            >
                                <Text style={styles.schedAvatarText}>
                                    {s.initials}
                                </Text>
                            </LinearGradient>
                            <View style={styles.schedInfo}>
                                <Text style={styles.schedTitle}>{s.title}</Text>
                                <Text style={styles.schedMeta}>{s.meta}</Text>
                            </View>
                            <View style={styles.schedTime}>
                                <Text
                                    style={[
                                        styles.schedTimeVal,
                                        { color: s.color },
                                    ]}
                                >
                                    {s.time}
                                </Text>
                                <Text style={styles.schedTimeDay}>{s.day}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>

                {/* LỊCH UỐNG THUỐC */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Lịch uống thuốc</Text>
                    </View>
                    {MEDS.map((m) => (
                        <Pressable
                            key={m.name}
                            style={({ hovered }: any) => [
                                styles.medCard,
                                hovered && styles.medCardHover,
                            ]}
                        >
                            <View
                                style={[
                                    styles.medIcon,
                                    { backgroundColor: m.bg },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name='pill'
                                    size={18}
                                    color={m.iconColor}
                                />
                            </View>
                            <View style={styles.medInfo}>
                                <Text style={styles.medName}>{m.name}</Text>
                                <Text style={styles.medDose}>{m.info}</Text>
                            </View>
                            <Text style={styles.medTimeTag}>{m.time}</Text>
                        </Pressable>
                    ))}
                </View>

                {/* AI CHATBOT */}
                <View style={styles.chatbotWrap}>
                    <LinearGradient
                        colors={[...HERO_GRADIENT]}
                        locations={[...HERO_GRADIENT_LOCS]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.chatbotGradient}
                    >
                        <View style={styles.chatbotIcon}>
                            <Ionicons
                                name='chatbubble-ellipses-outline'
                                size={22}
                                color='#fff'
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.chatbotTitle}>
                                AI Tư vấn sức khoẻ
                            </Text>
                            <Text style={styles.chatbotDesc}>
                                Hỏi về triệu chứng, thuốc,{'\n'}cách chăm sóc ·
                                24/7
                            </Text>
                        </View>
                        <Ionicons
                            name='chevron-forward'
                            size={20}
                            color='rgba(255,255,255,0.7)'
                        />
                    </LinearGradient>
                </View>

                {/* Y TẾ & SỨC KHOẺ */}
                <View style={[styles.section, { marginTop: 24 }]}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Y tế & Sức khoẻ</Text>
                        <Text style={styles.seeAll}>Xem thêm</Text>
                    </View>
                </View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.articlesScroll}
                >
                    {ARTICLES.map((a) => (
                        <Pressable key={a.title} style={styles.articleCard}>
                            <Image
                                source={{ uri: a.image }}
                                style={styles.articleImg}
                                resizeMode='cover'
                            />
                            <View style={styles.articleBody}>
                                <Text
                                    style={[
                                        styles.articleTag,
                                        {
                                            color: a.color,
                                            backgroundColor: a.bg,
                                        },
                                    ]}
                                >
                                    {a.tag}
                                </Text>
                                <Text style={styles.articleTitle}>
                                    {a.title}
                                </Text>
                            </View>
                        </Pressable>
                    ))}
                </ScrollView>
            </ScrollView>

            {/* FAMILY PICKER BOTTOM SHEET */}
            <Modal
                visible={pickerVisible}
                transparent
                animationType='none'
                statusBarTranslucent
                onRequestClose={closePicker}
            >
                <Animated.View
                    style={[styles.sheetBackdrop, { opacity: backdropAnim }]}
                >
                    <Pressable style={{ flex: 1 }} onPress={closePicker} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.sheetContainer,
                        { transform: [{ translateY: slideAnim }] },
                    ]}
                >
                    <View style={styles.sheetHandle} />

                    <View style={styles.sheetHeader}>
                        <Text style={styles.sheetTitle}>Chọn gia đình</Text>
                        <Text style={styles.sheetSubtitle}>
                            Xem tổng quan sức khoẻ của gia đình nào?
                        </Text>
                    </View>

                    {FAMILIES.map((f) => (
                        <Pressable
                            key={f.id}
                            style={[
                                styles.fpRow,
                                selectedFamily === f.id && styles.fpRowActive,
                            ]}
                            onPress={() => selectFamily(f.id)}
                        >
                            <LinearGradient
                                colors={f.gradientColors}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.fpIcon}
                            >
                                <Ionicons
                                    name={f.iconName as any}
                                    size={22}
                                    color='#fff'
                                />
                            </LinearGradient>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fpName}>{f.name}</Text>
                                <Text style={styles.fpMeta}>
                                    {f.memberCount} thành viên · {f.role}
                                </Text>
                            </View>
                            {selectedFamily === f.id && (
                                <View style={styles.fpCheck}>
                                    <Ionicons
                                        name='checkmark'
                                        size={13}
                                        color='#fff'
                                    />
                                </View>
                            )}
                        </Pressable>
                    ))}
                </Animated.View>
            </Modal>
        </SafeAreaView>
    );
}
