import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Invoice, Client } from "../../types/models";
import invoicesApi from "../../api/invoices";
import clientsApi from "../../api/clients";
import CustomSelect from "../../components/UI/CustomSelect";

export default function InvoiceForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState<Partial<Invoice>>({
    number: "",
    amount: 0,
    clientId: undefined,
    status: "draft",
  });

  useEffect(() => {
    clientsApi.list().then((data) => {
      setClients(data);
    });

    if (id) {
      invoicesApi
        .get(id)
        .then((data) => {
          setForm(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load invoice:", err);
          setLoading(false);
        });
    } else {
      // Генерируем номер счета автоматически
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000);
      const generatedNumber = `INV-${timestamp.toString().slice(-6)}-${random}`;
      setForm((prev) => ({ ...prev, number: generatedNumber }));
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || form.amount <= 0) {
      alert("Укажите сумму больше нуля");
      return;
    }
    setSubmitting(true);
    try {
      if (id) {
        await invoicesApi.update(id, form);
        alert("Счет обновлен успешно");
      } else {
        await invoicesApi.create(form);
        alert("Счет создан успешно");
      }
      navigate("/invoices");
    } catch (err: any) {
      console.error("Failed to save invoice:", err);
      alert("Ошибка при сохранении: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="card">Загрузка...</div>;
  }

  return (
    <div>
      <h1>{id ? "Редактирование счета" : "Новый счет"}</h1>
      <form onSubmit={handleSubmit} className="card" style={{ maxWidth: "500px" }}>
        <div className="field">
          <label className="label">Номер счета</label>
          <input
            type="text"
            className="input"
            value={form.number || ""}
            readOnly
            style={{ backgroundColor: "rgba(255,255,255,0.02)", cursor: "default" }}
          />
          <small style={{ color: "var(--muted)", marginTop: "4px", display: "block" }}>
            Генерируется автоматически
          </small>
        </div>

        <div className="field">
          <label className="label">Клиент</label>
          <CustomSelect
            value={String(form.clientId) || ""}
            onChange={(e) => setForm({ ...form, clientId: Number(e) || undefined })}
            options={[
              { value: "", label: "Выберите клиента" },
              ...clients.map((c) => ({ value: String(c.id), label: c.name })),
            ]}
          />
        </div>

        <div className="field">
          <label className="label">Сумма ($) *</label>
          <input
            type="number"
            className="input"
            min="0"
            value={form.amount || ""}
            onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="field">
          <label className="label">Статус</label>
          <CustomSelect
            value={form.status || "draft"}
            onChange={(e) => setForm({ ...form, status: e as "draft" | "sent" | "paid" })}
            options={[
              { value: "draft", label: "Черновик" },
              { value: "sent", label: "Отправлен" },
              { value: "paid", label: "Оплачен" },
            ]}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button type="submit" className="button" disabled={submitting}>
            {submitting ? "Сохранение..." : id ? "Обновить" : "Создать"}
          </button>
          <button type="button" className="button secondary" onClick={() => navigate("/invoices")}>
            Отмена
          </button>
        </div>
      </form>
    </div>
  );
}
