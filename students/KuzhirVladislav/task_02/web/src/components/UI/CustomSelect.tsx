import React, { useState, useRef, useEffect } from "react";
import { IconChevronDown, IconCheck } from "../Icons";
import "../../styles/select.css";

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  required?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Выберите...",
  required = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));

  const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div className="custom-select" ref={containerRef}>
      <button
        type="button"
        className="select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-required={required}
      >
        <span>{selectedLabel}</span>
        <IconChevronDown />
      </button>

      {isOpen && (
        <div className="select-dropdown">
          <input
            ref={inputRef}
            type="text"
            className="select-search"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="select-options">
            {filtered.length === 0 ? (
              <div className="select-no-options">Нет опций</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`select-option ${value === opt.value ? "active" : ""}`}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  {value === opt.value && <IconCheck />}
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
