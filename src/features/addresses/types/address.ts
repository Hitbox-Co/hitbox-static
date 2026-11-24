/** Mirrors `addresses-api.md`. */

export type AddressLabel = 'Home' | 'Work' | 'Other'
export type AddressUsage = 'SHIPPING' | 'BILLING' | 'BOTH'

export interface Address {
    id: string
    label: AddressLabel
    recipientName: string
    line1: string
    /** Null if not set. */
    line2: string | null
    city: string
    /** ISO code for IN / US (required there); free text elsewhere; null if not set. */
    state: string | null
    postalCode: string
    /** ISO 3166-1 alpha-2, upper case. */
    countryCode: string
    phone: string | null
    /** Exactly one address per user is the default. */
    isDefault: boolean
    usage: AddressUsage
    createdAt: string
}

/** POST body. `isDefault` is not settable here — use the `/default` endpoint. */
export interface AddressInput {
    label: AddressLabel
    recipientName: string
    line1: string
    line2?: string | null
    city: string
    state?: string | null
    postalCode: string
    countryCode: string
    phone?: string | null
    usage?: AddressUsage
}

/** PATCH body: only the fields to change; `line2`, `state`, `phone` accept null to clear. */
export type AddressPatch = Partial<AddressInput>
