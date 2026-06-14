import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number | null | undefined): string {
  const n = Number(value ?? 0);
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

