import { useState, useCallback } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      console.log(`got value to localStorage ${key}: ${JSON.stringify(item)}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error: unknown) {
      console.error("getting stored value for key:", key, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((value: T) => T)): void => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        localStorage.setItem(key, JSON.stringify(valueToStore));
        console.log(
          `saved value to localStorage ${key}: ${JSON.stringify(valueToStore)}`
        );
        setStoredValue(valueToStore);
      } catch (error: unknown) {
        console.error("setting stored value for key:", key, error);
      }
    },
    [key, storedValue]
  );

  // as const so that useLocalStorage follows the same API as useState
  return [storedValue, setValue] as const;
}
