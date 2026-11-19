import * as z from 'zod'

/** Empty means "leave unchanged" — the API cannot clear these fields. */
const emptyOr = (schema: z.ZodString) => z.union([z.literal(''), schema])

/**
 * Mirrors the PATCH /api/v1/users/me rules: handle 3–50 (letters/digits/_/.),
 * fullName 1–200, bio ≤500, phone 5–32, generalLocation ≤120. handle, fullName
 * and phone cannot be cleared (no null), so '' there simply means "unchanged";
 * bio and generalLocation clear with "".
 */
export const editProfileSchema = z.object({
    handle: emptyOr(
        z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(50, 'Username must be at most 50 characters')
            .regex(/^[a-zA-Z0-9_.]+$/, 'Only letters, numbers, underscore and dot are allowed'),
    ),
    fullName: emptyOr(z.string().max(200, 'Name must be at most 200 characters')),
    bio: z.string().max(500, 'Bio must be at most 500 characters'),
    phone: emptyOr(z.string().min(5, 'Phone must be at least 5 characters').max(32, 'Phone must be at most 32 characters')),
    generalLocation: z.string().max(120, 'Location must be at most 120 characters'),
    profileVisibility: z.enum(['PUBLIC', 'PRIVATE']),
})

export type EditProfileFormData = z.infer<typeof editProfileSchema>
