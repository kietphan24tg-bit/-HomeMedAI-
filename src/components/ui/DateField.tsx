import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../styles/tokens';

function formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

interface DateFieldProps {
    value: Date;
    onChange: (date: Date) => void;
    /** Custom style override for the outer container */
    containerStyle?: object;
}

export function DateField({ value, onChange, containerStyle }: DateFieldProps) {
    const [showPicker, setShowPicker] = useState(false);

    const handleChange = useCallback(
        (_event: DateTimePickerEvent, selectedDate?: Date) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (selectedDate) onChange(selectedDate);
        },
        [onChange],
    );

    const closePicker = useCallback(() => setShowPicker(false), []);

    return (
        <View style={containerStyle}>
            <Pressable style={s.fieldRow} onPress={() => setShowPicker(true)}>
                <Text style={s.fieldText}>{formatDate(value)}</Text>
                <Ionicons
                    name='calendar-outline'
                    size={16}
                    color={colors.text3}
                />
            </Pressable>

            {showPicker &&
                (Platform.OS === 'ios' ? (
                    <View style={s.iosWrap}>
                        <View style={s.iosBar}>
                            <Pressable onPress={closePicker}>
                                <Text style={s.iosDone}>Xong</Text>
                            </Pressable>
                        </View>
                        <DateTimePicker
                            value={value}
                            mode='date'
                            display='spinner'
                            onChange={handleChange}
                        />
                    </View>
                ) : (
                    <DateTimePicker
                        value={value}
                        mode='date'
                        display='default'
                        onChange={handleChange}
                    />
                ))}
        </View>
    );
}

const s = StyleSheet.create({
    fieldRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.bg,
        borderWidth: 1.5,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    fieldText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    iosWrap: {
        backgroundColor: colors.card,
        borderRadius: 12,
        marginTop: 6,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    iosBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iosDone: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.primary,
    },
});
