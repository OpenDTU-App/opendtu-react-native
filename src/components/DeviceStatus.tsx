import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';

import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Icon, Text, TouchableRipple, useTheme } from 'react-native-paper';

import useLivedata from '@/hooks/useLivedata';

import { useAppSelector } from '@/store';

const DeviceStatus: FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation() as NavigationProp<ParamListBase>;
  const hints = useLivedata(state => state?.hints);
  const deviceIndex = useAppSelector(state => state.settings.selectedDtuConfig);

  const handleShowDeviceInfo = useCallback(() => {
    if (deviceIndex === null) return;
    navigation.navigate('DeviceSettingsScreen', { index: deviceIndex });
  }, [deviceIndex, navigation]);

  if (!hints) return null;

  if (!hints.default_password && !hints.radio_problem && !hints.time_sync)
    return null;

  return (
    <Box style={{ marginHorizontal: 8, marginBottom: 12 }}>
      <TouchableRipple
        onPress={handleShowDeviceInfo}
        borderless
        rippleColor={theme.colors.onErrorContainer}
        underlayColor={theme.colors.onErrorContainer}
        style={{
          borderRadius: 16,
          maxWidth: '100%',
          backgroundColor: theme.colors.errorContainer,
        }}
      >
        <Box p={12}>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box maxW="80%">
              <Text style={{ color: theme.colors.onErrorContainer }}>
                {t('livedata.hintsWarning')}
              </Text>
            </Box>
            <Icon
              size={24}
              source="chevron-right"
              color={theme.colors.onErrorContainer}
            />
          </Box>
        </Box>
      </TouchableRipple>
    </Box>
  );
};

export default DeviceStatus;
