import * as React from 'react';

export function useOffsetHeight(nodeRef: React.MutableRefObject<HTMLDivElement | null>) {
  const [offsetHeight, setOffsetHeight] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    if (nodeRef && nodeRef.current) {
      const height = nodeRef.current.offsetHeight;

      setOffsetHeight(height);
    }
  }, [nodeRef]);

  return offsetHeight;
}
