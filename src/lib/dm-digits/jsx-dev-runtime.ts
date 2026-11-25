/** @jsxImportSource react */
// Development twin of `jsx-runtime.ts` (React Native uses this one in dev builds).
import * as nativewind from 'nativewind/jsx-dev-runtime'

import { isText, withDmDigits } from './patch-props'

type Jsx = (type: unknown, props: Record<string, unknown>, ...rest: unknown[]) => unknown
const nw = nativewind as unknown as { jsxDEV: Jsx; Fragment: unknown }

export const Fragment = nw.Fragment

export const jsxDEV: Jsx = (type, props, ...rest) =>
    nw.jsxDEV(type, isText(type) && props ? withDmDigits(props) : props, ...rest)
