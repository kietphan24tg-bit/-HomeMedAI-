import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { styles } from './styles';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';

const GOOGLE_LOGO_URI =
    'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTIyLjU2IDEyLjI1YzAtLjc4LS4wNy0xLjUzLS4yLTIuMjVIMTJ2NC4yNmg1LjkyYy0uMjYgMS4zNy0xLjA0IDIuNTMtMi4yMSAzLjMxdjIuNzdoMy41N2MyLjA4LTEuOTIgMy4yOC00Ljc0IDMuMjgtOC4wOXoiIGZpbGw9IiM0Mjg1RjQiLz48cGF0aCBkPSJNMTIgMjNjMi45NyAwIDUuNDYtLjk4IDcuMjgtMi42NmwtMy41Ny0yLjc3Yy0uOTguNjYtMi4yMyAxLjA2LTMuNzEgMS4wNi0yLjg2IDAtNS4yOS0xLjkzLTYuMTYtNC41M0gyLjE4djIuODRDMy45OSAyMC41MyA3LjcgMjMgMTIgMjN6IiBmaWxsPSIjMzRBODUzIi8+PHBhdGggZD0iTTUuODQgMTQuMDljLS4yMi0uNjYtLjM1LTEuMzYtLjM1LTIuMDlzLjEzLTEuNDMuMzUtMi4wOVY3LjA3SDIuMThDMS40MyA4LjU1IDEgMTAuMjIgMSAxMnMuNDMgMy40NSAxLjE4IDQuOTNsMy42Ni0yLjg0eiIgZmlsbD0iI0ZCQkMwNSIvPjxwYXRoIGQ9Ik0xMiA1LjM4YzEuNjIgMCAzLjA2LjU2IDQuMjEgMS42NGwzLjE1LTMuMTVDMTcuNDUgMi4wOSAxNC45NyAxIDEyIDEgNy43IDEgMy45OSAzLjQ3IDIuMTggNy4wN2wzLjY2IDIuODRjLjg3LTIuNiAzLjMtNC41MyA2LjE2LTQuNTN6IiBmaWxsPSIjRUE0MzM1Ii8+PC9zdmc+';

interface Props {
    width: number;
    authTab: 'login' | 'register';
    setAuthTab: (tab: 'login' | 'register') => void;
    goNext: () => void;
    renderDots: () => React.JSX.Element;
}

export default function AuthPage({
    width,
    authTab,
    setAuthTab,
    goNext,
    renderDots,
}: Props): React.JSX.Element {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View style={[styles.page, { width }]}>
            {renderDots()}
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

                <View style={styles.authTabs}>
                    <Pressable
                        style={({ pressed }) => [
                            styles.authTab,
                            authTab === 'login' && styles.authTabActive,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => setAuthTab('login')}
                    >
                        <Text
                            style={[
                                styles.authTabText,
                                authTab === 'login' && styles.authTabActiveText,
                            ]}
                        >
                            Đăng nhập
                        </Text>
                    </Pressable>
                    <Pressable
                        style={({ pressed }) => [
                            styles.authTab,
                            authTab === 'register' && styles.authTabActive,
                            pressed && { opacity: 0.7 },
                        ]}
                        onPress={() => setAuthTab('register')}
                    >
                        <Text
                            style={[
                                styles.authTabText,
                                authTab === 'register' &&
                                    styles.authTabActiveText,
                            ]}
                        >
                            Đăng ký
                        </Text>
                    </Pressable>
                </View>

                {authTab === 'login' ? (
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
                                />
                                <Pressable
                                    style={({ pressed }) =>
                                        pressed && { opacity: 0.6 }
                                    }
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
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
                            <Text style={styles.forgotText}>
                                Quên mật khẩu?
                            </Text>
                        </Pressable>
                    </View>
                ) : (
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
                                />
                                <Pressable
                                    style={({ pressed }) =>
                                        pressed && { opacity: 0.6 }
                                    }
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
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
                )}
            </ScrollView>

            <View style={styles.sBtn}>
                {authTab === 'login' ? (
                    <>
                        <Pressable
                            style={({ pressed }) => [
                                shared.btnFilled,
                                {
                                    backgroundColor: colors.primary,
                                    shadowColor: colors.primary,
                                },
                                pressed && shared.pressed,
                            ]}
                            onPress={goNext}
                        >
                            <Ionicons
                                name='log-in-outline'
                                size={16}
                                color='#fff'
                                style={{ marginRight: 8 }}
                            />
                            <Text style={shared.btnFilledText}>Đăng nhập</Text>
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
                                <Text style={styles.trustText}>
                                    SSL bảo mật
                                </Text>
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
                    </>
                ) : (
                    <>
                        <Pressable
                            style={({ pressed }) => [
                                shared.btnFilled,
                                {
                                    backgroundColor: colors.primary,
                                    shadowColor: colors.primary,
                                },
                                pressed && shared.pressed,
                            ]}
                            onPress={goNext}
                        >
                            <Text style={shared.btnFilledText}>
                                Tạo tài khoản
                            </Text>
                        </Pressable>
                        <Text style={styles.termsText}>
                            Bằng cách đăng ký, bạn đồng ý với{' '}
                            <Text style={styles.termsLink}>
                                Điều khoản dịch vụ
                            </Text>{' '}
                            và{' '}
                            <Text style={styles.termsLink}>
                                Chính sách bảo mật
                            </Text>
                        </Text>
                        <View style={styles.trustRow}>
                            <View style={styles.trustItem}>
                                <Ionicons
                                    name='lock-closed-outline'
                                    size={12}
                                    color={colors.text3}
                                />
                                <Text style={styles.trustText}>
                                    SSL bảo mật
                                </Text>
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
                    </>
                )}
            </View>
        </View>
    );
}
