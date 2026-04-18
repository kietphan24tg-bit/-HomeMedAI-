// src/screens/health/HealthScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { usePatchMyHealthProfileMutation } from '@/src/features/me/mutations';
import { useMeOverviewQuery } from '@/src/features/me/queries';
import { formatNumericDisplay } from '@/src/features/me/types';
import { getCategoryColor } from '@/src/utils/color-palette';
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
import { HEALTH_INFO, TIPS } from '../../data/health-data';
import { shared } from '../../styles/shared';
import { colors, gradients } from '../../styles/tokens';

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

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
}

function nullableString(value: unknown): string | null {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
}

function stringList(value: unknown): string[] {
    return Array.isArray(value)
        ? value.filter(
              (item): item is string =>
                  typeof item === 'string' && item.trim().length > 0,
          )
        : [];
}

function recordList(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter(
              (item): item is Record<string, unknown> =>
                  !!item && typeof item === 'object',
          )
        : [];
}

function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 'ND';
    return parts
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function ageFromDob(dob: unknown): number | null {
    const raw = nullableString(dob);
    if (!raw) return null;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return null;
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const beforeBirthday =
        now.getMonth() < date.getMonth() ||
        (now.getMonth() === date.getMonth() && now.getDate() < date.getDate());
    if (beforeBirthday) age -= 1;
    return age >= 0 && age < 130 ? age : null;
}

function genderLabel(gender: unknown) {
    const normalized = nullableString(gender)?.toLowerCase();
    if (normalized === 'male' || normalized === 'nam') return 'Nam';
    if (normalized === 'female' || normalized === 'nữ' || normalized === 'nu') {
        return 'Nữ';
    }
    return 'Chưa rõ';
}

function calculateBmi(height: number | null, weight: number | null) {
    if (
        !height ||
        !weight ||
        height < 50 ||
        height > 250 ||
        weight < 2 ||
        weight > 400
    ) {
        return null;
    }

    return Number((weight / (height / 100) ** 2).toFixed(1));
}

function bmiStatus(bmi: number | null) {
    if (!bmi) {
        return {
            label: 'Cần cập nhật',
            color: colors.warning,
            bg: colors.warningBg,
            left: '0%',
        };
    }

    const min = 12;
    const max = 35;
    const left = `${Math.round(
        ((Math.min(max, Math.max(min, bmi)) - min) / (max - min)) * 100,
    )}%`;

    if (bmi < 18.5) {
        return {
            label: 'Thiếu cân',
            color: colors.info,
            bg: colors.infoBg,
            left,
        };
    }
    if (bmi < 23) {
        return {
            label: 'Bình thường',
            color: colors.success,
            bg: colors.successBg,
            left,
        };
    }
    if (bmi < 25) {
        return {
            label: 'Thừa cân',
            color: colors.warning,
            bg: colors.warningBg,
            left,
        };
    }
    return {
        label: 'Béo phì',
        color: colors.danger,
        bg: colors.dangerBg,
        left,
    };
}

function vaccinationStats(healthProfile: Record<string, unknown>) {
    const vaccinations = Array.isArray(healthProfile.vaccinations)
        ? healthProfile.vaccinations.filter(
              (entry): entry is Record<string, unknown> =>
                  !!entry && typeof entry === 'object',
          )
        : [];
    let total = 0;
    let done = 0;

    vaccinations.forEach((vaccination) => {
        const doses = Array.isArray(vaccination.doses)
            ? vaccination.doses.filter(
                  (entry): entry is Record<string, unknown> =>
                      !!entry && typeof entry === 'object',
              )
            : [];
        const recommendationTotal = numberValue(
            vaccination.recommendation_total_doses,
        );
        const administered = numberValue(vaccination.doses_administered_count);
        total +=
            recommendationTotal && recommendationTotal > 0
                ? recommendationTotal
                : doses.length;
        done +=
            administered !== null
                ? administered
                : doses.filter(
                      (dose) =>
                          nullableString(dose.dose_status)?.toUpperCase() ===
                          'ADMINISTERED',
                  ).length;
    });

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { total, done, percent };
}

function formatShortDate(value: unknown) {
    const raw = nullableString(value);
    if (!raw) return '--';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
}

function buildMedicalRecordRows(healthProfile: Record<string, unknown>) {
    return recordList(healthProfile.medical_records)
        .sort((a, b) => {
            const aTime = new Date(
                nullableString(a.visit_date) ?? '',
            ).getTime();
            const bTime = new Date(
                nullableString(b.visit_date) ?? '',
            ).getTime();
            return (
                (Number.isNaN(bTime) ? 0 : bTime) -
                (Number.isNaN(aTime) ? 0 : aTime)
            );
        })
        .slice(0, 3)
        .map((record, index) => {
            const category = getCategoryColor(index);
            return {
                id:
                    nullableString(record.id) ??
                    `${nullableString(record.title) ?? 'record'}-${index}`,
                iconName:
                    index === 0
                        ? 'heart-outline'
                        : index === 1
                          ? 'scan-outline'
                          : 'medkit-outline',
                iconColor: category.color,
                bg: category.bg,
                title:
                    nullableString(record.title) ??
                    nullableString(record.diagnosis_name) ??
                    'Hồ sơ khám bệnh',
                sub:
                    [
                        nullableString(record.hospital_name),
                        nullableString(record.doctor_name),
                    ]
                        .filter(Boolean)
                        .join(' · ') ||
                    nullableString(record.specialty) ||
                    'Chưa có cơ sở khám',
                date: formatShortDate(record.visit_date),
            };
        });
}

function buildMedicineRows(healthProfile: Record<string, unknown>) {
    return recordList(healthProfile.medicine_inventory)
        .slice(0, 3)
        .map((medicine, index) => {
            const category = getCategoryColor(index + 3);
            return {
                id:
                    nullableString(medicine.id) ??
                    `${nullableString(medicine.medicine_name) ?? 'medicine'}-${index}`,
                name: nullableString(medicine.medicine_name) ?? 'Thuốc',
                bg: category.bg,
                iconColor: category.color,
            };
        });
}

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
    const router = useRouter();
    const { data: meOverview, isLoading, error } = useMeOverviewQuery();
    const patchHealthMutation = usePatchMyHealthProfileMutation();
    const [screen, setScreen] = useState<SubScreen>('main');

    // Debug logging for API response
    React.useEffect(() => {
        if (__DEV__) {
            if (isLoading) {
                console.log('[HealthScreen] Loading data from /users/me...');
            }
            if (error) {
                console.error(
                    '[HealthScreen] Error fetching /users/me:',
                    error,
                );
            }
            if (meOverview?.profile) {
                console.log('[HealthScreen] ✅ API data received:', {
                    profile: meOverview.profile,
                    health_profile: meOverview.health_profile,
                });
            }
        }
    }, [meOverview, isLoading, error]);
    const [sheet, setSheet] = useState<SheetKey>(null);
    const [blood, setBlood] = useState('');
    const [draftBlood, setDraftBlood] = useState('');
    const [diseases, setDiseases] = useState<string[]>([]);
    const [draftDiseases, setDraftDiseases] = useState<string[]>([]);
    const [allergies, setAllergies] = useState<string[]>([]);
    const [draftAllergies, setDraftAllergies] = useState<string[]>([]);
    const [foodAllergies, setFoodAllergies] = useState<string[]>([]);
    const [draftFoodAllergies, setDraftFoodAllergies] = useState<string[]>([]);
    const [healthNote, setHealthNote] = useState('');
    const [draftHealthNote, setDraftHealthNote] = useState('');
    const [tagText, setTagText] = useState('');
    const [tagPreview, setTagPreview] = useState<TagPreviewState>(null);
    const profile = useMemo(
        () => asRecord(meOverview?.profile),
        [meOverview?.profile],
    );
    const healthProfile = useMemo(
        () => asRecord(meOverview?.health_profile),
        [meOverview?.health_profile],
    );
    const profileId = nullableString(profile.id);
    const displayName =
        nullableString(profile.full_name) ??
        nullableString(meOverview?.user?.email) ??
        'Người dùng';
    const memberAge = ageFromDob(profile.dob ?? profile.date_of_birth);
    const memberMeta = `${memberAge !== null ? `${memberAge} tuổi` : 'Chưa rõ tuổi'} · ${genderLabel(profile.gender)}`;
    const height = numberValue(profile.height_cm);
    const weight = numberValue(profile.weight_kg);
    const bmi = calculateBmi(height, weight);
    const bmiInfo = bmiStatus(bmi);
    const vaccineStats = vaccinationStats(healthProfile);
    const vaccinePct = vaccineStats.percent;
    const medicalRecordRows = useMemo(
        () => buildMedicalRecordRows(healthProfile),
        [healthProfile],
    );
    const medicineRows = useMemo(
        () => buildMedicineRows(healthProfile),
        [healthProfile],
    );
    const totalMedicalRecords = recordList(
        healthProfile.medical_records,
    ).length;
    const totalMedicines = recordList(healthProfile.medicine_inventory).length;
    const vaccineDonutSize = 62;
    const vaccineDonutStroke = 6;
    const vaccineDonutRadius = (vaccineDonutSize - vaccineDonutStroke) / 2;
    const vaccineDonutCircumference = 2 * Math.PI * vaccineDonutRadius;
    const vaccineDonutOffset =
        vaccineDonutCircumference -
        (Math.max(0, Math.min(100, vaccinePct)) / 100) *
            vaccineDonutCircumference;

    useEffect(() => {
        setBlood(nullableString(healthProfile.blood_type) ?? '');
        setDraftBlood(nullableString(healthProfile.blood_type) ?? '');
        setDiseases(
            stringList(
                healthProfile.chronic_diseases ??
                    healthProfile.chronic_conditions,
            ),
        );
        setAllergies(
            stringList(healthProfile.drug_allergies ?? healthProfile.allergies),
        );
        setFoodAllergies(stringList(healthProfile.food_allergies));
        setHealthNote(nullableString(healthProfile.notes) ?? '');
    }, [healthProfile]);

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
        const nextBlood = sheet === 'blood' ? draftBlood : blood;
        const nextDiseases =
            sheet === 'disease' ? [...draftDiseases] : [...diseases];
        const nextAllergies =
            sheet === 'allergy' ? [...draftAllergies] : [...allergies];
        const nextFoodAllergies =
            sheet === 'foodAllergy'
                ? [...draftFoodAllergies]
                : [...foodAllergies];
        const nextNote = sheet === 'note' ? draftHealthNote.trim() : healthNote;

        setBlood(nextBlood);
        setDiseases(nextDiseases);
        setAllergies(nextAllergies);
        setFoodAllergies(nextFoodAllergies);
        setHealthNote(nextNote);

        if (profileId) {
            patchHealthMutation.mutate({
                profileId,
                payload: {
                    blood_type: nextBlood || null,
                    chronic_diseases: nextDiseases,
                    allergies: nextAllergies,
                    drug_allergies: nextAllergies,
                    food_allergies: nextFoodAllergies,
                    notes: nextNote || null,
                },
            });
        }
        setSheet(null);
    }, [
        sheet,
        blood,
        diseases,
        allergies,
        foodAllergies,
        healthNote,
        draftBlood,
        draftDiseases,
        draftAllergies,
        draftFoodAllergies,
        draftHealthNote,
        profileId,
        patchHealthMutation,
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

            {/* Loading indicator while fetching from API */}
            {isLoading && (
                <View
                    style={{
                        padding: 16,
                        backgroundColor: colors.infoBg,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.divider,
                    }}
                >
                    <Text style={{ color: colors.info, fontSize: 12 }}>
                        📡 Đang tải dữ liệu từ máy chủ...
                    </Text>
                </View>
            )}

            {/* Error indicator */}
            {error && (
                <View
                    style={{
                        padding: 16,
                        backgroundColor: colors.dangerBg,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.divider,
                    }}
                >
                    <Text style={{ color: colors.danger, fontSize: 12 }}>
                        ⚠️ Lỗi: {error?.message || 'Không thể tải dữ liệu'}
                    </Text>
                </View>
            )}

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
                        <Text style={styles.mAvatarText}>
                            {initialsFromName(displayName)}
                        </Text>
                    </LinearGradient>
                    <View style={styles.mInfo}>
                        <Text style={styles.mName}>{displayName}</Text>
                        <Text style={styles.mRole}>{memberMeta}</Text>
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
                                <Text style={styles.bmiValue}>
                                    {bmi ? bmi.toFixed(1) : '--'}
                                </Text>
                                {bmi ? (
                                    <Text style={styles.bmiUnit}>kg/m²</Text>
                                ) : null}
                            </View>
                            <Text style={styles.bmiSub}>
                                {height && weight
                                    ? `${formatNumericDisplay(height, 0)} cm · ${formatNumericDisplay(weight, 1)} kg`
                                    : 'Cần cập nhật chiều cao/cân nặng'}
                            </Text>
                        </View>
                        <Text
                            style={[
                                styles.bmiBadge,
                                {
                                    color: bmiInfo.color,
                                    backgroundColor: bmiInfo.bg,
                                },
                            ]}
                        >
                            {bmiInfo.label}
                        </Text>
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
                            <View
                                style={[
                                    styles.bmiGaugeThumb,
                                    {
                                        left: bmiInfo.left as `${number}%`,
                                        borderColor: bmiInfo.color,
                                    },
                                ]}
                            />
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

                {/* METRICS HISTORY BUTTON */}
                <SectionHeader title='Thống kê' />
                <CardBlock>
                    <Pressable
                        style={[styles.miniCardRow]}
                        onPress={() =>
                            router.push('/(tabs)/health/metrics' as any)
                        }
                    >
                        <View
                            style={[
                                styles.miniCardRowIcon,
                                { backgroundColor: '#FEF3C7' },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name='chart-line'
                                size={18}
                                color='#D97706'
                            />
                        </View>
                        <View style={styles.miniCardRowBody}>
                            <Text style={styles.hiLabelTitle}>
                                Thống kê chi tiết sức khỏe
                            </Text>
                            <Text style={styles.miniCardRowSub}>
                                Xem biểu đồ huyết áp, cân nặng, đường huyết
                            </Text>
                        </View>
                        <Ionicons
                            name='chevron-forward'
                            size={16}
                            color={colors.primary}
                        />
                    </Pressable>
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

                {/* HỒ SƠ KHÁM BỆNH */}
                <SectionHeader
                    title='Hồ sơ khám bệnh'
                    action='Tất cả'
                    onAction={() => setScreen('records')}
                />
                <CardBlock onPress={() => setScreen('records')}>
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
                        count={`${totalMedicalRecords} hồ sơ`}
                    />
                    {medicalRecordRows.length > 0 ? (
                        medicalRecordRows.map((v, index) => (
                            <Pressable
                                key={v.id}
                                style={[
                                    styles.miniCardRow,
                                    index === medicalRecordRows.length - 1
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
                        ))
                    ) : (
                        <View
                            style={[styles.miniCardRow, styles.miniCardRowLast]}
                        >
                            <Text style={styles.hiEmptyText}>
                                Chưa có hồ sơ khám bệnh
                            </Text>
                        </View>
                    )}
                </CardBlock>

                {/* TIÊM CHỦNG */}
                <SectionHeader
                    title='Tiêm chủng'
                    action='Xem chi tiết'
                    onAction={() => setScreen('vaccines')}
                />
                <CardBlock onPress={() => setScreen('vaccines')}>
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
                                    {vaccinePct}%
                                </Text>
                            </Text>
                            <Text style={styles.vpctSub}>
                                {vaccineStats.total > 0
                                    ? `${vaccineStats.done} / ${vaccineStats.total} mũi khuyến nghị`
                                    : 'Chưa có lịch tiêm'}
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
                <CardBlock onPress={() => setScreen('medicines')}>
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
                        count={`${totalMedicines} đang dùng`}
                        countStyle={{ color: colors.secondary }}
                    />
                    {medicineRows.length > 0 ? (
                        medicineRows.map((m, index) => (
                            <Pressable
                                key={m.id}
                                style={[
                                    styles.miniCardRow,
                                    index === medicineRows.length - 1
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
                                    <Text
                                        style={styles.miniCardRowTitleCompact}
                                    >
                                        {m.name}
                                    </Text>
                                </View>
                            </Pressable>
                        ))
                    ) : (
                        <View
                            style={[styles.miniCardRow, styles.miniCardRowLast]}
                        >
                            <Text style={styles.hiEmptyText}>
                                Chưa có thuốc đang dùng
                            </Text>
                        </View>
                    )}
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
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 50}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
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
                            <ScrollView
                                style={[
                                    shared.sheetBody,
                                    { maxHeight: 300, flexGrow: 1 },
                                ]}
                                scrollEnabled={true}
                                showsVerticalScrollIndicator={true}
                            >
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
                            </ScrollView>

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
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 50}
                        style={{ flex: 1, justifyContent: 'flex-end' }}
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
