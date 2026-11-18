import { CreditCard, Wallet } from 'lucide-react-native'

import { MOCK_SAVED_CARD } from '../data/mockCheckout'
import { PaymentMethodId } from '../types/checkout'

/** How a payment method reads on the review, failed and confirmed screens. */
export function paymentSummary(method: PaymentMethodId) {
    if (method === 'apple_pay') return { title: 'Apple Pay', sub: null as string | null, Icon: Wallet }
    if (method === 'google_pay') return { title: 'Google Pay', sub: null as string | null, Icon: Wallet }
    return { title: `Card ending in ${MOCK_SAVED_CARD.last4}`, sub: MOCK_SAVED_CARD.holder as string | null, Icon: CreditCard }
}
