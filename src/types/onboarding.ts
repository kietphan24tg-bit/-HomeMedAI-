import { type ReactNode } from 'react';

export interface OnboardingItem {
    iconComponent: ReactNode;
    bg: string;
    title: string;
    desc: string;
}

/** @deprecated Use OnboardingItem */
export type FeatureItem = OnboardingItem;
/** @deprecated Use OnboardingItem */
export type PermItem = OnboardingItem;
