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
