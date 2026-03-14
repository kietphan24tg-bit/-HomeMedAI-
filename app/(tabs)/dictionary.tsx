import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/src/styles/tokens';

export default function DictionaryRoute() {
    return (
        <View style={styles.container}>
            <Text style={styles.icon}>📖</Text>
            <Text style={styles.title}>Từ điển y khoa</Text>
            <Text style={styles.subtitle}>Tính năng đang phát triển</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bg,
    },
    icon: {
        fontSize: 48,
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.text2,
        marginTop: 8,
    },
});
