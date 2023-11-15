import type { PayloadAction } from '@reduxjs/toolkit';

import type { UpdateResult } from '@/database';

export type Now = 'now';

export interface Ago {
  seconds: number;
}

export interface DatabaseTimeRange {
  start: Date | Ago;
  end: Date | Now;
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
  start: Date | Ago;
}>;

export type SetTimeRangeToAction = PayloadAction<{
  end: Date | Now;
}>;

export type SetTimeRangeLastNSecondsAction = PayloadAction<{
  seconds: number;
}>;

export type SetRefreshIntervalAction = PayloadAction<{
  refreshInterval: number;
}>;
