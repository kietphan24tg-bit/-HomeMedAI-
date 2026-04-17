import Ionicons from '@expo/vector-icons/Ionicons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { shared } from '@/src/styles/shared';
import { colors, gradients } from '@/src/styles/tokens';
import { styles } from '../styles';

export default function HomeTopBar({
    onOpenNotifications,
    displayName = 'Người dùng',
    initials = 'ND',
}: {
    onOpenNotifications: () => void;
    displayName?: string;
    initials?: string;
}): React.JSX.Element {
    return (
        <View style={styles.topbar}>
            <Pressable style={styles.avatarWrap}>
                <LinearGradient
                    colors={gradients.brandDuo}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                >
                    <Text style={styles.avatarText}>{initials}</Text>
                </LinearGradient>
                <View>
                    <Text style={styles.avatarName} numberOfLines={1}>
                        {displayName}
                    </Text>
                </View>
            </Pressable>
            <View style={styles.topbarIcons}>
                <Pressable style={shared.iconBtn} onPress={onOpenNotifications}>
                    <Ionicons
                        name='notifications-outline'
                        size={17}
                        color={colors.text2}
                    />
                    <View style={styles.notifDot} />
                </Pressable>
                <Pressable style={shared.iconBtn}>
                    <Ionicons
                        name='search-outline'
                        size={17}
                        color={colors.text2}
                    />
                </Pressable>
            </View>
        </View>
    );
}
