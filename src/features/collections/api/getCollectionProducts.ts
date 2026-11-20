import { useEffect } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { useMyCollectionInfinite } from './getMyCollectionInfinite'
import { PRODUCT_ROUTES, buildProductsPath, isUuid } from '@/features/products/api/routes'
import { useApi } from '@/lib/api'
import { CollectionItem } from '../types/collection'

/** The few fields of a drop the collection page shows. */
export interface CollectionProduct {
    id: string
    name: string
    imageUrl: string | null
    rarity: string | null
    artistName: string | null
}

interface RawProduct {
    id: string
    name: string
    rarity?: string | null
    artistName?: string | null
    images?: ({ url?: string } | string)[]
}

const toProduct = (p: RawProduct): CollectionProduct => {
    const first = p.images?.[0]
    return {
        id: p.id,
        name: p.name,
        rarity: p.rarity ?? null,
        artistName: p.artistName ?? null,
        imageUrl: typeof first === 'string' ? first : (first?.url ?? null),
    }
}

/**
 * Every drop in one artist collection — `GET /products?collectionId=` (public).
 * Only viewable drops (published, on sale or ended) come back, 50 at a time; the
 * rest are fetched automatically so "owned vs missing" is complete.
 */
export function useCollectionProducts(collectionId: string | undefined) {
    const api = useApi()
    const q = useInfiniteQuery({
        queryKey: ['collection', 'products', collectionId ?? ''],
        queryFn: ({ pageParam }) =>
            api.getPage<RawProduct>(buildProductsPath({ collectionId, page: pageParam, limit: 50 })),
        enabled: !!collectionId && isUuid(collectionId),
        initialPageParam: 1,
        getNextPageParam: (last) => (last.meta.page < (last.meta.totalPages ?? 1) ? last.meta.page + 1 : undefined),
        staleTime: 1000 * 60 * 2,
        retry: 1,
    })
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = q
    const pages = q.data?.pages.length ?? 0
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && pages < 10) void fetchNextPage()
    }, [hasNextPage, isFetchingNextPage, pages, fetchNextPage])

    return {
        products: (q.data?.pages.flatMap((p) => p.data) ?? []).map(toProduct),
        total: q.data?.pages[0]?.meta.total,
        isLoading: q.isLoading,
        isError: q.isError,
        refetch: q.refetch,
    }
}

/** How many drops a collection holds, from the list's `meta.total` (one row requested). */
export function useCollectionTotal(collectionId: string | undefined) {
    const api = useApi()
    const { data } = useQuery({
        queryKey: ['collection', 'total', collectionId ?? ''],
        queryFn: () => api.getPage<RawProduct>(`${PRODUCT_ROUTES.list}?collectionId=${collectionId}&limit=1`),
        enabled: !!collectionId && isUuid(collectionId),
        staleTime: 1000 * 60 * 5,
        retry: 1,
    })
    return data?.meta.total
}

/**
 * My whole shelf, every page (50 at a time, up to 500 items), so collections can
 * be counted exactly. Pages load one after another in the background.
 */
export function useAllMyItems(): { items: CollectionItem[]; isLoading: boolean } {
    const shelf = useMyCollectionInfinite({ limit: 50 })
    const { hasNextPage, isFetchingNextPage, fetchNextPage } = shelf
    const pages = shelf.data?.pages.length ?? 0
    useEffect(() => {
        if (hasNextPage && !isFetchingNextPage && pages < 10) void fetchNextPage()
    }, [hasNextPage, isFetchingNextPage, pages, fetchNextPage])
    return { items: shelf.data?.pages.flatMap((p) => p.data) ?? [], isLoading: shelf.isLoading }
}
