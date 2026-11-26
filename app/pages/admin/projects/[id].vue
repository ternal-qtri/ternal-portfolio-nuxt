<script setup lang="ts">
// key: remount when going from /new to /<id> after the first save
definePageMeta({ layout: 'admin', middleware: 'admin', key: r => r.fullPath })

const db = useSupabase()
const route = useRoute()
const isNew = route.params.id === 'new'
useSeoMeta({ title: isNew ? 'Thêm dự án' : 'Sửa dự án' })

const blank = () => ({
    id: null as number | null,
    slug: '', title: '', subtitle: '', role: 'Fullstack Developer',
    started: '', ended: '', // <input type="month"> values: 'YYYY-MM'
    summary: '', github_url: '', cover_url: '', video_url: '',
    published: false, position: 0,
    tags: '', // comma separated in the form
    features: [] as { title: string; detail: string }[],
    challenges: [] as { problem: string; solution: string }[],
    lessons: [] as string[],
})
const form = reactive(blank())
const loadError = ref('')

if (!isNew) {
    const { data: p, error } = await db.from('projects')
        .select('*, project_tags(name, position), project_features(title, detail, position), project_challenges(problem, solution, position), project_lessons(content, position)')
        .eq('id', Number(route.params.id)).maybeSingle()
    if (error || !p) loadError.value = error?.message ?? 'Không tìm thấy dự án này.'
    else {
        const sorted = (rows: any[]) => [...rows].sort((a, b) => a.position - b.position)
        Object.assign(form, {
            id: p.id, slug: p.slug, title: p.title, subtitle: p.subtitle, role: p.role,
            started: p.started_on.slice(0, 7), ended: p.ended_on?.slice(0, 7) ?? '',
            summary: p.summary, github_url: p.github_url ?? '', cover_url: p.cover_url ?? '', video_url: p.video_url ?? '',
            published: p.published, position: p.position,
            tags: sorted(p.project_tags).map(t => t.name).join(', '),
            features: sorted(p.project_features).map(f => ({ title: f.title, detail: f.detail })),
            challenges: sorted(p.project_challenges).map(c => ({ problem: c.problem, solution: c.solution })),
            lessons: sorted(p.project_lessons).map(l => l.content),
        })
    }
} else {
    // New projects go to the end of the list.
    const { data } = await db.from('projects').select('position').order('position', { ascending: false }).limit(1)
    form.position = (data?.[0]?.position ?? -1) + 1
}

// "Dự án Đồ án" -> "du-an-do-an"
const slugify = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
function fillSlug() { if (!form.slug) form.slug = slugify(form.title) }

const videoState = computed(() => !form.video_url ? '' : youtubeId(form.video_url) ? 'ok' : 'bad')

function move<T>(list: T[], i: number, d: number) {
    const j = i + d
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j]!, list[i]!]
}

const saving = ref(false)
const status = ref<{ ok: boolean; text: string } | null>(null)

async function save() {
    if (form.ended && form.ended < form.started) { status.value = { ok: false, text: 'Tháng kết thúc phải sau tháng bắt đầu.' }; return }
    if (videoState.value === 'bad') { status.value = { ok: false, text: 'Link video không phải link YouTube hợp lệ.' }; return }
    saving.value = true
    status.value = null
    const { data: id, error } = await db.rpc('save_project', {
        p: {
            id: form.id, slug: form.slug, title: form.title, subtitle: form.subtitle, role: form.role,
            started_on: `${form.started}-01`, ended_on: form.ended ? `${form.ended}-01` : '',
            summary: form.summary, github_url: form.github_url, cover_url: form.cover_url, video_url: form.video_url,
            published: form.published, position: form.position,
            tags: [...new Set(form.tags.split(',').map(t => t.trim()).filter(Boolean))],
            features: form.features, challenges: form.challenges, lessons: form.lessons,
        },
    })
    saving.value = false
    if (error) {
        status.value = { ok: false, text: error.code === '23505' ? `Slug "${form.slug}" đã được dùng cho dự án khác.` : `Lưu thất bại: ${error.message}` }
        return
    }
    status.value = { ok: true, text: 'Đã lưu.' }
    if (isNew) await navigateTo(`/admin/projects/${id}`, { replace: true })
}
</script>

<template>
    <div>
        <NuxtLink class="back" to="/admin/projects">← Danh sách dự án</NuxtLink>
        <p v-if="loadError" class="msg err" role="alert">{{ loadError }}</p>

        <form v-else @submit.prevent="save">
            <div class="head-row">
                <h1>{{ isNew ? 'Thêm dự án' : form.title || 'Sửa dự án' }}</h1>
                <NuxtLink v-if="!isNew && form.published" class="mini" :to="`/projects/${form.slug}`" target="_blank">Xem ngoài site ↗</NuxtLink>
            </div>

            <section class="pbox panel stack">
                <h2>Thông tin chính</h2>
                <div class="grid2">
                    <label class="field"><span>Tên dự án *</span><input v-model.trim="form.title" required maxlength="120" @blur="fillSlug"></label>
                    <label class="field"><span>Slug (đường dẫn) *</span><input v-model.trim="form.slug" required pattern="[a-z0-9]+(-[a-z0-9]+)*" title="Chữ thường không dấu, số và dấu gạch ngang" placeholder="vd: polypress"></label>
                </div>
                <label class="field"><span>Phụ đề</span><input v-model.trim="form.subtitle" maxlength="200"></label>
                <div class="grid3">
                    <label class="field"><span>Vai trò</span><input v-model.trim="form.role" maxlength="80"></label>
                    <label class="field"><span>Bắt đầu *</span><input v-model="form.started" type="month" required></label>
                    <label class="field"><span>Kết thúc (trống = đang làm)</span><input v-model="form.ended" type="month"></label>
                </div>
                <label class="field"><span>Mô tả ngắn</span><textarea v-model.trim="form.summary" rows="4" maxlength="1000" /></label>
                <label class="field"><span>Công nghệ (cách nhau bằng dấu phẩy)</span><input v-model="form.tags" placeholder="Java, Spring Boot, PostgreSQL"></label>
                <div class="grid3">
                    <label class="field"><span>Thứ tự</span><input v-model.number="form.position" type="number" min="0" max="999"></label>
                    <label class="check"><input v-model="form.published" type="checkbox"> Xuất bản (hiện ngoài site)</label>
                </div>
            </section>

            <section class="pbox panel stack">
                <h2>Liên kết &amp; media</h2>
                <label class="field"><span>GitHub</span><input v-model.trim="form.github_url" type="url" placeholder="https://github.com/..."></label>
                <div class="media">
                    <label class="field"><span>Ảnh bìa (URL)</span><input v-model.trim="form.cover_url" type="url" placeholder="https://res.cloudinary.com/..."></label>
                    <img v-if="form.cover_url" :src="form.cover_url" alt="Xem trước ảnh bìa">
                </div>
                <label class="field">
                    <span>Video demo YouTube</span>
                    <input v-model.trim="form.video_url" type="url" placeholder="https://youtu.be/...">
                    <small v-if="videoState" class="msg" :class="videoState === 'ok' ? 'ok' : 'err'">
                        {{ videoState === 'ok' ? '✓ Nhận được video YouTube' : 'Không đọc được link YouTube này' }}
                    </small>
                </label>
            </section>

            <section class="pbox panel">
                <h2>Tính năng chính</h2>
                <div class="rows">
                    <div v-for="(f, i) in form.features" :key="i" class="row">
                        <div class="stack">
                            <input v-model.trim="f.title" required placeholder="Tên tính năng" aria-label="Tên tính năng">
                            <textarea v-model.trim="f.detail" rows="2" placeholder="Mô tả" aria-label="Mô tả tính năng" />
                        </div>
                        <div class="row-tools">
                            <button type="button" class="mini" :disabled="i === 0" aria-label="Lên" @click="move(form.features, i, -1)">↑</button>
                            <button type="button" class="mini" :disabled="i === form.features.length - 1" aria-label="Xuống" @click="move(form.features, i, 1)">↓</button>
                            <button type="button" class="mini danger" aria-label="Xóa" @click="form.features.splice(i, 1)">✕</button>
                        </div>
                    </div>
                </div>
                <button type="button" class="mini" @click="form.features.push({ title: '', detail: '' })">+ Thêm tính năng</button>
            </section>

            <section class="pbox panel">
                <h2>Thử thách &amp; cách giải</h2>
                <div class="rows">
                    <div v-for="(c, i) in form.challenges" :key="i" class="row">
                        <div class="stack">
                            <textarea v-model.trim="c.problem" rows="2" required placeholder="Vấn đề" aria-label="Vấn đề" />
                            <textarea v-model.trim="c.solution" rows="2" required placeholder="Giải pháp" aria-label="Giải pháp" />
                        </div>
                        <div class="row-tools">
                            <button type="button" class="mini" :disabled="i === 0" aria-label="Lên" @click="move(form.challenges, i, -1)">↑</button>
                            <button type="button" class="mini" :disabled="i === form.challenges.length - 1" aria-label="Xuống" @click="move(form.challenges, i, 1)">↓</button>
                            <button type="button" class="mini danger" aria-label="Xóa" @click="form.challenges.splice(i, 1)">✕</button>
                        </div>
                    </div>
                </div>
                <button type="button" class="mini" @click="form.challenges.push({ problem: '', solution: '' })">+ Thêm thử thách</button>
            </section>

            <section class="pbox panel">
                <h2>Bài học rút ra</h2>
                <div class="rows">
                    <div v-for="(_, i) in form.lessons" :key="i" class="row">
                        <textarea v-model.trim="form.lessons[i]" rows="2" required placeholder="Bài học" aria-label="Bài học" />
                        <div class="row-tools">
                            <button type="button" class="mini" :disabled="i === 0" aria-label="Lên" @click="move(form.lessons, i, -1)">↑</button>
                            <button type="button" class="mini" :disabled="i === form.lessons.length - 1" aria-label="Xuống" @click="move(form.lessons, i, 1)">↓</button>
                            <button type="button" class="mini danger" aria-label="Xóa" @click="form.lessons.splice(i, 1)">✕</button>
                        </div>
                    </div>
                </div>
                <button type="button" class="mini" @click="form.lessons.push('')">+ Thêm bài học</button>
            </section>

            <div class="savebar">
                <button class="btn" type="submit" :disabled="saving">{{ saving ? 'Đang lưu…' : 'Lưu dự án' }}</button>
                <p v-if="status" class="msg" :class="status.ok ? 'ok' : 'err'" role="status">{{ status.text }}</p>
            </div>
        </form>
    </div>
</template>

<style scoped>
.back { display: inline-block; margin-bottom: 18px; font: 600 14px/1 var(--body); color: var(--muted); text-decoration: none; }
.back:hover { color: var(--gold); }
a.mini { text-decoration: none; }
.check { display: flex; align-items: center; gap: 10px; align-self: end; padding-bottom: 10px; font: 600 14px/1.2 var(--body); }
.media { display: grid; grid-template-columns: minmax(0, 1fr) 200px; gap: 16px; align-items: end; }
.media img { width: 200px; aspect-ratio: 16 / 9; object-fit: cover; object-position: top; background: var(--ink); }
small.msg { display: block; margin-top: 6px; }
.savebar { position: sticky; bottom: 0; display: flex; align-items: center; gap: 16px; padding: 14px 0; background: var(--bg); border-top: 2px dashed var(--line); }
.savebar .msg { margin: 0; }
@media (max-width: 700px) {
    .media { grid-template-columns: 1fr; }
    .media img { width: 100%; }
}
</style>
