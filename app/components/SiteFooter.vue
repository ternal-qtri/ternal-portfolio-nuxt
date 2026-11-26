<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
    <footer>© {{ year }} Nguyễn Quốc Trí · Cảm ơn đã cùng thám hiểm</footer>
</template>

<style scoped>
footer {
    padding: 32px 16px 40px;
    text-align: center;
    font: 600 13px/2 var(--body);
    color: var(--muted);
    border-top: var(--px) solid var(--ink);
    background: var(--ink);
}
</style>
