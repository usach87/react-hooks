import { renderHook } from '@testing-library/react-hooks';
import { useIsMounted } from './useIsMounted';

describe('useIsMounted', () => {
  test('should return true after first render', () => {
    const { result } = renderHook(() => useIsMounted());

    expect(result.current()).toEqual(true);
  });

  test('should return true after second render', () => {
    const { result, rerender } = renderHook(() => useIsMounted());

    expect(result.current()).toEqual(true);

    rerender();

    expect(result.current()).toEqual(true);
  });
});
