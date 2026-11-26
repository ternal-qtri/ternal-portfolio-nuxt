// Fades `.reveal` sections in as they scroll into view.
export default defineNuxtPlugin((nuxtApp) => {
    document.documentElement.classList.add('js')
    const io = new IntersectionObserver(entries => entries.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.classList.add('in')
        io.unobserve(e.target)
    }), { threshold: 0.12 })
    const observe = () => document.querySelectorAll('.reveal:not(.in)').forEach(el => io.observe(el))
    nuxtApp.hook('app:mounted', observe)
    nuxtApp.hook('page:finish', observe)
})
