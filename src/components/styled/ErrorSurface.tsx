import type { FC } from 'react';
import { useTheme } from 'react-native-paper';

import type { StyledSurfaceProps } from '@/components/styled/StyledSurface';
import StyledSurface from '@/components/styled/StyledSurface';

const ErrorSurface: FC<StyledSurfaceProps> = ({ children, ...props }) => {
  const theme = useTheme();

  return (
    <StyledSurface
      style={{
        backgroundColor: theme.colors.errorContainer,
      }}
      {...props}
      theme={theme}
    >
      {children}
    </StyledSurface>
  );
};

export default ErrorSurface;
