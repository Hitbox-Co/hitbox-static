import { CollectionItem, CollectionVisibility } from "../types/collection";

/** Shown when a collection item's product has no image. */
export const COLLECTION_PLACEHOLDER_IMAGE =
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&q=60";

/** "LEGENDARY" → "Legendary", "ULTRA_RARE" → "Ultra rare". */
export function titleCase(value: string) {
    const text = value.replace(/_/g, " ");
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

/**
 * `rarity` is a free-form string (or null), so it is formatted for display —
 * underscores to spaces, upper-cased — and never switched on as an enum.
 */
export function rarityLabel(rarity: string | null | undefined): string | null {
    return rarity ? rarity.replace(/_/g, " ").toUpperCase() : null;
}

/** "#14" — the unit's position in its edition. */
export function serialLabel(serialNumber: number) {
    return `#${serialNumber}`;
}

/** What one shelf card shows. A card is one physical unit, so there is no owned/total. */
export interface CollectionCardData {
    /** Shelf-row id. */
    id: string;
    /** `item.sku.id` — what the visibility PATCH needs. */
    skuId: string;
    title: string;
    subtitle: string;
    serial: number;
    visibility: CollectionVisibility;
    image: { uri: string };
    featured: boolean;
}

/** CollectionItem → the shelf card (CollectionGrid / CollectionCard). */
export function toCollectionCard(item: CollectionItem): CollectionCardData {
    return {
        id: item.id,
        skuId: item.sku.id,
        title: item.product.name,
        subtitle: rarityLabel(item.product.rarity) ?? "Collectible",
        serial: item.sku.serialNumber,
        visibility: item.visibility,
        image: { uri: item.product.imageUrl ?? COLLECTION_PLACEHOLDER_IMAGE },
        // Highlight the rarest pieces with the FEATURED ribbon.
        featured: item.product.rarity === "LEGENDARY" || item.product.rarity === "EXCLUSIVE",
    };
}

/** CollectionItem → CollectibleItem for GlobalCollectionSection. */
export function toCollectibleItem(item: CollectionItem) {
    const rarity = item.product.rarity ? titleCase(item.product.rarity) : "Collectible";
    return {
        id: item.id,
        title: item.product.name,
        subtitle: `${serialLabel(item.sku.serialNumber)} · ${rarity}`,
        image: { uri: item.product.imageUrl ?? COLLECTION_PLACEHOLDER_IMAGE },
        // rarityStyles() keys on "Epic" / "Rare" / "Uncommon"; others fall to default.
        rarity,
        isNew: false,
        // Everything on the shelf is owned.
        owned: true,
    };
}
