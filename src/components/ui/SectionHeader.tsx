import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { shared } from '../../styles/shared';

interface SectionHeaderProps {
    title: string;
    action?: string;
    onAction?: () => void;
}

export function SectionHeader({
    title,
    action,
    onAction,
}: SectionHeaderProps): React.JSX.Element {
    return (
        <View style={shared.sectionHeaderOuter}>
            <Text style={shared.sectionHeaderText}>{title}</Text>
            {action && (
                <Pressable onPress={onAction}>
                    <Text style={shared.sectionHeaderAction}>{action}</Text>
                </Pressable>
            )}
        </View>
    );
}
