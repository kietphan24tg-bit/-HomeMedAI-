import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { HapticTab } from '@/src/components/HapticTab';
import { IconSymbol } from '@/src/components/ui/IconSymbol';
import { colors } from '@/src/styles/tokens';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.text3,
                tabBarShowLabel: true,
                tabBarStyle: {
                    height: 78,
                    paddingBottom: 16,
                    paddingTop: 8,
                    backgroundColor: colors.card,
                    borderTopColor: colors.border,
                },
            }}
        >
            <Tabs.Screen
                name='index'
                options={{
                    title: 'Trang chủ',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={24} name='house.fill' color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='family'
                options={{
                    title: 'Gia đình',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol
                            size={24}
                            name='person.2.fill'
                            color={color}
                        />
                    ),
                }}
            />
            <Tabs.Screen
                name='profile'
                options={{
                    title: '',
                    tabBarIcon: () => (
                        <View style={raisedStyles.wrap}>
                            <LinearGradient
                                colors={['#2563EB', '#14B8A6']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={raisedStyles.btn}
                            >
                                <MaterialIcons
                                    name='note-add'
                                    size={22}
                                    color='#fff'
                                />
                            </LinearGradient>
                            <Text style={raisedStyles.label}>Hồ sơ</Text>
                        </View>
                    ),
                }}
            />
            <Tabs.Screen
                name='dictionary'
                options={{
                    title: 'Từ điển',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={24} name='book.fill' color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name='health'
                options={{
                    title: 'Sức khoẻ',
                    tabBarIcon: ({ color }) => (
                        <IconSymbol size={24} name='heart.fill' color={color} />
                    ),
                }}
            />
            <Tabs.Screen name='explore' options={{ href: null }} />
        </Tabs>
    );
}

const raisedStyles = StyleSheet.create({
    wrap: {
        alignItems: 'center',
        marginTop: -16,
        gap: 4,
    },
    btn: {
        width: 50,
        height: 50,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
        borderColor: colors.card,
        shadowColor: '#2563EB',
        shadowOpacity: 0.32,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    label: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.primary,
    },
});
