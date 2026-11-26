// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: true },
    css: ['~/assets/css/main.css'],
    // Admin runs only in the browser: the login session lives in localStorage, and search engines should skip it.
    routeRules: { '/admin/**': { ssr: false, headers: { 'X-Robots-Tag': 'noindex, nofollow' } } },
    runtimeConfig: {
        public: { siteUrl: 'https://ternal-nguyenquoctri.io.vn', supabaseUrl: '', supabaseKey: '' },
    },
    app: {
        head: {
            htmlAttrs: { lang: 'vi' },
            meta: [{ name: 'theme-color', content: '#0c1412' }],
            link: [
                { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&family=Bungee&family=Silkscreen&display=swap' },
            ],
        },
    },
})
