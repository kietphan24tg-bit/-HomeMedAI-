import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { colors } from '../styles/tokens';
import type { FeatureItem, PermItem } from '../types/onboarding';

export const FEATURES: FeatureItem[] = [
    {
        iconComponent: (
            <MaterialCommunityIcons
                name='file-document-edit-outline'
                size={20}
                color={colors.primary}
            />
        ),
        bg: colors.primaryBg,
        title: 'Hồ sơ bệnh án',
        desc: 'Lưu & tra cứu lịch sử khám cho cả gia đình',
    },
    {
        iconComponent: (
            <MaterialCommunityIcons
                name='file-document-outline'
                size={20}
                color={colors.danger}
            />
        ),
        bg: colors.dangerBg,
        title: 'Lịch tiêm chủng',
        desc: 'Theo dõi vaccine, nhắc lịch tiêm đúng hạn',
    },
    {
        iconComponent: (
            <MaterialCommunityIcons
                name='pill'
                size={20}
                color={colors.warning}
            />
        ),
        bg: colors.warningBg,
        title: 'Nhắc uống thuốc',
        desc: 'Đặt lịch thông minh, không bỏ sót liều nào',
    },
    {
        iconComponent: (
            <Ionicons name='time-outline' size={20} color={colors.secondary} />
        ),
        bg: colors.secondaryBg,
        title: 'AI Tư vấn sức khoẻ',
        desc: 'Chatbot giải đáp câu hỏi y tế 24/7',
    },
];

export const PERMS: PermItem[] = [
    {
        iconComponent: (
            <MaterialCommunityIcons
                name='pill'
                size={17}
                color={colors.primary}
            />
        ),
        bg: colors.primaryBg,
        title: 'Nhắc uống thuốc',
        desc: 'Thông báo đúng giờ, mỗi ngày',
    },
    {
        iconComponent: (
            <MaterialCommunityIcons
                name='file-document-outline'
                size={17}
                color={colors.danger}
            />
        ),
        bg: colors.dangerBg,
        title: 'Lịch tiêm chủng',
        desc: 'Nhắc trước 1 ngày khi đến hạn',
    },
    {
        iconComponent: (
            <Ionicons
                name='calendar-outline'
                size={17}
                color={colors.secondary}
            />
        ),
        bg: colors.secondaryBg,
        title: 'Lịch khám bác sĩ',
        desc: 'Nhắc trước 1 ngày & 1 giờ',
    },
];
