import { useState, useEffect } from 'react';
import { canUseDOM } from '@product-platform/utils/canUseDOM/canUseDOM';

const TRANSPARENT_BASE64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

enum STATUS {
  PENDING = 'pending',
  DONE = 'done',
  FAIL = 'fail',
}

export interface IUseImageState {
  height: number;
  src?: string;
  status: STATUS;
  width: number;
}

const defaultState = {
  height: 0,
  src: TRANSPARENT_BASE64,
  status: STATUS.PENDING,
  width: 0,
};

/**
 * Эффект, вызываемый после фактической загрузки переданного изображения
 */
export const useImage = (url: string, crossOrigin = false): any => {
  const [state, setState] = useState<IUseImageState>(defaultState);
  const { src, status } = state;

  useEffect(
    () => {
      if (!canUseDOM()) {
        return undefined;
      }

      if (!url) {
        return undefined;
      }

      const img = document.createElement('img');

      function onload() {
        setState({
          height: img.height,
          src: img.src,
          status: STATUS.DONE,
          width: img.width,
        });
      }

      function onerror() {
        setState({
          height: 0,
          src: TRANSPARENT_BASE64,
          status: STATUS.FAIL,
          width: 0,
        });
      }

      img.addEventListener('load', onload);
      img.addEventListener('error', onerror);
      if (crossOrigin) {
        img.crossOrigin = 'true';
      }
      img.src = url;

      return function cleanup() {
        img.removeEventListener('load', onload);
        img.removeEventListener('error', onerror);
        setState(defaultState);
      };
    },
    [url, crossOrigin],
  );

  return [src, state];
};
