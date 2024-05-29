import styled from 'styled-components';

import type { SurfaceProps } from 'react-native-paper';
import { Surface } from 'react-native-paper';
import type { FC } from 'react';

const InternalStyledSurface = styled(Surface)`
  border-radius: 16px;
  flex: 1;
`;

const StyledSurface: FC<SurfaceProps> = props => (
  <InternalStyledSurface elevation={5} {...props} />
);

export default StyledSurface;
