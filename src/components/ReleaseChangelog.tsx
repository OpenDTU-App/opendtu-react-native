import type { FC } from 'react';
import type { RenderRules } from 'react-native-markdown-display';
import Markdown from 'react-native-markdown-display';
import { Text, useTheme } from 'react-native-paper';

import { Text as RNText } from 'react-native';

export interface ReleaseChangelogProps {
  releaseBody?: string;
}

const rules: RenderRules = {
  link: (node, children) => <RNText key={node.key}>{children}</RNText>,
  heading1: (node, children) => (
    <Text key={node.key} variant="headlineLarge">
      {children}
    </Text>
  ),
  heading2: (node, children) => (
    <Text key={node.key} variant="headlineMedium">
      {children}
    </Text>
  ),
  heading3: (node, children) => (
    <Text key={node.key} variant="headlineSmall">
      {children}
    </Text>
  ),
  heading4: (node, children) => (
    <Text key={node.key} variant="titleLarge">
      {children}
    </Text>
  ),
  heading5: (node, children) => (
    <Text key={node.key} variant="titleMedium">
      {children}
    </Text>
  ),
  heading6: (node, children) => (
    <Text key={node.key} variant="titleSmall">
      {children}
    </Text>
  ),
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
