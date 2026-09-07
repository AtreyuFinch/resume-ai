import { createBrowserClient } from '@supabase/ssr'

function getSupabaseUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url && url.startsWith('http')) return url
  return 'https://placeholder.supabase.co'
}

function getSupabaseKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (key && key.length > 10) return key
  return 'placeholder-anon-key'
}

export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabaseKey())
}
