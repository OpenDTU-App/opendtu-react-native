import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, useTheme, Button } from 'react-native-paper';

import useInverters from '@/hooks/useInverters';

import { StyledSafeAreaView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';
import styled from 'styled-components';

const StyledButton = styled(Button)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
`;

interface BoxComponentProps {
  title: string;
  onPress: () => void;
  icon: string;
}

const BoxComponent: FC<BoxComponentProps> = ({ title, onPress, icon }) => {
  return (
    <StyledButton
      mode="elevated"
      onPress={onPress}
      icon={icon}
      contentStyle={{ padding: 4, justifyContent: 'flex-start' }}
      touchableStyle={{ flex: 1 }}
    >
      {title}
    </StyledButton>
  );
};

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
          <ScrollView style={{ padding: 8 }}>
            <Box style={{ gap: 8, display: 'flex' }}>
              {/*<List.Section>
              <List.Item
                title={t('inverter.eventLog.title')}
                left={props => <List.Icon {...props} icon="history" />}
                onPress={handleNavigateEventLog}
              />
            </List.Section>*/}
              {/*<BoxComponent
              title={t('inverter.eventLog.title')}
              onClick={handleNavigateEventLog}
              icon="history"
            />*/}
              {/* inverter logs, grid profile, get/srt limtis, turn on/off */}
              <BoxComponent
                title={t('inverter.eventLog.title')}
                onPress={handleNavigateEventLog}
                icon="history"
              />
              <BoxComponent
                title={t('inverter.limits.title')}
                onPress={() => {}}
                icon="tune"
              />
              <Box style={{ gap: 8, flexDirection: 'row' }}>
                <BoxComponent
                  title={t('inverter.gridProfile.title')}
                  onPress={() => {}}
                  icon="power-plug"
                />
                <BoxComponent
                  title={t('inverter.control.title')}
                  onPress={() => {}}
                  icon="power"
                />
              </Box>
            </Box>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default InverterInfoScreen;
