import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import React from 'react'

import EmailLogin from '../EmailLogin'

/**
 * Component tests for EmailLogin (email + password sign-in dialog).
 * See src/features/auth/login/__tests__/README.md for the documented matrix.
 */

const mockCreate = jest.fn()
const mockSetActive = jest.fn()
let mockIsLoaded = true

jest.mock('@clerk/clerk-expo', () => ({
  useSignIn: () => ({
    isLoaded: mockIsLoaded,
    signIn: { create: mockCreate },
    setActive: mockSetActive,
  }),
  // Treat any object with an `errors` array as a Clerk API error.
  isClerkAPIResponseError: (e: any) => Array.isArray(e?.errors),
}))

// Dialog primitives → pass-through so the form content renders inline.
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

function renderEmailLogin() {
  const setOpen = jest.fn()
  const screen = render(<EmailLogin isEmailDialogOpen setIsEmailDialogOpen={setOpen} />)
  return { screen, setOpen }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockIsLoaded = true
})

describe('EmailLogin — validation', () => {
  it('shows field errors and does not call Clerk on empty submit', async () => {
    const { screen } = renderEmailLogin()
    fireEvent.press(screen.getByText('Sign In'))

    expect(await screen.findByText('Email is required')).toBeTruthy()
    expect(screen.getByText('Password must be at least 6 characters')).toBeTruthy()
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('rejects an invalid email format', async () => {
    const { screen } = renderEmailLogin()
    fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'not-an-email')
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'secret123')
    fireEvent.press(screen.getByText('Sign In'))

    expect(await screen.findByText('Invalid email address')).toBeTruthy()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

describe('EmailLogin — sign-in', () => {
  function fillValid(screen: ReturnType<typeof render>) {
    fireEvent.changeText(screen.getByPlaceholderText('Enter your email'), 'ayan@example.com')
    fireEvent.changeText(screen.getByPlaceholderText('Enter your password'), 'secret123')
  }

  it('signs in, activates the session and routes to discover', async () => {
    mockCreate.mockResolvedValueOnce({ status: 'complete', createdSessionId: 'sess_1' })
    const { screen, setOpen } = renderEmailLogin()
    fillValid(screen)
    fireEvent.press(screen.getByText('Sign In'))

    await waitFor(() =>
      expect(mockCreate).toHaveBeenCalledWith({
        identifier: 'ayan@example.com',
        password: 'secret123',
      })
    )
    expect(mockSetActive).toHaveBeenCalledWith({ session: 'sess_1' })
    expect(setOpen).toHaveBeenCalledWith(false)
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/discover')
  })

  it('shows a message when additional verification is required', async () => {
    mockCreate.mockResolvedValueOnce({ status: 'needs_second_factor' })
    const { screen } = renderEmailLogin()
    fillValid(screen)
    fireEvent.press(screen.getByText('Sign In'))

    expect(await screen.findByText('Additional verification is required to sign in.')).toBeTruthy()
    expect(mockSetActive).not.toHaveBeenCalled()
  })

  it('shows a register hint when the account is not found', async () => {
    mockCreate.mockRejectedValueOnce({ errors: [{ code: 'form_identifier_not_found' }] })
    const { screen } = renderEmailLogin()
    fillValid(screen)
    fireEvent.press(screen.getByText('Sign In'))

    expect(
      await screen.findByText('No account found with this email. Please register first.')
    ).toBeTruthy()
  })

  it('surfaces a generic Clerk error message', async () => {
    mockCreate.mockRejectedValueOnce({ errors: [{ longMessage: 'Password is incorrect.' }] })
    const { screen } = renderEmailLogin()
    fillValid(screen)
    fireEvent.press(screen.getByText('Sign In'))

    expect(await screen.findByText('Password is incorrect.')).toBeTruthy()
  })

  it('does nothing while Clerk is not loaded', async () => {
    mockIsLoaded = false
    const { screen } = renderEmailLogin()
    fillValid(screen)
    fireEvent.press(screen.getByText('Sign In'))

    await waitFor(() => expect(screen.getByText('Sign In')).toBeTruthy())
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
