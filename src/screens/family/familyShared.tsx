import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    type StyleProp,
    Text,
    TextInput,
    View,
    type ViewStyle,
} from 'react-native';
import { FAMILIES } from '@/src/data/family-data';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { formSystem, shared } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import type { FamilyGroup, FamilyMember } from '@/src/types/family';
import { styles } from './styles';

export type SearchState = 'idle' | 'loading' | 'found' | 'notFound' | 'error';

export type InviteItem = {
    id: string;
    familyName: string;
    memberCount: number;
    inviterName: string;
    inviterRole: string;
    role: string;
    roleEmoji: string;
    invitedAt: string;
    gradient: [string, string];
};

export const RECENT_CONTACTS = [
    {
        name: 'Nguyễn Thị Bình',
        phone: '0901224567',
        initials: 'NB',
        color: '#0D9488',
        gradient: ['#0D9488', '#0D9488'] as [string, string],
    },
    {
        name: 'Nguyễn Văn Ba',
        phone: '0912345678',
        initials: 'BA',
        color: '#EA580C',
        gradient: ['#EA580C', '#EA580C'] as [string, string],
    },
];

export const ROLE_OPTIONS = [
    { id: 'father', label: 'Cha', emoji: '👨' },
    { id: 'mother', label: 'Mẹ', emoji: '👩' },
    { id: 'son', label: 'Con trai', emoji: '👦' },
    { id: 'daughter', label: 'Con gái', emoji: '👧' },
    { id: 'grandfather', label: 'Ông', emoji: '👴' },
    { id: 'grandmother', label: 'Bà', emoji: '👵' },
    { id: 'brother', label: 'Anh/Em trai', emoji: '👦' },
    { id: 'sister', label: 'Chị/Em gái', emoji: '👧' },
    { id: 'uncle', label: 'Chú/Bác', emoji: '👨' },
    { id: 'aunt', label: 'Cô/Dì', emoji: '👩' },
    { id: 'nephew', label: 'Cháu', emoji: '👦' },
    { id: 'other', label: 'Người thân khác', emoji: '🤝' },
] as const;

export const INITIAL_INVITES: InviteItem[] = [
    {
        id: 'inv-1',
        familyName: 'Nhà Bác Hai',
        memberCount: 3,
        inviterName: 'Nguyễn Văn Hải',
        inviterRole: 'Chủ gia đình',
        role: 'Cháu',
        roleEmoji: '🧒',
        invitedAt: '2 giờ trước',
        gradient: ['#15803D', '#15803D'] as [string, string],
    },
    {
        id: 'inv-2',
        familyName: 'Gia đình Trần',
        memberCount: 5,
        inviterName: 'Trần Thị Mai',
        inviterRole: 'Chủ gia đình',
        role: 'Con dâu',
        roleEmoji: '👩',
        invitedAt: '1 ngày trước',
        gradient: ['#1D4ED8', '#1D4ED8'] as [string, string],
    },
];

export function getFamilyById(familyId: string): FamilyGroup | undefined {
    return FAMILIES.find((family) => family.id === familyId);
}

export function getMemberById(
    familyId: string,
    memberId: string,
): FamilyMember | undefined {
    return getFamilyById(familyId)?.members.find(
        (member) => member.id === memberId,
    );
}

export function bmiValue(height?: number, weight?: number): number {
    if (!height || !weight) return 0;
    return Number((weight / (height / 100) ** 2).toFixed(1));
}

export function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 10) return phone;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}

export function SectionLabel({ title }: { title: string }) {
    return (
        <View
            style={{
                paddingHorizontal: scale(20),
                paddingTop: verticalScale(18),
                paddingBottom: verticalScale(10),
            }}
        >
            <Text
                style={{
                    ...formSystem.sectionTitle,
                }}
            >
                {title}
            </Text>
        </View>
    );
}

export function MemberRow({
    member,
    isLast,
    onPress,
}: {
    member: FamilyMember;
    isLast?: boolean;
    onPress?: () => void;
}) {
    return (
        <Pressable
            style={[styles.mrow, isLast ? styles.mrowLast : null]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.mav,
                    { backgroundColor: member.gradientColors[0] },
                ]}
            >
                <Text style={styles.mavText}>{member.initials}</Text>
                {member.isOnline ? <View style={styles.mavDot} /> : null}
            </View>
            <View style={styles.minfo}>
                <Text style={styles.mname}>{member.name}</Text>
                <Text style={styles.mrole}>{member.role}</Text>
            </View>
            <Ionicons name='chevron-forward' size={14} color={colors.text3} />
        </Pressable>
    );
}

export function ProfileRow({
    icon,
    color,
    bg,
    label,
    value,
    badge,
    isLast,
    onPress,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    bg: string;
    label: string;
    value: string;
    badge?: string;
    isLast?: boolean;
    onPress?: () => void;
}) {
    return (
        <Pressable
            style={[styles.prow, isLast ? styles.prowLast : null]}
            onPress={onPress}
        >
            <View style={[styles.prowIc, { backgroundColor: bg }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <View style={styles.prowBody}>
                <Text style={styles.prowLabel}>{label}</Text>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                    }}
                >
                    <Text style={styles.prowValue}>{value}</Text>
                    {badge ? (
                        <Text style={styles.bmiBadgeInline}>{badge}</Text>
                    ) : null}
                </View>
            </View>
        </Pressable>
    );
}

export function ActionRow({
    icon,
    color,
    bg,
    title,
    subtitle,
    onPress,
    isLast,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    bg: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
    isLast?: boolean;
}) {
    return (
        <Pressable
            style={[styles.mrow, isLast ? styles.mrowLast : null]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.mav,
                    {
                        width: scale(40),
                        height: scale(40),
                        borderRadius: scale(12),
                        backgroundColor: bg,
                    },
                ]}
            >
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <View style={styles.minfo}>
                <Text style={styles.mname}>{title}</Text>
                <Text style={styles.mrole}>{subtitle}</Text>
            </View>
            <Ionicons name='chevron-forward' size={14} color={colors.text3} />
        </Pressable>
    );
}

export function MethodCard({
    icon,
    iconColor,
    iconBg,
    title,
    subtitle,
    style,
    onPress,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    style?: StyleProp<ViewStyle>;
    onPress?: () => void;
}) {
    return (
        <Pressable style={[styles.methodCard, style]} onPress={onPress}>
            <View style={styles.methodInner}>
                <View style={[styles.methodIc, { backgroundColor: iconBg }]}>
                    <Ionicons name={icon} size={22} color={iconColor} />
                </View>
                <View style={styles.methodBody}>
                    <Text style={styles.methodTitle}>{title}</Text>
                    <Text style={styles.methodSub}>{subtitle}</Text>
                </View>
                <Ionicons
                    name='chevron-forward'
                    size={16}
                    color={colors.text3}
                />
            </View>
        </Pressable>
    );
}

export function InviteCard({
    invite,
    onAccept,
    onReject,
}: {
    invite: InviteItem;
    onAccept: () => void;
    onReject: () => void;
}) {
    return (
        <View
            style={{
                backgroundColor: colors.card,
                borderWidth: 1.5,
                borderColor: colors.border,
                borderRadius: 20,
                overflow: 'hidden',
                shadowColor: '#0F172A',
                shadowOpacity: 0.06,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 1 },
                elevation: 2,
            }}
        >
            <LinearGradient
                colors={invite.gradient}
                style={{
                    paddingHorizontal: scale(14),
                    paddingVertical: verticalScale(10),
                    minHeight: verticalScale(48),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <View
                    style={{
                        width: scale(30),
                        height: scale(30),
                        borderRadius: scale(9),
                        backgroundColor: 'rgba(255,255,255,0.18)',
                        borderWidth: 1.5,
                        borderColor: 'rgba(255,255,255,0.25)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Ionicons name='home-outline' size={17} color='#fff' />
                </View>
                <View style={{ flex: 1 }}>
                    <Text
                        style={{
                            color: '#fff',
                            fontFamily: typography.font.black,
                            fontSize: scaleFont(14),
                        }}
                    >
                        {invite.familyName}
                    </Text>
                    <Text
                        style={{
                            color: 'rgba(255,255,255,0.65)',
                            fontFamily: typography.font.semiBold,
                            fontSize: scaleFont(10),
                            marginTop: 1,
                        }}
                    >
                        {invite.memberCount} thành viên
                    </Text>
                </View>
                <View
                    style={{
                        backgroundColor: 'rgba(255,255,255,0.18)',
                        borderRadius: 20,
                        paddingHorizontal: scale(9),
                        paddingVertical: verticalScale(4),
                    }}
                >
                    <Text
                        style={{
                            color: '#fff',
                            fontFamily: typography.font.bold,
                            fontSize: scaleFont(10),
                        }}
                    >
                        {invite.roleEmoji} {invite.role}
                    </Text>
                </View>
            </LinearGradient>

            <View style={{ paddingHorizontal: scale(14), paddingVertical: 10 }}>
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: verticalScale(8),
                    }}
                >
                    <View
                        style={{
                            width: scale(26),
                            height: scale(26),
                            borderRadius: scale(13),
                            backgroundColor: '#DBEAFE',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text
                            style={{
                                color: '#1D4ED8',
                                fontFamily: typography.font.black,
                                fontSize: scaleFont(11),
                            }}
                        >
                            {invite.inviterName.trim().slice(-1)}
                        </Text>
                    </View>
                    <View>
                        <Text
                            style={{
                                color: colors.text,
                                fontFamily: typography.font.bold,
                                fontSize: scaleFont(11),
                            }}
                        >
                            {invite.inviterName}{' '}
                            <Text
                                style={{
                                    color: colors.text3,
                                    fontFamily: typography.font.medium,
                                }}
                            >
                                · {invite.invitedAt}
                            </Text>
                        </Text>
                        <Text
                            style={{
                                color: colors.text3,
                                fontFamily: typography.font.regular,
                                fontSize: scaleFont(10),
                            }}
                        >
                            {invite.inviterRole}
                        </Text>
                    </View>
                </View>

                <View
                    style={{
                        backgroundColor: colors.bg,
                        borderRadius: 9,
                        paddingHorizontal: scale(10),
                        paddingVertical: verticalScale(7),
                        marginBottom: verticalScale(10),
                    }}
                >
                    <Text
                        style={{
                            color: colors.text2,
                            fontFamily: typography.font.regular,
                            fontSize: scaleFont(11),
                            lineHeight: verticalScale(17),
                        }}
                    >
                        Mời bạn tham gia với vai trò{' '}
                        <Text
                            style={{
                                color: colors.text,
                                fontFamily: typography.font.bold,
                            }}
                        >
                            {invite.role}
                        </Text>
                    </Text>
                </View>

                <View style={{ flexDirection: 'row', gap: 7 }}>
                    <Pressable
                        style={{
                            flex: 1,
                            borderWidth: 1.5,
                            borderColor: colors.border,
                            borderRadius: 11,
                            paddingVertical: verticalScale(9),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={onReject}
                    >
                        <Text
                            style={{
                                color: colors.text2,
                                fontFamily: typography.font.bold,
                                fontSize: scaleFont(12),
                            }}
                        >
                            Từ chối
                        </Text>
                    </Pressable>
                    <Pressable
                        style={{
                            flex: 2,
                            backgroundColor: colors.primary,
                            borderRadius: 11,
                            paddingVertical: verticalScale(9),
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                        onPress={onAccept}
                    >
                        <Text
                            style={{
                                color: '#fff',
                                fontFamily: typography.font.bold,
                                fontSize: scaleFont(12),
                            }}
                        >
                            Chấp nhận
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}

export function CreateFamilyModal({
    visible,
    familyName,
    familyAddress,
    familyAvatarUri,
    onChangeFamilyName,
    onChangeFamilyAddress,
    onPickFamilyAvatar,
    onSubmit,
    onClose,
}: {
    visible: boolean;
    familyName: string;
    familyAddress: string;
    familyAvatarUri: string | null;
    onChangeFamilyName: (value: string) => void;
    onChangeFamilyAddress: (value: string) => void;
    onPickFamilyAvatar: () => void;
    onSubmit: () => void;
    onClose: () => void;
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType='slide'
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={{ flex: 1 }}
            >
                <Pressable style={shared.overlay} onPress={onClose}>
                    <Pressable
                        style={shared.sheetContainer}
                        onPress={(event) => event.stopPropagation()}
                    >
                        <View style={shared.sheetHandle}>
                            <View style={shared.sheetBar} />
                        </View>
                        <View style={shared.sheetHeader}>
                            <Text style={shared.sheetTitle}>Tạo gia đình</Text>
                            <Pressable onPress={onClose}>
                                <Ionicons
                                    name='close'
                                    size={18}
                                    color={colors.text3}
                                />
                            </Pressable>
                        </View>
                        <View style={shared.sheetBody}>
                            <View style={styles.popupAvWrap}>
                                <Pressable
                                    style={styles.popupAvPressable}
                                    onPress={onPickFamilyAvatar}
                                >
                                    <View style={styles.popupAv}>
                                        {familyAvatarUri ? (
                                            <Image
                                                source={{
                                                    uri: familyAvatarUri,
                                                }}
                                                style={styles.popupAvImage}
                                            />
                                        ) : (
                                            <View
                                                style={[
                                                    styles.popupAvPlaceholder,
                                                    {
                                                        backgroundColor:
                                                            colors.primaryBg,
                                                    },
                                                ]}
                                            >
                                                <Ionicons
                                                    name='image-outline'
                                                    size={28}
                                                    color={colors.primary}
                                                />
                                            </View>
                                        )}
                                        <View style={styles.popupAvCam}>
                                            <Ionicons
                                                name='camera-outline'
                                                size={10}
                                                color={colors.card}
                                            />
                                        </View>
                                    </View>
                                </Pressable>
                                <Text style={styles.popupAvHint}>
                                    Nhấn để chọn ảnh đại diện
                                </Text>
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>
                                    Tên gia đình
                                </Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder='VD: Phan Family, Nhà Nguyễn...'
                                    value={familyName}
                                    onChangeText={onChangeFamilyName}
                                    placeholderTextColor={colors.text3}
                                />
                                <Text style={styles.formHint}>
                                    Tên sẽ hiển thị cho tất cả thành viên
                                </Text>
                            </View>
                            <View style={styles.formGroup}>
                                <Text style={styles.formLabel}>Địa chỉ</Text>
                                <TextInput
                                    style={styles.formInput}
                                    placeholder='Số nhà, đường, phường, quận...'
                                    value={familyAddress}
                                    onChangeText={onChangeFamilyAddress}
                                    placeholderTextColor={colors.text3}
                                />
                            </View>
                            <View style={styles.infoBox}>
                                <Ionicons
                                    name='information-circle-outline'
                                    size={18}
                                    color={colors.primary}
                                />
                                <Text style={styles.infoText}>
                                    Người tạo gia đình sẽ tự động là Chủ gia
                                    đình. Bạn có thể phân vai trò cho từng thành
                                    viên sau.
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.createBtn,
                                    { backgroundColor: colors.primary },
                                ]}
                            >
                                <Pressable
                                    style={{
                                        width: '100%',
                                        alignItems: 'center',
                                    }}
                                    onPress={onSubmit}
                                >
                                    <Text style={styles.createBtnText}>
                                        Tạo gia đình
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}

export function RoleSelectionModal({
    visible,
    selectedRole,
    onSelectRole,
    onSubmit,
    onClose,
    isSubmitting = false,
}: {
    visible: boolean;
    selectedRole: string | null;
    onSelectRole: (value: string) => void;
    onSubmit: () => void;
    onClose: () => void;
    isSubmitting?: boolean;
}) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType='slide'
            onRequestClose={onClose}
        >
            <Pressable style={shared.overlay} onPress={onClose}>
                <Pressable
                    style={shared.sheetContainer}
                    onPress={(event) => event.stopPropagation()}
                >
                    <View style={shared.sheetHandle}>
                        <View style={shared.sheetBar} />
                    </View>
                    <View style={shared.sheetHeader}>
                        <Text style={shared.sheetTitle}>Chọn vai trò</Text>
                        <Pressable onPress={onClose}>
                            <Ionicons
                                name='close'
                                size={18}
                                color={colors.text3}
                            />
                        </Pressable>
                    </View>
                    <View style={[shared.sheetBody, { paddingBottom: 24 }]}>
                        <View
                            style={[
                                shared.cardBlock,
                                {
                                    marginHorizontal: 0,
                                    marginBottom: verticalScale(18),
                                },
                            ]}
                        >
                            <View style={[styles.mrow, styles.mrowLast]}>
                                <View
                                    style={[
                                        styles.mav,
                                        {
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                            backgroundColor: '#7C3AED',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.mavText,
                                            { color: '#fff' },
                                        ]}
                                    >
                                        NB
                                    </Text>
                                </View>
                                <View style={styles.minfo}>
                                    <Text style={styles.mname}>
                                        Nguyễn Thị Bình
                                    </Text>
                                    <Text style={styles.mrole}>
                                        0901 234 567
                                    </Text>
                                </View>
                            </View>
                        </View>

                        <Text
                            style={{
                                fontFamily: typography.font.black,
                                fontSize: scaleFont(15),
                                color: colors.text,
                                marginBottom: 4,
                            }}
                        >
                            Chọn vai trò trong gia đình
                        </Text>
                        <Text
                            style={{
                                fontFamily: typography.font.regular,
                                fontSize: scaleFont(12),
                                color: colors.text3,
                                marginBottom: 18,
                            }}
                        >
                            Vai trò này sẽ hiển thị trên hồ sơ của họ
                        </Text>

                        <View
                            style={{
                                flexDirection: 'row',
                                flexWrap: 'wrap',
                                gap: 10,
                                marginBottom: 18,
                            }}
                        >
                            {ROLE_OPTIONS.map((role) => {
                                const isSelected = selectedRole === role.id;
                                return (
                                    <Pressable
                                        key={role.id}
                                        onPress={() => onSelectRole(role.id)}
                                        style={{
                                            width: '48.5%',
                                            paddingHorizontal: 14,
                                            paddingVertical: 14,
                                            borderRadius: 16,
                                            borderWidth: 1.5,
                                            borderColor: isSelected
                                                ? colors.primary
                                                : colors.border,
                                            backgroundColor: isSelected
                                                ? colors.primaryBg
                                                : colors.bg,
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 10,
                                        }}
                                    >
                                        <Text
                                            style={{ fontSize: scaleFont(16) }}
                                        >
                                            {role.emoji}
                                        </Text>
                                        <Text
                                            style={{
                                                color: isSelected
                                                    ? colors.primary
                                                    : colors.text2,
                                                fontFamily:
                                                    typography.font.bold,
                                                fontSize: scaleFont(12),
                                            }}
                                        >
                                            {role.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>

                        <View
                            style={[
                                styles.createBtn,
                                {
                                    backgroundColor: selectedRole
                                        ? colors.primary
                                        : '#CBD5E1',
                                },
                            ]}
                        >
                            <Pressable
                                disabled={!selectedRole || isSubmitting}
                                style={{ width: '100%', alignItems: 'center' }}
                                onPress={onSubmit}
                            >
                                <Text style={styles.createBtnText}>
                                    {isSubmitting
                                        ? 'Đang gửi...'
                                        : 'Gửi lời mời'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
