/** Rewards endpoints. All need the Clerk session and the `content-unlock:read` permission. */
export const REWARD_ROUTES = {
    /** GET — rewards I can open right now (no files, no pagination). */
    list: '/api/v1/rewards',
    /** GET — what a collection's reward holds + my progress. 404 = no live reward (hide the block). */
    teaser: (collectionId: string) => `/api/v1/rewards/collections/${encodeURIComponent(collectionId)}`,
    /** GET — an unlocked reward with signed file links (valid 1 hour). */
    byId: (rewardId: string) => `/api/v1/rewards/${encodeURIComponent(rewardId)}`,
} as const

export const rewardKeys = {
    all: ['rewards'] as const,
    list: ['rewards', 'list'] as const,
    teaser: (collectionId: string) => ['rewards', 'teaser', collectionId] as const,
    detail: (rewardId: string) => ['rewards', 'detail', rewardId] as const,
}
