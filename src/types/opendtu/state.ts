import type { PayloadAction } from '@reduxjs/toolkit';

import type {
  InverterSerial,
  LiveData,
  MqttStatus,
  NetworkStatus,
  NtpStatus,
  SystemStatus,
} from '@/types/opendtu/status';
import type { Index } from '@/types/settings';

import type { EventLogData } from '@/api/opendtuapi';

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
  userString: string | null;
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

export type SetInvertersAction = PayloadAction<{
  index: Index;
  inverters: InverterItem[];
}>;

export type SetEventLogAction = PayloadAction<{
  index: Index;
  inverterSerial: InverterSerial;
  data: EventLogData;
}>;

export interface OpenDTUSetup {
  baseUrl: string | null;
  userString: string | null;
}

export interface InverterDataItem {
  eventLog?: EventLogData;
}

export type InverterData = Record<InverterSerial, InverterDataItem>;

export interface InverterChannel {
  name: string;
  max_power: number;
  yield_total_offset: number;
}

export interface InverterItem {
  id: number;
  serial: InverterSerial;
  name: string;
  type: string;
  order: number;
  poll_enable: boolean;
  poll_enable_night: boolean;
  command_enable: boolean;
  command_enable_night: boolean;
  reachable_threshold: number;
  zero_runtime: boolean;
  zero_day: boolean;
  yieldday_correction: boolean;
  channel: InverterChannel[];
}

export interface OpenDTUDeviceState {
  liveData?: LiveData;
  systemStatus?: SystemStatus;
  networkStatus?: NetworkStatus;
  ntpStatus?: NtpStatus;
  mqttStatus?: MqttStatus;
  isConnected?: boolean;
  triedToConnect?: boolean;
  inverters?: InverterItem[];
  inverterData?: InverterData;
}

export interface OpenDTUReduxState {
  dtuStates: Record<Index, OpenDTUDeviceState | undefined>;
  setup: OpenDTUSetup;
  deviceState: Record<Index, DeviceState>;
}
