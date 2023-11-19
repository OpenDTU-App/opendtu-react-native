const percentage = (num?: number, total?: number): string => {
  if (typeof num !== 'number' || typeof total !== 'number') return '?%';

  return `${((num / total) * 100).toFixed(2)}%`;
};

export default percentage;
