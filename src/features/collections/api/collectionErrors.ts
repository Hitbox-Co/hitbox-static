import { ApiRequestError } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'

/** A sentence for a failed collections call, keyed on the error `code`. */
export function collectionErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError && err.error.code === 'COLLECTIONS_ITEM_NOT_FOUND') {
        return "That item isn't on your shelf any more."
    }
    return describeApiError(err)
}
