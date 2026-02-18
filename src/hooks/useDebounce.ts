import { useState, useEffect } from 'react';

/**
 * Delays updating a value until the user stops typing.
 * Use this for search inputs to avoid firing API calls on every keystroke.
 *
 * Usage:
 *   const debouncedSearch = useDebounce(search, 400);
 *   // Use debouncedSearch in your useEffect/useCallback deps instead of search
 */
export function useDebounce<T>(value: T, delayMs: number = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
