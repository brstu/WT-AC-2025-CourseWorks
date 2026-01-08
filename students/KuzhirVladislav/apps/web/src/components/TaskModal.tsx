import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Task, Deal } from "../types/models";
import tasksApi from "../api/tasks";
import dealsApi from "../api/deals";
import { IconTrash, IconCheck } from "./Icons";
import CustomSelect from "./UI/CustomSelect";
import CustomDatePicker from "./UI/CustomDatePicker";
import "../styles/modal.css";

interface TaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (task: Task) => void;
}

export default function TaskModal({ task, isOpen, onClose, onSave }: TaskModalProps) {
  const [formData, setFormData] = useState<Partial<Task>>(task || {});
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(task || {});
      setIsEditing(false);
      setError(null);
      loadData();
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [isOpen, task]);

  const loadData = async () => {
    try {
      const dealsData = await dealsApi.list();
      setDeals(dealsData);
    } catch (err: any) {
      console.error("Failed to load deals:", err);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!formData.title) {
      setError("Заполните название задачи");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        dueDate: formData.dueDate?.includes("T")
          ? formData.dueDate
          : `${formData.dueDate}T12:00:00`,
        completed: !!formData.completed,
        dealId: formData.dealId ? Number(formData.dealId) : null,
        userId: formData.userId || null,
      };

      const updatedTask = await tasksApi.update(String(Number(task!.id)), payload as any);

      setIsEditing(false);
      onSave?.(updatedTask);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Вы уверены, что хотите удалить эту задачу?")) return;

    setLoading(true);
    try {
      await tasksApi.remove(String(Number(task!.id)));
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const dealName =
    deals.find((d) => Number(d.id) === Number(formData.dealId))?.title || "Не указана";
  const isCompleted = formData.completed === true;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditing ? "Редактирование задачи" : "Детали задачи"}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        <div className="modal-body">
          {isEditing ? (
            <form className="form">
              <div className="form-group">
                <label className="label">Название *</label>
                <input
                  type="text"
                  className="input"
                  value={formData.title || ""}
                  onChange={(e) => handleChange("title", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={(e) => handleChange("completed", e.target.checked)}
                    style={{ cursor: "pointer", width: "18px", height: "18px" }}
                  />
                  <span>Задача выполнена</span>
                </label>
              </div>

              <div className="form-group">
                <label className="label">Связанная сделка</label>
                <CustomSelect
                  value={formData.dealId?.toString() || ""}
                  onChange={(value) => handleChange("dealId", value ? Number(value) : null)}
                  options={[
                    { value: "", label: "Без сделки" },
                    ...deals.map((deal) => ({ value: deal.id.toString(), label: deal.title })),
                  ]}
                />
              </div>

              <div className="form-group">
                <label className="label">Срок выполнения</label>
                <CustomDatePicker
                  value={formData.dueDate ? formData.dueDate.split("T")[0] : ""}
                  onChange={(value) => handleChange("dueDate", value || null)}
                />
              </div>

              <div className="form-group">
                <label className="label">Описание</label>
                <textarea
                  className="input"
                  value={formData.description || ""}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={4}
                />
              </div>
            </form>
          ) : (
            <div className="info-grid">
              <div className="info-item">
                <label>Название</label>
                <div className="info-value">{formData.title}</div>
              </div>

              <div className="info-item">
                <label>Статус</label>
                <div className="info-value" style={{ color: isCompleted ? "#2ecc71" : "#95a5a6" }}>
                  {isCompleted ? "✅ Выполнено" : "⭕ Не выполнено"}
                </div>
              </div>

              <div className="info-item">
                <label>Связанная сделка</label>
                <div className="info-value">{dealName}</div>
              </div>

              <div className="info-item">
                <label>Срок выполнения</label>
                <div className="info-value">
                  {formData.dueDate
                    ? new Date(formData.dueDate).toLocaleDateString("ru-RU")
                    : "Не указан"}
                </div>
              </div>

              <div className="info-item full">
                <label>Описание</label>
                <div className="info-value" style={{ whiteSpace: "pre-wrap" }}>
                  {formData.description || "Не указано"}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {isEditing ? (
            <>
              <button
                className="button secondary"
                onClick={() => setIsEditing(false)}
                disabled={loading}
              >
                Отмена
              </button>
              <button className="button" onClick={handleSave} disabled={loading}>
                <IconCheck /> Сохранить
              </button>
            </>
          ) : (
            <>
              <button className="button danger" onClick={handleDelete} disabled={loading}>
                <IconTrash /> Удалить
              </button>
              <button className="button" onClick={() => setIsEditing(true)}>
                ✎ Редактировать
              </button>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
