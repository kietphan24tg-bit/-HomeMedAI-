import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { colors } from '@/src/styles/tokens';
import { authStyles as s, type RegisterFormProps } from './authStyles';

export default function RegisterForm({
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
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
            <View style={s.inputGroup}>
                <Text style={s.inputLabel}>EMAIL</Text>
                <View style={[s.inputWrap, errors.email && s.inputWrapError]}>
                    <View style={s.inputIcon}>
                        <Ionicons
                            name='mail-outline'
                            size={18}
                            color={errors.email ? colors.danger : colors.text3}
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
                {errors.email ? (
                    <Text style={s.errorText}>{errors.email}</Text>
                ) : null}
            </View>

            <View style={s.inputGroup}>
                <Text style={s.inputLabel}>
                    {'S\u1ED0 \u0110I\u1EC6N THO\u1EA0I'}
                </Text>
                <View
                    style={[
                        s.inputWrap,
                        errors.phoneNumber && s.inputWrapError,
                    ]}
                >
                    <View style={s.phonePrefix}>
                        <Text style={s.phoneFlag}>
                            {'\uD83C\uDDFB\uD83C\uDDF3'}
                        </Text>
                        <Text style={s.phonePrefixText}>+84</Text>
                    </View>
                    <TextInput
                        style={s.textInput}
                        placeholder='0901234567'
                        placeholderTextColor={colors.text3}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType='phone-pad'
                        editable={!loading}
                        maxLength={12}
                    />
                </View>
                {errors.phoneNumber ? (
                    <Text style={s.errorText}>{errors.phoneNumber}</Text>
                ) : null}
            </View>

            <View style={s.inputGroup}>
                <Text style={s.inputLabel}>{'M\u1EACT KH\u1EA8U'}</Text>
                <View
                    style={[s.inputWrap, errors.password && s.inputWrapError]}
                >
                    <View style={s.inputIcon}>
                        <Ionicons
                            name='lock-closed-outline'
                            size={18}
                            color={
                                errors.password ? colors.danger : colors.text3
                            }
                        />
                    </View>
                    <TextInput
                        style={s.textInput}
                        placeholder={'\u00CDt nh\u1EA5t 6 k\u00FD t\u1EF1'}
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
                                errors.password ? colors.danger : colors.text3
                            }
                        />
                    </Pressable>
                </View>
                {errors.password ? (
                    <Text style={s.errorText}>{errors.password}</Text>
                ) : null}
            </View>

            <View style={s.inputGroup}>
                <Text style={s.inputLabel}>
                    {'NH\u1EACP L\u1EA0I M\u1EACT KH\u1EA8U'}
                </Text>
                <View
                    style={[
                        s.inputWrap,
                        errors.confirmPassword && s.inputWrapError,
                    ]}
                >
                    <View style={s.inputIcon}>
                        <Ionicons
                            name='lock-closed-outline'
                            size={18}
                            color={
                                errors.confirmPassword
                                    ? colors.danger
                                    : colors.text3
                            }
                        />
                    </View>
                    <TextInput
                        style={s.textInput}
                        placeholder={'Nh\u1EADp l\u1EA1i m\u1EADt kh\u1EA9u'}
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
                                    ? colors.danger
                                    : colors.text3
                            }
                        />
                    </Pressable>
                </View>
                {errors.confirmPassword ? (
                    <Text style={s.errorText}>{errors.confirmPassword}</Text>
                ) : null}
            </View>

            <Pressable
                style={[
                    s.btnPrimary,
                    loading && s.btnPrimaryLoading,
                    { marginTop: 4 },
                ]}
                onPress={handleAction}
                disabled={loading}
            >
                <View style={s.btnPrimaryContent}>
                    {loading ? (
                        <ActivityIndicator size='small' color='#fff' />
                    ) : null}
                    <Text style={s.btnPrimaryText}>
                        {loading
                            ? '\u0110ang t\u1EA1o t\u00E0i kho\u1EA3n...'
                            : 'T\u1EA1o t\u00E0i kho\u1EA3n'}
                    </Text>
                </View>
            </Pressable>

            <Text style={s.termsText}>
                {
                    'B\u1EB1ng c\u00E1ch \u0111\u0103ng k\u00FD, b\u1EA1n \u0111\u1ED3ng \u00FD v\u1EDBi'
                }
                {'\n'}
                <Text style={s.termsLink}>
                    {'\u0110i\u1EC1u kho\u1EA3n d\u1ECBch v\u1EE5'}
                </Text>
                {' v\u00E0 '}
                <Text style={s.termsLink}>
                    {'Ch\u00EDnh s\u00E1ch b\u1EA3o m\u1EADt'}
                </Text>
            </Text>

            <View style={s.trustRow}>
                <View style={s.trustItem}>
                    <Ionicons
                        name='lock-closed-outline'
                        size={12}
                        color={colors.text3}
                    />
                    <Text style={s.trustText}>{'SSL b\u1EA3o m\u1EADt'}</Text>
                </View>
                <View style={s.trustItem}>
                    <Ionicons
                        name='shield-checkmark-outline'
                        size={12}
                        color={colors.text3}
                    />
                    <Text style={s.trustText}>
                        {'Kh\u00F4ng chia s\u1EBB d\u1EEF li\u1EC7u'}
                    </Text>
                </View>
            </View>
        </View>
    );
}
