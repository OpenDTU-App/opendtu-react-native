import type { FC } from 'react';
import type { SurfaceProps, ThemeBase } from 'react-native-paper';
import { Surface, useTheme } from 'react-native-paper';

import styled from 'styled-components';

const settingsSurfaceBorderRadiusFactor = 4;

export const settingsSurfaceRoundness = (theme: ThemeBase) => {
  return theme.roundness! * settingsSurfaceBorderRadiusFactor;
};

export interface SettingsSurfaceProps extends SurfaceProps {
  disablePadding?: boolean;
}

const InternalSettingsSurface = styled(Surface)<SettingsSurfaceProps>`
  margin: 4px 16px 12px;
  padding: ${props => (props.disablePadding ? '0' : '0 4px')};
  border-radius: ${props =>
    (props.theme.roundness ?? 0) * settingsSurfaceBorderRadiusFactor}px;
`;

const SettingsSurface: FC<SettingsSurfaceProps> = ({
  children,
  disablePadding,
  ...props
}) => {
  const rnpTheme = useTheme();
  const theme = props.theme ?? rnpTheme;

  return (
    <InternalSettingsSurface
      theme={theme}
      {...props}
      mode="flat"
      elevation={1}
      disablePadding={disablePadding}
    >
      {children}
    </InternalSettingsSurface>
  );
};

export default SettingsSurface;
