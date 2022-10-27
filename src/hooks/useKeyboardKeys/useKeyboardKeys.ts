import { useEffect, useCallback } from 'react';
import { EVENT_NAME } from '../enum/eventName';

type THook = (
  keys: string[],
  callback: (evt: KeyboardEvent) => void,
  deps: any[]
) => void;

const isSetEqual = (setA: Set<string>, setB: Set<string>): boolean => setA.size === setB.size && !Array.from(setA).some((v) => !setB.has(v));

/**
 * Слушает нажатия клавиш, отстреливает при нужной последовательности
 * @example useKeyboardKeys([KEYBOARD_KEY.ESCAPE], () => console.info('esc pressed'), [])
 * @example useKeyboardKeys([KEYBOARD_KEY.CONTROL, 'z'], () => console.info('ctrl + z pressed'), []);
 */
export const useKeyboardKeys: THook = (keys, callback, deps) => {
  const memoizedCallback = useCallback(callback, deps || []);
  const targetKeys: Set<string> = new Set(keys.map((key) => key.toLowerCase()));
  const pressedKeys: Set<string> = new Set();

  const handleKeyDown = (evt: KeyboardEvent) => {
    // console.info(evt.key, evt.keyCode);
    pressedKeys.add(evt.key.toLowerCase());

    if (isSetEqual(pressedKeys, targetKeys)) {
      memoizedCallback(evt);
    }
  };

  const handleKeyUp = (evt: KeyboardEvent) => {
    pressedKeys.delete(evt.key.toLowerCase());
  };

  useEffect(() => {
    window.addEventListener(EVENT_NAME.KEYDOWN, handleKeyDown as EventListener);
    window.addEventListener(EVENT_NAME.KEYUP, handleKeyUp as EventListener);

    return () => {
      window.removeEventListener(EVENT_NAME.KEYDOWN, handleKeyDown as EventListener);
      window.removeEventListener(EVENT_NAME.KEYUP, handleKeyUp as EventListener);
    };
  }, [memoizedCallback]);
};
