/** Mirrors the Rewards API (`/api/v1/rewards`). */

export type RewardItemKind = 'VIDEO' | 'AUDIO' | 'GIF' | 'IMAGE'

/** All four keys are always present. */
export type ItemCounts = Record<RewardItemKind, number>

export interface RewardCollectionRef {
    id: string
    name: string
    slug: string
    heroImageUrl: string | null
    artist: { id: string; name: string; slug: string }
}

/** One row on My Rewards. */
export interface RewardSummary {
    id: string
    publicCode: string | null
    name: string
    description: string | null
    collection: RewardCollectionRef
    unlockedAt: string
    itemCounts: ItemCounts
    itemTotal: number
}

export interface RewardItem {
    id: string
    publicCode: string | null
    assetId: string
    /** Null for a file type the server does not know. */
    kind: RewardItemKind | null
    title: string
    fileName: string
    mimeType: string
    sizeBytes: number | null
    position: number
    /** Signed link, valid `expiresIn` seconds. Null = not servable (scanning, removed, flagged). */
    url: string | null
    expiresIn: number | null
}

export interface RewardDetail extends RewardSummary {
    items: RewardItem[]
}

export interface RewardTeaser {
    reward: Pick<RewardSummary, 'id' | 'name' | 'description' | 'itemCounts' | 'itemTotal'>
    collection: RewardCollectionRef
    progress: {
        required: number
        collected: number
        missing: { dropId: string; publicCode: string | null; name: string }[]
        complete: boolean
    }
    unlocked: boolean
}
