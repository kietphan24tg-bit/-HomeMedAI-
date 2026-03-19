import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/src/screens/onboarding/styles';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { shared } from '@/src/styles/shared';
import { colors } from '@/src/styles/tokens';

const GOOGLE_LOGO_URI =
    'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIyLjU2IDEyLjI1YzAtLjc4LS4wNy0xLjUzLS4yLTIuMjVIMTJ2NC4yNmg1LjkyYy0uMjYgMS4zNy0xLjA0IDIuNTMtMi4yMSAzLjMxdjIuNzdoMy41N2MyLjA4LTEuOTIgMy4yOC00Ljc0IDMuMjgtOC4wOXoiIGZpbGw9IiM0Mjg1RjQiLz48cGF0aCBkPSJNMTIgMjNjMi45NyAwIDUuNDYtLjk4IDcuMjgtMi42NmwtMy41Ny0yLjc3Yy0uOTguNjYtMi4yMyAxLjA2LTMuNzEgMS4wNi0yLjg2IDAtNS4yOS0xLjkzLTYuMTYtNC41M0gyLjE4djIuODRDMy45OSAyMC41MyA3LjcgMjMgMTIgMjN6IiBmaWxsPSIjMzRBODUzIi8+PHBhdGggZD0iTTUuODQgMTQuMDljLS4yMi0uNjYtLjM1LTEuMzYtLjM1LTIuMDlzLjEzLTEuNDMuMzUtMi4wOVY3LjA3SDIuMThDMS40MyA4LjU1IDEgMTAuMjIgMSAxMnMuNDMgMy40NSAxLjE4IDQuOTNsMy42Ni0yLjg0eiIgZmlsbD0iI0ZCQkMwNSIvPjxwYXRoIGQ9Ik0xMiA1LjM4YzEuNjIgMCAzLjA2LjU2IDQuMjEgMS42NGwzLjE1LTMuMTVDMTcuNDUgMi4wOSAxNC45NyAxIDEyIDEgNy43IDEgMy45OSAzLjQ3IDIuMTggNy4wN2wzLjY2IDIuODRjLjg3LTIuNiAzLjMtNC41MyA2LjE2LTQuNTN6IiBmaWxsPSIjRUE0MzM1Ii8+PC9zdmc+';

export default function SignInScreen(): React.JSX.Element {
    const { signIn, loading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;
        try {
            await signIn({ email, password });
            router.replace('/(tabs)');
        } catch (error) {
            // Lỗi đã được catch ở authStore
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.sScroll}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles.s4Top}>
                    <LinearGradient
                        colors={['#0F766E', '#14B8A6']}
                        style={styles.s4Logo}
                    >
                        <Feather name='activity' size={28} color='#fff' />
                    </LinearGradient>
                    <Text style={styles.s4App}>HomeMedAI</Text>
                    <Text style={styles.s4Title}>
                        Bắt đầu hành trình{'\n'}
                        <Text style={{ color: colors.primary }}>
                            chăm sóc
                        </Text>{' '}
                        sức khoẻ
                    </Text>
                    <Text style={styles.s4Sub}>
                        Tạo tài khoản hoặc đăng nhập để tiếp tục
                    </Text>
                </View>

                {/* TABS */}
                <View style={styles.authTabs}>
                    <Pressable style={[styles.authTab, styles.authTabActive]}>
                        <Text
                            style={[
                                styles.authTabText,
                                styles.authTabActiveText,
                            ]}
                        >
                            Đăng nhập
                        </Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            styles.authTab,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => router.push('/register')}
                    >
                        <Text style={styles.authTabText}>Đăng ký</Text>
                    </Pressable>
                </View>

                <View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons
                                name='mail-outline'
                                size={16}
                                color={colors.text3}
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                style={styles.textInput}
                                placeholder='example@email.com'
                                placeholderTextColor={colors.text3}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType='email-address'
                                autoCapitalize='none'
                                editable={!loading}
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Mật khẩu</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons
                                name='lock-closed-outline'
                                size={16}
                                color={colors.text3}
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Nhập mật khẩu'
                                placeholderTextColor={colors.text3}
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry={!showPassword}
                                editable={!loading}
                            />
                            <Pressable
                                style={({ pressed }) =>
                                    pressed && { opacity: 0.6 }
                                }
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Ionicons
                                    name={
                                        showPassword
                                            ? 'eye-off-outline'
                                            : 'eye-outline'
                                    }
                                    size={18}
                                    color={colors.text3}
                                />
                            </Pressable>
                        </View>
                    </View>
                    <Pressable
                        style={({ pressed }) => [
                            styles.forgot,
                            pressed && { opacity: 0.7 },
                        ]}
                    >
                        <Text style={styles.forgotText}>Quên mật khẩu?</Text>
                    </Pressable>
                </View>
            </ScrollView>

            <View style={styles.sBtn}>
                <Pressable
                    style={({ pressed }) => [
                        shared.btnFilled,
                        {
                            backgroundColor: colors.primary,
                            shadowColor: colors.primary,
                            opacity: loading ? 0.7 : 1,
                        },
                        pressed && shared.pressed,
                    ]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    <Ionicons
                        name='log-in-outline'
                        size={16}
                        color='#fff'
                        style={{ marginRight: 8 }}
                    />
                    <Text style={shared.btnFilledText}>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Text>
                </Pressable>
                <View style={styles.orRow}>
                    <View style={styles.orLine} />
                    <Text style={styles.orText}>hoặc tiếp tục với</Text>
                    <View style={styles.orLine} />
                </View>
                <View style={styles.socialRow}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.btnGoogle,
                            pressed && shared.pressed,
                        ]}
                    >
                        <Image
                            source={{ uri: GOOGLE_LOGO_URI }}
                            style={styles.googleLogo}
                            contentFit='contain'
                        />
                        <Text style={styles.btnSocialLabel}>
                            Tiếp tục với Google
                        </Text>
                    </Pressable>
                </View>
                <View style={styles.trustRow}>
                    <View style={styles.trustItem}>
                        <Ionicons
                            name='lock-closed-outline'
                            size={12}
                            color={colors.text3}
                        />
                        <Text style={styles.trustText}>SSL bảo mật</Text>
                    </View>
                    <View style={styles.trustItem}>
                        <Ionicons
                            name='shield-outline'
                            size={12}
                            color={colors.text3}
                        />
                        <Text style={styles.trustText}>
                            Không chia sẻ dữ liệu
                        </Text>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}
