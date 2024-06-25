import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import { ScrollView } from 'react-native';

import type { Inverter, InverterFromStatus } from '@/types/opendtu/status';

import { getOpenDTUValueText } from '@/components/OpenDTUValue';
import StyledSurface from '@/components/styled/StyledSurface';

import useLivedata from '@/hooks/useLivedata';

import { rootLogging } from '@/utils/log';

import { StyledScrollView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';
import type { DataKeys } from '@/views/navigation/screens/InverterInfoScreen';

const log = rootLogging.extend('InverterDataScreen');

const InverterDataScreen: FC<PropsWithNavigation> = ({ navigation, route }) => {
  const { params } = route;
  const { inverterSerial, dataKey } = params as {
    inverterSerial: string;
    dataKey: DataKeys;
  };
  const theme = useTheme();
  const { t } = useTranslation();

  const inverter = useLivedata(state =>
    state?.inverters?.find(inv => inv.serial === inverterSerial),
  );

  const livedataInverter = useLivedata(
    state =>
      state?.inverters.find(inv => inv.serial === inverterSerial) as
        | Inverter
        | InverterFromStatus
        | undefined,
  );

  if (!inverter) {
    if (navigation.canGoBack()) {
      log.warn('Inverter not found, going back', inverterSerial);
      navigation.goBack();
    }

    return null;
  }

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={`${inverter.name} • ${t(`inverter.livedata.${dataKey}`)}`}
        />
      </Appbar.Header>
      <StyledScrollView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            {typeof livedataInverter !== 'undefined' &&
            'AC' in livedataInverter &&
            'DC' in livedataInverter &&
            'INV' in livedataInverter ? (
              <StyledSurface theme={theme} style={{ marginHorizontal: 8 }}>
                {Object.entries(
                  livedataInverter[dataKey as keyof Inverter],
                ).map(([dataIdx, data]) => (
                  <List.Section
                    key={`inverter-data-${dataIdx}`}
                    title={
                      dataKey === 'DC' && data.name?.u
                        ? t('inverter.livedata.string', {
                            stringNumber: data.name.u,
                          })
                        : dataKey === 'INV'
                          ? t('inverter.livedata.INV')
                          : dataKey === 'AC' && dataIdx.length > 0
                            ? t('inverter.livedata.phase', {
                                phaseNumber: parseInt(dataIdx) + 1,
                              })
                            : undefined
                    }
                  >
                    {Object.entries(data)
                      .filter(([key]) => key !== 'name')
                      .map(([key, value]) => (
                        <List.Item
                          key={`inverter-data-${dataIdx}-${key}`}
                          title={t(`inverter.livedata.dataKeys.${key}`)}
                          description={getOpenDTUValueText(value as unknown)}
                        />
                      ))}
                  </List.Section>
                ))}
              </StyledSurface>
            ) : null}
          </ScrollView>
        </Box>
      </StyledScrollView>
    </>
  );
};

export default InverterDataScreen;
