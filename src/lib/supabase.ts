import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Standard client: Safe for browser (NotificationSetup)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Admin client: FOR SERVER-SIDE USE ONLY (Dashboard fetching)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)