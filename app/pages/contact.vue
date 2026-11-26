<script setup lang="ts">
import { fetchProfile } from '~/data/portfolio'

const profile = await useContent('profile', fetchProfile)

useSeoMeta({
    title: 'Liên hệ',
    description: 'Liên hệ Nguyễn Quốc Trí qua email, điện thoại/Zalo hoặc GitHub.',
})

const { email, phone, github } = profile.value.links
const phoneShown = phone?.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3')
const channels = [
    email && { label: 'Email', value: email, href: `mailto:${email}` },
    phone && { label: 'Điện thoại', value: phoneShown, href: `tel:+84${phone.slice(1)}` },
    phone && { label: 'Zalo', value: phoneShown, href: `https://zalo.me/${phone}`, external: true },
    github && { label: 'GitHub', value: github.replace('https://', ''), href: github, external: true },
].filter(c => !!c)

const form = reactive({ name: '', email: '', message: '' })
const status = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
// Saved to contact_messages (anyone may insert; only admins can read). The DB re-checks lengths and email format.
async function submit() {
    status.value = 'sending'
    const { error } = await useSupabase().from('contact_messages').insert({ ...form })
    if (error) { status.value = 'error'; return }
    Object.assign(form, { name: '', email: '', message: '' })
    status.value = 'sent'
}
</script>

<template>
    <main class="page">
        <section class="block">
            <SectionHeading stage="05" eyebrow="Trại nghỉ chân" title="Liên hệ" />
            <p class="intro">
                Mình đang tìm vị trí thực tập hoặc Backend Developer. Nếu bạn có cơ hội phù hợp hay muốn hỏi về dự án
                nào,
                cứ nhắn qua form hoặc các kênh bên dưới, mình sẽ trả lời sớm.
            </p>

            <div class="layout">
                <aside class="side">
                    <ul class="channels">
                        <li v-for="c in channels" :key="c.label">
                            <a class="pbox channel" :href="c.href"
                                v-bind="c.external ? { target: '_blank', rel: 'noopener' } : {}">
                                <span class="label">{{ c.label }}</span>
                                <span class="value">{{ c.value }}</span>
                            </a>
                        </li>
                    </ul>
                    <CampFire class="fire" />
                </aside>

                <form class="pbox mossy form" @submit.prevent="submit">
                    <h2>Gửi lời nhắn</h2>
                    <label>
                        <span>Tên của bạn</span>
                        <input v-model.trim="form.name" name="name" autocomplete="name" required maxlength="80">
                    </label>
                    <label>
                        <span>Email</span>
                        <input v-model.trim="form.email" name="email" type="email" autocomplete="email" required
                            maxlength="120">
                    </label>
                    <label>
                        <span>Nội dung</span>
                        <textarea v-model.trim="form.message" name="message" rows="6" required minlength="10"
                            maxlength="2000" />
                    </label>
                    <div class="actions">
                        <button class="btn" type="submit" :disabled="status === 'sending'">
                            {{ status === 'sending' ? 'Đang gửi…' : 'Gửi lời nhắn' }}
                        </button>
                    </div>
                    <p class="note" :class="status" role="status">
                        <template v-if="status === 'sent'">Đã gửi! Cảm ơn bạn, mình sẽ trả lời qua email sớm nhất có thể.</template>
                        <template v-else-if="status === 'error'">Chưa gửi được. Bạn kiểm tra lại email rồi thử lần nữa, hoặc
                            nhắn thẳng tới {{ email }} nhé.</template>
                    </p>
                </form>
            </div>
        </section>
    </main>
</template>

<style scoped>
.page {
    padding-top: 64px;
    min-height: 100svh;
}

.intro {
    max-width: 640px;
    margin: 0 0 40px;
    color: var(--muted);
    font-size: 16px;
}

.layout {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1.4fr);
    gap: 40px;
    align-items: start;
}

.channels {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 20px;
}

.channel {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px 20px;
    text-decoration: none;
    transition: transform .1s steps(2);
}

.channel:hover {
    transform: translateX(4px);
}

.channel:hover .value {
    color: var(--gold);
}

.label {
    font: 700 11px/1 var(--body);
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--muted);
}

.value {
    font: 600 16px/1.3 var(--body);
    color: var(--head);
    overflow-wrap: anywhere;
}

.fire {
    display: block;
    margin: 36px auto 0;
}

.form {
    padding: 26px 28px 28px;
}

.form h2 {
    margin: 0 0 20px;
    font-size: clamp(20px, 3vw, 24px);
}

label {
    display: block;
    margin-bottom: 18px;
}

label span {
    display: block;
    margin-bottom: 8px;
    font: 700 13px/1 var(--body);
    color: var(--muted);
}

input,
textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 12px 14px;
    font: 500 15px/1.5 var(--body);
    color: var(--text);
    background: var(--ink);
    border: 0;
    box-shadow: inset 0 0 0 3px var(--line);
    resize: vertical;
}

input:focus,
textarea:focus {
    outline: none;
    box-shadow: inset 0 0 0 3px var(--teal);
}

input:user-invalid,
textarea:user-invalid {
    box-shadow: inset 0 0 0 3px #e2674a;
}

.actions {
    margin-top: 6px;
}

button.btn {
    border: 0;
    cursor: pointer;
    font-family: inherit;
}

button.btn:disabled {
    cursor: wait;
    opacity: .7;
}

.note.sent {
    color: var(--teal);
}

.note.error {
    color: #e2674a;
}

.note {
    margin: 16px 0 0;
    font-size: 13.5px;
    color: var(--muted);
}

@media (max-width: 860px) {
    .layout {
        grid-template-columns: 1fr;
    }

    .form {
        padding: 20px;
    }
}
</style>
