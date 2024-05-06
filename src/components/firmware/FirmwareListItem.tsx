import type { FC } from 'react';
import { useCallback } from 'react';
import type { Release } from '@octokit/webhooks-types';
import moment from 'moment/moment';
import { Badge, Divider, List, Text } from 'react-native-paper';
import useDtuState from '@/hooks/useDtuState';
import { Linking, Text as RNText, View } from 'react-native';
// import { useNavigation } from '@react-navigation/native';
// import type { NavigationProp, ParamListBase } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';

import type { RenderRules } from 'react-native-markdown-display';
import Markdown from 'react-native-markdown-display';
import SettingsSurface, {
  settingsSurfaceBorderRadius,
} from '@/components/styled/SettingsSurface';

export interface FirmwareListItemProps {
  release: Release;
  latestReleaseTag?: string;
}

const rules: RenderRules = {
  link: (node, children) => <RNText key={node.key}>{children}</RNText>,
};

const FirmwareListItem: FC<FirmwareListItemProps> = ({
  release,
  latestReleaseTag,
}) => {
  const { t } = useTranslation();
  const currentRelease = useDtuState(state => state?.systemStatus?.git_hash);
  // const navigation = useNavigation() as NavigationProp<ParamListBase>;

  const handleOpenGithub = useCallback(async () => {
    const url = release.html_url;

    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  }, [release.html_url]);

  /*const handleInstallFirmware = useCallback(() => {

  }, []);*/

  return (
    <List.Accordion
      key={`firmware-${release.id}`}
      title={
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Text variant="titleMedium" numberOfLines={1}>
            {release.name}
          </Text>
          {release.tag_name === latestReleaseTag ? (
            <Badge style={{ alignSelf: 'center' }}>
              {t('firmwares.latestFirmware')}
            </Badge>
          ) : release.tag_name === currentRelease ? (
            <Badge style={{ alignSelf: 'center' }}>
              {t('firmwares.installedFirmware')}
            </Badge>
          ) : null}
        </View>
      }
      description={moment(release.published_at).format('lll')}
    >
      <SettingsSurface style={{ marginHorizontal: 8, flex: 1 }}>
        <View style={{ padding: 8, flex: 1 }}>
          <Markdown
            style={{ link: { textDecorationLine: 'none' } }}
            rules={rules}
          >
            {release.body}
          </Markdown>
        </View>
        <Divider />
        <List.Item
          title={t('firmwares.view_on_github')}
          onPress={handleOpenGithub}
          left={props => <List.Icon {...props} icon="github" />}
        />
        <List.Item
          title={t('firmwares.install_firmware_on_device')}
          onPress={() => {
            // navigation.navigate('FirmwareDownload', { release });
          }}
          left={props => <List.Icon {...props} icon="download" />}
          borderless
          style={{
            borderBottomLeftRadius: settingsSurfaceBorderRadius,
            borderBottomRightRadius: settingsSurfaceBorderRadius,
            opacity: 0.5,
          }}
          disabled={true || release.tag_name === currentRelease}
        />
      </SettingsSurface>
    </List.Accordion>
  );
};

export default FirmwareListItem;
