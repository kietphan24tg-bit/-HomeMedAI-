import React from 'react';
import { Pressable, View } from 'react-native';
import { shared } from '../../styles/shared';

interface CardBlockProps {
    children: React.ReactNode;
    onPress?: () => void;
}

export function CardBlock({
    children,
    onPress,
}: CardBlockProps): React.JSX.Element {
    if (onPress) {
        return (
            <Pressable
                style={({ pressed }) => [
                    shared.cardBlock,
                    pressed ? { opacity: 0.96 } : null,
                ]}
                onPress={onPress}
            >
                {children}
            </Pressable>
        );
    }

    return <View style={shared.cardBlock}>{children}</View>;
}
