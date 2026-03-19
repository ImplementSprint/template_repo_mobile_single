import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const isWindows = process.platform === 'win32';
const gradleWrapper = isWindows ? 'gradlew.bat' : './gradlew';
const androidDir = join(process.cwd(), 'android');
const gradlePropertiesPath = join(androidDir, 'gradle.properties');
const gradleWrapperPath = join(androidDir, gradleWrapper);
const debugApkDir = join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug');
const expectedDebugApkPath = join(debugApkDir, 'app-debug.apk');
const kotlinVersion = '2.0.21';
const gradleTaskArgs = ['assembleDebug', 'assembleAndroidTest', '-DtestBuildType=debug'];

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

function runGradleBuild(): void {
  if (isWindows) {
    run(gradleWrapper, gradleTaskArgs, androidDir);
    return;
  }

  run('chmod', ['+x', './gradlew'], androidDir);
  run('bash', ['./gradlew', ...gradleTaskArgs], androidDir);
}

function ensureExpectedDebugApk(): void {
  if (existsSync(expectedDebugApkPath)) {
    return;
  }

  if (!existsSync(debugApkDir)) {
    console.error(`Missing APK output directory: ${debugApkDir}`);
    process.exit(1);
  }

  const debugApkCandidates = readdirSync(debugApkDir)
    .filter((fileName) => fileName.endsWith('.apk'))
    .sort();

  const [firstCandidate] = debugApkCandidates;

  if (!firstCandidate) {
    console.error(`No debug APK found under: ${debugApkDir}`);
    process.exit(1);
  }

  const candidatePath = join(debugApkDir, firstCandidate);

  mkdirSync(debugApkDir, { recursive: true });
  copyFileSync(candidatePath, expectedDebugApkPath);
  console.log(`Normalized debug APK for Detox: ${firstCandidate} -> app-debug.apk`);
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

runGradleBuild();
ensureExpectedDebugApk();
