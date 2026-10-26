/**
 * Shape of the static legal documents (privacy policy, terms of use). They are
 * stored as blocks rather than prose so `LegalDocument` can render either one
 * without the copy being welded into JSX.
 */

export type LegalBlock =
    /** Emphasised preamble — the all-caps notice printed above section 1. */
    | { kind: 'notice'; text: string }
    | { kind: 'subheading'; text: string }
    | { kind: 'paragraph'; text: string }
    /** Lettered clause, e.g. "(a) you have the legal capacity…". */
    | { kind: 'listItem'; marker: string; text: string }
    /** A labelled line in a contact block; `href` makes it tappable. */
    | { kind: 'contact'; label: string; value: string; href?: string }

export type LegalSection = {
    /** Section number as printed in the source document. */
    number: string
    title: string
    blocks: LegalBlock[]
}

export type LegalDocumentMeta = {
    company: string
    title: string
    effectiveDate: string
    lastUpdated: string
    /** Optional all-caps preamble shown before the first numbered section. */
    preamble?: string[]
    /** Optional closing line, e.g. a copyright notice. */
    footer?: string
}
