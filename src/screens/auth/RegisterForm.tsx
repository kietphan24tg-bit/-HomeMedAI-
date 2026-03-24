import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { shared } from '@/src/styles/shared';
import { colors } from '@/src/styles/tokens';
import { authStyles as s, type RegisterFormProps } from './authStyles';

export default function RegisterForm({
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    confirmPassword,
    setConfirmPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    loading,
    handleAction,
    errors,
}: RegisterFormProps): React.JSX.Element {
    return (
        <View>
            {/* Email */}
            <View style={s.inputGroup}>
                <Text style={s.inputLabel}>EMAIL</Text>
                <View style={[s.inputWrap, errors.email && s.inputWrapError]}>
                    <View style={s.inputIcon}>
                        <Ionicons
                            name='mail-outline'
                            size={16}
                            color={errors.email ? colors.cDanger : colors.text3}
                        />
                    </View>
                    <TextInput
                        style={s.textInput}
                        placeholder='example@email.com'
                        placeholderTextColor={colors.text3}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType='email-address'
                        autoCapitalize='none'
                        editable={!loading}
                    />
                </View>
                {errors.email && (
                    <Text style={s.errorText}>{errors.email}</Text>
                )}
            </View>

            {/* Mật khẩu */}
            <View style={s.inputGroup}>
                <Text style={s.inputLabel}>MẬT KHẨU</Text>
                <View
                    style={[s.inputWrap, errors.password && s.inputWrapError]}
                >
                    <View style={s.inputIcon}>
                        <Ionicons
                            name='lock-closed-outline'
                            size={16}
                            color={
                                errors.password ? colors.cDanger : colors.text3
                            }
                        />
                    </View>
                    <TextInput
                        style={s.textInput}
                        placeholder='Ít nhất 6 ký tự'
                        placeholderTextColor={colors.text3}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!showPassword}
                        editable={!loading}
                    />
                    <Pressable
                        onPress={() => setShowPassword(!showPassword)}
                        hitSlop={8}
                    >
                        <Ionicons
                            name={
                                showPassword ? 'eye-off-outline' : 'eye-outline'
                            }
                            size={18}
                            color={
                                errors.password ? colors.cDanger : colors.text3
                            }
                        />
                    </Pressable>
                </View>
                {errors.password && (
                    <Text style={s.errorText}>{errors.password}</Text>
                )}
            </View>

            {/* Nhập lại mật khẩu */}
            <View style={s.inputGroup}>
                <Text style={s.inputLabel}>NHẬP LẠI MẬT KHẨU</Text>
                <View
                    style={[
                        s.inputWrap,
                        errors.confirmPassword && s.inputWrapError,
                    ]}
                >
                    <View style={s.inputIcon}>
                        <Ionicons
                            name='lock-closed-outline'
                            size={16}
                            color={
                                errors.confirmPassword
                                    ? colors.cDanger
                                    : colors.text3
                            }
                        />
                    </View>
                    <TextInput
                        style={s.textInput}
                        placeholder='Nhập lại mật khẩu'
                        placeholderTextColor={colors.text3}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry={!showConfirmPassword}
                        editable={!loading}
                    />
                    <Pressable
                        onPress={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                        }
                        hitSlop={8}
                    >
                        <Ionicons
                            name={
                                showConfirmPassword
                                    ? 'eye-off-outline'
                                    : 'eye-outline'
                            }
                            size={18}
                            color={
                                errors.confirmPassword
                                    ? colors.cDanger
                                    : colors.text3
                            }
                        />
                    </Pressable>
                </View>
                {errors.confirmPassword && (
                    <Text style={s.errorText}>{errors.confirmPassword}</Text>
                )}
            </View>

            {/* Nút Tạo tài khoản */}
            <Pressable
                style={({ pressed }) => [pressed && shared.pressed]}
                onPress={handleAction}
                disabled={loading}
            >
                <LinearGradient
                    colors={
                        loading
                            ? ['rgba(37,99,235,0.7)', 'rgba(29,78,216,0.7)']
                            : ['#2563EB', '#1D4ED8']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[s.btnPrimary, { marginTop: 4 }]}
                >
                    {loading ? (
                        <ActivityIndicator
                            size='small'
                            color='#fff'
                            style={{ marginRight: 8 }}
                        />
                    ) : null}
                    <Text style={s.btnPrimaryText}>
                        {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
                    </Text>
                </LinearGradient>
            </Pressable>

            {/* Terms */}
            <Text style={s.termsText}>
                Bằng cách đăng ký, bạn đồng ý với{'\n'}
                <Text style={s.termsLink}>Điều khoản dịch vụ</Text> và{' '}
                <Text style={s.termsLink}>Chính sách bảo mật</Text>
            </Text>

            {/* Trust */}
            <View style={s.trustRow}>
                <View style={s.trustItem}>
                    <Ionicons
                        name='lock-closed-outline'
                        size={12}
                        color={colors.text3}
                    />
                    <Text style={s.trustText}>SSL bảo mật</Text>
                </View>
                <View style={s.trustItem}>
                    <Ionicons
                        name='shield-checkmark-outline'
                        size={12}
                        color={colors.text3}
                    />
                    <Text style={s.trustText}>Không chia sẻ dữ liệu</Text>
                </View>
            </View>
        </View>
    );
}
