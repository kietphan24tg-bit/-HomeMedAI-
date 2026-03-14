import { type TextStyle, type ViewStyle } from 'react-native';

export interface FieldRowProps {
    label: string;
    value: string;
    badge?: string;
    valueStyle?: TextStyle;
}

export interface TagItem {
    text: string;
    style: ViewStyle;
}

export interface FieldMultiProps {
    label: string;
    tags: TagItem[];
    empty?: boolean;
}
