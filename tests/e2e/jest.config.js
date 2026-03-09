module.exports = {
  rootDir: '../..',
  testTimeout: 120000,
  testMatch: ['<rootDir>/tests/e2e/**/*.e2e.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/e2e/init.js'],
  reporters: ['detox/runners/jest/streamlineReporter'],
  testEnvironment: '<rootDir>/tests/e2e/DetoxJestCircusEnvironment.js',
  verbose: true,
};
