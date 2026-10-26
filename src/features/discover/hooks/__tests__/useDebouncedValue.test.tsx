import { act, renderHook } from '@testing-library/react-native'

import { useDebouncedValue } from '../useDebouncedValue'

/**
 * Unit tests for the useDebouncedValue hook.
 * See src/features/discover/__tests__/README.md for the documented matrix.
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
    expect(result.current).toBe('a') // not yet

    act(() => {
      jest.advanceTimersByTime(349)
    })
    expect(result.current).toBe('a') // still not

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(result.current).toBe('b') // now
  })

  it('resets the timer on rapid successive changes (only the last wins)', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'ab' })
    act(() => jest.advanceTimersByTime(200))
    rerender({ v: 'abc' })
    act(() => jest.advanceTimersByTime(200))
    // 400ms total elapsed but only 200ms since the last change → unchanged
    expect(result.current).toBe('a')

    act(() => jest.advanceTimersByTime(100))
    expect(result.current).toBe('abc')
  })

  it('honours a custom delay', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 1000), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'b' })
    act(() => jest.advanceTimersByTime(500))
    expect(result.current).toBe('a')

    act(() => jest.advanceTimersByTime(500))
    expect(result.current).toBe('b')
  })
})
