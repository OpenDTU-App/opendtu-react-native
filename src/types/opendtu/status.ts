export interface ValueObject {
  v: number; // value
  u: string; // unit (e.g. "W")
  d: number; // digits (decimal places)
}

export interface InverterStatistics {
  name: ValueObject;
  Power?: ValueObject;
  Voltage?: ValueObject;
  Current?: ValueObject;
  'Power DC'?: ValueObject;
  YieldDay?: ValueObject;
  YieldTotal?: ValueObject;
  Frequency?: ValueObject;
  Temperature?: ValueObject;
  PowerFactor?: ValueObject;
  ReactivePower?: ValueObject;
  Efficiency?: ValueObject;
  Irradiation?: ValueObject;
}

export interface Inverter {
  serial: number;
  name: string;
  order: number;
  data_age: number;
  poll_enabled: boolean;
  reachable: boolean;
  producing: boolean;
  limit_relative: number;
  limit_absolute: number;
  events: number;
  AC: InverterStatistics[];
  DC: InverterStatistics[];
  INV: InverterStatistics[];
}

export interface Total {
  Power: ValueObject;
  YieldDay: ValueObject;
  YieldTotal: ValueObject;
}

export interface Hints {
  time_sync: boolean;
  default_password: boolean;
  radio_problem: boolean;
}

export interface LiveData {
  inverters: Inverter[];
  total: Total;
  hints: Hints;
  lastUpdate: Date | null;
}

export interface SystemStatus {
  // HardwareInfo
  chipmodel: string;
  chiprevision: number;
  chipcores: number;
  cpufreq: number;

  // FirmwareInfo
  hostname: string;
  sdkversion: string;
  config_version: string;
  git_hash: string;
  git_is_hash: boolean;
  pioenv: string;
  resetreason_0: string;
  resetreason_1: string;
  cfgsavecount: number;
  uptime: number;
  update_text: string;
  update_url: string;
  update_status: string;

  // MemoryInfo
  heap_total: number;
  heap_used: number;
  littlefs_total: number;
  littlefs_used: number;
  sketch_total: number;
  sketch_used: number;

  // RadioInfo
  nrf_configured: boolean;
  nrf_connected: boolean;
  nrf_pvariant: boolean;
  cmt_configured: boolean;
  cmt_connected: boolean;
}
