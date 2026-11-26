// Portfolio content, read from Supabase (schema: supabase/migrations). Rows are mapped to the shapes the components use.
import type { SupabaseClient } from '@supabase/supabase-js'

// Proficiency levels, lowest first. DB stores 1-5; a skill's level = index + 1 (shown as 1-5 pips).
export const levels = ['Cơ bản', 'Nền tảng', 'Thành thạo', 'Nâng cao', 'Chuyên sâu'] as const
export type Level = typeof levels[number]

export interface Skill { name: string; proficiency: Level; icon: string | null; featured: boolean }
export interface SkillCategory { name: string; short: string; description: string; items: Skill[] }
export interface Project {
    slug: string
    title: string
    subtitle: string
    role: string
    timeframe: string
    summary: string
    tags: string[]
    github: string | null
    cover: string | null
    video: string | null // YouTube demo link (any youtube.com / youtu.be URL); null hides the video section
    features: { title: string; detail: string }[]
    challenges: { problem: string; solution: string }[]
    lessons: string[]
}
export interface Profile {
    name: string
    birthYear: number
    role: string
    school: string
    major: string
    mainTools: string
    gpa: number | null
    tagline: string
    links: { email: string | null; phone: string | null; github: string | null; linkedin: string | null }
    quest: { title: string; steps: { text: string; state: 'done' | 'now' | 'todo' }[] }
}

export const levelOf = (k: Skill) => levels.indexOf(k.proficiency) + 1

// Supabase returns { data, error }; turn errors into exceptions so useAsyncData and the error page handle them.
function must<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
    if (error) throw createError({ statusCode: 500, statusMessage: error.message })
    return data as T
}

const byPosition = <T extends { position: number }>(rows: T[]) => [...rows].sort((a, b) => a.position - b.position)
// '2026-02-01' -> '02/2026'
const monthYear = (d: string) => `${d.slice(5, 7)}/${d.slice(0, 4)}`

export async function fetchProfile(db: SupabaseClient): Promise<Profile> {
    const [p, steps]: [any, any] = await Promise.all([
        db.from('profile').select('*').single().then(must),
        db.from('quest_steps').select('text, state').order('position').then(must),
    ])
    return {
        name: p.name,
        birthYear: p.birth_year,
        role: p.role,
        school: p.school,
        major: p.major,
        mainTools: p.main_tools,
        gpa: p.gpa === null ? null : Number(p.gpa),
        tagline: p.tagline,
        links: { email: p.email, phone: p.phone, github: p.github_url, linkedin: p.linkedin_url },
        quest: { title: p.quest_title, steps },
    }
}

export async function fetchSkillCategories(db: SupabaseClient): Promise<SkillCategory[]> {
    const rows: any[] = await db.from('skill_categories')
        .select('name, short_name, description, skills(name, proficiency, icon_url, featured, position)')
        .order('position').then(must)
    return rows.map(c => ({
        name: c.name,
        short: c.short_name,
        description: c.description,
        items: byPosition<any>(c.skills).map(k => ({
            name: k.name,
            proficiency: levels[k.proficiency - 1]!,
            icon: k.icon_url,
            featured: k.featured,
        })),
    }))
}

const PROJECT_SELECT = `slug, title, subtitle, role, started_on, ended_on, summary, github_url, cover_url, video_url,
    project_tags(name, position), project_features(title, detail, position),
    project_challenges(problem, solution, position), project_lessons(content, position)`

function toProject(r: any): Project {
    return {
        slug: r.slug,
        title: r.title,
        subtitle: r.subtitle,
        role: r.role,
        timeframe: `${monthYear(r.started_on)} – ${r.ended_on ? monthYear(r.ended_on) : 'nay'}`,
        summary: r.summary,
        tags: byPosition<any>(r.project_tags).map(t => t.name),
        github: r.github_url,
        cover: r.cover_url,
        video: r.video_url,
        features: byPosition<any>(r.project_features).map(f => ({ title: f.title, detail: f.detail })),
        challenges: byPosition<any>(r.project_challenges).map(c => ({ problem: c.problem, solution: c.solution })),
        lessons: byPosition<any>(r.project_lessons).map(l => l.content),
    }
}

// RLS only returns published projects to visitors.
export async function fetchProjects(db: SupabaseClient): Promise<Project[]> {
    const rows: any[] = await db.from('projects').select(PROJECT_SELECT).order('position').then(must)
    return rows.map(toProject)
}
