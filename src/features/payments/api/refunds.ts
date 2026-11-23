import { useAuth } from '@clerk/clerk-expo'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { orderKeys } from '@/features/orders/api/routes'
import { useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { RefundInput, RefundView, ReturnEvidenceUploadInput, ReturnEvidenceUploadView } from '../types/payments'
import { PAYMENT_ROUTES, refundKeys } from './routes'

/**
 * POST /api/v1/refunds 🔒 — request a refund; also how to cancel a PAID order
 * (`physicalReturnRequired: false`, no photos). A return needs a 20+ char
 * description and 1–8 photos (`evidenceAssetIds`).
 */
export function useRequestRefund() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (input: RefundInput) => api.post<RefundView>(PAYMENT_ROUTES.refunds, input),
        onSuccess: (refund) => {
            queryClient.setQueryData(refundKeys.detail(refund.id), refund)
            // The order's `refunds[]`, `actions` and the list's `refundInProgress` all change.
            queryClient.invalidateQueries({ queryKey: orderKeys.all })
        },
    })
}

/**
 * Step 1 of a return, once per photo: an upload URL (valid 5 minutes). The photo
 * is then PUT to it (`uploadReturnPhoto`) and its `assetId` goes in `POST /refunds`.
 */
export function useReturnEvidenceUploadUrl() {
    const api = useApi()
    return useMutation({
        mutationFn: (input: ReturnEvidenceUploadInput) =>
            api.post<ReturnEvidenceUploadView>(PAYMENT_ROUTES.evidenceUploadUrl, input),
    })
}

/** GET /api/v1/refunds/:refundId 🔒 — one of my refunds, with photos (signed URLs last 5 min). */
export function useRefund(refundId: string | undefined) {
    const api = useApi()
    const { isSignedIn } = useAuth()
    return useQuery({
        queryKey: refundKeys.detail(refundId ?? ''),
        queryFn: () => api.get<RefundView>(PAYMENT_ROUTES.refund(refundId!)),
        enabled: !!isSignedIn && !!refundId,
        retry: retryAuthAware,
        staleTime: 1000 * 60 * 4,
    })
}

/**
 * PUTs the raw photo bytes to the presigned URL with exactly `requiredHeaders`.
 * The size is part of the signature, so the `sizeBytes` sent for the URL must be
 * the real file size.
 */
export async function uploadReturnPhoto(upload: ReturnEvidenceUploadView, fileUri: string): Promise<void> {
    const blob = await (await fetch(fileUri)).blob()
    const res = await fetch(upload.uploadUrl, { method: 'PUT', headers: upload.requiredHeaders, body: blob })
    if (!res.ok) throw new Error(`Photo upload failed (${res.status})`)
}
