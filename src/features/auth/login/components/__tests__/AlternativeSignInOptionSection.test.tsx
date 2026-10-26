import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { router } from 'expo-router'
import React from 'react'

import AlternativeSignInOptionSection from '../AlternativeSignInOptionSection'

/**
 * Component tests for the Google/Apple SSO buttons.
 * See src/features/auth/login/__tests__/README.md for the documented matrix.
 * Note: the external browser redirect itself is out of scope — startSSOFlow
 * is mocked, so only the app-side handling of its result is asserted.
 */

const mockStartSSOFlow = jest.fn()

jest.mock('@clerk/clerk-expo', () => ({
  useSSO: () => ({ startSSOFlow: mockStartSSOFlow }),
  isClerkAPIResponseError: (e: any) => Array.isArray(e?.errors),
}))

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  warmUpAsync: jest.fn(),
  coolDownAsync: jest.fn(),
}))

jest.mock('expo-linking', () => ({
  createURL: jest.fn(() => 'exp://127.0.0.1:8081/--/'),
}))

// Icon components are plain SVGs — stub to nothing.
jest.mock('@/components/icons/GoogleIcon', () => ({ GoogleSvg: () => null }))
jest.mock('@/components/icons/AppleIcon', () => ({ AppleSvg: () => null }))

beforeEach(() => jest.clearAllMocks())

describe('AlternativeSignInOptionSection', () => {
  it('renders the Google and Apple buttons', () => {
    const screen = render(<AlternativeSignInOptionSection />)
    expect(screen.getByText('Continue with Google')).toBeTruthy()
    expect(screen.getByText('Continue with Apple')).toBeTruthy()
  })

  it('starts the Google SSO flow and routes on a created session', async () => {
    mockStartSSOFlow.mockResolvedValueOnce({
      createdSessionId: 'sess_g',
      setActive: jest.fn(),
    })
    const screen = render(<AlternativeSignInOptionSection />)
    fireEvent.press(screen.getByText('Continue with Google'))

    await waitFor(() =>
      expect(mockStartSSOFlow).toHaveBeenCalledWith(
        expect.objectContaining({ strategy: 'oauth_google' })
      )
    )
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/discover')
  })

  it('starts the Apple SSO flow with the apple strategy', async () => {
    mockStartSSOFlow.mockResolvedValueOnce({ createdSessionId: null })
    const screen = render(<AlternativeSignInOptionSection />)
    fireEvent.press(screen.getByText('Continue with Apple'))

    await waitFor(() =>
      expect(mockStartSSOFlow).toHaveBeenCalledWith(
        expect.objectContaining({ strategy: 'oauth_apple' })
      )
    )
    // Cancelled / no session → no navigation.
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('does not navigate when the flow returns no session (cancelled)', async () => {
    mockStartSSOFlow.mockResolvedValueOnce({ createdSessionId: null, setActive: jest.fn() })
    const screen = render(<AlternativeSignInOptionSection />)
    fireEvent.press(screen.getByText('Continue with Google'))

    await waitFor(() => expect(mockStartSSOFlow).toHaveBeenCalled())
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('shows an error message when the SSO flow throws', async () => {
    mockStartSSOFlow.mockRejectedValueOnce(new Error('SSO failed'))
    const screen = render(<AlternativeSignInOptionSection />)
    fireEvent.press(screen.getByText('Continue with Google'))

    expect(await screen.findByText('SSO failed')).toBeTruthy()
  })
})
