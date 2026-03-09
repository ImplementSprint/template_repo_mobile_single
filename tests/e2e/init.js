/* global beforeAll, beforeEach, afterAll */

const detox = require('detox');
const config = require('../../package.json').detox;
const adapter = require('detox/runners/jest/adapter');
const specReporter = require('detox/runners/jest/specReporter');

if (globalThis.detoxCircus) {
  const environment = globalThis.detoxCircus.getEnv();

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