import { RefObject, useEffect, useRef } from 'react';

const MOUSEDOWN = 'mousedown';
const TOUCHSTART = 'touchstart';

type HandledEvents = [typeof MOUSEDOWN, typeof TOUCHSTART];
type HandledEventsType = HandledEvents[number];
type PossibleEvent = {
  [Type in HandledEventsType]: HTMLElementEventMap[Type];
}[HandledEventsType];
type Handler = (event: PossibleEvent) => void;
const events: HandledEvents = [MOUSEDOWN, TOUCHSTART];

const useLatest = <T>(value: T) => {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  });

  return ref;
};

/**
 * ATTENTION:
 * С этим хуком возможны проблемы при следующих условиях:
 * 1. На элемент внутри `ref` навешен обработчик на такое же событие, на которое завязывается и сам хук,
 * например, mousedown:
 * `const events: HandledEvents = [MOUSEDOWN, TOUCHSTART];`.
 *
 * 2. В этом обработчике(смотри пунтк 1) делается скрытие (удаление из DOM-а) самого элемента, либо контейнера в
 * котором находится этот элемент.
 *
 * При этих условиях возникает racing condition, потому что в хуке по событию из списка `events`осуществляется
 * следующая проверка: `ref.current.contains(event.target as Node)`, но на момент этой проверки собственный handler
 * элемента (event.target) уже может выполнить удаление элемента и DOM-а.
 *
 * @see https://jira.action-media.ru/browse/PLAT-6056
 */

/**
  Версия V2
  Источник: `БО ОП`
 */
export function useOnClickOutsideV2(ref: RefObject<HTMLElement>, handler: Handler | null) {
  const handlerRef = useLatest(handler);

  useEffect(() => {
    if (!handler) {
      return;
    }

    const listener = (event: PossibleEvent) => {
      if (!ref.current || !handlerRef.current || ref.current.contains(event.target as Node)) {
        return;
      }

      handlerRef.current(event);
    };

    events.forEach((event) => {
      document.addEventListener(event, listener, false);
    });

    // eslint-disable-next-line consistent-return
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, listener, false);
      });
    };
  }, [ref, handlerRef]);
}
