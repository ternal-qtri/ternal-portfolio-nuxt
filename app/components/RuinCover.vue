<script setup lang="ts">
import type { Project } from '~/data/portfolio'

const props = defineProps<{ project: Project; index: number }>()
// No cover yet: draw a pixel ruin in the browser (needs canvas, so client only).
const generated = ref<string | null>(null)
onMounted(() => { if (!props.project.cover) generated.value = coverArt(props.index + 1) })
</script>

<template>
    <div class="cover">
        <img v-if="project.cover || generated" :class="{ gen: !project.cover }" :src="project.cover || generated!"
            :alt="`Ảnh bìa dự án ${project.title}`" loading="lazy">
        <span class="no">#{{ String(index + 1).padStart(2, '0') }}</span>
        <span class="stamp">Đã khám phá</span>
    </div>
</template>

<style scoped>
.cover {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--panel-2);
}

img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: transform .3s steps(3);
}

img.gen {
    image-rendering: pixelated;
}

.no {
    position: absolute;
    top: 10px;
    left: 10px;
    padding: 5px 7px;
    font: 400 13px/1 var(--pixel);
    color: var(--gold);
    background: var(--ink);
}

.stamp {
    position: absolute;
    right: 10px;
    bottom: 10px;
    transform: rotate(-6deg);
    padding: 4px 8px;
    font: 800 11px/1.2 var(--body);
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--teal);
    background: rgba(7, 12, 10, .8);
    border: 3px solid var(--teal);
}
</style>
