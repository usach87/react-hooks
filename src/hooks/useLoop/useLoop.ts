import * as React from 'react';

type TLoopFunction = () => Promise<boolean>;
type TStartLoopedFunction = () => void;
type TStopLoopedFunction = () => void;

/**
  Версия V1
  Источник: `Календарь`
 */
export const useLoop = (func: TLoopFunction, intervalInMs = 1000): [TStartLoopedFunction, TStopLoopedFunction] => {
  const timeoutId = React.useRef<number | null>(null);

  const looped = React.useCallback(async () => {
    const shouldBreak = await func();

    if (!shouldBreak) {
      timeoutId.current = window.setTimeout(() => looped(), intervalInMs);
    }
  }, [func, intervalInMs]);

  const startLoop = React.useCallback(() => {
    timeoutId.current = window.setTimeout(() => looped(), intervalInMs);
  }, [looped, intervalInMs]);

  const stopLoop = React.useCallback(() => {
    if (timeoutId.current) {
      window.clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);

  return [startLoop, stopLoop];
};
