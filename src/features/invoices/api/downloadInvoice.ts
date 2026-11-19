import { useMutation } from '@tanstack/react-query'
import { Linking } from 'react-native'

import { ApiRequestError, useApi } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'
import { InvoiceDownload } from '../types/invoice'
import { INVOICE_ROUTES } from './routes'

/**
 * GET /api/v1/invoices/:invoiceId/download 🔒 — a presigned link to the PDF,
 * valid for **300 seconds**, straight from storage. The link is asked for on
 * every tap and opened at once in the system viewer; it is never cached or
 * stored, because it expires.
 *
 * If the PDF was never rendered the server renders it on the spot, so the first
 * call can take a moment longer. Every download is audited server-side.
 */
export function useDownloadInvoice() {
    const api = useApi()

    return useMutation({
        mutationFn: async (invoiceId: string) => {
            const link = await api.get<InvoiceDownload>(INVOICE_ROUTES.download(invoiceId))
            await Linking.openURL(link.url)
            return link
        },
    })
}

/** True when the server has no document storage configured — hide the Download button. */
export function isStorageUnavailable(err: unknown): boolean {
    return err instanceof ApiRequestError && err.error.code === 'TAX_STORAGE_UNAVAILABLE'
}

/** A sentence for a failed invoice call, keyed on the error `code`. */
export function invoiceErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
        if (err.error.code === 'TAX_NOT_FOUND') return "We couldn't find that invoice."
        if (err.error.code === 'TAX_STORAGE_UNAVAILABLE') return "Invoice downloads aren't available right now."
    }
    return describeApiError(err)
}
