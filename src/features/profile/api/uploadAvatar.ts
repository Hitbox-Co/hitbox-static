import { useUser } from '@clerk/clerk-expo'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { UpdateMeInput, useApi } from '@/lib/api'
import { queryKeys } from '@/lib/queries'
import { Me } from '../types/profile'

/**
 * Uploads a picked image to **Clerk** first, then syncs the resulting
 * img.clerk.com URL to the backend via PATCH /api/v1/users/me.
 *
 * Clerk is the source of truth for the avatar: `user.setProfileImage()` updates
 * the Clerk user immediately (so `useUser().imageUrl` re-renders everywhere at
 * once), and Clerk's `user.updated` webhook also projects it onto the backend
 * User row. The explicit PATCH makes the local row correct straight away
 * instead of waiting on webhook delivery.
 */
export function useUploadAvatar() {
    const { user } = useUser()
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        /** `fileUri` is a local file:// URI or a data: URI from expo-image-picker. */
        mutationFn: async (fileUri: string) => {
            if (!user) throw new Error('You must be signed in to change your photo.')

            // 1. Upload to Clerk — updates user.imageUrl immediately.
            const updatedUser = await user.setProfileImage({ file: fileUri })
            const avatarUrl = updatedUser.publicUrl ?? user.imageUrl

            // 2. Mirror the hosted URL onto the backend row.
            if (avatarUrl) {
                const me = await api.patch<Me>('/api/v1/users/me', {
                    avatarUrl,
                } satisfies UpdateMeInput)
                return me
            }

            return null
        },
        onSuccess: (me) => {
            // PATCH answers without `stats`: keep the ones we had.
            if (me) queryClient.setQueryData<Me>(queryKeys.me, (old) => ({ ...me, stats: old?.stats }))
        },
    })
}

/**
 * Removes the Clerk profile image. The backend keeps whatever `avatarUrl` it
 * has until Clerk's webhook clears it — PATCH can't send null (the DTO only
 * accepts a valid URL string), so we let the webhook own the removal.
 */
export function useRemoveAvatar() {
    const { user } = useUser()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async () => {
            if (!user) throw new Error('You must be signed in.')
            await user.setProfileImage({ file: null })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.me })
        },
    })
}
