<script setup lang="ts">
import type { Project } from '~/data/portfolio'

const props = defineProps<{ project: Project; index: number }>()
const shownTags = computed(() => props.project.tags.slice(0, 5))
const moreTags = computed(() => props.project.tags.length - shownTags.value.length)
</script>

<template>
    <NuxtLink class="pbox ruin mossy" :to="`/projects/${project.slug}`">
        <RuinCover class="ruin-cover" :project="project" :index="index" />
        <div class="ruin-body">
            <h3>{{ project.title }}</h3>
            <p class="sub">{{ project.subtitle }}</p>
            <p class="summary">{{ project.summary }}</p>
            <div class="chips">
                <span v-for="t in shownTags" :key="t">{{ t }}</span>
                <span v-if="moreTags > 0">+{{ moreTags }}</span>
            </div>
            <div class="meta"><span class="when">{{ project.timeframe }}</span><span>Khám phá →</span></div>
        </div>
    </NuxtLink>
</template>

<style scoped>
.ruin {
    display: flex;
    flex-direction: column;
    padding: 0;
    text-decoration: none;
    transition: transform .1s steps(2);
}

.ruin:hover {
    transform: translateY(-6px);
}

.ruin-cover {
    margin: var(--px);
    border-bottom: var(--px) solid var(--ink);
}

.ruin:hover .ruin-cover :deep(img) {
    transform: scale(1.06);
}

.ruin-body {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 16px 22px 22px;
}

h3 {
    margin: 0 0 8px;
    font: 400 18px/1.3 var(--display);
    color: var(--head);
}

.sub {
    margin: -4px 0 10px;
    font: 600 13px/1.4 var(--body);
    color: var(--teal);
}

.summary {
    margin: 0 0 16px;
    color: var(--muted);
    font-size: 15.5px;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.chips {
    margin-top: auto;
}

.meta {
    display: flex;
    justify-content: space-between;
    margin-top: 16px;
    padding-top: 12px;
    border-top: 2px dashed var(--line);
    font: 600 14px/1 var(--body);
    color: var(--gold);
}

.when {
    font-weight: 500;
    color: var(--muted);
}
</style>
