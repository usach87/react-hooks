import * as React from 'react';
import { APIErrorMessage } from '@product-platform/utils/APIErrorMessage/APIErrorMessage';
import { useCustomNotificationsV1 } from '../useCustomNotifications/useCustomNotifications';

/**
  Версия V1
  Источник: `БО А360`
 */

export type TFetchError = any;

interface IUseFetchConfig {
  data?: any;
  prepareErrorMessage?: (error: TFetchError) => React.ReactNode;
  onSuccess?: (response?: any) => void;
  onError?: (error?: TFetchError) => void;
}

export function useFetchV1<
  TPayload = any,
  TResponse = any,
>(
  actionCreator: (payload?: TPayload) => any,
  dispatch: React.Dispatch<any>,
  {
    data,
    prepareErrorMessage,
    onSuccess,
    onError,
  }: IUseFetchConfig,
) {
  const { showError } = useCustomNotificationsV1();

  const [isFetching, setIsFetching] = React.useState<boolean>(false);
  const [isError, setIsError] = React.useState<boolean>(false);
  const [result, setResult] = React.useState<TResponse>();

  const doFetch = async (payload: TPayload) => {
    setIsFetching(true);
    setIsError(false);

    try {
      const response = await dispatch(actionCreator(payload)) as unknown as TResponse;

      setResult(response);
      if (onSuccess) {
        onSuccess(response);
      }

      return response;
    } catch (error) {
      setIsError(true);
      showError(prepareErrorMessage ? prepareErrorMessage(error) : APIErrorMessage.getMessage(error));
      if (onError) {
        onError(error);
      }
    } finally {
      setIsFetching(false);
    }

    return null;
  };

  return {
    isFetching,
    isError,
    result,
    fetch: () => doFetch(data),
  };
}
