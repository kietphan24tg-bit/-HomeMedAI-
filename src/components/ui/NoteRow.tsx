import React from 'react';
import { Text, View } from 'react-native';
import { shared } from '../../styles/shared';

interface NoteRowProps {
    text: string;
}

export function NoteRow({ text }: NoteRowProps): React.JSX.Element {
    return (
        <View style={shared.noteRow}>
            <Text style={shared.noteIcon}>i</Text>
            <Text style={shared.noteText}>{text}</Text>
        </View>
    );
}
