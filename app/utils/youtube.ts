// Pulls the 11-char video id out of youtube.com/watch?v=, youtu.be/, /embed/, /shorts/ or /live/ links (or a bare id).
export function youtubeId(url: string): string | null {
    const m = url.trim().match(/(?:youtu\.be\/|[?&]v=|\/(?:embed|shorts|live)\/)([\w-]{11})|^([\w-]{11})$/)
    return m ? (m[1] ?? m[2])! : null
}
