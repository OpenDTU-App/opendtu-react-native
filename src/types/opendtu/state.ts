import type { PayloadAction } from '@reduxjs/toolkit';

import type {
  LiveData,
  MqttStatus,
  NetworkStatus,
  NtpStatus,
  SystemStatus,
} from '@/types/opendtu/status';
import type { Index } from '@/types/settings';

export enum DeviceState {
  Unknown,
  Reachable,
  Unreachable,
  InvalidAuth,
  InvalidState,
  NotInstance,
  NotConnected,
  Connected,
}

export type SetLiveDataAction = PayloadAction<{
  index: Index;
  valid: boolean;
  data: LiveData;
}>;

export type SetSystemStatusAction = PayloadAction<{
  index: Index;
  data: SystemStatus;
}>;

export type SetSetupUserStringAction = PayloadAction<{
  userString: string;
}>;

export type SetSetupBaseUrlAction = PayloadAction<{
  baseUrl: string;
}>;

export type SetIsConnectedAction = PayloadAction<{
  index: Index;
  isConnected: boolean;
}>;

export type SetDeviceStateAction = PayloadAction<{
  index: Index;
  deviceState: DeviceState;
}>;

export type SetTriedToConnectAction = PayloadAction<{
  index: Index;
  triedToConnect: boolean;
}>;

export type ClearOpenDtuStateAction = PayloadAction<{
  index: Index;
}>;

export type SetNetworkStatusAction = PayloadAction<{
  index: Index;
  data: NetworkStatus;
}>;

export type SetNtpStatusAction = PayloadAction<{
  index: Index;
  data: NtpStatus;
}>;

export type SetMqttStatusAction = PayloadAction<{
  index: Index;
  data: MqttStatus;
}>;

export interface OpenDTUSetup {
  baseUrl: string | null;
  userString: string | null;
}

export interface OpenDTUDeviceState {
  liveData?: LiveData;
  systemStatus?: SystemStatus;
  networkStatus?: NetworkStatus;
  ntpStatus?: NtpStatus;
  mqttStatus?: MqttStatus;
  isConnected?: boolean;
  triedToConnect?: boolean;
}

export interface OpenDTUReduxState {
  dtuStates: Record<Index, OpenDTUDeviceState | undefined>;
  setup: OpenDTUSetup;
  deviceState: Record<Index, DeviceState>;
}
