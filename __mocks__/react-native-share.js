/**
 * @format
 */
/* eslint-env jest */

jest.mock('react-native-share', () => ({
  default: jest.fn(),
}));
