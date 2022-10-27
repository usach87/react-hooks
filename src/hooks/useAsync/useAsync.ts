import {
  DependencyList, useCallback, useState, useRef, useEffect,
} from 'react';
import { useMounted } from '../useMounted/useMounted';

type PromiseType<P extends Promise<any>> = P extends Promise<infer T> ? T : never;
type FnReturningPromise = (...args: any[]) => Promise<any>;

export type AsyncState<T> =
  | {
  loading: boolean;
  error?: undefined;
  value?: undefined;
}
  | {
  loading: true;
  error?: Error | undefined;
  value?: T;
}
  | {
  loading: false;
  error: Error;
  value?: undefined;
}
  | {
  loading: false;
  error?: undefined;
  value: T;
};

type StateFromFnReturningPromise<T extends FnReturningPromise> = AsyncState<PromiseType<ReturnType<T>>>;

export type AsyncFnReturn<T extends FnReturningPromise = FnReturningPromise> = [StateFromFnReturningPromise<T>, T];

function useAsyncFn<T extends FnReturningPromise>(
  fn: T,
  deps: DependencyList = [],
  initialState: StateFromFnReturningPromise<T> = { loading: false },
): AsyncFnReturn<T> {
  const lastCallId = useRef(0);
  const isMounted = useMounted();
  const [state, set] = useState<StateFromFnReturningPromise<T>>(initialState);

  const callback = useCallback((...args: Parameters<T>): ReturnType<T> => {
    lastCallId.current += 1;

    const callId = lastCallId.current;

    set((prevState) => ({ ...prevState, loading: true }));

    return fn(...args).then(
      (value) => {
        if (isMounted()) {
          if (callId === lastCallId.current) {
            set({ value, loading: false });
          }
        }

        return value;
      },
      (error) => {
        if (isMounted()) {
          if (callId === lastCallId.current) {
            set({ error, loading: false });
          }
        }

        return error;
      },
    ) as ReturnType<T>;
  }, deps);

  return [state, (callback as unknown) as T];
}

export function useAsync<T extends FnReturningPromise>(fn: T, deps: DependencyList = []): any {
  const [state, callback] = useAsyncFn(fn, deps, {
    loading: true,
  });

  useEffect(() => {
    callback();
  }, [callback]);

  return state;
}
