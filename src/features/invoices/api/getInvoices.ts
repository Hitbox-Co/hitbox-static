import { useAuth } from '@clerk/clerk-expo'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'

import { useApi } from '@/lib/api'
import { retryAuthAware } from '@/lib/queries'
import { Invoice, InvoiceFilters } from '../types/invoice'
import { INVOICE_ROUTES, buildInvoicesPath, invoiceKeys } from './routes'

/**
 * GET /api/v1/invoices 🔒 — my invoices, newest `invoiceDate` first, page by
 * page. The list's `meta` is `{ page, limit, total }` with **no `totalPages`**,
 * so the next page exists while `page × limit < total`.
 */
export function useInvoicesInfinite(filters: Omit<InvoiceFilters, 'page'> = {}) {
    const api = useApi()
    const { isSignedIn } = useAuth()
    const limit = filters.limit ?? 20

    return useInfiniteQuery({
        queryKey: [...invoiceKeys.list({ ...filters, limit }), 'infinite'],
        queryFn: ({ pageParam }) =>
            api.getPage<Invoice>(buildInvoicesPath({ ...filters, limit, page: pageParam })),
        enabled: !!isSignedIn,
        initialPageParam: 1,
        getNextPageParam: (lastPage) =>
            lastPage.meta.page * lastPage.meta.limit < lastPage.meta.total ? lastPage.meta.page + 1 : undefined,
        retry: retryAuthAware,
        staleTime: 1000 * 60,
    })
}

/**
 * GET /api/v1/invoices/:invoiceId 🔒 — one invoice. 404 TAX_NOT_FOUND when there
 * is no such invoice or it is not yours (the two look the same on purpose).
 */
export function useInvoice(invoiceId: string | undefined) {
    const api = useApi()
    const { isSignedIn } = useAuth()

    return useQuery({
        queryKey: invoiceKeys.detail(invoiceId ?? ''),
        queryFn: () => api.get<Invoice>(INVOICE_ROUTES.byId(invoiceId!)),
        enabled: !!isSignedIn && !!invoiceId,
        retry: retryAuthAware,
        staleTime: 1000 * 60,
    })
}
