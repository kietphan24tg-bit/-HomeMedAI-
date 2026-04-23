import { existsSync } from 'fs';
import type { ConfigContext, ExpoConfig } from 'expo/config';
const baseConfig: ExpoConfig = require('./app.json').expo;

type Variant = 'prod' | 'preview' | 'dev';

function resolveVariant(): Variant {
    const raw = (process.env.APP_VARIANT ?? '').toLowerCase();
    if (raw === 'dev' || raw === 'preview' || raw === 'prod') return raw;

    const profile = (process.env.EAS_BUILD_PROFILE ?? '').toLowerCase();
    if (profile.includes('dev')) return 'dev';
    if (profile.includes('preview')) return 'preview';
    return 'prod';
}

export default ({ config }: ConfigContext): ExpoConfig => {
    const variant = resolveVariant();

    const appName =
        variant === 'dev'
            ? 'HOMEMEDAI'
            : variant === 'preview'
              ? 'HomeMedAI'
              : 'HomeMedAI';

    const androidPackage =
        variant === 'dev'
            ? 'com.homemedaimobile.app.dev'
            : variant === 'preview'
              ? 'com.homemedaimobile.app.preview'
              : 'com.homemedaimobile.app';

    const iosBundleIdentifier =
        variant === 'dev'
            ? 'com.homemedaimobile.app.dev'
            : variant === 'preview'
              ? 'com.homemedaimobile.app.preview'
              : 'com.homemedaimobile.app';

    const scheme =
        variant === 'dev'
            ? 'homemedai-dev'
            : variant === 'preview'
              ? 'homemedai-preview'
              : 'homemedai';

    const variantGoogleServicesFile =
        variant === 'dev'
            ? './google-services.dev.json'
            : variant === 'preview'
              ? './google-services.preview.json'
              : './google-services.prod.json';

    const googleServicesFile = existsSync(variantGoogleServicesFile)
        ? variantGoogleServicesFile
        : './google-services.json';

    return {
        ...baseConfig,
        ...config,
        name: appName,
        scheme,
        ios: {
            ...baseConfig.ios,
            ...config.ios,
            bundleIdentifier: iosBundleIdentifier,
        },
        android: {
            ...baseConfig.android,
            ...config.android,
            package: androidPackage,
            googleServicesFile,
        },
        extra: {
            ...baseConfig.extra,
            ...config.extra,
            appVariant: variant,
        },
    };
};
