import * as React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { useInfiniteScroll } from './useInfiniteScroll';

describe('useInfiniteScroll', () => {
  test('should return isLoading = false when hasMore = true but scrollContainerRef = null', () => {
    const { result } = renderHook(() => useInfiniteScroll({
      hasMore: true,
      loadMore: async () => undefined,
      scrollContainerRef: null,
    }));

    const { isLoading } = result.current;

    expect(isLoading).toEqual(false);
  });

  test('should return isLoading = false when hasMore = true but empty ref is passed', () => {
    const containerRef = React.createRef<HTMLElement>();

    const { result } = renderHook(() => useInfiniteScroll({
      hasMore: true,
      loadMore: jest.fn(),
      scrollContainerRef: containerRef,
    }));

    const { isLoading } = result.current;

    expect(isLoading).toEqual(false);
  });

  test('should return isLoading = false when scrollContainerRef equals element but hasMore = false', () => {
    const container = document.createElement('div');

    const { result } = renderHook(() => useInfiniteScroll({
      hasMore: false,
      loadMore: jest.fn(),
      scrollContainerRef: container,
    }));

    const { isLoading } = result.current;

    expect(isLoading).toEqual(false);
  });
});
