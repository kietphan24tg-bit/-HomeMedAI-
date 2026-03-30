import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FAMILIES } from '@/src/data/family-data';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import {
    CreateFamilyModal,
    INITIAL_INVITES,
    SectionLabel,
} from './familyShared';
import { styles } from './styles';

export default function FamilyListScreen(): React.JSX.Element {
    const [showCreateSheet, setShowCreateSheet] = useState(false);
    const [familyName, setFamilyName] = useState('');
    const [familyAddress, setFamilyAddress] = useState('');

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.statusTopSpacer} />

                <View style={styles.topbar}>
                    <Text style={styles.topbarTitle}>Gia đình</Text>
                    <View style={styles.topbarRight}>
                        <Pressable
                            style={shared.iconBtn}
                            onPress={() =>
                                router.push('/(tabs)/family/invites')
                            }
                        >
                            <View>
                                <Ionicons
                                    name='mail-unread-outline'
                                    size={16}
                                    color={colors.text2}
                                />
                                {INITIAL_INVITES.length > 0 ? (
                                    <View
                                        style={{
                                            position: 'absolute',
                                            top: -7,
                                            right: -9,
                                            minWidth: 18,
                                            height: 18,
                                            paddingHorizontal: 4,
                                            borderRadius: 9,
                                            backgroundColor: '#E11D48',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderWidth: 2,
                                            borderColor: colors.bg,
                                        }}
                                    >
                                        <Text
                                            style={{
                                                color: '#fff',
                                                fontFamily:
                                                    typography.font.bold,
                                                fontSize: scaleFont(9),
                                            }}
                                        >
                                            {INITIAL_INVITES.length}
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </Pressable>
                        <Pressable
                            style={[
                                shared.iconBtn,
                                {
                                    backgroundColor: colors.primaryBg,
                                    borderColor: '#BFDBFE',
                                },
                            ]}
                        >
                            <Ionicons
                                name='grid-outline'
                                size={16}
                                color={colors.primary}
                            />
                        </Pressable>
                    </View>
                </View>

                <SectionLabel title='Gia đình của tôi' />
                {FAMILIES.map((family) => (
                    <Pressable
                        key={family.id}
                        style={styles.fcard}
                        onPress={() =>
                            router.push(`/(tabs)/family/${family.id}`)
                        }
                    >
                        <LinearGradient
                            colors={
                                family.gradientColors as LinearGradientProps['colors']
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.fcardBg}
                        >
                            <View
                                style={{
                                    position: 'absolute',
                                    top: -verticalScale(80),
                                    right: -scale(40),
                                    width: scale(200),
                                    height: scale(200),
                                    borderRadius: scale(100),
                                    backgroundColor: 'rgba(255,255,255,0.07)',
                                }}
                            />
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: -verticalScale(40),
                                    left: scale(20),
                                    width: scale(110),
                                    height: scale(110),
                                    borderRadius: scale(55),
                                    backgroundColor: 'rgba(255,255,255,0.04)',
                                }}
                            />
                            <View style={styles.fcardInner}>
                                <View style={styles.fcardIcon}>
                                    <Ionicons
                                        name={family.iconName as never}
                                        size={22}
                                        color='#fff'
                                    />
                                </View>
                                <View style={styles.fcardInfo}>
                                    <Text style={styles.fcardName}>
                                        {family.name}
                                    </Text>
                                    <Text style={styles.fcardMeta}>
                                        {family.memberCount} thành viên
                                    </Text>
                                    <Text style={styles.fcardRole}>
                                        Vai trò của bạn: {family.roleEmoji}{' '}
                                        {family.role}
                                    </Text>
                                </View>
                                <View style={styles.fcardArrow}>
                                    <Ionicons
                                        name='chevron-forward'
                                        size={14}
                                        color='#fff'
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    </Pressable>
                ))}

                <Pressable
                    style={styles.addFcard}
                    onPress={() => setShowCreateSheet(true)}
                >
                    <View style={styles.addFcardInner}>
                        <View style={styles.addFcardIc}>
                            <Ionicons
                                name='add'
                                size={18}
                                color={colors.primary}
                            />
                        </View>
                        <View>
                            <Text style={styles.addFcardTitle}>
                                Thêm gia đình
                            </Text>
                            <Text style={styles.addFcardSub}>
                                Tạo hoặc tham gia một gia đình mới
                            </Text>
                        </View>
                    </View>
                </Pressable>
            </ScrollView>

            <CreateFamilyModal
                visible={showCreateSheet}
                familyName={familyName}
                familyAddress={familyAddress}
                onChangeFamilyName={setFamilyName}
                onChangeFamilyAddress={setFamilyAddress}
                onClose={() => setShowCreateSheet(false)}
            />
        </SafeAreaView>
    );
}
