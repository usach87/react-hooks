import * as React from 'react';

/**
 * Переход состояний поля формы: 'untouched' -> 'touched' -> 'dirty'.
 * Если поле 'dirty', значит оно уже было 'touched'.
 */
export type TFieldStateV2 = 'untouched' | 'touched' | 'dirty';

export type TFormFieldStateV2<T, K extends keyof T> = Partial<{ [P in K]: TFieldStateV2 }>;

export type TValidationResultV2 = {
  isValid: boolean;
  errorText?: string;
};

export type TFormErrorsValidationResultV2 = TValidationResultV2 & { isPending: boolean };

export type TFormErrorsValueV2<T, K extends keyof T> = { [P in K]: TFormErrorsValidationResultV2 };

export interface IUseFormV2API<T, K extends keyof T> {
  formData: T;
  formErrors: TFormErrorsValueV2<T, K>;
  isFormDirty: boolean;
  isFormPendingValidation: boolean;
  isFormValid: boolean;
  isFormFieldDirty(property: K): boolean;
  isFormFieldTouched(property: K): boolean;
  onFormSubmit(evt: React.SyntheticEvent): void;
  onFieldBlur(property: K): void;
  updateFormData(property: K, value: T[K]): void;
}

export interface IUseFormV2State<T, K extends keyof T> {
  formData: T;
  formErrors: TFormErrorsValueV2<T, K>;
  formFieldsState: TFormFieldStateV2<T, K>;
  isFormDirty: boolean;
  isFormPendingValidation: boolean;
  isFormValid: boolean;
}

export type TPropertyValidatorV2 = (value: any, formData: any) => TValidationResultV2 | Promise<TValidationResultV2>;

export interface IUseFormV2Props<T, K extends keyof T> {
  initialFormData: T;
  validateFormData?: { [key: string]: TPropertyValidatorV2 }; // TODO: Пофиксить типизацию. Заменить [key: string]
  onSubmit(formState: IUseFormV2State<T, K>): void;
  onChange?(formData: T): void;
}

/**
  Версия V2
  Источник: `БО ОП`
 */
export function useFormV2<T, K extends keyof T>(props: IUseFormV2Props<T, K>): IUseFormV2API<T, K> {
  const {
    initialFormData, validateFormData, onSubmit, onChange,
  } = props;

  const [formData, setFormData] = React.useState<T>(initialFormData);
  const [lastUpdatedField, setLastUpdatedField] = React.useState<K | null>(null);

  const [formErrors, setFormErrors] = React.useState<TFormErrorsValueV2<T, K>>(() => Object.keys(initialFormData).reduce(
    (acc, keyName) => {
      acc[keyName as K] = { isPending: false, isValid: true };

      return acc;
    },
    {} as TFormErrorsValueV2<T, K>,
  ));

  const [formFieldsState, setFormFieldsState] = React.useState<TFormFieldStateV2<T, K>>({});
  const [isFormDirty, setIsFormDirty] = React.useState(false);

  const isFormValid = React.useMemo(() => (
    Object.values<TFormErrorsValidationResultV2>(formErrors).every((validationResult) => validationResult.isValid)
  ), [formErrors]);

  const isFormPendingValidation = React.useMemo(() => (
    Object.values<TFormErrorsValidationResultV2>(formErrors).some((validationResult) => validationResult.isPending)
  ), [formErrors]);

  const validate = React.useCallback(async () => {
    const errors: TFormErrorsValueV2<T, K> = { ...formErrors };

    (Object.keys(formData) as Array<K>).forEach((property) => {
      const formFieldValidator = validateFormData && validateFormData[property as string];

      if (lastUpdatedField && lastUpdatedField !== property) {
        return;
      }

      if (!formFieldValidator) {
        errors[property] = { errorText: '', isPending: false, isValid: true };

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

      errors[property] = { ...errors[property], isPending: true };
    });

    setFormErrors(errors);
  }, [formData, validateFormData]);

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

  const changeFormFieldState = (name: K, state: TFieldStateV2) => {
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
    updateFormData,
  };
}
