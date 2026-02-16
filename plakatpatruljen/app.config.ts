import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'PlakatPatruljen',
  slug: 'plakatpatruljen',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'plakatpatruljen',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: 'com.plakatpatruljen.app',
    infoPlist: {
      NSCameraUsageDescription:
        'PlakatPatruljen bruger kameraet til at tage billeder af ophængte plakater.',
      NSLocationWhenInUseUsageDescription:
        'PlakatPatruljen bruger din placering til at vise opgaver i nærheden.',
      NSLocationAlwaysAndWhenInUseUsageDescription:
        'PlakatPatruljen bruger din placering til at spore ophængningsruter.',
      NSPhotoLibraryUsageDescription:
        'PlakatPatruljen bruger dit fotobibliotek til at vælge plakatbilleder.',
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.plakatpatruljen.app',
    edgeToEdgeEnabled: true,
    permissions: [
      'CAMERA',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
    ],
  },
  web: {
    bundler: 'metro',
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-updates',
    'expo-apple-authentication',
    'expo-secure-store',
    'expo-localization',
    [
      'expo-camera',
      {
        cameraPermission:
          'PlakatPatruljen bruger kameraet til at tage billeder af ophængte plakater.',
      },
    ],
    [
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'PlakatPatruljen bruger din placering til at vise opgaver i nærheden.',
        locationAlwaysPermission:
          'PlakatPatruljen bruger din placering til at spore ophængningsruter.',
        locationWhenInUsePermission:
          'PlakatPatruljen bruger din placering til at vise opgaver i nærheden.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          'PlakatPatruljen bruger dit fotobibliotek til at vælge plakatbilleder.',
      },
    ],
    [
      'expo-notifications',
      {
        icon: './assets/images/icon.png',
        color: '#1a365d',
      },
    ],
  ],
  updates: {
    url: 'https://u.expo.dev/d7b9a455-8b88-4163-b0fc-548a6fa7a5c5',
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
  experiments: {
    typedRoutes: true,
  },
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    eas: {
      projectId: 'd7b9a455-8b88-4163-b0fc-548a6fa7a5c5',
    },
  },
});
