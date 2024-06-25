const formatVersion = (value: number): string => {
  const version_major = Math.floor(value / 10000);
  const version_minor = Math.floor((value - version_major * 10000) / 100);
  const version_patch = Math.floor(
    value - version_major * 10000 - version_minor * 100,
  );
  return version_major + '.' + version_minor + '.' + version_patch;
};

export default formatVersion;
