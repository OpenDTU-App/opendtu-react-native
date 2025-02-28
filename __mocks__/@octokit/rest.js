/**
 * @format
 */
/* eslint-env jest */
jest.mock('@octokit/rest', () => {
  const Octokit = jest.requireActual('@octokit/rest');

  const request = () =>
    new Promise(resolve => {
      resolve({ status: 302, headers: { location: 'mock-url' } });
    });
  Octokit.mockImplementation(() => ({ request }));
  return Octokit;
});
