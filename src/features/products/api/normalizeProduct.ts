import { Product, ProductImage } from '../types/product'

/**
 * Maps a `GET /products/:id` response onto `Product`, whichever API generation
 * sent it.
 *
 * The backend's catalog restructure renamed and reshaped several fields the
 * detail screen reads: `productCode` became `groupCode`, `priceInDollars`
 * became `price: { amount, currency }`, `images` became a list of URL strings,
 * `inventoryUnit` became `totalSupply`, and `rewardPoints` is no longer sent.
 * Read raw, those came back undefined and the screen showed "$undefined",
 * "#ined" and a placeholder image — or crashed on a missing value.
 *
 * Done here, at the one place the response enters the app, so the screen and
 * its components keep a single shape and need no knowledge of either API.
 */
export function normalizeProduct(raw: unknown): Product {
    const p = (raw ?? {}) as Record<string, any>

    const images: ProductImage[] = Array.isArray(p.images)
        ? p.images
            .map((image: unknown, index: number): ProductImage | null => {
                if (typeof image === 'string') {
                    return { id: String(index), title: null, description: null, url: image }
                }
                if (image && typeof image === 'object' && typeof (image as ProductImage).url === 'string') {
                    return image as ProductImage
                }
                return null
            })
            .filter((image: ProductImage | null): image is ProductImage => image !== null)
        : []

    const price = p.priceInDollars ?? p.price?.amount ?? null

    return {
        ...p,
        id: String(p.id ?? ''),
        productCode: String(p.productCode ?? p.groupCode ?? ''),
        name: String(p.name ?? ''),
        description: p.description ?? null,
        rewardPoints: typeof p.rewardPoints === 'number' ? p.rewardPoints : null,
        state: p.state ?? p.status,
        marketplaceStatus: p.marketplaceStatus ?? null,
        rarity: p.rarity ?? null,
        priceInDollars: price == null ? null : String(price),
        inventoryUnit: Number(p.inventoryUnit ?? p.totalSupply ?? 0) || 0,
        unitsSold: Number(p.unitsSold ?? 0) || 0,
        tagId: p.tagId ?? null,
        claimedStatus: p.claimedStatus ?? 'UNCLAIMED',
        claimedAt: p.claimedAt ?? null,
        releaseDate: p.releaseDate ?? p.releaseStart ?? null,
        images,
        collection: p.collection ?? null,
        // The current API shape, passed through (see products-api.md).
        status: p.status ?? p.state,
        groupCode: p.groupCode,
        vertical: p.vertical ?? null,
        complianceStatus: p.complianceStatus,
        totalSupply: typeof p.totalSupply === 'number' ? p.totalSupply : undefined,
        purchaseLimit: p.purchaseLimit ?? null,
        releaseEnd: p.releaseEnd ?? null,
        publishedAt: p.publishedAt ?? null,
        isAgeSpecific: !!p.isAgeSpecific,
        minimumAge: p.minimumAge ?? null,
        artistId: p.artistId ?? null,
        artistName: p.artistName ?? null,
        collectionId: p.collectionId ?? null,
        organizationId: p.organizationId ?? null,
        price: p.price && typeof p.price === 'object' ? p.price : null,
        variants: Array.isArray(p.variants) ? p.variants : [],
        dropType: p.dropType ?? null,
    } as Product
}
