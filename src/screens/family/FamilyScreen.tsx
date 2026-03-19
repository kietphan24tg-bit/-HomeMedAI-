// src/screens/family/FamilyScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
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
import { styles } from './styles';
import { CardBlock, DateField, SectionHeader } from '../../components/ui';
import { FAMILIES } from '../../data/family-data';
import { scaleFont } from '../../styles/responsive';
import { shared } from '../../styles/shared';
import { colors, typography } from '../../styles/tokens';
import type { FamilyGroup, FamilyMember } from '../../types/family';

type Screen =
    | 'list'
    | 'detail'
    | 'addMember'
    | 'memberDetail'
    | 'createProfile'
    | 'searchPhone';

export default function FamilyScreen(): React.ReactNode {
    const [screen, setScreen] = useState<Screen>('list');
    const [selectedFamily, setSelectedFamily] = useState<FamilyGroup | null>(
        null,
    );
    const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
        null,
    );
    const [memberTab, setMemberTab] = useState<'info' | 'health'>('info');

    // State for Custom sheets/popups
    const [showCreateSheet, setShowCreateSheet] = useState(false);

    // Form states - Create Family
    const [familyName, setFamilyName] = useState('');
    const [familyAddress, setFamilyAddress] = useState('');

    // Form states - Member Profile
    const [profileName, setProfileName] = useState('');
    const [profileDate, setProfileDate] = useState<Date | null>(null);
    const [profileRelation, setProfileRelation] = useState('Khác');
    const [showRelationModal, setShowRelationModal] = useState(false);
    const [profileGender, setProfileGender] = useState('');
    const [profileHeight, setProfileHeight] = useState('');
    const [profileWeight, setProfileWeight] = useState('');
    const [profileAddress, setProfileAddress] = useState('');
    const [searchPhone, setSearchPhone] = useState('');
    const [searchState, setSearchState] = useState<
        'idle' | 'loading' | 'found' | 'notFound'
    >('idle');
    const [focusedField, setFocusedField] = useState<
        'height' | 'weight' | null
    >(null);

    const openFamily = useCallback((f: FamilyGroup) => {
        setSelectedFamily(f);
        setScreen('detail');
    }, []);

    const openMember = useCallback((m: FamilyMember) => {
        setSelectedMember(m);
        setMemberTab('info');
        setScreen('memberDetail');
    }, []);

    const goBack = useCallback(() => {
        if (screen === 'memberDetail') {
            setScreen('detail');
        } else if (screen === 'searchPhone') {
            setScreen('addMember');
        } else if (screen === 'addMember') {
            setScreen('detail');
        } else if (screen === 'detail') {
            setScreen('list');
            setSelectedFamily(null);
        }
    }, [screen]);

    // ═══════ SCREEN: LIST ═══════
    if (screen === 'list') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.statusTopSpacer} />
                    <View style={styles.topbar}>
                        <Text style={styles.topbarTitle}>Gia Đình</Text>
                        <View style={styles.topbarRight}>
                            <Pressable
                                style={[
                                    shared.iconBtn,
                                    {
                                        backgroundColor: colors.primaryBg,
                                        borderColor: colors.primaryLight,
                                    },
                                ]}
                            >
                                <Ionicons
                                    name='grid-outline'
                                    size={16}
                                    color={colors.primary}
                                />
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

                    <SectionHeader title='Gia đình của tôi' />

                    {FAMILIES.length === 0 ? (
                        <View
                            style={{
                                padding: 40,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <View
                                style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 24,
                                    backgroundColor: '#F1F5F9',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20,
                                }}
                            >
                                <Ionicons
                                    name='people-outline'
                                    size={36}
                                    color={colors.text3}
                                />
                            </View>
                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: '800',
                                    color: colors.text,
                                    marginBottom: 8,
                                }}
                            >
                                Chưa có gia đình
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: colors.text3,
                                    textAlign: 'center',
                                    lineHeight: 20,
                                }}
                            >
                                Bạn chưa tham gia gia đình nào. Hãy tạo mới hoặc
                                tham gia để quản lý sức khoẻ người thân.
                            </Text>
                        </View>
                    ) : (
                        FAMILIES.map((f) => (
                            <Pressable
                                key={f.id}
                                style={styles.fcard}
                                onPress={() => openFamily(f)}
                            >
                                <LinearGradient
                                    colors={
                                        f.gradientColors as LinearGradientProps['colors']
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.fcardBg}
                                >
                                    <View style={styles.fcardInner}>
                                        <View style={styles.fcardIcon}>
                                            <Ionicons
                                                name={f.iconName as any}
                                                size={22}
                                                color='#fff'
                                            />
                                        </View>
                                        <View style={styles.fcardInfo}>
                                            <Text style={styles.fcardName}>
                                                {f.name}
                                            </Text>
                                            <Text style={styles.fcardMeta}>
                                                {f.memberCount} thành viên
                                            </Text>
                                            <Text style={styles.fcardRole}>
                                                Vai trò của bạn: {f.roleEmoji}{' '}
                                                {f.role}
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
                        ))
                    )}

                    <Pressable
                        style={styles.addFcard}
                        onPress={() => setShowCreateSheet(true)}
                    >
                        <View style={styles.addFcardInner}>
                            <View style={styles.addFcardIc}>
                                <Ionicons
                                    name='add'
                                    size={20}
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

                <Modal
                    visible={showCreateSheet}
                    transparent
                    animationType='slide'
                    onRequestClose={() => setShowCreateSheet(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <Pressable
                            style={shared.overlay}
                            onPress={() => setShowCreateSheet(false)}
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
                                        Tạo gia đình
                                    </Text>
                                    <Pressable
                                        onPress={() =>
                                            setShowCreateSheet(false)
                                        }
                                    >
                                        <Ionicons
                                            name='close'
                                            size={20}
                                            color={colors.text3}
                                        />
                                    </Pressable>
                                </View>
                                <View style={shared.sheetBody}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>
                                            Tên gia đình
                                        </Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder='VD: Phan Family, Nhà Nguyễn…'
                                            value={familyName}
                                            onChangeText={setFamilyName}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>
                                            Địa chỉ
                                        </Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder='Số nhà, đường…'
                                            value={familyAddress}
                                            onChangeText={setFamilyAddress}
                                        />
                                    </View>
                                    <LinearGradient
                                        colors={
                                            [
                                                '#7C3AED',
                                                '#2563EB',
                                            ] as LinearGradientProps['colors']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.createBtn}
                                    >
                                        <Pressable
                                            onPress={() =>
                                                setShowCreateSheet(false)
                                            }
                                            style={{
                                                width: '100%',
                                                alignItems: 'center',
                                            }}
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
            </SafeAreaView>
        );
    }

    // ═══════ SCREEN: DETAIL ═══════
    if (screen === 'detail' && selectedFamily) {
        const family = selectedFamily;
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
                            family.gradientColors as LinearGradientProps['colors']
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.detailHero}
                    >
                        <Pressable style={styles.backBtn} onPress={goBack}>
                            <Ionicons
                                name='chevron-back'
                                size={14}
                                color='#fff'
                            />
                            <Text style={styles.backBtnText}>Gia đình</Text>
                        </Pressable>
                        <View style={styles.detailHeroContent}>
                            <View style={styles.davStack}>
                                <View
                                    style={[
                                        styles.dav,
                                        {
                                            backgroundColor:
                                                'rgba(255,255,255,0.2)',
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.davText,
                                            { fontSize: 9 },
                                        ]}
                                    >
                                        +2
                                    </Text>
                                </View>
                                {family.members.slice(0, 3).map((m, i) => (
                                    <View
                                        key={m.id}
                                        style={[
                                            styles.dav,
                                            {
                                                backgroundColor:
                                                    m.gradientColors[0],
                                            },
                                        ]}
                                    >
                                        <Text style={styles.davText}>
                                            {m.initials}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailName}>
                                    {family.name}
                                </Text>
                                <Text style={styles.detailSub}>
                                    {family.memberCount} thành viên · Tạo{' '}
                                    {family.createdDate}
                                </Text>
                            </View>
                            <Pressable style={styles.detailMore}>
                                <Ionicons
                                    name='ellipsis-vertical'
                                    size={18}
                                    color='#fff'
                                />
                            </Pressable>
                        </View>
                    </LinearGradient>

                    <SectionHeader title='Thành viên' />
                    <CardBlock>
                        {family.members.map((m, idx) => (
                            <Pressable
                                key={m.id}
                                style={[
                                    styles.mrow,
                                    idx === family.members.length - 1 &&
                                        styles.mrowLast,
                                ]}
                                onPress={() => openMember(m)}
                            >
                                <LinearGradient
                                    colors={
                                        m.gradientColors as LinearGradientProps['colors']
                                    }
                                    style={styles.mav}
                                >
                                    <Text style={styles.mavText}>
                                        {m.initials}
                                    </Text>
                                </LinearGradient>
                                <View style={styles.minfo}>
                                    <Text style={styles.mname}>
                                        {m.name}{' '}
                                        {m.isSelf && (
                                            <Text style={styles.mbadge}>
                                                Bạn
                                            </Text>
                                        )}
                                    </Text>
                                    <Text style={styles.mrole}>
                                        {m.isOwner ? '👑 ' : ''}
                                        {m.role} · {m.age} tuổi
                                    </Text>
                                </View>
                                <Ionicons
                                    name='chevron-forward'
                                    size={14}
                                    color={colors.text3}
                                />
                            </Pressable>
                        ))}
                        <Pressable
                            style={styles.addMrow}
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
                    </CardBlock>

                    <Pressable style={styles.dangerCard}>
                        <Ionicons
                            name='log-out-outline'
                            size={18}
                            color='#E11D48'
                        />
                        <Text style={styles.dangerText}>Rời khỏi gia đình</Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ═══════ SCREEN: ADD MEMBER ═══════
    if (screen === 'addMember' && selectedFamily) {
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
                        style={styles.inviteHero}
                    >
                        <Pressable style={styles.backBtn} onPress={goBack}>
                            <Ionicons
                                name='chevron-back'
                                size={14}
                                color='#fff'
                            />
                            <Text style={styles.backBtnText}>
                                {selectedFamily.name}
                            </Text>
                        </Pressable>
                        <View style={styles.inviteHeroInner}>
                            <Text style={styles.inviteTitle}>
                                Thêm thành viên
                            </Text>
                        </View>
                    </LinearGradient>

                    <SectionHeader title='Đã có tài khoản HomeMedAI' />
                    <Pressable
                        style={styles.methodCard}
                        onPress={() => {
                            setSearchState('idle');
                            setSearchPhone('');
                            setScreen('searchPhone');
                        }}
                    >
                        <View style={styles.methodInner}>
                            <View
                                style={[
                                    styles.methodIc,
                                    { backgroundColor: colors.primaryBg },
                                ]}
                            >
                                <Ionicons
                                    name='search-outline'
                                    size={20}
                                    color={colors.primary}
                                />
                            </View>
                            <View style={styles.methodBody}>
                                <Text style={styles.methodTitle}>
                                    Tìm theo số điện thoại
                                </Text>
                                <Text style={styles.methodSub}>
                                    Nhập SĐT người thân đã có tài khoản
                                    HomeMedAI
                                </Text>
                            </View>
                            <Ionicons
                                name='chevron-forward'
                                size={14}
                                color={colors.text3}
                            />
                        </View>
                    </Pressable>

                    <SectionHeader title='Chưa có tài khoản' />
                    <Pressable
                        style={styles.methodCard}
                        onPress={() => setScreen('createProfile')}
                    >
                        <View style={styles.methodInner}>
                            <View
                                style={[
                                    styles.methodIc,
                                    { backgroundColor: '#F0FDFA' },
                                ]}
                            >
                                <Ionicons
                                    name='person-add-outline'
                                    size={20}
                                    color='#0D9488'
                                />
                            </View>
                            <View style={styles.methodBody}>
                                <Text style={styles.methodTitle}>
                                    Tạo hồ sơ người thân
                                </Text>
                                <Text style={styles.methodSub}>
                                    Dành cho người chưa dùng HomeMedAI, bạn sẽ
                                    quản lý hộ
                                </Text>
                            </View>
                            <Ionicons
                                name='chevron-forward'
                                size={14}
                                color={colors.text3}
                            />
                        </View>
                    </Pressable>

                    <SectionHeader title='Gửi lời mời' />
                    <View style={styles.linkBox}>
                        <Text style={styles.linkLabel}>Link mời tham gia</Text>
                        <View style={styles.linkRow}>
                            <Text style={styles.linkUrl} numberOfLines={1}>
                                homemedai.vn/join/phan-family-2025
                            </Text>
                            <Pressable style={styles.copyBtn}>
                                <Text style={styles.copyBtnText}>Sao chép</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>

                {/* Create Family Modal (Keeping this small/simple modal as is, or can be converted later if needed) */}
                <Modal
                    visible={showCreateSheet}
                    transparent
                    animationType='slide'
                    onRequestClose={() => setShowCreateSheet(false)}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <Pressable
                            style={shared.overlay}
                            onPress={() => setShowCreateSheet(false)}
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
                                        Tạo gia đình
                                    </Text>
                                    <Pressable
                                        onPress={() =>
                                            setShowCreateSheet(false)
                                        }
                                    >
                                        <Ionicons
                                            name='close'
                                            size={20}
                                            color={colors.text3}
                                        />
                                    </Pressable>
                                </View>
                                <View style={shared.sheetBody}>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>
                                            Tên gia đình
                                        </Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder='VD: Phan Family, Nhà Nguyễn…'
                                            value={familyName}
                                            onChangeText={setFamilyName}
                                        />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.formLabel}>
                                            Địa chỉ
                                        </Text>
                                        <TextInput
                                            style={styles.formInput}
                                            placeholder='Số nhà, đường…'
                                            value={familyAddress}
                                            onChangeText={setFamilyAddress}
                                        />
                                    </View>
                                    <LinearGradient
                                        colors={
                                            [
                                                '#7C3AED',
                                                '#2563EB',
                                            ] as LinearGradientProps['colors']
                                        }
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={styles.createBtn}
                                    >
                                        <Pressable
                                            onPress={() =>
                                                setShowCreateSheet(false)
                                            }
                                            style={{
                                                width: '100%',
                                                alignItems: 'center',
                                            }}
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
            </SafeAreaView>
        );
    }

    // ═══════ SCREEN: CREATE PROFILE (FULL SCREEN) ═══════
    if (screen === 'createProfile') {
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />
                <View style={styles.memberHeader}>
                    <View style={styles.statusTopSpacer} />
                    <View style={styles.memberHeaderTop}>
                        <Pressable
                            style={styles.memberBackBtn}
                            onPress={goBack}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={styles.memberBackText}>Quay lại</Text>
                        </Pressable>
                        <Text style={styles.memberName}>Tạo hồ sơ mới</Text>
                        <View style={{ width: 40 }} />
                    </View>
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        style={styles.scroll}
                        contentContainerStyle={[
                            styles.scrollContent,
                            { paddingHorizontal: 20, paddingTop: 20 },
                        ]}
                        keyboardShouldPersistTaps='handled'
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.popupAvWrap}>
                            <LinearGradient
                                colors={
                                    [
                                        '#CCFBF1',
                                        '#99F6E4',
                                    ] as LinearGradientProps['colors']
                                }
                                style={styles.popupAv}
                            >
                                <Ionicons
                                    name='person-outline'
                                    size={28}
                                    color='#0D9488'
                                />
                                <View
                                    style={[
                                        styles.popupAvCam,
                                        { backgroundColor: '#0D9488' },
                                    ]}
                                >
                                    <Ionicons
                                        name='camera'
                                        size={10}
                                        color='#fff'
                                    />
                                </View>
                            </LinearGradient>
                            <Text style={styles.popupAvHint}>
                                Ảnh đại diện (tuỳ chọn)
                            </Text>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>
                                Họ và tên{' '}
                                <Text style={{ color: colors.cDanger }}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder='Nhập họ tên đầy đủ'
                                placeholderTextColor={colors.text3}
                                value={profileName}
                                onChangeText={setProfileName}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Ngày sinh</Text>
                            <DateField
                                value={profileDate}
                                onChange={setProfileDate}
                            />
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>
                                Quan hệ với bạn
                            </Text>
                            <Pressable
                                style={[
                                    styles.formInput,
                                    {
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    },
                                ]}
                                onPress={() => setShowRelationModal(true)}
                            >
                                <Text
                                    style={{
                                        fontFamily: typography.font.semiBold,
                                        fontSize: 14,
                                        color: profileRelation
                                            ? colors.text
                                            : colors.text3,
                                    }}
                                >
                                    {profileRelation || 'Chọn quan hệ'}
                                </Text>
                                <Ionicons
                                    name='chevron-down'
                                    size={18}
                                    color={colors.text3}
                                />
                            </Pressable>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Giới tính</Text>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                {['Nam', 'Nữ', 'Khác'].map((g) => (
                                    <Pressable
                                        key={g}
                                        style={[
                                            {
                                                flex: 1,
                                                paddingVertical: 12,
                                                borderRadius: 12,
                                                borderWidth: 1.5,
                                                borderColor: colors.border,
                                                alignItems: 'center',
                                            },
                                            profileGender === g && {
                                                borderColor: '#0D9488',
                                                backgroundColor: '#F0FDFA',
                                            },
                                        ]}
                                        onPress={() => setProfileGender(g)}
                                    >
                                        <Text
                                            style={{
                                                fontFamily:
                                                    typography.font.bold,
                                                fontSize: 13,
                                                color:
                                                    profileGender === g
                                                        ? '#0D9488'
                                                        : colors.text2,
                                            }}
                                        >
                                            {g}
                                        </Text>
                                    </Pressable>
                                ))}
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>
                                Chiều cao & Cân nặng
                            </Text>
                            <View style={{ flexDirection: 'row', gap: 10 }}>
                                {/* Height Stepper */}
                                <View style={{ flex: 1 }}>
                                    <View
                                        style={[
                                            styles.stepperContainer,
                                            focusedField === 'height' &&
                                                styles.stepperFocused,
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.stepperInput}
                                            placeholder='170'
                                            placeholderTextColor={colors.text3}
                                            keyboardType='numeric'
                                            value={profileHeight}
                                            onChangeText={setProfileHeight}
                                            onFocus={() =>
                                                setFocusedField('height')
                                            }
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <View style={styles.stepperControls}>
                                            <Pressable
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    const val =
                                                        parseInt(
                                                            profileHeight ||
                                                                '170',
                                                        ) + 5;
                                                    setProfileHeight(
                                                        String(val),
                                                    );
                                                }}
                                            >
                                                <Ionicons
                                                    name='chevron-up'
                                                    size={12}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                            <Pressable
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    const val = Math.max(
                                                        0,
                                                        parseInt(
                                                            profileHeight ||
                                                                '170',
                                                        ) - 5,
                                                    );
                                                    setProfileHeight(
                                                        String(val),
                                                    );
                                                }}
                                            >
                                                <Ionicons
                                                    name='chevron-down'
                                                    size={12}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                        </View>
                                        <Text style={styles.stepperUnit}>
                                            cm
                                        </Text>
                                    </View>
                                </View>

                                {/* Weight Stepper */}
                                <View style={{ flex: 1 }}>
                                    <View
                                        style={[
                                            styles.stepperContainer,
                                            focusedField === 'weight' &&
                                                styles.stepperFocused,
                                        ]}
                                    >
                                        <TextInput
                                            style={styles.stepperInput}
                                            placeholder='60'
                                            placeholderTextColor={colors.text3}
                                            keyboardType='numeric'
                                            value={profileWeight}
                                            onChangeText={setProfileWeight}
                                            onFocus={() =>
                                                setFocusedField('weight')
                                            }
                                            onBlur={() => setFocusedField(null)}
                                        />
                                        <View style={styles.stepperControls}>
                                            <Pressable
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    const val =
                                                        parseInt(
                                                            profileWeight ||
                                                                '60',
                                                        ) + 5;
                                                    setProfileWeight(
                                                        String(val),
                                                    );
                                                }}
                                            >
                                                <Ionicons
                                                    name='chevron-up'
                                                    size={12}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                            <Pressable
                                                style={styles.stepBtn}
                                                onPress={() => {
                                                    const val = Math.max(
                                                        0,
                                                        parseInt(
                                                            profileWeight ||
                                                                '60',
                                                        ) - 5,
                                                    );
                                                    setProfileWeight(
                                                        String(val),
                                                    );
                                                }}
                                            >
                                                <Ionicons
                                                    name='chevron-down'
                                                    size={12}
                                                    color={colors.text2}
                                                />
                                            </Pressable>
                                        </View>
                                        <Text style={styles.stepperUnit}>
                                            kg
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.formGroup}>
                            <Text style={styles.formLabel}>Địa chỉ</Text>
                            <TextInput
                                style={styles.formInput}
                                placeholder='Số nhà, đường, phường, quận…'
                                placeholderTextColor={colors.text3}
                                value={profileAddress}
                                onChangeText={setProfileAddress}
                            />
                        </View>

                        <View style={{ height: 20 }} />

                        <LinearGradient
                            colors={
                                [
                                    '#0D9488',
                                    '#2563EB',
                                ] as LinearGradientProps['colors']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.createBtn}
                        >
                            <Pressable
                                onPress={() => setScreen('detail')}
                                style={{ width: '100%', alignItems: 'center' }}
                            >
                                <Text style={styles.createBtnText}>
                                    Tạo hồ sơ
                                </Text>
                            </Pressable>
                        </LinearGradient>
                    </ScrollView>
                </KeyboardAvoidingView>

                {/* Relation Selection Modal */}
                <Modal
                    visible={showRelationModal}
                    transparent
                    animationType='fade'
                    onRequestClose={() => setShowRelationModal(false)}
                >
                    <Pressable
                        style={shared.overlay}
                        onPress={() => setShowRelationModal(false)}
                    >
                        <View
                            style={[
                                shared.sheetContainer,
                                { maxHeight: '60%' },
                            ]}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>
                            <View style={shared.sheetHeader}>
                                <Text style={shared.sheetTitle}>
                                    Chọn quan hệ
                                </Text>
                                <Pressable
                                    onPress={() => setShowRelationModal(false)}
                                >
                                    <Ionicons
                                        name='close'
                                        size={20}
                                        color={colors.text3}
                                    />
                                </Pressable>
                            </View>
                            <ScrollView style={{ padding: 10 }}>
                                {[
                                    'Vợ',
                                    'Chồng',
                                    'Ba',
                                    'Mẹ',
                                    'Con',
                                    'Anh/Em',
                                    'Chị/Em',
                                    'Ông',
                                    'Bà',
                                    'Khác',
                                ].map((rel) => (
                                    <Pressable
                                        key={rel}
                                        style={{
                                            paddingVertical: 15,
                                            paddingHorizontal: 10,
                                            borderBottomWidth: 1,
                                            borderBottomColor: colors.border,
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                        onPress={() => {
                                            setProfileRelation(rel);
                                            setShowRelationModal(false);
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontFamily:
                                                    typography.font.semiBold,
                                                fontSize: 15,
                                                color:
                                                    profileRelation === rel
                                                        ? colors.primary
                                                        : colors.text,
                                            }}
                                        >
                                            {rel}
                                        </Text>
                                        {profileRelation === rel && (
                                            <Ionicons
                                                name='checkmark'
                                                size={20}
                                                color={colors.primary}
                                            />
                                        )}
                                    </Pressable>
                                ))}
                            </ScrollView>
                        </View>
                    </Pressable>
                </Modal>
            </SafeAreaView>
        );
    }

    // ═══════ SCREEN: MEMBER DETAIL ═══════
    if (screen === 'memberDetail' && selectedMember && selectedFamily) {
        const m = selectedMember;
        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.card}
                />
                <View style={styles.memberHeader}>
                    <View style={styles.statusTopSpacer} />
                    <View style={styles.memberHeaderTop}>
                        <Pressable
                            style={styles.memberBackBtn}
                            onPress={goBack}
                        >
                            <Ionicons
                                name='chevron-back'
                                size={16}
                                color={colors.primary}
                            />
                            <Text style={styles.memberBackText}>
                                {selectedFamily.name}
                            </Text>
                        </Pressable>
                    </View>
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 14,
                        }}
                    >
                        <LinearGradient
                            colors={
                                m.gradientColors as LinearGradientProps['colors']
                            }
                            style={styles.memberAv}
                        >
                            <Text style={styles.memberAvText}>
                                {m.initials}
                            </Text>
                        </LinearGradient>
                        <View>
                            <Text style={styles.memberName}>{m.name}</Text>
                            <Text style={styles.memberMeta}>
                                {m.age} tuổi · {m.gender} · {m.city}
                            </Text>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: -18,
                                    left: 52,
                                }}
                            >
                                <View
                                    style={{
                                        width: 12,
                                        height: 12,
                                        borderRadius: 6,
                                        backgroundColor: '#22C55E',
                                        borderWidth: 2,
                                        borderColor: '#fff',
                                    }}
                                />
                            </View>
                            <Text
                                style={[
                                    styles.roleBadge,
                                    m.isOwner
                                        ? {
                                              backgroundColor: '#FFFBEB',
                                              color: '#D97706',
                                          }
                                        : {
                                              backgroundColor: '#F5F3FF',
                                              color: '#7C3AED',
                                          },
                                ]}
                            >
                                {m.isOwner ? '👑 Chủ gia đình' : m.role}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.tabBar}>
                    <Pressable
                        style={[
                            styles.tab,
                            memberTab === 'info' && styles.tabActive,
                        ]}
                        onPress={() => setMemberTab('info')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                memberTab === 'info' && styles.tabTextActive,
                            ]}
                        >
                            Thông tin
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.tab,
                            memberTab === 'health' && styles.tabActive,
                        ]}
                        onPress={() => setMemberTab('health')}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                memberTab === 'health' && styles.tabTextActive,
                            ]}
                        >
                            Sức khoẻ
                        </Text>
                    </Pressable>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                >
                    {memberTab === 'info' ? (
                        <>
                            <SectionHeader title='Thông tin cá nhân' />
                            <CardBlock>
                                <View style={styles.prow}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#EFF6FF' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='calendar-outline'
                                            size={18}
                                            color='#2563EB'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Ngày sinh
                                        </Text>
                                        <Text style={styles.prowValue}>
                                            {m.dob || '—'}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.prow}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#F5F3FF' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='person-outline'
                                            size={18}
                                            color='#7C3AED'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Giới tính
                                        </Text>
                                        <Text style={styles.prowValue}>
                                            {m.gender}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.prow}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#F0FDFA' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='resize-outline'
                                            size={18}
                                            color='#0D9488'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Chiều cao
                                        </Text>
                                        <Text style={styles.prowValue}>
                                            {m.height || '—'} cm
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.prow}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#F5F3FF' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='speedometer-outline'
                                            size={18}
                                            color='#7C3AED'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Cân nặng
                                        </Text>
                                        <View
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Text style={styles.prowValue}>
                                                {m.weight || '—'} kg
                                            </Text>
                                            {m.height && m.weight && (
                                                <Text
                                                    style={
                                                        styles.bmiBadgeInline
                                                    }
                                                >
                                                    BMI{' '}
                                                    {bmiValue(
                                                        m.height,
                                                        m.weight,
                                                    )}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </View>
                                <View style={[styles.prow, styles.prowLast]}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#FFFBEB' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='location-outline'
                                            size={18}
                                            color='#D97706'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Địa chỉ
                                        </Text>
                                        <Text style={styles.prowValue}>
                                            {m.address || `${m.city}, TP. HCM`}
                                        </Text>
                                    </View>
                                </View>
                            </CardBlock>
                        </>
                    ) : (
                        <>
                            <SectionHeader title='Chỉ số sức khoẻ' />
                            <CardBlock>
                                <View style={{ padding: 18 }}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 14,
                                            marginBottom: 12,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: 12,
                                                backgroundColor: '#EFF6FF',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Ionicons
                                                name='heart'
                                                size={20}
                                                color='#2563EB'
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 11,
                                                    color: colors.text3,
                                                    fontWeight: '600',
                                                    marginBottom: 2,
                                                }}
                                            >
                                                Chỉ số BMI
                                            </Text>
                                            <View
                                                style={{
                                                    flexDirection: 'row',
                                                    alignItems: 'baseline',
                                                    gap: 4,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 26,
                                                        fontWeight: '900',
                                                        color: colors.text,
                                                    }}
                                                >
                                                    {m.height && m.weight
                                                        ? bmiValue(
                                                              m.height,
                                                              m.weight,
                                                          )
                                                        : '—'}
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: 11,
                                                        color: colors.text3,
                                                    }}
                                                >
                                                    kg/m²
                                                </Text>
                                            </View>
                                        </View>
                                        {m.height && m.weight && (
                                            <View
                                                style={{
                                                    paddingHorizontal: 12,
                                                    paddingVertical: 5,
                                                    borderRadius: 20,
                                                    backgroundColor: '#F0FDFA',
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        fontWeight: '700',
                                                        color: getBMIColor(
                                                            bmiValue(
                                                                m.height,
                                                                m.weight,
                                                            ),
                                                        ),
                                                    }}
                                                >
                                                    {getBMICategory(
                                                        bmiValue(
                                                            m.height,
                                                            m.weight,
                                                        ),
                                                    )}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View
                                        style={{
                                            height: 6,
                                            borderRadius: 8,
                                            backgroundColor: '#E2E8F0',
                                            flexDirection: 'row',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <View
                                            style={{
                                                flex: 1.8,
                                                backgroundColor: '#60A5FA',
                                            }}
                                        />
                                        <View
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#10B981',
                                            }}
                                        />
                                        <View
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#F59E0B',
                                            }}
                                        />
                                        <View
                                            style={{
                                                flex: 1,
                                                backgroundColor: '#EF4444',
                                            }}
                                        />
                                    </View>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                            marginTop: 6,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: 9,
                                                color: '#60A5FA',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Thiếu
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 9,
                                                color: '#10B981',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Bình thường
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 9,
                                                color: '#F59E0B',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Thừa
                                        </Text>
                                        <Text
                                            style={{
                                                fontSize: 9,
                                                color: '#EF4444',
                                                fontWeight: 'bold',
                                            }}
                                        >
                                            Béo phì
                                        </Text>
                                    </View>
                                </View>
                            </CardBlock>

                            <SectionHeader title='Thông tin sức khoẻ' />
                            <CardBlock>
                                <View style={styles.prow}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#FFF1F2' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='water'
                                            size={18}
                                            color='#E11D48'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Nhóm máu
                                        </Text>
                                        <Text
                                            style={[
                                                styles.prowValue,
                                                { color: '#E11D48' },
                                            ]}
                                        >
                                            {m.bloodType || '—'}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color={colors.text3}
                                    />
                                </View>
                                <View style={styles.prow}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#FFFBEB' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='heart-half-outline'
                                            size={18}
                                            color='#D97706'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Bệnh nền
                                        </Text>
                                        <Text style={styles.prowValue}>
                                            {m.chronicIllness || 'Không'}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color={colors.text3}
                                    />
                                </View>
                                <View style={[styles.prow, styles.prowLast]}>
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#F1F5F9' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='alert-circle-outline'
                                            size={18}
                                            color={colors.text3}
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Dị ứng
                                        </Text>
                                        <Text
                                            style={[
                                                styles.prowValue,
                                                {
                                                    color:
                                                        m.allergies &&
                                                        m.allergies !== 'Không'
                                                            ? '#D97706'
                                                            : colors.text3,
                                                    fontStyle: m.allergies
                                                        ? 'normal'
                                                        : 'italic',
                                                },
                                            ]}
                                        >
                                            {m.allergies || 'Chưa có thông tin'}
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color={colors.text3}
                                    />
                                </View>
                            </CardBlock>

                            <SectionHeader title='Hồ sơ khám bệnh' />
                            <CardBlock>
                                <View style={styles.cstrip2}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.csicon2,
                                                { backgroundColor: '#EFF6FF' },
                                            ]}
                                        >
                                            <Ionicons
                                                name='document-text'
                                                size={16}
                                                color='#2563EB'
                                            />
                                        </View>
                                        <Text
                                            style={{
                                                fontFamily:
                                                    typography.font.bold,
                                                fontSize: scaleFont(14),
                                                color: colors.text,
                                            }}
                                        >
                                            Hồ sơ khám bệnh
                                        </Text>
                                    </View>
                                    <Text style={styles.countPill}>
                                        {m.recordCount || 0} hồ sơ
                                    </Text>
                                </View>
                                {m.records?.map((rec, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.rcard,
                                            i === (m.records?.length || 0) - 1
                                                ? { borderBottomWidth: 0 }
                                                : {},
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.ricon,
                                                {
                                                    backgroundColor:
                                                        rec.tag === 'Xét nghiệm'
                                                            ? '#F0FDFA'
                                                            : rec.tag ===
                                                                'Nội khoa'
                                                              ? '#FFFBEB'
                                                              : '#EFF6FF',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name={
                                                    rec.tag === 'Xét nghiệm'
                                                        ? 'flask'
                                                        : rec.tag === 'Nội khoa'
                                                          ? 'shield'
                                                          : 'heart'
                                                }
                                                size={17}
                                                color={
                                                    rec.tag === 'Xét nghiệm'
                                                        ? '#0D9488'
                                                        : rec.tag === 'Nội khoa'
                                                          ? '#D97706'
                                                          : '#2563EB'
                                                }
                                            />
                                        </View>
                                        <View style={styles.rbody}>
                                            <Text style={styles.rtitle}>
                                                {rec.title}
                                            </Text>
                                            <Text style={styles.rsub}>
                                                {rec.desc}
                                            </Text>
                                            <Text
                                                style={[
                                                    styles.rtag,
                                                    {
                                                        backgroundColor:
                                                            rec.tag ===
                                                            'Xét nghiệm'
                                                                ? '#F0FDFA'
                                                                : rec.tag ===
                                                                    'Nội khoa'
                                                                  ? '#FFFBEB'
                                                                  : '#EFF6FF',
                                                        color:
                                                            rec.tag ===
                                                            'Xét nghiệm'
                                                                ? '#0D9488'
                                                                : rec.tag ===
                                                                    'Nội khoa'
                                                                  ? '#D97706'
                                                                  : '#2563EB',
                                                    },
                                                ]}
                                            >
                                                {rec.tag}
                                            </Text>
                                        </View>
                                        <Text style={styles.rdateChip}>
                                            {rec.date}
                                        </Text>
                                    </View>
                                ))}

                                <View
                                    style={[
                                        styles.prow,
                                        {
                                            borderTopWidth: 1,
                                            borderTopColor: colors.border,
                                        },
                                    ]}
                                >
                                    <View
                                        style={[
                                            styles.prowIc,
                                            { backgroundColor: '#F0FDFA' },
                                        ]}
                                    >
                                        <Ionicons
                                            name='shield-checkmark-outline'
                                            size={18}
                                            color='#0D9488'
                                        />
                                    </View>
                                    <View style={styles.prowBody}>
                                        <Text style={styles.prowLabel}>
                                            Tiêm chủng
                                        </Text>
                                        <Text style={styles.prowValue}>
                                            {m.vaccineDoseCount || 0} /{' '}
                                            {m.vaccineTotalCount || 0} mũi
                                            khuyến nghị (
                                            {m.vaccineTotalCount
                                                ? Math.round(
                                                      ((m.vaccineDoseCount ||
                                                          0) /
                                                          m.vaccineTotalCount) *
                                                          100,
                                                  )
                                                : 0}
                                            %)
                                        </Text>
                                    </View>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color={colors.text3}
                                    />
                                </View>
                            </CardBlock>

                            <SectionHeader title='Đơn thuốc' />
                            <CardBlock>
                                <View style={styles.cstrip2}>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <View
                                            style={[
                                                styles.csicon2,
                                                { backgroundColor: '#F0FDFA' },
                                            ]}
                                        >
                                            <Ionicons
                                                name='medkit'
                                                size={16}
                                                color='#0D9488'
                                            />
                                        </View>
                                        <Text
                                            style={{
                                                fontFamily:
                                                    typography.font.bold,
                                                fontSize: scaleFont(14),
                                                color: colors.text,
                                            }}
                                        >
                                            Đơn thuốc
                                        </Text>
                                    </View>
                                    <Text
                                        style={[
                                            styles.countPill,
                                            {
                                                color: '#0D9488',
                                                backgroundColor: '#F0FDFA',
                                                borderColor:
                                                    'rgba(13,148,136,0.2)',
                                            },
                                        ]}
                                    >
                                        {m.medications?.length || 0} đang dùng
                                    </Text>
                                </View>
                                {m.medications?.map((med, i) => (
                                    <View
                                        key={i}
                                        style={[
                                            styles.vrow,
                                            i === 0
                                                ? { borderTopWidth: 0 }
                                                : {},
                                        ]}
                                    >
                                        <View
                                            style={[
                                                styles.vic,
                                                {
                                                    backgroundColor:
                                                        med.type === 'blue'
                                                            ? '#EFF6FF'
                                                            : med.type ===
                                                                'teal'
                                                              ? '#F0FDFA'
                                                              : '#FFF1F2',
                                                },
                                            ]}
                                        >
                                            <Ionicons
                                                name='medical'
                                                size={16}
                                                color={
                                                    med.type === 'blue'
                                                        ? '#2563EB'
                                                        : med.type === 'teal'
                                                          ? '#0D9488'
                                                          : '#E11D48'
                                                }
                                            />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.vname}>
                                                {med.name}
                                            </Text>
                                            <Text style={styles.vsub}>
                                                {med.desc}
                                            </Text>
                                        </View>
                                    </View>
                                ))}
                            </CardBlock>

                            <SectionHeader title='Gợi ý sức khoẻ' />
                            <View
                                style={{
                                    paddingHorizontal: 20,
                                    paddingBottom: 20,
                                }}
                            >
                                <View style={styles.tipCard}>
                                    <Text style={styles.tipEmoji}>🏃</Text>
                                    <View>
                                        <Text style={styles.tipTitle}>
                                            Vận động đều đặn
                                        </Text>
                                        <Text style={styles.tipDesc}>
                                            30 phút/ngày giảm 35% nguy cơ tim
                                            mạch
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.tipCard}>
                                    <Text style={styles.tipEmoji}>💧</Text>
                                    <View>
                                        <Text style={styles.tipTitle}>
                                            Uống đủ nước
                                        </Text>
                                        <Text style={styles.tipDesc}>
                                            2–2.5 lít/ngày phù hợp cân nặng
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.tipCard}>
                                    <Text style={styles.tipEmoji}>😴</Text>
                                    <View>
                                        <Text style={styles.tipTitle}>
                                            Ngủ đủ giấc
                                        </Text>
                                        <Text style={styles.tipDesc}>
                                            7–8 tiếng giúp kiểm soát huyết áp
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.tipCard}>
                                    <Text style={styles.tipEmoji}>🥗</Text>
                                    <View>
                                        <Text style={styles.tipTitle}>
                                            Chế độ ăn DASH
                                        </Text>
                                        <Text style={styles.tipDesc}>
                                            Phù hợp cho người tăng huyết áp
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    // ═══════ SCREEN: SEARCH PHONE ═══════
    if (screen === 'searchPhone') {
        const handleSearch = () => {
            if (searchPhone.length < 9) return;
            setSearchState('loading');
            setTimeout(() => {
                if (searchPhone.includes('123')) {
                    setSearchState('found');
                } else {
                    setSearchState('notFound');
                }
            }, 1000);
        };

        return (
            <SafeAreaView style={styles.container}>
                <StatusBar
                    barStyle='dark-content'
                    backgroundColor={colors.bg}
                />
                {/* Header */}
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 20,
                        paddingVertical: 12,
                        backgroundColor: colors.card,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                        gap: 12,
                    }}
                >
                    <Pressable
                        onPress={goBack}
                        style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            backgroundColor: colors.bg,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Ionicons
                            name='chevron-back'
                            size={18}
                            color={colors.text2}
                        />
                    </Pressable>
                    <View>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: '800',
                                color: colors.text,
                            }}
                        >
                            Tìm thành viên
                        </Text>
                        <Text
                            style={{
                                fontSize: 11,
                                color: colors.text3,
                                marginTop: 1,
                            }}
                        >
                            Nhập số điện thoại người thân
                        </Text>
                    </View>
                </View>

                {/* Search Input Area */}
                <View
                    style={{
                        padding: 20,
                        backgroundColor: colors.card,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border,
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            gap: 10,
                        }}
                    >
                        {/* Country Code Picker */}
                        <Pressable
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                backgroundColor: colors.bg,
                                borderWidth: 1.5,
                                borderColor: colors.border,
                                borderRadius: 14,
                                paddingHorizontal: 12,
                                paddingVertical: 12,
                            }}
                        >
                            <Text style={{ fontSize: 18 }}>🇻🇳</Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    fontWeight: 'bold',
                                    color: colors.text,
                                }}
                            >
                                +84
                            </Text>
                            <Ionicons
                                name='chevron-down'
                                size={12}
                                color={colors.text3}
                            />
                        </Pressable>

                        <View style={{ flex: 1 }}>
                            <TextInput
                                style={{
                                    backgroundColor: colors.bg,
                                    borderWidth: 1.5,
                                    borderColor: colors.border,
                                    borderRadius: 14,
                                    paddingHorizontal: 16,
                                    paddingVertical: 12,
                                    fontSize: 15,
                                    fontFamily: typography.font.bold,
                                    color: colors.text,
                                }}
                                placeholder='090 123 4567'
                                value={searchPhone}
                                onChangeText={(t) => {
                                    setSearchPhone(t);
                                    if (t === '') setSearchState('idle');
                                }}
                                keyboardType='phone-pad'
                            />
                        </View>

                        <Pressable
                            onPress={handleSearch}
                            disabled={searchPhone.length < 9}
                            style={{
                                width: 48,
                                height: 48,
                                borderRadius: 14,
                                backgroundColor: colors.primary,
                                alignItems: 'center',
                                justifyContent: 'center',
                                opacity: searchPhone.length >= 9 ? 1 : 0.4,
                            }}
                        >
                            <Ionicons name='search' size={20} color='#fff' />
                        </Pressable>
                    </View>
                    <Text
                        style={{
                            fontSize: 11,
                            color: colors.text3,
                            textAlign: 'center',
                            marginTop: 12,
                        }}
                    >
                        Nhập đúng SĐT đăng ký HomeMedAI · Mã quốc gia +84
                    </Text>
                </View>

                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={{ padding: 20 }}
                >
                    {searchState === 'idle' && (
                        <View>
                            <View
                                style={{
                                    alignItems: 'center',
                                    marginVertical: 40,
                                }}
                            >
                                <View
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 24,
                                        backgroundColor: '#EFF6FF',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        marginBottom: 20,
                                        borderWidth: 1.5,
                                        borderColor: '#DBEAFE',
                                    }}
                                >
                                    <Ionicons
                                        name='call-outline'
                                        size={36}
                                        color={colors.primary}
                                    />
                                </View>
                                <Text
                                    style={{
                                        fontSize: 16,
                                        fontWeight: '800',
                                        color: colors.text,
                                        marginBottom: 8,
                                    }}
                                >
                                    Tìm người thân
                                </Text>
                                <Text
                                    style={{
                                        fontSize: 13,
                                        color: colors.text3,
                                        textAlign: 'center',
                                        lineHeight: 20,
                                        paddingHorizontal: 20,
                                    }}
                                >
                                    Nhập số điện thoại đã đăng ký HomeMedAI để
                                    tìm và thêm vào gia đình.
                                </Text>
                            </View>

                            <Text
                                style={{
                                    fontSize: 11,
                                    fontWeight: '900',
                                    color: colors.text3,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.8,
                                    marginBottom: 12,
                                }}
                            >
                                Gần đây
                            </Text>
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderRadius: 20,
                                    borderWidth: 1.5,
                                    borderColor: colors.border,
                                    overflow: 'hidden',
                                }}
                            >
                                {[
                                    {
                                        name: 'Nguyễn Thị Bình',
                                        phone: '0901 224 567',
                                        init: 'NB',
                                        grad: ['#C026D3', '#DB2777'],
                                    },
                                    {
                                        name: 'Nguyễn Văn Ba',
                                        phone: '0912 345 678',
                                        init: 'BA',
                                        grad: ['#0D9488', '#0891B2'],
                                    },
                                ].map((c, i, arr) => (
                                    <Pressable
                                        key={c.phone}
                                        onPress={() =>
                                            setSearchPhone(
                                                c.phone.replace(/\s/g, ''),
                                            )
                                        }
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            padding: 16,
                                            gap: 12,
                                            borderBottomWidth:
                                                i === arr.length - 1 ? 0 : 1,
                                            borderBottomColor: colors.border,
                                        }}
                                    >
                                        <LinearGradient
                                            colors={
                                                c.grad as LinearGradientProps['colors']
                                            }
                                            style={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 20,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    color: '#fff',
                                                    fontSize: 13,
                                                    fontWeight: '800',
                                                }}
                                            >
                                                {c.init}
                                            </Text>
                                        </LinearGradient>
                                        <View style={{ flex: 1 }}>
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    fontWeight: 'bold',
                                                    color: colors.text,
                                                }}
                                            >
                                                {c.name}
                                            </Text>
                                            <Text
                                                style={{
                                                    fontSize: 11,
                                                    color: colors.text3,
                                                    marginTop: 1,
                                                }}
                                            >
                                                {c.phone}
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
                        </View>
                    )}

                    {searchState === 'loading' && (
                        <View
                            style={{
                                alignItems: 'center',
                                marginTop: 60,
                                gap: 16,
                            }}
                        >
                            <View
                                style={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 20,
                                    borderWidth: 3,
                                    borderColor: colors.primary,
                                    borderTopColor: 'transparent',
                                }}
                            />
                            <Text
                                style={{
                                    color: colors.text3,
                                    fontWeight: 'bold',
                                }}
                            >
                                Đang tìm kiếm...
                            </Text>
                        </View>
                    )}

                    {searchState === 'found' && (
                        <View>
                            <Text style={styles.formLabel}>
                                Kết quả tìm kiếm
                            </Text>
                            <View
                                style={{
                                    backgroundColor: colors.card,
                                    borderRadius: 20,
                                    borderWidth: 1.5,
                                    borderColor: colors.primary,
                                    padding: 16,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 14,
                                }}
                            >
                                <LinearGradient
                                    colors={
                                        [
                                            '#D97706',
                                            '#F59E0B',
                                        ] as LinearGradientProps['colors']
                                    }
                                    style={{
                                        width: 56,
                                        height: 56,
                                        borderRadius: 28,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: '#fff',
                                            fontSize: 18,
                                            fontWeight: '800',
                                        }}
                                    >
                                        PC
                                    </Text>
                                </LinearGradient>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontSize: 16,
                                            fontWeight: '800',
                                            color: colors.text,
                                        }}
                                    >
                                        Phan Thị Châu
                                    </Text>
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: colors.text3,
                                            marginTop: 2,
                                        }}
                                    >
                                        {searchPhone}
                                    </Text>
                                    <View
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            gap: 5,
                                            marginTop: 6,
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
                                                fontSize: 11,
                                                fontWeight: '600',
                                                color: '#22C55E',
                                            }}
                                        >
                                            Đang hoạt động
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <Text style={[styles.formLabel, { marginTop: 24 }]}>
                                Vai trò trong gia đình
                            </Text>
                            <View
                                style={{
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    gap: 8,
                                }}
                            >
                                {['Mẹ', 'Vợ', 'Chị', 'Em', 'Bà', 'Khác'].map(
                                    (r) => (
                                        <Pressable
                                            key={r}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 8,
                                                borderRadius: 12,
                                                borderWidth: 1.5,
                                                borderColor: colors.border,
                                                backgroundColor: colors.card,
                                            }}
                                        >
                                            <Text
                                                style={{
                                                    fontSize: 13,
                                                    fontWeight: 'bold',
                                                    color: colors.text2,
                                                }}
                                            >
                                                {r}
                                            </Text>
                                        </Pressable>
                                    ),
                                )}
                            </View>
                            <Pressable
                                style={[styles.createBtn, { marginTop: 32 }]}
                            >
                                <Text style={styles.createBtnText}>
                                    Gửi lời mời tham gia
                                </Text>
                            </Pressable>
                        </View>
                    )}

                    {searchState === 'notFound' && (
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <View
                                style={{
                                    width: 72,
                                    height: 72,
                                    borderRadius: 22,
                                    backgroundColor: '#FFF1F2',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20,
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
                                    fontSize: 16,
                                    fontWeight: '800',
                                    color: colors.text,
                                    marginBottom: 8,
                                }}
                            >
                                Không tìm thấy
                            </Text>
                            <Text
                                style={{
                                    fontSize: 13,
                                    color: colors.text3,
                                    textAlign: 'center',
                                    lineHeight: 20,
                                    marginBottom: 24,
                                }}
                            >
                                Số điện thoại này chưa đăng ký tài khoản
                                HomeMedAI.
                            </Text>
                            <Pressable
                                style={[styles.createBtn, { width: '100%' }]}
                                onPress={() => setScreen('addMember')}
                            >
                                <Text style={styles.createBtnText}>
                                    Gửi link mời thay thế
                                </Text>
                            </Pressable>
                        </View>
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    return null;
}

function bmiValue(h?: number, w?: number): number {
    if (!h || !w) return 0;
    return parseFloat((w / (h / 100) ** 2).toFixed(1));
}

function getBMICategory(bmi: number): string {
    if (bmi < 18.5) return 'Thiếu cân';
    if (bmi < 24.9) return 'Bình thường';
    if (bmi < 29.9) return 'Tiền béo phì';
    return 'Béo phì';
}

function getBMIColor(bmi: number): string {
    if (bmi < 18.5) return '#60A5FA';
    if (bmi < 24.9) return '#10B981';
    if (bmi < 29.9) return '#F59E0B';
    return '#EF4444';
}
