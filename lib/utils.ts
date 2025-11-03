import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names using clsx and merges Tailwind CSS classes using twMerge.
 * This function is commonly used in React components to conditionally apply class names.
 *
 * @param inputs - Class values to be combined and merged
 * @returns Merged class names string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getUTCDate(){
    const date = new Date();

    return new Date(date.getTime() + date.getTimezoneOffset() * 60000);
}
