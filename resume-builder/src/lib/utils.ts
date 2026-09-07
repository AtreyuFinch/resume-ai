import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | null): string {
  if (!date) return 'Present'
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function getATSScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getATSScoreBg(score: number): string {
  if (score >= 80) return 'bg-green-100 border-green-200'
  if (score >= 60) return 'bg-yellow-100 border-yellow-200'
  return 'bg-red-100 border-red-200'
}
