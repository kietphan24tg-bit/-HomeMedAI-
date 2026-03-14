import React from 'react';
import { View } from 'react-native';
import { shared } from '../../styles/shared';

interface CardBlockProps {
    children: React.ReactNode;
}

export function CardBlock({ children }: CardBlockProps): React.JSX.Element {
    return <View style={shared.cardBlock}>{children}</View>;
}
