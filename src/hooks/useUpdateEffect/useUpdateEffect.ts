import {
  useRef, useEffect, DependencyList, EffectCallback,
} from 'react';

/**
 * Отстреливает после первого рендера компонента
 */
export const useUpdateEffect = (fn: EffectCallback, deps: DependencyList): void => {
  const isMount = useRef(true);

  useEffect(() => {
    if (isMount.current) {
      isMount.current = false;
    } else {
      fn();
    }
  }, [deps]);
};
