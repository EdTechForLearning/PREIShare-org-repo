import '@tanstack/react-start/server-only'
import { createServerClient } from '@supabase/ssr'
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js'
import {
  getCookies,
  setCookie,
  setResponseHeader,
} from '@tanstack/react-start/server'
import type { Database } from './supabase/types'

function getPublicSupabaseConfig() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Missing required public Supabase configuration: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }
  return { url, anonKey }
}

function setPrivateNoStoreHeaders() {
  setResponseHeader('cache-control', 'private, no-store')
}

export async function createServerSupabaseClient(): Promise<{
  supabase: SupabaseClient<Database>
  user: User | null
}> {
  if (typeof window !== 'undefined') {
    throw new Error('The session-aware Supabase client must run on the server.')
  }

  const { url, anonKey } = getPublicSupabaseConfig()
  setPrivateNoStoreHeaders()

  const supabase = createServerClient<Database>(url, anonKey, {
    cookieOptions: {
      path: '/',
      sameSite: 'lax',
      secure: import.meta.env.PROD,
    },
    cookies: {
      getAll() {
        return Object.entries(getCookies()).map(([name, value]) => ({
          name,
          value,
        }))
      },
      setAll(cookies, headers) {
        for (const { name, value, options } of cookies) {
          setCookie(name, value, options)
        }

        if (headers['Cache-Control']) {
          setResponseHeader('cache-control', headers['Cache-Control'])
        }
        if (headers.Expires) {
          setResponseHeader('expires', headers.Expires)
        }
        if (headers.Pragma) {
          setResponseHeader('pragma', headers.Pragma)
        }

        setPrivateNoStoreHeaders()
      },
    },
  })

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession()
  if (sessionError) {
    throw sessionError
  }
  if (!sessionData.session) {
    return { supabase, user: null }
  }

  const { data, error } = await supabase.auth.getUser(
    sessionData.session.access_token,
  )
  if (error) {
    if (error.status === 401) {
      const { error: signOutError } = await supabase.auth.signOut({
        scope: 'local',
      })
      if (signOutError) {
        throw signOutError
      }
      return { supabase, user: null }
    }
    throw error
  }

  return { supabase, user: data.user }
}

export function createPrivilegedSupabaseClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('The privileged Supabase client can only run on the server.')
  }

  const { url } = getPublicSupabaseConfig()
  const secretKey = process.env.SUPABASE_SECRET_KEY
  if (!secretKey) {
    throw new Error(
      'Missing server-only environment variable: SUPABASE_SECRET_KEY.',
    )
  }

  // Sponsor dashboard reads and writes must use the session-aware RLS client, never the service-role client.
  return createClient<Database>(url, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}
