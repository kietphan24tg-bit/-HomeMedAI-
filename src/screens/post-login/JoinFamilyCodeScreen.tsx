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
import { familiesServices } from '@/src/services/families.services';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, shadows, typography } from '@/src/styles/tokens';

type PreviewState = 'idle' | 'loading' | 'success' | 'error';

export default function JoinFamilyCodeScreen(): React.JSX.Element {
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
            console.log(error);
            setPreviewData(null);
            setPreviewState('error');
        }
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

                <View style={styles.formCard}>
                    <Text style={styles.label}>Mã gia đình / mã mời</Text>
                    <View style={styles.inputWrap}>
                        <Ionicons
                            name='key-outline'
                            size={18}
                            color={colors.primary}
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

                    <Pressable
                        style={({ pressed }) => [
                            pressed && shared.pressed,
                            styles.primaryWrap,
                        ]}
                        onPress={handlePreview}
                        disabled={previewState === 'loading'}
                    >
                        <View
                            style={[
                                shared.btnFilled,
                                { backgroundColor: colors.primary },
                            ]}
                        >
                            {previewState === 'loading' ? (
                                <ActivityIndicator
                                    size='small'
                                    color='#fff'
                                    style={{ marginRight: 8 }}
                                />
                            ) : null}
                            <Text style={shared.btnFilledText}>
                                Kiểm tra mã
                            </Text>
                        </View>
                    </Pressable>
                </View>

                {previewState === 'success' && previewData ? (
                    <View style={styles.previewCard}>
                        <Text style={styles.previewLabel}>Đã tìm thấy</Text>
                        <Text style={styles.previewTitle}>
                            {previewData.family_name || 'Gia đình hợp lệ'}
                        </Text>
                        <Text style={styles.previewDesc}>
                            Mã {previewData.invite_code || inviteCode.trim()}{' '}
                            hợp lệ. Bước chọn hồ sơ trong gia đình có thể được
                            nối tiếp ở vòng triển khai tiếp theo.
                        </Text>
                        <Pressable
                            style={styles.secondaryBtn}
                            onPress={() => router.replace('/(tabs)')}
                        >
                            <Text style={styles.secondaryBtnText}>
                                Vào trang chủ
                            </Text>
                        </Pressable>
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
        marginBottom: verticalScale(20),
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
    formCard: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: scale(22),
        padding: scale(18),
        marginBottom: verticalScale(18),
        ...shadows.card,
    },
    label: {
        color: colors.text2,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        textTransform: 'uppercase',
        marginBottom: verticalScale(8),
        letterSpacing: 0.5,
    },
    inputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: scale(16),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(14),
    },
    input: {
        flex: 1,
        padding: 0,
        color: colors.text,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(15),
    },
    primaryWrap: {
        marginTop: verticalScale(14),
    },
    previewCard: {
        backgroundColor: colors.secondaryBg,
        borderWidth: 1.5,
        borderColor: '#99F6E4',
        borderRadius: scale(20),
        padding: scale(18),
        marginBottom: verticalScale(18),
    },
    previewLabel: {
        color: colors.secondary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        textTransform: 'uppercase',
        marginBottom: verticalScale(6),
    },
    previewTitle: {
        color: colors.text,
        fontFamily: typography.font.black,
        fontSize: scaleFont(18),
        marginBottom: verticalScale(8),
    },
    previewDesc: {
        color: colors.text2,
        fontFamily: typography.font.regular,
        fontSize: scaleFont(13),
        lineHeight: verticalScale(20),
        marginBottom: verticalScale(14),
    },
    secondaryBtn: {
        alignSelf: 'flex-start',
        backgroundColor: colors.card,
        borderColor: '#99F6E4',
        borderWidth: 1.5,
        borderRadius: scale(14),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(10),
    },
    secondaryBtnText: {
        color: colors.secondary,
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
    },
});
