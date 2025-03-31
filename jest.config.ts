import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    setupFiles: ['dotenv/config'],
    verbose: true,
    collectCoverage: true,
    collectCoverageFrom: [
        'src/**/*.{ts,js}',
        '!**/node_modules/**',
        '!**/dist/**',
        '!**/__tests__/**',
    ],
};

export default config; 