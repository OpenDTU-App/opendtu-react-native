const sizes = ['B', 'KB', 'MB'];

const formatBytes = (bytes?: number): string => {
  if (typeof bytes !== 'number') return '? B';

  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

export default formatBytes;
