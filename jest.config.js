const nextJest = require('next/jest')

const createJestConfig = nextJest({
    // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
    dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
    testEnvironment: 'node',
    // Playwright specs live in ./e2e and should be executed with `npx playwright test`,
    // not Jest. Ignoring the directory keeps Jest runs focused on unit/integration suites.
    testPathIgnorePatterns: ['<rootDir>/e2e/'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
