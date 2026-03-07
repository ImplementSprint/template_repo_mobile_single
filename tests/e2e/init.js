/* global jasmine, beforeAll, beforeEach, afterAll */

const detox = require('detox');
const config = require('../../package.json').detox;
const adapter = require('detox/runners/jest/adapter');
const specReporter = require('detox/runners/jest/specReporter');

jasmine.getEnv().addReporter(adapter);
jasmine.getEnv().addReporter(specReporter);

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