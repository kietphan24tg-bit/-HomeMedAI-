import { router } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, StatusBar, Text, View } from 'react-native';
import { shared } from '@/src/styles/shared';
import { colors } from '@/src/styles/tokens';

export default function MemberHistoryIndexRoute() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
            <StatusBar barStyle='dark-content' backgroundColor={colors.bg} />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
                showsVerticalScrollIndicator={false}
            >
                <View style={shared.cardBlock}>
                    <Text style={{ color: colors.text, fontWeight: '700' }}>
                        Lịch sử y tế
                    </Text>
                    <Text style={{ color: colors.text2, marginTop: 6 }}>
                        Chọn mục ở tab “Lịch sử” trong hồ sơ thành viên để xem
                        chi tiết.
                    </Text>
                    <Text
                        onPress={() => router.back()}
                        style={{
                            color: colors.primary,
                            marginTop: 12,
                            fontWeight: '600',
                        }}
                    >
                        Quay lại
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
