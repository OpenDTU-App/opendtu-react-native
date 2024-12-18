import type { FC, PropsWithChildren } from 'react';
import { Box } from 'react-native-flex-layout';

import useOrientation, { Orientation } from '@/hooks/useOrientation';

export interface OrientationContainerProps extends PropsWithChildren {
  flexOnPortrait?: number;
  flexOnLandscape?: number;
  display?: 'flex' | 'none';
  flexDirection?: 'row' | 'column';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
}

const OrientationContainer: FC<OrientationContainerProps> = ({
  children,
  flexOnLandscape = 0.5,
  flexOnPortrait = 1,
  display = 'flex',
  flexDirection = 'column',
  alignItems = 'stretch',
  justifyContent = 'flex-start',
}) => {
  const { orientation } = useOrientation();

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        height: '100%',
      }}
    >
      <Box
        style={{
          flex:
            orientation === Orientation.PORTRAIT
              ? flexOnPortrait
              : flexOnLandscape,
          display,
          flexDirection,
          alignItems,
          justifyContent,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default OrientationContainer;
