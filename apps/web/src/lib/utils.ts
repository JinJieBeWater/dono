import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const IS_SERVER = typeof window === "undefined";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
