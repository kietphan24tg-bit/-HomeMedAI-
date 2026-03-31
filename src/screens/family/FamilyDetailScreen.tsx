import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
import {
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scale, scaleFont, verticalScale } from '@/src/styles/responsive';
import { shared } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';
import type { FamilyGroup } from '@/src/types/family';
import { MemberRow, SectionLabel } from './familyShared';
import { styles } from './styles';

export default function FamilyDetailScreen({
    family,
}: {
    family: FamilyGroup;
}): React.JSX.Element {
    return (
        <SafeAreaView style={styles.container}>
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
                <LinearGradient
                    colors={
                        family.gradientColors as LinearGradientProps['colors']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.detailHero}
                >
                    <Pressable
                        style={styles.backBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons name='chevron-back' size={14} color='#fff' />
                        <Text style={styles.backBtnText}>Gia đình</Text>
                    </Pressable>

                    <View style={localStyles.heroActionRow}>
                        <Pressable
                            style={localStyles.medicineBtn}
                            onPress={() =>
                                router.push(
                                    `/(tabs)/family/${family.id}/medicine`,
                                )
                            }
                        >
                            <Ionicons
                                name='medkit-outline'
                                size={14}
                                color='#fff'
                            />
                            <Text style={localStyles.medicineBtnText}>
                                Tủ thuốc gia đình
                            </Text>
                        </Pressable>
                    </View>

                    <View style={styles.detailHeroContent}>
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
                            {family.members.slice(0, 3).map((member, index) => (
                                <LinearGradient
                                    key={member.id}
                                    colors={
                                        member.gradientColors as LinearGradientProps['colors']
                                    }
                                    style={[
                                        styles.dav,
                                        index === 0 ? styles.davFirst : null,
                                    ]}
                                >
                                    <Text style={styles.davText}>
                                        {member.initials}
                                    </Text>
                                </LinearGradient>
                            ))}
                        </View>
                        <View style={styles.detailInfo}>
                            <Text style={styles.detailName}>{family.name}</Text>
                            <Text style={styles.detailSub}>
                                {family.memberCount} thành viên · Tạo{' '}
                                {family.createdDate}
                            </Text>
                        </View>
                    </View>
                </LinearGradient>

                <SectionLabel title='Thành viên' />

                <View style={shared.cardBlock}>
                    {family.members.map((member, index) => (
                        <MemberRow
                            key={member.id}
                            member={member}
                            isLast={index === family.members.length - 1}
                            onPress={() =>
                                router.push(
                                    `/(tabs)/family/${family.id}/member/${member.id}`,
                                )
                            }
                        />
                    ))}
                    <Pressable
                        style={[
                            styles.addMrow,
                            family.members.length === 0
                                ? { borderTopWidth: 0 }
                                : {
                                      borderTopWidth: 1,
                                      borderTopColor: colors.border,
                                  },
                        ]}
                        onPress={() =>
                            router.push(
                                `/(tabs)/family/${family.id}/add-member`,
                            )
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
            </ScrollView>
        </SafeAreaView>
    );
}

const localStyles = StyleSheet.create({
    heroActionRow: {
        position: 'absolute',
        top: verticalScale(46),
        right: scale(20),
    },
    medicineBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        backgroundColor: 'rgba(255,255,255,0.16)',
        borderRadius: 999,
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(8),
    },
    medicineBtnText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: '#fff',
    },
});
