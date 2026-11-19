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
            queryClient.setQueryData(queryKeys.me, me)
        },
    })
}

