import React from 'react';
import { View } from 'react-native';
import { styles } from './styles';
import AuthScreen from '../auth/AuthScreen';

interface Props {
    width: number;
    authTab: 'login' | 'register';
    setAuthTab: (tab: 'login' | 'register') => void;
    renderDots: () => React.JSX.Element;
}

export default function AuthPage({
    width,
    authTab,
    renderDots,
}: Props): React.JSX.Element {
    return (
        <View style={[styles.page, { width }]}>
            {renderDots()}
            <AuthScreen
                initialMode={authTab === 'login' ? 'signin' : 'signup'}
                showSubtext={true}
                embedded={true}
            />
        </View>
    );
}
