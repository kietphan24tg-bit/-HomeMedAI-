import { StyleSheet } from 'react-native';
import { colors, shadows, typography } from './tokens';

export const shared = StyleSheet.create({
    // ── Layout ──
    flexRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    // ── Topbar ──
    topbar: {
        paddingHorizontal: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },

    // ── Icon Button (card-style) ──
    iconBtn: {
        width: 36,
        height: 36,
        borderRadius: 11,
        backgroundColor: colors.card,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.card,
    },

    // ── Icon Circle (colored bg square/circle for row items) ──
    iconCircleSm: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconCircleMd: {
        width: 38,
        height: 38,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconCircleLg: {
        width: 44,
        height: 44,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },

    // ── Card Block ──
    cardBlock: {
        marginHorizontal: 20,
        borderRadius: 20,
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
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    dividerRowTop: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },

    // ── Row text ──
    rowTitle: {
        fontFamily: typography.font.bold,
        fontSize: 13,
        color: colors.text,
    },
    rowSub: {
        fontFamily: typography.font.regular,
        fontSize: 11,
        color: colors.text3,
        marginTop: 1,
    },
    rowBody: { flex: 1 },

    // ── Badge / Pill ──
    pill: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 20,
        overflow: 'hidden',
    },
    pillText: {
        fontFamily: typography.font.bold,
        fontSize: 10,
    },

    // ── Inline Badge (icon + text) ──
    inlineBadge: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 20,
        marginBottom: 10,
    },
    inlineBadgeText: {
        fontFamily: typography.font.bold,
        fontSize: 11,
    },

    // ── Buttons ──
    btnFilled: {
        borderRadius: 14,
        paddingVertical: 16,
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
        fontSize: 15,
    },
    btnOutline: {
        borderRadius: 14,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.border,
        flexDirection: 'row',
    },
    btnOutlineText: {
        fontFamily: typography.font.semiBold,
        fontSize: 14,
        color: colors.text2,
    },
    pressed: {
        opacity: 0.8,
        transform: [{ scale: 0.97 }],
    },

    // ── Section ──
    section: {
        paddingHorizontal: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontFamily: typography.font.bold,
        fontSize: 15,
        color: colors.text,
    },
    sectionAction: {
        fontFamily: typography.font.semiBold,
        fontSize: 12,
        color: colors.primary,
    },
    sectionTitleSmall: {
        fontFamily: typography.font.bold,
        fontSize: 11,
        color: colors.text2,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },

    // ── Section Header (legacy — used by SectionHeader component) ──
    sectionHeaderOuter: {
        paddingHorizontal: 20,
        paddingTop: 22,
        paddingBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeaderText: {
        fontFamily: typography.font.bold,
        fontSize: 11,
        color: '#5A6A82',
        textTransform: 'uppercase',
        letterSpacing: 0.9,
    },
    sectionHeaderAction: {
        fontFamily: typography.font.bold,
        fontSize: 12,
        color: colors.primary,
    },

    // ── Avatar ──
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontFamily: typography.font.black,
        fontSize: 13,
    },
    avatarDot: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.cHealth,
        borderWidth: 2,
        borderColor: '#fff',
    },

    // ── Description text ──
    descText: {
        fontFamily: typography.font.regular,
        fontSize: 14,
        color: colors.text2,
        lineHeight: 22,
    },

    // ── Count Strip (header inside a card) ──
    cstrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    cstripLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    csIcon: {
        width: 34,
        height: 34,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
    },
    csTitle: {
        fontFamily: typography.font.bold,
        fontSize: 14,
        color: '#0C1A2E',
    },
    countPill: {
        fontFamily: typography.font.bold,
        fontSize: 12,
        color: colors.primary,
        backgroundColor: colors.primaryBg,
        paddingHorizontal: 11,
        paddingVertical: 4,
        borderRadius: 20,
    },

    // ── Icon Row (icon + content + right element) ──
    iconRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    iconRowIcon: {
        width: 36,
        height: 36,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    iconRowBody: {
        flex: 1,
    },
    iconRowTitle: {
        fontFamily: typography.font.bold,
        fontSize: 13,
        color: '#0C1A2E',
    },
    iconRowSub: {
        fontFamily: typography.font.regular,
        fontSize: 11,
        color: '#9BABB8',
        marginTop: 1,
    },

    // ── Note Row ──
    noteRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        backgroundColor: '#FAFBFF',
    },
    noteIcon: {
        width: 16,
        height: 16,
        borderRadius: 8,
        textAlign: 'center',
        textAlignVertical: 'center',
        fontFamily: typography.font.bold,
        fontSize: 10,
        color: '#9BABB8',
        borderWidth: 1,
        borderColor: '#9BABB8',
        marginRight: 6,
        marginTop: 1,
    },
    noteText: {
        fontFamily: typography.font.regular,
        fontSize: 10,
        color: '#9BABB8',
        flex: 1,
        lineHeight: 15,
    },

    // ── Status Badge / Pill (legacy) ──
    badge: {
        fontFamily: typography.font.bold,
        fontSize: 10,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
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
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingBottom: 28,
    },
    sheetHandle: {
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 4,
    },
    sheetBar: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.border,
    },
    sheetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    sheetTitle: {
        fontFamily: typography.font.bold,
        fontSize: 15,
        color: colors.text,
    },
    sheetBody: {
        paddingHorizontal: 20,
        paddingTop: 16,
    },
    sheetInputWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryBg,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.border,
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    sheetInput: {
        flex: 1,
        fontFamily: typography.font.semiBold,
        fontSize: 15,
        color: colors.text,
        padding: 0,
    },
    sheetBtnRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 20,
        paddingTop: 18,
    },
    sheetBtnGhost: {
        flex: 1,
        paddingVertical: 13,
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetBtnGhostText: {
        fontFamily: typography.font.semiBold,
        fontSize: 14,
        color: colors.text2,
    },
    sheetBtnPrimaryWrap: {
        flex: 1,
        borderRadius: 14,
        overflow: 'hidden',
    },
    sheetBtnPrimary: {
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetBtnPrimaryText: {
        fontFamily: typography.font.bold,
        fontSize: 14,
        color: '#fff',
    },
});
