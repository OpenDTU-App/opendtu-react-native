/* eslint-disable simple-import-sort/imports */
/**
 * @format
 */
/* eslint-env jest */
import { it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import App from '@/App';

it('renders correctly', async () => {
  render(<App />);
});
