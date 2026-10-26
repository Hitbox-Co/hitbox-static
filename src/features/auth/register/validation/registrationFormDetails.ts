import * as z from 'zod'

export const userDetailsSchema = z.object({
    profileImage: z.string().optional(),
    firstName: z.string().min(2, 'First name must be at least 2 characters'),
    lastName: z.string().min(2, 'Last name must be at least 2 characters'),
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.email('Please enter a valid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters'),
    countryCode: z.string()
        .min(1, 'Required')
        .regex(/^\+?[1-9]\d{0,3}$/, 'Invalid code'),
    phoneNumber: z.string()
        .min(10, 'Phone number must be at least 10 digits')
        .regex(/^\d+$/, 'Please enter digits only'),
        
    acceptPrivacyPolicy: z.boolean().refine((val) => val === true, {
        message: 'You must accept the Privacy Policy',
    }),
    acceptTermsAndConditions: z.boolean().refine((val) => val === true, {
        message: 'You must accept the Terms of Use',
    }),
})

export type UserDetailsFormData = z.infer<typeof userDetailsSchema>