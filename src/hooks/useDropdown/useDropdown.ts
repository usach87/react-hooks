import { useState, useEffect, useCallback } from 'react';
import { EVENT_NAME } from '../enum/eventName';

type TUseDropdownApi = (
  refTrigger: any,
  refDropdown: any,
) => [boolean, (toggleState?: any) => void];

/**
 * Дропдаун, нажатие на escape и вне дропдауна считается закрытием
 * @example

 function example(props) {
  const refTrigger = useRef(null);
  const refDropdown = useRef(null);
  const [isOpened, toggleIsOpened] = useDropdown(refDropdown, refTrigger);

  return (
    <>
      <div ref={refTrigger} onClick={() => toggleIsOpened()}>
        <span>{isOpened ? '▲' : '▼'}</span>
      </div>
      <div ref={refDropdown} hidden={isOpened}>
        <div>Greece</div>
        <div>Poland</div>
        <div>Spain</div>
      </div>
    </>
  );
}
 */
export const useDropdown: TUseDropdownApi = (refTrigger, refDropdown) => {
  refTrigger = refTrigger.current;
  refDropdown = refDropdown.current;

  const [isOpened, setIsOpened] = useState(false);

  const toggleIsOpened = useCallback((toggleState) => {
    setIsOpened(toggleState !== undefined ? Boolean(toggleState) : !isOpened);
  }, [isOpened]);

  const handleWindowClick = useCallback((evt) => {
    const clickOnAction = refDropdown && (evt.target === refDropdown || refDropdown.contains(evt.target));
    const clickOnDrop = refTrigger && (evt.target === refTrigger || refTrigger.contains(evt.target));

    if (!clickOnAction && !clickOnDrop && isOpened === true) {
      toggleIsOpened(false);
    }
  }, [isOpened]);

  const handleEscape = useCallback((evt) => {
    if (evt.keyCode === 27 && isOpened === true) {
      toggleIsOpened(false);
    }
  }, [isOpened]);

  useEffect(() => {
    window.addEventListener(EVENT_NAME.CLICK, handleWindowClick);

    return () => window.removeEventListener(EVENT_NAME.CLICK, handleWindowClick);
  });

  useEffect(() => {
    window.addEventListener(EVENT_NAME.KEYUP, handleEscape);

    return () => window.removeEventListener(EVENT_NAME.KEYUP, handleEscape);
  });

  return [isOpened, toggleIsOpened];
};
