declare module 'react-native-config' {
  export interface NativeConfig {
    DISABLE_IN_APP_UPDATES?: string;
  }

  export const Config: NativeConfig;
  export default Config;
}
