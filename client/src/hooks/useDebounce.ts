import {useEffect, useRef} from "react";

export default function useDebounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
): T {
    const timeoutRef = useRef<number>(0);

    const debouncedFn = ((...args: never[]) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
            func(...args);
        }, delay);
    }) as T;

    // Clear timeout if unmounted
    useEffect(() => {
        return () => clearTimeout(timeoutRef.current);
    }, []);

    return debouncedFn;
}