declare module 'react-native-config' {
  export interface NativeConfig {
    DISABLE_IN_APP_UPDATES?: string;
    OVERRIDE_INITIAL_ROUTE?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
