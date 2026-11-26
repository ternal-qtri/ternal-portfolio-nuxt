<script setup lang="ts">
// Full-screen jungle-ruins scene. The explorer follows the mouse and swings a machete on click.
const props = defineProps<{ startTarget?: string }>()

const root = ref<HTMLElement>()
const canvas = ref<HTMLCanvasElement>()

onMounted(() => {
    const cv = canvas.value!
    const cx = cv.getContext('2d')!
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    let W = 0, H = 0, S = 4
    let hills: number[] = []
    let bushes: number[][] = []
    let mids: { x: number; tree: boolean; top: number; drips: number[]; vine: number }[] = []
    let grass: number[][] = []
    let rubble: number[][] = []
    let parts: { x: number; y: number; vx: number; vy: number; l: number; d: number; leaf: boolean; c?: string }[] = []
    const cam = { x: 0, tx: 0 }
    const hero = { x: null as number | null, tx: null as number | null, face: -1, atk: -1e9, walk: false }

    function layout() {
        const r = cv.getBoundingClientRect()
        S = Math.max(4, Math.round(Math.min(r.width / 256, r.height / 150)))
        W = cv.width = Math.ceil(r.width / S)
        H = cv.height = Math.ceil(r.height / S)
        const R = rng(11)
        const p1 = R() * 6, p2 = R() * 6
        hills = Array.from({ length: W + 80 }, (_, i) => Math.round(30 + Math.sin(i * 0.04 + p1) * 8 + Math.sin(i * 0.015 + p2) * 12))
        bushes = []
        for (let x = -40; x < W + 40; x += 4 + Math.floor(R() * 4)) bushes.push([x, 3 + Math.floor(R() * 6), Math.floor(R() * 5)])
        mids = []
        const gap = Math.max(56, Math.round(W / 4.5))
        for (let x = -gap, i = 0; x < W + gap * 2; x += gap, i++) {
            mids.push({ x: x + Math.floor(R() * 10), tree: i % 2 === 0, top: Math.round(H * (0.24 + R() * 0.2)), drips: Array.from({ length: 8 }, () => Math.floor(R() * 6)), vine: 14 + Math.floor(R() * 26) })
        }
        grass = Array.from({ length: Math.ceil(W / 4) }, () => [Math.floor(R() * (W + 60)) - 30, 1 + Math.floor(R() * 3)])
        rubble = Array.from({ length: Math.ceil(W / 40) + 2 }, () => [Math.floor(R() * (W + 60)) - 30, 3 + Math.floor(R() * 5), 2 + Math.floor(R() * 3)])
        if (hero.x === null) hero.x = Math.round(W * (W < 140 ? 0.55 : 0.68))
        hero.x = Math.min(hero.x, W - 18)
        cx.imageSmoothingEnabled = false
    }

    function dither(y0: number, y1: number, c1: string, c2: string) {
        cx.fillStyle = c1; cx.fillRect(0, y0, W, y1 - y0)
        cx.fillStyle = c2
        for (let y = y1 - 2; y < y1; y++) for (let x = (y & 1); x < W; x += 2) cx.fillRect(x, y, 1, 1)
    }
    function glow(x: number, y: number, r: number, color: string, a: number) {
        cx.fillStyle = color
        for (let i = 3; i >= 1; i--) { cx.globalAlpha = a / i; disc(cx, x, y, Math.round(r * i / 3)) }
        cx.globalAlpha = 1
    }
    const wrap = (v: number, m: number) => ((v % m) + m) % m
    const RUNE = [[1, 0], [0, 1], [2, 1], [1, 2], [0, 3], [2, 3], [1, 4]]
    function vine(x: number, len: number, t: number, seed: number) {
        for (let j = 0; j < len; j++) {
            const dx = Math.round(Math.sin(t / 1500 + seed) * j / 14)
            cx.fillStyle = '#1f4a33'; cx.fillRect(x + dx, j, 1, 1)
            if (j % 3 === 0) { cx.fillStyle = j % 6 ? '#3f7d3a' : '#2e6634'; cx.fillRect(x + dx + (j % 6 ? 1 : -2), j, 2, 1) }
        }
    }

    function frame(t: number) {
        cam.x += (cam.tx - cam.x) * 0.05
        const sy = Math.min(scrollY, innerHeight) / S
        const off = (p: number) => Math.round(cam.x * 24 * p)
        const ground = H - 24
        const horizon = Math.round(H * 0.72)
        const phone = W < 140

        // Sky: green dusk under the canopy
        const bands = ['#0a1714', '#0e201b', '#132a23', '#18342b', '#1e3f33']
        const bh = Math.ceil(horizon / bands.length)
        bands.forEach((c, i) => dither(i * bh, (i + 1) * bh, c, bands[i + 1] || c))

        // Low sun haze behind the temple
        const tx = Math.round(W * (phone ? 0.5 : 0.78)) - off(0.08), ty = horizon + Math.round(sy * 0.15)
        glow(tx, ty - 34, 46, '#e8d48a', 0.07)

        // Distant hills
        for (let x = 0; x < W; x++) {
            const y = horizon - (hills[x + 40 + off(0.05)] ?? 30) + Math.round(sy * 0.12)
            cx.fillStyle = '#1d4438'; cx.fillRect(x, y, 1, 1)
            cx.fillStyle = '#16362d'; cx.fillRect(x, y + 1, 1, H)
        }

        // Stepped temple with a glowing shrine
        for (let k = 0; k < 5; k++) {
            const w = 60 - k * 11
            cx.fillStyle = '#28513f'; cx.fillRect(tx - w / 2, ty - (k + 1) * 7, w, 7)
            cx.fillStyle = '#3a6e56'; cx.fillRect(tx - w / 2, ty - (k + 1) * 7, w, 1) // lit step edge
        }
        cx.fillStyle = '#34624e'; cx.fillRect(tx - 3, ty - 35, 6, 35)
        cx.fillStyle = '#28513f'; cx.fillRect(tx - 6, ty - 44, 12, 9)
        cx.fillStyle = '#3a6e56'; cx.fillRect(tx - 7, ty - 45, 14, 1)
        const pulse = (Math.sin(t / 700) + 1) / 2
        glow(tx, ty - 40, 10, '#5ff2c8', 0.1 + pulse * 0.1)
        cx.fillStyle = '#5ff2c8'; cx.globalAlpha = 0.6 + pulse * 0.4; cx.fillRect(tx - 1, ty - 42, 2, 4); cx.globalAlpha = 1
        cx.fillStyle = '#2e6634'
        for (let k = 0; k < 14; k++) cx.fillRect(tx - 26 + (k * 7) % 52, ty - 6 - (k * 5) % 28, 1, 2 + k % 3)

        // Near jungle line
        const bo = off(0.18), by = Math.round(sy * 0.25)
        cx.fillStyle = '#112a21'
        bushes.forEach(([x, r, dy]) => disc(cx, x! - bo, horizon + 4 + dy! + by, r!))
        cx.fillRect(0, horizon + 8 + by, W, H)

        // Green mist drifting
        cx.fillStyle = '#3d6e58'; cx.globalAlpha = 0.16
        for (let k = 0; k < 14; k++) cx.fillRect(wrap(k * 53 + t * 0.004 * (k % 2 ? 1 : -0.6), W + 60) - 30, horizon + by - 2 + (k % 4) * 3, 22 + (k % 3) * 10, 2)
        cx.globalAlpha = 1

        // Light shafts through the canopy
        cx.fillStyle = '#e8d48a'
            ;[[0.16, 8], [0.4, 5], [0.58, 12], [0.86, 7]].forEach(([fx, w], i) => {
                cx.globalAlpha = 0.045 + Math.sin(t / 1800 + i * 2) * 0.02
                const x0 = Math.round(W * fx!) - off(0.3)
                for (let y = 0; y < ground; y += 2) cx.fillRect(x0 + Math.round(y * 0.35), y, w!, 2)
            })
        cx.globalAlpha = 1

        // Mid layer: giant trees and mossy rune columns
        const mo = off(0.4), myo = Math.round(sy * 0.5)
        mids.forEach((m, i) => {
            const x0 = m.x - mo
            if (m.tree) {
                cx.fillStyle = '#0d1f19'; cx.fillRect(x0, 0, 14, ground)
                for (let k = 0; k < 9; k++) cx.fillRect(x0 - (k >> 1), ground - 9 + k, 14 + k, 1)
                cx.fillStyle = '#15302a'; cx.fillRect(x0 + 3, 0, 2, ground - 9); cx.fillRect(x0 + 9, 0, 1, ground - 9)
                vine(x0 + 16, m.vine, t, i)
            }
            else {
                const top = m.top + myo
                cx.fillStyle = '#2c3d36'; cx.fillRect(x0, top, 12, ground - top)
                cx.fillRect(x0 - 2, top, 16, 3)
                cx.fillStyle = '#3a4f46'; cx.fillRect(x0 + 2, top + 3, 1, ground - top - 3)
                cx.fillStyle = '#4c7a3a'; cx.fillRect(x0 - 2, top - 1, 16, 2)
                m.drips.forEach((d, k) => cx.fillRect(x0 - 2 + k * 2, top + 1, 1, d))
                const ry = top + Math.round((ground - top) * 0.4), a = (Math.sin(t / 800 + i) + 1) / 2
                glow(x0 + 6, ry + 2, 9, '#5ff2c8', 0.06 + a * 0.08)
                cx.fillStyle = '#5ff2c8'; cx.globalAlpha = 0.45 + a * 0.55
                RUNE.forEach(([rx, rr]) => cx.fillRect(x0 + 5 + rx!, ry + rr!, 1, 1))
                cx.globalAlpha = 1
            }
        })

        // Ground: mossy flagstones, grass, rubble
        const go = off(0.8)
        cx.fillStyle = '#25302b'; cx.fillRect(0, ground, W, H - ground)
        cx.fillStyle = '#1a221e'
        for (let row = 0; row < 4; row++) {
            const y = ground + 6 + row * 6
            cx.fillRect(0, y, W, 1)
            for (let x = ((row % 2) * 9 - go) % 18 - 18; x < W; x += 18) cx.fillRect(x, y - 5, 1, 5)
        }
        cx.fillStyle = '#4c7a3a'; cx.fillRect(0, ground, W, 2)
        rubble.forEach(([x, w, h]) => {
            cx.fillStyle = '#3a4741'; cx.fillRect(x! - go, ground - h!, w!, h!)
            cx.fillStyle = '#4c7a3a'; cx.fillRect(x! - go, ground - h!, w!, 1)
        })
        cx.fillStyle = '#6aa64a'
        grass.forEach(([x, h], k) => cx.fillRect(x! - go + (Math.sin(t / 900 + k) > 0.7 ? 1 : 0), ground - h!, 1, h!))

        // Fireflies
        for (let i = 0; i < 10; i++) {
            const a = (Math.sin(t / 420 + i * 3) + 1) / 2
            if (a < 0.3) continue
            const x = Math.round(wrap(i * 61, W) + Math.sin(t / 1700 + i) * 14) - go
            const y = Math.round(ground - 6 - (Math.sin(t / 1100 + i * 1.7) + 1) * 18)
            cx.fillStyle = '#d9f27a'; cx.globalAlpha = a * 0.25; cx.fillRect(x - 1, y - 1, 3, 3)
            cx.globalAlpha = a; cx.fillRect(x, y, 1, 1)
        }
        cx.globalAlpha = 1

        // Explorer walks toward the cursor, swings the machete on click
        if (!reduced && hero.tx !== null) {
            const dx = hero.tx - hero.x!
            hero.walk = Math.abs(dx) > 1.5 && t - hero.atk > SLASH_MS
            if (hero.walk) { hero.face = Math.sign(dx); hero.x! += hero.face * 0.6 }
        }
        else hero.walk = false
        hero.x = Math.max(2, Math.min(W - 18, hero.x!))
        drawHero(cx, Math.round(hero.x), ground - HERO_H, reduced ? 0 : t, { walk: hero.walk, face: hero.face, atk: t - hero.atk })

        // Falling leaves, pollen and cut-vine bits
        if (!reduced && parts.length < 45 && Math.random() < 0.12) parts.push({ x: Math.random() * W, y: -2, vx: 0, vy: 0.12 + Math.random() * 0.15, l: 1, d: 0.002, leaf: Math.random() < 0.6 })
        parts.forEach((e) => {
            e.y += e.vy; e.x += e.vx + Math.sin(e.y / 7) * 0.2; e.l -= e.d
            cx.globalAlpha = Math.max(0, e.l)
            cx.fillStyle = e.c || (e.leaf ? '#5f9a45' : '#e8d48a')
            const flat = Math.sin(e.y / 4) > 0
            if (e.leaf) cx.fillRect(Math.round(e.x), Math.round(e.y), flat ? 2 : 1, flat ? 1 : 2)
            else cx.fillRect(Math.round(e.x), Math.round(e.y), 1, 1)
        })
        cx.globalAlpha = 1
        parts = parts.filter(e => e.l > 0 && e.y < H)

            // Foreground: hanging vines and ferns
            ;[[0.32, 16], [0.64, 10], [0.93, 30]].forEach(([fx, len], i) => vine(Math.round(W * fx!) - off(1.25), len!, t, i * 3))
        const fo = off(1.35)
            ;[[-2, 1], [W + 2, -1]].forEach(([bx, dir], i) => {
                for (let f = 0; f < 6; f++) {
                    const ang = (0.35 + f * 0.2) * Math.PI / 2, len = 16 + f * 3 + i * 4, sway = Math.sin(t / 1300 + f) * 0.6
                    for (let s = 0; s < len; s++) {
                        const px = bx! - fo + dir! * Math.cos(ang) * s + sway * s / len
                        const py = H - Math.sin(ang) * s + s * s / len * 0.5
                        cx.fillStyle = s % 3 ? '#0b1d15' : '#123527'; cx.fillRect(Math.round(px), Math.round(py), 2, 1)
                    }
                }
            })
    }

    const onMove = (e: PointerEvent) => {
        cam.tx = (e.clientX / innerWidth - 0.5) * 2
        if (e.pointerType === 'mouse') hero.tx = e.clientX / S - 8
    }
    const onDown = (e: PointerEvent) => {
        if (reduced || (e.target as HTMLElement).closest('a, button')) return
        const now = performance.now()
        if (now - hero.atk < SLASH_MS) return
        hero.face = e.clientX / S < hero.x! + 8 ? -1 : 1
        hero.tx = hero.x // stand still while swinging
        hero.atk = now
        const tipX = hero.x! + 8 + hero.face * 13, tipY = H - 24 - HERO_H + 11
        for (let i = 0; i < 12; i++) parts.push({ x: tipX, y: tipY - Math.random() * 6, vx: hero.face * Math.random() * 0.7, vy: Math.random() * 0.5 - 0.35, l: 1, d: 0.025, leaf: true, c: i % 3 ? '#7fbf4d' : '#ffffff' })
    }
    const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && props.startTarget && scrollY < innerHeight / 2 && document.activeElement === document.body) {
            document.querySelector(props.startTarget)?.scrollIntoView()
        }
    }
    const onResize = () => { layout(); if (reduced) frame(0) }

    layout()
    addEventListener('resize', onResize)
    addEventListener('pointermove', onMove)
    addEventListener('keydown', onKey)
    root.value!.addEventListener('pointerdown', onDown)
    const stop = animate(frame)

    onBeforeUnmount(() => {
        stop()
        removeEventListener('resize', onResize)
        removeEventListener('pointermove', onMove)
        removeEventListener('keydown', onKey)
    })
})
</script>

<template>
    <header ref="root" class="hero">
        <canvas ref="canvas" class="scene" aria-hidden="true" />
        <div class="hero-content">
            <div class="hero-text">
                <slot />
            </div>
        </div>
        <p class="hint" aria-hidden="true">
            <span class="fine">Di chuột để di chuyển · Click để chặt dây leo · Enter để bắt đầu</span>
            <span class="coarse">Chạm vào cảnh để chặt dây leo</span>
        </p>
    </header>
</template>

<style scoped>
.hero {
    position: relative;
    height: 100svh;
    min-height: 580px;
    overflow: hidden;
}

.scene {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    image-rendering: pixelated;
}

.hero-content {
    position: relative;
    z-index: 1;
    padding: clamp(96px, 16vh, 160px) clamp(16px, 6vw, 80px) 0;
    pointer-events: none;
}

.hero-text {
    max-width: 700px;
    pointer-events: auto;
}

.hint {
    position: absolute;
    z-index: 1;
    left: 0;
    right: 0;
    bottom: 12px;
    margin: 0;
    padding: 0 16px;
    text-align: center;
    font: 700 12px/1.4 var(--body);
    letter-spacing: .08em;
    text-transform: uppercase;
    color: var(--parchment);
    opacity: .8;
    animation: blink 1.6s steps(1) infinite;
    pointer-events: none;
}

.hint .coarse {
    display: none;
}

@media (pointer: coarse) {
    .hint .fine {
        display: none;
    }

    .hint .coarse {
        display: inline;
    }
}

@media (max-width: 760px) {
    .hero-content {
        padding-top: 92px;
    }
}
</style>
