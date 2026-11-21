import React from 'react'
import { Text } from 'react-native'

import { apiErrorCode } from '@/lib/api-errors'
import { useAuthz } from '../api/getAuthz'

/**
 * Under a failed request's message: when the server answered 403 AUTHZ_FORBIDDEN,
 * say WHY from the account's real grants (`GET /authz/me`). A brand-new account
 * has no role (none is assigned at sign-up), and every protected route — orders,
 * invoices, rewards — then refuses it. Renders nothing for any other error.
 */
export default function ForbiddenNote({ error }: { error: unknown }) {
    const { data } = useAuthz()
    if (apiErrorCode(error) !== 'AUTHZ_FORBIDDEN') return null

    const roles = data?.roles ?? []
    return (
        <Text className="px-2 text-center font-syne text-[11.5px] leading-[17px] text-[#6b7280]">
            {roles.length === 0
                ? 'Your account has no role yet, so the server blocks this. It needs the buyer role (BUYER_COLLECTOR) assigned on the backend.'
                : `Your role${roles.length === 1 ? ' is' : 's are'} ${roles.map((r) => r.roleName).join(', ')}, which doesn't include the permission this needs.`}
        </Text>
    )
}
