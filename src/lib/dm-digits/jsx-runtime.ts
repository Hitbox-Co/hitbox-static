/** @jsxImportSource react */
// NativeWind's JSX runtime (className → style) with one addition: every <Text>
// has its numbers set in DM Sans. See `patch-props.ts`.
import * as nativewind from 'nativewind/jsx-runtime'

import { isText, withDmDigits } from './patch-props'

type Jsx = (type: unknown, props: Record<string, unknown>, ...rest: unknown[]) => unknown
const nw = nativewind as unknown as { jsx: Jsx; jsxs: Jsx; Fragment: unknown }

export const Fragment = nw.Fragment

export const jsx: Jsx = (type, props, ...rest) =>
    nw.jsx(type, isText(type) && props ? withDmDigits(props) : props, ...rest)

export const jsxs: Jsx = (type, props, ...rest) =>
    nw.jsxs(type, isText(type) && props ? withDmDigits(props) : props, ...rest)
