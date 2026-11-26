<script setup lang="ts">
import { fetchProjects } from '~/data/portfolio'

const projects = await useContent('projects', fetchProjects)

useSeoMeta({
    title: 'Dự án',
    description: () => `${projects.value.length} dự án của Nguyễn Quốc Trí: ${projects.value.map(p => p.title).join(', ')}.`,
})
</script>

<template>
    <main class="page">
        <section class="block">
            <SectionHeading stage="03" eyebrow="Bản đồ di tích" title="Di tích đã khám phá" />

            <ol class="list">
                <li v-for="(p, i) in projects" :key="p.slug" class="pbox mossy entry">
                    <NuxtLink class="cover-link" :to="`/projects/${p.slug}`" tabindex="-1" aria-hidden="true">
                        <RuinCover :project="p" :index="i" />
                    </NuxtLink>
                    <div class="body">
                        <h3>
                            <NuxtLink :to="`/projects/${p.slug}`">{{ p.title }}</NuxtLink>
                        </h3>
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
                        <div class="chips">
                            <span v-for="t in p.tags" :key="t">{{ t }}</span>
                        </div>
                        <div class="actions">
                            <NuxtLink class="btn" :to="`/projects/${p.slug}`">Khám phá di tích →</NuxtLink>
                            <a v-if="p.github" class="btn ghost" :href="p.github" target="_blank"
                                rel="noopener">GitHub</a>
                        </div>
                    </div>
                </li>
            </ol>
        </section>
    </main>
</template>

<style scoped>
.page {
    padding-top: 64px;
    min-height: 100svh;
}

.list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 48px;
}

.entry {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    gap: 0;
    padding: 0;
}

/* Alternate the cover side */
.entry:nth-child(even) .cover-link {
    order: 2;
}

.cover-link {
    display: block;
    margin: var(--px);
    background: var(--ink);
}

/* Fill the column height instead of keeping 16:9 (16:9 plus full height would overflow sideways) */
.cover-link :deep(.cover) {
    aspect-ratio: auto;
    height: 100%;
    min-height: 280px;
}

.cover-link :deep(img) {
    object-position: top;
}

/* covers are site screenshots: keep the page header in view */
.cover-link:hover :deep(img) {
    transform: scale(1.05);
}

.body {
    display: flex;
    flex-direction: column;
    padding: 26px 28px 28px;
}

h3 {
    margin: 0 0 6px;
    font: 400 clamp(22px, 2.6vw, 28px)/1.2 var(--display);
    color: var(--head);
}

h3 a {
    text-decoration: none;
}

h3 a:hover {
    color: var(--gold);
}

.sub {
    margin: 0 0 16px;
    font: 600 14px/1.4 var(--body);
    color: var(--teal);
}

.facts {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 28px;
    margin: 0 0 16px;
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
    color: var(--muted);
    font-size: 15.5px;
}

.chips {
    margin-bottom: 26px;
}

.actions {
    margin-top: auto;
}

@media (max-width: 860px) {
    .entry {
        grid-template-columns: 1fr;
    }

    .entry:nth-child(even) .cover-link {
        order: 0;
    }

    .cover-link {
        border-bottom: var(--px) solid var(--ink);
    }

    .cover-link :deep(.cover) {
        aspect-ratio: 16 / 9;
        height: auto;
        min-height: 0;
    }

    .body {
        padding: 20px 20px 24px;
    }
}
</style>
