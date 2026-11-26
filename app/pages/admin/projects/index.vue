<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý dự án' })

interface Row { id: number; slug: string; title: string; published: boolean; position: number; started_on: string; cover_url: string | null }

const db = useSupabase()
const rows = ref<Row[]>([])
const error = ref('')

async function load() {
    const { data, error: e } = await db.from('projects').select('id, slug, title, published, position, started_on, cover_url').order('position')
    if (e) error.value = e.message
    else rows.value = data
}
await load()

async function togglePublished(r: Row) {
    const { error: e } = await db.from('projects').update({ published: !r.published }).eq('id', r.id)
    if (e) error.value = e.message
    else r.published = !r.published
}

async function remove(r: Row) {
    if (!confirm(`Xóa dự án "${r.title}"? Toàn bộ tính năng, thử thách, bài học của nó cũng bị xóa và không khôi phục được.`)) return
    const { error: e } = await db.from('projects').delete().eq('id', r.id)
    if (e) error.value = e.message
    else rows.value = rows.value.filter(x => x.id !== r.id)
}
</script>

<template>
    <div>
        <div class="head-row">
            <div>
                <h1>Dự án</h1>
                <p class="hint">Thứ tự hiển thị theo cột "Thứ tự" (nhỏ trước). Dự án ẩn không hiện ngoài site.</p>
            </div>
            <NuxtLink class="btn" to="/admin/projects/new">+ Thêm dự án</NuxtLink>
        </div>
        <p v-if="error" class="msg err" role="alert">{{ error }}</p>

        <ul class="list">
            <li v-for="r in rows" :key="r.id" class="pbox item">
                <img v-if="r.cover_url" :src="r.cover_url" alt="" loading="lazy">
                <span v-else class="noimg">Chưa có ảnh</span>
                <div class="info">
                    <strong>{{ r.title }}</strong>
                    <small>/projects/{{ r.slug }} · thứ tự {{ r.position }} · bắt đầu {{ r.started_on.slice(5, 7) }}/{{ r.started_on.slice(0, 4) }}</small>
                </div>
                <span class="state" :class="{ on: r.published }">{{ r.published ? 'Đang hiện' : 'Đang ẩn' }}</span>
                <div class="row-tools">
                    <button type="button" class="mini" @click="togglePublished(r)">{{ r.published ? 'Ẩn' : 'Xuất bản' }}</button>
                    <NuxtLink class="mini" :to="`/admin/projects/${r.id}`">Sửa</NuxtLink>
                    <button type="button" class="mini danger" @click="remove(r)">Xóa</button>
                </div>
            </li>
        </ul>
        <p v-if="!rows.length && !error" class="hint">Chưa có dự án nào.</p>
    </div>
</template>

<style scoped>
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
.item { display: grid; grid-template-columns: 120px minmax(0, 1fr) auto auto; align-items: center; gap: 16px; padding: 12px 16px 12px 12px; }
img, .noimg { width: 120px; aspect-ratio: 16 / 9; object-fit: cover; object-position: top; background: var(--ink); }
.noimg { display: grid; place-items: center; font-size: 12px; color: var(--muted); }
.info { display: grid; gap: 4px; min-width: 0; }
.info strong { font: 700 16px/1.3 var(--body); color: var(--head); }
.info small { color: var(--muted); font-size: 13px; overflow-wrap: anywhere; }
.state { font: 800 11px/1 var(--body); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.state.on { color: var(--teal); }
a.mini { text-decoration: none; }
@media (max-width: 700px) {
    .item { grid-template-columns: 96px minmax(0, 1fr); }
    img, .noimg { width: 96px; }
    .state, .row-tools { grid-column: 1 / -1; }
}
</style>
