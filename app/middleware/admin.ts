// Guards /admin pages: must be signed in AND listed in public.admins (RLS only lets admins see that row).
// The real protection is RLS in the database; this just keeps non-admins out of the UI.
export default defineNuxtRouteMiddleware(async () => {
    const db = useSupabase()
    const { data: { session } } = await db.auth.getSession()
    if (!session) return navigateTo('/admin/login')
    const { data } = await db.from('admins').select('user_id').eq('user_id', session.user.id).maybeSingle()
    if (!data) {
        await db.auth.signOut()
        return navigateTo('/admin/login?denied=1')
    }
})
