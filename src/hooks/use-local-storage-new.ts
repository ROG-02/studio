'use client';

import { useState, useEffect, useCallback } from 'react';

function getValue<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') {
    return defaultValue;
  }
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
    return defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Custom event system for localStorage changes
const createStorageEvent = (key: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(`localStorage:${key}`, { 
      detail: { key } 
    }));
  }
};

export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    return getValue(key, defaultValue);
  });

  // Listen for custom storage events
  useEffect(() => {
    const handleStorageChange = () => {
      const newValue = getValue(key, defaultValue);
      setValue(newValue);
    };

    const eventKey = `localStorage:${key}`;
    window.addEventListener(eventKey, handleStorageChange);
    
    // Also listen to the standard storage event for cross-tab changes
    window.addEventListener('storage', (e) => {
      if (e.key === key) {
        handleStorageChange();
      }
    });

    return () => {
      window.removeEventListener(eventKey, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  const setValueAndNotify = useCallback((newValue: React.SetStateAction<T>) => {
    setValue(prevValue => {
      const valueToStore = typeof newValue === 'function' 
        ? (newValue as (prevState: T) => T)(prevValue)
        : newValue;
      
      try {
        localStorage.setItem(key, JSON.stringify(valueToStore));
        // Notify other components about the change
        createStorageEvent(key);
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
      
      return valueToStore;
    });
  }, [key]);

  return [value, setValueAndNotify];
}
