/** @jsxImportSource react */
import React from 'react'
import { Text } from 'react-native'

/**
 * Numbers in DM Sans, everything else in the screen's own font.
 *
 * The app's JSX goes through `./jsx-runtime`, which calls `withDmDigits` for
 * every `<Text>`. When its string children contain a number — "185", "$185",
 * "1,000", "12:30", "42%" — the number is wrapped in a nested `<Text>` set in
 * DM Sans, at the weight that matches the parent's `font-…` class, and the rest
 * of the text is left alone (letters keep Syne / Orbitron).
 *
 * Opt out per element with `font-dm*` (already DM Sans) or by giving the
 * element its own `fontFamily` style.
 */

const NUMBER = /([$€£¥]?\d+(?:[.,:]\d+)*%?)/g
const HAS_DIGIT = /\d/

/** DM Sans weight for a parent font class, e.g. `font-syne-bold` → 700. */
function familyFor(className: unknown, style: unknown): string {
    const flat = JSON.stringify(style ?? '')
    const source = `${typeof className === 'string' ? className : ''} ${flat}`
    if (/font-dm|DMSans/.test(source)) return ''
    if (/font-orbitron|Orbitron|bold|extrabold|black|800|700/i.test(source)) return 'DMSans_700Bold'
    if (/semibold|600/i.test(source)) return 'DMSans_600SemiBold'
    if (/medium|500/i.test(source)) return 'DMSans_500Medium'
    return 'DMSans_400Regular'
}

function transform(node: React.ReactNode, family: string, keyPrefix: string): React.ReactNode {
    if (typeof node === 'number') node = String(node)
    if (typeof node !== 'string' || !HAS_DIGIT.test(node)) return node

    return node.split(NUMBER).map((part, i) =>
        i % 2 === 1
            ? React.createElement(Text, { key: `${keyPrefix}${i}`, style: { fontFamily: family } }, part)
            : part,
    )
}

/** The props to render a `<Text>` with — the same object when nothing changes. */
export function withDmDigits(props: Record<string, unknown>): Record<string, unknown> {
    const children = props.children as React.ReactNode
    if (children == null || typeof children === 'boolean') return props

    const family = familyFor(props.className, props.style)
    if (!family) return props

    if (typeof children === 'string' || typeof children === 'number') {
        const next = transform(children, family, 'n')
        return next === children ? props : { ...props, children: next }
    }

    if (Array.isArray(children)) {
        let changed = false
        const next = children.map((child, index) => {
            const out = transform(child as React.ReactNode, family, `n${index}-`)
            if (out !== child) changed = true
            return out
        })
        return changed ? { ...props, children: next } : props
    }

    return props
}

export const isText = (type: unknown) => type === Text
