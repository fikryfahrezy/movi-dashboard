import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useDebounce } from './useDebounce';

export function useDebouncedInput(
  externalValue: string,
  onChange: (value: string) => void,
  delay: number
): [string, (e: ChangeEvent<HTMLInputElement>) => void] {
  const [localValue, setLocalValue] = useState(externalValue);

  const debouncedOnChange = useDebounce(onChange, delay);

  useEffect(() => {
    setLocalValue(externalValue);
  }, [externalValue]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    debouncedOnChange(e.target.value);
  };

  return [localValue, handleChange];
}
