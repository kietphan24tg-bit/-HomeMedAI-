import { Feather, Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '../../styles/responsive';
import { shared } from '../../styles/shared';
import { colors, typography } from '../../styles/tokens';

const PAGE_BG = '#F0F4FF';

const GENDERS = [
    { key: 'Nam', label: 'Nam', icon: 'male-outline' as const },
    { key: 'Nữ', label: 'Nữ', icon: 'female-outline' as const },
    { key: 'Khác', label: 'Khác', icon: 'male-female-outline' as const },
];

function formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd} / ${mm} / ${d.getFullYear()}`;
}

interface Props {
    /** When true, skip SafeAreaView wrapper (used inside onboarding pager) */
    embedded?: boolean;
    /** Width override for the onboarding pager layout */
    width?: number;
    /** Callback when user finishes; if omitted navigates to /(tabs) */
    onComplete?: () => void;
}

export default function PersonalInfoScreen({
    embedded = false,
    width,
    onComplete,
}: Props): React.JSX.Element {
    /* ── form state ── */
    const [dob, setDob] = useState<Date | null>(null);
    const [fullName, setFullName] = useState('');
    const [dobText, setDobText] = useState('');
    const [showPicker, setShowPicker] = useState(false);
    const [gender, setGender] = useState('');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');
    const [address, setAddress] = useState('');

    /* ── focus state ── */
    const [focusFullName, setFocusFullName] = useState(false);
    const [focusDob, setFocusDob] = useState(false);
    const [focusHeight, setFocusHeight] = useState(false);
    const [focusWeight, setFocusWeight] = useState(false);
    const [focusAddr, setFocusAddr] = useState(false);

    /* ── staggered entrance ── */
    const anims = useRef(
        Array.from({ length: 7 }, () => new Animated.Value(0)),
    ).current;
    useEffect(() => {
        Animated.stagger(
            70,
            anims.map((a, i) =>
                Animated.timing(a, {
                    toValue: 1,
                    duration: 440,
                    delay: 60 + i * 90,
                    easing: Easing.out(Easing.back(1.15)),
                    useNativeDriver: true,
                }),
            ),
        ).start();
    }, []);
    const anim = (i: number) => ({
        opacity: anims[i],
        transform: [
            {
                translateY: anims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                }),
            },
        ],
    });

    /* ── date helpers ── */
    const handleDobText = (text: string) => {
        let c = text.replace(/\D/g, '');
        if (c.length > 8) c = c.slice(0, 8);
        let f = c;
        if (c.length > 2) f = c.slice(0, 2) + ' / ' + c.slice(2);
        if (c.length > 4) f = f.slice(0, 7) + ' / ' + c.slice(4);
        setDobText(f);
        if (c.length === 8) {
            const date = new Date(
                +c.slice(4, 8),
                +c.slice(2, 4) - 1,
                +c.slice(0, 2),
            );
            if (!isNaN(date.getTime())) setDob(date);
        }
    };
    const handlePicker = useCallback((_e: DateTimePickerEvent, d?: Date) => {
        if (Platform.OS === 'android') setShowPicker(false);
        if (d) {
            setDob(d);
            setDobText(formatDate(d));
        }
    }, []);
    const closePicker = useCallback(() => setShowPicker(false), []);

    /* ── complete action ── */
    const handleComplete = () => {
        if (onComplete) {
            onComplete();
        } else {
            router.replace('/(tabs)');
        }
    };

    /* ── shorthand styles ── */
    const card = (focused: boolean) => [
        s.inputCard,
        focused && s.inputCardFocus,
    ];

    const Wrapper = embedded ? View : SafeAreaView;
    const containerStyle = embedded
        ? [s.page, { width, backgroundColor: PAGE_BG }]
        : [s.page, { backgroundColor: PAGE_BG }];

    return (
        <Wrapper style={containerStyle}>
            {!embedded && (
                <StatusBar barStyle='dark-content' backgroundColor={PAGE_BG} />
            )}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={s.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
                automaticallyAdjustKeyboardInsets={true}
            >
                {/* ── HEADER ── */}
                <Animated.View style={[s.header, anim(0)]}>
                    <View style={s.badge}>
                        <Ionicons
                            name='person-outline'
                            size={11}
                            color={colors.primary}
                        />
                        <Text style={s.badgeText}>Thông tin cá nhân</Text>
                    </View>
                    <Text style={s.title}>
                        {'Hãy cho HomeMedAI\n'}
                        <Text style={{ color: colors.primary }}>
                            biết về bạn
                        </Text>
                    </Text>
                    <Text style={s.sub}>
                        Thông tin giúp cá nhân hoá và theo dõi sức khoẻ chính
                        xác hơn.
                    </Text>
                </Animated.View>

                {/* ── HỌ VÀ TÊN ── */}
                <Animated.View style={[s.inputGroup, anim(1)]}>
                    <Text style={s.label}>Họ và tên</Text>
                    <View style={card(focusFullName)}>
                        <Ionicons
                            name='person-outline'
                            size={16}
                            color={colors.primary}
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            style={[s.inputText, { flex: 1 }]}
                            value={fullName}
                            onChangeText={setFullName}
                            placeholder='Nguyễn Văn An'
                            placeholderTextColor={colors.text3}
                            onFocus={() => setFocusFullName(true)}
                            onBlur={() => setFocusFullName(false)}
                        />
                    </View>
                </Animated.View>

                {/* ── NGÀY SINH ── */}
                <Animated.View style={[s.inputGroup, anim(2)]}>
                    <Text style={s.label}>Ngày sinh</Text>
                    <Pressable
                        style={card(focusDob)}
                        onPress={() => setShowPicker(true)}
                    >
                        <Ionicons
                            name='calendar-outline'
                            size={16}
                            color={colors.primary}
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            style={s.inputText}
                            value={dobText}
                            onChangeText={handleDobText}
                            placeholder='DD / MM / YYYY'
                            placeholderTextColor={colors.text3}
                            keyboardType='numeric'
                            maxLength={14}
                            onFocus={() => setFocusDob(true)}
                            onBlur={() => setFocusDob(false)}
                        />
                    </Pressable>
                    {showPicker &&
                        (Platform.OS === 'ios' ? (
                            <View style={s.iosWrap}>
                                <View style={s.iosBar}>
                                    <Pressable onPress={closePicker}>
                                        <Text style={s.iosDone}>Xong</Text>
                                    </Pressable>
                                </View>
                                <DateTimePicker
                                    value={dob ?? new Date()}
                                    mode='date'
                                    display='inline'
                                    onChange={handlePicker}
                                    themeVariant='light'
                                />
                            </View>
                        ) : (
                            <DateTimePicker
                                value={dob ?? new Date()}
                                mode='date'
                                display='default'
                                onChange={handlePicker}
                            />
                        ))}
                </Animated.View>

                {/* ── GIỚI TÍNH ── */}
                <Animated.View style={[s.inputGroup, anim(3)]}>
                    <Text style={s.label}>Giới tính</Text>
                    <View style={s.genderRow}>
                        {GENDERS.map(({ key, label, icon }) => {
                            const active = gender === key;
                            return (
                                <Pressable
                                    key={key}
                                    onPress={() => setGender(key)}
                                    style={({ pressed }) => [
                                        s.genderBtn,
                                        active && s.genderBtnActive,
                                        pressed && shared.pressed,
                                    ]}
                                >
                                    <Ionicons
                                        name={icon}
                                        size={22}
                                        color={
                                            active
                                                ? colors.primary
                                                : colors.text3
                                        }
                                        style={{
                                            marginBottom: verticalScale(4),
                                        }}
                                    />
                                    <Text
                                        style={[
                                            s.genderLabel,
                                            active && s.genderLabelActive,
                                        ]}
                                    >
                                        {label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </Animated.View>

                {/* ── CHIỀU CAO + CÂN NẶNG ── */}
                <Animated.View style={[s.dualRow, anim(4)]}>
                    <View style={{ flex: 1 }}>
                        <Text style={s.label}>Chiều cao</Text>
                        <View style={card(focusHeight)}>
                            <TextInput
                                style={[s.metricInput, { flex: 1 }]}
                                value={height}
                                onChangeText={setHeight}
                                placeholder='170'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                maxLength={3}
                                onFocus={() => setFocusHeight(true)}
                                onBlur={() => setFocusHeight(false)}
                            />
                            <Text style={s.metricUnit}>cm</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={s.label}>Cân nặng</Text>
                        <View style={card(focusWeight)}>
                            <TextInput
                                style={[s.metricInput, { flex: 1 }]}
                                value={weight}
                                onChangeText={setWeight}
                                placeholder='65'
                                placeholderTextColor={colors.text3}
                                keyboardType='numeric'
                                maxLength={3}
                                onFocus={() => setFocusWeight(true)}
                                onBlur={() => setFocusWeight(false)}
                            />
                            <Text style={s.metricUnit}>kg</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* ── ĐỊA CHỈ ── */}
                <Animated.View style={[s.inputGroup, anim(5)]}>
                    <Text style={s.label}>Địa chỉ</Text>
                    <View style={card(focusAddr)}>
                        <Ionicons
                            name='location-outline'
                            size={16}
                            color={colors.primary}
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            style={[s.inputText, { flex: 1 }]}
                            value={address}
                            onChangeText={setAddress}
                            placeholder='Hồ Chí Minh'
                            placeholderTextColor={colors.text3}
                            onFocus={() => setFocusAddr(true)}
                            onBlur={() => setFocusAddr(false)}
                        />
                    </View>
                </Animated.View>

                {/* ── BUTTON ── */}
                <Animated.View style={[s.btnWrap, anim(6)]}>
                    <Pressable
                        style={({ pressed }) => [pressed && shared.pressed]}
                        onPress={handleComplete}
                    >
                        <LinearGradient
                            colors={[colors.primary, colors.secondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={[
                                shared.btnFilled,
                                s.btn,
                                { shadowColor: colors.primary },
                            ]}
                        >
                            <Text style={[shared.btnFilledText, s.btnText]}>
                                Tiếp theo
                            </Text>
                            <Feather
                                name='arrow-right'
                                size={18}
                                color='#fff'
                                style={{ marginLeft: 8 }}
                            />
                        </LinearGradient>
                    </Pressable>
                </Animated.View>
            </ScrollView>
        </Wrapper>
    );
}

/* ── local styles ── */
const s = StyleSheet.create({
    page: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(32),
        flexGrow: 1,
    },
    header: {
        paddingTop: verticalScale(6),
        paddingBottom: verticalScale(18),
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        backgroundColor: 'rgba(37,99,235,0.10)',
        borderRadius: moderateScale(20),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        marginBottom: verticalScale(10),
        alignSelf: 'flex-start',
    },
    badgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.primary,
    },
    title: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(26),
        color: colors.text,
        lineHeight: verticalScale(34),
        letterSpacing: -0.5,
        marginBottom: verticalScale(6),
    },
    sub: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13),
        color: colors.text2,
        lineHeight: verticalScale(20),
    },
    inputGroup: {
        marginBottom: verticalScale(12),
    },
    label: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10),
        color: colors.text3,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: verticalScale(5),
        paddingLeft: scale(2),
    },
    inputCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(11),
    },
    inputCardFocus: {
        borderColor: colors.primary,
    },
    inputText: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(14),
        color: colors.text,
        padding: 0,
    },
    genderRow: {
        flexDirection: 'row',
        gap: scale(8),
    },
    genderBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(6),
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: '#ffffff',
    },
    genderBtnActive: {
        borderColor: colors.primary,
        backgroundColor: colors.primaryBg,
    },
    genderLabel: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12),
        color: colors.text2,
    },
    genderLabelActive: {
        color: colors.primary,
    },
    dualRow: {
        flexDirection: 'row',
        gap: scale(10),
        marginBottom: verticalScale(12),
    },
    metricInput: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(18),
        color: colors.text,
        padding: 0,
    },
    metricUnit: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: '#CBD5E1',
        marginLeft: scale(4),
        flexShrink: 0,
    },
    btnWrap: {
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(8),
    },
    btn: {
        borderRadius: moderateScale(18),
    },
    btnText: {
        fontSize: scaleFont(15),
        letterSpacing: 0.2,
        fontFamily: typography.font.black,
    },
    /* date picker iOS */
    iosWrap: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(12),
        marginTop: verticalScale(6),
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    iosBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iosDone: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.primary,
    },
});
