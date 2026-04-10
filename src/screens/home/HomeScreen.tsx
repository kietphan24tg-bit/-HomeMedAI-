import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Animated, Dimensions, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/src/styles/tokens';
import NotificationScreen from '../health/NotificationScreen';
import FamilyPickerSheet from './components/FamilyPickerSheet';
import HomeHero from './components/HomeHero';
import {
    ArticlesSection,
    ChatbotBanner,
    FamilySection,
    MedicationSection,
    OverviewSection,
    ScheduleSection,
} from './components/HomeSections';
import HomeTopBar from './components/HomeTopBar';
import type { HomeMode } from './home.types';
import { useHomeFamilies } from './useHomeFamilies';

const { height: SCREEN_H } = Dimensions.get('window');

export default function HomeScreen(): React.JSX.Element {
    const [mode, setMode] = useState<HomeMode>('personal');
    const [pickerVisible, setPickerVisible] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
    const slideAnim = useRef(new Animated.Value(SCREEN_H)).current;
    const backdropAnim = useRef(new Animated.Value(0)).current;
    const { familyOptions, isLoading, error, refetch } = useHomeFamilies(mode);

    const openPicker = () => {
        setPickerVisible(true);
        Animated.parallel([
            Animated.timing(backdropAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                damping: 20,
                stiffness: 180,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const closePicker = (onClosed?: () => void) => {
        Animated.parallel([
            Animated.timing(backdropAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(slideAnim, {
                toValue: SCREEN_H,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPickerVisible(false);
            if (typeof onClosed === 'function') {
                onClosed();
            }
        });
    };

    const selectFamily = (id: string) => {
        setSelectedFamily(id);
        setMode('family');
        closePicker();
    };

    const navigateToFamilyTab = () => {
        closePicker(() => {
            router.push('/family');
        });
    };

    const navigateToFamilyInvites = () => {
        closePicker(() => {
            router.push('/family/invites');
        });
    };

    if (showNotifications) {
        return (
            <NotificationScreen onClose={() => setShowNotifications(false)} />
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />

            <HomeTopBar
                onOpenNotifications={() => setShowNotifications(true)}
            />

            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 24 }}
                showsVerticalScrollIndicator={false}
            >
                <HomeHero
                    mode={mode}
                    onSelectPersonal={() => setMode('personal')}
                    onSelectFamily={openPicker}
                />
                <OverviewSection />
                <FamilySection />
                <ScheduleSection />
                <MedicationSection />
                <ChatbotBanner onPress={() => router.push('/explore')} />
                <ArticlesSection />
            </ScrollView>

            <FamilyPickerSheet
                visible={pickerVisible}
                backdropAnim={backdropAnim}
                slideAnim={slideAnim}
                selectedFamily={selectedFamily}
                familyOptions={familyOptions}
                isLoading={isLoading}
                error={error}
                onClose={closePicker}
                onSelectFamily={selectFamily}
                onRetry={refetch}
                onCreateFamily={navigateToFamilyTab}
                onViewInvites={navigateToFamilyInvites}
            />
        </SafeAreaView>
    );
}
