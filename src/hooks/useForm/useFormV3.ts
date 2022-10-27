// tslint:disable:strict-type-predicates no-any
import * as React from 'react';
import { TAnyDict } from './useFormV1';

export interface IUseFormV3API<T> {
  formData: T;
  formErrors: TAnyDict;
  isFormDirty: boolean;
  isFormValid: boolean;
  onFormSubmit(evt: React.SyntheticEvent): void;
  updateFormData(property: string, value: any): void;
}

export interface IUseFormV3State<T> {
  formData: T;
  formErrors: TAnyDict;
  isFormDirty: boolean;
  isFormValid: boolean;
}

export type TPropertyValidatorV3 = (value: any, formData: any) => boolean;

export interface IUseFormV3Props<T> {
  initialFormData: Partial<T>;
  validateFormData: { [key: string]: TPropertyValidatorV3 };
  onSubmit(formState: IUseFormV3State<T>): void;
  onChange?(formData: T): void;
}

/**
  Версия V3
  Источник: `Календарь`
 */
export function useFormV3<T>(props: IUseFormV3Props<T>): IUseFormV3API<T> {
  const {
    initialFormData = {},
    validateFormData = {},
    onSubmit,
    onChange,
  } = props;

  const [formData, setFormData] = React.useState<T>(initialFormData as T);
  const [formErrors, setFormErrors] = React.useState<TAnyDict>({});
  const [isFormValid, setIsFormValid] = React.useState(true);
  const [isFormDirty, setFormIsDirty] = React.useState(false);

  const validate = React.useCallback(() => {
    const errors: TAnyDict = {};
    let hasErrors = false;

    Object.keys(validateFormData).forEach((property: string) => {
      const isValid = validateFormData[property]((formData as any)[property], formData);

      if (!isValid) {
        hasErrors = true;
      }

      errors[property] = !isValid;
      // console.info(property, (formData as any)[property], !isValid);
    });

    setFormErrors(errors);

    return !hasErrors;
  }, [formData, validateFormData]);

  React.useEffect(() => {
    setIsFormValid(validate());
  }, [formData]);

  const onFormSubmit = (evt: React.SyntheticEvent) => {
    if (evt) {
      evt.preventDefault();
    }

    onSubmit({
      formData,
      formErrors,
      isFormDirty,
      isFormValid,
    });
  };

  const updateFormData = (name: string, value: any) => {
    setFormIsDirty(true);

    // @see https://github.com/microsoft/TypeScript/issues/13557
    const nextFormData: T = {
      ...(formData as any),
      [name]: value,
    };

    setFormData(nextFormData);

    if (onChange) {
      onChange(nextFormData);
    }
  };

  return {
    formData,
    formErrors,
    isFormDirty,
    isFormValid,
    onFormSubmit,
    updateFormData,
  };
}
