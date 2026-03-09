import type { Config } from 'jest';

const config: Config = {
  rootDir: '../..',
  testTimeout: 120000,
  testMatch: ['<rootDir>/tests/e2e/**/*.e2e.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/init.ts'],
  reporters: ['detox/runners/jest/streamlineReporter'],
  testEnvironment: '<rootDir>/tests/e2e/DetoxJestCircusEnvironment.cjs',
  verbose: true,
};

export default config;
