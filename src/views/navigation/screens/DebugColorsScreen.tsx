import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import { ScrollView, View } from 'react-native';

import styled from 'styled-components';

import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const ColorCircle = styled(View)`
  width: 50px;
  height: 50px;
  border-radius: 50px;
`;

const DebugColorsScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const theme = useTheme();
  const { t } = useTranslation();

  const flatColors = Object.entries(theme.colors).map(([key, value]) => {
    if (typeof value === 'string') {
      return (
        <List.Item
          key={key}
          title={key}
          right={() => (
            <ColorCircle
              key={key}
              style={{
                backgroundColor: value,
                borderColor: theme.colors.onSurface,
                borderWidth: 1,
                borderStyle: 'dashed',
              }}
            />
          )}
        />
      );
    }
  });

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('debug.debugColors')} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ flex: 1, width: '100%' }}>
          <ScrollView>{flatColors}</ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default DebugColorsScreen;
