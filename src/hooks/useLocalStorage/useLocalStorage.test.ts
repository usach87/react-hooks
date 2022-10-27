import { renderHook } from '@testing-library/react-hooks';
import { useLocalStorage } from './useLocalStorage';

const key = 'testKey';
const value = 'testValue';

describe('useLocalStorage', () => {
  test('should return provided value', () => {
    const { result } = renderHook(() => useLocalStorage(key, value));

    const [storedValue] = result.current;

    expect(storedValue).toEqual(value);
  });

  test('should provide setter that sets localStorage stringified value', () => {
    const newTestValue = 'some new test value';
    const { result } = renderHook(() => useLocalStorage(key, value));
    const [storedValue, setStoredValue] = result.current;

    setStoredValue(newTestValue);

    expect(localStorage.getItem(key)).toEqual(JSON.stringify(newTestValue));
    expect(result.current[0]).toEqual(newTestValue);
  });
});
