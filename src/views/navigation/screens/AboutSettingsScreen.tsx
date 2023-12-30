import { useNavigation } from '@react-navigation/native';
import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import licenses from 'licenses.json';
import type { Licenses } from 'npm-license-crawler';
import packageJson from 'package.json';

import type { FC } from 'react';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView } from 'react-native';
import { Box } from 'react-native-flex-layout';
import {
  Appbar,
  Badge,
  Button,
  Divider,
  List,
  Text,
  useTheme,
} from 'react-native-paper';

import useHasNewAppVersion from '@/hooks/useHasNewAppVersion';

import { StyledSafeAreaView } from '@/style';

const AboutSettingsScreen: FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const [hasNewAppVersion, releaseInfo] = useHasNewAppVersion();

  const prettyTagName = useMemo(() => {
    if (!releaseInfo?.tag_name) {
      return '';
    }

    return releaseInfo.tag_name.replace(/^v/, '');
  }, [releaseInfo]);

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title={t('settings.aboutApp')} onPress={handleBack} />
      </Appbar.Header>
      <StyledSafeAreaView theme={theme}>
        <Box style={{ width: '100%', flex: 1 }}>
          <ScrollView>
            <Box>
              <Text style={{ textAlign: 'center' }} variant="titleLarge">
                {packageJson.name} {packageJson.version}
              </Text>
              <Box p={8}>
                <Text style={{ textAlign: 'center' }}>
                  {t('aboutApp.projectHint')}
                </Text>
                <Box mt={16} mb={8}>
                  <Button
                    buttonColor="#24292e"
                    textColor="#ffffff"
                    icon="github"
                    onPress={() => Linking.openURL(packageJson.repository.url)}
                  >
                    {t('aboutApp.viewOnGithub')}
                  </Button>
                </Box>
              </Box>
            </Box>
            {hasNewAppVersion ? (
              <>
                <Divider />
                <Box p={8}>
                  <Box
                    style={{
                      display: 'flex',
                      flexDirection: 'row',
                      justifyContent: 'center',
                      gap: 4,
                    }}
                  >
                    <Text variant="titleLarge" style={{ textAlign: 'center' }}>
                      {t('aboutApp.newVersionAvailable')}
                    </Text>
                    <Badge style={{ alignSelf: 'center' }}>
                      {prettyTagName}
                    </Badge>
                  </Box>
                  <Box mt={16} mb={8}>
                    <Button
                      buttonColor="#24292e"
                      textColor="#ffffff"
                      icon="github"
                      onPress={() =>
                        Linking.openURL(releaseInfo?.html_url || '')
                      }
                      disabled={!releaseInfo?.html_url}
                    >
                      {t('aboutApp.viewMore')}
                    </Button>
                  </Box>
                </Box>
              </>
            ) : null}
            <Divider />
            <List.Section>
              <List.Subheader>{t('aboutApp.licenses')}</List.Subheader>
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
            </List.Section>
          </ScrollView>
        </Box>
      </StyledSafeAreaView>
    </>
  );
};

export default AboutSettingsScreen;
