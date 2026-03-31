export const MOTION_DURATION = {
    quick: 160,
    standard: 200,
    emphasis: 240,
} as const;

export const MOTION_PRESETS = {
    root: {
        headerShown: false,
        animation: 'fade' as const,
        animationDuration: MOTION_DURATION.standard,
    },
    flowEntry: {
        animation: 'fade_from_bottom' as const,
        animationDuration: MOTION_DURATION.standard,
    },
    tabEntry: {
        animation: 'fade' as const,
        animationDuration: MOTION_DURATION.quick,
    },
    drillDown: {
        animation: 'slide_from_right' as const,
        animationDuration: MOTION_DURATION.standard,
    },
    modal: {
        presentation: 'modal' as const,
        animation: 'slide_from_bottom' as const,
        animationDuration: MOTION_DURATION.standard,
    },
    launch: {
        animation: 'fade' as const,
        animationDuration: MOTION_DURATION.emphasis,
    },
} as const;
