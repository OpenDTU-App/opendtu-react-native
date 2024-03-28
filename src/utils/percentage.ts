const percentage = (num?: number, total?: number): string => {
  if (typeof num !== 'number' || typeof total !== 'number' || total === 0)
    return '?%';

  return `${((num / total) * 100).toFixed(2)}%`;
};

export default percentage;
