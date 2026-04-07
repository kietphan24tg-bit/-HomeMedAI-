import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import {
    moderateScale,
    scale,
    scaleFont,
    verticalScale,
} from '@/src/styles/responsive';
import { formSystem } from '@/src/styles/shared';
import { colors, typography } from '@/src/styles/tokens';

export type AttachmentUploadItem = {
    id: string;
    type: 'image' | 'file';
    name: string;
    uri: string;
};

const IMAGE_EXTENSIONS = [
    '.jpg',
    '.jpeg',
    '.png',
    '.heic',
    '.heif',
    '.webp',
] as const;

function looksLikeImage(
    name?: string,
    uri?: string,
    mimeType?: string,
): boolean {
    if (mimeType?.startsWith('image/')) return true;
    const target = `${name || ''} ${uri || ''}`.toLowerCase();
    return IMAGE_EXTENSIONS.some((ext) => target.includes(ext));
}

type Props = {
    attachments: AttachmentUploadItem[];
    onChange: (items: AttachmentUploadItem[]) => void;
    title?: string;
};

export function AttachmentUploadBlock({
    attachments,
    onChange,
    title = 'FILE ĐÍNH KÈM',
}: Props): React.JSX.Element {
    const handlePickImages = async () => {
        const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
            Alert.alert(
                'Chưa có quyền truy cập ảnh',
                'Hãy cho phép ứng dụng truy cập thư viện ảnh để thêm ảnh đính kèm.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.85,
        });

        if (result.canceled || !result.assets.length) return;

        const nextItems = result.assets.map((asset, index) => ({
            id: `${asset.uri}-${Date.now()}-${index}`,
            type: 'image' as const,
            name: asset.fileName || `Ảnh ${attachments.length + index + 1}`,
            uri: asset.uri,
        }));

        onChange([...attachments, ...nextItems]);
    };

    const handlePickFiles = async () => {
        try {
            const picker = await import('expo-document-picker');

            const result = await picker.getDocumentAsync({
                multiple: true,
                copyToCacheDirectory: true,
                type: '*/*',
            });

            if (result.canceled || !result.assets.length) return;

            const nextItems = result.assets.map((asset, index) => ({
                id: `${asset.uri}-${Date.now()}-${index}`,
                type: looksLikeImage(asset.name, asset.uri, asset.mimeType)
                    ? ('image' as const)
                    : ('file' as const),
                name: asset.name || `Tệp ${attachments.length + index + 1}`,
                uri: asset.uri,
            }));

            onChange([...attachments, ...nextItems]);
        } catch {
            Alert.alert(
                'Chưa hỗ trợ thêm file',
                'Bản app hiện tại chưa có module chọn tệp. Hãy rebuild dev client để dùng tính năng này.',
            );
        }
    };

    const handleRemoveAttachment = (id: string) => {
        onChange(attachments.filter((item) => item.id !== id));
    };

    return (
        <View style={s.root}>
            <Text style={s.title}>{title}</Text>
            <View style={s.grid}>
                <Pressable style={s.addCard} onPress={handlePickImages}>
                    <View
                        style={[
                            s.iconWrap,
                            { backgroundColor: colors.primaryBg },
                        ]}
                    >
                        <Ionicons
                            name='camera-outline'
                            size={16}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={[s.actionLabel, { color: colors.primary }]}>
                        Thêm ảnh
                    </Text>
                    <Text style={s.actionSub}>JPG, PNG, HEIC</Text>
                </Pressable>

                <Pressable style={s.addCard} onPress={handlePickFiles}>
                    <View style={[s.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                        <Ionicons
                            name='document-outline'
                            size={16}
                            color='#7C3AED'
                        />
                    </View>
                    <Text style={[s.actionLabel, { color: '#7C3AED' }]}>
                        Thêm file
                    </Text>
                    <Text style={s.actionSub}>PDF, Word, Excel</Text>
                </Pressable>
            </View>

            {attachments.length ? (
                <View style={s.list}>
                    {attachments.map((item) => {
                        const isImage =
                            looksLikeImage(item.name, item.uri) ||
                            item.type === 'image';

                        return (
                            <View key={item.id} style={s.item}>
                                {isImage ? (
                                    <Image
                                        source={{ uri: item.uri }}
                                        style={s.thumb}
                                    />
                                ) : (
                                    <View style={s.fileThumb}>
                                        <Ionicons
                                            name='document-text-outline'
                                            size={16}
                                            color='#7C3AED'
                                        />
                                    </View>
                                )}
                                <View style={s.meta}>
                                    <Text style={s.name} numberOfLines={1}>
                                        {item.name}
                                    </Text>
                                    <Text style={s.type}>
                                        {isImage
                                            ? 'Ảnh đính kèm'
                                            : 'Tệp đính kèm'}
                                    </Text>
                                </View>
                                <Pressable
                                    style={s.removeBtn}
                                    onPress={() =>
                                        handleRemoveAttachment(item.id)
                                    }
                                >
                                    <Ionicons
                                        name='close'
                                        size={14}
                                        color={colors.text2}
                                    />
                                </Pressable>
                            </View>
                        );
                    })}
                </View>
            ) : null}
        </View>
    );
}

const s = StyleSheet.create({
    root: {
        gap: verticalScale(12),
    },
    title: {
        ...formSystem.sectionTitle,
    },
    grid: {
        flexDirection: 'row',
        gap: scale(8),
    },
    addCard: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: verticalScale(5),
        minHeight: verticalScale(82),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(10),
        borderRadius: moderateScale(13),
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: '#fff',
    },
    iconWrap: {
        width: scale(28),
        height: scale(28),
        borderRadius: moderateScale(9),
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionLabel: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
    },
    actionSub: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(9.5),
        color: colors.text3,
    },
    list: {
        gap: verticalScale(8),
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(10),
        paddingVertical: verticalScale(2),
        paddingHorizontal: scale(2),
    },
    thumb: {
        width: scale(36),
        height: scale(36),
        borderRadius: moderateScale(10),
        backgroundColor: '#EEF2FF',
    },
    fileThumb: {
        width: scale(36),
        height: scale(36),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F3FF',
    },
    meta: {
        flex: 1,
        gap: verticalScale(1),
    },
    name: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.text,
    },
    type: {
        fontFamily: typography.font.medium,
        fontSize: scaleFont(10.5),
        color: colors.text3,
    },
    removeBtn: {
        width: scale(24),
        height: scale(24),
        borderRadius: moderateScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
    },
});
