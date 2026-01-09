import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, hint, options, placeholder, className, id, ...props }, ref) => {
    const selectId = id || props.name;
    
    return (
      <div className={clsx('form-field', error && 'form-field-error', className)}>
        {label && (
          <label htmlFor={selectId} className="form-field-label">
            {label}
            {props.required && <span className="form-field-required">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className="form-field-select"
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : undefined}
          {...props}
        >
          {placeholder && (
            <option value="">{placeholder}</option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <span id={`${selectId}-error`} className="form-field-error-message" data-testid="error-message">
            {error}
          </span>
        )}
        {hint && !error && (
          <span className="form-field-hint">{hint}</span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
