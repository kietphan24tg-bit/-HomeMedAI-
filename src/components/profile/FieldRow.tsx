import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, View, type TextStyle } from 'react-native';
import { styles } from '../../screens/profile/styles';

interface FieldRowProps {
    label: string;
    value: string;
    badge?: string;
    valueStyle?: TextStyle;
    iconName: string;
    iconColor: string;
    iconBg: string;
    isLast?: boolean;
    onPress?: () => void;
    onIconPress?: () => void;
}

export default function FieldRow({
    label,
    value,
    badge,
    valueStyle,
    iconName,
    iconColor,
    iconBg,
    isLast,
    onPress,
    onIconPress,
}: FieldRowProps): React.JSX.Element {
    return (
        <Pressable
            style={[styles.fieldRow, isLast && { borderBottomWidth: 0 }]}
            onPress={onPress}
        >
            <View style={[styles.fIcon, { backgroundColor: iconBg }]}>
                <Ionicons name={iconName as any} size={16} color={iconColor} />
            </View>
            <View style={styles.fBody}>
                <Text style={styles.fLabel}>{label}</Text>
                <Text style={[styles.fValue, valueStyle]}>{value}</Text>
            </View>
            <Pressable style={styles.fRight} onPress={onIconPress || onPress}>
                {badge && <Text style={styles.fBadge}>{badge}</Text>}
                <Text style={styles.chevron}>›</Text>
            </Pressable>
        </Pressable>
    );
}
