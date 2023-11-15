import ipRegex from 'ip-regex';

const isIP = (ip: string | undefined | null): boolean => {
  if (!ip) return false;

  return ipRegex({ exact: true }).test(ip);
};

export default isIP;
