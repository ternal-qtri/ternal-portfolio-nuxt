<script setup lang="ts">
defineProps<{ stage: string; eyebrow: string; title: string }>()
</script>

<template>
    <div class="heading">
        <p class="eyebrow"><span class="stage">STAGE {{ stage }}</span> {{ eyebrow }}</p>
        <h2>{{ title }}</h2>
    </div>
</template>
