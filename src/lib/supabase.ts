import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Standard client for hooks and basic calls
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper to create a client with the Clerk token for Server Components/Actions
export const createClerkSupabaseClient = (clerkToken: string) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
  })
}