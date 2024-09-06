import type { FC } from 'react';
import type { SurfaceProps } from 'react-native-paper';
import { Surface } from 'react-native-paper';
import type { ThemeProp } from 'react-native-paper/lib/typescript/types';

import styled from 'styled-components';

const InternalStyledSurface = styled(Surface)<ExtraProps>`
  border-radius: ${({ theme, roundness }) =>
    theme.roundness! * (roundness ?? 4)}px;
  flex: 1;
  box-shadow: ${({ theme, disableShadow }) =>
    disableShadow ? 'none' : theme.shadow};
`;

interface ExtraProps {
  roundness?: number;
  disableShadow?: boolean;
}

export type StyledSurfaceProps = SurfaceProps & {
  theme: ThemeProp;
} & ExtraProps;

const StyledSurface: FC<StyledSurfaceProps> = ({ children, ...props }) => (
  <InternalStyledSurface elevation={5} mode="flat" disableShadow {...props}>
    {children}
  </InternalStyledSurface>
);

export default StyledSurface;
