import type { FC } from 'react';
import type { ViewProps } from 'react-native';
import { useTheme } from 'react-native-paper';
import type { ThemeProp } from 'react-native-paper/lib/typescript/types';

import { View } from 'react-native';

export type StyledSurfaceProps = ViewProps & {
  theme: ThemeProp;
  roundness?: number;
};

const StyledSurface: FC<StyledSurfaceProps> = ({ children, ...props }) => {
  const theme = useTheme();

  return (
    <View
      {...props}
      style={{
        //@ts-expect-error: 2698 because idk
        ...(props?.style ?? {}),
        borderRadius: theme.roundness! * (props.roundness ?? 4),
        backgroundColor: theme.colors.elevation.level5,
        flex: 1,
      }}
    >
      {children}
    </View>
  );
};

export default StyledSurface;
