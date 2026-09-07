import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

function getUrl() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (url && url.startsWith('http')) return url
  return 'https://placeholder.supabase.co'
}

function getKey() {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (key && key.length > 10) return key
  return 'placeholder-anon-key'
}

const SUPABASE_URL = getUrl()
const SUPABASE_ANON_KEY = getKey()

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server component context — can be ignored
          }
        },
      },
    }
  )
}
