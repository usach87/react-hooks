import * as React from 'react';

export type TAnyDict = { [key: string]: any };

export interface IUseFormV1API<T> {
  formData: T;
  formErrors: TAnyDict;
  formTouched: TAnyDict;
  isFormDirty: boolean;
  isFormValid: boolean;
  onFormSubmit(evt: React.SyntheticEvent): void;
  updateFormData(property: string, value: any): void;
  updateFormDataBulk(data: any): void;
}

export interface IUseFormV1State<T> {
  formData: T;
  formErrors: TAnyDict;
  formTouched: TAnyDict;
  isFormDirty: boolean;
  isFormValid: boolean;
}

export type TPropertyValidator = (value: any, formData: any) => string;

export interface IUseFormV1Props<T> {
  initialFormData: Partial<T>;
  validateFormData: { [key: string]: TPropertyValidator };
  onSubmitFail?(formState: IUseFormV1State<T>, submitError: any): void;
  onChange?(formData: T): void;
  onSubmit(formState: IUseFormV1State<T>): Promise<void>;
}

const defaultPropertyValidator: TPropertyValidator = () => '';

/**
  Версия V1
  Источник: `А360`
 */
export function useFormV1<T>(props: IUseFormV1Props<T>): IUseFormV1API<T> {
  const {
    initialFormData = {}, validateFormData = {}, onSubmit, onChange, onSubmitFail,
  } = props;

  const [formData, setFormData] = React.useState<T>(initialFormData as T);
  const [formTouched, setFormTouched] = React.useState<TAnyDict>({});
  const [formErrors, setFormErrors] = React.useState<TAnyDict>({});
  const [isFormValid, setIsFormValid] = React.useState(Object.keys(validateFormData).length === 0);
  const [isFormDirty, setIsFormDirty] = React.useState(false);

  const validateProperty = React.useCallback((property: string, value: any, data = formData) => {
    if (property) {
      const validator = validateFormData[property] || defaultPropertyValidator;
      const validatorResultMessage = validator(value, data);

      if (validatorResultMessage) {
        formErrors[property] = validatorResultMessage;
      } else {
        delete formErrors[property];
      }

      setFormErrors({
        ...formErrors,
      });
    }
  }, [formErrors]);

  const validateAll = (data = formData) => {
    const validators = Object.keys(validateFormData);

    if (validators && validators.length) {
      validators.forEach((key: string) => {
        validateProperty(key, (data as TAnyDict)[key]);
      });
    }
  };

  const onFormSubmit = React.useCallback(async (evt: React.SyntheticEvent) => {
    if (evt) {
      evt.preventDefault();
    }

    validateAll();

    try {
      await onSubmit({
        formData,
        formErrors,
        formTouched,
        isFormDirty,
        isFormValid,
      });
    } catch (err) {
      if (onSubmitFail) {
        onSubmitFail({
          formData,
          formErrors,
          formTouched,
          isFormDirty,
          isFormValid,
        }, err);
      }
    }
  }, [formData, formErrors, formTouched, isFormDirty, isFormValid]);

  const updateFormData = (name: string, value: any) => {
    setIsFormDirty(true);

    formTouched[name] = true;
    setFormTouched({
      ...formTouched,
    });
    validateProperty(name, value);

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

  React.useEffect(() => {
    setIsFormValid(Object.keys(formErrors).length === 0);
  }, [formErrors]);

  React.useEffect(() => {
    setIsFormDirty(Object.keys(formTouched).length !== 0);
  }, [formTouched]);

  React.useEffect(() => {
    if (!isFormValid) {
      validateAll();
    }
  }, []);

  const updateFormDataBulk = (data: any) => {
    const nextFormData = {
      ...formData,
      ...data,
    };

    setFormData(nextFormData);
    validateAll(nextFormData);
  };

  return {
    formData,
    formErrors,
    formTouched,
    isFormDirty,
    isFormValid,
    onFormSubmit,
    updateFormData,
    updateFormDataBulk,
  };
}
