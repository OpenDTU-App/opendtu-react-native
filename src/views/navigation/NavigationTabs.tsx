import type { ComponentProps, FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BottomNavigation as BottomNavigationPaper,
  useTheme,
} from 'react-native-paper';

import useHasAuthConfigured from '@/hooks/useHasAuthConfigured';
import useHasNewAppVersion from '@/hooks/useHasNewAppVersion';

import GraphTab from '@/views/navigation/tabs/GraphTab';
import InverterListTab from '@/views/navigation/tabs/InverterListTab';
import LivedataTab from '@/views/navigation/tabs/LivedataTab';
import MainSettingsTab from '@/views/navigation/tabs/MainSettingsTab';

const LivedataRoute = () => <LivedataTab />;
const InverterListRoute = () => <InverterListTab />;
const SettingsRoute = () => <MainSettingsTab />;
const GraphRoute = () => <GraphTab />;

type BaseRoutes = ComponentProps<
  typeof BottomNavigationPaper
>['navigationState']['routes'];

const BottomNavigation: FC = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [index, setIndex] = useState<number>(0);

  const [hasNewAppVersion] = useHasNewAppVersion({
    usedForIndicatorOnly: true,
  });

  const authStringConfigured = useHasAuthConfigured();

  const routes = useMemo<BaseRoutes>(
    () => [
      {
        key: 'livedata',
        title: t('navigation.livedata'),
        focusedIcon: 'solar-power',
      },
      ...(authStringConfigured
        ? [
            {
              key: 'inverterList',
              title: t('navigation.inverterList'),
              focusedIcon: 'current-ac',
            },
          ]
        : []),
      {
        key: 'graph',
        title: t('navigation.graph'),
        focusedIcon: 'chart-line',
      },
      {
        key: 'settings',
        title: t('navigation.settings'),
        focusedIcon: 'cog',
        badge: hasNewAppVersion,
      },
    ],
    [t, hasNewAppVersion, authStringConfigured],
  );

  const renderScene = BottomNavigationPaper.SceneMap({
    livedata: LivedataRoute,
    inverterList: InverterListRoute,
    graph: GraphRoute,
    settings: SettingsRoute,
  });

  return (
    <BottomNavigationPaper
      navigationState={{ index, routes }}
      onIndexChange={setIndex}
      renderScene={renderScene}
      barStyle={{ backgroundColor: theme.colors.surface }}
    />
  );
};

export default BottomNavigation;
