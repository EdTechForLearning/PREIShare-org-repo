import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'

const COOKIE_CHUNK_SIZE = 3180
const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 60 * 60

function getCookieEntries(): Array<[string, string]> {
  return document.cookie
    .split(';')
    .map((cookie) => cookie.trim())
    .filter(Boolean)
    .map((cookie) => {
      const separator = cookie.indexOf('=')
      const name = cookie.slice(0, separator)
      const value = cookie.slice(separator + 1)
      return [name, decodeURIComponent(value)]
    })
}

function splitCookieValue(value: string): string[] {
  let encodedValue = encodeURIComponent(value)
  if (encodedValue.length <= COOKIE_CHUNK_SIZE) {
    return [value]
  }

  const chunks: string[] = []
  while (encodedValue.length > 0) {
    let encodedChunk = encodedValue.slice(0, COOKIE_CHUNK_SIZE)
    const lastEscape = encodedChunk.lastIndexOf('%')
    if (lastEscape > COOKIE_CHUNK_SIZE - 3) {
      encodedChunk = encodedChunk.slice(0, lastEscape)
    }

    const chunk = decodeURIComponent(encodedChunk)
    chunks.push(chunk)
    encodedValue = encodedValue.slice(encodedChunk.length)
  }

  return chunks
}

function decodeStoredValue(value: string): string {
  if (!value.startsWith('base64-')) {
    return value
  }

  const base64 = value.slice('base64-'.length).replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function createCookieStorage() {
  return {
    getItem(key: string): string | null {
      const cookies = new Map(getCookieEntries())
      const directValue = cookies.get(key)
      if (directValue !== undefined) {
        return decodeStoredValue(directValue)
      }

      const chunks = [...cookies.entries()]
        .flatMap(([name, value]) => {
          const match = name.match(new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.(\\d+)$`))
          return match ? [{ index: Number(match[1]), value }] : []
        })
        .sort((left, right) => left.index - right.index)

      if (chunks.length === 0 || chunks.some((chunk, index) => chunk.index !== index)) {
        return null
      }

      return decodeStoredValue(chunks.map((chunk) => chunk.value).join(''))
    },

    setItem(key: string, value: string): void {
      const cookies = new Map(getCookieEntries())
      const staleNames = [...cookies.keys()].filter((name) =>
        name === key || name.startsWith(`${key}.`),
      )

      for (const name of staleNames) {
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${import.meta.env.PROD ? '; Secure' : ''}`
      }

      const chunks = splitCookieValue(value)
      chunks.forEach((chunk, index) => {
        const name = chunks.length === 1 ? key : `${key}.${index}`
        document.cookie = `${name}=${encodeURIComponent(chunk)}; Path=/; Max-Age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax${import.meta.env.PROD ? '; Secure' : ''}`
      })
    },

    removeItem(key: string): void {
      const cookieNames = new Set([
        key,
        ...getCookieEntries()
          .map(([name]) => name)
          .filter((name) => name.startsWith(`${key}.`)),
      ])

      for (const name of cookieNames) {
        document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${import.meta.env.PROD ? '; Secure' : ''}`
      }
    },
  }
}

let browserClient: SupabaseClient<Database> | undefined

export function createBrowserSupabaseClient(): SupabaseClient<Database> {
  if (typeof document === 'undefined') {
    throw new Error('The browser Supabase client can only be created in a browser.')
  }

  if (browserClient) {
    return browserClient
  }

  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || !anonKey) {
    throw new Error(
      'Missing required public Supabase configuration: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.',
    )
  }

  browserClient = createClient<Database>(url, anonKey, {
    auth: {
      storage: createCookieStorage(),
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  })

  return browserClient
}
