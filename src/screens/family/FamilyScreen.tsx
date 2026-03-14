// src/screens/family/FamilyScreen.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
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
import { styles } from './styles';
import { CardBlock, DateField, SectionHeader } from '../../components/ui';
import { FAMILIES } from '../../data/family-data';
import { shared } from '../../styles/shared';
import { colors, typography } from '../../styles/tokens';
import type { FamilyGroup, FamilyMember } from '../../types/family';

type Screen =
    | 'list'
    | 'detail'
    | 'addMember'
    | 'memberDetail'
    | 'createProfile';

export default function FamilyScreen(): React.JSX.Element {
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
    const [profileDate, setProfileDate] = useState(new Date(1990, 0, 1));
    const [profileRelation, setProfileRelation] = useState('Khác');
    const [showRelationModal, setShowRelationModal] = useState(false);
    const [profileGender, setProfileGender] = useState('');
    const [profileHeight, setProfileHeight] = useState('');
    const [profileWeight, setProfileWeight] = useState('');
    const [profileAddress, setProfileAddress] = useState('');

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
        } else if (screen === 'createProfile') {
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

                    {FAMILIES.map((f) => (
                        <Pressable
                            key={f.id}
                            style={styles.fcard}
                            onPress={() => openFamily(f)}
                        >
                            <LinearGradient
                                colors={f.gradientColors}
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
                    ))}

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
                                        colors={['#7C3AED', '#2563EB']}
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
                        colors={family.gradientColors}
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
                            <View style={styles.detailInfo}>
                                <Text style={styles.detailName}>
                                    {family.name}
                                </Text>
                                <Text style={styles.detailSub}>
                                    {family.memberCount} thành viên · Tạo{' '}
                                    {family.createdDate}
                                </Text>
                            </View>
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
                                    colors={m.gradientColors}
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
                        colors={selectedFamily.gradientColors}
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

                    <SectionHeader title='Đã có tài khoản CareSync' />
                    <Pressable style={styles.methodCard}>
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
                                    Nhập SĐT người thân đã có tài khoản CareSync
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
                                    Dành cho người chưa dùng CareSync, bạn sẽ
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
                                caresync.vn/join/phan-family-2025
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
                                        colors={['#7C3AED', '#2563EB']}
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
                                colors={['#CCFBF1', '#99F6E4']}
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
                                <View style={{ flex: 1, position: 'relative' }}>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder='170'
                                        placeholderTextColor={colors.text3}
                                        keyboardType='numeric'
                                        value={profileHeight}
                                        onChangeText={setProfileHeight}
                                    />
                                    <Text
                                        style={{
                                            position: 'absolute',
                                            right: 14,
                                            top: 15,
                                            fontFamily: typography.font.bold,
                                            fontSize: 12,
                                            color: colors.text3,
                                        }}
                                    >
                                        cm
                                    </Text>
                                </View>
                                <View style={{ flex: 1, position: 'relative' }}>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder='60'
                                        placeholderTextColor={colors.text3}
                                        keyboardType='numeric'
                                        value={profileWeight}
                                        onChangeText={setProfileWeight}
                                    />
                                    <Text
                                        style={{
                                            position: 'absolute',
                                            right: 14,
                                            top: 15,
                                            fontFamily: typography.font.bold,
                                            fontSize: 12,
                                            color: colors.text3,
                                        }}
                                    >
                                        kg
                                    </Text>
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
                            colors={['#0D9488', '#2563EB']}
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
                            colors={m.gradientColors}
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
                    <SectionHeader
                        title={
                            memberTab === 'info'
                                ? 'Thông tin cơ bản'
                                : 'Chỉ số sức khoẻ'
                        }
                    />
                    <CardBlock>
                        <View style={styles.prow}>
                            <Text style={styles.prowLabel}>Giới tính</Text>
                            <Text style={styles.prowValue}>{m.gender}</Text>
                        </View>
                        <View style={styles.prow}>
                            <Text style={styles.prowLabel}>Ngày sinh</Text>
                            <Text style={styles.prowValue}>
                                {m.dob || 'Chưa cập nhật'}
                            </Text>
                        </View>
                    </CardBlock>
                </ScrollView>
            </SafeAreaView>
        );
    }

    return null;
}
