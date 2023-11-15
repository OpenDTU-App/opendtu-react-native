import type { PayloadAction } from '@reduxjs/toolkit';

import type { LiveData, SystemStatus } from '@/types/opendtu/status';
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
  valid: boolean;
  data: LiveData;
}>;

export type SetSystemStatusAction = PayloadAction<{
  data: SystemStatus;
}>;

export type SetSetupUserStringAction = PayloadAction<{
  userString: string;
}>;

export type SetSetupBaseUrlAction = PayloadAction<{
  baseUrl: string;
}>;

export type SetIsConnectedAction = PayloadAction<{
  isConnected: boolean;
}>;

export type SetDeviceStateAction = PayloadAction<{
  index: Index;
  deviceState: DeviceState;
}>;

export type SetTriedToConnectAction = PayloadAction<{
  triedToConnect: boolean;
}>;

export interface OpenDTUSetup {
  baseUrl: string | null;
  userString: string | null;
}

export interface OpenDTUState {
  liveData: LiveData | null;
  systemStatus: SystemStatus | null;
  setup: OpenDTUSetup;
  isConnected: boolean;
  deviceState: Record<Index, DeviceState>;
  triedToConnect: boolean;
}
