import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import licenses from '@root/licenses.json';
import type { Licenses } from 'npm-license-crawler';

import type { FC } from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import { Appbar, List, useTheme } from 'react-native-paper';

import { StyledSafeAreaView } from '@/style';

const LicensesScreen: FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={t('aboutApp.licenses')} onPress={handleBack} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
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
                            }
                          }
                        : undefined
                    }
                  />
                );
              },
            )}
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default LicensesScreen;
