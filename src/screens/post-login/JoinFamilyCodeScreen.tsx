import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import StatePanel from '@/src/components/state/StatePanel';
import { appToast } from '@/src/lib/toast';
import { familiesServices } from '@/src/services/families.services';
import { useAuthStore } from '@/src/stores/useAuthStore';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { buttonSystem, formSystem, inputSystem } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';

type PreviewState = 'idle' | 'loading' | 'success' | 'error';

export default function JoinFamilyCodeScreen(): React.JSX.Element {
    const syncMeOverview = useAuthStore((state) => state.syncMeOverview);
    const [inviteCode, setInviteCode] = useState('');
    const [previewState, setPreviewState] = useState<PreviewState>('idle');
    const [previewData, setPreviewData] = useState<{
        family_name?: string;
        invite_code?: string;
    } | null>(null);

    const handlePreview = async () => {
        if (!inviteCode.trim()) {
            setPreviewState('error');
            setPreviewData(null);
            return;
        }

        try {
            setPreviewState('loading');
            const res = await familiesServices.previewInviteCode(
                inviteCode.trim(),
            );
            setPreviewData(res);
            setPreviewState('success');
        } catch (error) {
            console.error(error);
            setPreviewData(null);
            setPreviewState('error');
        }
    };

    const handleComplete = async () => {
        const overview = await syncMeOverview();

        if (!overview?.post_login_flow_completed) {
            appToast.showInfo(
                'Chưa hoàn tất',
                'Flow tham gia gia đình hiện chưa có bước liên kết hồ sơ hoàn chỉnh. Vui lòng tiếp tục từ lời mời hoặc tạo hồ sơ cá nhân.',
            );
            return;
        }

        router.replace('/');
    };

    return (
        <SafeAreaView style={styles.page}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps='handled'
                showsVerticalScrollIndicator={false}
            >
                <Pressable style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons
                        name='chevron-back'
                        size={18}
                        color={colors.primary}
                    />
                    <Text style={styles.backText}>Quay lại</Text>
                </Pressable>

                <View style={styles.hero}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>Mã gia đình</Text>
                    </View>
                    <Text style={styles.title}>
                        Nhập mã để{'\n'}
                        <Text style={{ color: colors.primary }}>
                            tham gia gia đình
                        </Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        Nếu gia đình của bạn đã có hồ sơ được tạo sẵn, bước tiếp
                        theo sẽ dùng mã này để tìm đúng dữ liệu tương ứng.
                    </Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Mã gia đình / mã mời</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons
                            name='key-outline'
                            size={18}
                            color={colors.text3}
                            style={{ marginRight: 10 }}
                        />
                        <TextInput
                            style={styles.input}
                            value={inviteCode}
                            onChangeText={setInviteCode}
                            placeholder='Ví dụ: ABC123'
                            placeholderTextColor={colors.text3}
                            autoCapitalize='characters'
                        />
                    </View>
                </View>

                <View style={styles.primaryWrap}>
                    <Pressable
                        style={[
                            styles.primaryBtn,
                            previewState === 'loading' &&
                                styles.primaryBtnLoading,
                        ]}
                        onPress={handlePreview}
                        disabled={previewState === 'loading'}
                    >
                        <View style={styles.primaryBtnContent}>
                            {previewState === 'loading' ? (
                                <ActivityIndicator size='small' color='#fff' />
                            ) : null}
                            <Text style={styles.primaryBtnText}>
                                {previewState === 'loading'
                                    ? '\u0110ang ki\u1EC3m tra...'
                                    : 'Ki\u1EC3m tra m\u00E3'}
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {previewState === 'success' && previewData ? (
                    <View style={styles.previewCard}>
                        <View style={styles.previewHeaderRow}>
                            <View style={styles.previewHeaderIconWrap}>
                                <Ionicons
                                    name='checkmark'
                                    size={11}
                                    color={colors.primary}
                                />
                            </View>
                            <Text style={styles.previewLabel}>Đã tìm thấy</Text>
                        </View>
                        <View style={styles.previewBody}>
                            <Text style={styles.previewTitle}>
                                {previewData.family_name || 'Gia đình hợp lệ'}
                            </Text>
                            <Text style={styles.previewDesc}>
                                Mã{' '}
                                <Text style={styles.previewCode}>
                                    {(
                                        previewData.invite_code ||
                                        inviteCode.trim()
                                    ).toUpperCase()}
                                </Text>{' '}
                                hợp lệ. Bước chọn hồ sơ trong gia đình có thể
                                được nối tiếp ở vòng triển khai tiếp theo.
                            </Text>

                            <View style={styles.previewFooterRow}>
                                <Text style={styles.previewMeta}>
                                    Sẵn sàng chọn hồ sơ để liên kết
                                </Text>
                                <Pressable
                                    style={styles.secondaryBtn}
                                    onPress={() => {
                                        void handleComplete();
                                    }}
                                >
                                    <Text style={styles.secondaryBtnText}>
                                        Chọn hồ sơ
                                    </Text>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color={colors.primary}
                                    />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                ) : null}

                {previewState === 'error' ? (
                    <StatePanel
                        variant='error'
                        title='Không kiểm tra được mã gia đình'
                        message='Mã không hợp lệ hoặc hiện chưa thể xác minh. Vui lòng thử lại.'
                    />
                ) : null}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    scrollContent: {
        paddingHorizontal: scale(24),
        paddingTop: verticalScale(12),
        paddingBottom: verticalScale(28),
    },
    backBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        marginBottom: verticalScale(18),
    },
    backText: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
    },
    hero: {
        marginBottom: verticalScale(10),
    },
    badge: {
        alignSelf: 'flex-start',
        backgroundColor: colors.primaryBg,
        borderRadius: 999,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(5),
        marginBottom: verticalScale(12),
    },
    badgeText: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
    },
    title: {
        color: colors.text,
        fontFamily: typography.font.black,
        fontSize: scaleFont(26),
        lineHeight: verticalScale(34),
        marginBottom: verticalScale(8),
        letterSpacing: -0.4,
    },
    subtitle: {
        color: colors.text2,
        fontFamily: typography.font.regular,
        fontSize: scaleFont(14),
        lineHeight: verticalScale(22),
    },
    inputGroup: {
        marginBottom: verticalScale(16),
    },
    label: {
        ...formSystem.fieldLabel,
        lineHeight: verticalScale(16),
        marginBottom: verticalScale(7),
    },
    inputWrap: {
        ...inputSystem.fieldIcon,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.card,
        minHeight: verticalScale(45),
        borderRadius: moderateScale(12),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(13),
    },
    primaryBtn: {
        width: '100%',
        ...buttonSystem.primary,
        backgroundColor: colors.primary,
        minHeight: verticalScale(45),
        borderRadius: moderateScale(11),
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 5,
    },
    primaryBtnLoading: {
        backgroundColor: 'rgba(15, 110, 86, 0.72)',
        opacity: 0.88,
    },
    primaryBtnText: {
        ...buttonSystem.textPrimary,
        fontSize: scaleFont(13.5),
    },
    primaryBtnContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: scale(8),
    },
    input: {
        ...inputSystem.text,
        fontFamily: typography.font.medium,
        color: colors.text,
        fontSize: scaleFont(12.5),
        lineHeight: scaleFont(16),
        textAlignVertical: 'center',
    },
    primaryWrap: {
        marginTop: verticalScale(8),
        marginBottom: verticalScale(18),
    },
    previewCard: {
        backgroundColor: colors.card,
        borderRadius: scale(18),
        overflow: 'hidden',
        marginBottom: verticalScale(18),
        ...shadows.card,
    },
    previewHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
        backgroundColor: colors.primary,
        paddingHorizontal: scale(16),
        paddingVertical: verticalScale(10),
    },
    previewHeaderIconWrap: {
        width: moderateScale(20),
        height: moderateScale(20),
        borderRadius: moderateScale(10),
        backgroundColor: '#D1FAE5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    previewLabel: {
        color: '#ECFDF5',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    previewBody: {
        paddingHorizontal: scale(20),
        paddingVertical: verticalScale(16),
    },
    previewTitle: {
        color: '#134E4A',
        fontFamily: typography.font.black,
        fontSize: scaleFont(19),
        lineHeight: verticalScale(26),
        marginBottom: verticalScale(10),
    },
    previewDesc: {
        color: colors.text2,
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13),
        lineHeight: verticalScale(21),
        marginBottom: verticalScale(16),
    },
    previewCode: {
        color: colors.primary,
        fontFamily: typography.font.bold,
    },
    previewFooterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: scale(10),
    },
    previewMeta: {
        flex: 1,
        color: '#0D9488',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
    },
    secondaryBtn: {
        ...buttonSystem.outline,
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        backgroundColor: '#F0FDF4',
        borderColor: '#A7F3D0',
        borderRadius: scale(999),
        paddingHorizontal: scale(14),
        minHeight: verticalScale(34),
    },
    secondaryBtnText: {
        color: colors.primary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
    },
});
