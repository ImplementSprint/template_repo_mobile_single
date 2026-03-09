const { spawnSync } = require('node:child_process');
const { existsSync, readFileSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const isWindows = process.platform === 'win32';
const gradleWrapper = isWindows ? 'gradlew.bat' : './gradlew';
const androidDir = join(process.cwd(), 'android');
const gradlePropertiesPath = join(androidDir, 'gradle.properties');
const kotlinVersion = '2.0.21';

function normalizeGradleProperties() {
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

normalizeGradleProperties();

const args = ['assembleDebug', 'assembleAndroidTest', '-DtestBuildType=debug'];
const result = spawnSync(gradleWrapper, args, {
  cwd: androidDir,
  stdio: 'inherit',
  shell: isWindows,
});

if (typeof result.status === 'number') {
  process.exit(result.status);
}

process.exit(1);
