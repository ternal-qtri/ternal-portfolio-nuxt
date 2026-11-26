import type { SupabaseClient } from '@supabase/supabase-js'

export async function useContent<T>(key: string, fetcher: (db: SupabaseClient) => Promise<T>) {
    const { data, error } = await useAsyncData(key, () => fetcher(useSupabase()))
    if (error.value) throw createError({ statusCode: error.value.statusCode ?? 500, statusMessage: error.value.statusMessage, fatal: true })
    return data as Ref<T>
}
