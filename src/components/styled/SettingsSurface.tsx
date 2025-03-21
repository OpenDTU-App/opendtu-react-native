import type { FC } from 'react';
import type { SurfaceProps, ThemeBase } from 'react-native-paper';
import { Surface, useTheme } from 'react-native-paper';

import styled from 'styled-components';

const settingsSurfaceBorderRadiusFactor = 3;

export const settingsSurfaceRoundness = (theme: ThemeBase) => {
  return theme.roundness! * settingsSurfaceBorderRadiusFactor;
};

const InternalSettingsSurface = styled(Surface)`
  margin: 4px 16px 12px;
  border-radius: ${props =>
    (props.theme.roundness ?? 0) * settingsSurfaceBorderRadiusFactor}px;
`;

const SettingsSurface: FC<SurfaceProps> = ({ children, ...props }) => {
  const rnpTheme = useTheme();
  const theme = props.theme ?? rnpTheme;

  return (
    <InternalSettingsSurface theme={theme} {...props}>
      {children}
    </InternalSettingsSurface>
  );
};

export default SettingsSurface;
