/* eslint-disable simple-import-sort/imports */
/**
 * @format
 */
/* eslint-env jest */
import { test } from '@jest/globals';
import ReactTestRenderer from 'react-test-renderer';

import App from '@/App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
