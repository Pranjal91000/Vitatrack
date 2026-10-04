import { useState } from 'react';

const UNSET = Symbol('unset');

/**
 * Runs `onChange` during render whenever `value` changes (including the first render).
 * This is React's recommended "adjust state when a prop changes" pattern — no effect,
 * no extra paint with stale form values.
 */
export function useOnChange<T>(value: T, onChange: (v: T) => void) {
  const [prev, setPrev] = useState<T | typeof UNSET>(UNSET);
  if (prev === UNSET || !Object.is(prev, value)) {
    setPrev(value);
    onChange(value);
  }
}
