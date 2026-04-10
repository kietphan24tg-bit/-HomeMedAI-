import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Pressable,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    useInviteUserByPhoneMutation,
    useSearchUserByPhoneMutation,
} from '@/src/features/family/mutations';
import { appToast } from '@/src/lib/toast';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import type { SearchState } from './familyShared';
import {
    RECENT_CONTACTS,
    RoleSelectionModal,
    formatPhone,
} from './familyShared';
import { styles } from './styles';

export default function FamilySearchPhoneScreen({
    family,
}: {
    family: FamilyGroup;
}): React.JSX.Element {
    const [searchPhone, setSearchPhone] = useState('');
    const [searchState, setSearchState] = useState<SearchState>('idle');
    const [showRoleSheet, setShowRoleSheet] = useState(false);
    const [selectedInviteRole, setSelectedInviteRole] = useState<string | null>(
        null,
    );
    const [foundUser, setFoundUser] = useState<any>(null);

    const searchUserMutation = useSearchUserByPhoneMutation();
    const inviteUserMutation = useInviteUserByPhoneMutation();

    const handleSearchPhone = async () => {
        const cleanPhone = searchPhone.replace(/\D/g, '');
        if (cleanPhone.length < 9) return;

        setSelectedInviteRole(null);
        setSearchState('loading');
        setFoundUser(null);

        try {
            const result = await searchUserMutation.mutateAsync({
                familyId: family.id,
                phoneNumber: cleanPhone,
                dryRun: true,
            });
            if (result.found && result.user) {
                setFoundUser(result.user);
                setSearchState('found');
            } else {
                setSearchState('notFound');
            }
        } catch {
            setSearchState('notFound');
        }
    };

    const handleInviteUser = async (role: string) => {
        if (!foundUser) return;
        try {
            await inviteUserMutation.mutateAsync({
                familyId: family.id,
                phoneNumber: foundUser.phone_number,
                userId: foundUser.id,
                role: role,
                dryRun: false,
            });
            setShowRoleSheet(false);
            router.back();
        } catch {
            appToast.showError('Lỗi', 'Không thể gởi lời mời.');
        }
    };

    return (
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
                        onPress={() => router.back()}
                        style={[
                            shared.iconBtnFlat,
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
                <View
                    style={{
                        flexDirection: 'row',
                        gap: scale(8),
                        alignItems: 'center',
                    }}
                >
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
                    <View style={[styles.stepperContainer, { flex: 1 }]}>
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
                            width: scale(52),
                            height: verticalScale(50),
                            borderRadius: scale(14),
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#EFF6FF',
                        }}
                        onPress={handleSearchPhone}
                    >
                        <Ionicons
                            name='search-outline'
                            size={22}
                            color='#3B82F6'
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
                                    borderRadius: scale(26),
                                    backgroundColor: '#EFF6FF',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: verticalScale(18),
                                }}
                            >
                                <Ionicons
                                    name='call-outline'
                                    size={36}
                                    color='#3B82F6'
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
                                Nhập số điện thoại đã đăng ký CareSync để tìm và
                                thêm vào gia đình.
                            </Text>
                        </View>

                        <Text style={styles.formLabel}>Gần đây</Text>
                        <View
                            style={[shared.cardBlock, { marginHorizontal: 0 }]}
                        >
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
                                    <View
                                        style={[
                                            styles.mav,
                                            {
                                                backgroundColor:
                                                    index === 0
                                                        ? '#F3E8FF'
                                                        : '#ECFDF5',
                                            },
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.mavText,
                                                {
                                                    color:
                                                        index === 0
                                                            ? '#9333EA'
                                                            : '#10B981',
                                                },
                                            ]}
                                        >
                                            {contact.initials}
                                        </Text>
                                    </View>
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
                                <View
                                    style={{
                                        width: scale(56),
                                        height: scale(56),
                                        borderRadius: scale(28),
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#D97706',
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
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={{
                                            fontFamily: typography.font.black,
                                            fontSize: scaleFont(16),
                                            color: colors.text,
                                        }}
                                    >
                                        {foundUser?.full_name ||
                                            'Người dùng CareSync'}
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
                        <View
                            style={[
                                styles.createBtn,
                                {
                                    width: '100%',
                                    backgroundColor: colors.primary,
                                },
                            ]}
                        >
                            <Pressable
                                style={{ width: '100%', alignItems: 'center' }}
                                onPress={() =>
                                    router.push(
                                        `/family/${family.id}/add-member`,
                                    )
                                }
                            >
                                <Text style={styles.createBtnText}>
                                    Quay lại tạo link mời
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                ) : null}
            </ScrollView>

            <RoleSelectionModal
                visible={showRoleSheet}
                selectedRole={selectedInviteRole}
                onSelectRole={(role) => {
                    setSelectedInviteRole(role);
                    handleInviteUser(role);
                }}
                onClose={() => setShowRoleSheet(false)}
            />
        </SafeAreaView>
    );
}
