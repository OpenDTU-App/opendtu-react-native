import type { UpdateResult } from '@/database';

import type { PayloadAction } from '@reduxjs/toolkit';

export type Now = 'now';

export interface Ago {
  seconds: number;
}

export type DatabaseTimeRangeStart = Date | Ago;
export type DatabaseTimeRangeEnd = Date | Now;

export interface DatabaseTimeRange {
  start: DatabaseTimeRangeStart;
  end: DatabaseTimeRangeEnd;
}

export interface DatabaseState {
  data: UpdateResult | null;
  timeRange: DatabaseTimeRange;
  refreshInterval: number;
}

// Redux Actions
export type SetUpdateResultAction = PayloadAction<{
  data: UpdateResult;
}>;

export type SetTimeRangeFromAction = PayloadAction<{
  start?: DatabaseTimeRangeStart;
}>;

export type SetTimeRangeToAction = PayloadAction<{
  end?: DatabaseTimeRangeEnd;
}>;

export type SetTimeRangeLastNSecondsAction = PayloadAction<{
  seconds?: number;
}>;

export type SetRefreshIntervalAction = PayloadAction<{
  refreshInterval: number;
}>;
