import { useClerk } from '@clerk/clerk-expo'
import { useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import { useEffect, useRef } from 'react'
import { Alert } from 'react-native'

import { accountProblemOf, type AccountProblem } from '@/lib/api-errors'
import { useAuthMe } from '@/lib/queries'

/**
 * Renders nothing. Mounted at the app root while signed in, it probes
 * `GET /auth/me` once and reacts to the account-state errors the backend can
 * answer with (backend `auth-api.md`, "Account-state errors"):
 *
 *   403 AUTH_ACCOUNT_SUSPENDED    → say so, offer support / sign-out. Never retried.
 *   401 AUTH_ACCOUNT_NOT_FOUND    → "no longer exists", sign out. Only reached
 *                                    after the retries that cover a brand-new
 *                                    sign-up (see `retryAuthAware`).
 *   401 AUTH_INVALID_TOKEN        → the API client already refreshed the token
 *                                    and retried once; still invalid means sign out.
 *   401 AUTH_UNAUTHENTICATED      → same: the session is gone, sign out.
 *   403 AUTH_EMAIL_UNVERIFIED     → ask them to verify their email.
 *
 * Each problem is raised once per session, so a re-render never stacks alerts.
 */
export default function AccountStateWatcher() {
    const { signOut } = useClerk()
    const queryClient = useQueryClient()
    const { error } = useAuthMe()
    const raised = useRef<AccountProblem | null>(null)

    useEffect(() => {
        if (!error) {
            raised.current = null
            return
        }
        const problem = accountProblemOf(error)
        if (!problem || raised.current === problem) return
        raised.current = problem

        // Clerk ends the session; there is no backend sign-out. Drop cached data
        // so the next account never sees this one's.
        const leave = async () => {
            await signOut()
            queryClient.clear()
            router.replace('/')
        }

        switch (problem) {
            case 'SUSPENDED':
                Alert.alert('Account suspended', 'Your account is suspended. Contact support.', [
                    { text: 'Contact support', onPress: () => router.push('/support' as never) },
                    { text: 'Sign out', style: 'destructive', onPress: () => void leave() },
                ])
                break
            case 'ACCOUNT_NOT_FOUND':
                Alert.alert('Account not found', 'This account no longer exists.', [
                    { text: 'OK', onPress: () => void leave() },
                ])
                break
            case 'EMAIL_UNVERIFIED':
                Alert.alert('Verify your email', 'Please verify your email address to keep using HitBox.', [
                    { text: 'Sign out', style: 'destructive', onPress: () => void leave() },
                    { text: 'OK' },
                ])
                break
            case 'INVALID_TOKEN':
            case 'UNAUTHENTICATED':
                void leave()
                break
        }
    }, [error, signOut, queryClient])

    return null
}
