const fs = require('node:fs');
const path = require('node:path');

function resolveDetoxDir() {
  try {
    return path.dirname(require.resolve('detox/package.json'));
  } catch {
    return null;
  }
}

function ensureFile(filePath, content) {
  if (fs.existsSync(filePath)) {
    return false;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

function main() {
  const detoxDir = resolveDetoxDir();

  if (!detoxDir) {
    console.warn('[detox-compat] Detox is not installed; skipping Jest runner compatibility shims.');
    return;
  }

  const jestRunnerDir = path.join(detoxDir, 'runners', 'jest');

  if (!fs.existsSync(jestRunnerDir)) {
    console.warn('[detox-compat] Detox Jest runner directory is missing; skipping compatibility shims.');
    return;
  }

  const shims = [
    {
      fileName: 'reporter.js',
      target: './streamlineReporter',
    },
    {
      fileName: 'testEnvironment.js',
      target: './JestCircusEnvironment',
    },
  ];

  let createdCount = 0;

  for (const shim of shims) {
    const targetPath = path.join(jestRunnerDir, shim.fileName);
    const sourcePath = path.join(jestRunnerDir, `${shim.target.slice(2)}.js`);

    if (!fs.existsSync(sourcePath)) {
      console.warn(`[detox-compat] Missing source module for ${shim.fileName}: ${sourcePath}`);
      continue;
    }

    const created = ensureFile(targetPath, `module.exports = require('${shim.target}');\n`);

    if (created) {
      createdCount += 1;
      console.log(`[detox-compat] Created ${path.relative(process.cwd(), targetPath)}`);
    }
  }

  if (createdCount === 0) {
    console.log('[detox-compat] Jest runner compatibility shims already present.');
  }
}

main();