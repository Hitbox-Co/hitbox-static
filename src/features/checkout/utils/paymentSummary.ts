import { CreditCard } from 'lucide-react-native'

/**
 * How the payment reads on the review and failed screens. The method itself is
 * picked inside Stripe's payment sheet (card, wallets…), so there is one summary.
 */
export function paymentSummary() {
    return { title: 'Secure payment by Stripe', sub: 'Enter your card on the next step' as string | null, Icon: CreditCard }
}
