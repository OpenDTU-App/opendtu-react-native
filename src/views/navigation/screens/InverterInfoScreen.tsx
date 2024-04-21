import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import useInverters from '@/hooks/useInverters';

import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const InverterInfoScreen: FC<PropsWithNavigation> = ({ navigation, route }) => {
  const { params } = route;
  const { inverterSerial } = params as { inverterSerial: string };
  const theme = useTheme();
  const { t } = useTranslation();

  const inverter = useInverters(state =>
    state?.find(inv => inv.serial === inverterSerial),
  );

  const handleNavigateEventLog = useCallback(() => {
    navigation.navigate('InverterEventLogScreen', { inverterSerial });
  }, [inverterSerial, navigation]);

  if (!inverter) {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }

    return null;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={inverter.name} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <List.Section>
              <List.Item
                title={t('inverter.eventLog.title')}
                left={props => <List.Icon {...props} icon="history" />}
                onPress={handleNavigateEventLog}
              />
            </List.Section>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default InverterInfoScreen;
