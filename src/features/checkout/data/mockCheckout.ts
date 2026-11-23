import { DeliveryAddress, PaymentOutcome } from '../types/checkout'

/**
 * MOCK CONTENT for the static checkout pages. Everything here stands in for a
 * backend that does not exist yet — replace each export with an API hook
 * (`features/checkout/api/…`, per AGENTS.md §3) when the endpoints land.
 */

/** The address the Figma shows as already saved on the account. */
export const MOCK_SAVED_ADDRESS: DeliveryAddress = {
    id: 'home',
    label: 'Home',
    fullName: 'Alex Morgan',
    email: 'alex@example.com',
    phone: '+1 (202) 555-0148',
    country: 'United States',
    street: '24 Example Street',
    unit: 'Apt 4B',
    city: 'Brooklyn',
    state: 'NY',
    zip: '11201',
}

/** Flat standard-delivery fee, USD. */
/** No delivery fee or tax is added at checkout: Stripe charges the drop's price. */
export const MOCK_DELIVERY_FEE_USD = 0

/** Sales tax applied to the subtotal (the Figma shows $14.80 on $185). */
export const MOCK_TAX_RATE = 0

/** Shown on the confirmation screen. */
export const MOCK_ORDER_NUMBER = 'HB-2042'

/**
 * What "Pay" does in this static build. `'failure'` sends the buyer to the
 * "Payment unsuccessful" screen instead, so both result states can be seen.
 */
export const MOCK_PAYMENT_OUTCOME: PaymentOutcome = 'success'  // unused: payments are real now
