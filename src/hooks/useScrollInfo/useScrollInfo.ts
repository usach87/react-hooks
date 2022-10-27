import * as React from 'react';
import { IUseScrollApi, TUseScrollRef, useResizeObserver } from '../useResizeObserver/useResizeObserver';

const EVT_SCROLL = 'scroll';
const EVT_RESIZE = 'resize';
const msThrottle = 100;
const isEdge = typeof window !== 'undefined'
  && typeof navigator !== 'undefined'
  && /Edge\/\d./i.test(window.navigator.userAgent);

// eslint-disable-next-line @typescript-eslint/ban-types
function throttle(func: Function, wait: number) {
  let args: any;
  let result: any;
  let context: any;
  let timeout: number | null = null;
  let previous = 0;

  const later = () => {
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) {
      args = null;
      context = null;
    }
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return function (...params) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    context = this;
    args = params;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) {
        args = null;
        context = null;
      }
    } else if (!timeout) {
      timeout = (setTimeout(later, remaining) as unknown) as number;
    }

    return result;
  };
}

export function useScrollInfo() {
  const [scroll, setScroll] = React.useState<IUseScrollApi>({
    x: {
      className: '',
      direction: 0,
      percentage: 0,
      total: 0,
      value: 0,
    },
    y: {
      className: '',
      direction: 0,
      percentage: 0,
      total: 0,
      value: 0,
    },
  });
  const ref = React.useRef<TUseScrollRef>(null);
  const previousScroll = React.useRef<IUseScrollApi | null>(null);

  function update() {
    const element: any = ref.current;
    let maxY = element.scrollHeight - element.clientHeight;
    const maxX = element.scrollWidth - element.clientWidth;

    // Edge has a bug where scrollHeight is 1px bigger than clientHeight when there's no scroll.
    if (isEdge && maxY === 1 && element.scrollTop === 0) {
      maxY = 0;
    }

    const percentageY = maxY !== 0 ? element.scrollTop / maxY : 0;
    const percentageX = maxX !== 0 ? element.scrollLeft / maxX : 0;

    let classNameY = 'scroll-y-initial';

    if (percentageY === 0) {
      classNameY = 'scroll-y-start';
    } else if (percentageY === 1) {
      classNameY = 'scroll-y-end';
    } else if (percentageY) {
      classNameY = 'scroll-y-middle';
    }

    let classNameX = 'scroll-x-initial';

    if (percentageX === 0) {
      classNameX = 'scroll-x-start';
    } else if (percentageX === 1) {
      classNameX = 'scroll-x-end';
    } else if (percentageX) {
      classNameX = 'scroll-x-middle';
    }

    const previous = previousScroll.current;

    const api: IUseScrollApi = {
      x: {
        className: classNameX,
        direction: previous
          ? Math.sign(element.scrollLeft - previous.x.value)
          : 0,
        percentage: percentageX,
        total: maxX,
        value: element.scrollLeft,
      },
      y: {
        className: classNameY,
        direction: previous
          ? Math.sign(element.scrollTop - previous.y.value)
          : 0,
        percentage: percentageY,
        total: maxY,
        value: element.scrollTop,
      },
    };

    previousScroll.current = api;
    setScroll(api);
  }

  useResizeObserver(ref, () => {
    update();
  });

  const throttledUpdate = throttle(update, msThrottle);

  const setRef = React.useCallback((node: TUseScrollRef) => {
    if (node) {
      // When the ref is first set (after mounting)
      node.addEventListener(EVT_SCROLL, throttledUpdate);
      if (!(window as any).ResizeObserver) {
        window.addEventListener(EVT_RESIZE, throttledUpdate); // Fallback if ResizeObserver is not available
      }
      ref.current = node;
      throttledUpdate(); // initialization
    } else if (ref.current) {
      // When unmounting
      ref.current.removeEventListener(EVT_SCROLL, throttledUpdate);
      if (!(window as any).ResizeObserver) {
        window.removeEventListener(EVT_RESIZE, throttledUpdate);
      }
    }
  }, []);

  return [scroll, setRef, ref];
}
