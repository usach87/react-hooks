import * as React from 'react';

/**
 * Переход состояний поля формы: 'untouched' -> 'touched' -> 'dirty'.
 * Если поле 'dirty', значит оно уже было 'touched'.
 */
export type TFieldStateV4 = 'untouched' | 'touched' | 'dirty';

export type TFormFieldStateV4<T, K extends keyof T> = Partial<{ [P in K]: TFieldStateV4 }>;

export type TValidationResultV4 = {
  isValid: boolean;
  errorText?: string;
};

export type TFormErrorsValidationResultV4 = TValidationResultV4 & { isPending: boolean };

export type TFormErrorsValueV4<T, K extends keyof T> = { [P in K]: TFormErrorsValidationResultV4 };

export interface IUseFormV4API<T, K extends keyof T> {
  formData: T;
  formErrors: TFormErrorsValueV4<T, K>;
  isFormDirty: boolean;
  isFormPendingValidation: boolean;
  isFormValid: boolean;
  isFormFieldDirty(property: K): boolean;
  isFormFieldTouched(property: K): boolean;
  onFormSubmit(evt: React.SyntheticEvent): void;
  onFieldBlur(property: K): void;
  runFieldValidation(property: K): void;
  updateFormData(property: K, value: T[K]): void;
}

export interface IUseFormV4State<T, K extends keyof T> {
  formData: T;
  formErrors: TFormErrorsValueV4<T, K>;
  formFieldsState: TFormFieldStateV4<T, K>;
  isFormDirty: boolean;
  isFormPendingValidation: boolean;
  isFormValid: boolean;
}

export type TPropertyValidatorV4<T, K extends keyof T> =
  (value: T[K], formData: T) => TValidationResultV4 | Promise<TValidationResultV4>;

export interface IUseFormV4Props<T, K extends keyof T> {
  initialFormData: T;
  validateFormData?: { [P in K]: TPropertyValidatorV4<T, K> };
  onSubmit(formState: IUseFormV4State<T, K>): void;
  onChange?(formData: T): void;
}

/**
  Версия V4
  Источник: `cross-link`
 */
export function useFormV4<T, K extends keyof T>(props: IUseFormV4Props<T, K>): IUseFormV4API<T, K> {
  const {
    initialFormData, validateFormData, onSubmit, onChange,
  } = props;

  const [formData, setFormData] = React.useState<T>(initialFormData);
  const [lastUpdatedField, setLastUpdatedField] = React.useState<K | null>(null);

  const [formErrors, setFormErrors] = React.useState<TFormErrorsValueV4<T, K>>(() => Object.keys(initialFormData).reduce(
    (acc, keyName) => {
      acc[keyName as K] = { isPending: false, isValid: true };

      return acc;
    },
    {} as TFormErrorsValueV4<T, K>,
  ));

  const [formFieldsState, setFormFieldsState] = React.useState<TFormFieldStateV4<T, K>>({});
  const [isFormDirty, setIsFormDirty] = React.useState(false);

  const isFormValid = React.useMemo(() => (
    Object.values<TFormErrorsValidationResultV4>(formErrors).every((validationResult) => validationResult.isValid)
  ), [formErrors]);

  const isFormPendingValidation = React.useMemo(() => (
    Object.values<TFormErrorsValidationResultV4>(formErrors).some((validationResult) => validationResult.isPending)
  ), [formErrors]);

  const validateField = React.useCallback(async (property: K) => {
    const formFieldValidator = validateFormData && validateFormData[property];

    if (!formFieldValidator) {
      setFormErrors((prev) => ({
        ...prev,
        [property]: { errorText: '', isPending: false, isValid: true },
      }));

      return;
    }

    const runValidatorAsync = async () => {
      const { isValid, errorText } = await formFieldValidator(formData[property], formData);

      setFormErrors((prev) => ({
        ...prev,
        [property]: { errorText, isPending: false, isValid },
      }));
    };

    runValidatorAsync();

    setFormErrors((prev) => ({
      ...prev,
      [property]: { isPending: true },
    }));
  }, [formData, validateFormData]);

  const validate = React.useCallback(async () => {
    (Object.keys(formData) as Array<K>).forEach((property) => {
      if (lastUpdatedField && lastUpdatedField !== property) {
        return;
      }

      validateField(property);
    });
  }, [lastUpdatedField, formData, validateField]);

  React.useEffect(() => {
    validate();
  }, [validate]);

  const isFormFieldDirty = (name: K) => {
    const fieldState = formFieldsState[name];

    if (!fieldState) {
      return false;
    }

    return fieldState === 'dirty';
  };

  const isFormFieldTouched = (name: K) => {
    const fieldState = formFieldsState[name];

    if (!fieldState) {
      return false;
    }

    return fieldState === 'touched' || fieldState === 'dirty';
  };

  const changeFormFieldState = (name: K, state: TFieldStateV4) => {
    const fieldState = formFieldsState[name];

    switch (state) {
      case 'touched':
        if (fieldState === 'touched' || fieldState === 'dirty') {
          return;
        }

        break;

      case 'dirty':
        if (fieldState === 'dirty') {
          return;
        }

        break;

      case 'untouched':
      default:
        break;
    }

    const newFormFieldsState = { ...formFieldsState };

    newFormFieldsState[name] = state;

    setFormFieldsState(newFormFieldsState);
  };

  const onFieldBlur = (name: K) => {
    changeFormFieldState(name, 'touched');
  };

  const onFormSubmit = (evt: React.SyntheticEvent) => {
    if (evt) {
      evt.preventDefault();
    }

    setIsFormDirty(true);

    onSubmit({
      formData,
      formErrors,
      formFieldsState,
      isFormDirty,
      isFormPendingValidation,
      isFormValid,
    });
  };

  const updateFormData = (name: K, value: T[K]) => {
    changeFormFieldState(name, 'dirty');

    const nextFormData: T = {
      ...formData,
      [name]: value,
    };

    setFormData(nextFormData);
    setLastUpdatedField(name);

    if (onChange) {
      onChange(nextFormData);
    }
  };

  return {
    formData,
    formErrors,
    isFormDirty,
    isFormFieldDirty,
    isFormFieldTouched,
    isFormPendingValidation,
    isFormValid,
    onFieldBlur,
    onFormSubmit,
    runFieldValidation: validateField,
    updateFormData,
  };
}
