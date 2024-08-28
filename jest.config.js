/** @type {import('jest').Config} */
const config = {
  cacheDirectory: './.jest',
  clearMocks: true,
  collectCoverageFrom: ['**/*.ts'],
  coverageDirectory: './coverage',
  coverageReporters: ['json', 'lcov', 'html', 'text'],
  reporters: ['jest-wip-reporter'],
  roots: ['./src/', './test/'],
  testEnvironment: 'node',
  testRegex: '.*/.*.test\\.[jt]sx?$',
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      diagnostics: false,
      isolatedModules: true,
      tsconfig: 'tsconfig.json',
    }],
  },
  verbose: true,
}

module.exports = config
