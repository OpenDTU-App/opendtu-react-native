/**
 * @format
 */
/* eslint-env jest */
// import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

// jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn().mockImplementation(({ children }) => children),
    SafeAreaConsumer: jest
      .fn()
      .mockImplementation(({ children }) => children(inset)),
    useSafeAreaInsets: jest.fn().mockImplementation(() => inset),
    SafeAreaView: jest.fn().mockImplementation(({ children }) => children),
  };
});
