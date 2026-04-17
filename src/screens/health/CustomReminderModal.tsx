import React, { useEffect, useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { styles } from './styles';
import { shared } from '../../styles/shared';
import { colors } from '../../styles/tokens';

const CUSTOM_REMINDER_UNITS = ['phút', 'giờ', 'ngày', 'tuần'] as const;

type CustomReminderUnit = (typeof CUSTOM_REMINDER_UNITS)[number];

interface CustomReminderModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (label: string) => void;
}

export function CustomReminderModal({
    visible,
    onClose,
    onSave,
}: CustomReminderModalProps) {
    const [value, setValue] = useState('1');
    const [unit, setUnit] = useState<CustomReminderUnit>('giờ');

    useEffect(() => {
        if (visible) {
            setValue('1');
            setUnit('giờ');
        }
    }, [visible]);

    const handleSave = () => {
        const amount = value.trim();
        if (!amount) return;
        onSave(`${amount} ${unit} trước`);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType='fade'
            onRequestClose={onClose}
        >
            <Pressable style={shared.overlay} onPress={onClose}>
                <Pressable
                    style={styles.reminderCustomModal}
                    onPress={(e) => e.stopPropagation()}
                >
                    <Text style={styles.reminderCustomTitle}>
                        Tùy chỉnh nhắc trước
                    </Text>
                    <Text style={styles.reminderCustomLabel}>Thời gian</Text>
                    <TextInput
                        value={value}
                        onChangeText={(text) =>
                            setValue(text.replace(/[^\d]/g, ''))
                        }
                        keyboardType='number-pad'
                        placeholder='VD: 4'
                        placeholderTextColor={colors.text3}
                        style={styles.reminderCustomInput}
                    />
                    <View style={styles.reminderCustomUnitRow}>
                        {CUSTOM_REMINDER_UNITS.map((item) => (
                            <Pressable
                                key={item}
                                style={[
                                    styles.reminderCustomUnit,
                                    unit === item &&
                                        styles.reminderCustomUnitActive,
                                ]}
                                onPress={() => setUnit(item)}
                            >
                                <Text
                                    style={[
                                        styles.reminderCustomUnitText,
                                        unit === item &&
                                            styles.reminderCustomUnitTextActive,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                    <View style={styles.reminderCustomActions}>
                        <Pressable
                            style={styles.reminderCustomCancel}
                            onPress={onClose}
                        >
                            <Text style={styles.reminderCustomCancelText}>
                                Hủy
                            </Text>
                        </Pressable>
                        <Pressable
                            style={styles.reminderCustomSave}
                            onPress={handleSave}
                        >
                            <Text style={styles.reminderCustomSaveText}>
                                Lưu
                            </Text>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}
