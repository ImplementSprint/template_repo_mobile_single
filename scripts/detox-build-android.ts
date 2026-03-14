import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const isWindows = process.platform === 'win32';
const gradleWrapper = isWindows ? 'gradlew.bat' : './gradlew';
const androidDir = join(process.cwd(), 'android');
const gradlePropertiesPath = join(androidDir, 'gradle.properties');
const gradleWrapperPath = join(androidDir, gradleWrapper);
const kotlinVersion = '2.0.21';

function run(command: string, args: string[], cwd = process.cwd()): void {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: isWindows,
  });

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }

  if (typeof result.status !== 'number') {
    process.exit(1);
  }
}

function ensureAndroidProject(): void {
  const hasAndroidDir = existsSync(androidDir);
  const hasGradleWrapper = existsSync(gradleWrapperPath);

  if (!hasAndroidDir || !hasGradleWrapper) {
    run('npx', ['expo', 'prebuild', '--platform', 'android', '--non-interactive']);
  }
}

function normalizeGradleProperties(): void {
  if (!existsSync(gradlePropertiesPath)) {
    return;
  }

  const raw = readFileSync(gradlePropertiesPath, 'utf8');
  const normalizedLines = raw
    .replaceAll('\r\n', '\n')
    .split('\n')
    .filter((line) => !line.startsWith('kotlinVersion='));

  normalizedLines.push(`kotlinVersion=${kotlinVersion}`);

  writeFileSync(gradlePropertiesPath, `${normalizedLines.join('\n').replace(/\n+$/u, '')}\n`, 'utf8');
}

ensureAndroidProject();
normalizeGradleProperties();

run(gradleWrapper, ['assembleDebug', 'assembleAndroidTest', '-DtestBuildType=debug'], androidDir);
