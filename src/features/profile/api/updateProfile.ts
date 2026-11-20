import { UpdateMeInput, useApi } from "@/lib/api"
import { queryKeys } from "@/lib/queries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { collectionKeys } from "@/features/collections/api/routes"
import { Me } from "../types/profile"


/** PATCH /api/v1/users/me — 409 USERS_HANDLE_TAKEN surfaces as ApiRequestError. */
export function useUpdateMe() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: UpdateMeInput) => api.patch<Me>('/api/v1/users/me', input),
        onSuccess: (me) => {
            // PATCH answers without `stats`: keep the ones we had.
            queryClient.setQueryData<Me>(queryKeys.me, (old) => ({ ...me, stats: old?.stats }))
            // …then re-read it (stats included), and drop anything cached about how
            // other people see this profile — a visibility change alters profiles,
            // showcases and the follower lists' private flags at once.
            void queryClient.invalidateQueries({ queryKey: queryKeys.me })
            void queryClient.invalidateQueries({ queryKey: ['users'] })
            void queryClient.invalidateQueries({ queryKey: collectionKeys.all })
            void queryClient.invalidateQueries({ queryKey: ['follows'] })
        },
    })
}

