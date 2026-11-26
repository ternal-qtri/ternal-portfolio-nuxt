<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Hộp thư' })

interface Msg { id: number; name: string; email: string; message: string; created_at: string; read_at: string | null }

const db = useSupabase()
const msgs = ref<Msg[]>([])
const error = ref('')
const onlyUnread = ref(false)

const { data, error: e } = await db.from('contact_messages').select('*').order('created_at', { ascending: false })
if (e) error.value = e.message
else msgs.value = data

const shown = computed(() => onlyUnread.value ? msgs.value.filter(m => !m.read_at) : msgs.value)
const unread = computed(() => msgs.value.filter(m => !m.read_at).length)
const when = (iso: string) => new Date(iso).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })

async function toggleRead(m: Msg) {
    const read_at = m.read_at ? null : new Date().toISOString()
    const { error: err } = await db.from('contact_messages').update({ read_at }).eq('id', m.id)
    if (err) error.value = err.message
    else m.read_at = read_at
}

async function remove(m: Msg) {
    if (!confirm(`Xóa tin nhắn của ${m.name}? Không khôi phục được.`)) return
    const { error: err } = await db.from('contact_messages').delete().eq('id', m.id)
    if (err) error.value = err.message
    else msgs.value = msgs.value.filter(x => x.id !== m.id)
}
</script>

<template>
    <div>
        <div class="head-row">
            <div>
                <h1>Hộp thư</h1>
                <p class="hint">{{ msgs.length }} tin nhắn · {{ unread }} chưa đọc</p>
            </div>
            <label class="check"><input v-model="onlyUnread" type="checkbox"> Chỉ hiện chưa đọc</label>
        </div>
        <p v-if="error" class="msg err" role="alert">{{ error }}</p>

        <ul class="list">
            <li v-for="m in shown" :key="m.id" class="pbox item" :class="{ unread: !m.read_at }">
                <header>
                    <strong>{{ m.name }}</strong>
                    <a :href="`mailto:${m.email}?subject=${encodeURIComponent('Re: Lời nhắn từ portfolio')}`">{{ m.email }}</a>
                    <time :datetime="m.created_at">{{ when(m.created_at) }}</time>
                </header>
                <p class="body">{{ m.message }}</p>
                <div class="row-tools">
                    <a class="mini" :href="`mailto:${m.email}?subject=${encodeURIComponent('Re: Lời nhắn từ portfolio')}`">Trả lời</a>
                    <button type="button" class="mini" @click="toggleRead(m)">{{ m.read_at ? 'Đánh dấu chưa đọc' : 'Đánh dấu đã đọc' }}</button>
                    <button type="button" class="mini danger" @click="remove(m)">Xóa</button>
                </div>
            </li>
        </ul>
        <p v-if="!shown.length && !error" class="hint">{{ onlyUnread ? 'Không có tin chưa đọc.' : 'Chưa có tin nhắn nào.' }}</p>
    </div>
</template>

<style scoped>
.check { display: flex; align-items: center; gap: 8px; font: 600 14px/1 var(--body); color: var(--muted); }
.list { list-style: none; margin: 0; padding: 0; display: grid; gap: 18px; }
.item { padding: 16px 20px; opacity: .75; }
.item.unread { opacity: 1; box-shadow: inset 4px 0 0 var(--gold); }
header { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin-bottom: 10px; }
header strong { font: 700 16px/1.3 var(--body); color: var(--head); }
header a { color: var(--teal); font-size: 14px; }
header time { margin-left: auto; color: var(--muted); font-size: 13px; }
.body { margin: 0 0 14px; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 15px; }
a.mini { text-decoration: none; }
</style>
