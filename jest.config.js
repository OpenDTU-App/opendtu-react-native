/** @type import('jest').Config **/
const config = {
  preset: 'react-native',
  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    // 'node_modules/(?!(jest-)?react-native|@react-native|@react-native-community|@react-navigation)',
  ],
  moduleNameMapper: {
    // Force module uuid to resolve with the CJS entry point, because Jest does not support package.json.exports. See https://github.com/uuidjs/uuid/issues/451
    uuid: require.resolve('uuid'),
    'ip-regex': require.resolve('ip-regex'),
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  reporters: [['github-actions', { silent: false }], 'summary'],
};

module.exports = config;
