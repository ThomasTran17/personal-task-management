import { useState, useCallback } from 'react';

export interface ValidationErrors {
  [key: string]: string | undefined;
}

interface ValidationRules {
  [key: string]: (value: string | undefined) => string | undefined;
}

const VALIDATION_RULES: ValidationRules = {
  title: (value) => {
    if (!value || !value.trim()) {
      return 'Task title is required';
    }
    if (value.trim().length < 3) {
      return 'Task title must be at least 3 characters';
    }
    if (value.trim().length > 100) {
      return 'Task title must be less than 100 characters';
    }
    return undefined;
  },
  description: (value) => {
    if (value && value.length > 500) {
      return 'Description must be less than 500 characters';
    }
    return undefined;
  },
};

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback(
    (fieldName: string, value: string | undefined): boolean => {
      const rule = VALIDATION_RULES[fieldName];
      if (!rule) return true;

      const error = rule(value);
      setErrors((prev) => ({
        ...prev,
        [fieldName]: error,
      }));

      return !error;
    },
    []
  );

  const validateForm = useCallback(
    (formData: Record<string, string | undefined>): boolean => {
      const newErrors: ValidationErrors = {};
      let isValid = true;

      Object.entries(formData).forEach(([fieldName, value]) => {
        const rule = VALIDATION_RULES[fieldName];
        if (rule) {
          const error = rule(value);
          if (error) {
            newErrors[fieldName] = error;
            isValid = false;
          }
        }
      });

      setErrors(newErrors);
      return isValid;
    },
    []
  );

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const getError = useCallback(
    (fieldName: string): string | undefined => {
      return errors[fieldName];
    },
    [errors]
  );

  return {
    errors,
    validateField,
    validateForm,
    clearErrors,
    getError,
  };
}
