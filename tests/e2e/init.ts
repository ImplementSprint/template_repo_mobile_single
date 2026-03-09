/* global beforeAll, beforeEach, afterAll */

import packageJson from '../../package.json';
import adapter from 'detox/runners/jest/adapter';
import specReporter from 'detox/runners/jest/specReporter';

import detox from 'detox';
const config = packageJson.detox;

type GlobalWithDetoxCircus = typeof globalThis & {
  detoxCircus?: { getEnv: () => { addEventsListener: (listener: unknown) => void } };
};

const globalWithDetoxCircus = globalThis as GlobalWithDetoxCircus;

if (globalWithDetoxCircus.detoxCircus) {
  const environment = globalWithDetoxCircus.detoxCircus.getEnv();

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
