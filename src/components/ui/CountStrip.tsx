import React from 'react';
import { Text, View, type TextStyle } from 'react-native';
import { shared } from '../../styles/shared';

interface CountStripProps {
    icon: React.ReactNode;
    iconBg: string;
    title: string;
    count: string;
    countStyle?: TextStyle;
}

export function CountStrip({
    icon,
    iconBg,
    title,
    count,
    countStyle,
}: CountStripProps): React.JSX.Element {
    return (
        <View style={shared.cstrip}>
            <View style={shared.cstripLeft}>
                <View style={[shared.csIcon, { backgroundColor: iconBg }]}>
                    {icon}
                </View>
                <Text style={shared.csTitle}>{title}</Text>
            </View>
            <Text style={[shared.countPill, countStyle]}>{count}</Text>
        </View>
    );
}
