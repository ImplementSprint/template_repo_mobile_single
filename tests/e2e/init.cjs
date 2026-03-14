/* global beforeAll, beforeEach, afterAll */

const packageJson = require('../../package.json');
const adapter = require('detox/runners/jest/adapter.js');
const specReporter = require('detox/runners/jest/specReporter.js');
const detox = require('detox');

const config = packageJson.detox;
const detoxCircus = Reflect.get(globalThis, 'detoxCircus');

if (detoxCircus && typeof detoxCircus.getEnv === 'function') {
  const environment = detoxCircus.getEnv();

  environment.addEventsListener(adapter);
  environment.addEventsListener(specReporter);
}

beforeAll(async () => {
  await detox.init(config);
}, 300000);

beforeEach(async () => { 
  try {
    await adapter.beforeEach();
  } catch (error) {
    await detox.cleanup();
    throw error;
  }
});

afterAll(async () => {
  await adapter.afterAll();
  await detox.cleanup();
});
