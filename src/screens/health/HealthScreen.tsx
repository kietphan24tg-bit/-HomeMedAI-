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
import {
    Circle,
    Defs,
    Stop,
    Svg,
    LinearGradient as SvgLinearGradient,
} from 'react-native-svg';
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
import { scale, scaleFont, verticalScale } from '../../styles/responsive';
import { shared } from '../../styles/shared';
import { colors, gradients, typography } from '../../styles/tokens';

type SubScreen =
    | 'main'
    | 'records'
    | 'vaccines'
    | 'medicines'
    | 'notifications';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

type SheetKey = 'blood' | 'disease' | 'allergy' | 'foodAllergy' | 'note' | null;

type TagPreviewState = {
    title: string;
    tags: string[];
} | null;

function summarizeHealthTags(values: string[]): {
    lead: string | null;
    remaining: number;
} {
    if (!values.length) {
        return { lead: null, remaining: 0 };
    }

    return {
        lead: values[0],
        remaining: Math.max(0, values.length - 1),
    };
}

function truncateHealthTag(label: string | null, maxLength = 22): string {
    if (!label) return '';
    if (label.length <= maxLength) return label;
    return `${label.slice(0, maxLength - 1).trimEnd()}...`;
}

export default function HealthScreen(): React.JSX.Element {
    const [screen, setScreen] = useState<SubScreen>('main');
    const [sheet, setSheet] = useState<SheetKey>(null);
    const [blood, setBlood] = useState('O+');
    const [draftBlood, setDraftBlood] = useState('O+');
    const [diseases, setDiseases] = useState<string[]>(['Tăng huyết áp']);
    const [draftDiseases, setDraftDiseases] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [draftAllergies, setDraftAllergies] = useState<string[]>([]);
    const [foodAllergies, setFoodAllergies] = useState<string[]>(['Hải sản']);
    const [draftFoodAllergies, setDraftFoodAllergies] = useState<string[]>([]);
    const [healthNote, setHealthNote] = useState('Tiền sử mổ ruột thừa 2018');
    const [draftHealthNote, setDraftHealthNote] = useState('');
    const [tagText, setTagText] = useState('');
    const [tagPreview, setTagPreview] = useState<TagPreviewState>(null);
    const vaccinePct = 75;
    const vaccineDonutSize = 62;
    const vaccineDonutStroke = 6;
    const vaccineDonutRadius = (vaccineDonutSize - vaccineDonutStroke) / 2;
    const vaccineDonutCircumference = 2 * Math.PI * vaccineDonutRadius;
    const vaccineDonutOffset =
        vaccineDonutCircumference -
        (Math.max(0, Math.min(100, vaccinePct)) / 100) *
            vaccineDonutCircumference;

    const openSheet = useCallback(
        (key: SheetKey) => {
            if (key === 'blood') setDraftBlood(blood);
            if (key === 'disease') setDraftDiseases([...diseases]);
            if (key === 'allergy') setDraftAllergies([...allergies]);
            if (key === 'foodAllergy') {
                setDraftFoodAllergies([...foodAllergies]);
            }
            if (key === 'note') setDraftHealthNote(healthNote);
            setTagText('');
            setSheet(key);
        },
        [blood, diseases, allergies, foodAllergies, healthNote],
    );

    const closeSheet = useCallback(() => setSheet(null), []);

    const saveSheet = useCallback(() => {
        if (sheet === 'blood') setBlood(draftBlood);
        if (sheet === 'disease') setDiseases([...draftDiseases]);
        if (sheet === 'allergy') setAllergies([...draftAllergies]);
        if (sheet === 'foodAllergy') {
            setFoodAllergies([...draftFoodAllergies]);
        }
        if (sheet === 'note') setHealthNote(draftHealthNote.trim());
        setSheet(null);
    }, [
        sheet,
        draftBlood,
        draftDiseases,
        draftAllergies,
        draftFoodAllergies,
        draftHealthNote,
    ]);

    const addTag = useCallback(
        (tag: string) => {
            const trimmed = tag.trim();
            if (!trimmed) return;
            if (sheet === 'disease') {
                if (!draftDiseases.includes(trimmed)) {
                    setDraftDiseases((prev) => [...prev, trimmed]);
                }
            } else if (sheet === 'allergy') {
                if (!draftAllergies.includes(trimmed)) {
                    setDraftAllergies((prev) => [...prev, trimmed]);
                }
            } else if (sheet === 'foodAllergy') {
                if (!draftFoodAllergies.includes(trimmed)) {
                    setDraftFoodAllergies((prev) => [...prev, trimmed]);
                }
            }
            setTagText('');
        },
        [sheet, draftDiseases, draftAllergies, draftFoodAllergies],
    );

    const removeTag = useCallback(
        (tag: string) => {
            if (sheet === 'disease') {
                setDraftDiseases((prev) => prev.filter((t) => t !== tag));
            } else if (sheet === 'allergy') {
                setDraftAllergies((prev) => prev.filter((t) => t !== tag));
            } else if (sheet === 'foodAllergy') {
                setDraftFoodAllergies((prev) => prev.filter((t) => t !== tag));
            }
        },
        [sheet],
    );

    const _sheetTitle =
        sheet === 'blood'
            ? 'Nhóm máu'
            : sheet === 'disease'
              ? 'Bệnh nền'
              : 'Dị ứng';

    const healthInfoItems = [
        {
            key: 'blood',
            type: 'blood' as const,
            label: 'Nhóm máu',
            icon: 'water-outline',
            iconBg: HEALTH_INFO[0].iconBg,
            iconColor: HEALTH_INFO[0].iconColor,
            value: blood,
            valueColor: colors.danger,
        },
        {
            key: 'disease',
            type: 'chips' as const,
            label: 'Bệnh nền',
            icon: 'heart-outline',
            iconBg: HEALTH_INFO[1].iconBg,
            iconColor: HEALTH_INFO[1].iconColor,
            values: diseases,
        },
        {
            key: 'allergy',
            type: 'chips' as const,
            label: 'Dị ứng',
            icon: 'information-circle-outline',
            iconBg: HEALTH_INFO[2].iconBg,
            iconColor: HEALTH_INFO[2].iconColor,
            values: allergies,
        },
    ];

    const resolvedSheetTitle =
        sheet === 'blood'
            ? 'Nhóm máu'
            : sheet === 'disease'
              ? 'Bệnh nền'
              : sheet === 'allergy'
                ? 'Dị ứng thuốc'
                : sheet === 'foodAllergy'
                  ? 'Dị ứng thực phẩm'
                  : 'Ghi chú y tế quan trọng';

    const displayHealthInfoItems = [
        healthInfoItems[0],
        healthInfoItems[1],
        {
            key: 'allergy',
            type: 'chips' as const,
            label: 'Dị ứng thuốc',
            icon: 'medkit-outline',
            iconBg: colors.dangerBg,
            iconColor: '#FF5A5F',
            values: allergies,
        },
        {
            key: 'foodAllergy',
            type: 'chips' as const,
            label: 'Dị ứng thực phẩm',
            icon: 'leaf-outline',
            iconBg: colors.primaryBg,
            iconColor: '#10B981',
            values: foodAllergies,
        },
        {
            key: 'note',
            type: 'note' as const,
            label: 'Ghi chú y tế quan trọng',
            icon: 'document-text-outline',
            iconBg: '#F3E8FF',
            iconColor: '#8B5CF6',
            value: healthNote,
        },
    ];

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
                                colors.info,
                                colors.success,
                                colors.warning,
                                colors.danger,
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
                                    { color: colors.info },
                                ]}
                            >
                                Thiếu cân
                            </Text>
                            <Text
                                style={[
                                    styles.bmiGaugeLabel,
                                    { color: colors.success },
                                ]}
                            >
                                Bình thường
                            </Text>
                            <Text
                                style={[
                                    styles.bmiGaugeLabel,
                                    { color: colors.warning },
                                ]}
                            >
                                Thừa cân
                            </Text>
                            <Text
                                style={[
                                    styles.bmiGaugeLabel,
                                    { color: colors.danger },
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
                    {displayHealthInfoItems.map((item, index) => (
                        <Pressable
                            key={item.key}
                            style={[
                                styles.miniCardRow,
                                index === displayHealthInfoItems.length - 1
                                    ? styles.miniCardRowLast
                                    : null,
                            ]}
                            onPress={() =>
                                openSheet(item.key as Exclude<SheetKey, null>)
                            }
                        >
                            <View
                                style={[
                                    styles.miniCardRowIcon,
                                    { backgroundColor: item.iconBg },
                                ]}
                            >
                                <Ionicons
                                    name={
                                        item.icon as keyof typeof Ionicons.glyphMap
                                    }
                                    size={18}
                                    color={item.iconColor}
                                />
                            </View>
                            <View style={styles.miniCardRowBody}>
                                {item.type === 'blood' ? (
                                    <View>
                                        <Text style={styles.hiLabel}>
                                            {item.label}
                                        </Text>
                                        <Text
                                            style={[
                                                styles.hiValueInline,
                                                { color: item.valueColor },
                                            ]}
                                        >
                                            {item.value || '--'}
                                        </Text>
                                    </View>
                                ) : item.type === 'note' ? (
                                    <View
                                        style={{
                                            width: '100%',
                                            paddingRight: 10,
                                        }}
                                    >
                                        <Text style={styles.hiLabelTitle}>
                                            {item.label}
                                        </Text>
                                        <Text
                                            style={
                                                item.value
                                                    ? styles.miniCardRowSub
                                                    : styles.hiEmptyText
                                            }
                                            numberOfLines={1}
                                        >
                                            {item.value || 'Chưa có thông tin'}
                                        </Text>
                                    </View>
                                ) : (
                                    <View>
                                        <Text style={styles.hiLabelTitle}>
                                            {item.label}
                                        </Text>
                                        <View style={styles.hiChipsWrap}>
                                            {item.values.length > 0 ? (
                                                (() => {
                                                    const tagSummary =
                                                        summarizeHealthTags(
                                                            item.values,
                                                        );
                                                    return (
                                                        <>
                                                            <View
                                                                style={
                                                                    styles.hiChip
                                                                }
                                                            >
                                                                <Text
                                                                    style={[
                                                                        styles.hiChipText,
                                                                        styles.hiChipTextTruncated,
                                                                    ]}
                                                                    numberOfLines={
                                                                        1
                                                                    }
                                                                >
                                                                    {truncateHealthTag(
                                                                        tagSummary.lead,
                                                                    )}
                                                                </Text>
                                                            </View>
                                                            {tagSummary.remaining >
                                                            0 ? (
                                                                <Pressable
                                                                    style={
                                                                        styles.hiChipMutedBtn
                                                                    }
                                                                    onPress={(
                                                                        event,
                                                                    ) => {
                                                                        event.stopPropagation();
                                                                        setTagPreview(
                                                                            {
                                                                                title: item.label,
                                                                                tags: item.values,
                                                                            },
                                                                        );
                                                                    }}
                                                                >
                                                                    <View
                                                                        style={
                                                                            styles.hiChipMuted
                                                                        }
                                                                    >
                                                                        <Text
                                                                            style={
                                                                                styles.hiChipMutedText
                                                                            }
                                                                        >
                                                                            +
                                                                            {
                                                                                tagSummary.remaining
                                                                            }{' '}
                                                                            mục
                                                                            khác
                                                                        </Text>
                                                                    </View>
                                                                </Pressable>
                                                            ) : null}
                                                        </>
                                                    );
                                                })()
                                            ) : (
                                                <Text
                                                    style={styles.hiEmptyText}
                                                >
                                                    Chưa có thông tin
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                )}
                            </View>
                            <Ionicons
                                name='chevron-forward'
                                size={16}
                                color={colors.text3}
                            />
                        </Pressable>
                    ))}
                    {false && (
                        <>
                            <Pressable
                                style={styles.healthInfoRowObj}
                                onPress={() => openSheet('blood')}
                            >
                                <View
                                    style={[
                                        styles.hiIconWrap,
                                        {
                                            backgroundColor:
                                                HEALTH_INFO[0].iconBg,
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
                                    <Text
                                        style={[
                                            styles.hiValueInline,
                                            { color: colors.danger },
                                        ]}
                                    >
                                        {blood}
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={16}
                                    color={colors.text3}
                                />
                            </Pressable>

                            {/* Bệnh nền */}
                            <Pressable
                                style={styles.healthInfoRowObj}
                                onPress={() => openSheet('disease')}
                            >
                                <View
                                    style={[
                                        styles.hiIconWrap,
                                        {
                                            backgroundColor:
                                                HEALTH_INFO[1].iconBg,
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
                                                            backgroundColor:
                                                                colors.warningBg,
                                                            color: colors.warning,
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
                                style={[
                                    styles.healthInfoRowObj,
                                    styles.healthInfoRowLast,
                                ]}
                                onPress={() => openSheet('allergy')}
                            >
                                <View
                                    style={[
                                        styles.hiIconWrap,
                                        {
                                            backgroundColor:
                                                HEALTH_INFO[2].iconBg,
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
                                                            backgroundColor:
                                                                colors.divider,
                                                            color: colors.text2,
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
                        </>
                    )}
                </CardBlock>

                <SectionHeader title='Chỉ số theo thời gian' action='Tất cả' />
                <CardBlock>
                    <Pressable style={styles.miniCardRow}>
                        <View
                            style={[
                                styles.miniCardRowIcon,
                                { backgroundColor: '#FEE2E2' },
                            ]}
                        >
                            <Ionicons
                                name='water-outline'
                                size={16}
                                color={colors.danger}
                            />
                        </View>
                        <View style={styles.miniCardRowBodyCompact}>
                            <Text style={styles.miniCardRowTitleCompact}>
                                Huyết áp
                            </Text>
                        </View>
                        <View
                            style={{
                                alignItems: 'flex-end',
                                marginLeft: scale(12),
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: typography.font.bold,
                                    fontSize: scaleFont(13),
                                    color: colors.danger,
                                }}
                            >
                                130/85 mmHg
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: verticalScale(2),
                                }}
                            >
                                <View
                                    style={{
                                        width: scale(6),
                                        height: scale(6),
                                        borderRadius: scale(3),
                                        backgroundColor: colors.danger,
                                        marginRight: scale(4),
                                    }}
                                />
                                <Text
                                    style={{
                                        fontFamily: typography.font.medium,
                                        fontSize: scaleFont(11),
                                        color: colors.danger,
                                    }}
                                >
                                    Hơi cao
                                </Text>
                            </View>
                        </View>
                        <Ionicons
                            style={{ marginLeft: scale(12) }}
                            name='stats-chart'
                            size={20}
                            color={colors.danger}
                        />
                    </Pressable>

                    <Pressable style={styles.miniCardRow}>
                        <View
                            style={[
                                styles.miniCardRowIcon,
                                { backgroundColor: '#DCFCE7' },
                            ]}
                        >
                            <Ionicons
                                name='medical-outline'
                                size={16}
                                color={colors.success}
                            />
                        </View>
                        <View style={styles.miniCardRowBodyCompact}>
                            <Text style={styles.miniCardRowTitleCompact}>
                                Cân nặng
                            </Text>
                        </View>
                        <View
                            style={{
                                alignItems: 'flex-end',
                                marginLeft: scale(12),
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: typography.font.bold,
                                    fontSize: scaleFont(13),
                                    color: colors.success,
                                }}
                            >
                                55 kg
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: verticalScale(2),
                                }}
                            >
                                <View
                                    style={{
                                        width: scale(6),
                                        height: scale(6),
                                        borderRadius: scale(3),
                                        backgroundColor: colors.success,
                                        marginRight: scale(4),
                                    }}
                                />
                                <Text
                                    style={{
                                        fontFamily: typography.font.medium,
                                        fontSize: scaleFont(11),
                                        color: colors.success,
                                    }}
                                >
                                    Bình thường
                                </Text>
                            </View>
                        </View>
                        <Ionicons
                            style={{ marginLeft: scale(12) }}
                            name='stats-chart'
                            size={20}
                            color={colors.success}
                        />
                    </Pressable>

                    <Pressable
                        style={[styles.miniCardRow, styles.miniCardRowLast]}
                    >
                        <View
                            style={[
                                styles.miniCardRowIcon,
                                { backgroundColor: '#FEF3C7' },
                            ]}
                        >
                            <Ionicons
                                name='document-text-outline'
                                size={16}
                                color='#D97706'
                            />
                        </View>
                        <View style={styles.miniCardRowBodyCompact}>
                            <Text style={styles.miniCardRowTitleCompact}>
                                Đường huyết
                            </Text>
                        </View>
                        <View
                            style={{
                                alignItems: 'flex-end',
                                marginLeft: scale(12),
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: typography.font.bold,
                                    fontSize: scaleFont(13),
                                    color: '#D97706',
                                }}
                            >
                                5.4 mmol/L
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    marginTop: verticalScale(2),
                                }}
                            >
                                <View
                                    style={{
                                        width: scale(6),
                                        height: scale(6),
                                        borderRadius: scale(3),
                                        backgroundColor: '#D97706',
                                        marginRight: scale(4),
                                    }}
                                />
                                <Text
                                    style={{
                                        fontFamily: typography.font.medium,
                                        fontSize: scaleFont(11),
                                        color: '#D97706',
                                    }}
                                >
                                    Bình thường
                                </Text>
                            </View>
                        </View>
                        <Ionicons
                            style={{ marginLeft: scale(12) }}
                            name='stats-chart'
                            size={20}
                            color='#D97706'
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
                    {VISITS.map((v, index) => (
                        <Pressable
                            key={v.title}
                            style={[
                                styles.miniCardRow,
                                index === VISITS.length - 1
                                    ? styles.miniCardRowLast
                                    : null,
                            ]}
                        >
                            <View
                                style={[
                                    styles.miniCardRowIcon,
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
                            <View style={styles.miniCardRowBody}>
                                <Text style={styles.miniCardRowTitle}>
                                    {v.title}
                                </Text>
                                <Text style={styles.miniCardRowSub}>
                                    {v.sub}
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
                            <Svg
                                width={vaccineDonutSize}
                                height={vaccineDonutSize}
                                style={styles.donutSvg}
                            >
                                <Defs>
                                    <SvgLinearGradient
                                        id='healthVaccineDonutGradient'
                                        x1='0%'
                                        y1='0%'
                                        x2='100%'
                                        y2='100%'
                                    >
                                        <Stop offset='0%' stopColor='#26C89A' />
                                        <Stop
                                            offset='100%'
                                            stopColor='#0A8F74'
                                        />
                                    </SvgLinearGradient>
                                </Defs>
                                <Circle
                                    cx={vaccineDonutSize / 2}
                                    cy={vaccineDonutSize / 2}
                                    r={vaccineDonutRadius}
                                    stroke='#2F3A3B'
                                    strokeWidth={vaccineDonutStroke}
                                    fill='none'
                                />
                                <Circle
                                    cx={vaccineDonutSize / 2}
                                    cy={vaccineDonutSize / 2}
                                    r={vaccineDonutRadius}
                                    stroke='url(#healthVaccineDonutGradient)'
                                    strokeWidth={vaccineDonutStroke}
                                    fill='none'
                                    strokeLinecap='round'
                                    strokeDasharray={`${vaccineDonutCircumference}, ${vaccineDonutCircumference}`}
                                    strokeDashoffset={vaccineDonutOffset}
                                    transform={`rotate(-90 ${vaccineDonutSize / 2} ${vaccineDonutSize / 2})`}
                                />
                            </Svg>
                            <Text style={styles.donutPercent}>
                                {vaccinePct}%
                            </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.vpctTitle}>
                                Hoàn thành{' '}
                                <Text style={{ color: colors.warning }}>
                                    75%
                                </Text>
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
                        iconBg={colors.secondaryBg}
                        title='Đơn thuốc'
                        count='3 đang dùng'
                        countStyle={{ color: colors.secondary }}
                    />
                    {MED_ROWS.map((m, index) => (
                        <Pressable
                            key={m.name}
                            style={[
                                styles.miniCardRow,
                                index === MED_ROWS.length - 1
                                    ? styles.miniCardRowLast
                                    : null,
                            ]}
                        >
                            <View
                                style={[
                                    styles.miniCardRowIcon,
                                    { backgroundColor: m.bg },
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name='pill'
                                    size={16}
                                    color={m.iconColor}
                                />
                            </View>
                            <View style={styles.miniCardRowBodyCompact}>
                                <Text style={styles.miniCardRowTitleCompact}>
                                    {m.name}
                                </Text>
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
                                    {resolvedSheetTitle}
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
                                    sheet === 'allergy' ||
                                    sheet === 'foodAllergy') && (
                                    <>
                                        <View style={styles.tagInputWrap}>
                                            {(sheet === 'disease'
                                                ? draftDiseases
                                                : sheet === 'allergy'
                                                  ? draftAllergies
                                                  : draftFoodAllergies
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
                                {sheet === 'note' && (
                                    <TextInput
                                        style={styles.noteInput}
                                        value={draftHealthNote}
                                        onChangeText={setDraftHealthNote}
                                        multiline
                                        textAlignVertical='top'
                                    />
                                )}
                            </View>

                            {/* Save Button */}
                            <View style={shared.sheetBtnRow}>
                                <Pressable
                                    style={{ flex: 1 }}
                                    onPress={saveSheet}
                                >
                                    <LinearGradient
                                        colors={[
                                            colors.primary,
                                            colors.primary,
                                        ]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[
                                            shared.sheetBtnPrimary,
                                            { borderRadius: 14 },
                                        ]}
                                    >
                                        <Text
                                            style={shared.sheetBtnPrimaryText}
                                        >
                                            Lưu thay đổi
                                        </Text>
                                    </LinearGradient>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>

            <Modal
                visible={tagPreview !== null}
                transparent
                animationType='fade'
                onRequestClose={() => setTagPreview(null)}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setTagPreview(null)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ justifyContent: 'flex-end' }}
                    >
                        <Pressable
                            style={shared.sheetContainer}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>

                            <View style={shared.sheetHeader}>
                                <Text style={shared.sheetTitle}>
                                    {tagPreview?.title}
                                </Text>
                            </View>

                            <View style={shared.sheetBody}>
                                <View style={styles.tagPreviewWrap}>
                                    {tagPreview?.tags.map((tag) => (
                                        <View
                                            key={tag}
                                            style={styles.tagPreviewChip}
                                        >
                                            <Text
                                                style={
                                                    styles.tagPreviewChipText
                                                }
                                            >
                                                {tag}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>

                            <View style={shared.sheetBtnRow}>
                                <Pressable
                                    style={shared.sheetBtnPrimaryWrap}
                                    onPress={() => setTagPreview(null)}
                                >
                                    <View
                                        style={[
                                            shared.sheetBtnPrimary,
                                            { backgroundColor: colors.primary },
                                        ]}
                                    >
                                        <Text
                                            style={shared.sheetBtnPrimaryText}
                                        >
                                            Đóng
                                        </Text>
                                    </View>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
        </SafeAreaView>
    );
}
