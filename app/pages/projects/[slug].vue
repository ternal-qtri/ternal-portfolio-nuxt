<script setup lang="ts">
import { fetchProjects } from '~/data/portfolio'

// Reuses the 'projects' list (already loaded when coming from /projects); the index gives the #NN badge.
const projects = await useContent('projects', fetchProjects)
const route = useRoute()
const index = projects.value.findIndex(p => p.slug === route.params.slug)
if (index < 0) throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy di tích này', fatal: true })
const p = projects.value[index]!
const videoId = p.video ? youtubeId(p.video) : null

useSeoMeta({ title: p.title, description: p.summary, ogImage: p.cover ?? undefined })
</script>

<template>
    <main class="page">
        <article>
            <NuxtLink class="back" to="/projects">← Bản đồ di tích</NuxtLink>

            <div class="pbox mossy hero">
                <RuinCover class="hero-cover" :project="p" :index="index" />
            </div>

            <header class="head">
                <p class="eyebrow"><span class="stage">DI TÍCH #{{ String(index + 1).padStart(2, '0') }}</span> {{
                    p.timeframe }}</p>
                <h1>{{ p.title }}</h1>
                <p class="sub">{{ p.subtitle }}</p>
                <dl class="facts">
                    <div>
                        <dt>Vai trò</dt>
                        <dd>{{ p.role }}</dd>
                    </div>
                    <div>
                        <dt>Thời gian</dt>
                        <dd>{{ p.timeframe }}</dd>
                    </div>
                </dl>
                <p class="summary">{{ p.summary }}</p>
                <div class="chips"><span v-for="t in p.tags" :key="t">{{ t }}</span></div>
                <div v-if="p.github" class="actions">
                    <a class="btn" :href="p.github" target="_blank" rel="noopener">Xem mã nguồn trên GitHub</a>
                </div>
            </header>

            <section class="part reveal">
                <h2>Tính năng chính</h2>
                <ul class="features">
                    <li v-for="f in p.features" :key="f.title" class="pbox">
                        <h3>{{ f.title }}</h3>
                        <p>{{ f.detail }}</p>
                    </li>
                </ul>
            </section>

            <section class="part reveal">
                <h2>Thử thách &amp; cách giải</h2>
                <ol class="challenges">
                    <li v-for="c in p.challenges" :key="c.problem" class="pbox">
                        <p class="problem"><span class="tag">Vấn đề</span>{{ c.problem }}</p>
                        <p class="solution"><span class="tag">Giải pháp</span>{{ c.solution }}</p>
                    </li>
                </ol>
            </section>

            <section class="part reveal">
                <h2>Bài học rút ra</h2>
                <ul class="lessons">
                    <li v-for="l in p.lessons" :key="l">{{ l }}</li>
                </ul>
            </section>

            <section v-if="videoId" class="part reveal">
                <h2>Video demo</h2>
                <div class="pbox mossy video">
                    <iframe :src="`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`"
                        :title="`Video demo dự án ${p.title}`" loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen />
                </div>
            </section>

            <div class="foot">
                <NuxtLink class="btn ghost" to="/projects">← Quay lại bản đồ di tích</NuxtLink>
            </div>
        </article>
    </main>
</template>

<style scoped>
.page {
    padding-top: 64px;
    min-height: 100svh;
}

article {
    max-width: 920px;
    margin: 0 auto;
    padding: 48px clamp(16px, 6vw, 80px) 72px;
    box-sizing: content-box;
}

.back {
    display: inline-block;
    margin-bottom: 22px;
    font: 600 14px/1 var(--body);
    color: var(--muted);
    text-decoration: none;
}

.back:hover {
    color: var(--gold);
}

.hero {
    padding: 0;
}

.hero-cover {
    margin: var(--px);
}

.hero-cover :deep(img) {
    object-position: top;
}

.head {
    margin: 36px 0 8px;
}

.head .eyebrow {
    margin-bottom: 10px;
}

h1 {
    margin: 0 0 8px;
    font: 400 clamp(30px, 5vw, 44px)/1.15 var(--display);
    color: var(--head);
}

.sub {
    margin: 0 0 20px;
    font: 600 16px/1.4 var(--body);
    color: var(--teal);
}

.facts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 32px;
    margin: 0 0 18px;
    padding-bottom: 14px;
    border-bottom: 2px dashed var(--line);
}

.facts dt {
    font: 700 11px/1.8 var(--body);
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--muted);
}

.facts dd {
    margin: 0;
    font: 600 15px/1.4 var(--body);
}

.summary {
    margin: 0 0 18px;
    font-size: 16.5px;
    color: var(--text);
}

.head .actions {
    margin-top: 24px;
}

.part {
    margin-top: 56px;
}

.part h2 {
    margin: 0 0 22px;
    font-size: clamp(20px, 3vw, 26px);
}

.features {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 24px;
}

.features li {
    padding: 20px 22px;
}

.features h3 {
    margin: 0 0 8px;
    font: 700 16px/1.35 var(--body);
    color: var(--gold);
}

.features p {
    margin: 0;
    color: var(--muted);
    font-size: 15px;
}

.challenges {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 22px;
}

.challenges li {
    padding: 18px 22px;
}

.challenges p {
    margin: 0;
    font-size: 15px;
}

.problem {
    color: var(--head);
    font-weight: 600;
}

.solution {
    margin-top: 10px !important;
    padding-top: 10px;
    border-top: 2px dashed var(--line);
    color: var(--muted);
}

.tag {
    display: inline-block;
    margin-right: 10px;
    padding: 3px 6px;
    font: 800 10px/1.2 var(--body);
    letter-spacing: .08em;
    text-transform: uppercase;
    vertical-align: 2px;
    color: var(--ink);
    background: var(--gold);
}

.solution .tag {
    background: var(--teal);
}

.lessons {
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    gap: 12px;
}

.lessons li {
    position: relative;
    padding-left: 24px;
    color: var(--muted);
    font-size: 15.5px;
}

.lessons li::before {
    content: '';
    position: absolute;
    left: 4px;
    top: .55em;
    width: 8px;
    height: 8px;
    background: var(--teal);
}

.video {
    padding: 0;
}

.video iframe {
    display: block;
    width: calc(100% - 2 * var(--px));
    margin: var(--px);
    aspect-ratio: 16 / 9;
    border: 0;
    background: var(--ink);
}

.foot {
    margin-top: 56px;
    padding-top: 24px;
    border-top: 2px dashed var(--line);
}

@media (max-width: 680px) {
    .features {
        grid-template-columns: 1fr;
    }
}
</style>
