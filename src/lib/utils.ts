import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for combining Tailwind CSS class names dynamically
 * and resolving style conflicts safely (e.g. padding overriding).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
