// ago: Returns the number of milliseconds since the given date.
const ago = (date: Date | number): number => {
  if (!date) return -1;

  const now = new Date();

  if (typeof date === 'number') {
    return now.getTime() - date;
  }

  return now.getTime() - date.getTime();
};

export default ago;
