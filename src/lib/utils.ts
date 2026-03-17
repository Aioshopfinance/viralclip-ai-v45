/* General utility functions (exposes cn and normalizeUrl) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normalizes a URL by removing protocol, www, trailing slashes, and converting to lowercase
 * @param url - The raw URL string
 * @returns The normalized URL string
 */
export function normalizeUrl(url: string): string {
  if (!url) return ''
  return url
    .toLowerCase()
    .trim()
    .replace(/^(https?:\/\/)?(www\.)?/, '')
    .replace(/\/$/, '')
}
