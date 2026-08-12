/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  rootDir: '.',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
    '\\.(css|less|scss)$': 'jest-css-modules-transform'
  },
  moduleNameMapper: {
    '^@api$': '<rootDir>/src/utils/burger-api.ts',
    '^@utils-types$': '<rootDir>/src/utils/types.ts',
    '^@slices$': '<rootDir>/src/services/slices',
    '^@selectors$': '<rootDir>/src/services/selectors',
    '^@components$': '<rootDir>/src/components',
    '^@ui-pages$': '<rootDir>/src/components/ui/pages',
    '^@ui$': '<rootDir>/src/components/ui',
    '^@pages$': '<rootDir>/src/pages',
    '\\.(jpg|jpeg|png|svg|gif|webp)$':
      '<rootDir>/src/utils/__mocks__/fileMock.js'
  },
  clearMocks: true,
  collectCoverageFrom: [
    'src/services/slices/**/*.{ts,tsx}',
    '!src/services/slices/index.ts'
  ],
  coverageDirectory: 'coverage'
};
