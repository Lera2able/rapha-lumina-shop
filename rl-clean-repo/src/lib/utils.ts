import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return `R ${amount.toFixed(2)}`
}

export function formatPriceShort(amount: number): string {
  return `R${Math.round(amount)}`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function collectionLabel(collection: string): string {
  return collection === 'enlightened' ? 'Enlightened Collection' : 'Teacher Collection'
}

export const FREE_SHIPPING_THRESHOLD = 700
export const SHIPPING_COST = 100

export function calculateShipping(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST
}
