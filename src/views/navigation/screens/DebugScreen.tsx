import type { FC } from 'react';
import { Appbar } from 'react-native-paper';

import type { PropsWithNavigation } from '@/views/navigation/NavigationStack';

const DebugScreen: FC<PropsWithNavigation> = () => {
  return (
    <>
      <Appbar.Header>
        <Appbar.Content title="Debug" />
      </Appbar.Header>
    </>
  );
};

export default DebugScreen;
