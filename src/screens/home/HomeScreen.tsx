import { router } from 'expo-router';
import React, { useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    ScrollView,
    StatusBar,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatePanel from '@/src/components/state/StatePanel';
import { useFamilyMembersQuery } from '@/src/features/family/queries';
import { useMeOverviewQuery } from '@/src/features/me/queries';
import type { HealthProfileLike, ProfileLike } from '@/src/features/me/types';
import { colors } from '@/src/styles/tokens';
import type {
    HomeFamilyMember,
    MedItem,
    ScheduleItem,
    StatCard,
} from '@/src/types/home';
import { getAvatarGradient, getCategoryColor } from '@/src/utils/color-palette';
import NotificationScreen from '../health/NotificationScreen';
import FamilyPickerSheet from './components/FamilyPickerSheet';
import HomeHero from './components/HomeHero';
import {
    ArticlesSection,
    ChatbotBanner,
    FamilySection,
    MedicationSection,
    OverviewSection,
    ScheduleSection,
} from './components/HomeSections';
import HomeTopBar from './components/HomeTopBar';
import type { HomeMode } from './home.types';
import { useHomeFamilies } from './useHomeFamilies';

const { height: SCREEN_H } = Dimensions.get('window');

function asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object'
        ? (value as Record<string, unknown>)
        : {};
}

function asArray(value: unknown): Record<string, unknown>[] {
    return Array.isArray(value)
        ? value.filter(
              (entry): entry is Record<string, unknown> =>
                  !!entry && typeof entry === 'object',
          )
        : [];
}

function stringValue(value: unknown): string {
    return typeof value === 'string' ? value.trim() : '';
}

function numericValue(value: unknown): number | null {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === 'string') {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
    }

    return null;
}

function initialsFromName(name: string) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'ND';
    return parts
        .slice(-2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function parseDate(value: unknown): Date | null {
    const raw = stringValue(value);
    if (!raw) return null;
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? null : date;
}

function formatDay(date: Date) {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return 'Hôm nay';
    return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}`;
}

function formatTime(date: Date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(
        date.getMinutes(),
    ).padStart(2, '0')}`;
}

function getDisplayName(profile: ProfileLike, fallback?: string | null) {
    const profileRecord = asRecord(profile);
    return (
        stringValue(profileRecord.full_name) ||
        stringValue(fallback) ||
        'Người dùng'
    );
}

function getVaccineCardState(progress: number, hasPlan: boolean) {
    if (!hasPlan) {
        return {
            badgeText: 'Chưa có',
            color: colors.warning,
            bg: colors.warningBg,
            sub: 'Chưa có lịch tiêm',
        };
    }

    if (progress >= 100) {
        return {
            badgeText: 'Đủ mũi',
            color: colors.success,
            bg: colors.successBg,
            sub: 'Hoàn tất lịch tiêm',
        };
    }

    if (progress >= 70) {
        return {
            badgeText: 'Cần bổ sung',
            color: colors.warning,
            bg: colors.warningBg,
            sub: 'Gần hoàn tất',
        };
    }

    return {
        badgeText: 'Thiếu mũi',
        color: colors.danger,
        bg: colors.dangerBg,
        sub: 'Cần kiểm tra lịch tiêm',
    };
}

function getBmiValue(profile: ProfileLike): number | null {
    const profileRecord = asRecord(profile);
    const height = numericValue(profileRecord.height_cm);
    const weight = numericValue(profileRecord.weight_kg);

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

function getBmiProgress(bmi: number) {
    const min = 12;
    const max = 35;
    const clamped = Math.min(max, Math.max(min, bmi));
    return Math.round(((clamped - min) / (max - min)) * 100);
}

function getBmiCardState(bmi: number | null) {
    if (!bmi) {
        return {
            badgeText: 'Cần bổ sung',
            color: colors.warning,
            bg: colors.warningBg,
            sub: 'Thiếu chiều cao/cân nặng',
            progress: undefined,
        };
    }

    if (bmi < 18.5) {
        return {
            badgeText: 'Thiếu cân',
            color: colors.info,
            bg: colors.infoBg,
            sub: 'Dưới ngưỡng khuyến nghị',
            progress: getBmiProgress(bmi),
        };
    }

    if (bmi < 23) {
        return {
            badgeText: 'Bình thường',
            color: colors.success,
            bg: colors.successBg,
            sub: 'Trong ngưỡng ổn định',
            progress: getBmiProgress(bmi),
        };
    }

    if (bmi < 25) {
        return {
            badgeText: 'Thừa cân',
            color: colors.warning,
            bg: colors.warningBg,
            sub: 'Nên theo dõi cân nặng',
            progress: getBmiProgress(bmi),
        };
    }

    return {
        badgeText: 'Béo phì',
        color: colors.danger,
        bg: colors.dangerBg,
        sub: 'Nên tham khảo tư vấn',
        progress: getBmiProgress(bmi),
    };
}

function buildOverviewCards(
    profile: ProfileLike,
    healthProfile: HealthProfileLike,
): StatCard[] {
    const health = asRecord(healthProfile);
    const records = asArray(health.medical_records);
    const vaccinations = asArray(health.vaccinations ?? health.vaccines);
    const medicines = asArray(health.medicine_inventory);
    const lowStockOrExpiry = medicines.filter(
        (item) =>
            item.alert_low_stock || item.alert_expiring || item.alert_expired,
    ).length;

    let totalDoses = 0;
    let doneDoses = 0;
    vaccinations.forEach((vaccination) => {
        const doses = asArray(vaccination.doses);
        const total = Number(vaccination.recommendation_total_doses);
        totalDoses +=
            Number.isFinite(total) && total > 0 ? total : doses.length;
        const done = Number(vaccination.doses_administered_count);
        doneDoses +=
            Number.isFinite(done) && done >= 0
                ? done
                : doses.filter(
                      (dose) =>
                          stringValue(dose.dose_status).toUpperCase() ===
                          'ADMINISTERED',
                  ).length;
    });
    const vaccineProgress =
        totalDoses > 0 ? Math.round((doneDoses / totalDoses) * 100) : 0;
    const missingDoses = Math.max(0, totalDoses - doneDoses);
    const hasVaccinationPlan = totalDoses > 0;
    const vaccineState = getVaccineCardState(
        vaccineProgress,
        hasVaccinationPlan,
    );
    const bmi = getBmiValue(profile);
    const bmiState = getBmiCardState(bmi);

    return [
        {
            id: 'records',
            iconName: 'document-text-outline',
            iconColor: colors.primary,
            iconBg: colors.primaryBg,
            badgeBg: colors.primaryBg,
            badgeColor: colors.primary,
            badgeText: records.length > 0 ? 'Đã lưu' : 'Chưa có',
            value: String(records.length),
            label: 'Sổ khám bệnh',
            sub: 'Hồ sơ bệnh án',
        },
        {
            id: 'vaccine',
            iconName: 'clipboard-outline',
            iconColor: vaccineState.color,
            iconBg: vaccineState.bg,
            badgeBg: vaccineState.bg,
            badgeColor: vaccineState.color,
            badgeText: vaccineState.badgeText,
            value: hasVaccinationPlan ? String(vaccineProgress) : '--',
            valueSuffix: hasVaccinationPlan ? '%' : undefined,
            valueColor: hasVaccinationPlan ? vaccineState.color : colors.text,
            label: 'Tiêm chủng',
            sub:
                totalDoses > 0 ? `Thiếu ${missingDoses} mũi` : vaccineState.sub,
            progress: hasVaccinationPlan ? vaccineProgress : undefined,
            progressColor: vaccineState.color,
        },
        {
            id: 'rx',
            iconName: 'grid-outline',
            iconColor: colors.warning,
            iconBg: colors.warningBg,
            badgeBg: lowStockOrExpiry > 0 ? colors.warningBg : colors.primaryBg,
            badgeColor: lowStockOrExpiry > 0 ? colors.warning : colors.primary,
            badgeText: lowStockOrExpiry > 0 ? 'Cảnh báo' : 'Đang dùng',
            value: String(medicines.length),
            label: 'Đơn thuốc',
            sub:
                lowStockOrExpiry > 0
                    ? `${lowStockOrExpiry} thuốc cần kiểm tra`
                    : 'Thuốc trong tủ',
        },
        {
            id: 'health',
            iconName: 'pulse',
            iconColor: bmiState.color,
            iconBg: bmiState.bg,
            badgeBg: bmiState.bg,
            badgeColor: bmiState.color,
            badgeText: bmiState.badgeText,
            value: bmi ? bmi.toFixed(1) : '--',
            valueSuffix: bmi ? 'kg/m²' : undefined,
            valueColor: bmi ? bmiState.color : colors.text,
            label: 'Chỉ số BMI',
            sub: bmiState.sub,
            progress: bmiState.progress,
            progressColor: bmiState.color,
        },
    ];
}

function buildSchedules(
    profileName: string,
    healthProfile: HealthProfileLike,
): ScheduleItem[] {
    const reminders = asArray(asRecord(healthProfile).appointment_reminders);
    const now = Date.now();

    return reminders
        .map((reminder, index) => ({
            reminder,
            index,
            date: parseDate(reminder.appointment_at),
        }))
        .filter((entry): entry is typeof entry & { date: Date } => {
            return !!entry.date && entry.date.getTime() >= now - 60 * 60 * 1000;
        })
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(0, 3)
        .map(({ reminder, index, date }) => {
            const category = getCategoryColor(index);
            return {
                id: index + 1,
                initials: initialsFromName(profileName),
                bg: category.bg,
                gradient: getAvatarGradient(index),
                title:
                    stringValue(reminder.title) ||
                    stringValue(reminder.vaccine_name) ||
                    'Lịch hẹn sức khỏe',
                meta:
                    [
                        stringValue(reminder.hospital_name),
                        stringValue(reminder.department),
                    ]
                        .filter(Boolean)
                        .join(' · ') || 'Chưa có địa điểm',
                time: formatTime(date),
                day: formatDay(date),
                color: category.color,
            };
        });
}

function buildMedications(
    profileName: string,
    healthProfile: HealthProfileLike,
): MedItem[] {
    const medicines = asArray(asRecord(healthProfile).medicine_inventory);

    return medicines
        .map((medicine, index) => {
            const reminder = asRecord(medicine.medicine_reminder);
            const times = Array.isArray(reminder.times)
                ? reminder.times.map(stringValue).filter(Boolean)
                : [];
            const category = getCategoryColor(index);
            const dose = [
                stringValue(medicine.dosage_per_use_value) ||
                    stringValue(medicine.dosage_value),
                stringValue(medicine.dosage_per_use_unit) ||
                    stringValue(medicine.dosage_unit) ||
                    stringValue(medicine.unit),
            ]
                .filter(Boolean)
                .join(' ');

            return {
                name: stringValue(medicine.medicine_name) || 'Thuốc',
                info: `${profileName} · ${dose || stringValue(medicine.instruction) || 'Theo chỉ dẫn'}`,
                time: times[0] || '--:--',
                bg: category.bg,
                iconColor: category.color,
                taken: false,
            };
        })
        .filter((medicine) => medicine.time !== '--:--')
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 3);
}

function buildFamilyMembers(members: any[]): HomeFamilyMember[] {
    return members.map((member, index) => ({
        code: member.initials || initialsFromName(member.name || ''),
        name: member.name || 'Thành viên',
        role:
            member.age && member.age > 0
                ? `${member.role} · ${member.age}t`
                : member.role || 'Thành viên',
        color: colors.primary,
        gradient: member.gradientColors ?? getAvatarGradient(index),
        status: member.isOnline ? colors.success : colors.text3,
    }));
}

export default function HomeScreen(): React.JSX.Element {
    const [mode, setMode] = useState<HomeMode>('personal');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const { familyOptions, isLoading, error, refetch } = useHomeFamilies(mode);
    const {
        data: meOverview,
        isError: isMeOverviewError,
        error: meOverviewError,
        refetch: refetchMeOverview,
    } = useMeOverviewQuery();
    const { data: selectedFamilyMembers = [] } = useFamilyMembersQuery(
        selectedFamily ?? '',
    );

    const displayName = useMemo(
        () =>
            getDisplayName(
                meOverview?.profile ?? null,
                meOverview?.user?.email ?? meOverview?.user?.phone_number,
            ),
        [meOverview?.profile, meOverview?.user],
    );
    const initials = useMemo(
        () => initialsFromName(displayName),
        [displayName],
    );
    const selectedFamilyName = useMemo(
        () =>
            familyOptions.find((family) => family.id === selectedFamily)
                ?.name ?? null,
        [familyOptions, selectedFamily],
    );
    const overviewCards = useMemo(
        () =>
            buildOverviewCards(
                meOverview?.profile ?? null,
                meOverview?.health_profile ?? null,
            ),
        [meOverview?.profile, meOverview?.health_profile],
    );
    const schedules = useMemo(
        () => buildSchedules(displayName, meOverview?.health_profile ?? null),
        [displayName, meOverview?.health_profile],
    );
    const medications = useMemo(
        () => buildMedications(displayName, meOverview?.health_profile ?? null),
        [displayName, meOverview?.health_profile],
    );
    const familyMembers = useMemo(
        () => buildFamilyMembers(selectedFamilyMembers),
        [selectedFamilyMembers],
    );

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

    const closePicker = (onClosed?: () => void) => {
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
        ]).start(() => {
            setPickerVisible(false);
            if (typeof onClosed === 'function') {
                onClosed();
            }
        });
    };

    const selectFamily = (id: string) => {
        setSelectedFamily(id);
        setMode('family');
        closePicker();
    };

    const selectPersonal = () => {
        setMode('personal');
    };

    const navigateToFamilyTab = () => {
        closePicker(() => {
            router.push('/family');
        });
    };

    const navigateToFamilyInvites = () => {
        closePicker(() => {
            router.push('/family/invites');
        });
    };

    if (showNotifications) {
        return (
            <NotificationScreen onClose={() => setShowNotifications(false)} />
        );
    }

    if (!meOverview) {
        if (isMeOverviewError) {
            const overviewErrMsg =
                meOverviewError instanceof Error
                    ? meOverviewError.message
                    : typeof meOverviewError === 'string'
                      ? meOverviewError
                      : 'Đã có lỗi xảy ra. Vui lòng kiểm tra kết nối và thử lại.';
            return (
                <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
                    <StatusBar
                        barStyle='dark-content'
                        backgroundColor={colors.bg}
                    />
                    <View
                        style={{
                            flex: 1,
                            justifyContent: 'center',
                            paddingVertical: 24,
                        }}
                    >
                        <StatePanel
                            variant='error'
                            title='Không tải được thông tin tài khoản'
                            message={overviewErrMsg}
                            actionLabel='Thử lại'
                            onAction={() => {
                                void refetchMeOverview();
                            }}
                        />
                    </View>
                </SafeAreaView>
            );
        }

        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        paddingVertical: 24,
                    }}
                >
                    <StatePanel
                        variant='loading'
                        title='Đang tải thông tin...'
                        message='Đang đồng bộ dữ liệu cá nhân của bạn.'
                    />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            <HomeTopBar
                displayName={displayName}
                initials={initials}
                onOpenNotifications={() => setShowNotifications(true)}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <HomeHero
                    mode={mode}
                    displayName={displayName}
                    selectedFamilyName={selectedFamilyName}
                    onSelectPersonal={selectPersonal}
                    onSelectFamily={openPicker}
                />
                <OverviewSection cards={overviewCards} />
                {mode === 'family' ? (
                    <FamilySection
                        members={familyMembers}
                        onAddFamily={openPicker}
                    />
                ) : null}
                <ScheduleSection schedules={schedules} />
                <MedicationSection medications={medications} />
                <ChatbotBanner onPress={() => router.push('/explore')} />
                <ArticlesSection />
            </ScrollView>

            <FamilyPickerSheet
                visible={pickerVisible}
                backdropAnim={backdropAnim}
                slideAnim={slideAnim}
                selectedFamily={selectedFamily}
                familyOptions={familyOptions}
                isLoading={isLoading}
                error={error}
                onClose={closePicker}
                onSelectFamily={selectFamily}
                onRetry={refetch}
                onCreateFamily={navigateToFamilyTab}
                onViewInvites={navigateToFamilyInvites}
            />
        </SafeAreaView>
    );
}
