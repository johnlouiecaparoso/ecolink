import { createClient } from '@supabase/supabase-js'
import { requireEnv } from '@/utils/env'

// Initialize Supabase using Vite env vars
// Ensure you set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env
let supabase

try {
  const url = requireEnv('VITE_SUPABASE_URL')
  const key = requireEnv('VITE_SUPABASE_ANON_KEY')
  supabase = createClient(url, key)
} catch (err) {
  // Defer throwing to runtime use-sites to avoid breaking dev server if unset
  console.warn('[supabase] Not initialized:', err?.message)
}

export function getSupabase() {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check your .env values.')
  }
  return supabase
}
