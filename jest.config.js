const jestConfig = require('@action/jest-config');

const currentConfig = {
  ...jestConfig,
  collectCoverage: true,
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    "<rootDir>/rtl.setup.ts",
    "<rootDir>/src/testMocks/localStorageMock.js",
  ],
  globals: {
    'ts-jest': {
      diagnostics: false
    }
  }
};

module.exports = currentConfig;
