<script setup lang="ts">
import type { Skill } from '~/data/portfolio'

const props = defineProps<{ skill: Skill; hotkey?: number }>()
const failed = ref(false)
const initials = computed(() => props.skill.name.split(/[\s/.]+/).filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase())
</script>

<template>
    <div class="slot">
        <img v-if="skill.icon && !failed" :src="skill.icon" alt="" loading="lazy" @error="failed = true">
        <b v-else>{{ initials }}</b>
        <i v-if="hotkey" class="key">{{ hotkey }}</i>
    </div>
</template>

<style scoped>
.slot {
    position: relative;
    width: 64px;
    height: 64px;
    display: grid;
    place-items: center;
    background: var(--parchment);
    box-shadow: 0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink), inset 0 -4px 0 0 #c9bf9c;
    transition: transform .1s steps(2);
}

img {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

b {
    font: 400 15px/1 var(--display);
    color: #4a3a22;
}

.key {
    position: absolute;
    right: -6px;
    bottom: -6px;
    min-width: 18px;
    padding: 2px 3px;
    font: 400 11px/1 var(--pixel);
    font-style: normal;
    text-align: center;
    color: var(--parchment);
    background: var(--ink);
}
</style>
