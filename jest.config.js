export default {
    testEnvironment: 'node', 
    testPathIgnorePatterns: ['/node_modules/', '/dist/'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest'
    }
};