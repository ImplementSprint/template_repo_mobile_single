const fs = require('node:fs');
const path = require('node:path');

function collectApkCandidates(rootPath) {
  if (!fs.existsSync(rootPath)) {
    return [];
  }

  const stack = [rootPath];
  const results = [];

  while (stack.length > 0) {
    const current = stack.pop();
    if (!current) {
      break;
    }

    const entries = fs.readdirSync(current, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith('.apk')) {
        results.push(fullPath);
      }
    }
  }

  return results.sort();
}

function ensureExpectedDebugApk() {
  const expectedPath = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');

  if (fs.existsSync(expectedPath)) {
    return;
  }

  const apkRoot = path.join(process.cwd(), 'android', 'app', 'build', 'outputs', 'apk');
  const candidates = collectApkCandidates(apkRoot);

  if (candidates.length === 0) {
    return;
  }

  const preferred = candidates.find((candidate) => candidate.includes(path.join('debug', 'app-debug')));
  const source = preferred || candidates[0];

  if (!source) {
    return;
  }

  fs.mkdirSync(path.dirname(expectedPath), { recursive: true });
  fs.copyFileSync(source, expectedPath);
  console.log(`[detox-apk] Normalized APK for Detox: ${source} -> ${expectedPath}`);
}

module.exports = async () => {
  ensureExpectedDebugApk();
  await require('detox/runners/jest/globalSetup')();
};
