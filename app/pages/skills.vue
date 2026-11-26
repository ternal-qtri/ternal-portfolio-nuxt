<script setup lang="ts">
import { fetchSkillCategories, levelOf, levels } from '~/data/portfolio'

const skillCategories = await useContent('skills', fetchSkillCategories)
const allSkills = computed(() => skillCategories.value.flatMap(c => c.items))

useSeoMeta({
    title: 'Kỹ năng',
    description: () => `${allSkills.value.length} kỹ năng của Nguyễn Quốc Trí: Java, Spring Boot, cơ sở dữ liệu, frontend và công cụ phát triển.`,
})

const active = ref<number | null>(null) // null = all branches
const shown = computed(() => {
    const cats = active.value === null ? skillCategories.value : [skillCategories.value[active.value]!]
    return cats.flatMap(c => c.items.map(k => ({ ...k, branch: c.short })))
})
// "Spring Boot (MVC/RestfulAPI)" -> title "Spring Boot", note "MVC/RestfulAPI"
const splitName = (n: string) => {
    const m = n.match(/^(.*?)\s*\((.*)\)$/)
    return m ? { title: m[1], note: m[2] } : { title: n, note: '' }
}
</script>

<template>
    <main class="page">
        <section class="block">
            <SectionHeading stage="02" eyebrow="Bảng kỹ năng" title="Kỹ năng nhân vật" />

            <div class="tabs" role="group" aria-label="Lọc theo nhánh kỹ năng">
                <button type="button" :aria-pressed="active === null" @click="active = null">
                    Tất cả <span class="count">{{ allSkills.length }}</span>
                </button>
                <button v-for="(c, i) in skillCategories" :key="c.name" type="button" :aria-pressed="active === i"
                    @click="active = i">
                    {{ c.short }} <span class="count">{{ c.items.length }}</span>
                </button>
            </div>

            <p class="branch-desc">
                <template v-if="active === null">Toàn bộ kỹ năng theo 5 nhánh. Chọn một nhánh để lọc.</template>
                <template v-else><strong>{{ skillCategories[active]!.name }}</strong> · {{
                    skillCategories[active]!.description }}</template>
            </p>

            <ul :key="active ?? 'all'" class="grid">
                <li v-for="k in shown" :key="k.name" class="pbox card">
                    <span v-if="active === null" class="branch">{{ k.branch }}</span>
                    <SkillSlot :skill="k" />
                    <h3>{{ splitName(k.name).title }}</h3>
                    <small v-if="splitName(k.name).note" class="note">{{ splitName(k.name).note }}</small>
                    <div class="level">
                        <span class="pips" aria-hidden="true"><i v-for="n in levels.length" :key="n"
                                :class="{ on: n <= levelOf(k) }" /></span>
                        {{ k.proficiency }}
                    </div>
                </li>
            </ul>

            <div class="legend" aria-label="Chú thích mức độ">
                <span v-for="(l, i) in levels" :key="l">
                    <span class="pips" aria-hidden="true"><i v-for="n in levels.length" :key="n"
                            :class="{ on: n <= i + 1 }" /></span>
                    {{ l }}
                </span>
            </div>
        </section>
    </main>
</template>

<style scoped>
.page {
    padding-top: 64px;
    min-height: 100svh;
}

.tabs {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    margin: 0 0 22px;
}

.tabs button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    font: 700 14px/1 var(--body);
    color: var(--muted);
    background: var(--panel-2);
    border: 0;
    cursor: pointer;
    box-shadow: 0 -3px 0 0 var(--line), 0 3px 0 0 var(--line), -3px 0 0 0 var(--line), 3px 0 0 0 var(--line);
    transition: transform .08s steps(2);
}

.tabs button:hover {
    color: var(--text);
    transform: translateY(-2px);
}

.tabs button[aria-pressed="true"] {
    color: var(--ink);
    background: var(--gold);
    box-shadow: 0 -3px 0 0 var(--ink), 0 3px 0 0 var(--ink), -3px 0 0 0 var(--ink), 3px 0 0 0 var(--ink), inset 0 -3px 0 0 var(--gold-d);
}

.count {
    font: 400 11px/1 var(--pixel);
    padding: 3px 4px;
    background: rgba(7, 12, 10, .35);
}

.branch-desc {
    margin: 0 0 34px;
    color: var(--muted);
    font-size: 15px;
}

.branch-desc strong {
    color: var(--teal);
}

.grid {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
    gap: 30px 24px;
    animation: pop .3s steps(3);
}

@keyframes pop {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
}

.card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 26px 16px 20px;
    text-align: center;
    transition: transform .1s steps(2);
}

.card:hover {
    transform: translateY(-4px);
}

.branch {
    position: absolute;
    top: 8px;
    left: 8px;
    font: 700 10px/1 var(--body);
    letter-spacing: .06em;
    text-transform: uppercase;
    color: var(--muted);
}

h3 {
    margin: 6px 0 0;
    font: 700 16px/1.3 var(--body);
    color: var(--head);
}

.note {
    margin-top: -6px;
    font: 500 12px/1.3 var(--body);
    color: var(--muted);
}

.level {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    margin-top: auto;
    font: 600 13px/1.2 var(--body);
    color: var(--teal);
}

.pips {
    display: inline-flex;
    gap: 3px;
}

.pips i {
    width: 10px;
    height: 8px;
    background: var(--ink);
    box-shadow: 0 0 0 1px var(--line);
}

.pips i.on {
    background: var(--teal);
    box-shadow: none;
}

.legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px 28px;
    margin-top: 48px;
    padding-top: 20px;
    border-top: 2px dashed var(--line);
    font: 600 13px/1 var(--body);
    color: var(--muted);
}

.legend>span {
    display: inline-flex;
    align-items: center;
    gap: 8px;
}

@media (max-width: 560px) {
    .grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 22px 14px;
    }

    .tabs {
        gap: 10px;
    }

    .tabs button {
        padding: 9px 11px;
        font-size: 13px;
    }
}
</style>
