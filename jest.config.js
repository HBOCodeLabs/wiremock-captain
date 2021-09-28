module.exports = {
    clearMocks: true,
    collectCoverageFrom: ['src/**/*.ts'],
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
};
