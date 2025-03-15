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
import type {
  DtuSettings,
  NetworkSettings,
  NTPSettings,
  NTPTime,
  TimezoneData,
} from '@/types/opendtu/settings';
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

  // settings
  private onNetworkSettingsHandler:
    | ((data: NetworkSettings, index: Index) => void)
    | null = null;
  private onNtpSettingsHandler:
    | ((data: NTPSettings, index: Index) => void)
    | null = null;
  private onDtuSettingsHandler:
    | ((data: DtuSettings, index: Index) => void)
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
      log.warn('OpenDtuApi.handle() disconnecting due to inactivity');
      this.disconnect();
      this.connect();
    }
  }

  public setLocale(locale: string): void {
    log.debug('OpenDtuApi.setLocale()', locale);
    this.locale = locale;
  }

  public setBaseUrl(baseUrl: string): void {
    log.debug('OpenDtuApi.setBaseUrl()', baseUrl);
    this.baseUrl = baseUrl;
  }

  public setUserString(userString: string | null): void {
    log.debug('OpenDtuApi.setUserString()', userString);
    this.userString = userString;
  }

  public setIndex(index: Index): void {
    log.debug('OpenDtuApi.setIndex()', index);
    this.index = index;
  }

  public startFetchHttpStateInterval(): void {
    log.debug('OpenDtuApi.startFetchHttpStateInterval()');

    if (this.fetchHttpStateInterval) {
      log.debug('OpenDtuApi.startFetchHttpStateInterval() already running');
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
      log.debug('OpenDtuApi.stopFetchHttpStateInterval() clearing interval');
      clearInterval(this.fetchHttpStateInterval);
    }

    this.fetchHttpStateInterval = null;
  }

  public registerLiveDataHandler(handler: LiveDataHandler): void {
    log.debug('OpenDtuApi.registerLiveDataHandler()');
    this.liveDataHandler = handler;
  }

  public unregisterLiveDataHandler(): void {
    log.debug('OpenDtuApi.unregisterLiveDataHandler()');
    this.liveDataHandler = null;
  }

  public registerLiveDataFromStatusHandler(
    handler: LiveDataFromStatusHandler,
  ): void {
    log.debug('OpenDtuApi.registerLiveDataFromStatusHandler()');
    this.liveDataFromStatusHandler = handler;
  }

  public unregisterLiveDataFromStatusHandler(): void {
    log.debug('OpenDtuApi.unregisterLiveDataFromStatusHandler()');
    this.liveDataFromStatusHandler = null;
  }

  public registerHttpStatusHandler(handler: HttpStatusHandler): void {
    log.debug('OpenDtuApi.registerHttpStatusHandler()');
    this.httpStatusHandler = handler;
  }

  public unregisterHttpStatusHandler(): void {
    log.debug('OpenDtuApi.unregisterHttpStatusHandler()');
    this.httpStatusHandler = null;
  }

  public registerOnConnectedHandler(handler: (index: Index) => void): void {
    log.debug('OpenDtuApi.registerOnConnectedHandler()');
    this.onConnectedHandler = handler;
  }

  public unregisterOnConnectedHandler(): void {
    log.debug('OpenDtuApi.unregisterOnConnectedHandler()');
    this.onConnectedHandler = null;
  }

  public registerOnDisconnectedHandler(handler: () => void): void {
    log.debug('OpenDtuApi.registerOnDisconnectedHandler()');
    this.onDisconnectedHandler = handler;
  }

  public unregisterOnDisconnectedHandler(): void {
    log.debug('OpenDtuApi.unregisterOnDisconnectedHandler()');
    this.onDisconnectedHandler = null;
  }

  public registerOnEventLogHandler(
    handler: (
      data: EventLogData,
      index: Index,
      inverterSerial: InverterSerial,
    ) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnEventLogHandler()');
    this.onEventLogHandler = handler;
  }

  public unregisterOnEventLogHandler(): void {
    log.debug('OpenDtuApi.unregisterOnEventLogHandler()');
    this.onEventLogHandler = null;
  }

  public registerOnPowerStatusHandler(
    handler: (data: PowerStatusData, index: Index) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnPowerStatusHandler()');
    this.onPowerStatusHandler = handler;
  }

  public unregisterOnPowerStatusHandler(): void {
    log.debug('OpenDtuApi.unregisterOnPowerStatusHandler()');
    this.onPowerStatusHandler = null;
  }

  public registerOnLimitStatusHandler(
    handler: (data: LimitStatusData, index: Index) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnLimitStatusHandler()');
    this.onLimitStatusHandler = handler;
  }

  public unregisterOnLimitStatusHandler(): void {
    log.debug('OpenDtuApi.unregisterOnLimitStatusHandler()');
    this.onLimitStatusHandler = null;
  }

  public registerOnInverterDeviceHandler(
    handler: (
      data: InverterDeviceData,
      index: Index,
      inverterSerial: InverterSerial,
    ) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnInverterDeviceHandler()');
    this.onInverterDeviceHandler = handler;
  }

  public unregisterOnInverterDeviceHandler(): void {
    log.debug('OpenDtuApi.unregisterOnInverterDeviceHandler()');
    this.onInverterDeviceHandler = null;
  }

  public registerOnGridProfileHandler(
    handler: (
      data: GridProfileData,
      index: Index,
      inverterSerial: InverterSerial,
    ) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnGridProfileHandler()');
    this.onGridProfileHandler = handler;
  }

  public unregisterOnGridProfileHandler(): void {
    log.debug('OpenDtuApi.unregisterOnGridProfileHandler()');
    this.onGridProfileHandler = null;
  }

  public registerOnNetworkSettingsHandler(
    handler: (data: NetworkSettings, index: Index) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnNetworkSettingsHandler()');
    this.onNetworkSettingsHandler = handler;
  }

  public unregisterOnNetworkSettingsHandler(): void {
    log.debug('OpenDtuApi.unregisterOnNetworkSettingsHandler()');
    this.onNetworkSettingsHandler = null;
  }

  public registerOnNtpSettingsHandler(
    handler: (data: NTPSettings, index: Index) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnNtpSettingsHandler()');
    this.onNtpSettingsHandler = handler;
  }

  public unregisterOnNtpSettingsHandler(): void {
    log.debug('OpenDtuApi.unregisterOnNtpSettingsHandler()');
    this.onNtpSettingsHandler = null;
  }

  public registerOnDtuSettingsHandler(
    handler: (data: DtuSettings, index: Index) => void,
  ): void {
    log.debug('OpenDtuApi.registerOnDtuSettingsHandler()');
    this.onDtuSettingsHandler = handler;
  }

  public unregisterOnDtuSettingsHandler(): void {
    log.debug('OpenDtuApi.unregisterOnDtuSettingsHandler()');
    this.onDtuSettingsHandler = null;
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

        log.debug('getSystemStatusFromUrl', 'success', response);

        return {
          systemStatus: await response.json(),
          deviceState: DeviceState.Reachable,
          meta: {},
        };
      }

      const errorText = await response.text();

      log.error(
        'getSystemStatusFromUrl',
        'invalid status',
        response?.status,
        'errortext',
        errorText,
      );

      const wasAuthProblem = response?.status === 401;

      if (wasAuthProblem) {
        return {
          deviceState: DeviceState.CouldBeInstanceWithoutReadonly,
          meta: {
            statusCode: response?.status,
            error: errorText || 'No body available',
          },
        };
      }

      return {
        deviceState: DeviceState.NotInstance,
        meta: {
          statusCode: response?.status,
          error: errorText || 'No body available',
        },
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error) {
      if (error instanceof Error) {
        log.error('getSystemStatusFromUrl error', error, error.name);

        if (error.name === 'AbortError') {
          log.debug(
            'getSystemStatusFromUrl',
            'Returning Unreachable / abort error',
          );
          return {
            deviceState: DeviceState.Unreachable,
            meta: {
              error: error,
              info: 'AbortError',
            },
          };
        }

        log.debug('getSystemStatusFromUrl', 'Returning NotInstance / error');

        return { deviceState: DeviceState.NotInstance, meta: { error: error } };
      }
    }

    log.debug('getSystemStatusFromUrl', 'Returning Unknown / no response');

    return {
      deviceState: DeviceState.Unknown,
      meta: {},
    };
  }

  public async getSystemStatus(): Promise<GetSystemStatusReturn> {
    if (!this.baseUrl) {
      log.error('getSystemStatus', 'No base url');

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

    if (
      result.deviceState !== DeviceState.Reachable &&
      result.deviceState !== DeviceState.CouldBeInstanceWithoutReadonly
    ) {
      log.error('isOpenDtuInstance', result.meta, url);
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
          log.debug('isOpenDtuInstance', 'baseUrl matches');
          return DeviceState.Connected;
        }

        log.debug('isOpenDtuInstance', 'baseUrl does not match');
        return DeviceState.Reachable;
      }
    }

    if (result.deviceState === DeviceState.CouldBeInstanceWithoutReadonly) {
      log.debug('isOpenDtuInstance', 'CouldBeInstanceWithoutReadonly');
      return DeviceState.CouldBeInstanceWithoutReadonly;
    }

    log.error(
      'isOpenDtuInstance',
      'invalid system status, returning NotInstance',
      result.systemStatus,
    );

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

    if (split.length !== 2) {
      throw new Error('Invalid authdata');
    }

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
        log.error('checkCredentials', 'no response');
        return false;
      }

      if (response.status === 200) {
        const returnValue = { ...(await response.json()) };
        if (returnValue) {
          returnValue.authdata = authData;
        }
        log.debug('checkCredentials', 'success', returnValue);
        return returnValue;
      }

      log.error('checkCredentials', 'invalid status', response.status);

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
            log.debug('OpenDtuApi.onmessage() valid data', {
              parsedData,
              index: this.index,
              wsConnected: this.wsConnected,
            });
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
      log.debug('getAuthString', 'userString is null');
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

    log.debug('getAuthString', 'no authdata');

    return '';
  }

  public isAuthenticated(): boolean {
    return Boolean(this.getAuthString());
  }

  public async getLiveData(): Promise<LiveDataFromStatus | null> {
    if (!this.baseUrl) {
      log.error('getLiveData', 'no base url');
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

      log.debug('getLiveData', 'success');

      return json;
    }

    log.error('getLiveData', 'invalid status', res.status);

    return null;
  }

  public async getNetworkStatus(): Promise<NetworkStatus | null> {
    if (!this.baseUrl) {
      log.error('getNetworkStatus', 'no base url');
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
      log.debug('getNetworkStatus', 'success');
      return await res.json();
    }

    log.error('getNetworkStatus', 'invalid status', res.status);

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

      log.debug('getEventLog', 'success');

      return json;
    }

    log.error('getEventLog', 'invalid status', res.status);

    return null;
  }

  public async getNtpStatus(): Promise<NtpStatus | null> {
    if (!this.baseUrl) {
      log.error('getNtpStatus', 'no base url');
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/ntp/status', 'GET');

    if (!res) {
      log.error('getNtpStatus', 'no response');
      return null;
    }

    if (res.status === 200) {
      log.debug('getNtpStatus', 'success');
      return await res.json();
    }

    log.error('getNtpStatus', 'invalid status', res.status);

    return null;
  }

  public async getMqttStatus(): Promise<MqttStatus | null> {
    if (!this.baseUrl) {
      log.error('getMqttStatus', 'no base url');
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/mqtt/status', 'GET');

    if (!res) {
      log.error('getMqttStatus', 'no response');
      return null;
    }

    if (res.status === 200) {
      log.debug('getMqttStatus', 'success');
      return await res.json();
    }

    log.error('getMqttStatus', 'invalid status', res.status);

    return null;
  }

  public async getInverters(): Promise<InverterItem[] | null> {
    if (!this.baseUrl) {
      log.error('getInverters', 'no base url');
      return null;
    }

    if (!this.isAuthenticated()) {
      log.debug('getInverters', 'not authenticated'); // Maybe user is anonymous
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
      log.debug('getInverters', 'success');
      return (await res.json()).inverter;
    }

    log.error('getInverters', 'invalid status', res.status);

    return null;
  }

  public async getInverterDeviceInfo(
    serial: InverterSerial,
  ): Promise<InverterDeviceData | null> {
    if (!this.baseUrl) {
      log.error('getInverterDeviceInfo', 'no base url');
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

      log.debug('getInverterDeviceInfo', 'success');

      return json;
    }

    log.error('getInverterDeviceInfo', 'invalid status', res.status);

    return null;
  }

  public async getGridProfile(
    serial: InverterSerial,
    excludeRaw: boolean,
  ): Promise<GridProfileData | null> {
    if (!this.baseUrl) {
      log.error('getGridProfile', 'no base url');
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
      log.error('getGridProfile', 'no or invalid response', {
        parsedRes,
        excludeRaw,
        rawRes,
      });
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

      log.debug('getGridProfile', 'success');

      return gridProfileData;
    }

    log.error('getGridProfile', 'invalid status', {
      parsedRes: parsedRes.status,
      rawRes: rawRes?.status,
    });

    return null;
  }

  public async getPowerConfig(): Promise<PowerStatusData | null> {
    if (!this.baseUrl) {
      log.error('getPowerConfig', 'no base url');
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

      log.debug('getPowerConfig', 'success');

      return json;
    }

    log.error('getPowerConfig', 'invalid status', res.status);

    return null;
  }

  public async setPowerConfig(
    serial: InverterSerial,
    action: PowerSetAction,
  ): Promise<boolean> {
    if (!this.baseUrl) {
      log.error('setPowerConfig', 'no base url');
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

    log.debug('setPowerConfig', 'success', {
      status: res.status,
      parsed,
    });

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

      log.debug('getLimitConfig', 'success');

      return json;
    }

    log.error('getLimitConfig', 'invalid status', res.status);

    return null;
  }

  public async setLimitConfig(
    serial: InverterSerial,
    config: LimitConfig,
  ): Promise<boolean> {
    if (!this.baseUrl) {
      log.error('setLimitConfig', 'no base url');
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

    log.debug('setLimitConfig', 'success', {
      status: res.status,
      parsed,
    });

    return res.status === 200 && parsed.type === 'success';
  }

  public async getNetworkConfig(): Promise<NetworkSettings | null> {
    if (!this.baseUrl) {
      log.error('getNetworkConfig', 'no base url');
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

      log.debug('getNetworkConfig', 'success');

      return json;
    }

    log.error('getNetworkConfig', 'invalid status', res.status);

    return null;
  }

  public async setNetworkConfig(
    config: NetworkSettings,
  ): Promise<boolean | null> {
    if (!this.baseUrl) {
      log.error('setNetworkConfig', 'no base url');
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

    log.debug('setNetworkConfig', 'success', {
      status: res.status,
      parsed,
    });

    return res.status === 200 && parsed.type === 'success';
  }

  public async getNTPConfig(): Promise<NTPSettings | null> {
    if (!this.baseUrl) {
      log.error('getNTPConfig', 'no base url');
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/ntp/config', 'GET');

    if (!res) {
      log.error('getNNTPConfig', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.onNtpSettingsHandler && this.index !== null) {
        this.onNtpSettingsHandler(json, this.index);
      }

      log.debug('getNTPConfig', 'success');

      return json;
    }

    log.error('getNTPConfig', 'invalid status', res.status);

    return null;
  }

  public async setNTPConfig(config: NTPSettings): Promise<boolean | null> {
    if (!this.baseUrl) {
      log.error('setNTPConfig', 'no base url');
      return null;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(config));

    const res = await this.makeAuthenticatedRequest('/api/ntp/config', 'POST', {
      body: formData,
    });

    if (!res) {
      log.error('setNTPConfig', 'no response');
      return null;
    }

    const parsed = await res.json();

    log.debug('setNTPConfig', 'success', {
      status: res.status,
      parsed,
    });

    return res.status === 200 && parsed.type === 'success';
  }

  public async fetchTimezones(): Promise<TimezoneData | null> {
    // fetch /zones.json
    if (!this.baseUrl) {
      log.error('fetchTimezones', 'no base url');
      return null;
    }

    const res = await fetch(`${this.baseUrl}/zones.json`).catch(() => null);

    if (!res) {
      log.error('fetchTimezones', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      log.debug('fetchTimezones', 'success');

      return json;
    }

    log.error('fetchTimezones', 'invalid status', res.status);

    return null;
  }

  public async getNTPTime(): Promise<NTPTime | null> {
    if (!this.baseUrl) {
      log.error('getNTPTime', 'no base url');
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/ntp/time', 'GET');

    if (!res) {
      log.error('getNTPTime', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      log.debug('getNTPTime', 'success');

      return json;
    }

    log.error('getNTPTime', 'invalid status', res.status);

    return null;
  }

  public async setNTPTime(
    config: Omit<NTPTime, 'ntp_status'>,
  ): Promise<boolean | null> {
    if (!this.baseUrl) {
      log.error('setNTPTime', 'no base url');
      return null;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(config));

    const res = await this.makeAuthenticatedRequest('/api/ntp/time', 'POST', {
      body: formData,
    });

    if (!res) {
      log.error('setNTPTime', 'no response');
      return null;
    }

    const parsed = await res.json();

    log.debug('setNTPTime', 'success', {
      status: res.status,
      parsed,
    });

    return res.status === 200 && parsed.type === 'success';
  }

  public async getDtuConfig(): Promise<DtuSettings | null> {
    if (!this.baseUrl) {
      log.error('getDtuConfig', 'no base url');
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/dtu/config', 'GET');

    if (!res) {
      log.error('getDtuConfig', 'no response');
      return null;
    }

    if (res.status === 200) {
      const json = await res.json();

      if (this.onDtuSettingsHandler && this.index !== null) {
        this.onDtuSettingsHandler(json, this.index);
      }

      log.debug('getDtuConfig', 'success');

      return json;
    }

    log.error('getDtuConfig', 'invalid status', res.status);

    return null;
  }

  public async setDtuConfig(config: DtuSettings): Promise<boolean | null> {
    if (!this.baseUrl) {
      log.error('setDtuConfig', 'no base url');
      return null;
    }

    const formData = new FormData();
    formData.append('data', JSON.stringify(config));

    const res = await this.makeAuthenticatedRequest('/api/dtu/config', 'POST', {
      body: formData,
    });

    if (!res) {
      log.error('setDtuConfig', 'no response');
      return null;
    }

    const parsed = await res.json();

    log.debug('setDtuConfig', 'success', {
      status: res.status,
      parsed,
    });

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

    log.debug('makeAuthenticatedRequest', {
      authString: typeof authString,
      requestOptions,
      route,
    });

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

      log.debug('makeAuthenticatedRequest', {
        url,
        status: res?.status,
      });

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
    log.debug('downloadOTA', { version, downloadUrl });

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

    log.debug('handleOTA', { version, path, res });

    return res?.statusCode === 200;
  }

  public awaitForUpdateFinish(updating_to: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // fetch from /api/system/status using HTTP HEAD. if okay, resolve. after 1 minute, reject.
      let fetchInterval: NodeJS.Timeout | null = null;

      const rejectTimeout = setTimeout(
        () => {
          log.warn('waiting took too long');

          if (fetchInterval) {
            clearInterval(fetchInterval);
          }

          reject();
        },
        5 * 60 * 1000,
      );

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
          log.warn('awaitForUpdateFinish', 'Aborting fetch');
          controller.abort();
        }, 1000 * 3);

        fetch(url, requestOptions)
          .then(async response => {
            log.info('awaitForUpdateFinish', response.status);

            if (response.status === 200) {
              clearTimeout(abortTimeout);
              clearTimeout(rejectTimeout);

              if (fetchInterval) {
                clearInterval(fetchInterval);
              }

              const systemStatus = await this.getSystemStatus();

              if (systemStatus?.systemStatus?.git_hash) {
                log.info('awaitForUpdateFinish', 'update finished', {
                  git_hash: systemStatus.systemStatus.git_hash,
                  updating_to: updating_to,
                  are_the_same:
                    systemStatus.systemStatus.git_hash === updating_to,
                });

                const areTheSame =
                  systemStatus.systemStatus.git_hash === updating_to;

                if (!areTheSame) {
                  log.error(
                    'awaitForUpdateFinish',
                    'update failed, version still the same',
                  );
                  reject();
                }
              }

              resolve();
            } else {
              log.debug(
                'awaitForUpdateFinish',
                'invalid status',
                response.status,
              );
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
