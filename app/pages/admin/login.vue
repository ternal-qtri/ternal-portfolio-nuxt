<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Đăng nhập quản trị', robots: 'noindex, nofollow' })

const route = useRoute()
const form = reactive({ email: '', password: '' })
const busy = ref(false)
const error = ref(route.query.denied ? 'Tài khoản này không có quyền quản trị.' : '')

async function login() {
    busy.value = true
    error.value = ''
    const { error: e } = await useSupabase().auth.signInWithPassword(form)
    busy.value = false
    if (e) { error.value = e.code === 'invalid_credentials' ? 'Email hoặc mật khẩu không đúng.' : `Không đăng nhập được: ${e.message}`; return }
    await navigateTo('/admin') // the admin middleware checks the admins table
}
</script>

<template>
    <main class="login">
        <form class="pbox mossy card" @submit.prevent="login">
            <p class="eyebrow"><span class="stage">ADMIN</span> Trạm điều khiển</p>
            <h1>Đăng nhập</h1>
            <label>
                <span>Email</span>
                <input v-model.trim="form.email" type="email" autocomplete="username" required>
            </label>
            <label>
                <span>Mật khẩu</span>
                <input v-model="form.password" type="password" autocomplete="current-password" required>
            </label>
            <p v-if="error" class="error" role="alert">{{ error }}</p>
            <button class="btn" type="submit" :disabled="busy">{{ busy ? 'Đang đăng nhập…' : 'Đăng nhập' }}</button>
            <NuxtLink class="back" to="/">← Về trang chủ</NuxtLink>
        </form>
    </main>
</template>

<style scoped>
.login { min-height: 100svh; display: grid; place-items: center; padding: 24px 16px; }
.card { width: min(400px, 100%); padding: 30px 28px; }
h1 { margin: 4px 0 24px; font: 400 28px/1.2 var(--display); color: var(--head); }
label { display: block; margin-bottom: 16px; }
label span { display: block; margin-bottom: 8px; font: 700 13px/1 var(--body); color: var(--muted); }
input { box-sizing: border-box; width: 100%; padding: 12px 14px; font: 500 15px/1.5 var(--body); color: var(--text); background: var(--ink); border: 0; box-shadow: inset 0 0 0 3px var(--line); }
input:focus { outline: none; box-shadow: inset 0 0 0 3px var(--teal); }
.error { margin: 0 0 14px; color: #e2674a; font-size: 14px; }
button.btn { width: 100%; justify-content: center; border: 0; cursor: pointer; font-family: inherit; }
button.btn:disabled { cursor: wait; opacity: .7; }
.back { display: block; margin-top: 18px; text-align: center; font-size: 14px; color: var(--muted); text-decoration: none; }
.back:hover { color: var(--gold); }
</style>
