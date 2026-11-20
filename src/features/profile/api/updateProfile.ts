import { UpdateMeInput, useApi } from "@/lib/api"
import { queryKeys } from "@/lib/queries"
import { useMutation, useQueryClient } from "@tanstack/react-query"
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
        },
    })
}

