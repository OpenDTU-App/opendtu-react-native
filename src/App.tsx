import { StrictMode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as ReduxProvider } from 'react-redux';

import { PersistGate as ReduxPersistGate } from 'redux-persist/integration/react';

import StorageMigrator from '@/components/StorageMigrator';

import ApiProvider from '@/api/ApiHandler';
import DatabaseProvider from '@/database';
import GithubProvider from '@/github';
import FetchHandler from '@/github/FetchHandler';
import InnerApp from '@/InnerApp';
import { persistor, store } from '@/store';

const App = () => {
  /*const onBeforeLift = useCallback(() => {
    // take some action before the gate lifts
    console.log('onBeforeLift');
    SplashScreen.hide();
  }, []);*/

  return (
    <StrictMode>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <ReduxPersistGate
            persistor={persistor}
            loading={null}
            // onBeforeLift={onBeforeLift}
          >
            <StorageMigrator>
              <GithubProvider>
                <ApiProvider>
                  <DatabaseProvider>
                    <FetchHandler>
                      <InnerApp />
                    </FetchHandler>
                  </DatabaseProvider>
                </ApiProvider>
              </GithubProvider>
            </StorageMigrator>
          </ReduxPersistGate>
        </ReduxProvider>
      </SafeAreaProvider>
    </StrictMode>
  );
};

export default App;
