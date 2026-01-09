import React, { forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || props.name;
    
    return (
      <div className={clsx('form-field', error && 'form-field-error', className)}>
        {label && (
          <label htmlFor={inputId} className="form-field-label">
            {label}
            {props.required && <span className="form-field-required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className="form-field-input"
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="form-field-error-message" data-testid="error-message">
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

Input.displayName = 'Input';
