import { useCallback, useEffect } from 'react';

export const useDragScroll = <T extends HTMLElement = HTMLDivElement>(ref: React.RefObject<T>) => {
  let position = {
    top: 0, left: 0, x: 0, y: 0,
  };

  const mouseMoveHandler: EventListenerOrEventListenerObject = useCallback((e) => {
    if (!ref.current) return;

    const { clientX, clientY } = e as unknown as MouseEvent;
    // How far the mouse has been moved
    const dx = clientX - position.x;
    const dy = clientY - position.y;

    // Scroll the element
    ref.current.scrollTop = position.top - dy;
    ref.current.scrollLeft = position.left - dx;
  }, [position.left, position.top, position.x, position.y, ref]);

  const mouseUpHandler = useCallback(() => {
    if (!ref.current) return;

    ref.current.style.cursor = 'grab';
    ref.current.style.removeProperty('user-select');

    document.removeEventListener('mousemove', mouseMoveHandler);
    document.removeEventListener('mouseup', mouseUpHandler);
  }, [mouseMoveHandler, ref]);

  const mouseDownHandler: EventListenerOrEventListenerObject = useCallback((e) => {
    if (!ref.current) return;

    const { clientX, clientY } = e as unknown as MouseEvent;

    ref.current.style.cursor = 'grabbing';
    ref.current.style.userSelect = 'none';

    position = {
      left: ref.current.scrollLeft,
      top: ref.current.scrollTop,
      x: clientX,
      y: clientY,
    };

    document.addEventListener('mousemove', mouseMoveHandler);
    document.addEventListener('mouseup', mouseUpHandler);
  }, [mouseMoveHandler, mouseUpHandler]);

  useEffect(() => {
    if (!ref.current) return;

    ref.current.addEventListener('mousedown', mouseDownHandler);
    ref.current.style.cursor = 'grab';

    // eslint-disable-next-line consistent-return
    return () => {
      ref.current?.removeEventListener('dragenter', mouseDownHandler);
    };
  }, [mouseDownHandler, ref]);
};
