import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import {
    ARTICLES,
    FAMILY,
    MEDS,
    SCHEDULE,
    STAT_CARDS,
} from '@/src/data/home-data';
import { colors } from '@/src/styles/tokens';
import { styles } from '../styles';

export function OverviewSection(): React.JSX.Element {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tổng quan</Text>
            </View>
            <View style={styles.statGrid}>
                {STAT_CARDS.map((card) => (
                    <Pressable key={card.id} style={styles.statCard}>
                        <View style={styles.statTop}>
                            <View
                                style={[
                                    styles.statIcon,
                                    { backgroundColor: card.iconBg },
                                ]}
                            >
                                <Ionicons
                                    name={card.iconName as any}
                                    size={18}
                                    color={card.iconColor}
                                />
                            </View>
                            <View
                                style={[
                                    styles.statBadge,
                                    { backgroundColor: card.badgeBg },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statBadgeText,
                                        { color: card.badgeColor },
                                    ]}
                                >
                                    {card.badgeText}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.statValueRow}>
                            <Text
                                style={[
                                    styles.statValue,
                                    card.valueColor && {
                                        color: card.valueColor,
                                    },
                                ]}
                            >
                                {card.value}
                            </Text>
                            {card.valueSuffix ? (
                                <Text
                                    style={[
                                        styles.statValueSuffix,
                                        card.valueColor && {
                                            color: card.valueColor,
                                        },
                                    ]}
                                >
                                    {card.valueSuffix}
                                </Text>
                            ) : null}
                        </View>
                        <Text style={styles.statLabel}>{card.label}</Text>
                        {card.sub ? (
                            <Text style={styles.statSub}>{card.sub}</Text>
                        ) : null}
                        {card.progress !== undefined &&
                        card.progress !== null ? (
                            <View style={styles.progWrap}>
                                <View style={styles.progTrack}>
                                    <View
                                        style={[
                                            styles.progFill,
                                            {
                                                width: `${card.progress}%`,
                                                backgroundColor:
                                                    card.progressColor,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        ) : null}
                    </Pressable>
                ))}
            </View>
        </View>
    );
}

export function FamilySection(): React.JSX.Element {
    return (
        <>
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Thành viên gia đình</Text>
                </View>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.familyScroll}
            >
                {FAMILY.map((member) => (
                    <Pressable key={member.code} style={styles.famCard}>
                        <LinearGradient
                            colors={member.gradient as [string, string]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.famAvatar}
                        >
                            <Text style={styles.famAvatarText}>
                                {member.code}
                            </Text>
                        </LinearGradient>
                        <Text style={styles.famName}>{member.name}</Text>
                        <Text style={styles.famRole}>{member.role}</Text>
                        <View
                            style={[
                                styles.famStatus,
                                { backgroundColor: member.status },
                            ]}
                        />
                    </Pressable>
                ))}
                <Pressable style={styles.addFam}>
                    <Ionicons
                        name='add-circle-outline'
                        size={22}
                        color={colors.text3}
                    />
                    <Text style={styles.addFamLabel}>Thêm</Text>
                </Pressable>
            </ScrollView>
        </>
    );
}

export function ScheduleSection(): React.JSX.Element {
    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Lịch sắp tới</Text>
            </View>
            {SCHEDULE.map((schedule) => (
                <Pressable
                    key={schedule.id}
                    style={({ hovered }: any) => [
                        styles.schedCard,
                        hovered && styles.schedCardHover,
                    ]}
                >
                    <View
                        style={[
                            styles.schedLeftStrip,
                            { backgroundColor: schedule.color },
                        ]}
                    />
                    <LinearGradient
                        colors={schedule.gradient as [string, string]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.schedAvatar}
                    >
                        <Text style={styles.schedAvatarText}>
                            {schedule.initials}
                        </Text>
                    </LinearGradient>
                    <View style={styles.schedInfo}>
                        <Text style={styles.schedTitle}>{schedule.title}</Text>
                        <Text style={styles.schedMeta}>{schedule.meta}</Text>
                    </View>
                    <View style={styles.schedTime}>
                        <Text
                            style={[
                                styles.schedTimeVal,
                                { color: schedule.color },
                            ]}
                        >
                            {schedule.time}
                        </Text>
                        <Text style={styles.schedTimeDay}>{schedule.day}</Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
}

export function MedicationSection(): React.JSX.Element {
    return (
        <View style={[styles.section, { marginTop: 24 }]}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Lịch uống thuốc</Text>
            </View>
            {MEDS.map((medication) => (
                <Pressable
                    key={medication.name}
                    style={({ hovered }: any) => [
                        styles.medCard,
                        hovered && styles.medCardHover,
                    ]}
                >
                    <View
                        style={[
                            styles.medIcon,
                            { backgroundColor: medication.bg },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name='pill'
                            size={18}
                            color={medication.iconColor}
                        />
                    </View>
                    <View style={styles.medInfo}>
                        <Text style={styles.medName}>{medication.name}</Text>
                        <Text style={styles.medDose}>{medication.info}</Text>
                    </View>
                    <Text style={styles.medTimeTag}>{medication.time}</Text>
                </Pressable>
            ))}
        </View>
    );
}

type ChatbotBannerProps = {
    onPress?: () => void;
};

export function ChatbotBanner({
    onPress,
}: ChatbotBannerProps): React.JSX.Element {
    return (
        <View style={styles.chatbotWrap}>
            <Pressable
                onPress={onPress}
                style={[
                    styles.chatbotGradient,
                    { backgroundColor: colors.primary },
                ]}
            >
                <View style={styles.chatbotIcon}>
                    <Ionicons
                        name='chatbubble-ellipses-outline'
                        size={22}
                        color='#fff'
                    />
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.chatbotTitle}>AI Tư vấn sức khỏe</Text>
                    <Text style={styles.chatbotDesc}>
                        Hỏi về triệu chứng, thuốc,{'\n'}cách chăm sóc · 24/7
                    </Text>
                </View>
                <Ionicons
                    name='chevron-forward'
                    size={20}
                    color='rgba(255,255,255,0.7)'
                />
            </Pressable>
        </View>
    );
}

export function ArticlesSection(): React.JSX.Element {
    return (
        <>
            <View style={[styles.section, { marginTop: 24 }]}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Y tế & Sức khỏe</Text>
                    <Text style={styles.seeAll}>Xem thêm</Text>
                </View>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.articlesScroll}
            >
                {ARTICLES.map((article) => (
                    <Pressable key={article.title} style={styles.articleCard}>
                        <Image
                            source={{ uri: article.image }}
                            style={styles.articleImg}
                            resizeMode='cover'
                        />
                        <View style={styles.articleBody}>
                            <Text
                                style={[
                                    styles.articleTag,
                                    {
                                        color: article.color,
                                        backgroundColor: article.bg,
                                    },
                                ]}
                            >
                                {article.tag}
                            </Text>
                            <Text style={styles.articleTitle}>
                                {article.title}
                            </Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </>
    );
}
