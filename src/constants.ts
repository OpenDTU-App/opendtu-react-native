import Config from 'react-native-config';

export const colors = {
  success: '#4caf50',
  onSuccess: '#fff',
  error: '#f44336',
  onError: '#fff',
  warning: '#ff9800',
  onWarning: '#fff',
  info: '#0a5591',
  onInfo: '#fff',
  dark: {
    successSurface: '#164016',
    onSuccessSurface: '#c0e5c0',
    warningSurface: '#eabe2e',
    onWarningSurface: '#7a471d',
  },
  light: {
    successSurface: '#e8f5e9',
    onSuccessSurface: '#164016',
    warningSurface: '#fff9c4',
    onWarningSurface: '#7a471d',
  },
  weblate: '#124b47',
  onWeblate: '#fff',
};

export const spacing = 8;

export const defaultUser = 'admin';

export type OpenDtuFirmwareVersion = `v${number}.${number}.${number}`;

export const minimumOpenDtuFirmwareVersion: OpenDtuFirmwareVersion =
  'v23.11.16';

export const maximumTestedOpenDtuFirmwareVersion: OpenDtuFirmwareVersion =
  'v24.4.12';

export const featureFlags: Record<string, OpenDtuFirmwareVersion> = {
  apiLimitConfigEnumChange: 'v25.9.11', // https://github.com/tbnobody/OpenDTU/commit/8cab3335f348d9ec5221ebf01634c593e3a4213b
};

export const weblateUrl =
  'https://weblate.commanderred.xyz/engage/opendtu-react-native/';

export const bugreportUrl =
  'https://github.com/OpenDTU-App/opendtu-react-native/issues/new';

export const databaseInformationUrl =
  'https://www.opendtu.solar/3rd_party/prometheus_database/';

export const allowInAppUpdates =
  Config.DISABLE_IN_APP_UPDATES !== 'true' || __DEV__;
