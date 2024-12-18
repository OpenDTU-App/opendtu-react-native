import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';
import Toast from 'react-native-toast-message';

import { Linking, ScrollView, View } from 'react-native';

import type { Licenses } from 'npm-license-crawler';

import { rootLogging } from '@/utils/log';

import { spacing } from '@/constants';
import { StyledView } from '@/style';
import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

import licenses from '@root/licenses.json';
import Toast from 'react-native-toast-message';

const log = rootLogging.extend('LicensesScreen');

const log = rootLogging.extend('LicensesScreen');

const LicensesScreen: FC<PropsWithNavigation> = ({ navigation }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={t('aboutApp.licenses')} />
      </Appbar.Header>
      <StyledView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            {Object.entries(licenses as unknown as Licenses).map(
              ([key, { licenses, repository, licenseUrl }]) => {
                const [name, version] = key.rsplit('@', 1);

                return (
                  <List.Item
                    key={key}
                    title={name}
                    description={`${licenses} \u2022 ${version}`}
                    onPress={
                      repository || licenseUrl
                        ? async () => {
                            const url = repository || licenseUrl;
                            if (await Linking.canOpenURL(url)) {
                              await Linking.openURL(url);
                            } else {
                              log.error(`Cannot open URL: ${url}`);
                              Toast.show({
                                type: 'error',
                                text1: t('cannotOpenUrl'),
                              });
                            }
                          }
                        : undefined
                    }
                  />
                );
              },
            )}
            <View style={{ height: spacing * 2 }} />
          </ScrollView>
        </Box>
      </StyledView>
    </>
  );
};

export default LicensesScreen;
