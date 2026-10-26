import { userDetailsSchema } from '../registrationFormDetails'

/**
 * Unit tests for the registration Zod schema (userDetailsSchema).
 * See src/features/auth/register/__tests__/README.md for the documented matrix.
 */

/** A fully valid form payload; individual tests override one field at a time. */
const validData = {
  profileImage: '',
  firstName: 'Ayan',
  lastName: 'Saha',
  username: 'ayan_01',
  email: 'ayan@example.com',
  password: 'supersecret',
  countryCode: '+1',
  phoneNumber: '1234567890',
  acceptPrivacyPolicy: true,
  acceptTermsAndConditions: true,
}

/** Returns the flattened field->message map for a failed parse. */
function fieldErrors(data: unknown) {
  const result = userDetailsSchema.safeParse(data)
  if (result.success) return {}
  return result.error.flatten().fieldErrors
}

describe('userDetailsSchema', () => {
  describe('happy path', () => {
    it('accepts a fully valid payload', () => {
      expect(userDetailsSchema.safeParse(validData).success).toBe(true)
    })

    it('accepts an omitted profileImage (optional)', () => {
      const { profileImage, ...rest } = validData
      expect(userDetailsSchema.safeParse(rest).success).toBe(true)
    })

    it('accepts a country code without the leading +', () => {
      expect(userDetailsSchema.safeParse({ ...validData, countryCode: '91' }).success).toBe(true)
    })
  })

  describe('firstName', () => {
    it('rejects fewer than 2 characters', () => {
      expect(fieldErrors({ ...validData, firstName: 'A' }).firstName).toContain(
        'First name must be at least 2 characters'
      )
    })

    it('rejects an empty string', () => {
      expect(fieldErrors({ ...validData, firstName: '' }).firstName).toBeDefined()
    })

    it('accepts exactly 2 characters (boundary)', () => {
      expect(userDetailsSchema.safeParse({ ...validData, firstName: 'Al' }).success).toBe(true)
    })

    it('rejects a missing field', () => {
      const { firstName, ...rest } = validData
      expect(fieldErrors(rest).firstName).toBeDefined()
    })

    it('rejects a non-string type', () => {
      expect(fieldErrors({ ...validData, firstName: 123 }).firstName).toBeDefined()
    })
  })

  describe('lastName', () => {
    it('rejects fewer than 2 characters', () => {
      expect(fieldErrors({ ...validData, lastName: 'S' }).lastName).toContain(
        'Last name must be at least 2 characters'
      )
    })

    it('accepts exactly 2 characters (boundary)', () => {
      expect(userDetailsSchema.safeParse({ ...validData, lastName: 'Xu' }).success).toBe(true)
    })

    it('rejects a missing field', () => {
      const { lastName, ...rest } = validData
      expect(fieldErrors(rest).lastName).toBeDefined()
    })
  })

  describe('username', () => {
    it('rejects fewer than 3 characters', () => {
      expect(fieldErrors({ ...validData, username: 'ab' }).username).toContain(
        'Username must be at least 3 characters'
      )
    })

    it('accepts exactly 3 characters (boundary)', () => {
      expect(userDetailsSchema.safeParse({ ...validData, username: 'abc' }).success).toBe(true)
    })

    it('accepts letters, numbers and underscores', () => {
      expect(userDetailsSchema.safeParse({ ...validData, username: 'a_B_9' }).success).toBe(true)
    })

    it('rejects spaces', () => {
      expect(fieldErrors({ ...validData, username: 'ayan saha' }).username).toContain(
        'Username can only contain letters, numbers, and underscores'
      )
    })

    it.each([['ayan.saha'], ['ayan-saha'], ['ayan@01'], ['ayan!']])(
      'rejects the disallowed character in %s',
      (username) => {
        expect(fieldErrors({ ...validData, username }).username).toBeDefined()
      }
    )
  })

  describe('email', () => {
    it.each([['plainaddress'], ['missing@tld'], ['@no-local.com'], ['spaces in@email.com'], ['']])(
      'rejects the invalid email %s',
      (email) => {
        expect(fieldErrors({ ...validData, email }).email).toBeDefined()
      }
    )

    it.each([['a@b.co'], ['ayan.saha@example.com'], ['user+tag@sub.domain.io']])(
      'accepts the valid email %s',
      (email) => {
        expect(userDetailsSchema.safeParse({ ...validData, email }).success).toBe(true)
      }
    )
  })

  describe('password', () => {
    it('rejects fewer than 8 characters', () => {
      expect(fieldErrors({ ...validData, password: '1234567' }).password).toContain(
        'Password must be at least 8 characters'
      )
    })

    it('accepts exactly 8 characters (boundary)', () => {
      expect(userDetailsSchema.safeParse({ ...validData, password: '12345678' }).success).toBe(true)
    })

    it('rejects a missing field', () => {
      const { password, ...rest } = validData
      expect(fieldErrors(rest).password).toBeDefined()
    })
  })

  describe('countryCode', () => {
    it('rejects an empty string', () => {
      expect(fieldErrors({ ...validData, countryCode: '' }).countryCode).toBeDefined()
    })

    it('rejects a code starting with 0', () => {
      expect(fieldErrors({ ...validData, countryCode: '+0' }).countryCode).toContain('Invalid code')
    })

    it('rejects non-digit characters', () => {
      expect(fieldErrors({ ...validData, countryCode: '+1a' }).countryCode).toBeDefined()
    })

    it('rejects a code longer than 4 digits', () => {
      expect(fieldErrors({ ...validData, countryCode: '+12345' }).countryCode).toBeDefined()
    })

    it.each([['+1'], ['1'], ['+91'], ['+1234']])('accepts %s', (countryCode) => {
      expect(userDetailsSchema.safeParse({ ...validData, countryCode }).success).toBe(true)
    })
  })

  describe('phoneNumber', () => {
    it('rejects fewer than 10 digits', () => {
      expect(fieldErrors({ ...validData, phoneNumber: '123456789' }).phoneNumber).toContain(
        'Phone number must be at least 10 digits'
      )
    })

    it('accepts exactly 10 digits (boundary)', () => {
      expect(userDetailsSchema.safeParse({ ...validData, phoneNumber: '1234567890' }).success).toBe(
        true
      )
    })

    it('rejects letters', () => {
      expect(fieldErrors({ ...validData, phoneNumber: '12345abcde' }).phoneNumber).toContain(
        'Please enter digits only'
      )
    })

    it('rejects formatting characters (spaces, dashes, +)', () => {
      expect(fieldErrors({ ...validData, phoneNumber: '123-456-7890' }).phoneNumber).toBeDefined()
    })
  })

  describe('acceptTermsAndConditions', () => {
    it('rejects false', () => {
      expect(
        fieldErrors({ ...validData, acceptTermsAndConditions: false }).acceptTermsAndConditions
      ).toContain('You must accept the Terms of Use')
    })

    it('accepts true', () => {
      expect(
        userDetailsSchema.safeParse({ ...validData, acceptTermsAndConditions: true }).success
      ).toBe(true)
    })

    it('rejects a non-boolean', () => {
      expect(
        fieldErrors({ ...validData, acceptTermsAndConditions: 'yes' }).acceptTermsAndConditions
      ).toBeDefined()
    })
  })

  describe('acceptPrivacyPolicy', () => {
    it('rejects false', () => {
      expect(fieldErrors({ ...validData, acceptPrivacyPolicy: false }).acceptPrivacyPolicy).toContain(
        'You must accept the Privacy Policy'
      )
    })

    it('accepts true', () => {
      expect(userDetailsSchema.safeParse({ ...validData, acceptPrivacyPolicy: true }).success).toBe(
        true
      )
    })
  })

  describe('multiple errors', () => {
    it('reports every invalid field at once', () => {
      const errors = fieldErrors({
        firstName: '',
        lastName: '',
        username: '!!',
        email: 'nope',
        password: '123',
        countryCode: '',
        phoneNumber: 'abc',
        acceptPrivacyPolicy: false,
        acceptTermsAndConditions: false,
      })
      expect(Object.keys(errors).sort()).toEqual(
        [
          'acceptPrivacyPolicy',
          'acceptTermsAndConditions',
          'countryCode',
          'email',
          'firstName',
          'lastName',
          'password',
          'phoneNumber',
          'username',
        ].sort()
      )
    })
  })
})
