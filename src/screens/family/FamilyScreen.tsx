import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import React, { useState } from 'react';
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
import { styles } from './styles';
import { FAMILIES } from '../../data/family-data';
import { scale, scaleFont, verticalScale } from '../../styles/responsive';
import { shared } from '../../styles/shared';
import { colors, typography } from '../../styles/tokens';
import type { FamilyGroup, FamilyMember } from '../../types/family';

type Screen =
    | 'list'
    | 'detail'
    | 'memberDetail'
    | 'addMember'
    | 'searchPhone'
    | 'inviteList';

type MemberTab = 'info' | 'health';
type SearchState = 'idle' | 'loading' | 'found' | 'notFound';

type InviteItem = {
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

const RECENT_CONTACTS = [
    {
        name: 'Nguyễn Thị Bình',
        phone: '0901224567',
        initials: 'NB',
        gradient: ['#7C3AED', '#A855F7'] as [string, string],
    },
    {
        name: 'Nguyễn Văn Ba',
        phone: '0912345678',
        initials: 'BA',
        gradient: ['#0D9488', '#2563EB'] as [string, string],
    },
];

const ROLE_OPTIONS = [
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

const INITIAL_INVITES: InviteItem[] = [
    {
        id: 'inv-1',
        familyName: 'Nhà Bác Hai',
        memberCount: 3,
        inviterName: 'Nguyễn Văn Hải',
        inviterRole: 'Chủ gia đình',
        role: 'Cháu',
        roleEmoji: '🧒',
        invitedAt: '2 giờ trước',
        gradient: ['#064E3B', '#059669'],
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
        gradient: ['#1E1B4B', '#4F46E5'],
    },
];

export default function FamilyScreen(): React.ReactNode {
    const [screen, setScreen] = useState<Screen>('list');
    const [selectedFamily, setSelectedFamily] = useState<FamilyGroup | null>(
        null,
    );
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
        null,
    );
    const [memberTab, setMemberTab] = useState<MemberTab>('info');
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [showRoleSheet, setShowRoleSheet] = useState(false);

    const [familyName, setFamilyName] = useState('');
    const [familyAddress, setFamilyAddress] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchState, setSearchState] = useState<SearchState>('idle');
    const [selectedInviteRole, setSelectedInviteRole] = useState<string | null>(
        null,
    );
    const [inviteList, setInviteList] = useState<InviteItem[]>(INITIAL_INVITES);

    const openFamily = (family: FamilyGroup) => {
        setSelectedFamily(family);
        setScreen('detail');
    };

    const openMember = (member: FamilyMember) => {
        setSelectedMember(member);
        setMemberTab('info');
        setScreen('memberDetail');
    };

    const handleBack = () => {
        if (screen === 'memberDetail') {
            setScreen('detail');
            return;
        }
        if (screen === 'searchPhone') {
            setScreen('addMember');
            return;
        }
        if (screen === 'addMember') {
            setScreen('detail');
            return;
        }
        if (screen === 'inviteList') {
            setScreen('list');
            return;
        }
        if (screen === 'detail') {
            setSelectedFamily(null);
            setScreen('list');
        }
    };

    const handleSearchPhone = () => {
        const cleanPhone = searchPhone.replace(/\D/g, '');
        if (cleanPhone.length < 9) return;

        setSelectedInviteRole(null);
        setSearchState('loading');

        setTimeout(() => {
            if (cleanPhone.startsWith('090') || cleanPhone.startsWith('091')) {
                setSearchState('found');
            } else {
                setSearchState('notFound');
            }
        }, 900);
    };

    const acceptInvite = (id: string) => {
        setInviteList((prev) => prev.filter((item) => item.id !== id));
    };

    const rejectInvite = (id: string) => {
        setInviteList((prev) => prev.filter((item) => item.id !== id));
    };

    const renderFamilyList = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.statusTopSpacer} />

                <View style={styles.topbar}>
                    <Text style={styles.topbarTitle}>Gia đình</Text>
                    <View style={styles.topbarRight}>
                        <Pressable
                            style={shared.iconBtn}
                            onPress={() => setScreen('inviteList')}
                        >
                            <View>
                                <Ionicons
                                    name='mail-unread-outline'
                                    size={16}
                                    color={colors.text2}
                                />
                                {inviteList.length > 0 ? (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: -7,
                                            right: -9,
                                            minWidth: 18,
                                            height: 18,
                                            paddingHorizontal: 4,
                                            borderRadius: 9,
                                            backgroundColor: '#E11D48',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 2,
                                            borderColor: colors.bg,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: '#fff',
                                                fontFamily:
                                                    typography.font.bold,
                                                fontSize: scaleFont(9),
                                            }}
                                        >
                                            {inviteList.length}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </Pressable>
                        <Pressable
                            style={[
                                shared.iconBtn,
                                {
                                    backgroundColor: colors.primaryBg,
                                    borderColor: '#BFDBFE',
                                },
                            ]}
                        >
                            <Ionicons
                                name='grid-outline'
                                size={16}
                                color={colors.primary}
                            />
                        </Pressable>
                    </View>
                </View>

                <SectionLabel title='Gia đình của tôi' />
                {FAMILIES.map((family) => (
                    <Pressable
                        key={family.id}
                        style={styles.fcard}
                        onPress={() => openFamily(family)}
                    >
                        <LinearGradient
                            colors={
                                family.gradientColors as LinearGradientProps['colors']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.fcardBg}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    top: -verticalScale(80),
                                    right: -scale(40),
                                    width: scale(200),
                                    height: scale(200),
                                    borderRadius: scale(100),
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: -verticalScale(40),
                                    left: scale(20),
                                    width: scale(110),
                                    height: scale(110),
                                    borderRadius: scale(55),
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                }}
                            />
                            <View style={styles.fcardInner}>
                                <View style={styles.fcardIcon}>
                                    <Ionicons
                                        name={family.iconName as never}
                                        size={22}
                                        color='#fff'
                                    />
                                </View>
                                <View style={styles.fcardInfo}>
                                    <Text style={styles.fcardName}>
                                        {family.name}
                                    </Text>
                                    <Text style={styles.fcardMeta}>
                                        {family.memberCount} thành viên
                                    </Text>
                                    <Text style={styles.fcardRole}>
                                        Vai trò của bạn: {family.roleEmoji}{' '}
                                        {family.role}
                                    </Text>
                                </View>
                                <View style={styles.fcardArrow}>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color='#fff'
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    </Pressable>
                ))}

                <Pressable
                    style={styles.addFcard}
                    onPress={() => setShowCreateSheet(true)}
                >
                    <View style={styles.addFcardInner}>
                        <View style={styles.addFcardIc}>
                            <Ionicons
                                name='add'
                                size={18}
                                color={colors.primary}
                            />
                        </View>
                        <View>
                            <Text style={styles.addFcardTitle}>
                                Thêm gia đình
                            </Text>
                            <Text style={styles.addFcardSub}>
                                Tạo hoặc tham gia một gia đình mới
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </ScrollView>

            <CreateFamilyModal
                visible={showCreateSheet}
                familyName={familyName}
                familyAddress={familyAddress}
                onChangeFamilyName={setFamilyName}
                onChangeFamilyAddress={setFamilyAddress}
                onClose={() => setShowCreateSheet(false)}
            />
        </SafeAreaView>
    );

    const renderFamilyDetail = () => {
        if (!selectedFamily) return null;

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle='light-content'
                    backgroundColor='transparent'
                    translucent
                />
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <LinearGradient
                        colors={
                            selectedFamily.gradientColors as LinearGradientProps['colors']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.detailHero}
                    >
                        <Pressable style={styles.backBtn} onPress={handleBack}>
                            <Ionicons
                                name='chevron-back'
                                size={14}
                                color='#fff'
                            />
                            <Text style={styles.backBtnText}>Gia đình</Text>
                        </Pressable>

                        <View style={styles.detailHeroContent}>
                            <View style={[styles.davStack, { marginLeft: 6 }]}>
                                <View
                                    style={[
                                        styles.dav,
                                        styles.davFirst,
                                        {
                                            backgroundColor:
                                                'rgba(255,255,255,0.18)',
                                        },
                                    ]}
                                >
                                    <Text style={styles.davText}>
                                        +
                                        {Math.max(
                                            0,
                                            selectedFamily.memberCount - 3,
                                        )}
                                    </Text>
                                </View>
                                {selectedFamily.members
                                    .slice(0, 3)
                                    .map((member, index) => (
                                        <LinearGradient
                                            key={member.id}
                                            colors={
                                                member.gradientColors as LinearGradientProps['colors']
                                            }
                                            style={[
                                                styles.dav,
                                                index === 0
                                                    ? styles.davFirst
                                                    : null,
                                            ]}
                                        >
                                            <Text style={styles.davText}>
                                                {member.initials}
                                            </Text>
                                        </LinearGradient>
                                    ))}
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailName}>
                                    {selectedFamily.name}
                                </Text>
                                <Text style={styles.detailSub}>
                                    {selectedFamily.memberCount} thành viên ·
                                    Tạo {selectedFamily.createdDate}
                                </Text>
                            </View>
                            <Pressable style={styles.detailMore}>
                                <Ionicons
                                    name='ellipsis-vertical'
                                    size={16}
                                    color='#fff'
                                />
                            </Pressable>
                        </View>
                    </LinearGradient>

                    <SectionLabel title='Thành viên' />

                    <View style={shared.cardBlock}>
                        {selectedFamily.members.map((member, index) => (
                            <MemberRow
                                key={member.id}
                                member={member}
                                isLast={
                                    index === selectedFamily.members.length - 1
                                }
                                onPress={() => openMember(member)}
                            />
                        ))}
                        <Pressable
                            style={[
                                styles.addMrow,
                                selectedFamily.members.length === 0
                                    ? { borderTopWidth: 0 }
                                    : {
                                          borderTopWidth: 1,
                                          borderTopColor: colors.border,
                                      },
                            ]}
                            onPress={() => setScreen('addMember')}
                        >
                            <View style={styles.addMic}>
                                <Ionicons
                                    name='add'
                                    size={16}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.addMlbl}>Thêm thành viên</Text>
                        </Pressable>
                    </View>

                    <SectionLabel title='Thiết lập nhanh' />

                    <View style={shared.cardBlock}>
                        <ActionRow
                            icon='link-outline'
                            color={colors.primary}
                            bg='#EFF6FF'
                            title='Tạo link mời liên kết'
                            subtitle='Dành cho thành viên chưa có tài khoản'
                        />
                        <ActionRow
                            icon='call-outline'
                            color='#0D9488'
                            bg='#F0FDFA'
                            title='Mời bằng số điện thoại'
                            subtitle='Tìm tài khoản đã có và gửi lời mời'
                            isLast
                            onPress={() => setScreen('searchPhone')}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    };

    const renderAddMember = () => {
        if (!selectedFamily) return null;

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle='light-content'
                    backgroundColor='transparent'
                    translucent
                />
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingBottom: verticalScale(36) },
                    ]}
                >
                    <LinearGradient
                        colors={['#1E3A5F', '#2563EB', '#0D9488']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.inviteHero}
                    >
                        <Pressable style={styles.backBtn} onPress={handleBack}>
                            <Ionicons
                                name='chevron-back'
                                size={14}
                                color='#fff'
                            />
                            <Text style={styles.backBtnText}>Gia đình</Text>
                        </Pressable>
                        <View style={styles.inviteHeroInner}>
                            <Text style={styles.inviteTitle}>
                                Thêm thành viên
                            </Text>
                            <Text
                                style={[
                                    styles.detailSub,
                                    { color: 'rgba(255,255,255,0.72)' },
                                ]}
                            >
                                {selectedFamily.name}
                            </Text>
                        </View>
                    </LinearGradient>

                    <SectionLabel title='Đã có tài khoản CareSync' />

                    <MethodCard
                        icon='call-outline'
                        iconColor={colors.primary}
                        iconBg='#EFF6FF'
                        title='Tìm bằng số điện thoại'
                        subtitle='Nhập SĐT người thân đã có tài khoản CareSync'
                        onPress={() => setScreen('searchPhone')}
                    />

                    <SectionLabel title='Chưa có tài khoản' />

                    <MethodCard
                        icon='person-add-outline'
                        iconColor='#0D9488'
                        iconBg='#F0FDFA'
                        title='Tạo hồ sơ người thân'
                        subtitle='Dành cho người chưa dùng CareSync, bạn sẽ quản lý hộ'
                        onPress={() => setShowRoleSheet(true)}
                    />
                </ScrollView>

                <RoleSelectionModal
                    visible={showRoleSheet}
                    selectedRole={selectedInviteRole}
                    onSelectRole={setSelectedInviteRole}
                    onClose={() => setShowRoleSheet(false)}
                />
            </SafeAreaView>
        );
    };

    const renderPhoneSearch = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <View style={styles.memberHeader}>
                <View
                    style={[
                        styles.memberHeaderTop,
                        { justifyContent: 'flex-start', marginBottom: 10 },
                    ]}
                >
                    <Pressable
                        onPress={handleBack}
                        style={[
                            shared.iconBtn,
                            {
                                width: scale(36),
                                height: scale(36),
                                borderRadius: scale(18),
                                marginRight: scale(12),
                            },
                        ]}
                    >
                        <Ionicons
                            name='chevron-back'
                            size={16}
                            color={colors.text2}
                        />
                    </Pressable>
                    <View>
                        <Text style={styles.memberName}>Tìm thành viên</Text>
                        <Text style={styles.memberMeta}>
                            Nhập số điện thoại người thân
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: scale(20),
                        paddingTop: verticalScale(18),
                    },
                ]}
            >
                <View style={{ flexDirection: 'row', gap: scale(10) }}>
                    <View
                        style={[
                            styles.stepperContainer,
                            {
                                width: scale(108),
                                flex: 0,
                                justifyContent: 'center',
                                paddingHorizontal: scale(14),
                                paddingVertical: verticalScale(13),
                            },
                        ]}
                    >
                        <Text
                            style={{
                                fontFamily: typography.font.bold,
                                fontSize: scaleFont(14),
                                color: colors.text2,
                            }}
                        >
                            VN
                        </Text>
                        <Text
                            style={{
                                fontFamily: typography.font.black,
                                fontSize: scaleFont(14),
                                color: colors.text,
                                marginLeft: 6,
                            }}
                        >
                            +84
                        </Text>
                        <Ionicons
                            name='chevron-down'
                            size={14}
                            color={colors.text3}
                            style={{ marginLeft: 'auto' }}
                        />
                    </View>
                    <View
                        style={[
                            styles.stepperContainer,
                            { flex: 1, marginBottom: verticalScale(10) },
                        ]}
                    >
                        <TextInput
                            style={styles.stepperInput}
                            placeholder='090 123 4567'
                            keyboardType='phone-pad'
                            value={formatPhone(searchPhone)}
                            onChangeText={(value) => {
                                setSearchPhone(value.replace(/\D/g, ''));
                                setSearchState('idle');
                                setSelectedInviteRole(null);
                            }}
                            placeholderTextColor={colors.text3}
                        />
                    </View>
                    <Pressable
                        style={{
                            width: scale(54),
                            height: verticalScale(52),
                            borderRadius: scale(16),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: colors.primary,
                        }}
                        onPress={handleSearchPhone}
                    >
                        <Ionicons
                            name='search-outline'
                            size={22}
                            color='#fff'
                        />
                    </Pressable>
                </View>
                <Text style={styles.formHint}>
                    Nhập đúng SĐT đăng ký CareSync · Mã quốc gia +84
                </Text>

                {searchState === 'idle' ? (
                    <>
                        <View
                            style={{
                                alignItems: 'center',
                                marginTop: verticalScale(36),
                                marginBottom: verticalScale(28),
                            }}
                        >
                            <View
                                style={{
                                    width: scale(80),
                                    height: scale(80),
                                    borderRadius: scale(24),
                                    backgroundColor: '#EFF6FF',
                                    borderWidth: 1.5,
                                    borderColor: '#DBEAFE',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: verticalScale(18),
                                }}
                            >
                                <Ionicons
                                    name='call-outline'
                                    size={34}
                                    color={colors.primary}
                                />
                            </View>
                            <Text
                                style={{
                                    fontFamily: typography.font.black,
                                    fontSize: scaleFont(16),
                                    color: colors.text,
                                    marginBottom: verticalScale(8),
                                }}
                            >
                                Tìm người thân
                            </Text>
                            <Text
                                style={{
                                    textAlign: 'center',
                                    color: colors.text3,
                                    fontFamily: typography.font.regular,
                                    fontSize: scaleFont(13),
                                    lineHeight: verticalScale(20),
                                    paddingHorizontal: scale(16),
                                }}
                            >
                                Nhập số điện thoại đã đăng ký để mời tài khoản
                                hiện có tham gia gia đình.
                            </Text>
                        </View>

                        <Text style={styles.formLabel}>Gần đây</Text>
                        <View style={shared.cardBlock}>
                            {RECENT_CONTACTS.map((contact, index) => (
                                <Pressable
                                    key={contact.phone}
                                    style={[
                                        styles.mrow,
                                        index === RECENT_CONTACTS.length - 1
                                            ? styles.mrowLast
                                            : null,
                                    ]}
                                    onPress={() => {
                                        setSearchPhone(contact.phone);
                                        setSearchState('idle');
                                    }}
                                >
                                    <LinearGradient
                                        colors={
                                            contact.gradient as LinearGradientProps['colors']
                                        }
                                        style={styles.mav}
                                    >
                                        <Text style={styles.mavText}>
                                            {contact.initials}
                                        </Text>
                                    </LinearGradient>
                                    <View style={styles.minfo}>
                                        <Text style={styles.mname}>
                                            {contact.name}
                                        </Text>
                                        <Text style={styles.mrole}>
                                            {formatPhone(contact.phone)}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color={colors.text3}
                                    />
                                </Pressable>
                            ))}
                        </View>
                    </>
                ) : null}
                {searchState === 'loading' ? (
                    <View
                        style={{
                            alignItems: 'center',
                            marginTop: verticalScale(56),
                            gap: verticalScale(12),
                        }}
                    >
                        <View
                            style={{
                                width: scale(38),
                                height: scale(38),
                                borderRadius: scale(19),
                                borderWidth: 3,
                                borderColor: colors.primary,
                                borderTopColor: 'transparent',
                            }}
                        />
                        <Text
                            style={{
                                color: colors.text2,
                                fontFamily: typography.font.bold,
                            }}
                        >
                            Đang tìm kiếm...
                        </Text>
                    </View>
                ) : null}

                {searchState === 'found' ? (
                    <>
                        <Text style={styles.formLabel}>Kết quả tìm kiếm</Text>
                        <View
                            style={[
                                shared.cardBlock,
                                {
                                    borderColor: colors.primary,
                                    padding: scale(14),
                                    marginHorizontal: 0,
                                },
                            ]}
                        >
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <LinearGradient
                                    colors={['#F59E0B', '#D97706']}
                                    style={{
                                        width: scale(56),
                                        height: scale(56),
                                        borderRadius: scale(28),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontFamily: typography.font.black,
                                            fontSize: scaleFont(18),
                                        }}
                                    >
                                        NB
                                    </Text>
                                </LinearGradient>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontFamily: typography.font.black,
                                            fontSize: scaleFont(16),
                                            color: colors.text,
                                        }}
                                    >
                                        Nguyễn Thị Bình
                                    </Text>
                                    <Text
                                        style={{
                                            marginTop: 2,
                                            color: colors.text3,
                                            fontFamily: typography.font.regular,
                                            fontSize: scaleFont(12),
                                        }}
                                    >
                                        {formatPhone(searchPhone)}
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 6,
                                            marginTop: 8,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 7,
                                                height: 7,
                                                borderRadius: 4,
                                                backgroundColor: '#22C55E',
                                            }}
                                        />
                                        <Text
                                            style={{
                                                color: '#16A34A',
                                                fontFamily:
                                                    typography.font.semiBold,
                                                fontSize: scaleFont(11),
                                            }}
                                        >
                                            Đã có tài khoản HomeMedAI
                                        </Text>
                                    </View>
                                </View>
                                <Pressable
                                    style={{
                                        alignSelf: 'center',
                                        backgroundColor: colors.primary,
                                        paddingHorizontal: scale(16),
                                        paddingVertical: verticalScale(12),
                                        borderRadius: scale(14),
                                    }}
                                    onPress={() => setShowRoleSheet(true)}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontFamily: typography.font.black,
                                            fontSize: scaleFont(13),
                                        }}
                                    >
                                        Mời
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </>
                ) : null}

                {searchState === 'notFound' ? (
                    <View
                        style={{
                            alignItems: 'center',
                            marginTop: verticalScale(44),
                        }}
                    >
                        <View
                            style={{
                                width: scale(72),
                                height: scale(72),
                                borderRadius: scale(22),
                                backgroundColor: '#FFF1F2',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: verticalScale(18),
                            }}
                        >
                            <Ionicons
                                name='close-circle-outline'
                                size={32}
                                color='#E11D48'
                            />
                        </View>
                        <Text
                            style={{
                                fontFamily: typography.font.black,
                                fontSize: scaleFont(16),
                                color: colors.text,
                                marginBottom: verticalScale(8),
                            }}
                        >
                            Không tìm thấy
                        </Text>
                        <Text
                            style={{
                                textAlign: 'center',
                                color: colors.text3,
                                fontFamily: typography.font.regular,
                                fontSize: scaleFont(13),
                                lineHeight: verticalScale(20),
                                marginBottom: verticalScale(20),
                            }}
                        >
                            Số điện thoại này chưa đăng ký tài khoản. Bạn có thể
                            dùng link mời để họ đăng ký rồi liên kết hồ sơ.
                        </Text>
                        <LinearGradient
                            colors={['#7C3AED', '#2563EB']}
                            style={[styles.createBtn, { width: '100%' }]}
                        >
                            <Pressable
                                style={{
                                    width: '100%',
                                    alignItems: 'center',
                                }}
                                onPress={() => setScreen('addMember')}
                            >
                                <Text style={styles.createBtnText}>
                                    Quay lại tạo link mời
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </View>
                ) : null}
            </ScrollView>

            <RoleSelectionModal
                visible={showRoleSheet}
                selectedRole={selectedInviteRole}
                onSelectRole={setSelectedInviteRole}
                onClose={() => setShowRoleSheet(false)}
            />
        </SafeAreaView>
    );

    const renderMemberDetail = () => {
        if (!selectedMember) return null;

        const bmi = bmiValue(selectedMember.height, selectedMember.weight);

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />

                <View style={styles.memberHeader}>
                    <View style={styles.memberHeaderTop}>
                        <Pressable
                            style={styles.memberBackBtn}
                            onPress={handleBack}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={styles.memberBackText}>
                                Phan Family
                            </Text>
                        </Pressable>
                    </View>

                    <View style={{ flexDirection: 'row', gap: 14 }}>
                        <LinearGradient
                            colors={
                                selectedMember.gradientColors as LinearGradientProps['colors']
                            }
                            style={styles.memberAv}
                        >
                            <Text style={styles.memberAvText}>
                                {selectedMember.initials}
                            </Text>
                        </LinearGradient>

                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={styles.memberName}>
                                {selectedMember.name}
                            </Text>
                            <Text style={styles.memberMeta}>
                                {selectedMember.age} tuổi ·{' '}
                                {selectedMember.gender} · {selectedMember.city}
                            </Text>
                            <Text
                                style={[
                                    styles.roleBadge,
                                    {
                                        backgroundColor: '#F5F3FF',
                                        color: '#7C3AED',
                                    },
                                ]}
                            >
                                {selectedMember.role}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tabBar}>
                    <Pressable
                        style={[
                            styles.tab,
                            memberTab === 'info' ? styles.tabActive : null,
                        ]}
                        onPress={() => setMemberTab('info')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                memberTab === 'info'
                                    ? styles.tabTextActive
                                    : null,
                            ]}
                        >
                            Thông tin cá nhân
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
                            Sức khỏe
                        </Text>
                    </Pressable>
                </View>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { paddingTop: verticalScale(14) },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    {memberTab === 'info' ? (
                        <>
                            <SectionLabel title='Thông tin cá nhân' />
                            <View style={shared.cardBlock}>
                                <ProfileRow
                                    icon='calendar-outline'
                                    color={colors.primary}
                                    bg='#EFF6FF'
                                    label='Ngày sinh'
                                    value={selectedMember.dob ?? '--'}
                                />
                                <ProfileRow
                                    icon='person-outline'
                                    color='#8B5CF6'
                                    bg='#F5F3FF'
                                    label='Giới tính'
                                    value={selectedMember.gender}
                                />
                                <ProfileRow
                                    icon='resize-outline'
                                    color='#22C55E'
                                    bg='#F0FDF4'
                                    label='Chiều cao'
                                    value={`${selectedMember.height ?? '--'} cm`}
                                />
                                <ProfileRow
                                    icon='barbell-outline'
                                    color='#0D9488'
                                    bg='#F0FDFA'
                                    label='Cân nặng'
                                    value={`${selectedMember.weight ?? '--'} kg`}
                                    badge={`BMI ${bmi.toFixed(1)}`}
                                />
                                <ProfileRow
                                    icon='location-outline'
                                    color='#F59E0B'
                                    bg='#FFFBEB'
                                    label='Địa chỉ'
                                    value={
                                        selectedMember.address ??
                                        'Chưa cập nhật'
                                    }
                                    isLast
                                />
                            </View>
                        </>
                    ) : (
                        <>
                            <SectionLabel title='Tổng quan sức khỏe' />
                            <View style={shared.cardBlock}>
                                <ProfileRow
                                    icon='water-outline'
                                    color='#DC2626'
                                    bg='#FEF2F2'
                                    label='Nhóm máu'
                                    value={
                                        selectedMember.bloodType ?? 'Chưa có'
                                    }
                                />
                                <ProfileRow
                                    icon='warning-outline'
                                    color='#D97706'
                                    bg='#FFFBEB'
                                    label='Bệnh nền'
                                    value={
                                        selectedMember.chronicIllness ??
                                        'Chưa ghi nhận'
                                    }
                                />
                                <ProfileRow
                                    icon='alert-circle-outline'
                                    color='#E11D48'
                                    bg='#FFF1F2'
                                    label='Dị ứng'
                                    value={
                                        selectedMember.allergies ??
                                        'Chưa ghi nhận'
                                    }
                                    isLast
                                />
                            </View>

                            <SectionLabel title='Hồ sơ y tế' />
                            <View style={shared.cardBlock}>
                                <ActionRow
                                    icon='document-text-outline'
                                    color={colors.primary}
                                    bg='#EFF6FF'
                                    title={`${
                                        selectedMember.recordCount ?? 0
                                    } hồ sơ khám`}
                                    subtitle='Lịch sử khám và kết quả xét nghiệm'
                                />
                                <ActionRow
                                    icon='shield-checkmark-outline'
                                    color='#16A34A'
                                    bg='#F0FDF4'
                                    title={`${
                                        selectedMember.vaccineDoseCount ?? 0
                                    }/${
                                        selectedMember.vaccineTotalCount ?? 0
                                    } mũi vaccine`}
                                    subtitle='Tiến độ tiêm chủng hiện tại'
                                    isLast
                                />
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    };

    const renderInviteList = () => (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <View style={styles.memberHeader}>
                <View style={styles.memberHeaderTop}>
                    <Pressable
                        style={styles.memberBackBtn}
                        onPress={handleBack}
                    >
                        <Ionicons
                            name='chevron-back'
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={styles.memberBackText}>Gia đình</Text>
                    </Pressable>
                </View>
                <Text
                    style={[
                        styles.memberName,
                        { fontSize: scaleFont(22), marginBottom: 6 },
                    ]}
                >
                    Lời mời tham gia
                </Text>
                <Text style={styles.memberMeta}>
                    {inviteList.length} lời mời đang chờ phản hồi
                </Text>
            </View>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingHorizontal: scale(20),
                        paddingTop: verticalScale(18),
                        gap: verticalScale(12),
                    },
                ]}
            >
                {inviteList.length === 0 ? (
                    <View
                        style={{
                            backgroundColor: colors.card,
                            borderWidth: 1.5,
                            borderColor: colors.border,
                            borderRadius: 20,
                            paddingVertical: verticalScale(40),
                            paddingHorizontal: scale(20),
                            alignItems: 'center',
                        }}
                    >
                        <View
                            style={{
                                width: scale(64),
                                height: scale(64),
                                borderRadius: scale(20),
                                backgroundColor: '#F1F5F9',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: verticalScale(12),
                            }}
                        >
                            <Ionicons
                                name='notifications-outline'
                                size={28}
                                color={colors.text3}
                            />
                        </View>
                        <Text
                            style={{
                                fontFamily: typography.font.black,
                                fontSize: scaleFont(15),
                                color: colors.text,
                                marginBottom: verticalScale(6),
                            }}
                        >
                            Không có lời mời
                        </Text>
                        <Text
                            style={{
                                textAlign: 'center',
                                color: colors.text3,
                                fontFamily: typography.font.regular,
                                fontSize: scaleFont(12),
                                lineHeight: verticalScale(18),
                            }}
                        >
                            Khi ai đó mời bạn tham gia gia đình, lời mời sẽ xuất
                            hiện ở đây.
                        </Text>
                    </View>
                ) : (
                    inviteList.map((invite) => (
                        <InviteCard
                            key={invite.id}
                            invite={invite}
                            onAccept={() => acceptInvite(invite.id)}
                            onReject={() => rejectInvite(invite.id)}
                        />
                    ))
                )}
            </ScrollView>
        </SafeAreaView>
    );

    if (screen === 'list') return renderFamilyList();
    if (screen === 'detail') return renderFamilyDetail();
    if (screen === 'memberDetail') return renderMemberDetail();
    if (screen === 'addMember') return renderAddMember();
    if (screen === 'searchPhone') return renderPhoneSearch();
    if (screen === 'inviteList') return renderInviteList();

    return null;
}

function SectionLabel({ title }: { title: string }) {
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
                    fontFamily: typography.font.bold,
                    fontSize: scaleFont(11),
                    color: colors.text2,
                    textTransform: 'uppercase',
                    letterSpacing: 0.9,
                }}
            >
                {title}
            </Text>
        </View>
    );
}

function MemberRow({
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
            <LinearGradient
                colors={member.gradientColors as LinearGradientProps['colors']}
                style={styles.mav}
            >
                <Text style={styles.mavText}>{member.initials}</Text>
                {member.isOnline ? <View style={styles.mavDot} /> : null}
            </LinearGradient>
            <View style={styles.minfo}>
                <Text style={styles.mname}>{member.name}</Text>
                <Text style={styles.mrole}>{member.role}</Text>
            </View>
            <Ionicons name='chevron-forward' size={14} color={colors.text3} />
        </Pressable>
    );
}

function ProfileRow({
    icon,
    color,
    bg,
    label,
    value,
    badge,
    isLast,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    color: string;
    bg: string;
    label: string;
    value: string;
    badge?: string;
    isLast?: boolean;
}) {
    return (
        <View style={[styles.prow, isLast ? styles.prowLast : null]}>
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
        </View>
    );
}

function ActionRow({
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

function MethodCard({
    icon,
    iconColor,
    iconBg,
    title,
    subtitle,
    onPress,
}: {
    icon: React.ComponentProps<typeof Ionicons>['name'];
    iconColor: string;
    iconBg: string;
    title: string;
    subtitle: string;
    onPress?: () => void;
}) {
    return (
        <Pressable style={styles.methodCard} onPress={onPress}>
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

function InviteCard({
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
                borderRadius: 16,
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
                    paddingVertical: verticalScale(12),
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <View
                    style={{
                        width: scale(36),
                        height: scale(36),
                        borderRadius: scale(11),
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

            <View style={{ paddingHorizontal: scale(14), paddingVertical: 12 }}>
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

function CreateFamilyModal({
    visible,
    familyName,
    familyAddress,
    onChangeFamilyName,
    onChangeFamilyAddress,
    onClose,
}: {
    visible: boolean;
    familyName: string;
    familyAddress: string;
    onChangeFamilyName: (value: string) => void;
    onChangeFamilyAddress: (value: string) => void;
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
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                                <LinearGradient
                                    colors={['#DDD6FE', '#C4B5FD']}
                                    style={styles.popupAv}
                                >
                                    <Ionicons
                                        name='people-outline'
                                        size={28}
                                        color='#7C3AED'
                                    />
                                    <View style={styles.popupAvCam}>
                                        <Ionicons
                                            name='camera-outline'
                                            size={10}
                                            color='#fff'
                                        />
                                    </View>
                                </LinearGradient>
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
                            <LinearGradient
                                colors={['#7C3AED', '#2563EB']}
                                style={styles.createBtn}
                            >
                                <Pressable
                                    style={{
                                        width: '100%',
                                        alignItems: 'center',
                                    }}
                                    onPress={onClose}
                                >
                                    <Text style={styles.createBtnText}>
                                        Tạo gia đình
                                    </Text>
                                </Pressable>
                            </LinearGradient>
                        </View>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
}

function RoleSelectionModal({
    visible,
    selectedRole,
    onSelectRole,
    onClose,
}: {
    visible: boolean;
    selectedRole: string | null;
    onSelectRole: (value: string) => void;
    onClose: () => void;
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
                                <LinearGradient
                                    colors={['#F5F3FF', '#EEF2FF']}
                                    style={[
                                        styles.mav,
                                        {
                                            width: 44,
                                            height: 44,
                                            borderRadius: 22,
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.mavText,
                                            { color: '#7C3AED' },
                                        ]}
                                    >
                                        NB
                                    </Text>
                                </LinearGradient>
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

                        <LinearGradient
                            colors={
                                selectedRole
                                    ? ['#2563EB', '#0D9488']
                                    : ['#CBD5E1', '#CBD5E1']
                            }
                            style={styles.createBtn}
                        >
                            <Pressable
                                disabled={!selectedRole}
                                style={{
                                    width: '100%',
                                    alignItems: 'center',
                                }}
                                onPress={onClose}
                            >
                                <Text style={styles.createBtnText}>
                                    Gửi lời mời
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

function bmiValue(height?: number, weight?: number): number {
    if (!height || !weight) return 0;
    return Number((weight / (height / 100) ** 2).toFixed(1));
}

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '').slice(0, 10);
    if (digits.length < 10) return phone;
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
}
