import { useQuery } from '@tanstack/react-query'

import { ApiRequestError, useApi } from '@/lib/api'
import { normalizeProduct } from './normalizeProduct'
import { PRODUCT_ROUTES, isUuid, productKeys } from './routes'

/**
 * GET /api/v1/products/:id — full product detail (description, all images,
 * collection.artist, rarity, claim status). 404 → PRODUCTS_NOT_FOUND.
 */
export function useProduct(id: string | undefined) {
    const api = useApi()

    return useQuery({
        queryKey: productKeys.detail(id ?? ''),
        queryFn: async () => {
            // A non-uuid id makes the server answer 500 instead of 404, so it is
            // never sent: it is, by definition, a drop that does not exist.
            if (!isUuid(id!)) {
                throw new ApiRequestError(404, { code: 'PRODUCTS_NOT_FOUND', message: 'No such product' })
            }
            return normalizeProduct(await api.get<unknown>(PRODUCT_ROUTES.byId(id!)))
        },
        enabled: !!id,
        // Only a drop with status PUBLISHED / ACTIVE / ENDED is readable; the server
        // caches a single drop for 5 minutes.
        staleTime: 1000 * 60 * 2,
        // A 404 will not change on retry.
        retry: (count, err) => !(err instanceof ApiRequestError && err.status === 404) && count < 2,
    })
}

/** GET /api/v1/products/code/:productCode — e.g. after an NFC scan. */
export function useProductByCode(productCode: string | undefined) {
    const api = useApi()

    return useQuery({
        queryKey: productKeys.byCode(productCode ?? ''),
        queryFn: async () => normalizeProduct(await api.get<unknown>(PRODUCT_ROUTES.byCode(productCode!))),
        enabled: !!productCode,
        staleTime: 1000 * 60 * 2,
    })
}
