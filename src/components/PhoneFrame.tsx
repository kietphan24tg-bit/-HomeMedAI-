// src/components/PhoneFrame.tsx
import React, { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { colors, radius } from '../styles/tokens';

interface PhoneFrameProps {
    children: ReactNode;
    background?: string;
    scroll?: boolean;
}

export default function PhoneFrame({
    children,
    background = colors.bg,
    scroll = true,
}: PhoneFrameProps) {
    const Content = scroll ? ScrollView : View;

    return (
        <View style={styles.root}>
            <View style={[styles.phone, { backgroundColor: background }]}>
                <Content
                    style={{ flex: 1 }}
                    contentContainerStyle={
                        scroll ? styles.contentContainer : undefined
                    }
                    showsVerticalScrollIndicator={false}
                >
                    {children}
                </Content>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#D4DCE8',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: 24,
    },
    phone: {
        width: 390,
        height: 844,
        borderRadius: radius.phone,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
    },
    contentContainer: {
        paddingBottom: 90,
    },
});
