export default {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  transform: {},
  collectCoverageFrom: ['src/**/*.js'],
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  globalTeardown: './src/__tests__/teardown.js'
};
