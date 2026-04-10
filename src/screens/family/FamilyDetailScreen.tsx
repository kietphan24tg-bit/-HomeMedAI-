import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { usePatchFamilyMutation } from '@/src/features/family/mutations';
import { useFamilyMembersQuery } from '@/src/features/family/queries';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { buttonSystem, shared } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import { MemberRow, SectionLabel } from './familyShared';
import { styles } from './styles';

export default function FamilyDetailScreen({
    family,
}: {
    family: FamilyGroup;
}): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const { data: members = [] } = useFamilyMembersQuery(family.id);
    const [editOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState(family.name);
    const [editAddress, setEditAddress] = useState(family.address ?? '');
    const [editAvatarUri, setEditAvatarUri] = useState<string | null>(
        family.avatarUrl ?? null,
    );
    const patchFamilyMutation = usePatchFamilyMutation();

    const canEditFamily =
        family.familyRole === 'OWNER' || family.familyRole === 'ADMIN';

    useEffect(() => {
        if (!editOpen) return;
        setEditName(family.name);
        setEditAddress(family.address ?? '');
        setEditAvatarUri(family.avatarUrl ?? null);
    }, [editOpen, family.address, family.avatarUrl, family.name]);

    const handlePickFamilyAvatar = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Chưa có quyền truy cập ảnh',
                'Hãy cho phép ứng dụng truy cập thư viện ảnh để chọn ảnh đại diện gia đình.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets[0]?.uri) {
            setEditAvatarUri(result.assets[0].uri);
        }
    };

    const saveFamily = async () => {
        const name = editName.trim();
        if (!name) {
            Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên gia đình.');
            return;
        }

        try {
            await patchFamilyMutation.mutateAsync({
                familyId: family.id,
                data: {
                    name,
                    address: editAddress.trim() || null,
                    avatar_url: editAvatarUri || null,
                },
            });
            setEditOpen(false);
        } catch {
            /* toast trong mutation */
        }
    };

    return (
        <SafeAreaView
            style={styles.container}
            edges={['left', 'right', 'bottom']}
        >
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
                <View
                    style={[
                        styles.detailHero,
                        {
                            backgroundColor:
                                family.gradientColors?.[0] ?? '#1A7F6D',
                            paddingTop: insets.top,
                        },
                    ]}
                >
                    <View style={localStyles.heroTopbar}>
                        <Pressable
                            style={localStyles.heroIconBtn}
                            onPress={() => router.back()}
                            accessibilityLabel='Quay lại'
                        >
                            <Ionicons
                                name='chevron-back'
                                size={14}
                                color={colors.card}
                            />
                        </Pressable>
                        {canEditFamily ? (
                            <Pressable
                                style={localStyles.heroIconBtn}
                                onPress={() => setEditOpen(true)}
                                accessibilityLabel='Chỉnh sửa gia đình'
                            >
                                <Ionicons
                                    name='create-outline'
                                    size={16}
                                    color={colors.card}
                                />
                            </Pressable>
                        ) : (
                            <View style={localStyles.heroIconSpacer} />
                        )}
                    </View>

                    <View style={localStyles.heroBody}>
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
                                    +{Math.max(0, family.memberCount - 3)}
                                </Text>
                            </View>
                            {members
                                .slice(0, 3)
                                .map((member: any, index: number) => (
                                    <View
                                        key={member.id}
                                        style={[
                                            styles.dav,
                                            index === 0
                                                ? styles.davFirst
                                                : null,
                                            {
                                                backgroundColor:
                                                    member
                                                        .gradientColors?.[0] ??
                                                    '#2563EB',
                                            },
                                        ]}
                                    >
                                        <Text style={styles.davText}>
                                            {member.initials}
                                        </Text>
                                    </View>
                                ))}
                        </View>
                        <View style={styles.detailInfo}>
                            <Text style={styles.detailName}>{family.name}</Text>
                            <Text style={styles.detailSub}>
                                {family.memberCount} {'thành viên · Tạo '}
                                {family.createdDate}
                            </Text>
                        </View>
                    </View>
                </View>

                <SectionLabel title='Thành viên' />

                <View style={shared.cardBlock}>
                    {members.map((member: any, index: number) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            isLast={index === members.length - 1}
                            onPress={() =>
                                router.push(
                                    `/family/${family.id}/member/${member.id}`,
                                )
                            }
                        />
                    ))}
                    <Pressable
                        style={[
                            styles.addMrow,
                            members.length === 0
                                ? { borderTopWidth: 0 }
                                : {
                                      borderTopWidth: 1,
                                      borderTopColor: colors.border,
                                  },
                        ]}
                        onPress={() =>
                            router.push(`/family/${family.id}/add-member`)
                        }
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

                <View style={{ height: verticalScale(16) }} />
            </ScrollView>

            <View style={localStyles.bottomBar}>
                <Pressable
                    style={localStyles.bottomBarItem}
                    onPress={() => router.push(`/family/${family.id}/medicine`)}
                >
                    <View
                        style={[
                            localStyles.bottomBarIcon,
                            { backgroundColor: colors.primaryBg },
                        ]}
                    >
                        <Ionicons
                            name='medkit'
                            size={20}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={localStyles.bottomBarText}>Tủ thuốc</Text>
                </Pressable>

                <Pressable
                    style={localStyles.bottomBarItem}
                    onPress={() =>
                        router.push(`/family/${family.id}/reminders`)
                    }
                >
                    <View
                        style={[
                            localStyles.bottomBarIcon,
                            { backgroundColor: colors.warningBg },
                        ]}
                    >
                        <Ionicons
                            name='calendar'
                            size={20}
                            color={colors.warning}
                        />
                    </View>
                    <Text style={localStyles.bottomBarText}>Lịch</Text>
                </Pressable>

                <Pressable
                    style={localStyles.bottomBarItem}
                    onPress={() =>
                        router.push(`/family/${family.id}/emergency`)
                    }
                >
                    <View
                        style={[
                            localStyles.bottomBarIcon,
                            { backgroundColor: colors.dangerBg },
                        ]}
                    >
                        <Ionicons
                            name='medical'
                            size={20}
                            color={colors.danger}
                        />
                    </View>
                    <Text style={localStyles.bottomBarText}>Khẩn cấp</Text>
                </Pressable>
            </View>

            <Modal
                visible={editOpen}
                transparent
                animationType='slide'
                onRequestClose={() => setEditOpen(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={{ flex: 1 }}
                >
                    <Pressable
                        style={shared.overlay}
                        onPress={() => setEditOpen(false)}
                    >
                        <Pressable
                            style={shared.sheetContainer}
                            onPress={(event) => event.stopPropagation()}
                        >
                            <View style={shared.sheetHandle}>
                                <View style={shared.sheetBar} />
                            </View>
                            <View style={shared.sheetHeader}>
                                <Text style={shared.sheetTitle}>
                                    Chỉnh sửa gia đình
                                </Text>
                                <Pressable onPress={() => setEditOpen(false)}>
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
                                        onPress={handlePickFamilyAvatar}
                                    >
                                        <View style={styles.popupAv}>
                                            {editAvatarUri ? (
                                                <Image
                                                    source={{
                                                        uri: editAvatarUri,
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
                                        value={editName}
                                        onChangeText={setEditName}
                                        placeholderTextColor={colors.text3}
                                        autoFocus
                                    />
                                    <Text style={styles.formHint}>
                                        Tên sẽ hiển thị cho tất cả thành viên
                                    </Text>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.formLabel}>
                                        Địa chỉ
                                    </Text>
                                    <TextInput
                                        style={styles.formInput}
                                        placeholder='Số nhà, đường, phường, quận...'
                                        value={editAddress}
                                        onChangeText={setEditAddress}
                                        placeholderTextColor={colors.text3}
                                    />
                                </View>

                                <View style={localStyles.editActions}>
                                    <Pressable
                                        style={localStyles.modalBtnGhost}
                                        onPress={() => setEditOpen(false)}
                                    >
                                        <Text
                                            style={
                                                localStyles.modalBtnGhostText
                                            }
                                        >
                                            Hủy
                                        </Text>
                                    </Pressable>
                                    <Pressable
                                        style={[
                                            localStyles.modalBtnPrimary,
                                            patchFamilyMutation.isPending
                                                ? { opacity: 0.6 }
                                                : null,
                                        ]}
                                        onPress={saveFamily}
                                        disabled={patchFamilyMutation.isPending}
                                    >
                                        {patchFamilyMutation.isPending ? (
                                            <ActivityIndicator color='#fff' />
                                        ) : (
                                            <Text
                                                style={
                                                    localStyles.modalBtnPrimaryText
                                                }
                                            >
                                                Lưu thay đổi
                                            </Text>
                                        )}
                                    </Pressable>
                                </View>
                            </View>
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: colors.card,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingVertical: verticalScale(10),
        paddingHorizontal: scale(16),
    },
    bottomBarItem: {
        flex: 1,
        alignItems: 'center',
        gap: verticalScale(4),
    },
    bottomBarIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomBarText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.text2,
    },
    heroTopbar: {
        ...shared.topbar,
        paddingTop: verticalScale(18),
    },
    heroBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingBottom: verticalScale(18),
        gap: scale(12),
        paddingTop: verticalScale(14),
        justifyContent: 'flex-end',
    },
    heroIconBtn: {
        ...shared.iconBtn,
        backgroundColor: 'rgba(255,255,255,0.14)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.22)',
        shadowOpacity: 0,
        elevation: 0,
    },
    heroIconSpacer: {
        width: scale(36),
        height: scale(36),
    },
    editActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: scale(12),
        marginTop: verticalScale(12),
    },
    modalBtnGhost: {
        ...buttonSystem.outline,
        flex: 1,
        minHeight: verticalScale(45),
        borderRadius: 11,
    },
    modalBtnGhostText: {
        ...buttonSystem.textOutline,
        fontSize: scaleFont(12.5),
    },
    modalBtnPrimary: {
        ...buttonSystem.primary,
        flex: 1,
        backgroundColor: colors.primary,
        minHeight: verticalScale(45),
        borderRadius: 11,
    },
    modalBtnPrimaryText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(12.5),
    },
});
