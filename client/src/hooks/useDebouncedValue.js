import { useState, useEffect, useRef } from "react";

/**
 * Hook qui retourne une valeur débounced après un délai spécifié
 * @param {any} value - La valeur à debouncer
 * @param {number} delay - Le délai en millisecondes
 * @returns {any} La valeur débounced
 */
export function useDebouncedValue(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    const timeoutRef = useRef(null);

    useEffect(() => {
        // Clear le timeout précédent
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Créer un nouveau timeout
        timeoutRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [value, delay]);

    return debouncedValue;
}
