import { ItemCounts, RewardItemKind } from '../types/reward'

const WORDS: Record<RewardItemKind, [string, string]> = {
    VIDEO: ['video', 'videos'],
    AUDIO: ['track', 'tracks'],
    GIF: ['GIF', 'GIFs'],
    IMAGE: ['image', 'images'],
}

/** "1 video · 1 track · 2 images" — skips zero counts. */
export function describeCounts(counts: ItemCounts): string {
    return (['VIDEO', 'AUDIO', 'GIF', 'IMAGE'] as RewardItemKind[])
        .filter((k) => counts[k] > 0)
        .map((k) => `${counts[k]} ${WORDS[k][counts[k] === 1 ? 0 : 1]}`)
        .join(' · ')
}

export function formatBytes(bytes: number | null): string | null {
    if (bytes == null) return null
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`
    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`
}

export function formatUnlockedDate(iso: string): string {
    const d = new Date(iso)
    return Number.isNaN(d.getTime())
        ? ''
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
