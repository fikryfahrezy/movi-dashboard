import { useCallback, useEffect, useRef } from 'react';
import { debounce } from '../utils/debounce';

export function useDebounce<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number
): (...args: TArgs) => void {
  const callbackRef = useRef<(...args: TArgs) => void>(callback);
  const debouncedRef = useRef<((...args: TArgs) => void) | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => {
    debouncedRef.current = debounce((...args: TArgs) => {
      callbackRef.current(...args);
    }, delay);
    return () => {
      debouncedRef.current = null;
    };
  }, [delay]);

  return useCallback((...args: TArgs) => {
    debouncedRef.current?.(...args);
  }, []);
}
