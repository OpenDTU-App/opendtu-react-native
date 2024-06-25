import type { DependencyList } from 'react';
import { useEffect, useMemo, useState } from 'react';

const useMemoWithInterval: <T>(
  factory: () => T,
  deps: DependencyList,
  refreshInterval?: number,
) => T = (factory, deps, refreshInterval) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tick, setTick] = useState<number>(0);
  const extendedDeps = [...deps, tick];

  useEffect(() => {
    if (!refreshInterval) {
      return;
    }

    const interval = setInterval(() => {
      setTick(tick => tick + 1);
    }, refreshInterval ?? 1000);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(factory, extendedDeps);
};

export default useMemoWithInterval;
