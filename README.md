# Expo TypeScript Boilerplate (Single Root)

This repository is a reusable Expo + TypeScript boilerplate for the single-system mobile pipeline.

## Stack

- Expo SDK 54
- React Native 0.81
- TypeScript (strict mode)
- React Navigation (native stack)
- Jest (`tests/unit`)
- Detox (`tests/e2e`)

## Structure

```text
src/
  app/
  config/
  features/
  navigation/
  theme/
  utils/
tests/
  unit/
  e2e/
```

## Commands

- `npm run start`: Start Expo dev server
- `npm run android`: Build and run Android app
- `npm run ios`: Build and run iOS app
- `npm run web`: Run web target
- `npm run lint`: Lint all files
- `npm run typecheck`: Type-check project
- `npm run test`: Run unit tests with coverage
- `npm run detox:build`: Build Detox Android binary
- `npm run detox:test`: Run Detox tests
- `npm run android:prebuild`: Regenerate Android native code from Expo config

## Environment

Runtime config is resolved in `src/config/appConfig.ts`.

Defaults:

- `environment`: `development`
- `apiBaseUrl`: `https://api.example.com`

Optional variables:

- `EXPO_PUBLIC_APP_ENV`
- `EXPO_PUBLIC_API_BASE_URL`

## CI

The project keeps a workflow caller at `.github/workflows/mobile-pipeline-caller.yml` that delegates to the central orchestrator.

Required repository variable:

- `MOBILE_SINGLE_SYSTEMS_JSON`

Recommended value:

```json
{
  "name": "mobile-expo",
  "dir": ".",
  "mobile_stack": "expo",
  "enable_android_build": true,
  "enable_ios_build": true,
  "eas_profile_android": "production",
  "eas_profile_ios": "production",
  "version_stream": "mobile-expo"
}
```

Required secret:

- `EXPO_TOKEN`

Optional secrets when Expo project linkage should stay out of the repository:

- `EXPO_PROJECT_ID`
- `EXPO_OWNER`

Expo project linkage policy:

- This template intentionally does not commit `expo.extra.eas.projectId` or `expo.owner` in `app.json`.
- If CI manages Expo linkage, set `EXPO_PROJECT_ID` and optionally `EXPO_OWNER` as repository secrets.
- If a project chooses to keep Expo linkage in repo config instead, it may define `expo.extra.eas.projectId` in `app.json` or in dynamic app config.

EAS requirements:

- `eas.json` must define the selected build profiles.
- Each selected profile must set `android.image` and `ios.image`.
- The app must remain TypeScript-only with strict mode enabled.
