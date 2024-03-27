/* eslint-disable @typescript-eslint/ban-ts-comment */
import { logger } from 'react-native-logs';

import type { OpenDTUAuthenticateResponse } from '@/types/opendtu/authenticate';
import { DeviceState } from '@/types/opendtu/state';
import type {
  LiveData,
  MqttStatus,
  NetworkStatus,
  NtpStatus,
  SystemStatus,
} from '@/types/opendtu/status';
import type { Index, OpenDTUConfig } from '@/types/settings';

const log = logger.createLogger();

export type LiveDataHandler = (
  data: LiveData,
  valid: boolean,
  index: Index,
) => void;

export interface GetSystemStatusReturn {
  systemStatus?: SystemStatus;
  deviceState: DeviceState;
}

export interface HttpStatusData {
  systemStatus?: SystemStatus;
  deviceState: DeviceState;
  networkStatus: NetworkStatus | null;
  ntpStatus: NtpStatus | null;
  mqttStatus: MqttStatus | null;
}

export type HttpStatusHandler = (data: HttpStatusData, index: Index) => void;

class OpenDtuApi {
  // variables for communication
  private baseUrl: string | null = null;
  private userString: string | null = null;
  private index: Index | null = null;

  // handlers
  private liveDataHandler: LiveDataHandler | null = null;
  private httpStatusHandler: HttpStatusHandler | null = null;
  private onConnectedHandler: ((index: Index) => void) | null = null;
  private onDisconnectedHandler: (() => void) | null = null;

  private ws: WebSocket | null = null;
  // communication
  private wsConnected = false;
  private readonly wsId: string = '';
  private wsUrl: string | null = null;

  // interval
  private fetchHttpStateInterval: NodeJS.Timeout | null = null;

  constructor(debug = false) {
    this.wsId = Math.random().toString(36).substring(2, 9);
    if (!debug) {
      // only allow warnings and errors
      log.setSeverity('warn');
    }

    log.info('OpenDtuApi.constructor()');
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
    log.info('OpenDtuApi.startFetchHttpStateInterval()');

    if (this.fetchHttpStateInterval) {
      clearInterval(this.fetchHttpStateInterval);
    }

    this.fetchHttpStateInterval = setInterval(() => {
      this.updateHttpState();

      log.info(
        'interval -> OpenDtuApi.updateHttpState()',
        new Date(),
        this.index,
        this.isConnected(),
      );
    }, 10000); // 10 seconds

    this.updateHttpState();
  }

  public stopFetchHttpStateInterval(): void {
    log.warn('OpenDtuApi.stopFetchHttpStateInterval()', {
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

  public async getSystemStatusFromUrl(
    url: URL,
  ): Promise<GetSystemStatusReturn> {
    // GET <url>/api/system/status
    try {
      const controller = new AbortController();

      const abortTimeout = setTimeout(() => {
        console.log('getSystemStatusFromUrl', 'Aborting fetch');
        controller.abort();
      }, 5000);

      log.info('getSystemStatusFromUrl', url);
      const response = await fetch(`${url.origin}/api/system/status`, {
        signal: controller.signal,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        clearTimeout(abortTimeout);
        return {
          systemStatus: await response.json(),
          deviceState: DeviceState.Reachable,
        };
      }

      return { deviceState: DeviceState.NotInstance };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      log.error('getSystemStatusFromUrl error', error, error.name);

      if (error.name === 'AbortError') {
        return { deviceState: DeviceState.Unreachable };
      }

      return { deviceState: DeviceState.NotInstance };
    }
  }

  public async getSystemStatus(): Promise<GetSystemStatusReturn> {
    if (!this.baseUrl) {
      return { deviceState: DeviceState.InvalidState };
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

  public async checkCredentials(
    baseUrl: string,
    username: string,
    password: string,
  ): Promise<false | OpenDTUAuthenticateResponse> {
    // GET <url>/api/security/authenticate
    const authData = this.encodeCredentials(username, password);

    const requestOptions = {
      method: 'GET',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        Authorization: 'Basic ' + authData,
      },
    };

    try {
      log.info('checkCredentials', baseUrl, requestOptions);
      const response = await fetch(
        `${baseUrl}/api/security/authenticate`,
        requestOptions,
      );

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

  public connect(noInterval = false): void {
    // connect websocket
    if (this.ws !== null) {
      console.warn('ws not null, abort!!!');
      return;
    }

    if (this.baseUrl) {
      const urlObject = new URL(this.baseUrl);
      const authString = this.getAuthString();
      const protocol = urlObject.protocol === 'https:' ? 'wss' : 'ws';
      const host = urlObject.host;

      const url = `${protocol}://${authString ?? ''}${host}/livedata`;

      console.log(`Connecting websocket to ${url}`);

      this.ws = new WebSocket(url);

      this.ws.onopen = () => {
        this.wsUrl = url;
        log.info('OpenDtuApi.onopen()');

        if (!noInterval) {
          this.startFetchHttpStateInterval();
        }

        this.wsConnected = true;

        if (this.onConnectedHandler && this.index !== null) {
          this.onConnectedHandler(this.index);
        }
      };

      this.ws.onmessage = evt => {
        log.info('OpenDtuApi.onmessage()');

        let parsedData: LiveData | null = null;

        try {
          parsedData = JSON.parse(evt.data);
        } catch {
          // continue regardless of error
          log.warn('OpenDtuApi.onmessage() failed to parse data');
        }

        if (this.liveDataHandler) {
          console.log('Got data from websocket', {
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
            console.log('OpenDtuApi.onmessage() invalid data', {
              parsedData,
              index: this.index,
              wsConnected: this.wsConnected,
            });
          }
        }
      };

      this.ws.onclose = () => {
        this.wsUrl = null;
        log.warn('OpenDtuApi.onclose()', { baseUrl: this.baseUrl });

        this.wsConnected = false;

        this.disconnect();

        if (this.onDisconnectedHandler) {
          this.onDisconnectedHandler();
        }

        setTimeout(() => {
          console.log('Reconnecting websocket', {
            wsHost: host,
            currentUrl: this.baseUrl,
            wsId: this.wsId,
          });
          this.connect(true);
        }, 1000);
      };

      this.ws.onerror = evt => {
        log.error('OpenDtuApi.onerror()', evt.message);
      };

      log.info('OpenDtuApi.connect()', url);
    }
  }

  public disconnect(): void {
    log.warn('OpenDtuApi.disconnect()', { baseUrl: this.baseUrl, ws: this.ws });

    if (this.ws) {
      log.warn('OpenDtuApi.disconnect() closing websocket', {
        baseUrl: this.baseUrl,
      });

      // stupid hack to kill the websocket
      this.ws.onclose = function () {
        // @ts-ignore: TS2683 because of stupid hack
        console.log('kill gschissener websocket', this);
        // @ts-ignore: TS2683 because of stupid hack
        this.close();
      }.bind(this.ws);
      this.ws.onmessage = function () {
        // @ts-ignore: TS2683 because of stupid hack
        console.log('kill gschissener websocket', this);
        // @ts-ignore: TS2683 because of stupid hack
        this.close();
      }.bind(this.ws);
      this.ws.onopen = function () {
        // @ts-ignore: TS2683 because of stupid hack
        console.log('kill gschissener websocket', this);
        // @ts-ignore: TS2683 because of stupid hack
        this.close();
      }.bind(this.ws);
      this.ws.onerror = function () {
        // @ts-ignore: TS2683 because of stupid hack
        console.log('kill gschissener websocket', this);
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
    log.info('OpenDtuApi.setConfig()', { config, index });

    this.setBaseUrl(config.baseUrl);
    this.setUserString(config.userString);
    this.setIndex(index);
  }

  public async updateHttpState(): Promise<void> {
    log.info('OpenDtuApi.updateHttpState()');

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

  public async getNetworkStatus(): Promise<NetworkStatus | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest(
      '/api/network/status',
      'GET',
    );

    if (!res) {
      return null;
    }

    if (res.status === 200) {
      return await res.json();
    }

    return null;
  }

  public async getNtpStatus(): Promise<NtpStatus | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/ntp/status', 'GET');

    if (!res) {
      return null;
    }

    if (res.status === 200) {
      return await res.json();
    }

    return null;
  }

  public async getMqttStatus(): Promise<MqttStatus | null> {
    if (!this.baseUrl) {
      return null;
    }

    const res = await this.makeAuthenticatedRequest('/api/mqtt/status', 'GET');

    if (!res) {
      return null;
    }

    if (res.status === 200) {
      return await res.json();
    }

    return null;
  }

  public async makeAuthenticatedRequest(
    route: string,
    method: string,
    body: string | null = null,
  ): Promise<Response | null> {
    const authString = this.getAuthString();

    const controller = new AbortController();

    const abortTimeout = setTimeout(() => {
      console.log('makeAuthenticatedRequest', 'Aborting fetch');
      controller.abort();
    }, 10000);

    const requestOptions: RequestInit = {
      method,
      signal: controller.signal,
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Content-Type': 'application/json',
        ...(authString ? { Authorization: 'Basic ' + authString } : {}),
      },
    };

    if (body) {
      requestOptions.body = body;
    }

    const url = `${authString}${this.baseUrl}${route}`;

    console.log('makeAuthenticatedRequest', url, requestOptions);

    try {
      const res = await fetch(url, requestOptions);
      clearTimeout(abortTimeout);

      return res;
    } catch (error) {
      console.log('makeAuthenticatedRequest error', error);
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
    };
  }
}

export type DebugInfo = ReturnType<OpenDtuApi['getDebugInfo']>;

export default OpenDtuApi;
