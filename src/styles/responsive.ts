import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Standard design dimensions (based on iPhone 11/12 or similar)
const GUIDELINE_BASE_WIDTH = 375;
const GUIDELINE_BASE_HEIGHT = 812;

/**
 * Scale value based on screen width. Use for: width, padding, margin, horizontal spacing.
 */
const scale = (size: number): number =>
    (SCREEN_WIDTH / GUIDELINE_BASE_WIDTH) * size;

/**
 * Scale value based on screen height. Use for: height, vertical spacing.
 */
const verticalScale = (size: number): number =>
    (SCREEN_HEIGHT / GUIDELINE_BASE_HEIGHT) * size;

/**
 * Moderate scale value. Use for: font-size, border-radius, or when you don't want it to scale too aggressively.
 * Factor: 0.5 means it only scales half as much as the width.
 */
const moderateScale = (size: number, factor = 0.5): number =>
    size + (scale(size) - size) * factor;

/**
 * Scale font size based on device pixel ratio and screen width.
 */
const scaleFont = (size: number): number => moderateScale(size, 0.4);

export {
    moderateScale,
    scale,
    scaleFont,
    SCREEN_HEIGHT,
    SCREEN_WIDTH,
    verticalScale,
};
