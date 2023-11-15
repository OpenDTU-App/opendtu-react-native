const rsplit = (str: string, sep: string, maxsplit?: number): string[] => {
  const split = str.split(sep);
  return maxsplit
    ? [split.slice(0, -maxsplit).join(sep)].concat(split.slice(-maxsplit))
    : split;
};

String.prototype.rsplit = function (sep: string, maxsplit?: number): string[] {
  return rsplit(this as string, sep, maxsplit);
};

declare global {
  interface String {
    rsplit(sep: string, maxsplit?: number): string[];
  }
}

export default rsplit;
