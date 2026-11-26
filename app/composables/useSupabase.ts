import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | undefined

export function useSupabase() {
    if (client) return client
    const { supabaseUrl, supabaseKey } = useRuntimeConfig().public
    if (!supabaseUrl || !supabaseKey) throw new Error('Missing NUXT_PUBLIC_SUPABASE_URL / NUXT_PUBLIC_SUPABASE_KEY (see .env.example)')
    client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: import.meta.client } })
    return client
}
