import { useEffect, useState } from 'react';
import { canUseDOM } from '@product-platform/utils/canUseDOM/canUseDOM';
import { EVENT_NAME } from '../enum/eventName';

export type Mouse = {
  /** Mouse position */
  position: {
    /** Client position - browser rendered content */
    client: { x: number | null; y: number | null };
    /** Screen position - monitor */
    screen: { x: number | null; y: number | null };
    /** Page position - viewport */
    page: { x: number | null; y: number | null };
  };
  /** Mouse buttons */
  buttons: {
    left: boolean | null;
    middle: boolean | null;
    right: boolean | null;
    wheelDown: boolean | null;
    wheelUp: boolean | null;
  };
  /** Pressed keys */
  keyboard: {
    ctrl: boolean | null;
    shift: boolean | null;
    alt: boolean | null;
  };
  eventType: string | null;
  selectedElement: SelectedElement;
};

type SelectedElement = {
  /** Mouse relative position to selected element */
  position: {
    x: number | null;
    y: number | null;
    angle: number | null;
  };
  /** Bounding rectangle of selected element */
  boundingRect: {
    left: number | null;
    top: number | null;
    width: number | null;
    height: number | null;
  };
  /** Mouse over selected element */
  isHover: boolean;
};

export type EventType =
  | 'mousemove'
  | 'mousedown'
  | 'mouseup'
  | 'touchmove'
  | 'touchstart'
  | 'wheel';

const initMouse: Mouse = {
  position: {
    client: { x: null, y: null },
    screen: { x: null, y: null },
    page: { x: null, y: null },
  },
  buttons: {
    left: null,
    middle: null,
    right: null,
    wheelDown: null,
    wheelUp: null,
  },
  keyboard: {
    ctrl: null,
    shift: null,
    alt: null,
  },
  eventType: null,
  selectedElement: {
    position: {
      x: null,
      y: null,
      angle: null,
    },
    boundingRect: {
      left: null,
      top: null,
      width: null,
      height: null,
    },
    isHover: false,
  },
};

/**
 * Слушает события курсора
 * @see https://github.com/mkosir/react-hook-mighty-mouse
 */
const useMouseEvents = (
  touchEnabled = true,
  selectedElementId: string | null = null,
  selectedElementOffset: { x: number; y: number } = { x: 0, y: 0 },
): Mouse => {
  const [mouse, setMouse] = useState<Mouse>(initMouse);
  let selectedEl: HTMLElement | null = null;

  const onMouseTouchEvent = (event: Event): void => {
    let clientX: number;
    let clientY: number;
    let screenX: number;
    let screenY: number;
    let pageX: number;
    let pageY: number;

    const buttons = { ...mouse.buttons };

    const mouseEvent = event as MouseEvent;
    const { touches } = event as TouchEvent;
    const touchEvent = touches && touches[0];

    switch (event.type as EventType) {
      case EVENT_NAME.MOUSEMOVE:
      case EVENT_NAME.MOUSEDOWN:
      case EVENT_NAME.MOUSEUP:
      case EVENT_NAME.WHEEL:
        clientX = mouseEvent.clientX;
        clientY = mouseEvent.clientY;
        screenX = mouseEvent.screenX;
        screenY = mouseEvent.screenY;
        pageX = mouseEvent.pageX;
        pageY = mouseEvent.pageY;
        buttons.left = [1, 3, 5, 7].indexOf(mouseEvent.buttons) > -1;
        buttons.right = [2, 3, 6, 7].indexOf(mouseEvent.buttons) > -1;
        buttons.middle = [4, 5, 6, 7].indexOf(mouseEvent.buttons) > -1;
        buttons.wheelDown = (event as WheelEvent).deltaY > 0;
        buttons.wheelUp = (event as WheelEvent).deltaY < 0;
        break;
      case EVENT_NAME.TOUCHMOVE:
      case EVENT_NAME.TOUCHSTART:
        clientX = touchEvent.clientX;
        clientY = touchEvent.clientY;
        screenX = touchEvent.screenX;
        screenY = touchEvent.screenY;
        pageX = touchEvent.pageX;
        pageY = touchEvent.pageY;
        break;
      default:
        throw new Error(`Unknown event triggered "${event.type}"`);
    }

    const selectedElPosition = { ...mouse.selectedElement.position };
    const selectedElBoundingRect = { ...mouse.selectedElement.boundingRect };

    if (selectedEl) {
      const {
        left, top, width, height,
      } = selectedEl.getBoundingClientRect();

      selectedElPosition.x = clientX - left - selectedElementOffset.x;
      selectedElPosition.y = clientY - top - selectedElementOffset.y;
      const rad2Deg = 180 / Math.PI;
      const angleOffset = 180;

      selectedElPosition.angle = Math.atan2(selectedElPosition.y, -selectedElPosition.x) * rad2Deg + angleOffset;
      selectedElBoundingRect.left = left;
      selectedElBoundingRect.top = top;
      selectedElBoundingRect.width = width;
      selectedElBoundingRect.height = height;
    }

    setMouse((prevState) => ({
      ...prevState,
      position: {
        client: { x: clientX, y: clientY },
        screen: { x: screenX, y: screenY },
        page: { x: pageX, y: pageY },
      },
      buttons,
      eventType: event.type,
      selectedElement: {
        ...prevState.selectedElement,
        position: selectedElPosition,
        boundingRect: selectedElBoundingRect,
      },
    }));
  };

  const onLeave = (): void => {
    setMouse(initMouse);
  };

  const onSelectedElementEnter = (): void => {
    const selectedElement = { ...mouse.selectedElement };

    selectedElement.isHover = true;
    setMouse((prevState) => ({
      ...prevState,
      selectedElement,
    }));
  };

  const onSelectedElementLeave = (): void => {
    const selectedElement = { ...mouse.selectedElement };

    selectedElement.isHover = false;
    setMouse((prevState) => ({
      ...prevState,
      selectedElement,
    }));
  };

  const onKeyEvent = (event: Event): void => {
    const { ctrlKey, shiftKey, altKey } = event as MouseEvent;

    setMouse((prevState) => ({
      ...prevState,
      keyboard: {
        ctrl: ctrlKey,
        shift: shiftKey,
        alt: altKey,
      },
    }));
  };

  useEffect(() => {
    if (canUseDOM()) {
      if (selectedElementId) {
        selectedEl = document.getElementById(selectedElementId);
        if (!selectedEl) {
          throw new Error(`Element with id="${selectedElementId}" doesn't exists`);
        }
        selectedEl.addEventListener(EVENT_NAME.MOUSEENTER, onSelectedElementEnter);
        selectedEl.addEventListener(EVENT_NAME.MOUSELEAVE, onSelectedElementLeave);
      }
      document.addEventListener(EVENT_NAME.MOUSEMOVE, onMouseTouchEvent);
      document.addEventListener(EVENT_NAME.MOUSEDOWN, onMouseTouchEvent);
      document.addEventListener(EVENT_NAME.MOUSEUP, onMouseTouchEvent);
      document.addEventListener(EVENT_NAME.WHEEL, onMouseTouchEvent);
      document.addEventListener(EVENT_NAME.MOUSELEAVE, onLeave);
      document.addEventListener(EVENT_NAME.KEYDOWN, onKeyEvent);
      document.addEventListener(EVENT_NAME.KEYUP, onKeyEvent);
      if (touchEnabled) {
        window.addEventListener(EVENT_NAME.TOUCHMOVE, onMouseTouchEvent);
        window.addEventListener(EVENT_NAME.TOUCHSTART, onMouseTouchEvent);
        window.addEventListener(EVENT_NAME.TOUCHEND, onLeave);
      }
    }

    return (): void => {
      if (canUseDOM()) {
        document.removeEventListener(EVENT_NAME.MOUSEMOVE, onMouseTouchEvent);
        document.removeEventListener(EVENT_NAME.MOUSEDOWN, onMouseTouchEvent);
        document.removeEventListener(EVENT_NAME.MOUSEUP, onMouseTouchEvent);
        document.removeEventListener(EVENT_NAME.WHEEL, onMouseTouchEvent);
        document.removeEventListener(EVENT_NAME.MOUSELEAVE, onLeave);
        document.removeEventListener(EVENT_NAME.KEYDOWN, onKeyEvent);
        document.removeEventListener(EVENT_NAME.KEYUP, onKeyEvent);
        if (touchEnabled) {
          window.removeEventListener(EVENT_NAME.TOUCHMOVE, onMouseTouchEvent);
          window.removeEventListener(EVENT_NAME.TOUCHSTART, onMouseTouchEvent);
          window.removeEventListener(EVENT_NAME.TOUCHEND, onLeave);
        }
      }
    };
  }, []);

  return mouse;
};
