import { useCallback, useRef, useState } from 'react';

const useRequireMultiplePresses = (
  onPress: () => void,
  requiredPresses = 3,
  timeout = 500,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setPresses] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  return useCallback(() => {
    setPresses(prevPresses => {
      if (prevPresses === 0) {
        timeoutRef.current = setTimeout(() => {
          setPresses(0);
        }, timeout);
      }

      if (prevPresses + 1 === requiredPresses) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        onPress();
        return 0;
      }

      return prevPresses + 1;
    });
  }, [onPress, requiredPresses, timeout]);
};

export default useRequireMultiplePresses;
