<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý hồ sơ' })

type StepState = 'done' | 'now' | 'todo'
const db = useSupabase()
const loadError = ref('')
const form = reactive({
    name: '', birth_year: 2005, role: '', school: '', major: '', main_tools: '', gpa: '' as string | number,
    tagline: '', email: '', phone: '', github_url: '', linkedin_url: '', quest_title: '',
    quest_steps: [] as { text: string; state: StepState }[],
})

const [p, s] = await Promise.all([
    db.from('profile').select('*').single(),
    db.from('quest_steps').select('text, state').order('position'),
])
if (p.error || s.error) loadError.value = (p.error ?? s.error)!.message
else {
    for (const k of Object.keys(form) as (keyof typeof form)[]) {
        if (k !== 'quest_steps') (form as any)[k] = p.data[k] ?? ''
    }
    form.quest_steps = s.data as typeof form.quest_steps
}

const stateLabel: Record<StepState, string> = { done: 'Đã xong', now: 'Đang làm', todo: 'Sắp tới' }

function move(i: number, d: number) {
    const list = form.quest_steps, j = i + d
    if (j < 0 || j >= list.length) return
    ;[list[i], list[j]] = [list[j]!, list[i]!]
}

const saving = ref(false)
const status = ref<{ ok: boolean; text: string } | null>(null)
async function save() {
    saving.value = true
    status.value = null
    const { error } = await db.rpc('save_profile', { p: { ...form, gpa: form.gpa === '' ? '' : String(form.gpa) } })
    saving.value = false
    status.value = error ? { ok: false, text: `Lưu thất bại: ${error.message}` } : { ok: true, text: 'Đã lưu hồ sơ.' }
}
</script>

<template>
    <div>
        <h1>Hồ sơ</h1>
        <p class="hint">Thông tin hiện ở trang chủ và trang liên hệ.</p>
        <p v-if="loadError" class="msg err" role="alert">{{ loadError }}</p>

        <form v-else @submit.prevent="save">
            <section class="pbox panel stack">
                <h2>Thông tin cá nhân</h2>
                <div class="grid2">
                    <label class="field"><span>Họ tên *</span><input v-model.trim="form.name" required maxlength="80"></label>
                    <label class="field"><span>Vị trí hướng tới *</span><input v-model.trim="form.role" required maxlength="80"></label>
                </div>
                <div class="grid3">
                    <label class="field"><span>Năm sinh *</span><input v-model.number="form.birth_year" type="number" required min="1950" max="2100"></label>
                    <label class="field"><span>GPA (thang 4, trống = ẩn)</span><input v-model="form.gpa" type="number" min="0" max="4" step="0.01"></label>
                    <label class="field"><span>Công cụ chính *</span><input v-model.trim="form.main_tools" required maxlength="80"></label>
                </div>
                <div class="grid2">
                    <label class="field"><span>Trường *</span><input v-model.trim="form.school" required maxlength="120"></label>
                    <label class="field"><span>Ngành *</span><input v-model.trim="form.major" required maxlength="120"></label>
                </div>
                <label class="field"><span>Dòng giới thiệu (dưới tên ở trang chủ) *</span><input v-model.trim="form.tagline" required maxlength="200"></label>
            </section>

            <section class="pbox panel stack">
                <h2>Liên hệ</h2>
                <div class="grid2">
                    <label class="field"><span>Email</span><input v-model.trim="form.email" type="email"></label>
                    <label class="field"><span>Điện thoại / Zalo</span><input v-model.trim="form.phone" type="tel" pattern="[0-9+ ]{8,15}"></label>
                    <label class="field"><span>GitHub</span><input v-model.trim="form.github_url" type="url"></label>
                    <label class="field"><span>LinkedIn (trống = ẩn)</span><input v-model.trim="form.linkedin_url" type="url"></label>
                </div>
            </section>

            <section class="pbox panel">
                <h2>Nhiệm vụ hiện tại</h2>
                <label class="field title"><span>Tiêu đề nhiệm vụ *</span><input v-model.trim="form.quest_title" required maxlength="120"></label>
                <div class="rows">
                    <div v-for="(q, i) in form.quest_steps" :key="i" class="row">
                        <div class="step">
                            <input v-model.trim="q.text" required maxlength="160" aria-label="Bước nhiệm vụ">
                            <select v-model="q.state" aria-label="Trạng thái">
                                <option v-for="(label, v) in stateLabel" :key="v" :value="v">{{ label }}</option>
                            </select>
                        </div>
                        <div class="row-tools">
                            <button type="button" class="mini" :disabled="i === 0" aria-label="Lên" @click="move(i, -1)">↑</button>
                            <button type="button" class="mini" :disabled="i === form.quest_steps.length - 1" aria-label="Xuống" @click="move(i, 1)">↓</button>
                            <button type="button" class="mini danger" aria-label="Xóa" @click="form.quest_steps.splice(i, 1)">✕</button>
                        </div>
                    </div>
                </div>
                <button type="button" class="mini" @click="form.quest_steps.push({ text: '', state: 'todo' })">+ Thêm bước</button>
            </section>

            <div class="savebar">
                <button class="btn" type="submit" :disabled="saving">{{ saving ? 'Đang lưu…' : 'Lưu hồ sơ' }}</button>
                <p v-if="status" class="msg" :class="status.ok ? 'ok' : 'err'" role="status">{{ status.text }}</p>
            </div>
        </form>
    </div>
</template>

<style scoped>
.title { margin-bottom: 16px; }
.step { display: grid; grid-template-columns: minmax(0, 1fr) 140px; gap: 10px; }
.savebar { position: sticky; bottom: 0; display: flex; align-items: center; gap: 16px; padding: 14px 0; background: var(--bg); border-top: 2px dashed var(--line); }
.savebar .msg { margin: 0; }
</style>
