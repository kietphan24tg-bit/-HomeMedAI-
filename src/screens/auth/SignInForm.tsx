import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { appToast } from '@/src/lib/toast';
import { colors } from '@/src/styles/tokens';
import { authStyles as s, type SignInFormProps } from './authStyles';
import { GoogleLogo } from '../../components/ui';

export default function SignInForm({
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    loading,
    handleAction,
    errors,
    onForgotPassword,
}: SignInFormProps): React.JSX.Element {
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
                        placeholder={'Nh\u1EADp m\u1EADt kh\u1EA9u'}
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

            <Pressable style={s.forgotBtn} onPress={onForgotPassword}>
                <Text style={s.forgotText}>
                    {'Qu\u00EAn m\u1EADt kh\u1EA9u?'}
                </Text>
            </Pressable>

            <Pressable
                style={[s.btnPrimary, loading && s.btnPrimaryLoading]}
                onPress={handleAction}
                disabled={loading}
            >
                <View style={s.btnPrimaryContent}>
                    {loading ? (
                        <ActivityIndicator size='small' color='#fff' />
                    ) : null}
                    <Text style={s.btnPrimaryText}>
                        {loading
                            ? '\u0110ang \u0111\u0103ng nh\u1EADp...'
                            : '\u0110\u0103ng nh\u1EADp'}
                    </Text>
                </View>
            </Pressable>

            <View style={s.orRow}>
                <View style={s.orLine} />
                <Text style={s.orText}>
                    {'ho\u1EB7c ti\u1EBFp t\u1EE5c v\u1EDBi'}
                </Text>
                <View style={s.orLine} />
            </View>

            <Pressable
                style={({ pressed }) => [
                    s.btnGoogle,
                    pressed && {
                        opacity: 0.85,
                        transform: [{ translateY: -1 }],
                    },
                ]}
                onPress={() =>
                    appToast.showInfo(
                        'Info',
                        'T\u00EDnh n\u0103ng \u0111ang ph\u00E1t tri\u1EC3n',
                    )
                }
            >
                <GoogleLogo />
                <Text style={s.btnSocialLabel}>
                    {'Ti\u1EBFp t\u1EE5c v\u1EDBi Google'}
                </Text>
            </Pressable>

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
