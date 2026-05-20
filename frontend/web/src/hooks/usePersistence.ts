import { useEffect, useRef, useState } from 'react';

/**
 * Hook to automatically persist data to localStorage and session storage
 * @param key - The localStorage key to use
 * @param data - The data to persist
 * @param options - Configuration options
 */
export function usePersistence<T>(
  key: string,
  data: T,
  options: {
    immediate?: boolean; // Save immediately on data change
    debounceMs?: number; // Debounce saves by this many milliseconds
    onSave?: (data: T) => void; // Callback when data is saved
    onLoad?: (data: T | null) => void; // Callback when data is loaded
  } = {}
) {
  const {
    immediate = true,
    debounceMs = 100,
    onSave,
    onLoad
  } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isInitialLoad = useRef(true);
  
  // Load data on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (onLoad) {
          onLoad(parsed);
        }
      }
    } catch (error) {
      console.error(`Error loading data for key ${key}:`, error);
    }
    isInitialLoad.current = false;
  }, [key, onLoad]);
  
  // Save data when it changes
  useEffect(() => {
    if (isInitialLoad.current) return;
    
    const saveData = () => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
        if (onSave) {
          onSave(data);
        }
        // Session backup runs on interval / page unload — not on every key write (was blocking UI)
      } catch (error) {
        console.error(`Error saving data for key ${key}:`, error);
      }
    };
    
    if (immediate) {
      saveData();
    } else {
      // Debounced save
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(saveData, debounceMs);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, immediate, debounceMs, onSave]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
}

/**
 * Hook to persist array data with automatic loading and saving
 * @param key - The localStorage key to use
 * @param initialData - Initial data if nothing is saved
 */
export function useArrayPersistence<T>(
  key: string,
  initialData: T[] = []
): [T[], (data: T[] | ((prev: T[]) => T[])) => void] {
  const [data, setData] = useState<T[]>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });
  
  const setDataWithPersistence = (newData: T[] | ((prev: T[]) => T[])) => {
    if (typeof newData === 'function') {
      setData(prev => {
        const updated = newData(prev);
        // Save to localStorage immediately
        try {
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (error) {
          console.error('Failed to save array data:', error);
        }
        return updated;
      });
    } else {
      setData(newData);
      // Save to localStorage immediately
      try {
        localStorage.setItem(key, JSON.stringify(newData));
      } catch (error) {
        console.error('Failed to save array data:', error);
      }
    }
  };
  
  usePersistence(key, data);
  
  return [data, setDataWithPersistence];
}

/**
 * Hook to persist object data with automatic loading and saving
 * @param key - The localStorage key to use
 * @param initialData - Initial data if nothing is saved
 */
export function useObjectPersistence<T extends Record<string, any>>(
  key: string,
  initialData: T
): [T, (data: T) => void] {
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });
  
  usePersistence(key, data, {
    onSave: (savedData) => {
      console.log(`Object data saved for key ${key}:`, Object.keys(savedData).length, 'properties');
    }
  });
  
  return [data, setData];
}

/**
 * Hook to persist primitive data (string, number, boolean) with automatic loading and saving
 * @param key - The localStorage key to use
 * @param initialData - Initial data if nothing is saved
 */
export function usePrimitivePersistence<T extends string | number | boolean>(
  key: string,
  initialData: T
): [T, (data: T) => void] {
  const [data, setData] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved === null) return initialData;
      
      // Parse based on type
      if (typeof initialData === 'boolean') {
        return (saved === 'true') as T;
      } else if (typeof initialData === 'number') {
        return Number(saved) as T;
      } else {
        return saved as T;
      }
    } catch {
      return initialData;
    }
  });
  
  usePersistence(key, data, {
    onSave: (savedData) => {
      console.log(`Primitive data saved for key ${key}:`, savedData);
    }
  });
  
  return [data, setData];
}

export default usePersistence;
