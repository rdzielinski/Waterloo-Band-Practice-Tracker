

import { useRef, useEffect } from 'react';

/**
 * Custom hook for tracking the previous value of a state or prop.
 * @param value The value to track.
 * @returns The value from the previous render.
 */
export function usePrevious<T>(value: T): T | undefined {
    const ref = useRef<T | undefined>(undefined);
    
    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}
