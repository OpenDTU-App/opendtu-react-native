import type { PayloadAction } from '@reduxjs/toolkit';

import type { DatabaseType } from '@/database';

export type Index = number;

export interface OpenDTUConfig {
  // Config to connect to OpenDTU. It will be possible to configure multiple
  baseUrl: string;
  userString: string | null; // same as 'user' from webinterface localstorage (null means no auth, so read-only)
  serialNumber: string | null; // null means never connected
  hostname: string | null; // null means never connected
  customName: string | null; // null means customName is not set
  databaseUuid: string | null; // null means no database is selected
}

export interface DatabaseConfig {
  // Config to connect to a database (e.g. Prometheus)
  baseUrl: string;
  databaseType: DatabaseType;
  uuid: string;
  name: string;
  username: string;
  password: string;
}

export interface SettingsState {
  // app specific
  appTheme: 'light' | 'dark' | 'system';
  language: 'en' | 'de';
  enableAppUpdates: boolean | null;

  // opendtu
  dtuConfigs: OpenDTUConfig[];
  selectedDtuConfig: number | null;

  // database
  databaseConfigs: DatabaseConfig[];
}

// Redux Actions
export type SetAppThemeModeAction = PayloadAction<{
  appTheme: SettingsState['appTheme'];
}>;

export type SetLanguageAction = PayloadAction<{
  language: SettingsState['language'];
}>;

export type SetSelectedDtuConfigAction = PayloadAction<{
  index: Index;
}>;

export type AddDtuConfigAction = PayloadAction<{
  config: OpenDTUConfig;
}>;

export type RemoveDtuConfigAction = PayloadAction<{
  index: Index;
}>;

export type UpdateDtuConfigAction = PayloadAction<{
  index: Index;
  config: OpenDTUConfig;
}>;

export type UpdateDtuHostnameAction = PayloadAction<{
  index: Index;
  hostname: string;
}>;

export type UpdateDtuSerialNumberAction = PayloadAction<{
  index: Index;
  serialNumber: string;
}>;

export type UpdateDtuCustomNameAction = PayloadAction<{
  index: Index;
  customName: string;
}>;

export type UpdateDtuBaseURLAction = PayloadAction<{
  index: Index;
  baseUrl: string;
}>;

export type AddDatabaseConfigAction = PayloadAction<{
  config: DatabaseConfig;
}>;

export type RemoveDatabaseConfigAction = PayloadAction<{
  uuid: string;
}>;

export type UpdateDatabaseConfigAction = PayloadAction<{
  uuid: string;
  config: DatabaseConfig;
}>;

export type UpdateDTUDatabaseUuidAction = PayloadAction<{
  index: Index;
  databaseUuid: string | 'none';
}>;

export type EnableAppUpdatesAction = PayloadAction<{
  enable: boolean;
}>;
