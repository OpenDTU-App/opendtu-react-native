import { Octokit } from 'octokit';

import type { FC, PropsWithChildren } from 'react';
import { createContext, useContext, useMemo } from 'react';

export const GithubContext = createContext<Octokit | undefined>(undefined);

export const GithubBaseConfig = {
  owner: 'tbnobody',
  repo: 'OpenDTU',
  headers: {
    'X-GitHub-Api-Version': '2022-11-28',
  },
};

export const GithubProvider: FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const github = useMemo(() => new Octokit({ request: { fetch: fetch } }), []);

  return (
    <GithubContext.Provider value={github}>{children}</GithubContext.Provider>
  );
};

export const useGithub = () => useContext(GithubContext);

export default GithubProvider;
