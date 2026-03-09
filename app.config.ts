import type { ExpoConfig } from 'expo/config';

type RuntimeEnvironment = 'development' | 'staging' | 'production';

const defaultAppName = 'Template Repo Mobile Single';
const defaultEnvironment: RuntimeEnvironment = 'development';
const defaultApiBaseUrl = 'https://api.example.com';
const allowedEnvironments = new Set<RuntimeEnvironment>(['development', 'staging', 'production']);

function resolveEnvironment(value: string | undefined): RuntimeEnvironment {
  if (value && allowedEnvironments.has(value as RuntimeEnvironment)) {
    return value as RuntimeEnvironment;
  }

  return defaultEnvironment;
}

export default function getExpoConfig(): ExpoConfig {
  const appName = process.env.EXPO_PUBLIC_APP_NAME ?? defaultAppName;
  const environment = resolveEnvironment(process.env.EXPO_PUBLIC_APP_ENV);
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? defaultApiBaseUrl;

  return {
    name: appName,
    slug: 'template-repo-mobile-single',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'templatemobilesingle',
    userInterfaceStyle: 'automatic',
    jsEngine: 'hermes',
    android: {
      package: 'com.anonymous.templaterepombsingle',
    },
    ios: {
      bundleIdentifier: 'com.anonymous.templaterepombsingle',
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    plugins: [
      [
        'expo-build-properties',
        {
          android: {
            kotlinVersion: '2.0.21',
          },
        },
      ],
    ],
    extra: {
      appName,
      environment,
      apiBaseUrl,
    },
  };
}