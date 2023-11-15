// ago: Returns the number of milliseconds since the given date.
const ago = (date: Date): number => {
  if (!date || typeof date.getTime === 'undefined') return -1;

  const now = new Date();
  return now.getTime() - date.getTime();
};

export default ago;
