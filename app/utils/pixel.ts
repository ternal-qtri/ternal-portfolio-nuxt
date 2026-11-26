// Shared pixel-art helpers (auto-imported by Nuxt).
type Ctx = CanvasRenderingContext2D

export function rng(seed: number) {
    return () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296
}

export function disc(g: Ctx, x: number, y: number, r: number) {
    for (let dy = -r; dy <= r; dy++) {
        const dx = Math.round(Math.sqrt(r * r - dy * dy))
        g.fillRect(Math.round(x - dx), Math.round(y + dy), dx * 2, 1)
    }
}

// ---------- The explorer ----------
const PAL: Record<string, string> = { k: '#0a100e', H: '#c49456', h: '#8a6236', f: '#e0a878', e: '#0a100e', s: '#c94f3a', S: '#8e3426', c: '#5c6b3e', C: '#7d8f52', p: '#6b4a2a', b: '#3b2a1c', n: '#55483a', g: '#6b4a2a', w: '#dfe8e4' }
const BODY = [
    '.....kkkkk......',
    '....kHHHHHk.....',
    '....khhhhhk.....',
    '..kkkkkkkkkkk...',
    '....kffffek.....',
    '....kfffffk.....',
    '.....kfffk......',
    '...kssssssk.....',
    '..kpkcCCCCck....',
    '..kpkcCCCCckfk..',
    '..kpkcCCCCckfk..',
    '..kkkbbbbbbkfk..',
    '....kcccccckgk..',
    '....knnnnnnk....',
]
const LEGS = [
    ['....knk..knk....', '....knk..knk....', '....kbk..kbk....', '...kbbk..kbbk...', '...kkkk..kkkk...'],
    ['...knk....knk...', '..knk......knk..', '..kbk......kbk..', '.kbbk.....kbbk..', '.kkkk.....kkkk..'],
]
const SCARF = [[[2, 7], [1, 7], [1, 8], [0, 8]], [[2, 7], [1, 7], [0, 7], [-1, 7], [-2, 8]]]
export const HERO_H = BODY.length + 5
export const SLASH_MS = 320

export interface HeroState { walk: boolean; face: number; atk: number }

// Draws the explorer facing right (face = 1) or mirrored (face = -1).
// atk = ms since the machete swing started (negative or large = idle).
export function drawHero(ctx: Ctx, x: number, y: number, t: number, st: HeroState) {
    const dot = (c: number, r: number, color: string) => {
        ctx.fillStyle = color
        ctx.fillRect(st.face > 0 ? x + c : x + 15 - c, y + r, 1, 1)
    }
    const step = st.walk ? Math.floor(t / 140) % 2 : 0
    const bob = st.walk ? step : Math.floor(t / 600) % 2
    const blink = t % 3400 < 140
    SCARF[st.walk || Math.floor(t / 400) % 3 === 0 ? 1 : 0]!.forEach(([c, r]) => dot(c!, r! + bob, PAL.S!))
    BODY.forEach((row, r) => {
        for (let c = 0; c < 16; c++) {
            let ch = row[c]!
            if (ch === '.') continue
            if (ch === 'e' && blink) ch = 'f'
            dot(c, r + bob, PAL[ch]!)
        }
    })
    LEGS[step]!.forEach((row, r) => {
        for (let c = 0; c < 16; c++) if (row[c] !== '.') dot(c, BODY.length + r, PAL[row[c]!]!)
    })

    const a = st.atk
    if (a < 0 || a >= SLASH_MS) { // idle: machete hangs down
        for (let r = 13; r <= 17; r++) dot(12, r + (r < 14 ? bob : 0), PAL.w!)
    }
    else if (a < 70) { // wind-up: machete raised
        for (let r = 3; r <= 10; r++) dot(13, r, PAL.w!)
        dot(13, 11, PAL.g!)
    }
    else { // swing arc, then follow-through
        const p = Math.min(1, (a - 70) / 120)
        ctx.globalAlpha = a < 200 ? 1 : 1 - (a - 200) / 120
        for (let deg = -80; deg <= -80 + 160 * p; deg += 6) {
            const rad = deg * Math.PI / 180
            dot(13 + Math.round(Math.cos(rad) * 10), 11 + Math.round(Math.sin(rad) * 10), '#ffffff')
            dot(13 + Math.round(Math.cos(rad) * 11), 11 + Math.round(Math.sin(rad) * 11), '#9be36a')
        }
        ctx.globalAlpha = 1
        if (a < 200) {
            dot(13, 11, PAL.g!)
            for (let c = 14; c <= 20; c++) dot(c, 11, PAL.w!)
        }
        else for (let i = 0; i < 6; i++) dot(14 + i, 12 + i, PAL.w!)
    }
}

// ---------- Placeholder cover: a small pixel ruin, different per seed ----------
export function coverArt(seed: number) {
    const c = document.createElement('canvas')
    c.width = 96
    c.height = 54
    const g = c.getContext('2d')!
    const R = rng(seed * 977)
    const skies = [['#123029', '#1d4a3c', '#e8d48a'], ['#162838', '#24445a', '#9fd8e8'], ['#2a2216', '#4a3a22', '#f0b860']]
    const [s1, s2, sun] = skies[seed % 3]!
    g.fillStyle = s1!; g.fillRect(0, 0, 96, 54)
    g.fillStyle = s2!; g.fillRect(0, 22, 96, 32)
    g.fillStyle = sun!; g.globalAlpha = 0.4; disc(g, 18 + R() * 60, 16, 8); g.globalAlpha = 1
    g.fillStyle = '#14352a'
    for (let x = -4; x < 100; x += 6) disc(g, x + R() * 4, 34 + R() * 4, 4 + Math.floor(R() * 4))
    const type = seed % 3
    const cx0 = 34 + Math.floor(R() * 28)
    g.fillStyle = '#2c3d36'
    if (type === 1) {
        for (let k = 0; k < 5; k++) g.fillRect(cx0 - 22 + k * 4, 46 - (k + 1) * 6, 44 - k * 8, 6)
        g.fillStyle = '#0a100e'; g.fillRect(cx0 - 2, 12, 4, 4)
    }
    else if (type === 2) {
        g.fillRect(cx0 - 16, 18, 6, 28); g.fillRect(cx0 + 10, 18, 6, 28); g.fillRect(cx0 - 19, 14, 38, 5)
    }
    else {
        for (const [dx, h] of [[-20, 22], [-6, 14], [8, 26], [20, 18]]) g.fillRect(cx0 + dx!, 46 - h!, 6, h!)
    }
    g.fillStyle = '#5ff2c8'; g.fillRect(cx0 - 1, type === 1 ? 13 : 30, 2, 2)
    g.fillStyle = '#4c7a3a'
    for (let i = 0; i < 40; i++) g.fillRect(cx0 - 22 + Math.floor(R() * 44), 14 + Math.floor(R() * 30), 1, 1 + Math.floor(R() * 3))
    g.fillStyle = '#25302b'; g.fillRect(0, 46, 96, 8)
    g.fillStyle = '#4c7a3a'; g.fillRect(0, 46, 96, 2)
    g.fillStyle = '#0b1d15'; disc(g, 2, 54, 12); disc(g, 94, 52, 10)
    return c.toDataURL()
}

// ---------- Campfire (36x28) ----------
export function drawCampfire(g: Ctx, t: number) {
    g.clearRect(0, 0, 36, 28)
    g.fillStyle = '#5a3a1e'; g.fillRect(8, 23, 20, 3)
    g.fillStyle = '#3a2614'; g.fillRect(11, 21, 14, 3)
    const R = rng(Math.floor(t / 120))
    for (const [c, w, h] of [['#b5651d', 8, 12], ['#e8a33d', 6, 9], ['#ffe08a', 3, 5]] as const) {
        g.fillStyle = c
        for (let i = -w; i <= w; i++) {
            const hh = Math.round((h + R() * 4) * (1 - Math.abs(i) / (w + 1)))
            g.fillRect(18 + i, 22 - hh, 1, hh)
        }
    }
}

// Runs fn every animation frame until the returned stop() is called.
// With reduced motion it draws one frame only.
export function animate(fn: (t: number) => void) {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        fn(0)
        return () => { }
    }
    let id = requestAnimationFrame(function loop(t) {
        fn(t)
        id = requestAnimationFrame(loop)
    })
    return () => cancelAnimationFrame(id)
}
