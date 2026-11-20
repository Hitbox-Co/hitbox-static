import { ApiRequestError, useApi } from '@/lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { CollectionItem, UpdateVisibilityInput } from '../types/collection'
import { isUuid } from './collectionErrors'
import { COLLECTION_ROUTES, collectionKeys } from './routes'

/**
 * PATCH /api/v1/collections/me/:skuId 🔒 — switch one owned item between
 * PUBLIC (shown in the showcase) and PRIVATE. `skuId` is `item.sku.id` — not the
 * shelf-row id and not the product id. 404 COLLECTIONS_ITEM_NOT_FOUND if you
 * have no shelf row for that SKU. Returns the updated item.
 *
 * Visibility also decides whether other people see you as the owner when they
 * scan the item — but only while your profile is PUBLIC too; a private profile
 * hides every item and reads "claimed by another collector".
 */
export function useUpdateCollectionVisibility() {
    const api = useApi()
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: async ({ skuId, visibility }: UpdateVisibilityInput & { skuId: string }) => {
            // The server does not validate :skuId — a non-uuid answers 500. Such an
            // id cannot be on the shelf, so it is refused here as "not found".
            if (!isUuid(skuId)) {
                throw new ApiRequestError(404, { code: 'COLLECTIONS_ITEM_NOT_FOUND', message: 'Not on your shelf' })
            }
            return api.patch<CollectionItem>(COLLECTION_ROUTES.meItem(skuId), { visibility })
        },
        onSuccess: () => {
            // Refetch every collections query — a filtered view may gain or lose the item.
            queryClient.invalidateQueries({ queryKey: collectionKeys.all })
        },
    })
}
