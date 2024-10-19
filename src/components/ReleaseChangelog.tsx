import type { FC } from 'react';
import type { RenderRules } from 'react-native-markdown-display';
import Markdown from 'react-native-markdown-display';
import { useTheme } from 'react-native-paper';

import { Text as RNText } from 'react-native';

export interface ReleaseChangelogProps {
  releaseBody?: string;
}

const rules: RenderRules = {
  link: (node, children) => <RNText key={node.key}>{children}</RNText>,
};

const ReleaseChangelog: FC<ReleaseChangelogProps> = ({ releaseBody }) => {
  const theme = useTheme();

  return (
    <Markdown
      style={{
        body: {
          color: theme.colors.onSurface,
        },
        link: { textDecorationLine: 'none' },
      }}
      rules={rules}
    >
      {releaseBody || ''}
    </Markdown>
  );
};

export default ReleaseChangelog;
