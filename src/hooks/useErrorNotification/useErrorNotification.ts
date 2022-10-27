import { TNotificationProps, NotificationType } from '@product-platform/ui-kit-react';
import { useNotification } from '../useNotification/useNotification';

export type TErrorNotification = Partial<Omit<TNotificationProps, 'type' | 'text'>>;

/**
  Версия V1
  Источник: `БО ОП`
 */
export const useErrorNotification = () => {
  const showNotification = useNotification();

  return (text: string, params: TErrorNotification = {}) => (
    showNotification({
      autoCloseTimeout: 2000,
      closable: true,
      ...params,
      text,
      type: NotificationType.FAIL,
    })
  );
};
