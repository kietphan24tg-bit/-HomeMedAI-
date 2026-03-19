import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/src/screens/onboarding/styles';
import { useAuthStore } from '@/src/stores/useAuthStore';
import { shared } from '@/src/styles/shared';
import { colors } from '@/src/styles/tokens';

export default function RegisterScreen(): React.JSX.Element {
    const { signUp, loading } = useAuthStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = async () => {
        if (!email || !password || !fullName) return;
        try {
            await signUp({ fullname: fullName, email, password });
            // Sau khi đăng ký thành công, tuỳ logic có thể redirect qua Onboarding PersonalInfo hoặc vô thẳng app
            router.replace('/(tabs)');
        } catch (error) {
            // Lỗi catch ở authStore và hiển thị qua Toast
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
                    <Pressable
                        style={({ pressed }) => [
                            styles.authTab,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => router.push('/signin')}
                    >
                        <Text style={styles.authTabText}>Đăng nhập</Text>
                    </Pressable>
                    <Pressable style={[styles.authTab, styles.authTabActive]}>
                        <Text
                            style={[
                                styles.authTabText,
                                styles.authTabActiveText,
                            ]}
                        >
                            Đăng ký
                        </Text>
                    </Pressable>
                </View>

                <View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Họ và tên</Text>
                        <View style={styles.inputWrap}>
                            <Ionicons
                                name='person-outline'
                                size={16}
                                color={colors.text3}
                                style={{ marginRight: 10 }}
                            />
                            <TextInput
                                style={styles.textInput}
                                placeholder='Nguyễn Văn An'
                                placeholderTextColor={colors.text3}
                                value={fullName}
                                onChangeText={setFullName}
                                editable={!loading}
                            />
                        </View>
                    </View>
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
                                placeholder='Ít nhất 8 ký tự'
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
                    onPress={handleRegister}
                    disabled={loading}
                >
                    <Text style={shared.btnFilledText}>
                        {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                    </Text>
                </Pressable>
                <Text style={styles.termsText}>
                    Bằng cách đăng ký, bạn đồng ý với{' '}
                    <Text style={styles.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                    <Text style={styles.termsLink}>Chính sách bảo mật</Text>
                </Text>
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
