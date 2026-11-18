import { ProductRarity } from '../types/product'

/** Rarity chip colours. RARE is the green from the Figma drop-detail frame. */
export const RARITY_STYLES: Record<ProductRarity, { bg: string; border: string; text: string }> = {
    COMMON: { bg: '#f3f4f6', border: '#d1d5db', text: '#6b7280' },
    UNCOMMON: { bg: 'rgba(34,197,94,0.15)', border: 'rgba(34,197,94,0.38)', text: '#22c55e' },
    RARE: { bg: '#b6ffd6', border: 'rgba(24,116,69,0.4)', text: '#0fab48' },
    EPIC: { bg: '#ede9fe', border: 'rgba(124,58,237,0.35)', text: '#7c3aed' },
    LEGENDARY: { bg: '#fff4d6', border: 'rgba(217,119,6,0.4)', text: '#d97706' },
    EXCLUSIVE: { bg: '#ffe4e6', border: 'rgba(225,29,72,0.35)', text: '#e11d48' },
}
