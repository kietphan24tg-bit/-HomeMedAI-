import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { HomeMode } from '../home.types';
import { styles } from '../styles';

export default function HomeHero({
    mode,
    onSelectPersonal,
    onSelectFamily,
}: {
    mode: HomeMode;
    onSelectPersonal: () => void;
    onSelectFamily: () => void;
}): React.JSX.Element {
    return (
        <View style={styles.hero}>
            <View style={styles.heroGradient}>
                <View style={styles.heroDeco}>
                    <Ionicons name='pulse' size={52} color='#fff' />
                </View>
                <View style={styles.heroGlowLg} />
                <View style={styles.heroGlowSm} />
                <Text style={styles.heroGreeting}>
                    👋 Chào buổi sáng, Văn An
                </Text>
                <Text style={styles.heroTitle}>
                    Chăm sóc sức khỏe{'\n'}
                    <Text style={styles.heroTitleHighlight}>mỗi ngày</Text>
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
