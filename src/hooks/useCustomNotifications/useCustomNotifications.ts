import * as React from 'react';
import { TNotificationProps, NotificationType } from '@product-platform/ui-kit-react';
import { useNotification } from '../useNotification/useNotification';

export type TNotificationParams = Partial<Omit<TNotificationProps, 'type' | 'text'>>

/**
  Версия V1
  Источник: `БО А360`, `БО ОП`, `БО ГЛ`, `Кросс-линк`, `ЛК`, `Календарь`
 */
export const useCustomNotificationsV1 = (defaultParams: TNotificationParams = {}) => {
  const showNotification = useNotification();

  const createNotificationFunction = (type: NotificationType) => (
    (text: React.ReactNode, params: TNotificationParams = {}) => (
      showNotification({
        autoCloseTimeout: 2000,
        closable: true,
        ...defaultParams,
        ...params,
        text,
        type,
      })
    )
  );

  return {
    showError: createNotificationFunction(NotificationType.FAIL),
    showInfo: createNotificationFunction(NotificationType.INFO),
    showSuccess: createNotificationFunction(NotificationType.DONE),
    showWarning: createNotificationFunction(NotificationType.WARN),
  };
};

/**
  Версия V1
  Источник: `access-mapper`
 */
export const useCustomNotificationsV2 = () => {
  const showNotification = useNotification();

  return React.useMemo(() => {
    const createNotificationFunction = (type: NotificationType) => (
      (text: string, params: Partial<Omit<TNotificationProps, 'type' | 'text'>> = {}) => (
        showNotification({
          autoCloseTimeout: 2000,
          closable: true,
          ...params,
          text,
          type,
        })
      )
    );

    return {
      showError: createNotificationFunction(NotificationType.FAIL),
      showInfo: createNotificationFunction(NotificationType.INFO),
      showSuccess: createNotificationFunction(NotificationType.DONE),
      showWarning: createNotificationFunction(NotificationType.WARN),
    };
  }, [showNotification]);
};
