import { Box } from 'react-native-flex-layout';
import type { MD3Theme } from 'react-native-paper';
import { Text, useTheme } from 'react-native-paper';

import styled from 'styled-components';

import type { ExtendedLogProps } from '@/utils/log';

export interface LogLineProps {
  log: ExtendedLogProps;
}

const LogLineItem = styled(Box)<{
  theme: MD3Theme;
}>`
  background-color: #555;
  border-color: #333;
  border-bottom-width: 1px;
  border-top-width: 1px;
  padding: 10px;
`;

const LogLine = ({ log }: LogLineProps) => {
  const theme = useTheme();
  const color = log.options.colors[log.level.text];

  return (
    <LogLineItem theme={theme}>
      <Text style={{ color }}>{log.msg}</Text>
    </LogLineItem>
  );
};

export default LogLine;
