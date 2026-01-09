import clsx from "clsx";

/**
 * Utilitaire pour combiner les classes CSS avec clsx
 * @param {...any} inputs - Classes CSS à combiner
 * @returns {string} Classes CSS combinées
 */
export function cn(...inputs) {
    return clsx(inputs);
}
