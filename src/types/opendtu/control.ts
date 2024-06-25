import type { InverterSerial } from '@/types/opendtu/status';

// noinspection AllyPlainJsInspection
export enum SetStatus {
  Unknown = 'Unknown',
  Ok = 'Ok',
  Failure = 'Failure',
  Pending = 'Pending',
}

export interface PowerStatusItem {
  power_set_status: SetStatus;
}

export type PowerStatusData = Record<InverterSerial, PowerStatusItem>;

export enum PowerSetAction {
  On = 'on',
  Off = 'off',
  Restart = 'restart',
}

export interface LimitStatusItem {
  limit_relative: number;
  max_power: number;
  limit_set_status: SetStatus;
}

export type LimitStatusData = Record<InverterSerial, LimitStatusItem>;

export enum LimitType {
  TemporaryAbsolute = 0,
  TemporaryRelative = 1,
  PermanentAbsolute = 256,
  PermanentRelative = 257,
}

export interface LimitConfig {
  serial: InverterSerial;
  limit_value: number;
  limit_type: LimitType;
}
