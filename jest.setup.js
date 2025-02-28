/* eslint-disable @typescript-eslint/no-require-imports */
// noinspection JSConstantReassignment
// eslint-disable-next-line no-global-assign
__DEV__ = false;

// eslint-disable-next-line no-undef
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
