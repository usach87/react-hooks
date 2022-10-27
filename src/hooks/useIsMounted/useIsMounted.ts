import * as React from 'react';

export function useIsMounted(): () => boolean {
  const isMounted = React.useRef(false);

  React.useEffect(() => {
    isMounted.current = true;
  }, []);

  return React.useCallback(() => isMounted.current, []);
}
