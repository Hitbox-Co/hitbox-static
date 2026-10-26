import { loginSchema, otpSchema, phoneSchema } from '../LoginSchema'

/**
 * Unit tests for the login Zod schemas (loginSchema, phoneSchema, otpSchema).
 * See src/features/auth/login/__tests__/README.md for the documented matrix.
 */

function fieldErrors(schema: { safeParse: (d: unknown) => any }, data: unknown) {
  const result = schema.safeParse(data)
  return result.success ? {} : result.error.flatten().fieldErrors
}

describe('loginSchema (email + password)', () => {
  const valid = { email: 'ayan@example.com', password: 'secret123' }

  it('accepts a valid email + password', () => {
    expect(loginSchema.safeParse(valid).success).toBe(true)
  })

  describe('email', () => {
    it('rejects an empty email with the "required" message', () => {
      expect(fieldErrors(loginSchema, { ...valid, email: '' }).email).toContain('Email is required')
    })

    it.each([['plainaddress'], ['missing@tld'], ['@no-local.com'], ['a b@x.com']])(
      'rejects the invalid email %s',
      (email) => {
        expect(fieldErrors(loginSchema, { ...valid, email }).email).toBeDefined()
      }
    )

    it.each([['a@b.co'], ['user.name@sub.domain.io'], ['user+tag@x.com']])(
      'accepts the valid email %s',
      (email) => {
        expect(loginSchema.safeParse({ ...valid, email }).success).toBe(true)
      }
    )

    it('rejects a missing email field', () => {
      expect(fieldErrors(loginSchema, { password: 'secret123' }).email).toBeDefined()
    })
  })

  describe('password', () => {
    it('rejects fewer than 6 characters', () => {
      expect(fieldErrors(loginSchema, { ...valid, password: '12345' }).password).toContain(
        'Password must be at least 6 characters'
      )
    })

    it('accepts exactly 6 characters (boundary)', () => {
      expect(loginSchema.safeParse({ ...valid, password: '123456' }).success).toBe(true)
    })

    it('rejects a missing password field', () => {
      expect(fieldErrors(loginSchema, { email: 'ayan@example.com' }).password).toBeDefined()
    })
  })

  it('reports both fields when both are invalid', () => {
    const errors = fieldErrors(loginSchema, { email: 'nope', password: '1' })
    expect(errors.email).toBeDefined()
    expect(errors.password).toBeDefined()
  })
})

describe('phoneSchema', () => {
  it.each([['+15555550100'], ['15555550100'], ['+919876543210'], ['12']])(
    'accepts the valid number %s',
    (phoneNumber) => {
      expect(phoneSchema.safeParse({ phoneNumber }).success).toBe(true)
    }
  )

  it('rejects an empty phone number', () => {
    expect(fieldErrors(phoneSchema, { phoneNumber: '' }).phoneNumber).toContain(
      'Phone number is required'
    )
  })

  it.each([
    ['0123456789'], // leading zero
    ['+0123'], // leading zero after +
    ['555-000-0000'], // dashes
    ['555 000'], // space
    ['abcdefghij'], // letters
    ['1'], // too short for the {1,14} body
  ])('rejects the invalid number %s', (phoneNumber) => {
    expect(fieldErrors(phoneSchema, { phoneNumber }).phoneNumber).toBeDefined()
  })

  it('rejects more than 15 total digits', () => {
    expect(fieldErrors(phoneSchema, { phoneNumber: '1234567890123456' }).phoneNumber).toBeDefined()
  })
})

describe('otpSchema', () => {
  it('accepts exactly 6 characters', () => {
    expect(otpSchema.safeParse({ otp: '123456' }).success).toBe(true)
  })

  it.each([['12345'], ['1234567'], ['']])('rejects the wrong-length code %s', (otp) => {
    expect(fieldErrors(otpSchema, { otp }).otp).toContain(
      'Verification code must be exactly 6 digits'
    )
  })

  it('rejects a missing otp field', () => {
    expect(fieldErrors(otpSchema, {}).otp).toBeDefined()
  })
})
