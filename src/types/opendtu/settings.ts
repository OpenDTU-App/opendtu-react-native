export interface NetworkSettings {
  ssid: string;
  password: string;
  hostname: string;
  dhcp: boolean;
  ipaddress: string;
  netmask: string;
  gateway: string;
  dns1: string;
  dns2: string;
  aptimeout: number;
  mdnsenabled: boolean;
}

export interface NTPSettings {
  ntp_server: string;
  ntp_timezone: string;
  ntp_timezone_descr: string;
  latitude: number;
  longitude: number;
  sunsettype: number;
}

export interface NTPTime {
  ntp_status: boolean;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export type TimeZoneName = `${string}/${string}`;

export type TimezoneData = Record<TimeZoneName, string>;

export enum SunsetType {
  OFFICIAL,
  NAUTICAL,
  CIVIL,
  ASTONOMICAL,
}

export interface CountryDef {
  freq_default: number;
  freq_min: number;
  freq_max: number;
  freq_legal_min: number;
  freq_legal_max: number;
}

export enum NRFPaLevel {
  Min,
  Low,
  High,
  Max,
}

export interface DtuSettings {
  serial: number;
  pollinterval: number;
  nrf_enabled: boolean;
  nrf_palevel: NRFPaLevel;
  cmt_enabled: boolean;
  cmt_palevel: number;
  cmt_frequency: number;
  cmt_country: number;
  country_def: Array<CountryDef>;
  cmt_chan_width: number;
}
