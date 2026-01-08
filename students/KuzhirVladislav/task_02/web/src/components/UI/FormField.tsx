import React, { forwardRef } from "react";

type Props = {
  label?: string;
  name?: string;
  type?: string;
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
  error?: string | null;
  textarea?: boolean;
};

const FormField = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  (
    { label, name, type = "text", value = "", placeholder = "", onChange, error, textarea = false },
    ref
  ) => {
    if (textarea) {
      return (
        <div className="field">
          {label && (
            <label className="label" htmlFor={name}>
              {label}
            </label>
          )}
          <textarea
            id={name}
            name={name}
            ref={ref as any}
            className="input"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange && onChange((e.target as HTMLTextAreaElement).value)}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : undefined}
            rows={4}
          />
          {error && (
            <div id={`${name}-error`} style={{ color: "tomato", marginTop: 6, fontSize: 13 }}>
              {error}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="field">
        {label && (
          <label className="label" htmlFor={name}>
            {label}
          </label>
        )}
        <input
          id={name}
          name={name}
          ref={ref as any}
          type={type}
          className="input"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange && onChange((e.target as HTMLInputElement).value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
        />
        {error && (
          <div id={`${name}-error`} style={{ color: "tomato", marginTop: 6, fontSize: 13 }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

export default FormField;
