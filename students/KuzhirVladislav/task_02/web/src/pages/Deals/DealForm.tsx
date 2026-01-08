import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Deal, Stage, Client } from "../../types/models";
import dealsApi from "../../api/deals";
import stagesApi from "../../api/stages";
import clientsApi from "../../api/clients";
import CustomSelect from "../../components/UI/CustomSelect";

export default function DealForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<Partial<Deal>>({
    title: "",
    amount: 0,
    stageId: 0,
    clientId: 0,
    description: "",
  });

  useEffect(() => {
    Promise.all([stagesApi.list(), clientsApi.list()]).then(([stagesData, clientsData]) => {
      setStages(stagesData.sort((a, b) => (a.stageOrder || 0) - (b.stageOrder || 0)));
      setClients(clientsData);
    });

    if (id) {
      dealsApi
        .get(id)
        .then((data) => {
          setForm(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load deal:", err);
          setLoading(false);
        });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.title.trim()) {
      alert("Укажите название сделки");
      return;
    }
    if (!form.stageId) {
      alert("Укажите этап");
      return;
    }
    setSubmitting(true);
    try {
      const payload: Partial<Deal> = {
        title: form.title.trim(),
        amount: form.amount && form.amount > 0 ? form.amount : undefined,
        stageId: Number(form.stageId),
        clientId: form.clientId ? Number(form.clientId) : undefined,
        description: form.description ? form.description.trim() : undefined,
      };

      if (id) {
        await dealsApi.update(id, payload);
        alert("Сделка обновлена успешно");
      } else {
        await dealsApi.create(payload);
        alert("Сделка создана успешно");
      }
      navigate("/deals");
    } catch (err: any) {
      console.error("Failed to save deal:", err);
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
      <h1>{id ? "Редактирование сделки" : "Новая сделка"}</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: "500px" }}>
        <div className="field">
          <label className="label">Название *</label>
          <input
            type="text"
            className="input"
            value={form.title || ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Название сделки"
            required
          />
        </div>

        <div className="field">
          <label className="label">Этап *</label>
          <CustomSelect
            value={form.stageId?.toString() || ""}
            onChange={(e) => setForm({ ...form, stageId: e ? Number(e) : undefined })}
            options={stages.map((s) => ({ value: s.id.toString(), label: s.name }))}
            placeholder="Выберите этап"
            required
          />
        </div>

        <div className="field">
          <label className="label">Клиент</label>
          <CustomSelect
            value={form.clientId?.toString() || ""}
            onChange={(e) => setForm({ ...form, clientId: e ? Number(e) : undefined })}
            options={[
              { value: "", label: "Выберите клиента" },
              ...clients.map((c) => ({ value: c.id.toString(), label: c.name })),
            ]}
          />
        </div>

        <div className="field">
          <label className="label">Сумма ($)</label>
          <input
            type="number"
            className="input"
            min="0"
            value={form.amount !== undefined ? form.amount.toString() : ""}
            onChange={(e) => {
              const val = e.target.value;
              setForm({
                ...form,
                amount: val ? Math.floor(Number(val)) : undefined,
              });
            }}
            placeholder="0"
          />{" "}
        </div>

        <div className="field">
          <label className="label">Описание</label>
          <textarea
            className="input"
            value={form.description || ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Описание сделки"
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Сохранение..." : id ? "Обновить" : "Создать"}
          </button>
          <button type="button" className="button secondary" onClick={() => navigate("/deals")}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
