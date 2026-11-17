import { useEffect, useState } from 'react';

/**
 * Debounces rapidly changing values (such as search inputs) to reduce
 * filtering overhead and avoid unnecessary re-renders on mobile devices.
 * Immediately clears when the input becomes empty for snappy reset UX.
 */
export function useDebouncedValue<T>(value: T, delayMs = 160): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    if (typeof value === 'string' && value === '') {
      setDebouncedValue(value);
      return;
    }

    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
