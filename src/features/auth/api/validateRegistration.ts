import { ApiRequestError, RegistrationValidateInput, RegistrationValidateResult, useApi } from '@/lib/api'
import { validationFieldErrors } from '@/lib/api-errors'
import { AUTH_ROUTES } from './routes'

/** What the sign-up pre-check came to. */
export type RegistrationCheck =
    /** Fine to go on to Clerk. Use `email` (trimmed, lowercased) for the sign-up. */
    | { kind: 'ok'; email: string }
    /** 409 AUTH_EMAIL_TAKEN — an account with this email already exists. */
    | { kind: 'email_taken' }
    /** 422 — one or more fields are not acceptable; `fieldErrors` is `{ field: message }`. */
    | { kind: 'invalid'; fieldErrors: Record<string, string> }
    /**
     * The check could not be made (offline, 5xx, rate limited). The pre-check is
     * advisory — Clerk is the authority on sign-up — so the caller carries on.
     */
    | { kind: 'unavailable' }

/**
 * POST /api/v1/auth/registration/validate — public, creates nothing. Call it
 * on the sign-up form before Clerk's `signUp.create`: it checks the email,
 * username and name fields with the API's own rules and whether the email is
 * already registered. It does not check password strength (Clerk does) or
 * username availability.
 *
 * Optional fields are sent only when filled in, because the endpoint rejects an
 * empty username and any unknown field.
 */
export function useValidateRegistration() {
    const api = useApi()

    return async (input: RegistrationValidateInput): Promise<RegistrationCheck> => {
        const body: RegistrationValidateInput = { email: input.email }
        if (input.username?.trim()) body.username = input.username
        if (input.firstName?.trim()) body.firstName = input.firstName
        if (input.lastName?.trim()) body.lastName = input.lastName

        try {
            const result = await api.post<RegistrationValidateResult>(AUTH_ROUTES.validateRegistration, body)
            return { kind: 'ok', email: result.email }
        } catch (err) {
            if (err instanceof ApiRequestError) {
                if (err.error.code === 'AUTH_EMAIL_TAKEN') return { kind: 'email_taken' }
                if (err.status === 422) return { kind: 'invalid', fieldErrors: validationFieldErrors(err) }
            }
            return { kind: 'unavailable' }
        }
    }
}
