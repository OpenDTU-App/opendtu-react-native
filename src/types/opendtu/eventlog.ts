export interface EventLogData {
  count: number;
  events: {
    message_id: number;
    message: string;
    start_time: number;
    end_time: number;
  }[];
}
