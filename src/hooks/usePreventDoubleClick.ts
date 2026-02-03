import { useRef, useCallback } from 'react';

/**
 * Custom hook to prevent double-clicking/rapid button presses
 * @param delay - Minimum delay between clicks in milliseconds (default: 500ms)
 * @returns Wrapped function that prevents rapid calls
 */
export function usePreventDoubleClick<T extends (...args: any[]) => any>(
  func: T,
  delay: number = 500
): T {
  const lastCallTime = useRef<number>(0);
  const isProcessing = useRef<boolean>(false);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastCall = now - lastCallTime.current;

      // Prevent if called too soon or already processing
      if (timeSinceLastCall < delay || isProcessing.current) {
        return;
      }

      lastCallTime.current = now;
      isProcessing.current = true;

      // Execute the function
      const result = func(...args);

      // If it's a promise, reset processing flag after completion
      if (result instanceof Promise) {
        result
          .then(() => {
            isProcessing.current = false;
          })
          .catch(() => {
            isProcessing.current = false;
          });
      } else {
        // For synchronous functions, reset after delay
        setTimeout(() => {
          isProcessing.current = false;
        }, delay);
      }

      return result;
    }) as T,
    [func, delay]
  );
}

