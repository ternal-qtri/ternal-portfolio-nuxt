<script setup lang="ts">
const { siteUrl } = useRuntimeConfig().public
const route = useRoute()
const url = computed(() => siteUrl + route.path)
const description = 'Portfolio của Nguyễn Quốc Trí, sinh viên Phát triển phần mềm tại FPT Polytechnic HCM, định hướng Backend Java/Spring Boot.'

useHead({
    titleTemplate: t => (t ? `${t} · Nguyễn Quốc Trí` : 'Nguyễn Quốc Trí · Backend Developer'),
    link: [{ rel: 'canonical', href: url }],
})
useSeoMeta({
    description,
    ogDescription: description,
    ogSiteName: 'Nguyễn Quốc Trí',
    ogType: 'website',
    ogLocale: 'vi_VN',
    ogUrl: url,
})
</script>

<template>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>
