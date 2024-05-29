import type { FC, PropsWithChildren } from 'react';
import { View } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Icon, Text, useTheme } from 'react-native-paper';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

import StyledSurface from '@/components/styled/StyledSurface';

import useHasLiveData from '@/hooks/useHasLiveData';
import { spacing } from '@/constants';

export interface StatusWidgetProps extends PropsWithChildren {
  title?: string;
  maxWidth?: number;
  icon?: string;
  iconSize?: number;
}

const StatusWidget: FC<StatusWidgetProps> = ({
  children,
  title,
  maxWidth,
  icon,
  iconSize,
}) => {
  const hasLiveData = useHasLiveData();
  const theme = useTheme();

  return (
    <StyledSurface mode="elevated">
      {hasLiveData ? (
        <Box style={{ margin: 12 }}>
          {title ? (
            <Box
              mb={8}
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: spacing,
              }}
            >
              <Text variant="titleLarge" style={{ fontSize: 20 }}>
                {title}
              </Text>
              {icon ? <Icon size={iconSize ?? 20} source={icon} /> : null}
            </Box>
          ) : null}
          {children}
        </Box>
      ) : (
        <SkeletonPlaceholder
          backgroundColor={theme.colors.elevation.level1}
          highlightColor={theme.colors.elevation.level2}
          borderRadius={16}
          speed={1000}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              width: '100%',
              maxWidth,
            }}
          >
            <View style={{ width: '100%', height: 80 }} />
          </View>
        </SkeletonPlaceholder>
      )}
    </StyledSurface>
  );
};

export default StatusWidget;
