import { useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { normalizeProduct } from './normalizeProduct'
import { PRODUCT_ROUTES, productKeys } from './routes'

/**
 * GET /api/v1/products/:id — full product detail (description, all images,
 * collection.artist, rarity, claim status). 404 → PRODUCTS_NOT_FOUND.
 */
export function useProduct(id: string | undefined) {
    const api = useApi()

    return useQuery({
        queryKey: productKeys.detail(id ?? ''),
        queryFn: async () => normalizeProduct(await api.get<unknown>(PRODUCT_ROUTES.byId(id!))),
        enabled: !!id,
        staleTime: 1000 * 60 * 2,
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
