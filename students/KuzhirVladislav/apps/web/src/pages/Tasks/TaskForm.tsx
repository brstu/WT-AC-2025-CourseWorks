import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Task, Deal } from "../../types/models";
import tasksApi from "../../api/tasks";
import dealsApi from "../../api/deals";
import CustomSelect from "../../components/UI/CustomSelect";
import CustomDatePicker from "../../components/UI/CustomDatePicker";

export default function TaskForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    completed: false,
    dueDate: "",
    dealId: null as number | null,
  });

  useEffect(() => {
    setLoading(true);
    dealsApi
      .list()
      .then((data) => setDeals(data))
      .catch((err) => console.error("Failed to load deals:", err))
      .finally(() => {
        if (!id) setLoading(false);
      });

    if (id) {
      tasksApi
        .get(String(Number(id)))
        .then((data: Task) => {
          setForm({
            title: data.title || "",
            description: data.description || "",
            completed: data.completed || false,
            dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
            dealId: data.dealId || null,
          });
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load task:", err);
          alert("Ошибка загрузки задачи");
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      alert("Укажите название задачи");
      return;
    }
    if (!form.dueDate) {
      alert("Укажите дедлайн");
      return;
    }

    setSubmitting(true);
    try {
      const dueDateISO = new Date(form.dueDate + "T12:00:00").toISOString();

      const payload = {
        title: form.title.trim(),
        description: form.description?.trim() || null,
        dueDate: dueDateISO,
        completed: form.completed,
        dealId: form.dealId ? Number(form.dealId) : null,
        userId: null,
      };

      if (id) {
        await tasksApi.update(String(Number(id)), payload as any);
        alert("Задача обновлена успешно");
      } else {
        await tasksApi.create(payload as any);
        alert("Задача создана успешно");
      }
      navigate("/tasks");
    } catch (err: any) {
      console.error("Error saving task:", err);
      const message = err.response?.data?.message || err.message || "Ошибка при сохранении";
      alert("Ошибка: " + message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card">Загрузка...</div>;
  }

  return (
    <div>
      <h1>{id ? "Редактирование задачи" : "Новая задача"}</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: "500px" }}>
        <div className="field">
          <label className="label">Название *</label>
          <input
            type="text"
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Название задачи"
            required
          />
        </div>

        <div className="field">
          <label className="label">Описание</label>
          <textarea
            className="input"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Описание задачи"
          />
        </div>

        <div className="field">
          <label className="label">Дедлайн *</label>
          <CustomDatePicker
            value={form.dueDate}
            onChange={(v) => setForm({ ...form, dueDate: v })}
            required
          />
        </div>

        <div className="field">
          <label className="label">Статус</label>
          <CustomSelect
            value={form.completed ? "true" : "false"}
            onChange={(v) => setForm({ ...form, completed: v === "true" })}
            options={[
              { value: "false", label: "Не выполнено" },
              { value: "true", label: "Выполнено" },
            ]}
          />
        </div>

        <div className="field">
          <label className="label">Связанная сделка</label>
          <CustomSelect
            value={form.dealId?.toString() || ""}
            onChange={(v) => setForm({ ...form, dealId: v ? Number(v) : null })}
            options={[
              { value: "", label: "Выберите сделку" },
              ...deals.map((d) => ({ value: d.id.toString(), label: d.title })),
            ]}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Сохранение..." : id ? "Обновить" : "Создать"}
          </button>
          <button type="button" className="button secondary" onClick={() => navigate("/tasks")}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
