import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { canUseDOM } from '@product-platform/utils/canUseDOM/canUseDOM';
import { Notification, TNotificationProps } from '@product-platform/ui-kit-react';

export { NotificationType } from '@product-platform/ui-kit-react';

const notificationContainerId = 'notifications-root';

export type TShowNotificationFunction = (params: TNotificationProps) => (() => void);

export const useNotification = (): TShowNotificationFunction => {
  let rootNode: HTMLDivElement | null = null;

  if (canUseDOM()) {
    rootNode = document.querySelector(`#${notificationContainerId}`);

    if (!rootNode) {
      rootNode = document.createElement('div');
      rootNode.setAttribute('id', notificationContainerId);
      rootNode.classList.add('notification-root');
      document.body.appendChild(rootNode);
    }
  }

  return (params: TNotificationProps): () => void => {
    if (canUseDOM()) {
      const node = document.createElement('div');

      const closeFunction = () => {
        ReactDOM.unmountComponentAtNode(node);
        node.remove();
        if (params.onClose) {
          params.onClose();
        }
      };

      if (rootNode) {
        rootNode.appendChild(node);
      }
      ReactDOM.render(
        <Notification {...params} onClose={closeFunction} />,
        node,
      );

      return closeFunction;
    }

    return () => {};
  };
};
