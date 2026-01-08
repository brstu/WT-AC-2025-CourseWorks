import React, { useState, useRef, useEffect } from "react";
import { IconCalendar, IconChevronDown } from "../Icons";
import "../../styles/datepicker.css";

interface CustomDatePickerProps {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function CustomDatePicker({
  value,
  onChange,
  required = false,
}: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() =>
    value ? new Date(value + "T00:00:00") : new Date()
  );

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    let day = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentMonth);

  const days = [];
  for (let i = 0; i < firstDayIndex; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const handleSelectDate = (day: number) => {
    // Создаем дату локально, чтобы избежать проблем с часовыми поясами
    const selectedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const date = String(selectedDate.getDate()).padStart(2, "0");

    onChange(`${year}-${month}-${date}`);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const isSelected = (day: number | null) => {
    if (!day || !value) return false;
    const d = new Date(value + "T00:00:00");
    return (
      day === d.getDate() &&
      currentMonth.getMonth() === d.getMonth() &&
      currentMonth.getFullYear() === d.getFullYear()
    );
  };

  const displayValue = value
    ? new Date(value + "T00:00:00").toLocaleDateString("ru-RU")
    : "Выберите дату";

  const monthYear = currentMonth.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });

  return (
    <div className="custom-datepicker" ref={containerRef}>
      <button
        type="button"
        className={`datepicker-trigger ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <IconCalendar />
        <span className={!value ? "placeholder" : ""}>{displayValue}</span>
        <IconChevronDown />
        {/* Скрытый input для поддержки атрибута required в формах */}
        <input
          type="text"
          value={value}
          required={required}
          style={{ opacity: 0, position: "absolute", width: 0, height: 0 }}
          readOnly
        />
      </button>

      {isOpen && (
        <div className="datepicker-popup">
          <div className="datepicker-header">
            <button type="button" className="datepicker-nav" onClick={() => changeMonth(-1)}>
              &larr;
            </button>
            <span className="datepicker-title">{monthYear}</span>
            <button type="button" className="datepicker-nav" onClick={() => changeMonth(1)}>
              &rarr;
            </button>
          </div>

          <div className="datepicker-weekdays">
            {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((day) => (
              <div key={day} className="datepicker-weekday">
                {day}
              </div>
            ))}
          </div>

          <div className="datepicker-days">
            {days.map((day, index) => (
              <button
                key={index}
                type="button"
                className={`datepicker-day ${day === null ? "empty" : ""} ${
                  isSelected(day) ? "active" : ""
                }`}
                onClick={() => day && handleSelectDate(day)}
                disabled={day === null}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
