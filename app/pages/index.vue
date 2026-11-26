<script setup lang="ts">
import { fetchProfile, fetchProjects, fetchSkillCategories } from '~/data/portfolio'

const [profile, categories, projects] = await Promise.all([
    useContent('profile', fetchProfile),
    useContent('skills', fetchSkillCategories),
    useContent('projects', fetchProjects),
])
const allSkills = computed(() => categories.value.flatMap(c => c.items))
const mainStack = computed(() => allSkills.value.filter(k => k.featured))
const level = computed(() => new Date().getFullYear() - profile.value.birthYear)
const gpaPct = computed(() => Math.round((profile.value.gpa ?? 0) / 4 * 100))
</script>

<template>
    <div>
        <HeroScene start-target="#ho-so">
            <span class="tag">PLAYER 1</span>
            <h1>{{ profile.name }}</h1>
            <p class="class">LV.{{ level }} · BACKEND DEVELOPER</p>
            <p class="lead">{{ profile.tagline }}</p>
            <div class="actions">
                <a class="btn" href="#ho-so">▶ Bắt đầu thám hiểm</a>
                <a class="btn ghost" href="#du-an">Xem di tích</a>
            </div>
        </HeroScene>

        <main>
            <section id="ho-so" class="block reveal">
                <SectionHeading stage="01" eyebrow="Hồ sơ nhà thám hiểm" title="Người khai phá backend" />
                <div class="sheet">
                    <div>
                        <div class="pbox portrait mossy">
                            <PixelPortrait />
                        </div>
                        <p class="portrait-cap">CLASS: BACKEND</p>
                    </div>
                    <div class="pbox mossy">
                        <dl class="stats">
                            <div>
                                <dt>Class</dt>
                                <dd>{{ profile.role }}</dd>
                            </div>
                            <div>
                                <dt>Học viện</dt>
                                <dd>{{ profile.school }}</dd>
                            </div>
                            <div>
                                <dt>Công cụ chính</dt>
                                <dd>{{ profile.mainTools }}</dd>
                            </div>
                            <div>
                                <dt>Năm sinh</dt>
                                <dd>{{ profile.birthYear }}</dd>
                            </div>
                            <div v-if="profile.gpa !== null">
                                <dt>GPA</dt>
                                <dd>{{ profile.gpa.toFixed(2) }} / 4.00</dd>
                                <div class="meter" role="img" :aria-label="`GPA ${profile.gpa} trên 4`"><i
                                        :style="{ width: gpaPct + '%' }" /></div>
                            </div>
                            <div>
                                <dt>Trạng thái</dt>
                                <dd class="status"><i class="dot" aria-hidden="true" />Sẵn sàng nhận nhiệm vụ</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </section>

            <section id="ky-nang" class="block reveal">
                <SectionHeading stage="02" eyebrow="Bảng kỹ năng" title="Tech stack chính" />
                <div class="pbox mossy stack">
                    <ul class="hotbar">
                        <li v-for="(s, i) in mainStack" :key="s.name">
                            <SkillSlot :skill="s" :hotkey="i + 1" />
                            {{ s.name.replace(/\s*\(.*\)/, '') }}
                        </li>
                    </ul>
                    <NuxtLink class="btn ghost" to="/skills">Xem toàn bộ {{ allSkills.length }} kỹ năng →</NuxtLink>
                </div>
            </section>

            <section id="du-an" class="block reveal">
                <SectionHeading stage="03" eyebrow="Bản đồ di tích" title="Di tích đã khám phá" />
                <div class="ruins">
                    <RuinCard v-for="(p, i) in projects" :key="p.slug" :project="p" :index="i" />
                </div>
            </section>

            <section class="block reveal">
                <div class="pbox quest mossy">
                    <div>
                        <SectionHeading stage="04" eyebrow="Nhiệm vụ hiện tại" :title="profile.quest.title" />
                        <ul>
                            <li v-for="q in profile.quest.steps" :key="q.text" :class="q.state">{{ q.text }}</li>
                        </ul>
                    </div>
                    <a class="btn" href="#lien-he">Nhận nhiệm vụ</a>
                </div>
            </section>

            <section id="lien-he" class="block reveal camp">
                <CampFire />
                <SectionHeading stage="05" eyebrow="Trại nghỉ chân" title="Cùng lập đoàn thám hiểm nhé?" />
                <p>Bạn có cơ hội Backend, một dự án thú vị hay chỉ muốn trò chuyện về Spring Boot? Ghé lửa trại một
                    chút, tiến trình sẽ được lưu lại.</p>
                <div class="actions">
                    <NuxtLink class="btn" to="/contact">Gửi lời nhắn</NuxtLink>
                    <a v-if="profile.links.github" class="btn ghost" :href="profile.links.github" target="_blank"
                        rel="noopener">GitHub</a>
                    <a v-if="profile.links.linkedin" class="btn ghost" :href="profile.links.linkedin" target="_blank"
                        rel="noopener">LinkedIn</a>
                </div>
            </section>
        </main>
    </div>
</template>

<style scoped>
.tag {
    display: inline-block;
    font: 400 13px/1 var(--pixel);
    color: var(--ink);
    background: var(--teal);
    padding: 6px 9px;
    margin-bottom: 18px;
}

h1 {
    margin: 0 0 12px;
    font: 400 clamp(34px, 6.6vw, 76px)/1.12 var(--display);
    color: var(--head);
    text-shadow: 4px 4px 0 var(--ink);
}

.class {
    margin: 0 0 18px;
    font: 400 clamp(13px, 1.5vw, 16px)/1.5 var(--pixel);
    color: var(--gold);
    text-shadow: 2px 2px 0 var(--ink);
}

.lead {
    margin: 0 0 28px;
    max-width: 580px;
    font: 500 clamp(17px, 1.6vw, 20px)/1.6 var(--body);
    text-shadow: 0 2px 0 var(--ink), 2px 0 0 var(--ink), -2px 0 0 var(--ink), 0 -2px 0 var(--ink);
}

/* Character sheet */
.sheet {
    display: grid;
    grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
    gap: 36px;
}

.portrait {
    display: grid;
    place-items: center;
    background: var(--panel-2);
    aspect-ratio: 1;
}

.portrait canvas {
    width: 78%;
}

.portrait-cap {
    text-align: center;
    margin-top: 14px;
    font: 400 13px/1.6 var(--pixel);
    color: var(--muted);
}

.stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px 28px;
    margin: 0;
}

.stats>div {
    border-bottom: 2px dashed var(--line);
    padding-bottom: 10px;
}

.stats dt {
    font: 700 11px/1.8 var(--body);
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--muted);
}

.stats dd {
    margin: 0;
    font: 600 18px/1.4 var(--body);
}

.meter {
    height: 14px;
    background: var(--ink);
    box-shadow: 0 0 0 3px var(--line);
    margin-top: 10px;
}

.meter i {
    display: block;
    height: 100%;
    background: repeating-linear-gradient(90deg, var(--gold) 0 10px, var(--gold-d) 10px 12px);
}

.status {
    display: inline-flex;
    gap: 10px;
    align-items: center;
    color: var(--teal);
}

.dot {
    width: 10px;
    height: 10px;
    background: var(--teal);
    animation: blink 1s steps(1) infinite;
}

/* Main stack */
.stack {
    text-align: center;
}

.hotbar {
    list-style: none;
    margin: 0 0 30px;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 26px 12px;
}

.hotbar li {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    min-width: 0;
    overflow-wrap: anywhere;
    text-align: center;
    font: 600 14px/1.3 var(--body);
}

.hotbar li:hover :deep(.slot) {
    transform: translateY(-3px);
}

@media (min-width: 900px) {
    .hotbar {
        grid-template-columns: repeat(8, minmax(0, 1fr));
    }
}

/* Ruins */
.ruins {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 40px 28px;
}

/* Quest */
.quest {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 24px;
    align-items: center;
}

.quest :deep(h2) {
    margin: 0;
}

.quest ul {
    list-style: none;
    margin: 18px 0 0;
    padding: 0;
}

.quest li {
    padding: 5px 0;
}

.quest li::before {
    content: '[ ] ';
    color: var(--muted);
    font-family: var(--pixel);
}

.quest li.done {
    color: var(--muted);
}

.quest li.done::before {
    content: '[x] ';
    color: var(--teal);
}

.quest li.now {
    color: var(--gold);
    font-weight: 600;
}

.quest li.now::before {
    content: '[>] ';
    color: var(--gold);
}

/* Camp */
.camp {
    text-align: center;
}

.camp :deep(.eyebrow) {
    justify-content: center;
}

.camp :deep(canvas) {
    margin-bottom: 16px;
}

.camp>p {
    color: var(--muted);
    max-width: 540px;
    margin: 0 auto 28px;
}

.camp .actions {
    justify-content: center;
}

@media (max-width: 760px) {

    .sheet,
    .quest {
        grid-template-columns: 1fr;
    }

    .portrait {
        max-width: 220px;
        margin: 0 auto;
    }

    .stack {
        padding: 22px 10px;
    }

    .hotbar {
        gap: 22px 6px;
    }

    .hotbar li {
        font-size: 12px;
    }
}
</style>
