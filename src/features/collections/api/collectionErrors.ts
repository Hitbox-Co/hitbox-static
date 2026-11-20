import { ApiRequestError } from '@/lib/api'
import { describeApiError } from '@/lib/api-errors'

/** A sentence for a failed collections call, keyed on the error `code`. */
export function collectionErrorMessage(err: unknown): string {
    if (err instanceof ApiRequestError) {
        switch (err.error.code) {
            case 'COLLECTIONS_ITEM_NOT_FOUND':
                return "That item isn't on your shelf any more."
            // GET /collections/user/:userId — the collector keeps their whole profile private.
            case 'COLLECTIONS_PROFILE_PRIVATE':
                return 'This collector keeps their collection private.'
            // GET /collections/user/:userId — unknown, deactivated or deleted collector.
            case 'COLLECTIONS_USER_NOT_FOUND':
                return "We couldn't find this collector."
        }
    }
    return describeApiError(err)
}

/** The server's id format. A `:skuId` that is not one makes PATCH answer 500, so it is never sent. */
export const isUuid = (value: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
