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

export enum MqttQosLevel {
  AtMostOnce = 0,
  AtLeastOnce = 1,
  ExactlyOnce = 2,
}

export interface MqttSettings {
  mqtt_enabled: boolean;
  mqtt_hostname: string;
  mqtt_port: number;
  mqtt_clientid: string;
  mqtt_username: string;
  mqtt_password: string;
  mqtt_topic: string;
  mqtt_retain: boolean;
  mqtt_tls: boolean;
  mqtt_root_ca_cert: string;
  mqtt_tls_cert_login: boolean;
  mqtt_client_cert: string;
  mqtt_client_key: string;
  mqtt_lwt_topic: string;
  mqtt_lwt_online: string;
  mqtt_lwt_offline: string;
  mqtt_lwt_qos: MqttQosLevel;
  mqtt_publish_interval: number;
  mqtt_clean_session: boolean;
  mqtt_hass_enabled: boolean;
  mqtt_hass_expire: boolean;
  mqtt_hass_retain: boolean;
  mqtt_hass_topic: string;
  mqtt_hass_individualpanels: boolean;
}

export interface SecuritySettings {
  password: string;
  allow_readonly: boolean;
}
