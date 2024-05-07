import styled from 'styled-components';

import { Surface } from 'react-native-paper';

export const settingsSurfaceBorderRadius = 16;

const SettingsSurface = styled(Surface)`
  margin: 4px 8px 12px;
  border-radius: ${settingsSurfaceBorderRadius}px;
`;

export default SettingsSurface;
