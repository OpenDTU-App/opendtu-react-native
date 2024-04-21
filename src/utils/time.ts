import moment from 'moment';

export function timestampToString(timestampSeconds: number): string {
  return moment.utc(timestampSeconds * 1000).format('HH:mm:ss');
}
