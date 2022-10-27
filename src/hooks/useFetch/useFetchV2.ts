import * as React from 'react';

/**
  Версия V2
  Источник: `cross-link`
 */
export function useFetchV2(actionCreator: () => React.Dispatch<any>) {
  const [isFetching, setIsFetching] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    async function doFetch() {
      setIsFetching(true);
      setIsError(false);

      try {
        await actionCreator();
      } catch (error) {
        setIsError(true);
      } finally {
        setIsFetching(false);
      }
    }

    doFetch();
  }, [actionCreator]);

  return { isFetching, isError };
}
