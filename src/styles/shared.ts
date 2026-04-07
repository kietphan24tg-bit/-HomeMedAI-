import { StyleSheet } from 'react-native';
import { moderateScale, scale, scaleFont, verticalScale } from './responsive';
import { colors, shadows, typography } from './tokens';

const cardShellBase = {
    borderRadius: moderateScale(20),
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.card,
} as const;

const cardRowBase = {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scale(18),
    paddingVertical: verticalScale(10),
    minHeight: verticalScale(48),
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
} as const;

const cardRowIconBase = {
    width: moderateScale(30),
    height: moderateScale(30),
    borderRadius: moderateScale(9),
    alignItems: 'center',
    justifyContent: 'center',
} as const;

const inputFieldBase = {
    minHeight: verticalScale(36),
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: moderateScale(10),
    backgroundColor: colors.card,
    paddingHorizontal: scale(10),
    paddingVertical: verticalScale(5),
} as const;

const buttonBase = {
    minHeight: verticalScale(38),
    borderRadius: moderateScale(11),
    paddingHorizontal: scale(13),
    paddingVertical: verticalScale(6),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scale(8),
} as const;

export const cardSystem = {
    shell: cardShellBase,
    row: cardRowBase,
    rowIcon: cardRowIconBase,
    rowBody: {
        flex: 1,
        justifyContent: 'center',
        minHeight: verticalScale(30),
    },
    rowTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text,
    },
    rowSub: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(11),
        color: colors.text3,
        marginTop: verticalScale(3),
    },
} as const;

export const inputSystem = {
    field: inputFieldBase,
    fieldSoft: {
        ...inputFieldBase,
        backgroundColor: colors.bg,
    },
    fieldIcon: {
        ...inputFieldBase,
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    text: {
        flex: 1,
        fontFamily: typography.font.medium,
        fontSize: scaleFont(11.5),
        color: colors.text,
        padding: 0,
    },
    textStrong: {
        flex: 1,
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11.5),
        color: colors.text,
        padding: 0,
    },
    textarea: {
        ...inputFieldBase,
        minHeight: verticalScale(72),
        textAlignVertical: 'top',
    },
    selectOption: {
        ...inputFieldBase,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
} as const;

export const buttonSystem = {
    primary: {
        ...buttonBase,
    },
    outline: {
        ...buttonBase,
        borderWidth: 1.5,
        borderColor: colors.border,
        backgroundColor: colors.card,
    },
    ghost: {
        ...buttonBase,
        backgroundColor: 'transparent',
    },
    textPrimary: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
        color: '#fff',
    },
    textOutline: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12.5),
        color: colors.text2,
    },
    textGhost: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(12.5),
        color: colors.text2,
    },
} as const;

export const formSystem = {
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(12.5),
        color: colors.text2,
        letterSpacing: 0.4,
    },
    fieldLabel: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11.5),
        color: colors.text2,
    },
} as const;

export const medicineCardSystem = {
    radius: moderateScale(16),
    topPadding: verticalScale(11),
    sidePadding: scale(11),
    rowGap: scale(9),
    iconBox: moderateScale(32),
    iconRadius: moderateScale(9),
    iconSize: 16,
    titleSize: scaleFont(13.25),
    titleLineHeight: verticalScale(17),
    subtitleSize: scaleFont(10.5),
    statusSize: scaleFont(12),
    badgeSize: scaleFont(9.5),
    badgePaddingX: scale(8),
    badgePaddingY: verticalScale(3),
    progressHeight: verticalScale(4),
    reminderSize: scaleFont(11),
    actionSize: scaleFont(11),
    actionPaddingY: verticalScale(8),
} as const;

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
    iconBtnFlat: {
        width: moderateScale(36),
        height: moderateScale(36),
        borderRadius: moderateScale(11),
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
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
        ...cardShellBase,
        marginHorizontal: scale(20),
        overflow: 'hidden',
    },

    card: {
        ...cardShellBase,
    },

    // ── Row with divider ──
    dividerRow: {
        ...cardRowBase,
    },
    dividerRowTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(10),
        minHeight: verticalScale(48),
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    // ── Row text ──
    rowTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(13),
        color: colors.text,
    },

    rowSub: { ...cardSystem.rowSub },

    rowBody: { ...cardSystem.rowBody },

    inputField: { ...inputSystem.field },
    inputFieldSoft: { ...inputSystem.fieldSoft },
    inputFieldIcon: { ...inputSystem.fieldIcon },
    inputText: { ...inputSystem.text },
    inputTextStrong: { ...inputSystem.textStrong },
    inputTextarea: { ...inputSystem.textarea },
    selectOption: { ...inputSystem.selectOption },
    btnPrimaryBase: { ...buttonSystem.primary },
    btnOutlineBase: { ...buttonSystem.outline },
    btnGhostBase: { ...buttonSystem.ghost },
    btnPrimaryTextBase: { ...buttonSystem.textPrimary },
    btnOutlineTextBase: { ...buttonSystem.textOutline },
    btnGhostTextBase: { ...buttonSystem.textGhost },

    // ── Badge / Pill ──
    pill: {
        paddingHorizontal: scale(9),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(999),
        overflow: 'hidden',
    },
    pillText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(9.5),
    },

    // ── Inline Badge (icon + text) ──
    inlineBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(6),
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(18),
        marginBottom: verticalScale(8),
    },
    inlineBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
    },

    // ── Buttons ──
    btnFilled: {
        ...buttonSystem.primary,
        shadowOpacity: 0.3,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 5,
    },
    btnFilledText: {
        ...buttonSystem.textPrimary,
    },
    btnOutline: {
        ...buttonSystem.outline,
    },
    btnOutlineText: {
        ...buttonSystem.textOutline,
    },
    btnGhost: { ...buttonSystem.ghost },
    btnGhostText: { ...buttonSystem.textGhost },
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
        marginBottom: verticalScale(10),
    },
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    sectionAction: {
        fontFamily: typography.font.semiBold,
        fontSize: scaleFont(11.5),
        color: colors.primary,
    },
    sectionTitleSmall: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
        color: colors.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
    },

    // ── Section Header (legacy — used by SectionHeader component) ──
    sectionHeaderOuter: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(20),
        paddingBottom: verticalScale(8),
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderText: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10.5),
        color: colors.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.7,
    },
    sectionHeaderAction: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11.5),
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
        backgroundColor: colors.success,
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
        paddingVertical: verticalScale(10),
        minHeight: verticalScale(48),
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cstripLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    csIcon: {
        ...cardRowIconBase,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(10),
    },
    csTitle: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(14),
        color: colors.text,
    },
    countPill: {
        fontFamily: typography.font.bold,
        fontSize: scaleFont(11),
        color: colors.primary,
        backgroundColor: colors.primaryBg,
        paddingHorizontal: scale(10),
        paddingVertical: verticalScale(3),
        borderRadius: moderateScale(999),
    },

    // ── Icon Row (icon + content + right element) ──
    iconRow: {
        ...cardRowBase,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderBottomWidth: 0,
    },
    iconRowIcon: {
        ...cardRowIconBase,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: scale(12),
    },
    iconRowBody: {
        ...cardSystem.rowBody,
    },
    iconRowTitle: {
        ...cardSystem.rowTitle,
    },
    iconRowSub: {
        ...cardSystem.rowSub,
    },

    // ── Note Row ──
    noteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: scale(18),
        paddingVertical: verticalScale(10),
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: colors.bg,
    },
    noteIcon: {
        width: moderateScale(16),
        height: moderateScale(16),
        borderRadius: moderateScale(8),
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: typography.font.bold,
        fontSize: scaleFont(10),
        color: colors.text3,
        borderWidth: 1,
        borderColor: colors.text3,
        marginRight: scale(6),
        marginTop: verticalScale(1),
    },
    noteText: {
        fontFamily: typography.font.regular,
        fontSize: scaleFont(10),
        color: colors.text3,
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
        fontSize: scaleFont(14),
        color: colors.text,
    },
    sheetBody: {
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(16),
    },
    sheetInputWrap: {
        ...inputSystem.fieldIcon,
        backgroundColor: colors.card,
        minHeight: verticalScale(45),
        borderRadius: moderateScale(11),
        paddingHorizontal: scale(13),
        gap: scale(10),
    },
    sheetInput: {
        ...inputSystem.textStrong,
        fontSize: scaleFont(12.5),
        lineHeight: scaleFont(16),
        textAlignVertical: 'center',
    },
    sheetBtnRow: {
        flexDirection: 'row',
        gap: scale(10),
        paddingHorizontal: scale(20),
        paddingTop: verticalScale(18),
    },
    sheetBtnGhost: {
        ...buttonSystem.outline,
        flex: 1,
    },
    sheetBtnGhostText: { ...buttonSystem.textOutline },
    sheetBtnPrimaryWrap: {
        flex: 1,
        borderRadius: moderateScale(14),
        overflow: 'hidden',
    },
    sheetBtnPrimary: {
        ...buttonSystem.primary,
    },
    sheetBtnPrimaryText: { ...buttonSystem.textPrimary },
});
