import styled from 'styled-components';

import type { MD3Theme } from 'react-native-paper';
import { List } from 'react-native-paper';

const StyledListItem = styled(List.Item)`
  background-color: ${props =>
    (props.theme as MD3Theme).colors.elevation.level2};
  border-radius: 16px;
  margin-left: 16px;
  margin-right: 16px;
  padding: 12px 8px;
`;

export default StyledListItem;
