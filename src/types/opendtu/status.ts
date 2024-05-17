export type InverterSerial = string;

type NumericString = `${number}`;

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
  serial: InverterSerial;
  name: string;
  order: number;
  data_age: number;
  poll_enabled: boolean;
  reachable: boolean;
  producing: boolean;
  limit_relative: number;
  limit_absolute: number;
  events: number;
  AC: Record<NumericString, InverterStatistics>;
  DC: Record<NumericString, InverterStatistics>;
  INV: Record<NumericString, InverterStatistics>;
}

export type InverterFromStatus = Pick<
  Inverter,
  | 'serial'
  | 'name'
  | 'order'
  | 'data_age'
  | 'poll_enabled'
  | 'reachable'
  | 'producing'
  | 'limit_relative'
  | 'limit_absolute'
>;

export interface StatusTotal {
  Power: ValueObject;
  YieldDay: ValueObject;
  YieldTotal: ValueObject;
}

export interface StatusHints {
  time_sync: boolean;
  default_password: boolean;
  radio_problem: boolean;
}

export interface LiveDataFromWebsocket {
  inverters: Inverter[];
  total: StatusTotal;
  hints: StatusHints;
  lastUpdate: Date | null;
}

export interface LiveDataFromStatus {
  inverters: InverterFromStatus[];
  total: StatusTotal;
  hints: StatusHints;
  lastUpdate: Date | null;
}

export interface LiveDataFromWebsocketWithFrom extends LiveDataFromWebsocket {
  from: 'websocket';
}

export interface LiveDataFromStatusWithFrom extends LiveDataFromStatus {
  from: 'status';
}

export type LiveData =
  | LiveDataFromWebsocketWithFrom
  | LiveDataFromStatusWithFrom;

export interface SystemStatus {
  // HardwareInfo
  chipmodel?: string;
  chiprevision?: number;
  chipcores?: number;
  cpufreq?: number;

  // FirmwareInfo
  hostname?: string;
  sdkversion?: string;
  config_version?: string;
  git_hash?: string;
  git_is_hash?: boolean;
  pioenv?: string;
  resetreason_0?: string;
  resetreason_1?: string;
  cfgsavecount?: number;
  uptime?: number;
  update_text?: string;
  update_url?: string;
  update_status?: string;

  // MemoryInfo
  heap_total?: number;
  heap_used?: number;
  heap_max_block?: number;
  heap_min_free?: number;
  littlefs_total?: number;
  littlefs_used?: number;
  sketch_total?: number;
  sketch_used?: number;
  psram_total?: number;
  psram_used?: number;

  // RadioInfo
  nrf_configured?: boolean;
  nrf_connected?: boolean;
  nrf_pvariant?: boolean;
  cmt_configured?: boolean;
  cmt_connected?: boolean;
}

export interface NetworkStatus {
  // WifiStationInfo
  sta_status?: boolean;
  sta_ssid?: string;
  sta_bssid?: string;
  sta_rssi?: number;

  // WifiApInfo
  ap_status?: boolean;
  ap_ssid?: string;
  ap_stationnum?: number;

  // InterfaceNetworkInfo
  network_hostname?: string;
  network_ip?: string;
  network_netmask?: string;
  network_gateway?: string;
  network_dns1?: string;
  network_dns2?: string;
  network_mac?: string;
  network_mode?: string;

  // InterfaceApInfo
  ap_ip?: string;
  ap_mac?: string;
}

export interface MqttStatus {
  mqtt_enabled?: boolean;
  mqtt_hostname?: string;
  mqtt_port?: number;
  mqtt_username?: string;
  mqtt_topic?: string;
  mqtt_publish_interval?: number;
  mqtt_clean_session?: boolean;
  mqtt_retain?: boolean;
  mqtt_tls?: boolean;
  mqtt_root_ca_cert_info?: string;
  mqtt_tls_cert_login?: boolean;
  mqtt_client_cert_info?: string;
  mqtt_connected?: boolean;
  mqtt_hass_enabled?: boolean;
  mqtt_hass_expire?: boolean;
  mqtt_hass_retain?: boolean;
  mqtt_hass_topic?: string;
  mqtt_hass_individualpanels?: boolean;
}

export interface NtpStatus {
  ntp_server?: string;
  ntp_timezone?: string;
  ntp_timezone_descr?: string;
  ntp_status?: boolean;
  ntp_localtime?: string;
  sun_risetime?: string;
  sun_settime?: string;
  sun_isDayPeriod?: boolean;
  sun_isSunsetAvailable?: boolean;
}
