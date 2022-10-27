import * as React from 'react';
import { noop } from '@product-platform/utils/noop/noop';

type TScrollInfo = Pick<HTMLElement, 'scrollHeight' | 'scrollTop'>;

interface IUseInfiniteScrollProps {
  /**
   * Этот параметр необходим для того, чтобы знать, когда нужно обновлять позицию скролла при прокрутке вверх.
   * Это нужно для того, чтобы после обновления высоты контейнера на экране отображалась та же часть списка,
   * что и до обновления.
   */
  containerHeightChangingMarker?: any;

  hasMore: boolean;
  isReverse?: boolean;
  loadMore: () => Promise<void>;

  /**
   * Название сохранено для совместимости.
   * TODO: Должно стать:
   * ```
   * scrollContainer: HTMLElement | null;
   * ```
   * либо
   * ```
   * scrollContainer: HTMLElement;
   * ```
   */
  scrollContainerRef: React.MutableRefObject<HTMLElement | null> | HTMLElement | null;

  threshold?: number;
}

interface IUseInfiniteScrollResult {
  isLoading: boolean;
}

/**
  Версия V1
  Источник: `БО ОП`
 */
export function useInfiniteScroll({
  containerHeightChangingMarker,
  hasMore,
  isReverse,
  loadMore,
  scrollContainerRef,
  threshold = 100,
}: IUseInfiniteScrollProps): IUseInfiniteScrollResult {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const prevScrollInfo = React.useRef<TScrollInfo | null>(null);

  const container = (() => {
    if (!scrollContainerRef) {
      return null;
    }

    if ('current' in scrollContainerRef) {
      return scrollContainerRef.current;
    }

    return scrollContainerRef;
  })();

  const checkThatThresholdIsPassed = React.useCallback(({ clientHeight, scrollHeight, scrollTop }: HTMLElement) => {
    if (isReverse) {
      return scrollTop <= threshold;
    }

    return scrollHeight - scrollTop - clientHeight <= threshold;
  }, [isReverse, threshold]);

  const updateScrollPosition = (element: Element) => {
    if (!prevScrollInfo.current) {
      return;
    }

    // eslint-disable-next-line no-param-reassign
    element.scrollTop = element.scrollHeight - prevScrollInfo.current.scrollHeight + prevScrollInfo.current.scrollTop;
  };

  React.useEffect(() => {
    if (!container) {
      setIsLoading(false);

      return noop;
    }

    if (!hasMore) {
      setIsLoading(false);
    }

    const scrollHandler = async (event: any) => {
      const { currentTarget } = event;

      prevScrollInfo.current = {
        scrollHeight: currentTarget.scrollHeight,
        scrollTop: currentTarget.scrollTop,
      };

      if (!hasMore || isLoading) {
        return;
      }

      if (checkThatThresholdIsPassed(currentTarget)) {
        setIsLoading(true);

        try {
          await loadMore();
        } finally {
          setIsLoading(false);
        }
      }
    };

    container.addEventListener('scroll', scrollHandler);

    return () => {
      container.removeEventListener('scroll', scrollHandler);
    };
  }, [container, loadMore, isLoading, hasMore, checkThatThresholdIsPassed]);

  React.useLayoutEffect(() => {
    if (!container) {
      return;
    }

    if (!isReverse) {
      return;
    }

    updateScrollPosition(container);
  }, [container, containerHeightChangingMarker, isReverse]);

  return { isLoading };
}
