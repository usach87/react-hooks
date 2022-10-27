import { ResizeObserver, ResizeObserverEntry } from '@juggle/resize-observer';
import * as React from 'react';

export type TUseScrollRef = HTMLDivElement | null;

export interface IUseScrollApiRecord {
  className: string;
  direction: number;
  percentage: number;
  total: number;
  value: number;
}

export interface IUseScrollApi {
  x: IUseScrollApiRecord;
  y: IUseScrollApiRecord;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function useResizeObserver(ref: React.Ref<TUseScrollRef>, callback: Function) {
  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ResizeObserver) {
      const resizeObserver = new ResizeObserver(
        (entries: ResizeObserverEntry[]) => {
          callback(entries[0].contentRect);
        },
      );

      if (ref && (ref as any).current) {
        resizeObserver.observe((ref as any).current);
      }

      return () => {
        resizeObserver.disconnect();
      };
    }

    return undefined;
  }, [ref]);
}
