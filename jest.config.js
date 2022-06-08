module.exports = {
    clearMocks: true,
    collectCoverageFrom: ['src/**/*.ts'],
    coveragePathIgnorePatterns: ['index.ts', 'types'],
    coverageReporters: ['cobertura', 'html', 'text-summary', 'text'],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    preset: 'ts-jest',
    reporters: ['default', ['jest-junit', { outputDirectory: 'reports' }]],
    testEnvironment: 'node',
    testPathIgnorePatterns: ['<rootDir>/dist/', '<rootDir>/examples/'],
};
