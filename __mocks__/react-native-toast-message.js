/**
 * @format
 */
/* eslint-env jest */

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));
