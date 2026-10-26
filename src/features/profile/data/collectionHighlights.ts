/**
 * Placeholder collections for the profile's "My Collection Highlights" row and
 * the screen behind its View Collection button.
 *
 * Shared so the row and that screen can't disagree — the whole point of the
 * button is to show more of what the row is teasing. Still mock data: there is
 * no endpoint for "collections the user has items from" yet, only
 * `GET /collections/me`, which returns individual items rather than groupings.
 */
export interface HighlightCollection {
    id: string
    title: string
    image: string
    /** Items the user holds from this collection. */
    count: number
}

export const COLLECTION_HIGHLIGHTS: HighlightCollection[] = [
    {
        id: '1',
        title: 'Pierce The Veil',
        image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=200',
        count: 18,
    },
    {
        id: '2',
        title: 'Warped Tour 2026',
        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=200',
        count: 11,
    },
    {
        id: '3',
        title: 'PTV Funko Pop!',
        image: 'https://images.unsplash.com/photo-1566753323558-f4e0952af115?q=80&w=200',
        count: 3,
    },
    {
        id: '4',
        title: 'blink-182',
        image: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=200',
        count: 5,
    },
]
