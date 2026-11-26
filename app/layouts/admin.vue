<script setup lang="ts">
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })

const links = [
    { to: '/admin/projects', label: 'Dự án' },
    { to: '/admin/skills', label: 'Kỹ năng' },
    { to: '/admin/profile', label: 'Hồ sơ' },
    { to: '/admin/messages', label: 'Hộp thư' },
]

async function logout() {
    await useSupabase().auth.signOut()
    await navigateTo('/admin/login')
}

// Public pages cache their data per visit; drop it so edits show up when leaving the admin.
onBeforeUnmount(() => clearNuxtData())
</script>

<template>
    <div class="admin">
        <header class="bar">
            <NuxtLink class="logo" to="/admin">TERNAL<span>_</span> <small>admin</small></NuxtLink>
            <nav aria-label="Quản trị">
                <NuxtLink v-for="l in links" :key="l.to" :to="l.to">{{ l.label }}</NuxtLink>
            </nav>
            <div class="tools">
                <NuxtLink to="/" target="_blank">Xem site ↗</NuxtLink>
                <button type="button" @click="logout">Đăng xuất</button>
            </div>
        </header>
        <main class="content">
            <slot />
        </main>
    </div>
</template>

<style>
/* Shared admin styles (not scoped: used by every admin page). */
.admin { min-height: 100svh; }
.admin .bar { position: sticky; top: 0; z-index: 10; display: flex; flex-wrap: wrap; align-items: center; gap: 10px 28px; padding: 12px clamp(16px, 4vw, 40px); background: var(--ink); border-bottom: 3px solid var(--line); }
.admin .logo { font: 400 16px/1 var(--pixel); color: var(--teal); text-decoration: none; letter-spacing: .08em; }
.admin .logo span { color: var(--gold); }
.admin .logo small { font: 700 11px/1 var(--body); color: var(--muted); letter-spacing: .1em; text-transform: uppercase; }
.admin nav { display: flex; flex-wrap: wrap; gap: 6px; flex: 1; }
.admin nav a, .admin .tools a, .admin .tools button { padding: 8px 12px; font: 700 14px/1 var(--body); color: var(--muted); text-decoration: none; background: none; border: 0; cursor: pointer; }
.admin nav a:hover, .admin .tools a:hover, .admin .tools button:hover { color: var(--text); }
.admin nav a.router-link-active { color: var(--ink); background: var(--gold); }
.admin .tools { display: flex; gap: 4px; }

.admin .content { max-width: 1100px; margin: 0 auto; padding: 32px clamp(16px, 4vw, 40px) 80px; }
.admin h1 { margin: 0 0 6px; font: 400 clamp(24px, 4vw, 32px)/1.2 var(--display); color: var(--head); }
.admin h2 { margin: 0 0 14px; font: 400 20px/1.2 var(--display); color: var(--head); }
.admin .hint { margin: 0 0 24px; color: var(--muted); font-size: 14px; }
.admin .head-row { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px; }

/* Form controls */
.admin label.field { display: block; }
.admin label.field > span { display: block; margin-bottom: 6px; font: 700 12px/1.2 var(--body); letter-spacing: .04em; color: var(--muted); }
.admin input:not([type=checkbox]), .admin textarea, .admin select { box-sizing: border-box; width: 100%; padding: 9px 11px; font: 500 14.5px/1.45 var(--body); color: var(--text); background: var(--ink); border: 0; box-shadow: inset 0 0 0 2px var(--line); }
.admin input:focus, .admin textarea:focus, .admin select:focus { outline: none; box-shadow: inset 0 0 0 2px var(--teal); }
.admin textarea { resize: vertical; }
.admin input[type=checkbox] { width: 18px; height: 18px; accent-color: var(--teal); }
.admin .grid2 { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.admin .grid3 { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; }
.admin .stack { display: grid; gap: 16px; }
.admin .panel { padding: 22px 24px; margin-bottom: 28px; }

/* Buttons */
.admin button.btn { border: 0; cursor: pointer; font-family: inherit; }
.admin button.btn:disabled { cursor: wait; opacity: .7; }
.admin .mini { padding: 6px 10px; font: 700 13px/1 var(--body); color: var(--text); background: var(--panel-2); border: 0; box-shadow: inset 0 0 0 2px var(--line); cursor: pointer; white-space: nowrap; }
.admin .mini:hover { box-shadow: inset 0 0 0 2px var(--teal); }
.admin .mini.danger:hover { color: #e2674a; box-shadow: inset 0 0 0 2px #e2674a; }
.admin .mini:disabled { opacity: .4; cursor: default; box-shadow: inset 0 0 0 2px var(--line); }

/* Status messages */
.admin .msg { margin: 12px 0 0; font-size: 14px; }
.admin .msg.ok { color: var(--teal); }
.admin .msg.err { color: #e2674a; }

/* Editable lists (features, challenges, ...) */
.admin .rows { display: grid; gap: 12px; margin-bottom: 12px; }
.admin .row { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 10px; align-items: start; padding: 12px; background: var(--panel-2); }
.admin .row-tools { display: flex; gap: 6px; }

@media (max-width: 700px) {
    .admin .grid2, .admin .grid3 { grid-template-columns: 1fr; }
    .admin .row { grid-template-columns: 1fr; }
}
</style>
