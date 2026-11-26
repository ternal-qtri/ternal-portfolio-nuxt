<script setup lang="ts">
const canvas = ref<HTMLCanvasElement>()
let stop = () => { }
onMounted(() => {
    const g = canvas.value!.getContext('2d')!
    stop = animate(t => drawCampfire(g, t))
})
onBeforeUnmount(() => stop())
</script>

<template>
    <canvas ref="canvas" width="36" height="28" aria-hidden="true" />
</template>

<style scoped>
canvas {
    width: 144px;
    image-rendering: pixelated;
}
</style>
