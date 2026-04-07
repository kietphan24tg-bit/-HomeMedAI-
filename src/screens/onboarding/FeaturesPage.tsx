import { Feather, Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { styles } from './styles';
import { FEATURES } from '../../data/onboarding-data';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';

interface Props {
    width: number;
    goTo: (page: number) => void;
    renderDots: () => React.JSX.Element;
}

export default function FeaturesPage({
    width,
    goTo,
    renderDots,
}: Props): React.JSX.Element {
    return (
        <View style={[styles.page, { width }]}>
            {renderDots()}
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={styles.sScroll}
                showsVerticalScrollIndicator={false}
            >
                <View
                    style={[
                        shared.inlineBadge,
                        { backgroundColor: colors.secondaryBg },
                    ]}
                >
                    <Ionicons
                        name='star-outline'
                        size={11}
                        color={colors.secondary}
                    />
                    <Text
                        style={[
                            shared.inlineBadgeText,
                            { color: colors.secondary },
                        ]}
                    >
                        Tính năng nổi bật
                    </Text>
                </View>
                <Text style={styles.s2Title}>
                    Đầy đủ công cụ,{'\n'}
                    <Text style={{ color: colors.secondary }}>
                        trọn vẹn
                    </Text>{' '}
                    chăm sóc
                </Text>
                <Text style={styles.s2Desc}>
                    Từ hồ sơ bệnh án đến lịch tiêm chủng — HomeMedAI giúp bạn
                    không bỏ lỡ điều quan trọng nào.
                </Text>
                <View style={styles.featList}>
                    {FEATURES.map((f) => (
                        <View key={f.title} style={styles.featCard}>
                            <View
                                style={[
                                    styles.featIcon,
                                    { backgroundColor: f.bg },
                                ]}
                            >
                                {f.iconComponent}
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.featName}>{f.title}</Text>
                                <Text style={styles.featDesc}>{f.desc}</Text>
                            </View>
                            <Text style={styles.featArrow}>›</Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
            <View style={styles.sBtn}>
                <Pressable
                    style={({ pressed }) => [
                        styles.onboardPrimaryBtn,
                        pressed && shared.pressed,
                    ]}
                    onPress={() => goTo(2)}
                >
                    <View style={styles.onboardPrimaryBtnContent}>
                        <Text style={styles.onboardPrimaryBtnText}>
                            Tiếp theo
                        </Text>
                        <Feather name='arrow-right' size={16} color='#fff' />
                    </View>
                </Pressable>
            </View>
        </View>
    );
}
