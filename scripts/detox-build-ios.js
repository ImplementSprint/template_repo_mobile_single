const { spawnSync } = require('node:child_process');
const { cpSync, existsSync, mkdirSync, readdirSync, rmSync } = require('node:fs');
const { join, basename } = require('node:path');

if (process.platform !== 'darwin') {
  console.error('iOS Detox builds require macOS and Xcode.');
  process.exit(1);
}

const rootDir = process.cwd();
const iosDir = join(rootDir, 'ios');
const derivedDataPath = join(iosDir, 'build');
const detoxAppPath = join(derivedDataPath, 'Build', 'Products', 'Debug-iphonesimulator', 'DetoxApp.app');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: false,
    ...options,
  });

  if (typeof result.status === 'number' && result.status !== 0) {
    process.exit(result.status);
  }

  if (typeof result.status !== 'number') {
    process.exit(1);
  }
}

function runAndCapture(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: false,
    ...options,
  });

  if (typeof result.status === 'number' && result.status !== 0) {
    process.stderr.write(result.stderr || '');
    process.exit(result.status);
  }

  if (typeof result.status !== 'number') {
    process.exit(1);
  }

  return result.stdout || '';
}

function ensureIosProject() {
  if (!existsSync(iosDir)) {
    run('npx', ['expo', 'prebuild', '--platform', 'ios', '--non-interactive'], { cwd: rootDir });
  }
}

function installPodsIfNeeded() {
  const podfilePath = join(iosDir, 'Podfile');
  if (existsSync(podfilePath)) {
    run('npx', ['pod-install', '--project-directory=ios'], { cwd: rootDir });
  }
}

function findWorkspace() {
  const entries = readdirSync(iosDir, { withFileTypes: true });
  const workspace = entries.find(
    (entry) => entry.isDirectory() && entry.name.endsWith('.xcworkspace') && entry.name !== 'Pods.xcworkspace',
  );

  if (!workspace) {
    console.error('Unable to find an Xcode workspace in ios/.');
    process.exit(1);
  }

  return join(iosDir, workspace.name);
}

function resolveScheme(workspacePath) {
  const output = runAndCapture('xcodebuild', ['-list', '-json', '-workspace', workspacePath], { cwd: rootDir });
  const parsed = JSON.parse(output);
  const schemes = parsed.workspace?.schemes || [];
  const scheme = schemes.find((candidate) => candidate && !candidate.toLowerCase().includes('pods'));

  if (!scheme) {
    console.error('Unable to resolve a non-Pods Xcode scheme for Detox iOS build.');
    process.exit(1);
  }

  return scheme;
}

function shouldIgnoreAppBundle(name) {
  return /tests?\.app$/iu.test(name) || /uitests?\.app$/iu.test(name);
}

function collectAppBundles(rootPath) {
  if (!existsSync(rootPath)) {
    return [];
  }

  const appBundles = [];
  const pending = [rootPath];

  while (pending.length > 0) {
    const currentPath = pending.pop();
    const entries = readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const entryPath = join(currentPath, entry.name);

      if (entry.name.endsWith('.app')) {
        if ((entry.isDirectory() || entry.isSymbolicLink()) && !shouldIgnoreAppBundle(entry.name)) {
          appBundles.push(entryPath);
        }

        continue;
      }

      if (entry.isDirectory()) {
        pending.push(entryPath);
      }
    }
  }

  return appBundles;
}

function scoreBuiltApp(appPath, scheme) {
  let score = 0;

  if (appPath.includes('Debug-iphonesimulator')) {
    score += 100;
  }

  if (basename(appPath) === `${scheme}.app`) {
    score += 50;
  }

  if (!appPath.includes('Release')) {
    score += 10;
  }

  return score;
}

function findBuiltApp(productsRoot, scheme) {
  const appBundles = collectAppBundles(productsRoot);

  if (appBundles.length === 0) {
    console.error(`Unable to find a built .app under ${productsRoot}.`);
    process.exit(1);
  }

  const sortedAppBundles = [...appBundles];
  sortedAppBundles.sort((left, right) => scoreBuiltApp(right, scheme) - scoreBuiltApp(left, scheme));
  const [bestMatch] = sortedAppBundles;

  if (!bestMatch) {
    console.error('Unable to find a built .app in Xcode derived data products output.');
    process.exit(1);
  }

  return bestMatch;
}

ensureIosProject();
installPodsIfNeeded();

const workspacePath = findWorkspace();
const scheme = resolveScheme(workspacePath);

run(
  'xcodebuild',
  [
    '-workspace',
    workspacePath,
    '-scheme',
    scheme,
    '-configuration',
    'Debug',
    '-sdk',
    'iphonesimulator',
    '-derivedDataPath',
    derivedDataPath,
    '-destination',
    'generic/platform=iOS Simulator',
    'build',
  ],
  { cwd: rootDir },
);

const productsRoot = join(derivedDataPath, 'Build', 'Products');
const productsDir = join(productsRoot, 'Debug-iphonesimulator');
const builtAppPath = findBuiltApp(productsRoot, scheme);

mkdirSync(join(productsDir), { recursive: true });

if (builtAppPath !== detoxAppPath) {
  rmSync(detoxAppPath, { recursive: true, force: true });
  cpSync(builtAppPath, detoxAppPath, { recursive: true });
}

console.log(`Prepared Detox iOS app at ${basename(detoxAppPath)}`);