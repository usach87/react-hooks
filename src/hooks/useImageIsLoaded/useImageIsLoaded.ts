import * as React from 'react';

export enum IMAGE_IS_LOADED_STATE {
  PENDING = 'PENDING',
  DONE = 'DONE',
  FAIL = 'FAIL'
}

export interface IUseImageIsLoadedParams {
  src?: string;
}

export function useImageIsLoaded(params: IUseImageIsLoadedParams): IMAGE_IS_LOADED_STATE {
  const { src } = params;
  const [isLoaded, setIsLoaded] = React.useState<IMAGE_IS_LOADED_STATE>(IMAGE_IS_LOADED_STATE.PENDING);

  React.useEffect(() => {
    if (!src) {
      return undefined;
    }

    setIsLoaded(IMAGE_IS_LOADED_STATE.PENDING);

    let isActive = true;
    const img = new Image();

    img.src = src;
    img.onload = () => {
      if (!isActive) {
        return;
      }
      setIsLoaded(IMAGE_IS_LOADED_STATE.DONE);
    };
    img.onerror = () => {
      if (!isActive) {
        return;
      }
      setIsLoaded(IMAGE_IS_LOADED_STATE.FAIL);
    };

    return () => {
      isActive = false;
    };
  }, [src]);

  return isLoaded;
}
