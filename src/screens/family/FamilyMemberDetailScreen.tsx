import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient, type LinearGradientProps } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StatusBar, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { shared } from '@/src/styles/shared';
import { colors } from '@/src/styles/tokens';
import type { FamilyGroup, FamilyMember } from '@/src/types/family';
import { ActionRow, ProfileRow, SectionLabel, bmiValue } from './familyShared';
import { styles } from './styles';

type MemberTab = 'info' | 'health';

export default function FamilyMemberDetailScreen({
    family,
    member,
}: {
    family: FamilyGroup;
    member: FamilyMember;
}): React.JSX.Element {
    const [memberTab, setMemberTab] = useState<MemberTab>('info');
    const bmi = bmiValue(member.height, member.weight);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            <View style={styles.memberHeader}>
                <View style={styles.memberHeaderTop}>
                    <Pressable
                        style={styles.memberBackBtn}
                        onPress={() => router.back()}
                    >
                        <Ionicons
                            name='chevron-back'
                            size={16}
                            color={colors.primary}
                        />
                        <Text style={styles.memberBackText}>{family.name}</Text>
                    </Pressable>
                </View>

                <View style={{ flexDirection: 'row', gap: 14 }}>
                    <LinearGradient
                        colors={
                            member.gradientColors as LinearGradientProps['colors']
                        }
                        style={styles.memberAv}
                    >
                        <Text style={styles.memberAvText}>
                            {member.initials}
                        </Text>
                    </LinearGradient>

                    <View style={{ flex: 1, justifyContent: 'center' }}>
                        <Text style={styles.memberName}>{member.name}</Text>
                        <Text style={styles.memberMeta}>
                            {member.age} tuổi · {member.gender} · {member.city}
                        </Text>
                        <Text
                            style={[
                                styles.roleBadge,
                                {
                                    backgroundColor: '#F5F3FF',
                                    color: '#7C3AED',
                                },
                            ]}
                        >
                            {member.role}
                        </Text>
                    </View>
                </View>
            </View>

            <View style={styles.tabBar}>
                <Pressable
                    style={[
                        styles.tab,
                        memberTab === 'info' ? styles.tabActive : null,
                    ]}
                    onPress={() => setMemberTab('info')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            memberTab === 'info' ? styles.tabTextActive : null,
                        ]}
                    >
                        Thông tin cá nhân
                    </Text>
                </Pressable>
                <Pressable
                    style={[
                        styles.tab,
                        memberTab === 'health' ? styles.tabActive : null,
                    ]}
                    onPress={() => setMemberTab('health')}
                >
                    <Text
                        style={[
                            styles.tabText,
                            memberTab === 'health'
                                ? styles.tabTextActive
                                : null,
                        ]}
                    >
                        Sức khỏe
                    </Text>
                </Pressable>
            </View>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: 14 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {memberTab === 'info' ? (
                    <>
                        <SectionLabel title='Thông tin cá nhân' />
                        <View style={shared.cardBlock}>
                            <ProfileRow
                                icon='calendar-outline'
                                color={colors.primary}
                                bg='#EFF6FF'
                                label='Ngày sinh'
                                value={member.dob ?? '--'}
                            />
                            <ProfileRow
                                icon='person-outline'
                                color='#8B5CF6'
                                bg='#F5F3FF'
                                label='Giới tính'
                                value={member.gender}
                            />
                            <ProfileRow
                                icon='resize-outline'
                                color='#22C55E'
                                bg='#F0FDF4'
                                label='Chiều cao'
                                value={`${member.height ?? '--'} cm`}
                            />
                            <ProfileRow
                                icon='barbell-outline'
                                color='#0D9488'
                                bg='#F0FDFA'
                                label='Cân nặng'
                                value={`${member.weight ?? '--'} kg`}
                                badge={`BMI ${bmi.toFixed(1)}`}
                            />
                            <ProfileRow
                                icon='location-outline'
                                color='#F59E0B'
                                bg='#FFFBEB'
                                label='Địa chỉ'
                                value={member.address ?? 'Chưa cập nhật'}
                                isLast
                            />
                        </View>
                    </>
                ) : (
                    <>
                        <SectionLabel title='Tổng quan sức khỏe' />
                        <View style={shared.cardBlock}>
                            <ProfileRow
                                icon='water-outline'
                                color='#DC2626'
                                bg='#FEF2F2'
                                label='Nhóm máu'
                                value={member.bloodType ?? 'Chưa có'}
                            />
                            <ProfileRow
                                icon='warning-outline'
                                color='#D97706'
                                bg='#FFFBEB'
                                label='Bệnh nền'
                                value={member.chronicIllness ?? 'Chưa ghi nhận'}
                            />
                            <ProfileRow
                                icon='alert-circle-outline'
                                color='#E11D48'
                                bg='#FFF1F2'
                                label='Dị ứng'
                                value={member.allergies ?? 'Chưa ghi nhận'}
                                isLast
                            />
                        </View>

                        <SectionLabel title='Hồ sơ y tế' />
                        <View style={shared.cardBlock}>
                            <ActionRow
                                icon='document-text-outline'
                                color={colors.primary}
                                bg='#EFF6FF'
                                title={`${member.recordCount ?? 0} hồ sơ khám`}
                                subtitle='Lịch sử khám và kết quả xét nghiệm'
                            />
                            <ActionRow
                                icon='shield-checkmark-outline'
                                color='#16A34A'
                                bg='#F0FDF4'
                                title={`${member.vaccineDoseCount ?? 0}/${member.vaccineTotalCount ?? 0} mũi vaccine`}
                                subtitle='Tiến độ tiêm chủng hiện tại'
                                isLast
                            />
                        </View>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}
