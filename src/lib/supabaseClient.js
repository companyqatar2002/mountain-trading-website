import { createClient } from '@supabase/supabase-js'

// These come from your Supabase project settings (Project Settings > API).
// They are set as environment variables in Netlify — see README.md.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
