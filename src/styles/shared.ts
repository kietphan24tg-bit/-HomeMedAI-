import { StyleSheet } from 'react-native';
import { moderateScale, scale, scaleFont, verticalScale } from './responsive';
import { colors, shadows, typography } from './tokens';

export const shared = StyleSheet.create({
    // ── Layout ──
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // ── Topbar ──
    topbar: {
        paddingHorizontal: scale(20),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // ── Icon Button (card-style) ──
    iconBtn: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(11),
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
    },

    // ── Icon Circle (colored bg square/circle for row items) ──
    iconCircleSm: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(11),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    iconCircleMd: {
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(11),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    iconCircleLg: {
        width: moderateScale(44),
        height: moderateScale(44),
        borderRadius: moderateScale(13),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(14),
    },

    // ── Card Block ──
    cardBlock: {
        marginHorizontal: scale(20),
        borderRadius: moderateScale(20),
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        overflow: 'hidden',
        ...shadows.card,
    },

    card: {
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        ...shadows.card,
    },

    // ── Row with divider ──
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(12),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dividerRowTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(10),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    // ── Row text ──
    rowTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text,
    },

    rowSub: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: colors.text3,
        marginTop: verticalScale(1),
    },

    rowBody: { flex: 1 },

    // ── Badge / Pill ──
    pill: {
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(20),
        overflow: 'hidden',
    },
    pillText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10),
    },

    // ── Inline Badge (icon + text) ──
    inlineBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        paddingHorizontal: scale(12),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
        marginBottom: verticalScale(10),
    },
    inlineBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
    },

    // ── Buttons ──
    btnFilled: {
        borderRadius: moderateScale(14),
        paddingVertical: verticalScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    btnFilledText: {
        color: '#fff',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
    },
    btnOutline: {
        borderRadius: moderateScale(14),
        paddingVertical: verticalScale(14),
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        flexDirection: 'row',
    },
    btnOutlineText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(14),
        color: colors.text2,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.97 }],
    },

    // ── Section ──
    section: {
        paddingHorizontal: scale(16),
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: verticalScale(12),
    },
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.text,
    },
    sectionAction: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12),
        color: colors.primary,
    },
    sectionTitleSmall: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // ── Section Header (legacy — used by SectionHeader component) ──
    sectionHeaderOuter: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(22),
        paddingBottom: verticalScale(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: '#5A6A82',
        textTransform: 'uppercase',
        letterSpacing: 0.9,
    },
    sectionHeaderAction: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.primary,
    },

    // ── Avatar ──
    avatar: {
        width: moderateScale(38),
        height: moderateScale(38),
        borderRadius: moderateScale(19),
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: typography.font.black,
        fontSize: scaleFont(13),
    },
    avatarDot: {
        position: 'absolute',
        bottom: verticalScale(1),
        right: scale(1),
        width: moderateScale(10),
        height: moderateScale(10),
        borderRadius: moderateScale(5),
        backgroundColor: colors.cHealth,
        borderWidth: 2,
        borderColor: '#fff',
    },

    // ── Description text ──
    descText: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(14),
        color: colors.text2,
        lineHeight: verticalScale(22),
    },

    // ── Count Strip (header inside a card) ──
    cstrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cstripLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    csIcon: {
        width: moderateScale(34),
        height: moderateScale(34),
        borderRadius: moderateScale(10),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    csTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: '#0C1A2E',
    },
    countPill: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12),
        color: colors.primary,
        backgroundColor: colors.primaryBg,
        paddingHorizontal: scale(11),
        paddingVertical: verticalScale(4),
        borderRadius: moderateScale(20),
    },

    // ── Icon Row (icon + content + right element) ──
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(10),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    iconRowIcon: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(11),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    iconRowBody: {
        flex: 1,
    },
    iconRowTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: '#0C1A2E',
    },
    iconRowSub: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: '#9BABB8',
        marginTop: verticalScale(1),
    },

    // ── Note Row ──
    noteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(10),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: '#FAFBFF',
    },
    noteIcon: {
        width: moderateScale(16),
        height: moderateScale(16),
        borderRadius: moderateScale(8),
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10),
        color: '#9BABB8',
        borderWidth: 1,
        borderColor: '#9BABB8',
        marginRight: scale(6),
        marginTop: verticalScale(1),
    },
    noteText: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(10),
        color: '#9BABB8',
        flex: 1,
        lineHeight: verticalScale(15),
    },

    // ── Status Badge / Pill (legacy) ──
    badge: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10),
        paddingHorizontal: scale(8),
        paddingVertical: verticalScale(2),
        borderRadius: moderateScale(6),
        alignSelf: 'flex-start',
    },

    // ── Bottom Sheet ──
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.35)',
        justifyContent: 'flex-end',
    },
    sheetContainer: {
        backgroundColor: colors.card,
        borderTopLeftRadius: moderateScale(24),
        borderTopRightRadius: moderateScale(24),
        paddingBottom: verticalScale(28),
    },
    sheetHandle: {
        alignItems: 'center',
        paddingTop: verticalScale(10),
        paddingBottom: verticalScale(4),
    },
    sheetBar: {
        width: scale(36),
        height: verticalScale(4),
        borderRadius: moderateScale(2),
        backgroundColor: colors.border,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(8),
        paddingBottom: verticalScale(14),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sheetTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(15),
        color: colors.text,
    },
    sheetBody: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(16),
    },
    sheetInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryBg,
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: scale(14),
        paddingVertical: verticalScale(12),
        gap: scale(10),
    },
    sheetInput: {
        flex: 1,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(15),
        color: colors.text,
        padding: 0,
    },
    sheetBtnRow: {
        flexDirection: 'row',
        gap: scale(10),
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(18),
    },
    sheetBtnGhost: {
        flex: 1,
        paddingVertical: verticalScale(13),
        borderRadius: moderateScale(14),
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetBtnGhostText: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(14),
        color: colors.text2,
    },
    sheetBtnPrimaryWrap: {
        flex: 1,
        borderRadius: moderateScale(14),
        overflow: 'hidden',
    },
    sheetBtnPrimary: {
        paddingVertical: verticalScale(13),
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetBtnPrimaryText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: '#fff',
    },
});
