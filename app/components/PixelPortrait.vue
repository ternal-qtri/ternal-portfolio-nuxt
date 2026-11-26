<script setup lang="ts">
const canvas = ref<HTMLCanvasElement>()
let stop = () => { }
onMounted(() => {
    const g = canvas.value!.getContext('2d')!
    stop = animate((t) => {
        g.clearRect(0, 0, 22, 21)
        drawHero(g, 4, 1, t, { walk: false, face: 1, atk: -1 })
    })
})
onBeforeUnmount(() => stop())
</script>

<template>
    <canvas ref="canvas" width="22" height="21" role="img" aria-label="Nhân vật nhà thám hiểm pixel" />
</template>

<style scoped>
canvas {
    image-rendering: pixelated;
}
</style>
