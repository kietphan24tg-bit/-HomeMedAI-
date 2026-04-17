import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { HomeMode } from '../home.types';
import { styles } from '../styles';

function greetingByHour() {
    const hour = new Date().getHours();
    if (hour < 11) return 'Chào buổi sáng';
    if (hour < 14) return 'Chào buổi trưa';
    if (hour < 18) return 'Chào buổi chiều';
    return 'Chào buổi tối';
}

export default function HomeHero({
    mode,
    displayName,
    selectedFamilyName,
    onSelectPersonal,
    onSelectFamily,
}: {
    mode: HomeMode;
    displayName: string;
    selectedFamilyName?: string | null;
    onSelectPersonal: () => void;
    onSelectFamily: () => void;
}): React.JSX.Element {
    const shortName =
        displayName.trim().split(/\s+/).slice(-1)[0] || displayName;
    const familyName = selectedFamilyName ?? 'gia đình';

    return (
        <View style={styles.hero}>
            <View style={styles.heroGradient}>
                <View style={styles.heroDeco}>
                    <Ionicons name='pulse' size={52} color='#fff' />
                </View>
                <View style={styles.heroGlowLg} />
                <View style={styles.heroGlowSm} />
                <Text style={styles.heroGreeting}>
                    {mode === 'family'
                        ? `Đang xem ${familyName}`
                        : `${greetingByHour()}, ${shortName}`}
                </Text>
                <Text style={styles.heroTitle}>
                    {mode === 'family'
                        ? 'Chăm sóc sức khỏe'
                        : 'Chăm sóc sức khỏe'}
                    {'\n'}
                    <Text style={styles.heroTitleHighlight}>
                        {mode === 'family' ? 'cả gia đình' : 'mỗi ngày'}
                    </Text>
                </Text>
                <View style={styles.modeToggle}>
                    <Pressable
                        style={[
                            styles.modeBtn,
                            mode === 'personal' && styles.modeBtnActive,
                        ]}
                        onPress={onSelectPersonal}
                    >
                        <Text
                            style={[
                                styles.modeTxt,
                                mode === 'personal' && styles.modeTxtActive,
                            ]}
                        >
                            Cá nhân
                        </Text>
                    </Pressable>
                    <Pressable
                        style={[
                            styles.modeBtn,
                            mode === 'family' && styles.modeBtnActive,
                        ]}
                        onPress={onSelectFamily}
                    >
                        <Text
                            style={[
                                styles.modeTxt,
                                mode === 'family' && styles.modeTxtActive,
                            ]}
                        >
                            Gia đình
                        </Text>
                    </Pressable>
                </View>
            </View>
        </View>
    );
}
