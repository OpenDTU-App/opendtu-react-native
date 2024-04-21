// ago: Returns the number of milliseconds since the given date.
const ago = (date: Date | number | unknown): number => {
  if (!date) return -1;

  const now = new Date();

  if (typeof date === 'number') {
    return now.getTime() - date;
  }

  if (date instanceof Date) {
    return now.getTime() - date.getTime();
  }

  return -1;
};

export default ago;
