import * as React from 'react';
import { noop } from '@product-platform/utils/noop/noop';

/**
  Версия V1
  Источник: `БО ОП`
 */
export function useIsScrollable(nodeRef: React.MutableRefObject<HTMLDivElement | null>, deps?: React.DependencyList) {
  const [isScrollable, setIsScrollable] = React.useState<boolean | undefined>(undefined);
  const [resizingCount, setResizingCount] = React.useState<number>(0);

  React.useEffect(() => {
    if (!nodeRef.current) {
      return noop;
    }

    const { current: node } = nodeRef;

    const resizeObserver = new ResizeObserver(() => {
      // TODO: Добавить debounce?
      setResizingCount((prevState) => prevState + 1);
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.unobserve(node);
    };
  }, [nodeRef]);

  React.useEffect(() => {
    if (!nodeRef.current) {
      setIsScrollable(undefined);

      return;
    }

    const { offsetHeight, scrollHeight } = nodeRef.current;

    if (offsetHeight === 0 || scrollHeight === 0) {
      setIsScrollable(undefined);

      return;
    }

    setIsScrollable(scrollHeight > offsetHeight);
  }, [resizingCount, nodeRef, ...(deps || [])]);

  return isScrollable;
}
