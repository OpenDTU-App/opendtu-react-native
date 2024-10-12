import type { FC, PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native-paper';

import { InteractionManager, View } from 'react-native';

import {
  hasMigratedFromAsyncStorage,
  migrateFromAsyncStorage,
} from '@/storage';

const StorageMigrator: FC<PropsWithChildren> = ({ children }) => {
  const [hasMigrated, setHasMigrated] = useState(hasMigratedFromAsyncStorage);

  useEffect(() => {
    if (!hasMigratedFromAsyncStorage) {
      InteractionManager.runAfterInteractions(async () => {
        try {
          await migrateFromAsyncStorage();
          setHasMigrated(true);
        } catch (e) {
          // TODO: fall back to AsyncStorage? Wipe storage clean and use MMKV? Crash app?
        }
      });
    }
  }, []);

  if (!hasMigrated) {
    // show loading indicator while app is migrating storage...
    return (
      <View style={{ justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
};

export default StorageMigrator;
