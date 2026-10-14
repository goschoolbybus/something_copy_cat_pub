import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Event = {
  id: string
  name: string
  slug: string
  created_at: string
  admin_token: string
}

export type Photo = {
  id: string
  event_id: string
  url: string
  storage_path: string
  created_at: string
  caption?: string | null
}
