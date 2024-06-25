import moment from 'moment';

export function timestampToString(timestampSeconds: number): string {
  return moment.utc(timestampSeconds * 1000).format('HH:mm:ss');
}

export function durationToString(
  timestampOne: number,
  timestampTwo: number,
): string {
  const duration = moment.duration(timestampTwo - timestampOne, 'seconds');
  return duration.humanize();
}
