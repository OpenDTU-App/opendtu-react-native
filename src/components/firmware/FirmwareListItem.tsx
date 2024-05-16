import type { FC } from 'react';
import { useMemo, useCallback } from 'react';
import type { Release } from '@octokit/webhooks-types';
import moment from 'moment/moment';
import { Badge, Divider, List, Text } from 'react-native-paper';
import useDtuState from '@/hooks/useDtuState';
import { Linking, Text as RNText, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { RenderRules } from 'react-native-markdown-display';
import Markdown from 'react-native-markdown-display';
import SettingsSurface, {
  settingsSurfaceBorderRadius,
} from '@/components/styled/SettingsSurface';
import useHasAuthConfigured from '@/hooks/useHasAuthConfigured';
import capitalize from '@/utils/capitalize';
import useAppLanguage from '@/hooks/useAppLanguage';
import { compare } from 'compare-versions';
import { minimumOpenDtuFirmwareVersion } from '@/constants';
import type { SupportedLanguage } from '@/translations';

export interface FirmwareListItemProps {
  release: Release;
  selectRelease: (release: Release) => void;
  latestReleaseTag?: string;
}

const rules: RenderRules = {
  link: (node, children) => <RNText key={node.key}>{children}</RNText>,
};

const needsCapitalization: Record<SupportedLanguage, boolean> = {
  en: false,
  de: true,
};

const FirmwareListItem: FC<FirmwareListItemProps> = ({
  release,
  selectRelease,
  latestReleaseTag,
}) => {
  const { t } = useTranslation();
  const installedFirmware = useDtuState(state => state?.systemStatus?.git_hash);

  const authStringConfigured = useHasAuthConfigured();
  const language = useAppLanguage();

  const handleOpenGithub = useCallback(async () => {
    const url = release.html_url;

    if (await Linking.canOpenURL(url)) {
      await Linking.openURL(url);
    }
  }, [release.html_url]);

  const handleInstallFirmware = useCallback(() => {
    selectRelease(release);
  }, [selectRelease, release]);

  const downloadDisabled = useMemo(
    () => release.tag_name === installedFirmware || !authStringConfigured,
    [authStringConfigured, installedFirmware, release.tag_name],
  );

  const description = useMemo(() => {
    const date = moment(release.published_at).format('LLLL');
    const timeAgo = moment(release.published_at).fromNow();
    const capitalized = needsCapitalization[language]
      ? capitalize(timeAgo)
      : timeAgo;
    return `${t('firmwares.publishedAgo', { timeAgo: capitalized })}\n${date}`;
  }, [release.published_at, language, t]);

  const isMinimumRecommendedVersion = useMemo(
    () => compare(release.tag_name, minimumOpenDtuFirmwareVersion, '='),
    [release.tag_name],
  );

  return (
    <List.Accordion
      key={`firmware-${release.id}`}
      title={
        <View
          style={{
            flexDirection: 'row',
            gap: 4,
          }}
        >
          <Text variant="titleMedium" numberOfLines={1}>
            {release.name}
          </Text>
          {release.tag_name === installedFirmware ? (
            <Badge style={{ alignSelf: 'center' }}>
              {t('firmwares.installedFirmware')}
            </Badge>
          ) : release.tag_name === latestReleaseTag ? (
            <Badge style={{ alignSelf: 'center' }}>
              {t('firmwares.latestFirmware')}
            </Badge>
          ) : null}
          {isMinimumRecommendedVersion ? (
            <Badge style={{ alignSelf: 'center' }}>
              {t('firmwares.recommendedFirmware')}
            </Badge>
          ) : null}
        </View>
      }
      description={description}
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
          onPress={handleInstallFirmware}
          left={props => <List.Icon {...props} icon="download" />}
          borderless
          style={{
            borderBottomLeftRadius: settingsSurfaceBorderRadius,
            borderBottomRightRadius: settingsSurfaceBorderRadius,
            opacity: downloadDisabled ? 0.5 : 1,
          }}
          disabled={downloadDisabled}
        />
      </SettingsSurface>
    </List.Accordion>
  );
};

export default FirmwareListItem;
