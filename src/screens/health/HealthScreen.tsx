// src/screens/health/HealthScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MedicineScreen from './MedicineScreen';
import NotificationScreen from './NotificationScreen';
import RecordsScreen from './RecordsScreen';
import { styles } from './styles';
import VaccineScreen from './VaccineScreen';
import {
    CardBlock,
    CountStrip,
    NoteRow,
    SectionHeader,
} from '../../components/ui';
import { HEALTH_INFO, MED_ROWS, TIPS, VISITS } from '../../data/health-data';
import { shared } from '../../styles/shared';
import { colors, gradients } from '../../styles/tokens';

type SubScreen =
    | 'main'
    | 'records'
    | 'vaccines'
    | 'medicines'
    | 'notifications';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

type SheetKey = 'blood' | 'disease' | 'allergy' | null;

export default function HealthScreen(): React.JSX.Element {
    const [screen, setScreen] = useState<SubScreen>('main');
    const [sheet, setSheet] = useState<SheetKey>(null);
    const [blood, setBlood] = useState('O+');
    const [draftBlood, setDraftBlood] = useState('O+');
    const [diseases, setDiseases] = useState<string[]>(['Tăng huyết áp']);
    const [draftDiseases, setDraftDiseases] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [draftAllergies, setDraftAllergies] = useState<string[]>([]);
    const [tagText, setTagText] = useState('');

    const openSheet = useCallback(
        (key: SheetKey) => {
            if (key === 'blood') setDraftBlood(blood);
            if (key === 'disease') setDraftDiseases([...diseases]);
            if (key === 'allergy') setDraftAllergies([...allergies]);
            setTagText('');
            setSheet(key);
        },
        [blood, diseases, allergies],
    );

    const closeSheet = useCallback(() => setSheet(null), []);

    const saveSheet = useCallback(() => {
        if (sheet === 'blood') setBlood(draftBlood);
        if (sheet === 'disease') setDiseases([...draftDiseases]);
        if (sheet === 'allergy') setAllergies([...draftAllergies]);
        setSheet(null);
    }, [sheet, draftBlood, draftDiseases, draftAllergies]);

    const addTag = useCallback(
        (tag: string) => {
            const trimmed = tag.trim();
            if (!trimmed) return;
            if (sheet === 'disease') {
                if (!draftDiseases.includes(trimmed)) {
                    setDraftDiseases((prev) => [...prev, trimmed]);
                }
            } else {
                if (!draftAllergies.includes(trimmed)) {
                    setDraftAllergies((prev) => [...prev, trimmed]);
                }
            }
            setTagText('');
        },
        [sheet, draftDiseases, draftAllergies],
    );

    const removeTag = useCallback(
        (tag: string) => {
            if (sheet === 'disease') {
                setDraftDiseases((prev) => prev.filter((t) => t !== tag));
            } else setDraftAllergies((prev) => prev.filter((t) => t !== tag));
        },
        [sheet],
    );

    const sheetTitle =
        sheet === 'blood'
            ? 'Nhóm máu'
            : sheet === 'disease'
              ? 'Bệnh nền'
              : 'Dị ứng';

    // Sub-screen routing
    if (screen === 'records') {
        return <RecordsScreen onClose={() => setScreen('main')} />;
    }
    if (screen === 'vaccines') {
        return <VaccineScreen onClose={() => setScreen('main')} />;
    }
    if (screen === 'medicines') {
        return <MedicineScreen onClose={() => setScreen('main')} />;
    }
    if (screen === 'notifications') {
        return <NotificationScreen onClose={() => setScreen('main')} />;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgHealth }}>
            <StatusBar
                barStyle='dark-content'
                backgroundColor={colors.bgHealth}
            />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* TOPBAR */}
                <View style={styles.statusTopSpacer} />
                <View style={styles.topbar}>
                    <Text style={styles.topbarTitle}>Sức Khoẻ</Text>
                    <View style={styles.topbarRight}>
                        <Pressable
                            style={[
                                shared.iconBtn,
                                { position: 'relative' as const },
                            ]}
                            onPress={() => setScreen('notifications')}
                        >
                            <Ionicons
                                name='notifications-outline'
                                size={16}
                                color={colors.text2}
                            />
                            <View style={styles.notiBadge} />
                        </Pressable>
                        <Pressable style={shared.iconBtn}>
                            <Ionicons
                                name='search-outline'
                                size={16}
                                color={colors.text2}
                            />
                        </Pressable>
                    </View>
                </View>

                {/* MEMBER */}
                <Pressable style={styles.member}>
                    <LinearGradient
                        colors={gradients.healthSoft}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.mAvatar}
                    >
                        <Text style={styles.mAvatarText}>AN</Text>
                    </LinearGradient>
                    <View style={styles.mInfo}>
                        <Text style={styles.mName}>Nguyễn Văn An</Text>
                        <Text style={styles.mRole}>38 tuổi · Nam</Text>
                    </View>
                    <Ionicons
                        name='chevron-down'
                        size={16}
                        color={colors.text3}
                    />
                </Pressable>

                {/* BMI CARD */}
                <SectionHeader title='Chỉ số sức khoẻ' />
                <CardBlock>
                    <View style={styles.bmiRow}>
                        <View style={styles.bmiIcon}>
                            <Ionicons
                                name='heart-outline'
                                size={20}
                                color={colors.primary}
                            />
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.bmiLabel}>Chỉ số BMI</Text>
                            <View style={styles.bmiValueRow}>
                                <Text style={styles.bmiValue}>23.5</Text>
                                <Text style={styles.bmiUnit}>kg/m²</Text>
                            </View>
                            <Text style={styles.bmiSub}>170 cm · 68 kg</Text>
                        </View>
                        <Text style={styles.bmiBadge}>Bình thường</Text>
                    </View>
                    <View style={styles.bmiGaugeWrap}>
                        <LinearGradient
                            colors={[
                                '#60A5FA',
                                '#34D399',
                                '#FCD34D',
                                '#F87171',
                            ]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.bmiGaugeTrack}
                        >
                            <View style={styles.bmiGaugeThumb} />
                        </LinearGradient>
                        <View style={styles.bmiGaugeLabels}>
                            <Text
                                style={[
                                    styles.bmiGaugeLabel,
                                    { color: '#60A5FA' },
                                ]}
                            >
                                Thiếu cân
                            </Text>
                            <Text
                                style={[
                                    styles.bmiGaugeLabel,
                                    { color: '#34D399' },
                                ]}
                            >
                                Bình thường
                            </Text>
                            <Text
                                style={[
                                    styles.bmiGaugeLabel,
                                    { color: '#F59E0B' },
                                ]}
                            >
                                Thừa cân
                            </Text>
                            <Text
                                style={[
                                    styles.bmiGaugeLabel,
                                    { color: '#F87171' },
                                ]}
                            >
                                Béo phì
                            </Text>
                        </View>
                    </View>
                    <NoteRow text='BMI chỉ dựa trên chiều cao và cân nặng, chưa phản ánh tỷ lệ cơ/mỡ hay sức khoẻ toàn diện.' />
                </CardBlock>

                {/* THÔNG TIN SỨC KHOẺ */}
                <SectionHeader title='Thông tin sức khoẻ' />
                <CardBlock>
                    {/* Nhóm máu */}
                    <Pressable
                        style={styles.hiRow}
                        onPress={() => openSheet('blood')}
                    >
                        <View
                            style={[
                                styles.hiIcon,
                                {
                                    backgroundColor: HEALTH_INFO[0].iconBg,
                                },
                            ]}
                        >
                            <Ionicons
                                name='water-outline'
                                size={18}
                                color={HEALTH_INFO[0].iconColor}
                            />
                        </View>
                        <View style={styles.hiBody}>
                            <Text style={styles.hiLabel}>Nhóm máu</Text>
                            <Text style={[styles.hiVal, { color: '#E11D48' }]}>
                                {blood}
                            </Text>
                        </View>
                        <Ionicons
                            name='chevron-forward'
                            size={14}
                            color={colors.text3}
                        />
                    </Pressable>

                    {/* Bệnh nền */}
                    <Pressable
                        style={styles.hiRow}
                        onPress={() => openSheet('disease')}
                    >
                        <View
                            style={[
                                styles.hiIcon,
                                {
                                    backgroundColor: HEALTH_INFO[1].iconBg,
                                },
                            ]}
                        >
                            <Ionicons
                                name='heart-outline'
                                size={18}
                                color={HEALTH_INFO[1].iconColor}
                            />
                        </View>
                        <View style={styles.hiBody}>
                            <Text style={styles.hiLabel}>Bệnh nền</Text>
                            {diseases.length > 0 ? (
                                <View style={styles.hiTags}>
                                    {diseases.map((d) => (
                                        <Text
                                            key={d}
                                            style={[
                                                styles.hiTag,
                                                {
                                                    backgroundColor: '#FFFBEB',
                                                    color: '#D97706',
                                                },
                                            ]}
                                        >
                                            {d}
                                        </Text>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.hiEmpty}>
                                    Chưa có thông tin
                                </Text>
                            )}
                        </View>
                        <Ionicons
                            name='chevron-forward'
                            size={14}
                            color={colors.text3}
                        />
                    </Pressable>

                    {/* Dị ứng */}
                    <Pressable
                        style={[styles.hiRow, styles.hiRowLast]}
                        onPress={() => openSheet('allergy')}
                    >
                        <View
                            style={[
                                styles.hiIcon,
                                {
                                    backgroundColor: HEALTH_INFO[2].iconBg,
                                },
                            ]}
                        >
                            <Ionicons
                                name='information-circle-outline'
                                size={18}
                                color={HEALTH_INFO[2].iconColor}
                            />
                        </View>
                        <View style={styles.hiBody}>
                            <Text style={styles.hiLabel}>Dị ứng</Text>
                            {allergies.length > 0 ? (
                                <View style={styles.hiTags}>
                                    {allergies.map((a) => (
                                        <Text
                                            key={a}
                                            style={[
                                                styles.hiTag,
                                                {
                                                    backgroundColor: '#F1F5F9',
                                                    color: '#64748B',
                                                },
                                            ]}
                                        >
                                            {a}
                                        </Text>
                                    ))}
                                </View>
                            ) : (
                                <Text style={styles.hiEmpty}>
                                    Chưa có thông tin
                                </Text>
                            )}
                        </View>
                        <Ionicons
                            name='chevron-forward'
                            size={14}
                            color={colors.text3}
                        />
                    </Pressable>
                </CardBlock>

                {/* HỒ SƠ KHÁM BỆNH */}
                <SectionHeader
                    title='Hồ sơ khám bệnh'
                    action='Tất cả'
                    onAction={() => setScreen('records')}
                />
                <CardBlock>
                    <CountStrip
                        icon={
                            <Ionicons
                                name='reader-outline'
                                size={16}
                                color={colors.primary}
                            />
                        }
                        iconBg={colors.primaryBg}
                        title='Hồ sơ khám bệnh'
                        count='12 hồ sơ'
                    />
                    {VISITS.map((v) => (
                        <Pressable key={v.title} style={styles.visitRow}>
                            <View
                                style={[
                                    styles.visitIcon,
                                    { backgroundColor: v.bg },
                                ]}
                            >
                                <Ionicons
                                    name={
                                        v.iconName as keyof typeof Ionicons.glyphMap
                                    }
                                    size={17}
                                    color={v.iconColor}
                                />
                            </View>
                            <View style={styles.visitBody}>
                                <Text style={styles.visitTitle}>{v.title}</Text>
                                <Text style={styles.visitSub}>{v.sub}</Text>
                                <Text
                                    style={[
                                        styles.visitTag,
                                        {
                                            backgroundColor: v.tagBg,
                                            color: v.tagColor,
                                        },
                                    ]}
                                >
                                    {v.tag}
                                </Text>
                            </View>
                            <Text style={styles.visitDate}>{v.date}</Text>
                        </Pressable>
                    ))}
                </CardBlock>

                {/* TIÊM CHỦNG */}
                <SectionHeader
                    title='Tiêm chủng'
                    action='Xem chi tiết'
                    onAction={() => setScreen('vaccines')}
                />
                <CardBlock>
                    <View style={styles.vpctRow}>
                        <View style={styles.donutWrap}>
                            <View
                                style={{
                                    width: 60,
                                    height: 60,
                                    borderRadius: 30,
                                    borderWidth: 6,
                                    borderColor: '#E4EAF2',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}
                            >
                                <View
                                    style={{
                                        position: 'absolute',
                                        width: 60,
                                        height: 60,
                                        borderRadius: 30,
                                        borderWidth: 6,
                                        borderColor: 'transparent',
                                        borderTopColor: '#D97706',
                                        borderRightColor: '#D97706',
                                        borderBottomColor: '#D97706',
                                        transform: [{ rotate: '-90deg' }],
                                    }}
                                />
                                <Text style={styles.donutPercent}>75%</Text>
                            </View>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.vpctTitle}>
                                Hoàn thành{' '}
                                <Text style={{ color: '#D97706' }}>75%</Text>
                            </Text>
                            <Text style={styles.vpctSub}>
                                6 / 8 mũi khuyến nghị
                            </Text>
                        </View>
                    </View>

                    <NoteRow text='Khuyến nghị dựa theo WHO &amp; CDC. Bạn có thể nhập mũi đã tiêm để hệ thống tính lại.' />
                </CardBlock>

                {/* ĐƠN THUỐC */}
                <SectionHeader
                    title='Đơn thuốc'
                    action='Tất cả'
                    onAction={() => setScreen('medicines')}
                />
                <CardBlock>
                    <CountStrip
                        icon={
                            <MaterialCommunityIcons
                                name='pill'
                                size={16}
                                color={colors.secondary}
                            />
                        }
                        iconBg='#F0FDFA'
                        title='Đơn thuốc'
                        count='3 đang dùng'
                        countStyle={{ color: '#0D9488' }}
                    />
                    {MED_ROWS.map((m) => (
                        <Pressable key={m.name} style={styles.vRow}>
                            <View
                                style={[
                                    styles.vIcon,
                                    { backgroundColor: m.bg },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name='pill'
                                    size={16}
                                    color={m.iconColor}
                                />
                            </View>
                            <View style={styles.vBody}>
                                <Text style={styles.vName}>{m.name}</Text>
                                <Text style={styles.vSub}>{m.sub}</Text>
                            </View>
                        </Pressable>
                    ))}
                </CardBlock>

                {/* GỢI Ý SỨC KHOẺ */}
                <SectionHeader title='Gợi ý sức khoẻ' />
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tipsRow}
                >
                    {TIPS.map((t) => (
                        <Pressable key={t.title} style={styles.tipCard}>
                            <Text style={styles.tipEmoji}>{t.icon}</Text>
                            <Text style={styles.tipTitle}>{t.title}</Text>
                            <Text style={styles.tipSub}>{t.sub}</Text>
                        </Pressable>
                    ))}
                </ScrollView>
            </ScrollView>

            {/* BOTTOM SHEET */}
            <Modal
                visible={sheet !== null}
                transparent
                animationType='fade'
                onRequestClose={closeSheet}
            >
                <Pressable style={shared.overlay} onPress={closeSheet}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ justifyContent: 'flex-end' }}
                    >
                        <Pressable
                            style={shared.sheetContainer}
                            onPress={(e) => e.stopPropagation()}
                        >
                            {/* Handle */}
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>

                            {/* Title */}
                            <View style={shared.sheetHeader}>
                                <Text style={shared.sheetTitle}>
                                    {sheetTitle}
                                </Text>
                            </View>

                            {/* Body */}
                            <View style={shared.sheetBody}>
                                {sheet === 'blood' && (
                                    <View style={styles.btGrid}>
                                        {BLOOD_TYPES.map((bt) => (
                                            <Pressable
                                                key={bt}
                                                style={[
                                                    styles.btOpt,
                                                    draftBlood === bt &&
                                                        styles.btOptSel,
                                                ]}
                                                onPress={() =>
                                                    setDraftBlood(bt)
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.btOptText,
                                                        draftBlood === bt &&
                                                            styles.btOptTextSel,
                                                    ]}
                                                >
                                                    {bt}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                )}

                                {(sheet === 'disease' ||
                                    sheet === 'allergy') && (
                                    <>
                                        <View style={styles.tagInputWrap}>
                                            {(sheet === 'disease'
                                                ? draftDiseases
                                                : draftAllergies
                                            ).map((tag) => (
                                                <View
                                                    key={tag}
                                                    style={styles.tagChip}
                                                >
                                                    <Text
                                                        style={
                                                            styles.tagChipText
                                                        }
                                                    >
                                                        {tag}
                                                    </Text>
                                                    <Pressable
                                                        onPress={() =>
                                                            removeTag(tag)
                                                        }
                                                    >
                                                        <Text
                                                            style={
                                                                styles.tagChipX
                                                            }
                                                        >
                                                            ×
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            ))}
                                            <TextInput
                                                style={styles.tagInput}
                                                placeholder={
                                                    sheet === 'disease'
                                                        ? 'Nhập vào bệnh nền...'
                                                        : 'Nhập vào dị ứng mắc phải...'
                                                }
                                                placeholderTextColor={
                                                    colors.text3
                                                }
                                                value={tagText}
                                                onChangeText={setTagText}
                                                onSubmitEditing={() =>
                                                    addTag(tagText)
                                                }
                                                blurOnSubmit={false}
                                                returnKeyType='done'
                                            />
                                        </View>
                                        <Text style={styles.tagHint}>
                                            Nhấn Enter để thêm mục mới
                                        </Text>
                                    </>
                                )}
                            </View>

                            {/* Save Button */}
                            <View style={shared.sheetBtnRow}>
                                <Pressable style={{ flex: 1 }}>
                                    <LinearGradient
                                        colors={[
                                            colors.primary,
                                            colors.secondary,
                                        ]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[
                                            shared.sheetBtnPrimary,
                                            { borderRadius: 14 },
                                        ]}
                                    >
                                        <Pressable onPress={saveSheet}>
                                            <Text
                                                style={
                                                    shared.sheetBtnPrimaryText
                                                }
                                            >
                                                Lưu thay đổi
                                            </Text>
                                        </Pressable>
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
