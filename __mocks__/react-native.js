/**
 * @format
 */
/* eslint-env jest */

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');

  RN.NativeModules.SettingsManager = {
    settings: {
      AppleLocale: 'en-US',
      AppleLanguages: ['fr-FR', 'en-US'],
    },
  };
  return RN;
});

jest.mock('react-native/Libraries/Utilities/Platform.android', () => ({
  OS: 'android',
  select: jest.fn(),
}));

jest.mock('react-native/Libraries/Utilities/Platform.ios', () => ({
  OS: 'ios',
  select: jest.fn(),
}));
