import * as React from 'react';

type TUseToggleApi = {
  isOn: boolean;
  toggle(): void;
  switchOn(): void;
  switchOff(): void;
}

export function useToggle(defaultValue: boolean): TUseToggleApi {
  const [isOn, setIsOn] = React.useState<boolean>(defaultValue);

  const toggle = React.useCallback(() => setIsOn((prev) => !prev), []);
  const switchOn = React.useCallback(() => setIsOn(true), []);
  const switchOff = React.useCallback(() => setIsOn(false), []);

  return {
    isOn,
    toggle,
    switchOn,
    switchOff,
  };
}
