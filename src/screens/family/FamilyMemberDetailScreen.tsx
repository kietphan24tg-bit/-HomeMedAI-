import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Keyboard,
    KeyboardAvoidingView,
    Linking,
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
import { Circle, Svg } from 'react-native-svg';
import {
    CardBlock,
    CountStrip,
    DateField,
    SectionHeader,
} from '@/src/components/ui';
import { MED_ROWS } from '@/src/data/health-data';
import {
    useDeleteMemberMutation,
    usePatchMemberMutation,
} from '@/src/features/family/mutations';
import MedicineScreen from '@/src/screens/health/MedicineScreen';
import { RecordDetail } from '@/src/screens/health/RecordsScreen';
import {
    medicalRecordsQueryKeys,
    medicalRecordsService,
} from '@/src/services/medicalRecords.services';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import type { FamilyGroup, FamilyMember } from '@/src/types/family';
import type { RecordItem } from '@/src/types/health';
import { ProfileRow, SectionLabel, bmiValue } from './familyShared';
import { styles } from './styles';

type MemberTab = 'personal' | 'health' | 'history';
type HealthSheetKey =
    | 'blood'
    | 'chronicIllness'
    | 'drugAllergies'
    | 'foodAllergies'
    | null;

type TagPreviewState = {
    title: string;
    tags: string[];
} | null;

type SheetType = 'simple' | 'select' | 'date' | null;
interface SheetState {
    type: SheetType;
    key: string;
    title: string;
    value: string;
    icon: string;
    suffix?: string;
    keyboard?: 'default' | 'numeric';
    options?: string[];
    isStepper?: boolean;
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const RECORD_STYLE_PRESETS = [
    {
        category: 'cardiology',
        iconName: 'heart-outline',
        iconColor: colors.primary,
        bg: colors.primaryBg,
        tagBg: colors.primaryBg,
        tagColor: colors.primary,
        dotColor: colors.primary,
    },
    {
        category: 'internal',
        iconName: 'shield-checkmark-outline',
        iconColor: colors.info,
        bg: colors.infoBg,
        tagBg: colors.infoBg,
        tagColor: colors.info,
        dotColor: colors.info,
    },
    {
        category: 'general',
        iconName: 'medical-outline',
        iconColor: colors.secondary,
        bg: colors.secondaryBg,
        tagBg: colors.secondaryBg,
        tagColor: colors.secondary,
        dotColor: colors.secondary,
    },
];

function bmiStatusLabel(bmi: number): string {
    if (!bmi) return 'Chưa đủ dữ liệu';
    if (bmi < 18.5) return 'Cân nặng thấp';
    if (bmi < 23) return 'Bình thường';
    if (bmi < 25) return 'Thừa cân';
    return 'Cần theo dõi';
}

function normalizeMedicationSchedule(desc?: string): {
    schedule: string;
    note: string;
} {
    if (!desc) {
        return {
            schedule: 'Chưa rõ lịch dùng',
            note: 'cập nhật thêm thông tin',
        };
    }

    const parts = desc
        .split('·')
        .map((part) => part.trim())
        .filter(Boolean);

    return {
        schedule: parts[1]
            ? `${parts[1]} 1 viên`
            : (parts[0] ?? 'Chưa rõ lịch dùng'),
        note: parts[2]?.toLowerCase() ?? 'cập nhật thêm thông tin',
    };
}

function getBmiPosition(bmiValue: number) {
    if (!bmiValue) return '0%';
    const min = 15;
    const max = 35;
    const percentage = ((bmiValue - min) / (max - min)) * 100;
    return `${Math.min(Math.max(percentage, 0), 100)}%`;
}

function parseHealthList(value?: string | null): string[] {
    if (!value || value === 'Không') return [];
    return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
}

function formatApiDate(value: string): string | null {
    const parts = value.split('/');
    if (parts.length !== 3) return null;

    const day = Number(parts[0]);
    const month = Number(parts[1]);
    const year = Number(parts[2]);

    if (!day || !month || !year) return null;

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
        2,
        '0',
    )}`;
}

function apiGender(value: string): string | null {
    const normalized = value.trim().toLowerCase();
    if (!normalized) return null;
    if (normalized === 'nam' || normalized === 'male') return 'male';
    if (normalized === 'nữ' || normalized === 'nu' || normalized === 'female') {
        return 'female';
    }
    if (
        normalized === 'khác' ||
        normalized === 'khac' ||
        normalized === 'other'
    ) {
        return 'other';
    }
    return normalized;
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

function nullableString(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : undefined;
    }
    return undefined;
}

function recordList(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter(
              (item): item is Record<string, unknown> =>
                  !!item && typeof item === 'object',
          )
        : [];
}

function formatDisplayDate(value: unknown): string {
    const raw = nullableString(value);
    if (!raw) return '';
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
}

function normalizeRecord(
    record: Record<string, unknown>,
    index: number,
): RecordItem {
    const preset = RECORD_STYLE_PRESETS[index % RECORD_STYLE_PRESETS.length];
    const visitDate =
        nullableString(record.visit_date) ??
        nullableString(record.created_at) ??
        new Date().toISOString();
    const title =
        nullableString(record.title) ??
        nullableString(record.diagnosis_name) ??
        `Hồ sơ khám bệnh ${index + 1}`;
    const specialty =
        nullableString(record.specialty) ??
        nullableString(record.department) ??
        'Khám bệnh';

    return {
        id: nullableString(record.id) ?? `record-${index}`,
        category: preset.category,
        iconName: preset.iconName,
        iconColor: preset.iconColor,
        bg: preset.bg,
        title,
        hospital: nullableString(record.hospital_name) ?? 'Chưa cập nhật cơ sở',
        doctor: nullableString(record.doctor_name),
        diagnosis: nullableString(record.diagnosis_name),
        tag: specialty,
        tagBg: preset.tagBg,
        tagColor: preset.tagColor,
        dotColor: preset.dotColor,
        date: formatDisplayDate(visitDate) || '--/--/----',
        isoDate: visitDate.slice(0, 10),
        location: nullableString(record.location),
        department: specialty,
        symptoms: Array.isArray(record.symptoms)
            ? record.symptoms.filter(
                  (item): item is string =>
                      typeof item === 'string' && item.trim().length > 0,
              )
            : undefined,
        testResults: nullableString(record.test_results),
        doctorAdvice: nullableString(record.doctor_advice),
    };
}

function calculateVaccineSummary(vaccinations: unknown): {
    done: number;
    total: number;
    percent: number;
} {
    const items = recordList(vaccinations);
    let done = 0;
    let total = 0;

    for (const vaccination of items) {
        const doses = recordList(vaccination.doses);
        const administered =
            numberValue(vaccination.doses_administered_count) ??
            doses.filter((dose) =>
                Boolean(
                    nullableString(dose.administered_at) ??
                    nullableString(dose.date) ??
                    nullableString(dose.injected_at),
                ),
            ).length;
        const required =
            numberValue(vaccination.recommendation_total_doses) ??
            numberValue(vaccination.total_doses) ??
            Math.max(doses.length, administered);

        done += administered;
        total += required;
    }

    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    return { done, total, percent };
}

export default function FamilyMemberDetailScreen({
    family,
    member,
    initialTab,
}: {
    family: FamilyGroup;
    member: FamilyMember;
    initialTab?: MemberTab;
}): React.JSX.Element {
    const [memberTab, setMemberTab] = useState<MemberTab>(
        initialTab || 'personal',
    );
    const [sheet, setSheet] = useState<SheetState | null>(null);
    const [draft, setDraft] = useState('');
    const [_roleModalOpen, _setRoleModalOpen] = useState(false);
    const [addContactModal, setAddContactModal] = useState(false);
    const [draftContactName, setDraftContactName] = useState('');
    const [draftContactRelation, setDraftContactRelation] =
        useState('Vợ/chồng');
    const [draftContactPhone, setDraftContactPhone] = useState('');
    const profileId =
        (member as any).profileId ??
        (member as any).profile_id ??
        (member as any).healthProfile?.profile_id ??
        member.healthProfileId;
    const [healthSheetKey, setHealthSheetKey] = useState<HealthSheetKey>(null);
    const [healthSheetDraftBlood, setHealthSheetDraftBlood] = useState(
        member.bloodType || '',
    );
    const [healthSheetDraftTags, setHealthSheetDraftTags] = useState<string[]>(
        [],
    );
    const [healthTagText, setHealthTagText] = useState('');
    const [tagPreview, setTagPreview] = useState<TagPreviewState>(null);
    const [memberBloodType, setMemberBloodType] = useState(
        member.bloodType || '',
    );
    const [memberChronicIllnesses, setMemberChronicIllnesses] = useState(
        parseHealthList(member.chronicIllness),
    );
    const [memberDrugAllergies, setMemberDrugAllergies] = useState(
        parseHealthList(member.drugAllergies ?? member.allergies),
    );
    const [memberFoodAllergies, setMemberFoodAllergies] = useState<string[]>(
        parseHealthList(member.foodAllergies),
    );
    const [memberHealthNotes, setMemberHealthNotes] = useState(
        member.importantMedicalNote || '',
    );

    const [selectedRecord, setSelectedRecord] = useState<RecordItem | null>(
        null,
    );
    const [showMedicinesScreen, setShowMedicinesScreen] = useState(false);
    const [recordMenuId, setRecordMenuId] = useState<string | null>(null);
    const { data: remoteMedicalRecords = [], isLoading: recordsLoading } =
        useQuery({
            queryKey: profileId
                ? medicalRecordsQueryKeys.byProfile(String(profileId))
                : [...medicalRecordsQueryKeys.all, 'missing-profile'],
            queryFn: () =>
                medicalRecordsService.listForProfile(String(profileId)),
            enabled: !!profileId,
        });

    const bmi = bmiValue(member.height, member.weight);
    const _deleteMemberMutation = useDeleteMemberMutation();
    const patchMemberMutation = usePatchMemberMutation();

    const _canManageMembers =
        family.familyRole === 'OWNER' || family.familyRole === 'ADMIN';
    const _showChangeRole =
        _canManageMembers && !member.isSelf && !member.isOwner;
    const _showRemoveOther =
        _canManageMembers && !member.isSelf && !member.isOwner;
    const memberBasePath = `/family/${family.id}/member/${member.id}`;
    const emergencyContacts =
        member.emergencyContacts?.map((contact, index) => ({
            id: contact.id ?? `ec-${index}`,
            name: contact.name?.trim() || 'Người liên hệ',
            relation: contact.relationship?.trim() || 'Người thân',
            phone: contact.phone?.trim() || '',
        })) ?? [];
    const healthInfoItems = [
        {
            key: 'bloodType',
            label: 'Nhóm máu',
            value: memberBloodType || '--',
            icon: 'water-outline',
            color: '#EF4444',
            bg: '#FEF2F2',
            type: 'blood',
        },
        {
            key: 'chronicIllness',
            label: 'Bệnh nền',
            value: memberChronicIllnesses,
            icon: 'heart-outline',
            color: '#F59E0B',
            bg: '#FFF7ED',
            type: 'chips',
            suggestions: [
                'Tăng huyết áp',
                'Tiểu đường type 2',
                'Tim mạch',
                'Hen suyễn',
                'Viêm khớp',
                'Gout',
                'Mỡ máu cao',
                'Suy thận',
            ],
        },
        {
            key: 'drugAllergies',
            label: 'Dị ứng thuốc',
            value: memberDrugAllergies,
            icon: 'bandage-outline',
            color: '#F43F5E',
            bg: '#FFF1F2',
            type: 'chips',
            suggestions: ['Penicillin', 'Ibuprofen', 'Aspirin', 'Sulfa'],
        },
        {
            key: 'foodAllergies',
            label: 'Dị ứng thực phẩm',
            value: memberFoodAllergies,
            icon: 'leaf-outline',
            color: '#10B981',
            bg: '#ECFDF5',
            type: 'chips',
            suggestions: [
                'Hải sản',
                'Đậu phộng',
                'Sữa bò',
                'Trứng',
                'Đậu nành',
            ],
        },
        {
            key: 'notes',
            label: 'Ghi chú y tế quan trọng',
            value: memberHealthNotes,
            icon: 'document-text-outline',
            color: '#8B5CF6',
            bg: '#F5F3FF',
            type: 'note',
        },
    ];
    const medications = (member.medications ?? [])
        .map((item) => ({
            name: item.name,
            ...normalizeMedicationSchedule(item.desc),
        }))
        .slice(0, 3);
    const embeddedMedicalRecords = recordList(member.medicalRecords);
    const medicalRecordSource =
        remoteMedicalRecords.length > 0
            ? remoteMedicalRecords
            : embeddedMedicalRecords;
    const previewRecords = medicalRecordSource
        .slice(0, 2)
        .map((record, index) =>
            normalizeRecord(record as Record<string, unknown>, index),
        );
    const vaccineSummary = calculateVaccineSummary(member.vaccinations);
    const hasHealthMetrics = recordList(member.healthMetrics).length > 0;

    const openHealthSheet = (key: HealthSheetKey) => {
        Keyboard.dismiss();
        setHealthTagText('');
        setHealthSheetKey(key);
        if (key === 'blood') {
            setHealthSheetDraftBlood(memberBloodType || '');
            return;
        }
        if (key === 'chronicIllness') {
            setHealthSheetDraftTags([...memberChronicIllnesses]);
            return;
        }
        if (key === 'drugAllergies') {
            setHealthSheetDraftTags([...memberDrugAllergies]);
            return;
        }
        if (key === 'foodAllergies') {
            setHealthSheetDraftTags([...memberFoodAllergies]);
        }
    };

    const openDate = (key: string, title: string, value: string) => {
        Keyboard.dismiss();
        setDraft(value);
        setSheet({ type: 'date', key, title, value, icon: 'calendar' });
    };

    const openSimple = (
        key: string,
        title: string,
        value: string,
        icon: string,
        suffix?: string,
        keyboard?: 'default' | 'numeric',
        isStepper?: boolean,
    ) => {
        Keyboard.dismiss();
        setDraft(value);
        setSheet({
            type: 'simple',
            key,
            title,
            value,
            icon,
            suffix,
            keyboard,
            isStepper,
        });
    };

    const openSelect = (
        key: string,
        title: string,
        value: string,
        icon: string,
        options: string[],
    ) => {
        Keyboard.dismiss();
        setDraft(value);
        setSheet({ type: 'select', key, title, value, icon, options });
    };

    const addHealthTag = () => {
        const trimmed = healthTagText.trim();
        if (!trimmed || healthSheetDraftTags.includes(trimmed)) return;
        setHealthSheetDraftTags((prev) => [...prev, trimmed]);
        setHealthTagText('');
    };

    const removeHealthTag = (tag: string) => {
        setHealthSheetDraftTags((prev) => prev.filter((item) => item !== tag));
    };

    const saveHealthSheet = async () => {
        if (!healthSheetKey) return;
        try {
            if (healthSheetKey === 'blood') {
                await patchMemberMutation.mutateAsync({
                    membershipId: member.id,
                    bloodType: healthSheetDraftBlood,
                } as any);
                setMemberBloodType(healthSheetDraftBlood);
            } else if (healthSheetKey === 'chronicIllness') {
                const value = healthSheetDraftTags.join(', ');
                await patchMemberMutation.mutateAsync({
                    membershipId: member.id,
                    chronicIllness: value,
                } as any);
                setMemberChronicIllnesses([...healthSheetDraftTags]);
            } else if (healthSheetKey === 'drugAllergies') {
                const value = healthSheetDraftTags.join(', ');
                await patchMemberMutation.mutateAsync({
                    membershipId: member.id,
                    allergies: value,
                } as any);
                setMemberDrugAllergies([...healthSheetDraftTags]);
            } else if (healthSheetKey === 'foodAllergies') {
                const value = healthSheetDraftTags.join(', ');
                await patchMemberMutation.mutateAsync({
                    membershipId: member.id,
                    foodAllergies: value,
                } as any);
                setMemberFoodAllergies([...healthSheetDraftTags]);
            }
        } catch {
            // mutation toast handles error
        }
        setHealthSheetKey(null);
    };

    const saveSheet = async () => {
        if (!sheet) return;
        const payloadValue =
            sheet.key === 'dob'
                ? formatApiDate(draft)
                : sheet.key === 'gender'
                  ? apiGender(draft)
                  : draft;
        try {
            await patchMemberMutation.mutateAsync({
                membershipId: member.id,
                [sheet.key]: payloadValue,
            } as any);
            if (sheet.key === 'importantMedicalNote') {
                setMemberHealthNotes(draft);
            }
        } catch {
            // error is handled by mutation toast
        }
        setSheet(null);
    };

    const _confirmRemoveMember = () => {
        Alert.alert('Xóa thành viên', `Xóa ${member.name} khỏi gia đình?`, [
            { text: 'Hủy', style: 'cancel' },
            {
                text: 'Xóa',
                style: 'destructive',
                onPress: () => {
                    _deleteMemberMutation.mutate(
                        { membershipId: member.id },
                        {
                            onSuccess: () => {
                                router.back();
                            },
                        },
                    );
                },
            },
        ]);
    };

    const _applyMembershipRole = async (role: 'ADMIN' | 'MEMBER') => {
        try {
            await patchMemberMutation.mutateAsync({
                membershipId: member.id,
                role,
            });
            _setRoleModalOpen(false);
        } catch {
            /* toast trong mutation */
        }
    };

    const handleCallContact = (phone: string) => {
        Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {
            // ignore when dialer is unavailable
        });
    };

    if (showMedicinesScreen) {
        return (
            <MedicineScreen
                onClose={() => setShowMedicinesScreen(false)}
                headerTitle='Đơn thuốc'
            />
        );
    }

    if (selectedRecord) {
        return (
            <RecordDetail
                record={selectedRecord}
                onClose={() => setSelectedRecord(null)}
            />
        );
    }

    return (
        <SafeAreaView
            edges={['left', 'right', 'bottom']}
            style={styles.container}
        >
            <StatusBar barStyle='dark-content' backgroundColor={colors.card} />
            <SafeAreaView
                edges={['top']}
                style={{ backgroundColor: colors.card }}
            />

            <View style={styles.memberHeader}>
                <View style={styles.memberHeaderTop}>
                    <Pressable
                        style={styles.memberBackBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name='chevron-back'
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={styles.memberBackText}>{family.name}</Text>
                    </Pressable>
                </View>

                <View style={{ flexDirection: 'row', gap: 14 }}>
                    <View
                        style={[
                            styles.memberAv,
                            {
                                backgroundColor:
                                    member.gradientColors?.[0] ?? '#2563EB',
                            },
                        ]}
                    >
                        <Text style={styles.memberAvText}>
                            {member.initials}
                        </Text>
                    </View>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text
                            style={[
                                styles.roleBadge,
                                {
                                    backgroundColor: '#EEF2FF',
                                    color: '#6366F1',
                                },
                            ]}
                        >
                            {member.role}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.tabBar}>
                <Pressable
                    style={[
                        styles.tab,
                        memberTab === 'personal' ? styles.tabActive : null,
                    ]}
                    onPress={() => setMemberTab('personal')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            memberTab === 'personal'
                                ? styles.tabTextActive
                                : null,
                        ]}
                    >
                        Cá nhân
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.tab,
                        memberTab === 'health' ? styles.tabActive : null,
                    ]}
                    onPress={() => setMemberTab('health')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            memberTab === 'health'
                                ? styles.tabTextActive
                                : null,
                        ]}
                    >
                        Y tế
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.tab,
                        memberTab === 'history' ? styles.tabActive : null,
                    ]}
                    onPress={() => setMemberTab('history')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            memberTab === 'history'
                                ? styles.tabTextActive
                                : null,
                        ]}
                    >
                        Lịch sử
                    </Text>
                </Pressable>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: 14 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {memberTab === 'personal' ? (
                    <>
                        <SectionLabel title='Thông tin cá nhân' />
                        <View style={shared.cardBlock}>
                            <ProfileRow
                                icon='calendar-outline'
                                color={colors.primary}
                                bg={colors.primaryBg}
                                label='Ngày sinh'
                                value={member.dob ?? '--'}
                                onPress={() =>
                                    openDate(
                                        'dob',
                                        'Ngày sinh',
                                        member.dob ?? '',
                                    )
                                }
                            />
                            <ProfileRow
                                icon='person-outline'
                                color='#6366F1'
                                bg='#EEF2FF'
                                label='Giới tính'
                                value={member.gender}
                                onPress={() =>
                                    openSelect(
                                        'gender',
                                        'Giới tính',
                                        member.gender,
                                        'person',
                                        ['Nam', 'Nữ', 'Khác'],
                                    )
                                }
                            />
                            <ProfileRow
                                icon='resize-outline'
                                color={colors.success}
                                bg={colors.successBg}
                                label='Chiều cao'
                                value={`${member.height ?? '--'} cm`}
                                onPress={() =>
                                    openSimple(
                                        'height',
                                        'Chiều cao',
                                        member.height
                                            ? String(member.height)
                                            : '',
                                        'resize',
                                        'cm',
                                        'numeric',
                                    )
                                }
                            />
                            <ProfileRow
                                icon='speedometer-outline'
                                color={colors.success}
                                bg={colors.successBg}
                                label='Cân nặng'
                                value={`${member.weight ?? '--'} kg`}
                                badge={`BMI ${bmi.toFixed(1)}`}
                                onPress={() =>
                                    openSimple(
                                        'weight',
                                        'Cân nặng',
                                        member.weight
                                            ? String(member.weight)
                                            : '',
                                        'speedometer-outline',
                                        'kg',
                                        'numeric',
                                        true,
                                    )
                                }
                            />
                            <ProfileRow
                                icon='location-outline'
                                color={colors.warning}
                                bg={colors.warningBg}
                                label='Địa chỉ'
                                value={member.address ?? 'Chưa cập nhật'}
                                onPress={() =>
                                    openSimple(
                                        'address',
                                        'Địa chỉ',
                                        member.address ?? '',
                                        'location',
                                    )
                                }
                                isLast
                            />
                        </View>
                    </>
                ) : memberTab === 'health' ? (
                    <>
                        <SectionLabel title='Chỉ số sức khỏe' />
                        <View style={styles.healthSummaryCard}>
                            <View style={styles.bmiRow}>
                                <View style={styles.bmiIcon}>
                                    <Ionicons
                                        name='heart-outline'
                                        size={20}
                                        color={colors.primary}
                                    />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.bmiLabel}>
                                        Chỉ số BMI
                                    </Text>
                                    <View style={styles.bmiValueRow}>
                                        <Text style={styles.bmiValue}>
                                            {bmi ? bmi.toFixed(1) : '--'}
                                        </Text>
                                        {bmi ? (
                                            <Text style={styles.bmiUnit}>
                                                kg/m²
                                            </Text>
                                        ) : null}
                                    </View>
                                    <Text style={styles.bmiSub}>
                                        {member.height ?? '--'} cm ·{' '}
                                        {member.weight ?? '--'} kg
                                    </Text>
                                </View>
                                {bmi ? (
                                    <Text style={styles.bmiBadge}>
                                        {bmiStatusLabel(bmi)}
                                    </Text>
                                ) : null}
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
                                                left: getBmiPosition(
                                                    bmi,
                                                ) as any,
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
                            <View style={styles.bmiNoteRow}>
                                <Ionicons
                                    name='information-circle-outline'
                                    size={16}
                                    color={colors.text3}
                                />
                                <Text style={styles.bmiNoteText}>
                                    BMI chỉ dựa trên chiều cao và cân nặng, chưa
                                    phản ánh tỷ lệ cơ/mỡ hay sức khỏe toàn diện.
                                </Text>
                            </View>
                        </View>

                        <SectionLabel title='Thông tin y tế cơ bản' />
                        <View style={styles.healthInfoCard}>
                            {healthInfoItems.map((item, index) => (
                                <Pressable
                                    key={item.label}
                                    style={[
                                        styles.healthInfoRowObj,
                                        index === healthInfoItems.length - 1
                                            ? styles.healthInfoRowLast
                                            : null,
                                    ]}
                                    onPress={() => {
                                        if (item.type === 'blood') {
                                            openHealthSheet('blood');
                                            return;
                                        }
                                        if (item.type === 'chips') {
                                            openHealthSheet(
                                                item.key as HealthSheetKey,
                                            );
                                            return;
                                        }
                                        openSimple(
                                            'importantMedicalNote',
                                            'Ghi chú y tế quan trọng',
                                            memberHealthNotes,
                                            'document-text-outline',
                                        );
                                    }}
                                >
                                    <View
                                        style={[
                                            styles.hiIconWrap,
                                            { backgroundColor: item.bg },
                                        ]}
                                    >
                                        <Ionicons
                                            name={item.icon as any}
                                            size={18}
                                            color={item.color}
                                        />
                                    </View>
                                    <View style={styles.hiBody}>
                                        {item.type === 'blood' && (
                                            <View>
                                                <Text style={styles.hiLabel}>
                                                    {item.label}
                                                </Text>
                                                <Text
                                                    style={[
                                                        styles.hiValueInline,
                                                        { color: item.color },
                                                    ]}
                                                >
                                                    {item.value || '--'}
                                                </Text>
                                            </View>
                                        )}
                                        {item.type === 'chips' && (
                                            <View>
                                                <Text
                                                    style={styles.hiLabelTitle}
                                                >
                                                    {item.label}
                                                </Text>
                                                <View
                                                    style={styles.hiChipsWrap}
                                                >
                                                    {Array.isArray(
                                                        item.value,
                                                    ) &&
                                                    item.value.length > 0 ? (
                                                        (() => {
                                                            const tagSummary =
                                                                summarizeHealthTags(
                                                                    item.value,
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
                                                                                        tags: Array.isArray(
                                                                                            item.value,
                                                                                        )
                                                                                            ? item.value
                                                                                            : [],
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
                                                            style={
                                                                styles.hiEmptyText
                                                            }
                                                        >
                                                            Chưa có thông tin
                                                        </Text>
                                                    )}
                                                </View>
                                            </View>
                                        )}
                                        {item.type === 'note' && (
                                            <View
                                                style={{
                                                    width: '100%',
                                                    paddingRight: 10,
                                                }}
                                            >
                                                <Text
                                                    style={styles.hiLabelTitle}
                                                >
                                                    {item.label}
                                                </Text>
                                                <View
                                                    style={styles.hiBlockWrap}
                                                >
                                                    <Text
                                                        style={
                                                            item.value
                                                                ? styles.hiBlockText
                                                                : styles.hiEmptyText
                                                        }
                                                    >
                                                        {item.value ||
                                                            'Chưa có thông tin'}
                                                    </Text>
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
                        </View>

                        <SectionHeader
                            title='Đơn thuốc'
                            action='Tất cả'
                            onAction={() => setShowMedicinesScreen(true)}
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
                                count={`${medications.length} đang dùng`}
                                countStyle={{ color: colors.secondary }}
                            />
                            {medications.map((item, index) => {
                                const styleDef =
                                    MED_ROWS[index % MED_ROWS.length];
                                return (
                                    <Pressable
                                        key={`${item.name}-${index}`}
                                        onPress={() =>
                                            setShowMedicinesScreen(true)
                                        }
                                        style={[
                                            styles.medicineListRow,
                                            index === medications.length - 1
                                                ? styles.medicineListRowLast
                                                : null,
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.medicineListIcon,
                                                {
                                                    backgroundColor:
                                                        styleDef.bg,
                                                },
                                            ]}
                                        >
                                            <MaterialCommunityIcons
                                                name='pill'
                                                size={16}
                                                color={styleDef.iconColor}
                                            />
                                        </View>
                                        <View style={styles.medicineListBody}>
                                            <Text
                                                style={
                                                    styles.medicineListTitleCompact
                                                }
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                    </Pressable>
                                );
                            })}
                        </CardBlock>

                        <SectionLabel title='Liên hệ khẩn cấp' />
                        <View style={styles.healthInfoCard}>
                            {emergencyContacts.map((contact, index) => {
                                const initial = contact.name
                                    .charAt(0)
                                    .toUpperCase();
                                const bgColors = [
                                    '#EFF6FF',
                                    '#FAF5FF',
                                    '#F0FDF4',
                                    '#FFFBEB',
                                ];
                                const textColors = [
                                    '#2563EB',
                                    '#9333EA',
                                    '#16A34A',
                                    '#D97706',
                                ];
                                const avatarBg =
                                    bgColors[index % bgColors.length];
                                const avatarColor =
                                    textColors[index % textColors.length];
                                return (
                                    <View
                                        key={contact.id}
                                        style={styles.emergencyContactRow}
                                    >
                                        <View
                                            style={[
                                                styles.ecAvatar,
                                                { backgroundColor: avatarBg },
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.ecAvatarText,
                                                    { color: avatarColor },
                                                ]}
                                            >
                                                {initial}
                                            </Text>
                                        </View>
                                        <View
                                            style={styles.emergencyContactBody}
                                        >
                                            <Text
                                                style={
                                                    styles.emergencyContactName
                                                }
                                            >
                                                {contact.name}
                                            </Text>
                                            <Text
                                                style={
                                                    styles.emergencyContactMeta
                                                }
                                            >
                                                {contact.relation} •{' '}
                                                {contact.phone}
                                            </Text>
                                        </View>
                                        <Pressable
                                            style={styles.emergencyCallButton}
                                            onPress={() =>
                                                handleCallContact(contact.phone)
                                            }
                                        >
                                            <Ionicons
                                                name='call-outline'
                                                size={16}
                                                color='#16A34A'
                                            />
                                        </Pressable>
                                    </View>
                                );
                            })}
                            <Pressable
                                style={[
                                    styles.emergencyContactRow,
                                    styles.healthInfoRowLast,
                                ]}
                                onPress={() => setAddContactModal(true)}
                            >
                                <View
                                    style={[
                                        styles.ecAvatar,
                                        {
                                            backgroundColor: '#EFF6FF',
                                            borderStyle: 'dashed',
                                            borderWidth: 1,
                                            borderColor: '#BFDBFE',
                                        },
                                    ]}
                                >
                                    <Ionicons
                                        name='add'
                                        size={18}
                                        color='#2563EB'
                                    />
                                </View>
                                <Text style={styles.ecAddText}>
                                    Thêm người liên hệ
                                </Text>
                            </Pressable>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.healthSectionHeader}>
                            <SectionLabel title='Hồ sơ khám bệnh' />
                            <Pressable
                                onPress={() =>
                                    router.push(
                                        `${memberBasePath}/history/records` as any,
                                    )
                                }
                            >
                                <Text style={styles.healthSectionAction}>
                                    Tất cả
                                </Text>
                            </Pressable>
                        </View>
                        {recordsLoading ? (
                            <View style={shared.cardBlock}>
                                <Text style={styles.hiEmptyText}>
                                    Đang tải hồ sơ khám bệnh...
                                </Text>
                            </View>
                        ) : null}
                        {!recordsLoading && previewRecords.length === 0 ? (
                            <View style={shared.cardBlock}>
                                <Text style={styles.hiEmptyText}>
                                    Chưa có hồ sơ khám bệnh
                                </Text>
                            </View>
                        ) : null}
                        {!recordsLoading &&
                            previewRecords.map((record) => (
                                <Pressable
                                    key={record.id}
                                    style={styles.recordCard}
                                    onPress={() => {
                                        setRecordMenuId(null);
                                        setSelectedRecord(record);
                                    }}
                                >
                                    <View style={styles.recordCardTop}>
                                        <View
                                            style={[
                                                styles.recordIconCard,
                                                {
                                                    backgroundColor: record.bg,
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={
                                                    record.iconName as keyof typeof Ionicons.glyphMap
                                                }
                                                size={18}
                                                color={record.iconColor}
                                            />
                                        </View>
                                        <View style={styles.recordContent}>
                                            <Text
                                                style={styles.recordTitle}
                                                numberOfLines={2}
                                            >
                                                {record.title}
                                            </Text>
                                            <Text
                                                style={styles.recordMetaLine}
                                                numberOfLines={1}
                                            >
                                                {record.hospital}
                                                {record.doctor
                                                    ? ` • ${record.doctor}`
                                                    : ''}
                                            </Text>
                                            {record.diagnosis ? (
                                                <View
                                                    style={styles.recordDiagRow}
                                                >
                                                    <View
                                                        style={
                                                            styles.recordDiagDot
                                                        }
                                                    />
                                                    <Text
                                                        style={
                                                            styles.recordDiagText
                                                        }
                                                        numberOfLines={2}
                                                    >
                                                        {record.diagnosis}
                                                    </Text>
                                                </View>
                                            ) : null}
                                        </View>
                                        <View style={{ position: 'relative' }}>
                                            <Pressable
                                                style={styles.recordMoreBtn}
                                                onPress={(event) => {
                                                    event.stopPropagation();
                                                    setRecordMenuId((prev) =>
                                                        prev === record.id
                                                            ? null
                                                            : record.id,
                                                    );
                                                }}
                                            >
                                                <Ionicons
                                                    name='ellipsis-vertical'
                                                    size={16}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                            {recordMenuId === record.id ? (
                                                <View style={styles.ctxMenu}>
                                                    <Pressable
                                                        style={styles.ctxItem}
                                                        onPress={(event) => {
                                                            event.stopPropagation();
                                                            setRecordMenuId(
                                                                null,
                                                            );
                                                            setSelectedRecord(
                                                                record,
                                                            );
                                                        }}
                                                    >
                                                        <Ionicons
                                                            name='create-outline'
                                                            size={14}
                                                            color={
                                                                colors.primary
                                                            }
                                                        />
                                                        <Text
                                                            style={
                                                                styles.ctxItemText
                                                            }
                                                        >
                                                            Chỉnh sửa
                                                        </Text>
                                                    </Pressable>
                                                    <View
                                                        style={
                                                            styles.ctxDivider
                                                        }
                                                    />
                                                    <Pressable
                                                        style={
                                                            styles.ctxItemDel
                                                        }
                                                        onPress={(event) => {
                                                            event.stopPropagation();
                                                            setRecordMenuId(
                                                                null,
                                                            );
                                                        }}
                                                    >
                                                        <Ionicons
                                                            name='trash-outline'
                                                            size={14}
                                                            color={
                                                                colors.danger
                                                            }
                                                        />
                                                        <Text
                                                            style={
                                                                styles.ctxItemDelText
                                                            }
                                                        >
                                                            Xoá hồ sơ
                                                        </Text>
                                                    </Pressable>
                                                </View>
                                            ) : null}
                                        </View>
                                    </View>
                                    <View style={styles.recordCardFooter}>
                                        <Text
                                            style={[
                                                styles.recordTag,
                                                {
                                                    backgroundColor:
                                                        record.tagBg,
                                                    color: record.tagColor,
                                                },
                                            ]}
                                        >
                                            {record.tag}
                                        </Text>
                                        {record.location ? (
                                            <View
                                                style={styles.recordMetaRight}
                                            >
                                                <Ionicons
                                                    name='location-outline'
                                                    size={11}
                                                    color={colors.text3}
                                                />
                                                <Text
                                                    style={
                                                        styles.recordMetaText
                                                    }
                                                >
                                                    {record.location}
                                                </Text>
                                            </View>
                                        ) : null}
                                    </View>
                                </Pressable>
                            ))}

                        <View style={styles.healthSectionHeader}>
                            <SectionLabel title='Tiêm chủng' />
                            <Pressable
                                onPress={() =>
                                    router.push(
                                        `${memberBasePath}/history/vaccines` as any,
                                    )
                                }
                            >
                                <Text
                                    style={[
                                        styles.healthSectionAction,
                                        { color: '#0F766E' },
                                    ]}
                                >
                                    Xem chi tiết
                                </Text>
                            </Pressable>
                        </View>
                        <View style={styles.vaccineCard}>
                            <View style={styles.vaccineCardTop}>
                                <View style={styles.vaccineProgWrap}>
                                    <Svg
                                        style={{ position: 'absolute' }}
                                        width={56}
                                        height={56}
                                    >
                                        <Circle
                                            cx='28'
                                            cy='28'
                                            r={24}
                                            stroke='#E2E8F0'
                                            strokeWidth={5}
                                            fill='none'
                                        />
                                        <Circle
                                            cx='28'
                                            cy='28'
                                            r={24}
                                            stroke='#D97706'
                                            strokeWidth={5}
                                            fill='none'
                                            strokeDasharray={2 * Math.PI * 24}
                                            strokeDashoffset={
                                                2 *
                                                Math.PI *
                                                24 *
                                                (1 -
                                                    vaccineSummary.percent /
                                                        100)
                                            }
                                            strokeLinecap='round'
                                            rotation='-90'
                                            origin='28, 28'
                                        />
                                    </Svg>
                                    <Text style={styles.vaccineProgText}>
                                        {vaccineSummary.percent}%
                                    </Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.vaccineTitle}>
                                        Hoàn thành{' '}
                                        <Text style={{ color: '#D97706' }}>
                                            {vaccineSummary.percent}%
                                        </Text>
                                    </Text>
                                    <Text style={styles.vaccineSub}>
                                        {vaccineSummary.done} /{' '}
                                        {vaccineSummary.total} mũi khuyến nghị
                                    </Text>
                                </View>
                            </View>
                            <View style={styles.vaccineDivider} />
                            <View style={styles.vaccineCardBottom}>
                                <Ionicons
                                    name='information-circle-outline'
                                    size={16}
                                    color={colors.text3}
                                    style={{ marginTop: 2, marginLeft: 2 }}
                                />
                                <Text style={styles.vaccineInfoText}>
                                    Khuyến nghị dựa theo WHO & CDC. Bạn có thể
                                    nhập mũi đã tiêm để hệ thống tính lại.
                                </Text>
                            </View>
                        </View>

                        <View style={styles.healthSectionHeader}>
                            <SectionLabel title='Chỉ số theo thời gian' />
                            <Pressable
                                onPress={() =>
                                    router.push(
                                        `${memberBasePath}/history/metrics` as any,
                                    )
                                }
                            >
                                <Text style={styles.healthSectionAction}>
                                    Tất cả
                                </Text>
                            </Pressable>
                        </View>

                        <View style={shared.cardBlock}>
                            <Pressable
                                style={styles.statsSummaryRow}
                                onPress={() =>
                                    router.push(
                                        `${memberBasePath}/history/metrics` as any,
                                    )
                                }
                            >
                                <View style={styles.statsSummaryIcon}>
                                    <MaterialCommunityIcons
                                        name='chart-line'
                                        size={18}
                                        color='#D97706'
                                    />
                                </View>
                                <View style={styles.statsSummaryBody}>
                                    <Text style={styles.hiLabelTitle}>
                                        Thống kê chi tiết sức khỏe
                                    </Text>
                                    <Text style={styles.statsSummarySub}>
                                        {hasHealthMetrics
                                            ? 'Xem biểu đồ huyết áp, cân nặng, đường huyết'
                                            : 'Chưa có chỉ số sức khỏe'}
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={16}
                                    color={colors.primary}
                                />
                            </Pressable>
                        </View>
                    </>
                )}
            </ScrollView>

            <Modal
                visible={sheet !== null}
                transparent
                animationType='fade'
                onRequestClose={() => setSheet(null)}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setSheet(null)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={styles.sheetKeyboard}
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
                                    {sheet?.title}
                                </Text>
                                <Pressable onPress={() => setSheet(null)}>
                                    <Ionicons
                                        name='close'
                                        size={20}
                                        color={colors.text2}
                                    />
                                </Pressable>
                            </View>

                            {sheet?.type === 'date' && (
                                <View style={shared.sheetBody}>
                                    <DateField
                                        value={(() => {
                                            const parts = draft.split('/');
                                            if (parts.length === 3) {
                                                const d = parseInt(
                                                    parts[0],
                                                    10,
                                                );
                                                const m = parseInt(
                                                    parts[1],
                                                    10,
                                                );
                                                const y = parseInt(
                                                    parts[2],
                                                    10,
                                                );
                                                const date = new Date(
                                                    y,
                                                    m - 1,
                                                    d,
                                                );
                                                if (!isNaN(date.getTime())) {
                                                    return date;
                                                }
                                            }
                                            return null;
                                        })()}
                                        onChange={(date) => {
                                            const dd = String(
                                                date.getDate(),
                                            ).padStart(2, '0');
                                            const mm = String(
                                                date.getMonth() + 1,
                                            ).padStart(2, '0');
                                            const yyyy = date.getFullYear();
                                            setDraft(`${dd}/${mm}/${yyyy}`);
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 11,
                                            color: colors.text3,
                                            marginTop: 12,
                                            textAlign: 'center',
                                        }}
                                    >
                                        Bạn có thể nhập ngày trực tiếp
                                        (dd/mm/yyyy) hoặc nhấn biểu tượng lịch.
                                    </Text>
                                </View>
                            )}

                            {sheet?.type === 'simple' && (
                                <View style={shared.sheetBody}>
                                    {sheet.isStepper ? (
                                        <View
                                            style={styles.sheetStepperContainer}
                                        >
                                            <TextInput
                                                style={styles.sheetStepperInput}
                                                value={draft}
                                                onChangeText={setDraft}
                                                keyboardType='numeric'
                                                autoFocus
                                            />
                                            <View
                                                style={
                                                    styles.sheetStepperControls
                                                }
                                            >
                                                <Pressable
                                                    style={styles.sheetStepBtn}
                                                    onPress={() => {
                                                        const val =
                                                            parseInt(
                                                                draft || '0',
                                                            ) + 5;
                                                        setDraft(String(val));
                                                    }}
                                                >
                                                    <Ionicons
                                                        name='add'
                                                        size={20}
                                                        color={colors.text2}
                                                    />
                                                </Pressable>
                                                <Pressable
                                                    style={styles.sheetStepBtn}
                                                    onPress={() => {
                                                        const val = Math.max(
                                                            0,
                                                            parseInt(
                                                                draft || '0',
                                                            ) - 5,
                                                        );
                                                        setDraft(String(val));
                                                    }}
                                                >
                                                    <Ionicons
                                                        name='remove'
                                                        size={20}
                                                        color={colors.text2}
                                                    />
                                                </Pressable>
                                            </View>
                                            {sheet.suffix && (
                                                <Text
                                                    style={
                                                        styles.sheetStepperUnit
                                                    }
                                                >
                                                    {sheet.suffix}
                                                </Text>
                                            )}
                                        </View>
                                    ) : (
                                        <View style={shared.sheetInputWrap}>
                                            <Ionicons
                                                name={
                                                    (sheet.icon ||
                                                        'create') as any
                                                }
                                                size={18}
                                                color={colors.primary}
                                            />
                                            <TextInput
                                                style={shared.sheetInput}
                                                value={draft}
                                                onChangeText={setDraft}
                                                keyboardType={
                                                    sheet.keyboard || 'default'
                                                }
                                                placeholder={sheet.title}
                                                placeholderTextColor={
                                                    colors.text3
                                                }
                                                autoFocus
                                            />
                                            {sheet.suffix && (
                                                <Text
                                                    style={styles.sheetSuffix}
                                                >
                                                    {sheet.suffix}
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                            )}

                            {sheet?.type === 'select' && (
                                <View style={shared.sheetBody}>
                                    {sheet.options?.map((opt) => {
                                        const active = draft === opt;
                                        return (
                                            <Pressable
                                                key={opt}
                                                style={[
                                                    styles.sheetSelectOption,
                                                    active &&
                                                        styles.sheetSelectActive,
                                                ]}
                                                onPress={() => setDraft(opt)}
                                            >
                                                <Text
                                                    style={[
                                                        styles.sheetSelectText,
                                                        active &&
                                                            styles.sheetSelectTextActive,
                                                    ]}
                                                >
                                                    {opt}
                                                </Text>
                                                {active && (
                                                    <Ionicons
                                                        name='checkmark-circle'
                                                        size={20}
                                                        color={colors.primary}
                                                    />
                                                )}
                                            </Pressable>
                                        );
                                    })}
                                </View>
                            )}

                            <View style={shared.sheetBtnRow}>
                                <Pressable
                                    style={shared.sheetBtnGhost}
                                    onPress={() => setSheet(null)}
                                >
                                    <Text style={shared.sheetBtnGhostText}>
                                        Huỷ
                                    </Text>
                                </Pressable>
                                <Pressable
                                    style={shared.sheetBtnPrimaryWrap}
                                    onPress={saveSheet}
                                >
                                    <View
                                        style={[
                                            shared.sheetBtnPrimary,
                                            { backgroundColor: colors.primary },
                                        ]}
                                    >
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 4,
                                            }}
                                        >
                                            <Ionicons
                                                name='checkmark'
                                                size={16}
                                                color='#fff'
                                            />
                                            <Text
                                                style={
                                                    shared.sheetBtnPrimaryText
                                                }
                                            >
                                                Lưu
                                            </Text>
                                        </View>
                                    </View>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
            <Modal
                visible={addContactModal}
                transparent
                animationType='fade'
                onRequestClose={() => setAddContactModal(false)}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setAddContactModal(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={{ justifyContent: 'flex-end', flex: 1 }}
                    >
                        <Pressable
                            style={[
                                shared.sheetContainer,
                                { paddingHorizontal: 0 },
                            ]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            <View style={styles.addContactHeader}>
                                <View style={styles.addContactHeaderTop}>
                                    <View>
                                        <Text style={styles.addContactTitle}>
                                            Thêm người liên hệ
                                        </Text>
                                        <Text style={styles.addContactSub}>
                                            Liên hệ khẩn cấp khi cần thiết
                                        </Text>
                                    </View>
                                    <Pressable
                                        style={styles.addContactClose}
                                        onPress={() =>
                                            setAddContactModal(false)
                                        }
                                    >
                                        <Ionicons
                                            name='close'
                                            size={18}
                                            color={colors.text2}
                                        />
                                    </Pressable>
                                </View>
                            </View>

                            <ScrollView
                                style={styles.addContactBody}
                                showsVerticalScrollIndicator={false}
                            >
                                <View style={styles.addContactAvatarWrap}>
                                    <View style={styles.addContactAvatar}>
                                        <Text
                                            style={styles.addContactAvatarText}
                                        >
                                            ?
                                        </Text>
                                    </View>
                                </View>

                                <Text style={styles.addContactLabel}>
                                    Họ và tên *
                                </Text>
                                <View style={styles.addContactInputBox}>
                                    <TextInput
                                        style={styles.addContactInput}
                                        placeholder='Nguyễn Văn A'
                                        placeholderTextColor={colors.text3}
                                        value={draftContactName}
                                        onChangeText={setDraftContactName}
                                    />
                                </View>

                                <Text style={styles.addContactLabel}>
                                    Quan hệ *
                                </Text>
                                <View style={styles.addContactRelations}>
                                    {[
                                        'Vợ/chồng',
                                        'Bố',
                                        'Mẹ',
                                        'Con',
                                        'Anh/chị/em',
                                        'Bạn bè',
                                        'Khác',
                                    ].map((rel) => {
                                        const isActive =
                                            draftContactRelation === rel;
                                        return (
                                            <Pressable
                                                key={rel}
                                                style={[
                                                    styles.addContactRelChip,
                                                    isActive &&
                                                        styles.addContactRelChipActive,
                                                ]}
                                                onPress={() =>
                                                    setDraftContactRelation(rel)
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.addContactRelText,
                                                        isActive &&
                                                            styles.addContactRelTextActive,
                                                    ]}
                                                >
                                                    {rel}
                                                </Text>
                                            </Pressable>
                                        );
                                    })}
                                </View>

                                <Text style={styles.addContactLabel}>
                                    Số điện thoại *
                                </Text>
                                <View style={styles.addContactInputBox}>
                                    <Text style={styles.addContactPrefix}>
                                        VN +84
                                    </Text>
                                    <View style={styles.addContactDivider} />
                                    <TextInput
                                        style={styles.addContactInput}
                                        placeholder='901 234 567'
                                        placeholderTextColor={colors.text3}
                                        value={draftContactPhone}
                                        onChangeText={setDraftContactPhone}
                                        keyboardType='phone-pad'
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.addContactFooter}>
                                <Pressable
                                    style={styles.addContactSaveBtn}
                                    onPress={() => setAddContactModal(false)}
                                >
                                    <Text style={styles.addContactSaveText}>
                                        Lưu liên hệ
                                    </Text>
                                </Pressable>
                            </View>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Pressable>
            </Modal>
            <Modal
                visible={healthSheetKey !== null}
                transparent
                animationType='fade'
                onRequestClose={() => setHealthSheetKey(null)}
            >
                <Pressable
                    style={shared.overlay}
                    onPress={() => setHealthSheetKey(null)}
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
                                    {healthSheetKey === 'blood'
                                        ? 'Nhóm máu'
                                        : healthSheetKey === 'chronicIllness'
                                          ? 'Bệnh nền'
                                          : healthSheetKey === 'drugAllergies'
                                            ? 'Dị ứng thuốc'
                                            : 'Dị ứng thực phẩm'}
                                </Text>
                            </View>

                            <View style={shared.sheetBody}>
                                {healthSheetKey === 'blood' ? (
                                    <View style={styles.btGrid}>
                                        {BLOOD_TYPES.map((bloodType) => (
                                            <Pressable
                                                key={bloodType}
                                                style={[
                                                    styles.btOpt,
                                                    healthSheetDraftBlood ===
                                                        bloodType &&
                                                        styles.btOptSel,
                                                ]}
                                                onPress={() =>
                                                    setHealthSheetDraftBlood(
                                                        bloodType,
                                                    )
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.btOptText,
                                                        healthSheetDraftBlood ===
                                                            bloodType &&
                                                            styles.btOptTextSel,
                                                    ]}
                                                >
                                                    {bloodType}
                                                </Text>
                                            </Pressable>
                                        ))}
                                    </View>
                                ) : (
                                    <>
                                        <View style={styles.tagInputWrap}>
                                            {healthSheetDraftTags.map((tag) => (
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
                                                            removeHealthTag(tag)
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
                                                value={healthTagText}
                                                onChangeText={setHealthTagText}
                                                onSubmitEditing={addHealthTag}
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

                            <View style={shared.sheetBtnRow}>
                                <Pressable
                                    style={[
                                        shared.sheetBtnPrimaryWrap,
                                        {
                                            backgroundColor: colors.primary,
                                            borderRadius: 14,
                                        },
                                    ]}
                                    onPress={saveHealthSheet}
                                >
                                    <View style={shared.sheetBtnPrimary}>
                                        <Text
                                            style={shared.sheetBtnPrimaryText}
                                        >
                                            Lưu thay đổi
                                        </Text>
                                    </View>
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

const _roleModalStyles = {
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.45)',
        justifyContent: 'flex-end' as const,
    },
    sheet: {
        backgroundColor: colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(16),
        paddingBottom: verticalScale(28),
        borderTopWidth: 1,
        borderColor: colors.border,
    },
    sheetTitle: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(17),
        color: colors.text,
        marginBottom: verticalScale(6),
    },
    sheetHint: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13),
        color: colors.text2,
        marginBottom: verticalScale(14),
    },
    option: {
        backgroundColor: colors.primaryBg,
        borderRadius: 14,
        paddingVertical: verticalScale(14),
        paddingHorizontal: scale(16),
        marginBottom: verticalScale(10),
        borderWidth: 1,
        borderColor: colors.primaryLight,
    },
    optionText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.primary,
        textAlign: 'center' as const,
    },
    cancel: {
        marginTop: verticalScale(6),
        paddingVertical: verticalScale(12),
        alignItems: 'center' as const,
    },
    cancelText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text2,
    },
};
