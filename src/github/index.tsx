import { Octokit } from 'octokit';

import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';

export const GithubContext = createContext<Octokit | undefined>(undefined);

export const OpenDTUGithubBaseConfig = {
  owner: 'tbnobody',
  repo: 'OpenDTU',
  headers: {
    'X-GitHub-Api-Version': '2022-11-28',
  },
};

export const AppGithubBaseConfig = {
  owner: 'OpenDTU-App',
  repo: 'opendtu-react-native',
  headers: {
    'X-GitHub-Api-Version': '2022-11-28',
  },
};

export const GithubProvider: FC<PropsWithChildren> = ({ children }) => {
  const github = useMemo(() => new Octokit({ request: { fetch: fetch } }), []);

  return (
    <GithubContext.Provider value={github}>{children}</GithubContext.Provider>
  );
};

export const useGithub = () => useContext(GithubContext);

export default GithubProvider;
