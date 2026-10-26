import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import React from 'react'

import PhoneNumberLogin from '../PhoneNumberLogin'

/**
 * Component tests for PhoneNumberLogin (SMS OTP sign-in with sign-up fallback).
 * See src/features/auth/login/__tests__/README.md for the documented matrix.
 */

const mockSignInCreate = jest.fn()
const mockPrepareFirstFactor = jest.fn()
const mockAttemptFirstFactor = jest.fn()
const mockSetActive = jest.fn()
const mockSignUpCreate = jest.fn()
const mockPreparePhone = jest.fn()
const mockAttemptPhone = jest.fn()

jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: () => ({
    isLoaded: true,
    signIn: {
      create: mockSignInCreate,
      prepareFirstFactor: mockPrepareFirstFactor,
      attemptFirstFactor: mockAttemptFirstFactor,
    },
    setActive: mockSetActive,
  }),
  useSignUp: () => ({
    isLoaded: true,
    signUp: {
      create: mockSignUpCreate,
      preparePhoneNumberVerification: mockPreparePhone,
      attemptPhoneNumberVerification: mockAttemptPhone,
    },
  }),
  isClerkAPIResponseError: (e: any) => Array.isArray(e?.errors),
}))

jest.mock('@/components/ui/dialog', () => {
  const React = require('react')
  const { View } = require('react-native')
  const Passthrough = ({ children }: any) => React.createElement(View, null, children)
  return {
    Dialog: Passthrough,
    DialogContent: Passthrough,
    DialogHeader: Passthrough,
    DialogTitle: Passthrough,
    DialogTrigger: Passthrough,
  }
})

function renderPhoneLogin() {
  const setOpen = jest.fn()
  const screen = render(<PhoneNumberLogin isPhoneDialogOpen setIsPhoneDialogOpen={setOpen} />)
  return { screen, setOpen }
}

/** Enter a valid local number and press "Send Code". */
function submitPhone(screen: ReturnType<typeof render>, number = '5555550100') {
  fireEvent.changeText(screen.getByPlaceholderText('555 000-0000'), number)
  fireEvent.press(screen.getByText('Send Code'))
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('PhoneNumberLogin — phone step', () => {
  it('validates the phone number before calling Clerk', async () => {
    const { screen } = renderPhoneLogin()
    fireEvent.changeText(screen.getByPlaceholderText('555 000-0000'), '')
    fireEvent.press(screen.getByText('Send Code'))

    expect(await screen.findByText('Phone number is required')).toBeTruthy()
    expect(mockSignInCreate).not.toHaveBeenCalled()
  })

  it('starts an SMS sign-in and advances to the OTP step for an existing account', async () => {
    mockSignInCreate.mockResolvedValueOnce({
      supportedFirstFactors: [{ strategy: 'phone_code', phoneNumberId: 'idn_1' }],
    })
    const { screen } = renderPhoneLogin()
    submitPhone(screen)

    await waitFor(() =>
      expect(mockSignInCreate).toHaveBeenCalledWith({ identifier: '+15555550100' })
    )
    expect(mockPrepareFirstFactor).toHaveBeenCalledWith({
      strategy: 'phone_code',
      phoneNumberId: 'idn_1',
    })
    expect(await screen.findByText('Submit OTP')).toBeTruthy()
  })

  it('errors when the account has no phone_code factor', async () => {
    mockSignInCreate.mockResolvedValueOnce({
      supportedFirstFactors: [{ strategy: 'password' }],
    })
    const { screen } = renderPhoneLogin()
    submitPhone(screen)

    expect(
      await screen.findByText('SMS sign-in is not available for this account.')
    ).toBeTruthy()
    expect(mockPrepareFirstFactor).not.toHaveBeenCalled()
  })

  it('falls back to phone sign-up when the number has no account', async () => {
    mockSignInCreate.mockRejectedValueOnce({ errors: [{ code: 'form_identifier_not_found' }] })
    mockSignUpCreate.mockResolvedValueOnce({})
    mockPreparePhone.mockResolvedValueOnce({})
    const { screen } = renderPhoneLogin()
    submitPhone(screen)

    await waitFor(() =>
      expect(mockSignUpCreate).toHaveBeenCalledWith({ phoneNumber: '+15555550100' })
    )
    expect(mockPreparePhone).toHaveBeenCalled()
    expect(await screen.findByText('Submit OTP')).toBeTruthy()
  })
})

describe('PhoneNumberLogin — OTP step', () => {
  async function reachOtpSignIn() {
    mockSignInCreate.mockResolvedValueOnce({
      supportedFirstFactors: [{ strategy: 'phone_code', phoneNumberId: 'idn_1' }],
    })
    const { screen, setOpen } = renderPhoneLogin()
    submitPhone(screen)
    await screen.findByText('Submit OTP')
    return { screen, setOpen }
  }

  it('verifies the code (sign-in), activates the session and routes to discover', async () => {
    mockAttemptFirstFactor.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'sess_p' })
    const { screen, setOpen } = await reachOtpSignIn()

    fireEvent.changeText(screen.getByPlaceholderText('000000'), '123456')
    fireEvent.press(screen.getByText('Submit OTP'))

    await waitFor(() =>
      expect(mockAttemptFirstFactor).toHaveBeenCalledWith({
        strategy: 'phone_code',
        code: '123456',
      })
    )
    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_p' })
    expect(setOpen).toHaveBeenCalledWith(false)
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/discover')
  })

  it('rejects an OTP that is not exactly 6 digits', async () => {
    const { screen } = await reachOtpSignIn()
    fireEvent.changeText(screen.getByPlaceholderText('000000'), '123')
    fireEvent.press(screen.getByText('Submit OTP'))

    expect(
      await screen.findByText('Verification code must be exactly 6 digits')
    ).toBeTruthy()
    expect(mockAttemptFirstFactor).not.toHaveBeenCalled()
  })

  it('verifies via sign-up when the number was newly registered', async () => {
    mockSignInCreate.mockRejectedValueOnce({ errors: [{ code: 'form_identifier_not_found' }] })
    mockSignUpCreate.mockResolvedValueOnce({})
    mockPreparePhone.mockResolvedValueOnce({})
    mockAttemptPhone.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'sess_new' })

    const { screen } = renderPhoneLogin()
    submitPhone(screen)
    await screen.findByText('Submit OTP')

    fireEvent.changeText(screen.getByPlaceholderText('000000'), '654321')
    fireEvent.press(screen.getByText('Submit OTP'))

    await waitFor(() => expect(mockAttemptPhone).toHaveBeenCalledWith({ code: '654321' }))
    expect(mockAttemptFirstFactor).not.toHaveBeenCalled()
    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_new' })
  })
})
