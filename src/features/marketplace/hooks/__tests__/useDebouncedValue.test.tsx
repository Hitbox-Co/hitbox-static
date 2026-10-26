import { act, renderHook } from '@testing-library/react-native'

import { useDebouncedValue } from '../useDebouncedValue'

/**
 * Unit tests for the marketplace useDebouncedValue hook (search debounce).
 * See src/features/marketplace/__tests__/README.md for the documented matrix.
 */

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('useDebouncedValue', () => {
  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a'))
    expect(result.current).toBe('a')
  })

  it('updates only after the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 350), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'b' })
    act(() => jest.advanceTimersByTime(349))
    expect(result.current).toBe('a')

    act(() => jest.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })

  it('resets the timer on rapid changes (only the last wins)', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'ab' })
    act(() => jest.advanceTimersByTime(200))
    rerender({ v: 'abc' })
    act(() => jest.advanceTimersByTime(200))
    expect(result.current).toBe('a')

    act(() => jest.advanceTimersByTime(100))
    expect(result.current).toBe('abc')
  })
})
