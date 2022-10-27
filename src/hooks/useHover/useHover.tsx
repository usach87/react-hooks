import * as React from 'react';

export interface Config {
  delayEnter?: number;
  delayLeave?: number;
  hideOnScroll?: boolean;
}

interface CallbackConfig extends Config {
  onShow?: () => void;
  onHide?: () => void;
}

type HoverProps = {
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onTouchStart: () => void;
  onTouchMove: () => void;
  onTouchEnd: () => void;
};

type TimeoutState = 'entering' | 'leaving' | null;

export function useHover(config?: CallbackConfig | Config): readonly [boolean, HoverProps] | HoverProps {
  const {
    delayEnter = 0,
    delayLeave = 0,
    hideOnScroll = true,
    onShow,
    onHide,
  } = (config || {}) as CallbackConfig;

  const [show, setShow] = React.useState(false);
  const timeoutRef = React.useRef<number | null>(null);

  const timeoutState = React.useRef<TimeoutState>(null);

  const hasTouchMoved = React.useRef<boolean>(false);

  const handleShowHide = (isShown: boolean) => {
    if (isShown) {
      if (onShow) {
        onShow();
      }

      setShow(true);

      return;
    }

    if (onHide) {
      onHide();
    }

    setShow(false);
  };

  function onMouseEnter() {
    // if was leaving, stop leaving
    if (timeoutState.current === 'leaving' && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      timeoutState.current = null;
    }

    if (show) {
      return;
    }

    timeoutState.current = 'entering';
    timeoutRef.current = setTimeout(() => {
      handleShowHide(true);
      timeoutRef.current = null;
      timeoutState.current = null;
    }, delayEnter) as any;
  }

  function onMouseLeave() {
    // if was waiting for entering,
    // clear timeout
    if (timeoutState.current === 'entering' && timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!show) {
      return;
    }

    timeoutState.current = 'leaving';
    timeoutRef.current = setTimeout(() => {
      handleShowHide(false);
      timeoutRef.current = null;
    }, delayLeave) as any;
  }

  // make sure to clear timeout on unmount
  React.useEffect(() => {
    const to = timeoutRef.current;

    function clear() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    function onScroll() {
      if (show && hideOnScroll) {
        clear();
        handleShowHide(false);
      }
    }

    function onTouchEnd() {
      if (show) {
        clear();
        handleShowHide(false);
      }
    }

    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('touchend', onTouchEnd, true);

    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('touchend', onTouchEnd, true);

      if (to) {
        clearTimeout(to);
      }
    };
  }, [show, hideOnScroll]);

  const hoverProps: HoverProps = {
    onMouseEnter,
    onMouseLeave,
    onTouchStart: () => {
      hasTouchMoved.current = false;
    },
    onTouchMove: () => {
      hasTouchMoved.current = true;
    },
    onTouchEnd: () => {
      if (!hasTouchMoved.current && !show) {
        handleShowHide(true);
      }

      hasTouchMoved.current = false;
    },
  };

  if (onShow) {
    return hoverProps;
  }

  return [show, hoverProps] as const;
}
