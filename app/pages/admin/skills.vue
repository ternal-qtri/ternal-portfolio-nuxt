<script setup lang="ts">
import { levels } from '~/data/portfolio'

definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý kỹ năng' })

interface SkillRow { id?: number; category_id: number; name: string; proficiency: number; icon_url: string | null; featured: boolean; position: number }
interface CatRow { id?: number; name: string; short_name: string; description: string; position: number; skills: SkillRow[] }

const db = useSupabase()
const cats = ref<CatRow[]>([])
const status = ref<{ ok: boolean; text: string } | null>(null)
const say = (ok: boolean, text: string) => { status.value = { ok, text } }

async function load() {
    const { data, error } = await db.from('skill_categories')
        .select('id, name, short_name, description, position, skills(id, category_id, name, proficiency, icon_url, featured, position)')
        .order('position')
    if (error) return say(false, error.message)
    cats.value = data.map(c => ({ ...c, skills: [...c.skills].sort((a, b) => a.position - b.position) }))
}
await load()

const featuredCount = computed(() => cats.value.reduce((n, c) => n + c.skills.filter(k => k.id && k.featured).length, 0))

// Insert when the row has no id yet, otherwise update. Child skills are saved on their own rows.
async function saveCat(c: CatRow) {
    const row = { name: c.name, short_name: c.short_name, description: c.description, position: c.position }
    const { data, error } = c.id
        ? await db.from('skill_categories').update(row).eq('id', c.id).select('id').single()
        : await db.from('skill_categories').insert(row).select('id').single()
    if (error) return say(false, error.code === '23505' ? `Nhánh "${c.name}" đã tồn tại.` : error.message)
    c.id = data.id
    say(true, `Đã lưu nhánh "${c.name}".`)
}

async function removeCat(c: CatRow, i: number) {
    if (c.id) {
        if (!confirm(`Xóa nhánh "${c.name}" cùng ${c.skills.length} kỹ năng bên trong? Không khôi phục được.`)) return
        const { error } = await db.from('skill_categories').delete().eq('id', c.id)
        if (error) return say(false, error.message)
    }
    cats.value.splice(i, 1)
    say(true, 'Đã xóa nhánh.')
}

async function saveSkill(k: SkillRow) {
    const row = { category_id: k.category_id, name: k.name, proficiency: k.proficiency, icon_url: k.icon_url || null, featured: k.featured, position: k.position }
    const { data, error } = k.id
        ? await db.from('skills').update(row).eq('id', k.id).select('id').single()
        : await db.from('skills').insert(row).select('id').single()
    if (error) return say(false, error.code === '23505' ? `Kỹ năng "${k.name}" đã có trong nhánh này.` : error.message)
    k.id = data.id
    say(true, `Đã lưu "${k.name}".`)
}

async function removeSkill(c: CatRow, k: SkillRow, i: number) {
    if (k.id) {
        if (!confirm(`Xóa kỹ năng "${k.name}"?`)) return
        const { error } = await db.from('skills').delete().eq('id', k.id)
        if (error) return say(false, error.message)
    }
    c.skills.splice(i, 1)
    say(true, 'Đã xóa kỹ năng.')
}

function addSkill(c: CatRow) {
    c.skills.push({ category_id: c.id!, name: '', proficiency: 2, icon_url: '', featured: false, position: (c.skills.at(-1)?.position ?? -1) + 1 })
}
function addCat() {
    cats.value.push({ name: '', short_name: '', description: '', position: (cats.value.at(-1)?.position ?? -1) + 1, skills: [] })
}
</script>

<template>
    <div>
        <div class="head-row">
            <div>
                <h1>Kỹ năng</h1>
                <p class="hint">
                    Mỗi dòng lưu riêng bằng nút "Lưu". Thứ tự: số nhỏ đứng trước. Đang chọn {{ featuredCount }} kỹ năng hiện ở trang chủ
                    (thanh kỹ năng có 8 ô).
                </p>
            </div>
            <button type="button" class="btn" @click="addCat">+ Thêm nhánh</button>
        </div>
        <p v-if="status" class="msg toast" :class="status.ok ? 'ok' : 'err'" role="status">{{ status.text }}</p>

        <section v-for="(c, ci) in cats" :key="c.id ?? `new-${ci}`" class="pbox panel">
            <form class="cat" @submit.prevent="saveCat(c)">
                <label class="field"><span>Tên nhánh</span><input v-model.trim="c.name" required maxlength="80"></label>
                <label class="field"><span>Tên ngắn (tab lọc)</span><input v-model.trim="c.short_name" required maxlength="20"></label>
                <label class="field"><span>Thứ tự</span><input v-model.number="c.position" type="number" min="0" max="999"></label>
                <label class="field desc"><span>Mô tả</span><input v-model.trim="c.description" maxlength="200"></label>
                <div class="row-tools">
                    <button class="mini" type="submit">Lưu nhánh</button>
                    <button class="mini danger" type="button" @click="removeCat(c, ci)">Xóa nhánh</button>
                </div>
            </form>

            <template v-if="c.id">
                <div class="skill head" aria-hidden="true">
                    <span /><span>Tên</span><span>Mức độ</span><span>Logo (URL)</span><span>Trang chủ</span><span>Thứ tự</span><span />
                </div>
                <form v-for="(k, ki) in c.skills" :key="k.id ?? `new-${ki}`" class="skill" @submit.prevent="saveSkill(k)">
                    <SkillSlot :key="k.icon_url ?? ''" :skill="{ name: k.name || '?', icon: k.icon_url, proficiency: levels[k.proficiency - 1]!, featured: k.featured }" />
                    <input v-model.trim="k.name" required maxlength="60" aria-label="Tên kỹ năng">
                    <select v-model.number="k.proficiency" aria-label="Mức độ">
                        <option v-for="(l, li) in levels" :key="l" :value="li + 1">{{ li + 1 }} · {{ l }}</option>
                    </select>
                    <input v-model.trim="k.icon_url" type="url" placeholder="https://..." aria-label="Logo URL">
                    <input v-model="k.featured" type="checkbox" aria-label="Hiện ở trang chủ">
                    <input v-model.number="k.position" type="number" min="0" max="999" aria-label="Thứ tự">
                    <div class="row-tools">
                        <button class="mini" type="submit">Lưu</button>
                        <button class="mini danger" type="button" aria-label="Xóa kỹ năng" @click="removeSkill(c, k, ki)">✕</button>
                    </div>
                </form>
                <button type="button" class="mini add" @click="addSkill(c)">+ Thêm kỹ năng</button>
            </template>
            <p v-else class="hint">Lưu nhánh trước rồi mới thêm kỹ năng.</p>
        </section>
    </div>
</template>

<style scoped>
.toast { position: sticky; top: 64px; z-index: 5; padding: 10px 14px; background: var(--ink); box-shadow: inset 0 0 0 2px currentColor; }
.cat { display: grid; grid-template-columns: 1.4fr 1fr 90px; gap: 12px; align-items: end; margin-bottom: 20px; padding-bottom: 18px; border-bottom: 2px dashed var(--line); }
.cat .desc { grid-column: 1 / -1; }
.cat .row-tools { grid-column: 1 / -1; justify-content: flex-end; }
.skill { display: grid; grid-template-columns: 48px minmax(0, 1.2fr) 150px minmax(0, 1.6fr) 70px 70px auto; gap: 10px; align-items: center; padding: 6px 0; }
.skill.head { font: 700 11px/1 var(--body); letter-spacing: .06em; text-transform: uppercase; color: var(--muted); }
.skill :deep(.slot) { width: 44px; height: 44px; }
.skill :deep(.slot img) { width: 28px; height: 28px; }
.skill input[type=checkbox] { justify-self: center; }
.add { margin-top: 10px; }
@media (max-width: 900px) {
    .skill.head { display: none; }
    .skill { grid-template-columns: 48px 1fr 1fr; padding: 12px 0; border-bottom: 1px solid var(--line); }
    .cat { grid-template-columns: 1fr; }
    .cat .desc { grid-column: auto; }
}
</style>
