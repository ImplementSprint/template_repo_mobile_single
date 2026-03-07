const { spawnSync } = require('node:child_process');
const { join } = require('node:path');

const isWindows = process.platform === 'win32';
const gradleWrapper = isWindows ? 'gradlew.bat' : './gradlew';
const androidDir = join(process.cwd(), 'android');

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
