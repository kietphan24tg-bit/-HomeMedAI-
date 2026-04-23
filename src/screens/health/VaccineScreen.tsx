import Ionicons from '@expo/vector-icons/Ionicons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
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
import { syncFamilyQueries } from '@/src/features/family/sync';
import { useMeHealthProfileQuery } from '@/src/features/me/queries';
import { meQueryKeys } from '@/src/features/me/queryKeys';
import { appToast } from '@/src/lib/toast';
import { appointmentRemindersService } from '@/src/services/appointmentReminders.services';
import {
    vaccinationsService,
    type VaccinationRecommendation,
} from '@/src/services/vaccinations.services';
import { reminderLabelToPayload } from '@/src/utils/reminder-label';
import { CustomReminderModal } from './CustomReminderModal';
import { styles } from './styles';
import type { AttachmentUploadItem } from '../../components/ui';
import { AttachmentUploadBlock, DateField } from '../../components/ui';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';
import type { VaccineDetailItem, VaccineDose } from '../../types/health';

interface Props {
    onClose?: () => void;
}

type VaxView = 'list' | 'detail';

const VACCINE_REMINDER_OPTIONS = [
    'Không nhắc',
    '2 giờ trước',
    '1 ngày trước',
    '3 ngày trước',
    '1 tuần trước',
    'Tùy chỉnh',
] as const;

function doneMuiCount(v: VaccineDetailItem) {
    return v.doses.filter((d: VaccineDose) => d.date).length;
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

function formatDate(value: unknown): string | undefined {
    const raw = nullableString(value);
    if (!raw) return undefined;
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return raw;
    return `${String(date.getDate()).padStart(2, '0')}/${String(
        date.getMonth() + 1,
    ).padStart(2, '0')}/${date.getFullYear()}`;
}

function vaccineAbbr(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0])
        .join('')
        .toUpperCase();
}

function combineDateAndTime(date: Date, time: Date): Date {
    const next = new Date(date);
    next.setHours(
        time.getHours(),
        time.getMinutes(),
        time.getSeconds(),
        time.getMilliseconds(),
    );
    return next;
}

function buildVaccineItems(healthProfile: unknown): VaccineDetailItem[] {
    const health =
        healthProfile && typeof healthProfile === 'object'
            ? (healthProfile as Record<string, unknown>)
            : {};
    const reminders = recordList(health.appointment_reminders).filter(
        (item) =>
            nullableString(item.type ?? item.reminder_type)?.toLowerCase() ===
            'vaccine',
    );

    return recordList(health.vaccinations ?? health.vaccines).map(
        (vaccination, index): VaccineDetailItem => {
            const rawDoses = recordList(vaccination.doses);
            const administeredCount =
                numberValue(vaccination.doses_administered_count) ?? 0;
            const name =
                nullableString(vaccination.recommendation_name) ??
                nullableString(vaccination.vaccine_name) ??
                nullableString(vaccination.name) ??
                `Vaccine ${index + 1}`;
            const mappedDoses = rawDoses.map((dose, doseIndex) => {
                const date = formatDate(
                    dose.administered_at ?? dose.date ?? dose.injected_at,
                );
                const scheduled = formatDate(
                    dose.scheduled_at ?? dose.scheduled,
                );
                return {
                    num: numberValue(dose.dose_index) ?? doseIndex + 1,
                    date,
                    scheduled: date ? undefined : scheduled,
                    place:
                        nullableString(dose.location) ??
                        nullableString(dose.place),
                };
            });

            const matchedReminders = reminders.filter((reminder) => {
                const reminderName =
                    nullableString(reminder.vaccine_name) ??
                    nullableString(reminder.title);
                return !reminderName || reminderName === name;
            });

            const reminderDoseNumbers = matchedReminders
                .map((reminder) => numberValue(reminder.dose_number))
                .filter((value): value is number => value !== undefined);

            const total =
                numberValue(vaccination.recommendation_total_doses) ??
                numberValue(vaccination.total_doses) ??
                Math.max(
                    rawDoses.length,
                    administeredCount,
                    ...reminderDoseNumbers,
                    1,
                );

            for (let i = mappedDoses.length; i < total; i += 1) {
                mappedDoses.push({
                    num: i + 1,
                    date: undefined,
                    scheduled: undefined,
                    place: undefined,
                });
            }

            matchedReminders.forEach((reminder) => {
                const doseNumber = numberValue(reminder.dose_number);
                if (!doseNumber || doseNumber < 1) {
                    return;
                }

                const existingDose = mappedDoses.find(
                    (dose) => dose.num === doseNumber,
                );
                const scheduled = formatDate(reminder.appointment_at);
                const place = nullableString(reminder.hospital_name);

                if (existingDose) {
                    if (!existingDose.date) {
                        existingDose.scheduled ??= scheduled;
                        existingDose.place ??= place;
                    }
                    return;
                }

                mappedDoses.push({
                    num: doseNumber,
                    date: undefined,
                    scheduled,
                    place,
                });
            });

            mappedDoses.sort((a, b) => a.num - b.num);

            return {
                id: nullableString(vaccination.id) ?? `${name}-${index}`,
                userVaccinationId: nullableString(vaccination.id),
                recommendationId: nullableString(vaccination.recommendation_id),
                name,
                abbr: vaccineAbbr(name) || 'VC',
                total: Math.max(
                    total,
                    mappedDoses.reduce(
                        (max, dose) => Math.max(max, dose.num),
                        1,
                    ),
                ),
                doses: mappedDoses,
            };
        },
    );
}

function findDoseIdForIndex(
    healthProfile: unknown,
    userVaccinationId: string | undefined,
    doseIndex: number,
): string | undefined {
    if (!userVaccinationId) return undefined;
    const health =
        healthProfile && typeof healthProfile === 'object'
            ? (healthProfile as Record<string, unknown>)
            : {};
    const vaccination = recordList(health.vaccinations ?? health.vaccines).find(
        (item) => nullableString(item.id) === userVaccinationId,
    );
    if (!vaccination) return undefined;
    const dose = recordList(vaccination.doses).find(
        (item) => numberValue(item.dose_index) === doseIndex,
    );
    return dose ? nullableString(dose.id) : undefined;
}

function findPendingUnlinkedVaccineReminderId(
    healthProfile: unknown,
    payload: { doseNumber: number; vaccineName?: string },
): string | undefined {
    const health =
        healthProfile && typeof healthProfile === 'object'
            ? (healthProfile as Record<string, unknown>)
            : {};
    const targetName = payload.vaccineName?.trim().toLowerCase();
    const reminders = recordList(health.appointment_reminders);
    for (const reminder of reminders) {
        const type = nullableString(
            reminder.type ?? reminder.reminder_type,
        )?.toLowerCase();
        if (type !== 'vaccine') continue;
        const status = nullableString(reminder.status)?.toLowerCase();
        if (status && status !== 'pending') continue;
        if (nullableString(reminder.vaccination_dose_id)) continue;
        if (numberValue(reminder.dose_number) !== payload.doseNumber) continue;
        if (targetName) {
            const name = nullableString(
                reminder.vaccine_name ?? reminder.title,
            )?.toLowerCase();
            if (name && name !== targetName) continue;
        }
        const reminderId = nullableString(reminder.id);
        if (reminderId) return reminderId;
    }
    return undefined;
}

export default function VaccineScreen({ onClose }: Props): React.JSX.Element {
    const { data: healthProfile, isLoading } = useMeHealthProfileQuery();
    const queryClient = useQueryClient();
    const [view, setView] = useState<VaxView>('list');
    const [detailVax, setDetailVax] = useState<VaccineDetailItem | null>(null);
    const [showAddVax, setShowAddVax] = useState(false);
    const [showVaxInfo, setShowVaxInfo] = useState(false);
    const [manualVaccines, setManualVaccines] = useState<VaccineDetailItem[]>(
        [],
    );

    const profileId = useMemo(() => {
        if (!healthProfile || typeof healthProfile !== 'object') {
            return undefined;
        }
        const record = healthProfile as Record<string, unknown>;
        return nullableString(record.profile_id ?? record.id);
    }, [healthProfile]);

    const { data: recommendationCatalog = [] } = useQuery({
        queryKey: ['vaccinations', 'recommendations'],
        queryFn: vaccinationsService.listRecommendations,
        staleTime: 1000 * 60 * 30,
    });

    const syncedVaccineItems = useMemo(
        () => buildVaccineItems(healthProfile),
        [healthProfile],
    );
    const vaccineItems = useMemo(
        () => [...manualVaccines, ...syncedVaccineItems],
        [manualVaccines, syncedVaccineItems],
    );

    const openDetail = useCallback((v: VaccineDetailItem) => {
        setDetailVax(v);
        setView('detail');
    }, []);

    const closeDetail = useCallback(() => {
        setView('list');
        setDetailVax(null);
    }, []);

    const createReminderMutation = useMutation({
        mutationFn: async (payload: {
            appointmentAt: Date;
            vaccineName: string;
            doseNumber: number;
            hospitalName?: string;
            reminderSelection: string;
            title: string;
            vaccinationDoseId?: string;
        }) => {
            if (!profileId) {
                throw new Error('missing-profile-id');
            }

            return appointmentRemindersService.create(profileId, {
                type: 'vaccine',
                title: payload.title,
                appointment_at: payload.appointmentAt.toISOString(),
                hospital_name: payload.hospitalName?.trim() || null,
                vaccine_name: payload.vaccineName,
                dose_number: payload.doseNumber,
                vaccination_dose_id: payload.vaccinationDoseId ?? null,
                ...reminderLabelToPayload(payload.reminderSelection),
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            await queryClient.invalidateQueries({
                queryKey: ['appointment-reminders', profileId],
            });
            syncFamilyQueries(queryClient);
            appToast.showSuccess('Đã lưu lịch nhắc tiêm');
        },
        onError: () => {
            appToast.showError('Không thể lưu lịch nhắc tiêm');
        },
    });

    const subscribeVaccineMutation = useMutation({
        mutationFn: async (payload: { recommendationId: string }) => {
            if (!profileId) {
                throw new Error('missing-profile-id');
            }
            return vaccinationsService.subscribeProfileVaccination(profileId, {
                recommendation_id: payload.recommendationId,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            await queryClient.invalidateQueries({
                queryKey: ['appointment-reminders', profileId],
            });
            appToast.showSuccess('Đã thêm vaccine vào hồ sơ');
        },
        onError: () => {
            appToast.showError('Không thể thêm vaccine');
        },
    });

    const createDoseMutation = useMutation({
        mutationFn: async (payload: {
            userVaccinationId: string;
            doseIndex: number;
            administeredAt: Date;
            location?: string;
        }) => {
            return vaccinationsService.createDose(payload.userVaccinationId, {
                dose_index: payload.doseIndex,
                administered_at: payload.administeredAt
                    .toISOString()
                    .slice(0, 10),
                location: payload.location?.trim() || null,
            });
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: meQueryKeys.overview(),
            });
            await queryClient.invalidateQueries({
                queryKey: ['appointment-reminders', profileId],
            });
            appToast.showSuccess('Đã lưu mũi tiêm');
        },
        onError: () => {
            appToast.showError('Không thể lưu mũi tiêm');
        },
    });

    React.useEffect(() => {
        if (
            createReminderMutation.isSuccess ||
            subscribeVaccineMutation.isSuccess ||
            createDoseMutation.isSuccess
        ) {
            syncFamilyQueries(queryClient);
        }
    }, [
        createReminderMutation.isSuccess,
        subscribeVaccineMutation.isSuccess,
        createDoseMutation.isSuccess,
        queryClient,
    ]);

    const handleScheduleVaccine = useCallback(
        (payload: {
            appointmentAt: Date;
            vaccineName: string;
            doseNumber: number;
            hospitalName?: string;
            reminderSelection: string;
        }) => {
            if (!profileId) {
                appToast.showError('Không xác định được hồ sơ sức khỏe');
                return;
            }

            createReminderMutation.mutate({
                ...payload,
                title: `Nhắc lịch tiêm ${payload.vaccineName}`,
                vaccinationDoseId: findDoseIdForIndex(
                    healthProfile,
                    detailVax?.userVaccinationId,
                    payload.doseNumber,
                ),
            });
        },
        [
            createReminderMutation,
            detailVax?.userVaccinationId,
            healthProfile,
            profileId,
        ],
    );

    const handleAddVaccine = useCallback(
        async (
            payload:
                | { mode: 'catalog'; recommendationId: string }
                | { mode: 'custom'; vaccineName: string; totalDoses: number },
        ) => {
            if (payload.mode === 'custom') {
                const name = payload.vaccineName.trim();
                if (!name) {
                    appToast.showError('Vui lòng nhập tên vaccine');
                    return false;
                }

                const total = Math.max(1, Math.floor(payload.totalDoses || 1));
                const localItem: VaccineDetailItem = {
                    id: `manual-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 8)}`,
                    name,
                    abbr: vaccineAbbr(name) || 'VC',
                    total,
                    doses: Array.from({ length: total }, (_, index) => ({
                        num: index + 1,
                    })),
                };

                setManualVaccines((current) => [localItem, ...current]);
                setDetailVax(localItem);
                setView('detail');
                appToast.showSuccess('Đã thêm vaccine tự nhập');
                return true;
            }

            if (!profileId) {
                appToast.showError('Không xác định được hồ sơ sức khỏe');
                return false;
            }

            try {
                await subscribeVaccineMutation.mutateAsync({
                    recommendationId: payload.recommendationId,
                });
                return true;
            } catch {
                return false;
            }
        },
        [profileId, subscribeVaccineMutation],
    );

    const handleAddDose = useCallback(
        async (payload: {
            itemId: string;
            userVaccinationId?: string;
            doseIndex: number;
            administeredAt: Date;
            location?: string;
        }) => {
            if (!payload.userVaccinationId) {
                let nextDetail: VaccineDetailItem | null = null;

                setManualVaccines((current) =>
                    current.map((item) => {
                        if (item.id !== payload.itemId) {
                            return item;
                        }

                        const doses = [...item.doses];
                        const doseIndex = Math.max(1, payload.doseIndex);
                        const existingIndex = doses.findIndex(
                            (dose) => dose.num === doseIndex,
                        );
                        const nextDose: VaccineDose = {
                            num: doseIndex,
                            date: payload.administeredAt.toLocaleDateString(
                                'vi-VN',
                            ),
                            place: payload.location?.trim() || undefined,
                        };

                        if (existingIndex >= 0) {
                            doses[existingIndex] = {
                                ...doses[existingIndex],
                                ...nextDose,
                                scheduled: undefined,
                            };
                        } else {
                            doses.push(nextDose);
                        }

                        nextDetail = {
                            ...item,
                            total: Math.max(item.total, doseIndex),
                            doses: doses.sort((a, b) => a.num - b.num),
                        };

                        return nextDetail;
                    }),
                );

                if (nextDetail && detailVax?.id === payload.itemId) {
                    setDetailVax(nextDetail);
                }

                appToast.showSuccess('Đã lưu mũi tiêm tạm thời');
                return true;
            }

            try {
                const createdDose = await createDoseMutation.mutateAsync({
                    userVaccinationId: payload.userVaccinationId,
                    doseIndex: payload.doseIndex,
                    administeredAt: payload.administeredAt,
                    location: payload.location,
                });
                const reminderId = findPendingUnlinkedVaccineReminderId(
                    healthProfile,
                    {
                        doseNumber: payload.doseIndex,
                        vaccineName: detailVax?.name,
                    },
                );
                if (reminderId && createdDose?.id) {
                    await appointmentRemindersService.patch(reminderId, {
                        vaccination_dose_id: createdDose.id,
                    });
                    await queryClient.invalidateQueries({
                        queryKey: meQueryKeys.overview(),
                    });
                    await queryClient.invalidateQueries({
                        queryKey: ['appointment-reminders', profileId],
                    });
                }
                return true;
            } catch {
                return false;
            }
        },
        [createDoseMutation, detailVax, healthProfile, profileId, queryClient],
    );

    if (view === 'detail' && detailVax) {
        return (
            <VaxDetailScreen
                item={detailVax}
                onBack={closeDetail}
                onSchedule={handleScheduleVaccine}
                isScheduling={createReminderMutation.isPending}
                onAddDose={handleAddDose}
                isAddingDose={createDoseMutation.isPending}
            />
        );
    }

    const totalDone = vaccineItems.reduce(
        (sum, item) => sum + Math.min(doneMuiCount(item), item.total),
        0,
    );
    const totalMui = vaccineItems.reduce((sum, item) => sum + item.total, 0);
    const pct = totalMui > 0 ? Math.round((totalDone / totalMui) * 100) : 0;
    const pending = totalMui - totalDone;
    const donutSize = 62;
    const donutStroke = 6;
    const donutRadius = (donutSize - donutStroke) / 2;
    const donutCircumference = 2 * Math.PI * donutRadius;
    const donutOffset =
        donutCircumference -
        (Math.max(0, Math.min(100, pct)) / 100) * donutCircumference;

    const complete = vaccineItems.filter(
        (item) => doneMuiCount(item) >= item.total,
    );
    const soon = vaccineItems.filter(
        (item) =>
            doneMuiCount(item) < item.total &&
            item.doses.some(
                (dose: VaccineDose) => dose.scheduled && !dose.date,
            ),
    );
    const soonIds = new Set(soon.map((item) => item.id));
    const incomplete = vaccineItems.filter(
        (item) => doneMuiCount(item) < item.total && !soonIds.has(item.id),
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            <View style={[styles.subTopbar, styles.vaxSubTopbar]}>
                <Pressable
                    style={[styles.subBackBtn, styles.vaxBackBtn]}
                    onPress={onClose}
                >
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.subTopbarTitle}>Tiêm chủng</Text>
                <View style={styles.vaxTopbarActions}>
                    <Pressable
                        style={styles.vaxAddIconBtn}
                        onPress={() => setShowAddVax(true)}
                    >
                        <Ionicons name='add' size={18} color={colors.primary} />
                    </Pressable>
                    <Pressable
                        style={styles.vaxInfoBtn}
                        onPress={() => setShowVaxInfo((current) => !current)}
                        onHoverIn={() => setShowVaxInfo(true)}
                        onHoverOut={() => setShowVaxInfo(false)}
                    >
                        <Ionicons
                            name='information-circle-outline'
                            size={18}
                            color={colors.primary}
                        />
                    </Pressable>
                    {showVaxInfo ? (
                        <View style={styles.vaxInfoTooltip}>
                            <View style={styles.vaxInfoTooltipBody}>
                                <View style={styles.vaxInfoTooltipIconWrap}>
                                    <Ionicons
                                        name='information-circle-outline'
                                        size={14}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text style={styles.vaxInfoTooltipText}>
                                    Theo khuyến nghị của{' '}
                                    <Text
                                        style={styles.vaxInfoTooltipTextStrong}
                                    >
                                        Bộ Y tế Việt Nam
                                    </Text>
                                    .{`\n`}
                                    Nhấn vào từng mũi tiêm để xem lịch sử và chi
                                    tiết mũi tiêm.
                                </Text>
                            </View>
                        </View>
                    ) : null}
                </View>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.vaxHero}>
                    <View style={styles.vaxHeroContent}>
                        <View style={styles.vaxDonut}>
                            <View style={styles.vaxDonutTrack}>
                                <Svg
                                    width={donutSize}
                                    height={donutSize}
                                    style={styles.vaxDonutSvg}
                                >
                                    <Defs>
                                        <SvgLinearGradient
                                            id='vaxHeroDonutGradient'
                                            x1='0%'
                                            y1='0%'
                                            x2='100%'
                                            y2='100%'
                                        >
                                            <Stop
                                                offset='0%'
                                                stopColor='#26C89A'
                                            />
                                            <Stop
                                                offset='100%'
                                                stopColor='#0A8F74'
                                            />
                                        </SvgLinearGradient>
                                    </Defs>
                                    <Circle
                                        cx={donutSize / 2}
                                        cy={donutSize / 2}
                                        r={donutRadius}
                                        stroke='#2F3A3B'
                                        strokeWidth={donutStroke}
                                        fill='none'
                                    />
                                    <Circle
                                        cx={donutSize / 2}
                                        cy={donutSize / 2}
                                        r={donutRadius}
                                        stroke='url(#vaxHeroDonutGradient)'
                                        strokeWidth={donutStroke}
                                        fill='none'
                                        strokeLinecap='round'
                                        strokeDasharray={`${donutCircumference}, ${donutCircumference}`}
                                        strokeDashoffset={donutOffset}
                                        transform={`rotate(-90 ${donutSize / 2} ${donutSize / 2})`}
                                    />
                                </Svg>
                                <Text style={styles.vaxDonutText}>{pct}%</Text>
                            </View>
                        </View>
                        <View style={styles.vaxHeroBody}>
                            <Text style={styles.vaxHeroSup}>Hoàn thành</Text>
                            <View style={styles.vaxHeroCountRow}>
                                <Text style={styles.vaxHeroNum}>
                                    {totalDone}
                                </Text>
                                <Text style={styles.vaxHeroNumSub}>
                                    / {totalMui} mũi
                                </Text>
                            </View>
                            <View style={styles.vaxHeroPendingPill}>
                                <View style={styles.vaxHeroPendingDot} />
                                <Text style={styles.vaxHeroPendingText}>
                                    {pending} mũi chưa hoàn thành
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {soon.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Sắp tiêm'
                            icon='calendar-outline'
                            dotColor={colors.primary}
                            countBg={colors.primaryBg}
                            count={soon.length}
                            countColor={colors.primary}
                            countBorder='#BFDBFE'
                        />
                        <View style={styles.vaxListCard}>
                            {soon.map((item, index) => (
                                <VaxRow
                                    key={item.id}
                                    item={item}
                                    isLast={index === soon.length - 1}
                                    status='soon'
                                    onPress={() => openDetail(item)}
                                />
                            ))}
                        </View>
                    </>
                )}

                {incomplete.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Chưa hoàn thành'
                            icon='alert-circle-outline'
                            dotColor={colors.warning}
                            countBg={colors.warningBg}
                            count={incomplete.length}
                            countColor={colors.warning}
                            countBorder='#FDE68A'
                        />
                        <View style={styles.vaxListCard}>
                            {incomplete.map((item, index) => (
                                <VaxRow
                                    key={item.id}
                                    item={item}
                                    isLast={index === incomplete.length - 1}
                                    status='pending'
                                    onPress={() => openDetail(item)}
                                />
                            ))}
                        </View>
                    </>
                )}

                {complete.length > 0 && (
                    <>
                        <VaxSectionHeader
                            label='Đã tiêm đủ'
                            icon='checkmark-outline'
                            dotColor={colors.success}
                            countBg={colors.successBg}
                            count={complete.length}
                            countColor={colors.success}
                            countBorder='#BBF7D0'
                        />
                        <View style={styles.vaxListCard}>
                            {complete.map((item, index) => (
                                <VaxRow
                                    key={item.id}
                                    item={item}
                                    isLast={index === complete.length - 1}
                                    status='done'
                                    onPress={() => openDetail(item)}
                                />
                            ))}
                        </View>
                    </>
                )}

                {vaccineItems.length === 0 ? (
                    <View style={styles.recEmpty}>
                        <View style={styles.recEmptyIcon}>
                            <Ionicons
                                name='shield-checkmark-outline'
                                size={32}
                                color={colors.primary}
                            />
                        </View>
                        <Text style={styles.recEmptyTitle}>
                            {isLoading
                                ? 'Đang tải lịch tiêm'
                                : 'Chưa có lịch tiêm'}
                        </Text>
                        <Text style={styles.recEmptySub}>
                            {isLoading
                                ? 'Dữ liệu đang được lấy từ tài khoản của bạn'
                                : 'Chưa có dữ liệu tiêm chủng'}
                        </Text>
                        {!isLoading ? (
                            <Pressable
                                style={[
                                    styles.vdSchedBtn,
                                    { marginTop: 12, alignSelf: 'stretch' },
                                ]}
                                onPress={() => setShowAddVax(true)}
                            >
                                <Ionicons
                                    name='add-circle-outline'
                                    size={14}
                                    color={colors.text2}
                                />
                                <Text style={styles.vdSchedBtnText}>
                                    Thêm vaccine ngay
                                </Text>
                            </Pressable>
                        ) : null}
                    </View>
                ) : null}
            </ScrollView>

            <AddVaxSheet
                visible={showAddVax}
                onClose={() => setShowAddVax(false)}
                options={recommendationCatalog}
                onSave={handleAddVaccine}
                isSaving={subscribeVaccineMutation.isPending}
            />
        </SafeAreaView>
    );
}
/* ===================================
   SECTION HEADER
   =================================== */
function VaxSectionHeader({
    label,
    count,
    icon,
    dotColor,
    countBg,
    countColor,
    countBorder,
}: {
    label: string;
    count: number;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    dotColor: string;
    countBg: string;
    countColor: string;
    countBorder: string;
}) {
    return (
        <View style={styles.vaxSecRow}>
            <View style={styles.vaxSecLeft}>
                <View
                    style={[
                        styles.vaxSecIconWrap,
                        { backgroundColor: countBg, borderColor: countBorder },
                    ]}
                >
                    <Ionicons name={icon} size={13} color={dotColor} />
                </View>
                <Text style={styles.vaxSecLabel}>{label}</Text>
            </View>
            <Text
                style={[
                    styles.vaxSecCount,
                    {
                        backgroundColor: countBg,
                        color: countColor,
                        borderColor: countBorder,
                    },
                ]}
            >
                {count} loại
            </Text>
        </View>
    );
}

/* ===================================
   VACCINE ROW (list item)
   =================================== */
function VaxRow({
    item,
    isLast,
    status,
    onPress,
}: {
    item: VaccineDetailItem;
    isLast: boolean;
    status: 'done' | 'soon' | 'pending';
    onPress: () => void;
}) {
    const done = doneMuiCount(item);
    const chipClass =
        status === 'done'
            ? styles.vaxChipDone
            : status === 'soon'
              ? styles.vaxChipSoon
              : styles.vaxChipPending;

    // For "soon" rows, find the next scheduled dose
    const scheduledDose =
        status === 'soon'
            ? item.doses.find((d: VaccineDose) => d.scheduled && !d.date)
            : null;

    return (
        <Pressable
            style={[styles.vaxRow, !isLast && styles.vaxRowBorder]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.vaxRowIcon,
                    {
                        backgroundColor:
                            status === 'done'
                                ? colors.successBg
                                : status === 'soon'
                                  ? colors.primaryBg
                                  : done > 0
                                    ? colors.warningBg
                                    : colors.dangerBg,
                    },
                ]}
            >
                <Ionicons
                    name={
                        status === 'done'
                            ? 'checkmark-circle-outline'
                            : status === 'soon'
                              ? 'calendar-outline'
                              : 'alert-circle-outline'
                    }
                    size={14}
                    color={
                        status === 'done'
                            ? colors.success
                            : status === 'soon'
                              ? colors.primary
                              : done > 0
                                ? colors.warning
                                : colors.danger
                    }
                />
            </View>
            <View style={styles.vaxRowBody}>
                <Text style={styles.vaxRowName} numberOfLines={1}>
                    {item.name}
                    {item.abbr ? (
                        <Text style={styles.vaxRowSub}> ({item.abbr})</Text>
                    ) : null}
                </Text>
                <View style={styles.vaxRowMeta}>
                    <Text style={[styles.vaxChip, chipClass]}>
                        {done} / {item.total} mũi
                        {status === 'done' ? ' ✓' : ''}
                    </Text>
                    {status === 'soon' && (
                        <Text style={[styles.vaxChip, styles.vaxChipScheduled]}>
                            Đã lên lịch
                        </Text>
                    )}
                    {status === 'pending' && done === 0 && (
                        <Text style={styles.vaxChipLabel}>Chưa tiêm</Text>
                    )}
                    {status === 'pending' && done > 0 && (
                        <Text style={styles.vaxChipLabel}>
                            Còn thiếu {item.total - done}
                        </Text>
                    )}
                </View>
                {/* Scheduled date line for "soon" items */}
                {scheduledDose && (
                    <View style={styles.vaxRowMetaSecondary}>
                        <Text style={styles.vaxChipLabel}>
                            Mũi {scheduledDose.num} · {scheduledDose.scheduled}
                        </Text>
                    </View>
                )}
                {/* Dose dots */}
                <View style={styles.vaxDots}>
                    {Array.from({ length: item.total }, (_, i) => {
                        const isDone = i < done;
                        return (
                            <View
                                key={i}
                                style={[
                                    styles.vaxDotBar,
                                    {
                                        backgroundColor: isDone
                                            ? status === 'done'
                                                ? colors.success
                                                : status === 'soon'
                                                  ? colors.primary
                                                  : colors.warning
                                            : colors.border,
                                    },
                                ]}
                            />
                        );
                    })}
                </View>
            </View>
            <Ionicons name='chevron-forward' size={14} color={colors.text3} />
        </Pressable>
    );
}

/* ===================================
   VACCINE DETAIL - FULL SCREEN
   =================================== */
function VaxDetailScreen({
    item,
    onBack,
    onSchedule,
    isScheduling,
    onAddDose,
    isAddingDose,
}: {
    item: VaccineDetailItem;
    onBack: () => void;
    onSchedule: (payload: {
        appointmentAt: Date;
        vaccineName: string;
        doseNumber: number;
        hospitalName?: string;
        reminderSelection: string;
    }) => void;
    isScheduling: boolean;
    onAddDose: (payload: {
        itemId: string;
        userVaccinationId?: string;
        doseIndex: number;
        administeredAt: Date;
        location?: string;
    }) => Promise<boolean>;
    isAddingDose: boolean;
}) {
    const [showAddDose, setShowAddDose] = useState(false);
    const [showSchedule, setShowSchedule] = useState(false);

    const done = doneMuiCount(item);
    const isComplete = done >= item.total;

    // Status badge
    let badgeText: string;
    let badgeBg: string;
    let badgeColor: string;
    let badgeBorder: string;
    if (isComplete) {
        badgeText = '✓ Hoàn thành';
        badgeBg = colors.successBg;
        badgeColor = colors.success;
        badgeBorder = 'rgba(22,163,74,0.3)';
    } else if (done > 0) {
        badgeText = `Còn thiếu ${item.total - done}`;
        badgeBg = colors.warningBg;
        badgeColor = colors.warning;
        badgeBorder = 'rgba(217,119,6,0.35)';
    } else {
        badgeText = 'Chưa tiêm';
        badgeBg = colors.bg;
        badgeColor = colors.text3;
        badgeBorder = colors.border;
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            {/* TOPBAR */}
            <View style={[styles.subTopbar, styles.vaxDetailTopbar]}>
                <Pressable
                    style={[styles.subBackBtn, styles.vaxDetailBackBtn]}
                    onPress={onBack}
                >
                    <Ionicons
                        name='chevron-back'
                        size={17}
                        color={colors.text2}
                    />
                </Pressable>
                <Text style={styles.vaxDetailTopbarTitle} numberOfLines={1}>
                    {item.name}
                    {item.abbr ? ` (${item.abbr})` : ''}
                </Text>
                <Pressable
                    style={styles.vaxDetailAddBtn}
                    onPress={() => setShowAddDose(true)}
                >
                    <Ionicons name='add' size={17} color={colors.primary} />
                </Pressable>
            </View>

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                {/* SUMMARY CARD */}
                <View style={styles.vdSummary}>
                    <View>
                        <Text style={styles.vdSummaryLabel}>Tiến độ</Text>
                        <Text style={styles.vdSummaryProgress}>
                            {done} / {item.total} mũi
                        </Text>
                        <Text style={styles.vdSummarySub}>
                            {item.total} mũi khuyến nghị
                        </Text>
                    </View>
                    <View
                        style={[
                            styles.vdStatusBadge,
                            {
                                backgroundColor: badgeBg,
                                borderColor: badgeBorder,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.vdStatusBadgeText,
                                { color: badgeColor },
                            ]}
                        >
                            {badgeText}
                        </Text>
                    </View>
                </View>

                {/* DOSE LIST */}
                <View style={styles.vdDoseCard}>
                    {Array.from({ length: item.total }, (_, i) => {
                        const dose = item.doses.find(
                            (d: VaccineDose) => d.num === i + 1,
                        );
                        const isDone =
                            dose?.date !== undefined && dose?.date !== null;
                        const isScheduled =
                            !isDone &&
                            dose?.scheduled !== undefined &&
                            dose?.scheduled !== null;

                        return (
                            <View
                                key={i}
                                style={[
                                    styles.vdDoseItem,
                                    i < item.total - 1 &&
                                        styles.vdDoseItemBorder,
                                ]}
                            >
                                {/* Dot icon */}
                                <View
                                    style={[
                                        styles.vdDoseDot,
                                        isDone && styles.vdDoseDotDone,
                                        isScheduled &&
                                            styles.vdDoseDotScheduled,
                                        !isDone &&
                                            !isScheduled &&
                                            styles.vdDoseDotEmpty,
                                    ]}
                                >
                                    <Ionicons
                                        name={
                                            isDone
                                                ? 'checkmark'
                                                : isScheduled
                                                  ? 'calendar-outline'
                                                  : 'ellipse-outline'
                                        }
                                        size={isDone || isScheduled ? 12 : 10}
                                        color={
                                            isDone
                                                ? colors.success
                                                : isScheduled
                                                  ? colors.primary
                                                  : colors.text3
                                        }
                                    />
                                </View>

                                {/* Body */}
                                <View style={styles.vdDoseBody}>
                                    <Text style={styles.vdDoseLabel}>
                                        Mũi {i + 1}
                                    </Text>
                                    {isDone ? (
                                        <>
                                            <Text style={styles.vdDoseVal}>
                                                {dose!.date}
                                            </Text>
                                            {dose!.place ? (
                                                <Text
                                                    style={styles.vdDosePlace}
                                                >
                                                    {dose!.place}
                                                </Text>
                                            ) : null}
                                            <Text
                                                style={[
                                                    styles.vdDoseTag,
                                                    styles.vdDoseTagDone,
                                                ]}
                                            >
                                                Đã tiêm
                                            </Text>
                                        </>
                                    ) : isScheduled ? (
                                        <>
                                            <Text
                                                style={[
                                                    styles.vdDoseVal,
                                                    {
                                                        color: colors.primary,
                                                    },
                                                ]}
                                            >
                                                Lịch: {dose!.scheduled}
                                            </Text>
                                            {dose!.place ? (
                                                <Text
                                                    style={styles.vdDosePlace}
                                                >
                                                    {dose!.place}
                                                </Text>
                                            ) : null}
                                            <Text
                                                style={[
                                                    styles.vdDoseTag,
                                                    styles.vdDoseTagScheduled,
                                                ]}
                                            >
                                                Đã lên lịch
                                            </Text>
                                        </>
                                    ) : (
                                        <Text
                                            style={[
                                                styles.vdDoseVal,
                                                {
                                                    color: colors.text3,
                                                    fontStyle: 'italic',
                                                    fontSize: 13,
                                                },
                                            ]}
                                        >
                                            Chưa tiêm
                                        </Text>
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* ACTION BUTTONS */}
                <View style={{ gap: 8 }}>
                    <Pressable
                        style={styles.vdSchedBtn}
                        onPress={() => setShowSchedule(true)}
                    >
                        <Ionicons
                            name='calendar-outline'
                            size={14}
                            color={colors.text2}
                        />
                        <Text style={styles.vdSchedBtnText}>Đặt lịch tiêm</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <AddDoseSheet
                visible={showAddDose}
                onClose={() => setShowAddDose(false)}
                nextNum={Math.min(done + 1, item.total)}
                vaxName={item.name}
                itemId={item.id}
                userVaccinationId={item.userVaccinationId}
                onSave={onAddDose}
                isSaving={isAddingDose}
            />

            {/* SCHEDULE DOSE SHEET */}
            <ScheduleDoseSheet
                visible={showSchedule}
                onClose={() => setShowSchedule(false)}
                vaccineName={item.name}
                nextDoseNumber={Math.min(done + 1, item.total)}
                onSave={(payload) => {
                    onSchedule(payload);
                    setShowSchedule(false);
                }}
                isSaving={isScheduling}
            />
        </SafeAreaView>
    );
}

/* ===================================
   ADD DOSE BOTTOM SHEET
   =================================== */
function AddDoseSheet({
    visible,
    onClose,
    nextNum,
    vaxName,
    itemId,
    userVaccinationId,
    onSave,
    isSaving,
}: {
    visible: boolean;
    onClose: () => void;
    nextNum: number;
    vaxName?: string;
    itemId: string;
    userVaccinationId?: string;
    onSave: (payload: {
        itemId: string;
        userVaccinationId?: string;
        doseIndex: number;
        administeredAt: Date;
        location?: string;
    }) => Promise<boolean>;
    isSaving: boolean;
}) {
    const [doseNum, setDoseNum] = useState(nextNum.toString());
    const [doseDate, setDoseDate] = useState(new Date());
    const [dosePlace, setDosePlace] = useState('');
    const [reaction, setReaction] = useState('');
    const [attachments, setAttachments] = useState<AttachmentUploadItem[]>([]);

    const handleSaveDose = useCallback(async () => {
        const doseIndex = Number(doseNum);
        if (!Number.isInteger(doseIndex) || doseIndex < 1) {
            appToast.showError('Số mũi không hợp lệ');
            return;
        }

        const ok = await onSave({
            itemId,
            userVaccinationId,
            doseIndex,
            administeredAt: doseDate,
            location: dosePlace,
        });

        if (ok) {
            onClose();
        }
    }, [
        doseDate,
        doseNum,
        dosePlace,
        itemId,
        onClose,
        onSave,
        userVaccinationId,
    ]);

    return (
        <Modal
            visible={visible}
            transparent={false}
            animationType='slide'
            onRequestClose={onClose}
        >
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.card }}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.card}
                />

                <View style={{ flex: 1, backgroundColor: colors.bg }}>
                    {/* TOP BAR */}
                    <View
                        style={[
                            styles.subTopbar,
                            {
                                justifyContent: 'flex-start',
                                gap: 12,
                            },
                        ]}
                    >
                        <Pressable
                            style={[styles.subBackBtn, styles.vaxBackBtn]}
                            onPress={onClose}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={18}
                                color={colors.text2}
                            />
                        </Pressable>
                        <Text style={[styles.subTopbarTitle, { flex: 0 }]}>
                            Thêm mũi tiêm
                        </Text>
                    </View>

                    <ScrollView
                        style={{ flex: 1 }}
                        contentContainerStyle={{
                            padding: 20,
                            paddingBottom: 176,
                        }}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps='handled'
                    >
                        {/* Tên vaccine */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Tên vaccine</Text>
                            <TextInput
                                style={styles.arInput}
                                placeholder='VD: COVID-19 (Pfizer)'
                                placeholderTextColor={colors.text3}
                                value={vaxName}
                                editable={false}
                                selectTextOnFocus={false}
                            />
                        </View>

                        {/* Mũi thứ */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Mũi thứ</Text>
                            <TextInput
                                style={styles.arInput}
                                placeholder='VD: 3'
                                placeholderTextColor={colors.text3}
                                keyboardType='number-pad'
                                value={doseNum}
                                onChangeText={setDoseNum}
                            />
                        </View>

                        {/* Ngày tiêm */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Ngày tiêm</Text>
                            <DateField
                                value={doseDate}
                                onChange={setDoseDate}
                            />
                        </View>

                        {/* Nơi tiêm */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>Nơi tiêm</Text>
                            <View style={styles.arInputIcon}>
                                <Ionicons
                                    name='home-outline'
                                    size={15}
                                    color={colors.text3}
                                />
                                <TextInput
                                    style={styles.arInputBare}
                                    placeholder='VD: VNVC Quận 1'
                                    placeholderTextColor={colors.text3}
                                    value={dosePlace}
                                    onChangeText={setDosePlace}
                                />
                            </View>
                        </View>

                        {/* Phản ứng sau tiêm */}
                        <View style={styles.arGroup}>
                            <Text style={styles.arLabel}>
                                Phản ứng sau tiêm
                            </Text>
                            <TextInput
                                style={styles.arTextarea}
                                placeholder='VD: Sốt nhẹ, đau tay 1 ngày...'
                                placeholderTextColor={colors.text3}
                                value={reaction}
                                onChangeText={setReaction}
                                multiline
                                numberOfLines={2}
                            />
                        </View>

                        <View style={styles.arGroup}>
                            <View
                                style={[
                                    styles.arDivider,
                                    { marginVertical: 24 },
                                ]}
                            />
                            <AttachmentUploadBlock
                                attachments={attachments}
                                onChange={setAttachments}
                            />
                        </View>
                    </ScrollView>

                    {/* SAVE BUTTON */}
                    <View style={styles.arSaveWrap}>
                        <Pressable
                            onPress={handleSaveDose}
                            disabled={isSaving}
                            style={styles.vdSaveBtnSolid}
                        >
                            {isSaving ? (
                                <ActivityIndicator size='small' color='#fff' />
                            ) : (
                                <Text style={styles.vdSaveBtnText}>
                                    Lưu mũi tiêm
                                </Text>
                            )}
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

/* ===================================
   SCHEDULE DOSE BOTTOM SHEET
   =================================== */
function ScheduleDoseSheet({
    visible,
    onClose,
    vaccineName,
    nextDoseNumber,
    onSave,
    isSaving,
}: {
    visible: boolean;
    onClose: () => void;
    vaccineName: string;
    nextDoseNumber: number;
    onSave: (payload: {
        appointmentAt: Date;
        vaccineName: string;
        doseNumber: number;
        hospitalName?: string;
        reminderSelection: string;
    }) => void;
    isSaving: boolean;
}) {
    const [schedDate, setSchedDate] = useState(new Date());
    const [schedTime, setSchedTime] = useState(new Date());
    const [schedPlace, setSchedPlace] = useState('');
    const [schedReminder, setSchedReminder] = useState('1 ngày trước');
    const [showSchedReminderOptions, setShowSchedReminderOptions] =
        useState(false);
    const [showSchedCustomReminder, setShowSchedCustomReminder] =
        useState(false);

    const selectSchedReminder = useCallback((option: string) => {
        setShowSchedReminderOptions(false);
        if (option === 'Tùy chỉnh') {
            setShowSchedCustomReminder(true);
            return;
        }
        setSchedReminder(option);
    }, []);

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}
        >
            <Pressable style={shared.overlay} onPress={onClose}>
                <Pressable
                    style={styles.vaxSheet}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={shared.sheetHandle}>
                        <View style={shared.sheetBar} />
                    </View>
                    <View style={styles.vdSheetContent}>
                        <Text style={styles.vdSheetTitle}>Đặt lịch tiêm</Text>
                        <View style={{ gap: 10 }}>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Ngày tiêm *
                                </Text>
                                <DateField
                                    value={schedDate}
                                    onChange={setSchedDate}
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Giờ tiêm
                                </Text>
                                <DateField
                                    value={schedTime}
                                    onChange={setSchedTime}
                                    mode='time'
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Cơ sở y tế
                                </Text>
                                <TextInput
                                    style={styles.vdFieldInput}
                                    placeholder='VD: BV Chợ Rẫy'
                                    placeholderTextColor={colors.text3}
                                    value={schedPlace}
                                    onChangeText={setSchedPlace}
                                />
                            </View>
                            <View>
                                <Text style={styles.vdFieldLabel}>
                                    Nhắc trước
                                </Text>
                                <Pressable
                                    style={styles.fuReminderSelect}
                                    onPress={() =>
                                        setShowSchedReminderOptions(
                                            (prev) => !prev,
                                        )
                                    }
                                >
                                    <Text style={styles.fuReminderSelectText}>
                                        {schedReminder}
                                    </Text>
                                    <Ionicons
                                        name={
                                            showSchedReminderOptions
                                                ? 'chevron-up'
                                                : 'chevron-down'
                                        }
                                        size={16}
                                        color={colors.text3}
                                    />
                                </Pressable>
                                {showSchedReminderOptions ? (
                                    <View style={styles.fuReminderOptionWrap}>
                                        {VACCINE_REMINDER_OPTIONS.map(
                                            (option) => (
                                                <Pressable
                                                    key={option}
                                                    style={[
                                                        styles.fuReminderOption,
                                                        schedReminder ===
                                                            option &&
                                                            styles.fuReminderOptionActive,
                                                    ]}
                                                    onPress={() =>
                                                        selectSchedReminder(
                                                            option,
                                                        )
                                                    }
                                                >
                                                    <Text
                                                        style={[
                                                            styles.fuReminderOptionText,
                                                            schedReminder ===
                                                                option &&
                                                                styles.fuReminderOptionTextActive,
                                                        ]}
                                                    >
                                                        {option}
                                                    </Text>
                                                </Pressable>
                                            ),
                                        )}
                                    </View>
                                ) : null}
                            </View>
                            <Pressable style={styles.vdSaveBtn}>
                                <View style={styles.vdSaveBtnSolid}>
                                    <Pressable
                                        onPress={() =>
                                            onSave({
                                                appointmentAt:
                                                    combineDateAndTime(
                                                        schedDate,
                                                        schedTime,
                                                    ),
                                                vaccineName,
                                                doseNumber: nextDoseNumber,
                                                hospitalName: schedPlace,
                                                reminderSelection:
                                                    schedReminder,
                                            })
                                        }
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator
                                                size='small'
                                                color='#fff'
                                            />
                                        ) : (
                                            <Text style={styles.vdSaveBtnText}>
                                                Lưu lịch tiêm
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                    <CustomReminderModal
                        visible={showSchedCustomReminder}
                        onClose={() => setShowSchedCustomReminder(false)}
                        onSave={setSchedReminder}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
}

/* ===================================
   ADD VACCINE BOTTOM SHEET
   =================================== */
function AddVaxSheet({
    visible,
    onClose,
    options,
    onSave,
    isSaving,
}: {
    visible: boolean;
    onClose: () => void;
    options: VaccinationRecommendation[];
    onSave: (
        payload:
            | { mode: 'catalog'; recommendationId: string }
            | { mode: 'custom'; vaccineName: string; totalDoses: number },
    ) => Promise<boolean>;
    isSaving: boolean;
}) {
    const [mode, setMode] = useState<'catalog' | 'custom'>('catalog');
    const [search, setSearch] = useState('');
    const [selectedRecommendationId, setSelectedRecommendationId] =
        useState('');
    const [customName, setCustomName] = useState('');
    const [customTotal, setCustomTotal] = useState('1');

    const filteredOptions = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        if (!keyword) return options;
        return options.filter((item) => {
            const title = item.name.toLowerCase();
            const code = (item.code ?? '').toLowerCase();
            const disease = (item.disease_name ?? '').toLowerCase();
            return (
                title.includes(keyword) ||
                code.includes(keyword) ||
                disease.includes(keyword)
            );
        });
    }, [options, search]);

    const handleSubmit = useCallback(async () => {
        if (mode === 'custom') {
            const total = Number(customTotal);
            const ok = await onSave({
                mode: 'custom',
                vaccineName: customName,
                totalDoses: Number.isFinite(total) ? total : 1,
            });
            if (ok) {
                setCustomName('');
                setCustomTotal('1');
                onClose();
            }
            return;
        }

        if (!selectedRecommendationId) {
            appToast.showError('Vui lòng chọn vaccine từ danh mục');
            return;
        }

        const ok = await onSave({
            mode: 'catalog',
            recommendationId: selectedRecommendationId,
        });
        if (ok) {
            setSearch('');
            setSelectedRecommendationId('');
            onClose();
        }
    }, [
        customName,
        customTotal,
        mode,
        onClose,
        onSave,
        selectedRecommendationId,
    ]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}
        >
            <Pressable style={shared.overlay} onPress={onClose}>
                <Pressable
                    style={styles.vaxSheet}
                    onPress={(e) => e.stopPropagation()}
                >
                    <View style={shared.sheetHandle}>
                        <View style={shared.sheetBar} />
                    </View>
                    <View style={styles.vdSheetContent}>
                        <Text style={styles.vdSheetTitle}>
                            Thêm vaccine mới
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <Pressable
                                onPress={() => setMode('catalog')}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor:
                                        mode === 'catalog'
                                            ? colors.primary
                                            : colors.border,
                                    backgroundColor:
                                        mode === 'catalog'
                                            ? colors.primaryBg
                                            : colors.card,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color:
                                            mode === 'catalog'
                                                ? colors.primary
                                                : colors.text2,
                                        fontWeight: '600',
                                    }}
                                >
                                    Từ danh mục
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => setMode('custom')}
                                style={{
                                    flex: 1,
                                    paddingVertical: 10,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    borderColor:
                                        mode === 'custom'
                                            ? colors.primary
                                            : colors.border,
                                    backgroundColor:
                                        mode === 'custom'
                                            ? colors.primaryBg
                                            : colors.card,
                                    alignItems: 'center',
                                }}
                            >
                                <Text
                                    style={{
                                        color:
                                            mode === 'custom'
                                                ? colors.primary
                                                : colors.text2,
                                        fontWeight: '600',
                                    }}
                                >
                                    Tự nhập
                                </Text>
                            </Pressable>
                        </View>
                        <View style={{ gap: 10 }}>
                            {mode === 'catalog' ? (
                                <>
                                    <View>
                                        <Text style={styles.vdFieldLabel}>
                                            Tìm vaccine
                                        </Text>
                                        <TextInput
                                            style={styles.vdFieldInput}
                                            placeholder='VD: Viêm gan B, Uốn ván...'
                                            placeholderTextColor={colors.text3}
                                            value={search}
                                            onChangeText={setSearch}
                                        />
                                    </View>
                                    <View style={{ gap: 8, maxHeight: 220 }}>
                                        <Text style={styles.vdFieldLabel}>
                                            Chọn từ danh mục
                                        </Text>
                                        <ScrollView
                                            nestedScrollEnabled
                                            showsVerticalScrollIndicator={false}
                                        >
                                            <View style={{ gap: 8 }}>
                                                {filteredOptions.length ===
                                                0 ? (
                                                    <View
                                                        style={{
                                                            borderWidth: 1,
                                                            borderColor:
                                                                colors.border,
                                                            borderRadius: 12,
                                                            padding: 12,
                                                            backgroundColor:
                                                                colors.card,
                                                        }}
                                                    >
                                                        <Text
                                                            style={{
                                                                color: colors.text3,
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            Không tìm thấy
                                                            vaccine phù hợp.
                                                        </Text>
                                                        <Pressable
                                                            onPress={() =>
                                                                setMode(
                                                                    'custom',
                                                                )
                                                            }
                                                            style={{
                                                                marginTop: 10,
                                                                alignSelf:
                                                                    'flex-start',
                                                            }}
                                                        >
                                                            <Text
                                                                style={{
                                                                    color: colors.primary,
                                                                    fontWeight:
                                                                        '600',
                                                                }}
                                                            >
                                                                Chuyển sang tự
                                                                nhập
                                                            </Text>
                                                        </Pressable>
                                                    </View>
                                                ) : (
                                                    filteredOptions.map(
                                                        (option) => {
                                                            const active =
                                                                selectedRecommendationId ===
                                                                option.id;
                                                            return (
                                                                <Pressable
                                                                    key={
                                                                        option.id
                                                                    }
                                                                    onPress={() =>
                                                                        setSelectedRecommendationId(
                                                                            option.id,
                                                                        )
                                                                    }
                                                                    style={{
                                                                        borderWidth: 1,
                                                                        borderColor:
                                                                            active
                                                                                ? colors.primary
                                                                                : colors.border,
                                                                        borderRadius: 12,
                                                                        padding: 12,
                                                                        backgroundColor:
                                                                            active
                                                                                ? colors.primaryBg
                                                                                : colors.card,
                                                                    }}
                                                                >
                                                                    <Text
                                                                        style={{
                                                                            color: colors.text,
                                                                            fontWeight:
                                                                                active
                                                                                    ? '700'
                                                                                    : '600',
                                                                            fontSize: 14,
                                                                        }}
                                                                    >
                                                                        {
                                                                            option.name
                                                                        }
                                                                    </Text>
                                                                    <Text
                                                                        style={{
                                                                            color: colors.text3,
                                                                            fontSize: 12,
                                                                            marginTop: 2,
                                                                        }}
                                                                    >
                                                                        {(option.code
                                                                            ? `${option.code} · `
                                                                            : '') +
                                                                            (option.disease_name ??
                                                                                'Không rõ bệnh đích')}
                                                                    </Text>
                                                                </Pressable>
                                                            );
                                                        },
                                                    )
                                                )}
                                            </View>
                                        </ScrollView>
                                    </View>
                                </>
                            ) : (
                                <>
                                    <View>
                                        <Text style={styles.vdFieldLabel}>
                                            Tên vaccine
                                        </Text>
                                        <TextInput
                                            style={styles.vdFieldInput}
                                            placeholder='VD: Thủy đậu, HPV, cúm mùa...'
                                            placeholderTextColor={colors.text3}
                                            value={customName}
                                            onChangeText={setCustomName}
                                        />
                                    </View>
                                    <View>
                                        <Text style={styles.vdFieldLabel}>
                                            Tổng số mũi khuyến nghị
                                        </Text>
                                        <TextInput
                                            style={styles.vdFieldInput}
                                            placeholder='VD: 3'
                                            placeholderTextColor={colors.text3}
                                            keyboardType='number-pad'
                                            value={customTotal}
                                            onChangeText={setCustomTotal}
                                        />
                                    </View>
                                </>
                            )}
                        </View>
                        <Pressable
                            style={[
                                styles.vdSaveBtn,
                                styles.vdAddVaxSaveBtnSpacing,
                            ]}
                            onPress={handleSubmit}
                            disabled={isSaving}
                        >
                            <View style={styles.vdSaveBtnSolid}>
                                {isSaving ? (
                                    <ActivityIndicator
                                        size='small'
                                        color='#fff'
                                    />
                                ) : (
                                    <Text style={styles.vdSaveBtnText}>
                                        Thêm vaccine
                                    </Text>
                                )}
                            </View>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
