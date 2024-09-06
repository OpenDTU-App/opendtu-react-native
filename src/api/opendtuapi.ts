/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { OpenDTUAuthenticateResponse } from '@/types/opendtu/authenticate';
import type {
  LimitConfig,
  LimitStatusData,
  PowerSetAction,
  PowerStatusData,
} from '@/types/opendtu/control';
import type { EventLogData } from '@/types/opendtu/eventlog';
import type { GridProfileData } from '@/types/opendtu/gridprofile';
import type { InverterDeviceData } from '@/types/opendtu/inverterDevice';
import type { NetworkSettings } from '@/types/opendtu/settings';
import type { InverterItem } from '@/types/opendtu/state';
import { DeviceState } from '@/types/opendtu/state';
import type {
  InverterSerial,
  LiveDataFromStatus,
  LiveDataFromWebsocket,
  MqttStatus,
  NetworkStatus,
  NtpStatus,
  SystemStatus,
} from '@/types/opendtu/status';
import type { Index, OpenDTUConfig } from '@/types/settings';

import { maximumTimeUntilInvalid } from '@/hooks/useHasLiveData';

import ago from '@/utils/ago';
import { rootLogging } from '@/utils/log';

import { downloadFirmware, uploadFirmware } from '@/firmware';

const log = rootLogging.extend('OpenDtuApi');

export type LiveDataHandler = (
  data: LiveDataFromWebsocket,
  valid: boolean,
  index: Index,
) => void;

export type LiveDataFromStatusHandler = (
  data: LiveDataFromStatus,
  valid: boolean,
  index: Index,
) => void;

export interface GetSystemStatusReturn {
  systemStatus?: SystemStatus;
  deviceState: DeviceState;
  meta: {
    statusCode?: number;
    error?: string | Error;
    info?: string;
  };
}

export interface HttpStatusData {
  systemStatus?: SystemStatus;
  deviceState: DeviceState;
  networkStatus: NetworkStatus | null;
  ntpStatus: NtpStatus | null;
  mqttStatus: MqttStatus | null;
  inverters: InverterItem[] | null;
}

export type HttpStatusHandler = (data: HttpStatusData, index: Index) => void;

class OpenDtuApi {
  // variables for communication
  private baseUrl: string | null = null;
  private userString: string | null = null;
  private index: Index | null = null;
  private locale = 'en';

  // handlers
  private liveDataHandler: LiveDataHandler | null = null;
  private liveDataFromStatusHandler: LiveDataFromStatusHandler | null = null;
  private httpStatusHandler: HttpStatusHandler | null = null;
  private onConnectedHandler: ((index: Index) => void) | null = null;
  private onDisconnectedHandler: (() => void) | null = null;
  private onEventLogHandler:
    | ((
        data: EventLogData,
        index: Index,
        inverterSerial: InverterSerial,
      ) => void)
    | null = null;
  private onPowerStatusHandler:
    | ((data: PowerStatusData, index: Index) => void)
    | null = null;
  private onLimitStatusHandler:
    | ((data: LimitStatusData, index: Index) => void)
    | null = null;
  private onInverterDeviceHandler:
    | ((
        data: InverterDeviceData,
        index: Index,
        inverterSerial: InverterSerial,
      ) => void)
    | null = null;
  private onGridProfileHandler:
    | ((
        data: GridProfileData,
        index: Index,
        inverterSerial: InverterSerial,
      ) => void)
    | null = null;
  private onNetworkSettingsHandler:
    | ((data: NetworkSettings, index: Index) => void)
    | null = null;

  private ws: WebSocket | null = null;
  // communication
  private wsConnected = false;
  private readonly wsId: string = '';
  private wsUrl: string | null = null;
  private lastMessageTimestamp: Date | null = null;

  // interval
  private fetchHttpStateInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.wsId = Math.random().toString(36).substring(2, 9);

    log.debug('OpenDtuApi.constructor()');
  }

  public handle(): void {
    log.debug('OpenDtuApi.handle()');

    if (
      this.wsConnected &&
      ago(this.lastMessageTimestamp) > maximumTimeUntilInvalid
    ) {
      this.disconnect();
      this.connect();
    }
  }

  public setLocale(locale: string): void {
    this.locale = locale;
  }

  public setBaseUrl(baseUrl: string): void {
    this.baseUrl = baseUrl;
  }

  public setUserString(userString: string | null): void {
    this.userString = userString;
  }

  public setIndex(index: Index): void {
    this.index = index;
  }

  public startFetchHttpStateInterval(): void {
    log.debug('OpenDtuApi.startFetchHttpStateInterval()');

    if (this.fetchHttpStateInterval) {
      clearInterval(this.fetchHttpStateInterval);
    }

    this.fetchHttpStateInterval = setInterval(() => {
      this.updateHttpState();

      log.debug(
        'interval -> OpenDtuApi.updateHttpState()',
        new Date(),
        this.index,
        this.isConnected(),
      );
    }, 5000); // 10 seconds

    this.updateHttpState();
  }

  public stopFetchHttpStateInterval(): void {
    log.info('OpenDtuApi.stopFetchHttpStateInterval()', {
      baseUrl: this.baseUrl,
    });

    if (this.fetchHttpStateInterval) {
      clearInterval(this.fetchHttpStateInterval);
    }

    this.fetchHttpStateInterval = null;
  }

  public registerLiveDataHandler(handler: LiveDataHandler): void {
    this.liveDataHandler = handler;
  }

  public unregisterLiveDataHandler(): void {
    this.liveDataHandler = null;
  }

  public registerLiveDataFromStatusHandler(
    handler: LiveDataFromStatusHandler,
  ): void {
    this.liveDataFromStatusHandler = handler;
  }

  public unregisterLiveDataFromStatusHandler(): void {
    this.liveDataFromStatusHandler = null;
  }

  public registerHttpStatusHandler(handler: HttpStatusHandler): void {
    this.httpStatusHandler = handler;
  }

  public unregisterHttpStatusHandler(): void {
    this.httpStatusHandler = null;
  }

  public registerOnConnectedHandler(handler: (index: Index) => void): void {
    this.onConnectedHandler = handler;
  }

  public unregisterOnConnectedHandler(): void {
    this.onConnectedHandler = null;
  }

  public registerOnDisconnectedHandler(handler: () => void): void {
    this.onDisconnectedHandler = handler;
  }

  public unregisterOnDisconnectedHandler(): void {
    this.onDisconnectedHandler = null;
  }

  public registerOnEventLogHandler(
    handler: (
      data: EventLogData,
      index: Index,
      inverterSerial: InverterSerial,
    ) => void,
  ): void {
    this.onEventLogHandler = handler;
  }

  public unregisterOnEventLogHandler(): void {
    this.onEventLogHandler = null;
  }

  public registerOnPowerStatusHandler(
    handler: (data: PowerStatusData, index: Index) => void,
  ): void {
    this.onPowerStatusHandler = handler;
  }

  public unregisterOnPowerStatusHandler(): void {
    this.onPowerStatusHandler = null;
  }

  public registerOnLimitStatusHandler(
    handler: (data: LimitStatusData, index: Index) => void,
  ): void {
    this.onLimitStatusHandler = handler;
  }

  public unregisterOnLimitStatusHandler(): void {
    this.onLimitStatusHandler = null;
  }

  public registerOnInverterDeviceHandler(
    handler: (
      data: InverterDeviceData,
      index: Index,
      inverterSerial: InverterSerial,
    ) => void,
  ): void {
    this.onInverterDeviceHandler = handler;
  }

  public unregisterOnInverterDeviceHandler(): void {
    this.onInverterDeviceHandler = null;
  }

  public registerOnGridProfileHandler(
    handler: (
      data: GridProfileData,
      index: Index,
      inverterSerial: InverterSerial,
    ) => void,
  ): void {
    this.onGridProfileHandler = handler;
  }

  public unregisterOnGridProfileHandler(): void {
    this.onGridProfileHandler = null;
  }

  public registerOnNetworkSettingsHandler(
    handler: (data: NetworkSettings, index: Index) => void,
  ): void {
    this.onNetworkSettingsHandler = handler;
  }

  public unregisterOnNetworkSettingsHandler(): void {
    this.onNetworkSettingsHandler = null;
  }

  public async getSystemStatusFromUrl(
    url: URL,
  ): Promise<GetSystemStatusReturn> {
    // GET <url>/api/system/status
    try {
      const controller = new AbortController();

      const abortTimeout = setTimeout(() => {
        log.debug('getSystemStatusFromUrl', 'Aborting fetch');
        controller.abort();
      }, 5000);

      log.debug('getSystemStatusFromUrl', url);
      const path = `${url.origin}/api/system/status`;

      const response = await fetch(path, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response?.status === 200) {
        clearTimeout(abortTimeout);
        return {
          systemStatus: await response.json(),
          deviceState: DeviceState.Reachable,
          meta: {},
        };
      }

      return {
        deviceState: DeviceState.NotInstance,
        meta: {
          statusCode: response?.status,
          error: (await response.text()) || 'No body available',
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      if (error instanceof Error) {
        log.error('getSystemStatusFromUrl error', error, error.name);

        if (error.name === 'AbortError') {
          return {
            deviceState: DeviceState.Unreachable,
            meta: {
              error: error,
              info: 'AbortError',
            },
          };
        }

        return { deviceState: DeviceState.NotInstance, meta: { error: error } };
      }
    }

    return {
      deviceState: DeviceState.Unknown,
      meta: {},
    };
  }

  public async getSystemStatus(): Promise<GetSystemStatusReturn> {
    if (!this.baseUrl) {
      return {
        deviceState: DeviceState.InvalidState,
        meta: { error: 'No base url' },
      };
    }

    return await this.getSystemStatusFromUrl(new URL(this.baseUrl));
  }

  public async isOpenDtuInstance(
    originalUrl: URL | string,
  ): Promise<DeviceState> {
    let url = originalUrl;

    if (typeof url === 'string') {
      url = new URL(url);
    }

    const result = await this.getSystemStatusFromUrl(url);

    if (result.deviceState !== DeviceState.Reachable) {
      console.log('isOpenDtuInstance', result.meta, url);
      return result.deviceState;
    }

    if (result.systemStatus) {
      if (
        result.systemStatus.git_hash &&
        result.systemStatus.pioenv &&
        result.systemStatus.hostname &&
        result.systemStatus.sdkversion
      ) {
        if (originalUrl === this.baseUrl) {
          return DeviceState.Connected;
        }
        return DeviceState.Reachable;
      }
    }

    return DeviceState.NotInstance;
  }

  public encodeCredentials(username: string, password: string): string {
    return btoa(
      decodeURIComponent(encodeURIComponent(username + ':' + password)),
    );
  }

  public decodeCredentials(authdata: string): {
    username: string;
    password: string;
  } {
    const decoded = atob(decodeURIComponent(authdata));
    const split = decoded.split(':');

    return {
      username: split[0],
      password: split[1],
    };
  }

  public async checkCredentials({
    username,
    password,
    baseUrl = this.baseUrl as string,
  }: {
    username: string;
    password: string;
    baseUrl?: string;
  }): Promise<false | OpenDTUAuthenticateResponse> {
    // GET <url>/api/security/authenticate
    if (!baseUrl) {
      log.warn('checkCredentials', 'baseUrl is null');
      return false;
    }

    const authData = this.encodeCredentials(username, password);

    const requestOptions = {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: 'Basic ' + authData,
      },
    };

    try {
      log.debug('checkCredentials', baseUrl, requestOptions);
      const response = await fetch(
        `${baseUrl}/api/security/authenticate`,
        requestOptions,
      ).catch(() => null);

      if (!response) {
        return false;
      }

      if (response.status === 200) {
        const returnValue = { ...(await response.json()) };
        if (returnValue) {
          returnValue.authdata = authData;
        }
        return returnValue;
      }

      return false;
    } catch (error) {
      log.error('checkCredentials error', error);
      return false;
    }
  }

  public connect(): void {
    // connect websocket
    if (this.ws !== null) {
      log.warn('OpenDtuApi.connect() ws not null, aborting!');
      return;
    }

    if (this.baseUrl) {
      const urlObject = new URL(this.baseUrl);
      const authString = this.getAuthString();
      const protocol = urlObject.protocol === 'https:' ? 'wss' : 'ws';
      const host = urlObject.host;

      const url = `${protocol}://${authString ?? ''}${host}/livedata`;

      log.debug('OpenDtuApi.connect()', url);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.wsUrl = url;
        log.debug('OpenDtuApi.onopen()');

        this.startFetchHttpStateInterval();

        this.wsConnected = true;

        if (this.onConnectedHandler && this.index !== null) {
          this.onConnectedHandler(this.index);
        }
      };

      this.ws.onmessage = evt => {
        log.debug('OpenDtuApi.onmessage()');

        let parsedData: LiveDataFromWebsocket | null = null;

        try {
          parsedData = JSON.parse(evt.data);
          this.lastMessageTimestamp = new Date();
        } catch {
          // continue regardless of error
          log.warn('OpenDtuApi.onmessage() failed to parse data');
        }

        if (this.liveDataHandler) {
          log.debug('Got data from websocket', {
            wsHost: host,
            currentUrl: this.baseUrl,
            wsId: this.wsId,
          });

          if (
            this.index !== null &&
            parsedData !== null &&
            Object.keys(parsedData).length > 0
          ) {
            this.liveDataHandler(
              {
                ...parsedData,
                lastUpdate: new Date(),
              },
              this.wsConnected,
              this.index,
            );
          } else {
            log.debug('OpenDtuApi.onmessage() invalid data', {
              parsedData,
              index: this.index,
              wsConnected: this.wsConnected,
            });
          }
        }
      };

      this.ws.onclose = () => {
        this.wsUrl = null;
        log.info('OpenDtuApi.onclose()', { baseUrl: this.baseUrl });

        this.wsConnected = false;

        this.disconnect();

        if (this.onDisconnectedHandler) {
          this.onDisconnectedHandler();
        }

        setTimeout(() => {
          log.info('Reconnecting websocket', {
            wsHost: host,
            currentUrl: this.baseUrl,
            wsId: this.wsId,
          });
          this.connect();
        }, 1000);
      };

      this.ws.onerror = evt => {
        log.error('OpenDtuApi.onerror()', evt.message);
      };

      log.debug('OpenDtuApi.connect()', url);
    }
  }

  public disconnect(): void {
    log.info('OpenDtuApi.disconnect()', { baseUrl: this.baseUrl, ws: this.ws });

    if (this.ws) {
      log.info('OpenDtuApi.disconnect() closing websocket', {
        baseUrl: this.baseUrl,
      });

      // stupid hack to kill the websocket
      this.ws.onclose = function () {
        // @ts-ignore: TS2683 because of stupid hack
        log.debug('kill gschissener websocket', this);
        // @ts-ignore: TS2683 because of stupid hack
        this.close();
      }.bind(this.ws);
      this.ws.onmessage = function () {
        // @ts-ignore: TS2683 because of stupid hack
        log.debug('kill gschissener websocket', this);
        // @ts-ignore: TS2683 because of stupid hack
        this.close();
      }.bind(this.ws);
      this.ws.onopen = function () {
        // @ts-ignore: TS2683 because of stupid hack
        log.debug('kill gschissener websocket', this);
        // @ts-ignore: TS2683 because of stupid hack
        this.close();
      }.bind(this.ws);
      this.ws.onerror = function () {
        // @ts-ignore: TS2683 because of stupid hack
        log.debug('kill gschissener websocket', this);
        // @ts-ignore: TS2683 because of stupid hack
        this.close();
      }.bind(this.ws);

      this.ws.close();

      this.ws = null;
    }

    this.wsConnected = false;

    this.stopFetchHttpStateInterval();
  }

  public isConnected(): boolean {
    return this.wsConnected;
  }

  public setConfig(config: OpenDTUConfig, index: Index): void {
    log.debug('OpenDtuApi.setConfig()', { config, index });

    this.setBaseUrl(config.baseUrl);
    this.setUserString(config.userString);
    this.setIndex(index);
  }

  public async updateHttpState(): Promise<void> {
    log.debug('OpenDtuApi.updateHttpState()');

    if (this.index === null) {
      log.warn('OpenDtuApi.updateHttpState() index is null');
      return;
    }

    if (!this.httpStatusHandler) {
      log.warn('OpenDtuApi.updateHttpState() httpStatusHandler is null');
      return;
    }

    const systemStatus = await this.getSystemStatus();

    this.httpStatusHandler(
      {
        systemStatus: systemStatus.systemStatus,
        deviceState: systemStatus.deviceState,
        networkStatus: await this.getNetworkStatus(),
        ntpStatus: await this.getNtpStatus(),
        mqttStatus: await this.getMqttStatus(),
        inverters: await this.getInverters(),
      },
      this.index,
    );
  }

  private getAuthString(): string | null {
    let user = null;

    if (!this.userString) {
      return null;
    }

    try {
      user = JSON.parse(this.userString || '');
    } catch {
      // continue regardless of error
    }

    if (user && user.authdata) {
      return encodeURIComponent(atob(user.authdata)).replace('%3A', ':') + '@';
    }

    return '';
  }

  public isAuthenticated(): boolean {
    return Boolean(this.getAuthString());
  }

  public async getLiveData(): Promise<LiveDataFromStatus | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest(
      '/api/livedata/status',
      'GET',
    );

    if (!res) {
      log.error('getLiveData', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.liveDataFromStatusHandler && this.index !== null) {
        this.liveDataFromStatusHandler(json, true, this.index);
      }

      return json;
    }

    log.error('getLiveData', 'invalid status');

    return null;
  }

  public async getNetworkStatus(): Promise<NetworkStatus | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest(
      '/api/network/status',
      'GET',
    );

    if (!res) {
      log.error('getNetworkStatus', 'no response');
      return null;
    }

    if (res.status === 200) {
      return await res.json();
    }

    log.error('getNetworkStatus', 'invalid status');

    return null;
  }

  public async getEventLog(
    inverterId: string,
    overrideLocale?: string,
  ): Promise<EventLogData | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest(
      '/api/eventlog/status',
      'GET',
      { query: { inv: inverterId, locale: overrideLocale ?? this.locale } },
    );

    if (!res) {
      log.error('getEventLog', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.onEventLogHandler && this.index !== null) {
        this.onEventLogHandler(json, this.index, inverterId);
      }

      return json;
    }

    log.error('getEventLog', 'invalid status');

    return null;
  }

  public async getNtpStatus(): Promise<NtpStatus | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/ntp/status', 'GET');

    if (!res) {
      log.error('getNtpStatus', 'no response');
      return null;
    }

    if (res.status === 200) {
      return await res.json();
    }

    log.error('getNtpStatus', 'invalid status');

    return null;
  }

  public async getMqttStatus(): Promise<MqttStatus | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/mqtt/status', 'GET');

    if (!res) {
      log.error('getMqttStatus', 'no response');
      return null;
    }

    if (res.status === 200) {
      return await res.json();
    }

    log.error('getMqttStatus', 'invalid status');

    return null;
  }

  public async getInverters(): Promise<InverterItem[] | null> {
    if (!this.baseUrl) {
      return null;
    }

    if (!this.isAuthenticated()) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest(
      '/api/inverter/list',
      'GET',
    );

    if (!res) {
      log.error('getInverters', 'no response');
      return null;
    }

    if (res.status === 200) {
      return (await res.json()).inverter;
    }

    log.error('getInverters', 'invalid status');

    return null;
  }

  public async getInverterDeviceInfo(
    serial: InverterSerial,
  ): Promise<InverterDeviceData | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest(
      '/api/devinfo/status',
      'GET',
      { query: { inv: serial } },
    );

    if (!res) {
      log.error('getInverterDeviceInfo', 'no response');

      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.onInverterDeviceHandler && this.index !== null) {
        this.onInverterDeviceHandler(json, this.index, serial);
      }

      return json;
    }

    log.error('getInverterDeviceInfo', 'invalid status');

    return null;
  }

  public async getGridProfile(
    serial: InverterSerial,
    excludeRaw: boolean,
  ): Promise<GridProfileData | null> {
    if (!this.baseUrl) {
      return null;
    }

    const parsedRes = await this.makeAuthenticatedRequest(
      '/api/gridprofile/status',
      'GET',
      { query: { inv: serial } },
    );

    const rawRes = excludeRaw
      ? null
      : await this.makeAuthenticatedRequest('/api/gridprofile/rawdata', 'GET', {
          query: { inv: serial },
        });

    if (!parsedRes || (!excludeRaw && !rawRes)) {
      log.error('getGridProfile', 'no or invalid response');
      return null;
    }

    if (parsedRes.status === 200 && (!excludeRaw || rawRes?.status === 200)) {
      const parsedResJson = await parsedRes.json();
      const rawResJson = excludeRaw ? null : (await rawRes?.json())?.raw;

      const gridProfileData: GridProfileData = {
        parsed: parsedResJson,
        raw: rawResJson,
      };

      if (this.onGridProfileHandler && this.index !== null) {
        this.onGridProfileHandler(gridProfileData, this.index, serial);
      }

      return gridProfileData;
    }

    log.error('getGridProfile', 'invalid status');

    return null;
  }

  public async getPowerConfig(): Promise<PowerStatusData | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/power/status', 'GET');

    if (!res) {
      log.error('getPowerConfig', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.onPowerStatusHandler && this.index !== null) {
        this.onPowerStatusHandler(json, this.index);
      }

      return json;
    }

    log.error('getPowerConfig', 'invalid status');

    return null;
  }

  public async setPowerConfig(
    serial: InverterSerial,
    action: PowerSetAction,
  ): Promise<boolean> {
    if (!this.baseUrl) {
      return false;
    }

    const data = {
      serial,
      ...(action === 'restart'
        ? { restart: true }
        : {
            power: action === 'on',
          }),
    };

    const formData = new FormData();
    formData.append('data', JSON.stringify(data));

    const res = await this.makeAuthenticatedRequest(
      '/api/power/config',
      'POST',
      {
        body: formData,
      },
    );

    if (!res) {
      log.error('setPowerConfig', 'no response');
      return false;
    }

    const parsed = await res.json();

    return res.status === 200 && parsed.type === 'success';
  }

  public async getLimitConfig(): Promise<LimitStatusData | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/limit/status', 'GET');

    if (!res) {
      log.error('getLimitConfig', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.onLimitStatusHandler && this.index !== null) {
        this.onLimitStatusHandler(json, this.index);
      }

      return json;
    }

    log.error('getLimitConfig', 'invalid status');

    return null;
  }

  public async setLimitConfig(
    serial: InverterSerial,
    config: LimitConfig,
  ): Promise<boolean> {
    if (!this.baseUrl) {
      return false;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(config));

    const res = await this.makeAuthenticatedRequest(
      '/api/limit/config',
      'POST',
      {
        body: formData,
      },
    );

    if (!res) {
      log.error('setLimitConfig', 'no response');
      return false;
    }

    const parsed = await res.json();

    return res.status === 200 && parsed.type === 'success';
  }

  public async getNetworkConfig(): Promise<NetworkSettings | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest(
      '/api/network/config',
      'GET',
    );

    if (!res) {
      log.error('getNetworkConfig', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.onNetworkSettingsHandler && this.index !== null) {
        this.onNetworkSettingsHandler(json, this.index);
      }

      return json;
    }

    log.error('getNetworkConfig', 'invalid status');

    return null;
  }

  public async setNetworkConfig(
    config: NetworkSettings,
  ): Promise<boolean | null> {
    if (!this.baseUrl) {
      return null;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(config));

    const res = await this.makeAuthenticatedRequest(
      '/api/network/config',
      'POST',
      {
        body: formData,
      },
    );

    if (!res) {
      log.error('setNetworkConfig', 'no response');
      return null;
    }

    const parsed = await res.json();

    return res.status === 200 && parsed.type === 'success';
  }

  public async makeAuthenticatedRequest(
    route: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'PATCH',
    options?: {
      body?: string | FormData;
      query?: string[][] | Record<string, string> | string | URLSearchParams;
    },
  ): Promise<Response | null> {
    const controller = new AbortController();

    const abortTimeout = setTimeout(() => {
      log.warn('makeAuthenticatedRequest', 'Aborting fetch');
      controller.abort();
    }, 10000);

    const requestOptions: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type':
          options?.body instanceof FormData
            ? 'multipart/form-data'
            : 'application/json',
        ...(this.userString
          ? { Authorization: 'Basic ' + this.userString }
          : {}),
      },
    };

    if (options?.body) {
      requestOptions.body = options.body;
    }

    if (options?.query) {
      route += '?' + new URLSearchParams(options.query).toString();
    }

    const authString = this.getAuthString();

    const url = `${authString ?? ''}${this.baseUrl}${route}`;

    // console.log('makeAuthenticatedRequest', url, requestOptions);

    try {
      const res = await fetch(url, requestOptions).catch(() => null);
      clearTimeout(abortTimeout);

      /*
      console.log(
        'makeAuthenticatedRequest',
        `url=${url}, status=${res.status}`,
      );
      */

      return res;
    } catch (error) {
      log.error('makeAuthenticatedRequest error', error, {
        url,
        requestOptions: JSON.stringify(requestOptions),
      });
      return null;
    }
  }

  public getDebugInfo() {
    return {
      baseUrl: this.baseUrl,
      userString: this.userString,
      index: this.index,
      wsConnected: this.wsConnected,
      wsId: this.wsId,
      wsUrl: this.wsUrl,
      wsReadyState: this.ws?.readyState ?? 'undefined',
      locale: this.locale,
    };
  }

  public async downloadOTA(
    version: string,
    downloadUrl: string,
    onDownloadProgressEvent: (progress: number) => void,
  ): Promise<string | null> {
    return await downloadFirmware(
      version,
      downloadUrl,
      onDownloadProgressEvent,
    );
  }

  public async handleOTA(
    version: string,
    path: string | null,
    onUploadProgressEvent: (progress: number) => void,
  ): Promise<boolean> {
    if (!path) {
      log.error('handleOTA', 'download failed');
      return false;
    }

    const headers = {
      ...(this.userString ? { Authorization: 'Basic ' + this.userString } : {}),
    };

    const authString = this.getAuthString();

    const url = `${authString ?? ''}${this.baseUrl}/api/firmware/update`;

    const res = await uploadFirmware(
      version,
      path,
      url,
      headers,
      onUploadProgressEvent,
    );

    return res?.statusCode === 200;
  }

  public awaitForUpdateFinish(): Promise<void> {
    return new Promise((resolve, reject) => {
      // fetch from /api/system/status using HTTP HEAD. if okay, resolve. after 1 minute, reject.
      let fetchInterval: NodeJS.Timeout | null = null;

      const rejectTimeout = setTimeout(() => {
        log.warn('waiting took too long');

        if (fetchInterval) {
          clearInterval(fetchInterval);
        }

        reject();
      }, 60 * 1000);

      const authString = this.getAuthString();

      const url = `${authString ?? ''}${this.baseUrl}/api/system/status`;

      const execFetch = () => {
        const controller = new AbortController();

        const requestOptions = {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            ...(this.userString
              ? { Authorization: 'Basic ' + this.userString }
              : {}),
          },
        };

        const abortTimeout = setTimeout(() => {
          controller.abort();
        }, 1000 * 3);

        fetch(url, requestOptions)
          .then(response => {
            if (response.status === 200) {
              clearTimeout(abortTimeout);
              clearTimeout(rejectTimeout);

              if (fetchInterval) {
                clearInterval(fetchInterval);
              }

              resolve();
            }
          })
          .catch(() => null);
      };

      fetchInterval = setInterval(() => {
        execFetch();
      }, 3000);
    });
  }
}

export type DebugInfo = ReturnType<OpenDtuApi['getDebugInfo']>;

export default OpenDtuApi;
