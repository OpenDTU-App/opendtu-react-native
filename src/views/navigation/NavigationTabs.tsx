import type { ComponentProps, FC } from 'react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BottomNavigation as BottomNavigationPaper,
  useTheme,
} from 'react-native-paper';

import useHasNewAppVersion from '@/hooks/useHasNewAppVersion';

import GraphTab from '@/views/navigation/tabs/GraphTab';
import LivedataTab from '@/views/navigation/tabs/LivedataTab';
import MainSettingsTab from '@/views/navigation/tabs/MainSettingsTab';

const LivedataRoute = () => <LivedataTab />;
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

  const routes = useMemo<BaseRoutes>(
    () => [
      {
        key: 'livedata',
        title: t('navigation.livedata'),
        focusedIcon: 'solar-power',
      },
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
    [t, hasNewAppVersion],
  );

  const renderScene = BottomNavigationPaper.SceneMap({
    livedata: LivedataRoute,
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
