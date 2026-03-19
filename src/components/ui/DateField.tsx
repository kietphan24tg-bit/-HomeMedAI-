import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker, {
    type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import {
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '../../styles/responsive';
import { colors } from '../../styles/tokens';

function formatDate(d: Date): string {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
}

function formatTime(d: Date): string {
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
}

interface DateFieldProps {
    value: Date | null;
    onChange: (date: Date) => void;
    /** Custom style override for the outer container */
    containerStyle?: object;
    placeholder?: string;
    mode?: 'date' | 'time';
}

export function DateField({
    value,
    onChange,
    containerStyle,
    placeholder,
    mode = 'date',
}: DateFieldProps) {
    const [showPicker, setShowPicker] = useState(false);
    const [inputText, setInputText] = useState(
        value ? (mode === 'date' ? formatDate(value) : formatTime(value)) : '',
    );

    // Sync external value change to internal text
    React.useEffect(() => {
        if (value) {
            setInputText(
                mode === 'date' ? formatDate(value) : formatTime(value),
            );
        } else {
            setInputText('');
        }
    }, [value, mode]);

    const handleChange = useCallback(
        (_event: DateTimePickerEvent, selectedDate?: Date) => {
            if (Platform.OS === 'android') setShowPicker(false);
            if (selectedDate) {
                onChange(selectedDate);
                setInputText(
                    mode === 'date'
                        ? formatDate(selectedDate)
                        : formatTime(selectedDate),
                );
            }
        },
        [onChange, mode],
    );

    const handleTextChange = (text: string) => {
        if (mode === 'date') {
            // dd/mm/yyyy
            let cleaned = text.replace(/\D/g, '');
            if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

            let formatted = cleaned;
            if (cleaned.length > 2)
                {formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);}
            if (cleaned.length > 4)
                {formatted = formatted.slice(0, 5) + '/' + cleaned.slice(4);}

            setInputText(formatted);

            if (cleaned.length === 8) {
                const d = parseInt(cleaned.slice(0, 2), 10);
                const m = parseInt(cleaned.slice(2, 4), 10);
                const y = parseInt(cleaned.slice(4, 8), 10);
                const date = new Date(y, m - 1, d);
                if (
                    !isNaN(date.getTime()) &&
                    date.getFullYear() === y &&
                    date.getMonth() + 1 === m &&
                    date.getDate() === d
                ) {
                    onChange(date);
                }
            }
        } else {
            // HH:mm
            let cleaned = text.replace(/\D/g, '');
            if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);

            let formatted = cleaned;
            if (cleaned.length > 2)
                {formatted = cleaned.slice(0, 2) + ':' + cleaned.slice(2);}

            setInputText(formatted);

            if (cleaned.length === 4) {
                const hh = parseInt(cleaned.slice(0, 2), 10);
                const mm = parseInt(cleaned.slice(2, 4), 10);
                if (hh >= 0 && hh < 24 && mm >= 0 && mm < 60) {
                    const date = value ? new Date(value) : new Date();
                    date.setHours(hh, mm, 0, 0);
                    onChange(date);
                }
            }
        }
    };

    const closePicker = useCallback(() => setShowPicker(false), []);

    return (
        <View style={containerStyle}>
            <View style={s.fieldRow}>
                <TextInput
                    style={[
                        s.fieldText,
                        { flex: 1, paddingVertical: 0 },
                        !value && { color: colors.text3, fontWeight: '400' },
                    ]}
                    value={inputText}
                    onChangeText={handleTextChange}
                    placeholder={
                        placeholder ||
                        (mode === 'date' ? 'dd/mm/yyyy' : 'hh:mm')
                    }
                    placeholderTextColor={colors.text3}
                    keyboardType='numeric'
                    maxLength={mode === 'date' ? 10 : 5}
                />
                <Pressable onPress={() => setShowPicker(true)}>
                    <Ionicons
                        name={
                            mode === 'date'
                                ? 'calendar-outline'
                                : 'time-outline'
                        }
                        size={18}
                        color={colors.text3}
                        style={{ marginLeft: 10 }}
                    />
                </Pressable>
            </View>

            {showPicker &&
                (Platform.OS === 'ios' ? (
                    <View style={s.iosWrap}>
                        <View style={s.iosBar}>
                            <Pressable onPress={closePicker}>
                                <Text style={s.iosDone}>Xong</Text>
                            </Pressable>
                        </View>
                        <DateTimePicker
                            value={value || new Date()}
                            mode={mode}
                            display={mode === 'date' ? 'inline' : 'spinner'}
                            onChange={handleChange}
                            themeVariant='light'
                        />
                    </View>
                ) : (
                    <DateTimePicker
                        value={value || new Date()}
                        mode={mode}
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
        borderRadius: moderateScale(12),
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(11),
    },
    fieldText: {
        fontSize: scaleFont(14),
        fontWeight: '600',
        color: colors.text,
    },
    iosWrap: {
        backgroundColor: colors.card,
        borderRadius: moderateScale(12),
        marginTop: verticalScale(6),
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
    },
    iosBar: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(8),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    iosDone: {
        fontSize: scaleFont(14),
        fontWeight: '700',
        color: colors.primary,
    },
});
