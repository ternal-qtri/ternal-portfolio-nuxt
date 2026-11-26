<script setup lang="ts">
const route = useRoute()
const links = [
    { to: '/', label: 'Trang chủ', home: true },
    { to: '/skills', label: 'Kỹ năng' },
    { to: '/projects', label: 'Dự án' },
    { to: '/contact', label: 'Liên hệ' },
]
const isActive = (to: string) => (to === '/' ? route.path === '/' : route.path.startsWith(to))
</script>

<template>
    <nav aria-label="Chính">
        <NuxtLink class="logo" to="/">TERNAL<span>_</span></NuxtLink>
        <ul>
            <li v-for="l in links" :key="l.to" :class="{ 'home-link': l.home }">
                <NuxtLink :to="l.to" :class="{ on: isActive(l.to) }"
                    :aria-current="isActive(l.to) ? 'page' : undefined">{{ l.label }}</NuxtLink>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
nav {
    position: fixed;
    inset: 0 0 auto;
    z-index: 10;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px clamp(16px, 4vw, 40px);
    background: rgba(12, 20, 18, .85);
    border-bottom: var(--px) solid var(--ink);
}

.logo {
    font: 400 18px/1 var(--pixel);
    color: var(--teal);
    text-decoration: none;
}

.logo span {
    color: var(--gold);
    animation: blink 1.2s steps(1) infinite;
}

ul {
    display: flex;
    gap: clamp(14px, 2.5vw, 30px);
    margin: 0;
    padding: 0;
    list-style: none;
    font: 600 15px/1 var(--body);
}

ul a {
    text-decoration: none;
    color: var(--muted);
}

ul a:hover,
ul a.on {
    color: var(--gold);
}

ul a.on::before {
    content: '▸ ';
}

/* Phones: the logo already links home */
@media (max-width: 560px) {
    .home-link {
        display: none;
    }

    ul {
        font-size: 14px;
    }
}
</style>
