import type { LimitStatusData, PowerStatusData } from '@/types/opendtu/control';
import type { EventLogData } from '@/types/opendtu/eventlog';
import type { GridProfileData } from '@/types/opendtu/gridprofile';
import type { InverterDeviceData } from '@/types/opendtu/inverterDevice';
import type {
  DtuSettings,
  NetworkSettings,
  NTPSettings,
} from '@/types/opendtu/settings';
import type {
  InverterSerial,
  LiveData,
  LiveDataFromStatus,
  LiveDataFromWebsocket,
  MqttStatus,
  NetworkStatus,
  NtpStatus,
  SystemStatus,
} from '@/types/opendtu/status';
import type { Index } from '@/types/settings';

import type { PayloadAction } from '@reduxjs/toolkit';

export interface OpenDTUSettings {
  network?: NetworkSettings;
  ntp?: NTPSettings;
  dtu?: DtuSettings;
}

export enum DeviceState {
  Unknown,
  Reachable,
  Unreachable,
  InvalidAuth,
  InvalidState,
  CouldBeInstanceWithoutReadonly,
  NotInstance,
  NotConnected,
  Connected,
}

export type SetLiveDataFromStatusAction = PayloadAction<{
  index: Index;
  valid: boolean;
  data: LiveDataFromStatus;
}>;

export type SetLiveDataFromWebsocketAction = PayloadAction<{
  index: Index;
  valid: boolean;
  data: LiveDataFromWebsocket;
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

export type SetGridProfileAction = PayloadAction<{
  index: Index;
  inverterSerial: InverterSerial;
  data: GridProfileData;
}>;

export type SetInverterDeviceAction = PayloadAction<{
  index: Index;
  inverterSerial: InverterSerial;
  data: InverterDeviceData;
}>;

export type SetPowerStatusAction = PayloadAction<{
  index: Index;
  data: PowerStatusData;
}>;

export type SetLimitStatusAction = PayloadAction<{
  index: Index;
  data: LimitStatusData;
}>;

export type SetNetworkSettingsAction = PayloadAction<{
  index: Index;
  data: NetworkSettings;
}>;

export type SetNTPSettingsAction = PayloadAction<{
  index: Index;
  data: NTPSettings;
}>;

export type SetDtuSettingsAction = PayloadAction<{
  index: Index;
  data: DtuSettings;
}>;

export interface OpenDTUSetup {
  baseUrl: string | null;
  userString: string | null;
}

export interface InverterDataItem {
  eventLog?: EventLogData;
  gridProfile?: GridProfileData;
  device?: InverterDeviceData;
  power?: PowerStatusData;
  limit?: LimitStatusData;
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
  settings?: OpenDTUSettings;
}

export interface OpenDTUReduxState {
  dtuStates: Record<Index, OpenDTUDeviceState | undefined>;
  setup: OpenDTUSetup;
  deviceState: Record<Index, DeviceState>;
}
