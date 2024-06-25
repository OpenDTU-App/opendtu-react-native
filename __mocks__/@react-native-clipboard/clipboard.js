/**
 * @format
 */
/* eslint-env jest */

jest.mock('@react-native-clipboard/clipboard', () => {
  return {
    addListener: jest.fn(),
    removeAllListeners: jest.fn(),
  };
});
