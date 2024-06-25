/**
 * @format
 */
// Note: import explicitly to use the types shipped with jest.
import React from 'react';
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import App from '@/App';

import 'react-native';
import { it } from '@jest/globals';

it('renders correctly', () => {
  renderer.create(<App />);
});
